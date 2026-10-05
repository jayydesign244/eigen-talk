"""MCP (Model Context Protocol) server for EigenTalk.

Exposes every app feature as a tool so users can drive the editor from
Claude, Codex or any other MCP client by pasting one URL.

The protocol is implemented directly rather than via the official SDK: the
SDK requires Python >= 3.10 and the local venv is 3.9, and we need bespoke
OAuth anyway (Clerk has no Dynamic Client Registration). MCP over HTTP is
JSON-RPC 2.0 with a small method set, so this stays small.

Tools call the FastAPI route functions directly. Their `Depends(...)` are
plain defaults, so passing `user=` and `db=` explicitly runs them normally
and we inherit all the existing ownership and validation logic.
"""
import base64
import inspect
import json
import os
import tempfile
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from oauth_server import public_base_url, resolve_oauth_token
from models.db import AudioVersion
from models.schemas import (
    ApplyEditsRequest,
    ChatThreadCreate,
    ChatThreadUpdate,
    ExportRequest,
    ProjectCreate,
)
from routers import projects as p
from services import audio_editor, fillers as fillers_service, voice as voice_service

PROTOCOL_VERSION = "2025-06-18"
SERVER_INFO = {"name": "eigentalk", "title": "EigenTalk", "version": "1.0.0"}

router = APIRouter(tags=["mcp"])


# --------------------------------------------------------------------------
# Tool registry
# --------------------------------------------------------------------------

Handler = Callable[..., Awaitable[Any]]
_TOOLS: List[Dict[str, Any]] = []
_HANDLERS: Dict[str, Handler] = {}
_MEDIA_TOOLS: set = set()


def tool(
    name: str,
    description: str,
    schema: Optional[Dict[str, Any]] = None,
    *,
    read_only: bool = False,
    destructive: bool = False,
    media: bool = False,
):
    """Register a handler as an MCP tool.

    `media=True` attaches a waveform image and a short audio preview to the
    result, so the user can see and hear the edit instead of reading JSON.
    """
    def wrap(fn: Handler) -> Handler:
        _TOOLS.append({
            "name": name,
            "description": description,
            "inputSchema": schema or {"type": "object", "properties": {}},
            "annotations": {
                "readOnlyHint": read_only,
                "destructiveHint": destructive,
            },
        })
        _HANDLERS[name] = fn
        if media:
            _MEDIA_TOOLS.add(name)
        return fn
    return wrap


def _obj(props: Dict[str, Any], required: Optional[List[str]] = None) -> Dict[str, Any]:
    return {
        "type": "object",
        "properties": props,
        "required": required or [],
        "additionalProperties": False,
    }


PROJECT_ID = {"type": "integer", "description": "Project id (see list_projects)"}

# A full render base64s to ~5MB, far past any client's limit. A waveform is
# ~3KB and a short mono preview ~80KB, so send those and link the real file.
PREVIEW_SECONDS = 15
PREVIEW_BITRATE = "32k"


async def _media_blocks(audio_url: str) -> List[Dict[str, Any]]:
    """Waveform image + short audio preview + link to the full render."""
    blocks: List[Dict[str, Any]] = [{
        "type": "resource_link",
        "uri": audio_url,
        "name": "Full audio",
        "mimeType": "audio/mpeg",
        "annotations": {"audience": ["user"]},
    }]

    ffmpeg = audio_editor._ffmpeg_exe()
    if not ffmpeg:
        return blocks

    try:
        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            resp = await client.get(audio_url)
            resp.raise_for_status()
            source = resp.content
    except Exception:
        return blocks

    with tempfile.TemporaryDirectory() as tmp:
        src = os.path.join(tmp, "in.mp3")
        with open(src, "wb") as fh:
            fh.write(source)

        wave = os.path.join(tmp, "wave.png")
        try:
            await audio_editor._run([
                ffmpeg, "-y", "-loglevel", "error", "-i", src,
                "-filter_complex", "showwavespic=s=640x120:colors=#6366f1",
                "-frames:v", "1", wave,
            ])
            with open(wave, "rb") as fh:
                blocks.append({
                    "type": "image",
                    "data": base64.b64encode(fh.read()).decode(),
                    "mimeType": "image/png",
                    "annotations": {"audience": ["user"], "priority": 0.8},
                })
        except Exception:
            pass

        preview = os.path.join(tmp, "preview.mp3")
        try:
            await audio_editor._run([
                ffmpeg, "-y", "-loglevel", "error", "-i", src,
                "-t", str(PREVIEW_SECONDS), "-ac", "1", "-b:a", PREVIEW_BITRATE,
                preview,
            ])
            with open(preview, "rb") as fh:
                blocks.append({
                    "type": "audio",
                    "data": base64.b64encode(fh.read()).decode(),
                    "mimeType": "audio/mpeg",
                    "annotations": {"audience": ["user"], "priority": 0.9},
                })
        except Exception:
            pass

    return blocks


def _mmss(seconds: Any) -> Optional[str]:
    """Seconds → '0:32'. Timestamps are what make a filler locatable."""
    if not isinstance(seconds, (int, float)):
        return None
    total = int(seconds)
    return f"{total // 60}:{total % 60:02d}"


def _dur(seconds: Any) -> Optional[str]:
    """95.97999999999999 -> '1:36'. Raw floats leak precision artifacts."""
    if not isinstance(seconds, (int, float)):
        return None
    total = round(seconds)
    return f"{total // 60}:{total % 60:02d}"


def _ago(iso: Optional[str]) -> Optional[str]:
    """ISO timestamp -> '3h ago'. Relative reads faster than a date."""
    if not iso:
        return None
    try:
        when = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return None
    secs = (datetime.now(timezone.utc) - when).total_seconds()
    if secs < 60:
        return "just now"
    if secs < 3600:
        return f"{int(secs // 60)}m ago"
    if secs < 86400:
        return f"{int(secs // 3600)}h ago"
    return f"{int(secs // 86400)}d ago"


def _tidy_version(v: dict, active_id: Optional[int] = None) -> dict:
    """One version, readable. The URL is 150 chars of noise in a list."""
    out = {
        "id": v.get("id"),
        "label": v.get("label"),
        "duration": _dur(v.get("duration")),
        "created": _ago(v.get("created_at")),
    }
    if v.get("parent_id"):
        out["built_on"] = v["parent_id"]
    if active_id is not None and v.get("id") == active_id:
        out["active"] = True
    return out


def _tidy_thread(t: dict) -> dict:
    return {
        "id": t.get("id"),
        "title": t.get("title"),
        "messages": t.get("message_count", 0),
        "updated": _ago(t.get("updated_at")),
    }


def _audio_url_of(value: Any) -> Optional[str]:
    if isinstance(value, dict):
        url = value.get("audio_url") or value.get("download_url")
        if isinstance(url, str):
            return url
        nested = value.get("version")
        if isinstance(nested, dict):
            return nested.get("audio_url")
    return None


def _dump(value: Any) -> Any:
    """Pydantic models / lists / scalars → JSON-safe structures."""
    if hasattr(value, "model_dump"):
        return json.loads(value.model_dump_json())
    if isinstance(value, list):
        return [_dump(v) for v in value]
    if isinstance(value, dict):
        return {k: _dump(v) for k, v in value.items()}
    return value


def _slim(value: Any) -> Any:
    """Drop embedded transcripts from list payloads.

    A transcript is ~20k characters. Returning one per project or per
    version blows the caller's context on redundant data — listing five
    versions came to 120k characters. Callers fetch it via get_transcript.
    """
    def strip(item: Any) -> Any:
        if not isinstance(item, dict):
            return item
        if "transcript" not in item and "timeline" not in item:
            return item
        # The video timeline is internal bookkeeping (can be hundreds of cuts).
        out = {k: v for k, v in item.items() if k not in ("transcript", "timeline")}
        if "transcript" in item:
            out["has_transcript"] = bool(item.get("transcript"))
        return out

    dumped = _dump(value)
    if isinstance(dumped, list):
        return [strip(i) for i in dumped]
    return strip(dumped)


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------

@tool("list_projects", "List all of the user's audio projects.", read_only=True)
async def _list_projects(user, db):
    return _slim(await p.list_projects(user=user, db=db))


@tool(
    "get_project",
    "Get one project: name, duration, status, audio URL and active version.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _get_project(user, db, project_id: int):
    out = _slim(await p.get_project(project_id=project_id, user=user, db=db))
    project = await p._get_owned_project(db, project_id, user)

    versions = (await db.execute(
        select(AudioVersion.id, AudioVersion.label)
        .where(AudioVersion.project_id == project_id)
        .order_by(AudioVersion.id)
    )).all()
    out["version_count"] = len(versions)

    # A bare active_version_id means nothing without its label.
    active_id = out.pop("active_version_id", None)
    label = next((lbl for vid, lbl in versions if vid == active_id), None)
    out["active_version"] = (
        {"id": active_id, "label": label} if active_id else {"id": None, "label": "Original"}
    )

    transcript = project.transcript or {}
    segments = transcript.get("segments") or []
    if segments:
        out["word_count"] = sum(len(s.get("words") or []) for s in segments)
        try:
            out["filler_count"] = len(fillers_service.find_fillers(transcript))
        except Exception:
            pass

    voice_id = out.pop("voice_id", None)
    provider = out.pop("voice_provider", None)
    if voice_id:
        out["voice"] = (
            "premade fallback voice" if provider == voice_service.FALLBACK_VOICE_PROVIDER
            else "cloned from this audio"
        )
    return out


@tool(
    "create_project",
    "Create an empty project. Audio must be added afterwards (see import_audio_from_url).",
    _obj({
        "name": {"type": "string", "description": "Project name"},
        "duration": {"type": "string", "description": "Optional display duration, e.g. '3:42'"},
    }, ["name"]),
)
async def _create_project(user, db, name: str, duration: Optional[str] = None):
    payload = ProjectCreate(name=name, duration=duration)
    proj = _dump(await p.create_project(payload=payload, user=user, db=db))
    return {
        "created": {"id": proj.get("id"), "name": proj.get("name")},
        "next": "Add audio in the EigenTalk app, then call transcribe_project.",
    }


@tool(
    "delete_project",
    "Permanently delete a project and all its versions. Cannot be undone.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    destructive=True,
)
async def _delete_project(user, db, project_id: int):
    await p.delete_project(project_id=project_id, user=user, db=db)
    return {"deleted": True, "project_id": project_id,
            "note": "The project and all its versions are gone permanently."}


@tool(
    "get_processing_status",
    "Check whether a project's audio has been uploaded and transcribed yet.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _processing_status(user, db, project_id: int):
    return _dump(await p.processing_status(project_id=project_id, user=user, db=db))


# --------------------------------------------------------------------------
# Transcript
# --------------------------------------------------------------------------

@tool(
    "transcribe_project",
    "Transcribe the project's audio with Whisper. Needed before any transcript editing.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
)
async def _transcribe(user, db, project_id: int):
    proj = _slim(await p.transcribe_project(project_id=project_id, user=user, db=db))
    full = await p._get_owned_project(db, project_id, user)
    segments = (full.transcript or {}).get("segments") or []
    return {
        "transcribed": bool(segments),
        "word_count": sum(len(sg.get("words") or []) for sg in segments),
        "duration": proj.get("duration"),
        "next": "Call get_transcript to read it, or detect_fillers to find filler words.",
    }


@tool(
    "get_transcript",
    "Get the transcript: full text plus per-word timings. Use word indexes here "
    "when calling delete_words or replace_word.",
    _obj({
        "project_id": PROJECT_ID,
        "include_words": {
            "type": "boolean",
            "description": "Include per-word timings and indexes (default true).",
        },
    }, ["project_id"]),
    read_only=True,
)
async def _get_transcript(user, db, project_id: int, include_words: bool = True):
    project = await p._get_owned_project(db, project_id, user)
    t = project.transcript
    if not t:
        return {"transcribed": False, "hint": "Call transcribe_project first."}
    out: Dict[str, Any] = {
        "transcribed": True,
        "text": t.get("text", ""),
        "duration": t.get("duration"),
        "language": t.get("language"),
    }
    if include_words:
        out["segments"] = [
            {
                "segment_idx": si,
                "start": seg.get("start"),
                "text": seg.get("text"),
                "words": [
                    {"word_idx": wi, "text": w.get("text"), "start": w.get("start")}
                    for wi, w in enumerate(seg.get("words") or [])
                ],
            }
            for si, seg in enumerate(t.get("segments") or [])
        ]
    return out


@tool(
    "detect_fillers",
    "Find filler words (um, uh, like, so) with their segment and word indexes.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _detect_fillers(user, db, project_id: int):
    found = await p.detect_fillers(project_id=project_id, user=user, db=db)
    project = await p._get_owned_project(db, project_id, user)
    segments = (project.transcript or {}).get("segments") or []

    out = []
    for ref in found.fillers:
        item = {"segment_idx": ref.segment_idx, "word_idx": ref.word_idx}
        try:
            word = segments[ref.segment_idx]["words"][ref.word_idx]
            item["text"] = (word.get("text") or "").strip()
            item["at"] = _mmss(word.get("start"))
        except (IndexError, KeyError, TypeError):
            pass
        out.append(item)

    total_words = sum(len(s.get("words") or []) for s in segments)
    return {
        "fillers": out,
        "total": found.total,
        "total_words": total_words,
        "percent": round(found.total / total_words * 100, 1) if total_words else None,
    }


# --------------------------------------------------------------------------
# Editing
# --------------------------------------------------------------------------

@tool(
    "remove_all_fillers",
    "Detect and cut every filler word, saving the result as a new version.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    media=True,
)
async def _remove_all_fillers(user, db, project_id: int):
    fillers = await p.detect_fillers(project_id=project_id, user=user, db=db)
    words = [{"segment_idx": f.segment_idx, "word_idx": f.word_idx} for f in fillers.fillers]
    if not words:
        return {"removed": 0, "message": "No filler words found."}

    # Resolve the words before editing — afterwards the indexes point at a
    # new transcript and no longer identify what was taken out.
    segments = (await p._get_owned_project(db, project_id, user)).transcript or {}
    segs = segments.get("segments") or []
    removed_text = []
    for f in fillers.fillers:
        try:
            removed_text.append(segs[f.segment_idx]["words"][f.word_idx]["text"].strip())
        except (IndexError, KeyError, TypeError):
            continue

    payload = ApplyEditsRequest(edits=[{"type": "delete", "words": words}])
    version = _slim(await p.apply_edits(project_id=project_id, payload=payload, user=user, db=db))
    return {
        "removed": len(words),
        "words": removed_text,
        "new_version": {"id": version.get("id"), "label": version.get("label")},
        "duration": _dur(version.get("duration")),
        "audio_url": version.get("audio_url"),
    }


@tool(
    "delete_words",
    "Cut specific words from the audio by index, saving a new version. "
    "Get indexes from get_transcript.",
    _obj({
        "project_id": PROJECT_ID,
        "words": {
            "type": "array",
            "description": "Words to remove.",
            "items": _obj({
                "segment_idx": {"type": "integer"},
                "word_idx": {"type": "integer"},
            }, ["segment_idx", "word_idx"]),
        },
    }, ["project_id", "words"]),
    media=True,
)
async def _delete_words(user, db, project_id: int, words: List[dict]):
    payload = ApplyEditsRequest(edits=[{"type": "delete", "words": words}])
    v = _slim(await p.apply_edits(project_id=project_id, payload=payload, user=user, db=db))
    return {
        "deleted": len(words),
        "new_version": {"id": v.get("id"), "label": v.get("label")},
        "duration": _dur(v.get("duration")),
        "audio_url": v.get("audio_url"),
    }


@tool(
    "replace_word",
    "Replace a word with new text, regenerated in the speaker's cloned voice "
    "and spliced in. Falls back to a premade voice if cloning is unavailable.",
    _obj({
        "project_id": PROJECT_ID,
        "segment_idx": {"type": "integer"},
        "word_idx": {"type": "integer"},
        "new_text": {"type": "string", "description": "Replacement word or short phrase"},
    }, ["project_id", "segment_idx", "word_idx", "new_text"]),
    media=True,
)
async def _replace_word(user, db, project_id: int, segment_idx: int, word_idx: int, new_text: str):
    payload = ApplyEditsRequest(edits=[{
        "type": "replace",
        "word": {"segment_idx": segment_idx, "word_idx": word_idx},
        "new_text": new_text,
    }])
    v = _slim(await p.apply_edits(project_id=project_id, payload=payload, user=user, db=db))
    return {
        "replaced_with": new_text,
        "new_version": {"id": v.get("id"), "label": v.get("label")},
        "duration": _dur(v.get("duration")),
        "voice": "premade fallback" if "premade" in (v.get("label") or "") else "cloned voice",
        "audio_url": v.get("audio_url"),
    }


@tool(
    "remove_noise",
    "Strip background noise with ElevenLabs Voice Isolator, saving a new version.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    media=True,
)
async def _remove_noise(user, db, project_id: int):
    v = _slim(await p.denoise_project(project_id=project_id, user=user, db=db))
    return {
        "cleaned": True,
        "new_version": {"id": v.get("id"), "label": v.get("label")},
        "duration": _dur(v.get("duration")),
        "audio_url": v.get("audio_url"),
    }


@tool(
    "clone_voice",
    "Clone the speaker's voice from the project audio, so replaced words sound like them.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
)
async def _clone_voice(user, db, project_id: int):
    proj = _slim(await p.clone_project_voice(project_id=project_id, user=user, db=db))
    premade = proj.get("voice_provider") == voice_service.FALLBACK_VOICE_PROVIDER
    return {
        "voice_ready": bool(proj.get("voice_id")),
        "voice": "premade fallback voice" if premade else "cloned from this audio",
        "note": ("Cloning was unavailable, so word replacement will use a stock voice."
                 if premade else "Replaced words will sound like the speaker."),
    }


# --------------------------------------------------------------------------
# Versions & export
# --------------------------------------------------------------------------

@tool(
    "list_versions",
    "List every saved version of the project's audio, oldest first.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _list_versions(user, db, project_id: int):
    rows = _slim(await p.list_versions(project_id=project_id, user=user, db=db))
    project = await p._get_owned_project(db, project_id, user)
    return {
        "versions": [_tidy_version(v, project.active_version_id) for v in rows],
        "total": len(rows),
    }


@tool(
    "activate_version",
    "Switch the project to a different saved version, including the original.",
    _obj({
        "project_id": PROJECT_ID,
        "version_id": {"type": "integer", "description": "Version id from list_versions"},
    }, ["project_id", "version_id"]),
    media=True,
)
async def _activate_version(user, db, project_id: int, version_id: int):
    updated = _slim(await p.activate_version(
        project_id=project_id, version_id=version_id, user=user, db=db
    ))
    label = next(
        (v.label for v in (await p.list_versions(project_id=project_id, user=user, db=db))
         if v.id == version_id), None)
    return {
        "switched_to": {"id": version_id, "label": label},
        "duration": updated.get("duration"),
        "audio_url": updated.get("audio_url"),
    }


@tool(
    "export_audio",
    "Render a version to mp3, wav or m4a and return a download URL. For video "
    "projects (media_type 'video') format 'mp4' renders the video re-cut to "
    "match the edited audio, optionally reframed for social (9:16, 1:1).",
    _obj({
        "project_id": PROJECT_ID,
        "format": {"type": "string", "enum": ["mp3", "wav", "m4a", "mp4"], "description": "Default mp3; mp4 only for video projects"},
        "version_id": {"type": "integer", "description": "Defaults to the active version"},
        "filename": {"type": "string", "description": "Without extension"},
        "aspect": {"type": "string", "enum": ["original", "16:9", "9:16", "1:1"], "description": "mp4 only. Default original"},
        "resolution": {"type": "integer", "enum": [720, 1080], "description": "mp4 only. Short side in pixels, default 1080"},
        "fit": {"type": "string", "enum": ["fill", "fit"], "description": "mp4 only. fill crops to cover the frame (default), fit letterboxes"},
    }, ["project_id"]),
    read_only=True,
)
async def _export(user, db, project_id: int, format: str = "mp3",
                  version_id: Optional[int] = None, filename: Optional[str] = None,
                  aspect: str = "original", resolution: int = 1080, fit: str = "fill"):
    payload = ExportRequest(format=format, version_id=version_id, filename=filename,
                            aspect=aspect, resolution=resolution, fit=fit)
    r = _dump(await p.export_project(project_id=project_id, payload=payload, user=user, db=db))
    size = r.get("size_bytes")
    return {
        "filename": r.get("filename"),
        "format": format,
        "size": f"{round(size / 1_048_576, 1)} MB" if isinstance(size, (int, float)) else None,
        "download_url": r.get("download_url"),
    }


# --------------------------------------------------------------------------
# Sound engine — the same registry, looks and renderer as the editor's panel
# --------------------------------------------------------------------------

_SOUND_OP = {
    "type": "object",
    "properties": {
        "op": {"type": "string", "enum": ["apply_look", "set_character", "set_effect", "remove_effect", "reset", "undo"]},
        "look": {"type": "string", "description": "Look id from list_sound_options"},
        "strength": {"type": "number", "description": "Look strength 0.25–2 (default 1)"},
        "character": {"type": "object", "description": "body, brightness, space, punch, pitch (−100..100), intensity (0..100)"},
        "effect": {"type": "string", "description": "Effect type from list_sound_options"},
        "params": {"type": "object", "description": "Effect parameters (keys and ranges from list_sound_options)"},
        "enabled": {"type": "boolean"},
        "scope": {"type": "object", "description": "Optional {start, end} in seconds"},
    },
    "required": ["op"],
}


async def _sound_state(user, db, project_id: int) -> dict:
    from routers import sound as S
    state = await S.get_sound(project_id=project_id, user=user, db=db)
    return {
        "based_on": state["base"]["label"],
        "character": state["doc"]["character"],
        "chain": state["chain"],
        "layers": [{"kind": l["kind"], "name": l["name"]} for l in state["doc"]["layers"]],
        "preview_url": state.get("preview_url"),
    }


@tool(
    "list_sound_options",
    "Everything the sound engine can do: named looks (radio voice, warmer, phone call…), "
    "character sliders, and every effect with its parameters and ranges.",
    _obj({"detail": {"type": "string", "enum": ["looks", "effects", "all"], "description": "Default all"}}),
    read_only=True,
)
async def _list_sound_options(user, db, detail: str = "all"):
    from services.sound import registry as R
    reg = R.public_registry()
    out: Dict[str, Any] = {"character_sliders": [{k: c[k] for k in ("key", "low", "high", "notes")} for c in reg["character"]]}
    if detail in ("looks", "all"):
        out["looks"] = reg["looks"]
    if detail in ("effects", "all"):
        out["effects"] = [{
            "type": e["type"], "label": e["label"], "group": e["group"], "description": e["description"],
            "params": [{k: p.get(k) for k in ("key", "label", "type", "min", "max", "default", "unit", "options") if p.get(k) is not None}
                       for p in e["params"]],
        } for e in reg["effects"]]
    return out


@tool(
    "get_sound",
    "The project's current (unsaved) sound settings: character sliders, active effect chain, layers.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _get_sound(user, db, project_id: int):
    return await _sound_state(user, db, project_id)


@tool(
    "analyze_audio",
    "Measure the recording: loudness, noise, tone balance, pitch, hum, echo, pace — plus "
    "plain-language issues, each with a suggested fix.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _analyze_audio(user, db, project_id: int):
    from routers import sound as S
    prof = await S.analyze_route(project_id=project_id, user=user, db=db)
    return {k: v for k, v in prof.items() if not k.startswith("_")}


@tool(
    "set_sound",
    "Change how the recording sounds. Operations run in order on the current settings "
    "(apply_look / set_character / set_effect / remove_effect / reset / undo). "
    "Nothing is saved until save_sound; preview_sound renders a listenable file.",
    _obj({"project_id": PROJECT_ID, "operations": {"type": "array", "items": _SOUND_OP}}, ["project_id", "operations"]),
)
async def _set_sound(user, db, project_id: int, operations: List[Dict[str, Any]]):
    from routers import sound as S
    from services.sound import ai as A
    project = await p._get_owned_project(db, project_id, user)
    d = await S._draft(db, project)
    doc, notes, _ = A.apply_sound_ops(d["doc"], operations, d.setdefault("history", []))
    doc = p._strip_length_effects(project, doc, notes)
    S._set_doc(project, d, doc)
    await db.commit()
    out = await _sound_state(user, db, project_id)
    if notes:
        out["notes"] = notes
    return out


@tool(
    "preview_sound",
    "Render the current sound settings and return a URL to listen to (not saved as a version).",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    media=True,
)
async def _preview_sound(user, db, project_id: int):
    from routers import sound as S
    r = await S.preview_sound(project_id=project_id, payload=S.DocIn(), user=user, db=db)
    return {"audio_url": r["url"], "chain": r["chain"]}


@tool(
    "save_sound",
    "Render the current sound settings at full quality and save them as a new version.",
    _obj({"project_id": PROJECT_ID, "label": {"type": "string", "description": "Optional version name"}}, ["project_id"]),
    media=True,
)
async def _save_sound(user, db, project_id: int, label: Optional[str] = None):
    from routers import sound as S
    v = _dump(await S.apply_sound(project_id=project_id, payload=S.ApplyIn(label=label), user=user, db=db))
    return {"new_version": {"id": v.get("id"), "label": v.get("label")}, "duration": _dur(v.get("duration")),
            "audio_url": v.get("audio_url")}


@tool(
    "edit_audio",
    "Transcript-driven edits saved as a new version: bleep or cut a phrase, add a pause after a "
    "phrase, or tighten every pause longer than max_gap seconds.",
    _obj({"project_id": PROJECT_ID, "operations": {"type": "array", "items": {"type": "object", "properties": {
        "op": {"type": "string", "enum": ["bleep", "cut", "pause", "tighten_pauses"]},
        "phrase": {"type": "string"}, "occurrence": {"type": "string", "enum": ["all", "first", "last"]},
        "mode": {"type": "string", "enum": ["tone", "mute"]}, "seconds": {"type": "number"}, "max_gap": {"type": "number"},
    }, "required": ["op"]}}}, ["project_id", "operations"]),
    media=True,
)
async def _edit_audio(user, db, project_id: int, operations: List[Dict[str, Any]]):
    from services.sound import ai as A
    project = await p._get_owned_project(db, project_id, user)
    edits, notes = A.edit_ops_to_edits(project.transcript, operations)
    if not edits:
        return {"edited": False, "notes": notes or ["nothing to change"]}
    v = _slim(await p.apply_edits(project_id=project_id, payload=ApplyEditsRequest(edits=edits, parent_version_id=project.active_version_id), user=user, db=db))
    return {"edited": True, "new_version": {"id": v.get("id"), "label": v.get("label")}, "duration": _dur(v.get("duration")),
            "audio_url": v.get("audio_url"), "notes": notes}


# --------------------------------------------------------------------------
# Chat threads
# --------------------------------------------------------------------------

@tool(
    "list_chat_threads",
    "List saved assistant conversations for a project.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _list_threads(user, db, project_id: int):
    rows = _dump(await p.list_threads(project_id=project_id, user=user, db=db))
    return {"threads": [_tidy_thread(t) for t in rows], "total": len(rows)}


@tool(
    "create_chat_thread",
    "Start a new saved conversation inside a project.",
    _obj({"project_id": PROJECT_ID, "title": {"type": "string"}}, ["project_id"]),
)
async def _create_thread(user, db, project_id: int, title: Optional[str] = None):
    payload = ChatThreadCreate(title=title)
    t = _dump(await p.create_thread(project_id=project_id, payload=payload, user=user, db=db))
    return {"created": _tidy_thread(t)}


@tool(
    "rename_chat_thread",
    "Rename a saved conversation.",
    _obj({
        "project_id": PROJECT_ID,
        "thread_id": {"type": "integer"},
        "title": {"type": "string"},
    }, ["project_id", "thread_id", "title"]),
)
async def _rename_thread(user, db, project_id: int, thread_id: int, title: str):
    payload = ChatThreadUpdate(title=title)
    t = _dump(await p.rename_thread(
        project_id=project_id, thread_id=thread_id, payload=payload, user=user, db=db
    ))
    return {"renamed": _tidy_thread(t)}


@tool(
    "delete_chat_thread",
    "Delete a saved conversation and its messages.",
    _obj({"project_id": PROJECT_ID, "thread_id": {"type": "integer"}},
         ["project_id", "thread_id"]),
    destructive=True,
)
async def _delete_thread(user, db, project_id: int, thread_id: int):
    await p.delete_thread(project_id=project_id, thread_id=thread_id, user=user, db=db)
    return {"deleted": True, "thread_id": thread_id}


@tool(
    "get_chat_thread_messages",
    "Read the messages in a saved conversation.",
    _obj({"project_id": PROJECT_ID, "thread_id": {"type": "integer"}},
         ["project_id", "thread_id"]),
    read_only=True,
)
async def _thread_messages(user, db, project_id: int, thread_id: int):
    rows = _dump(await p.list_thread_messages(
        project_id=project_id, thread_id=thread_id, user=user, db=db
    ))
    return {
        "messages": [
            {"role": m.get("role"), "text": m.get("content"), "sent": _ago(m.get("created_at"))}
            for m in rows
        ],
        "total": len(rows),
    }


# --------------------------------------------------------------------------
# JSON-RPC plumbing
# --------------------------------------------------------------------------

def _rpc_result(req_id: Any, result: Any) -> dict:
    return {"jsonrpc": "2.0", "id": req_id, "result": result}


def _rpc_error(req_id: Any, code: int, message: str) -> dict:
    return {"jsonrpc": "2.0", "id": req_id, "error": {"code": code, "message": message}}


async def _call_tool(name: str, args: dict, user: dict, db: AsyncSession) -> dict:
    handler = _HANDLERS.get(name)
    if handler is None:
        return {
            "content": [{"type": "text", "text": f"Unknown tool: {name}"}],
            "isError": True,
        }
    try:
        accepted = set(inspect.signature(handler).parameters)
        clean = {k: v for k, v in (args or {}).items() if k in accepted}
        value = await handler(user=user, db=db, **clean)

        content: List[Dict[str, Any]] = [
            {"type": "text", "text": json.dumps(value, indent=2, default=str)}
        ]
        if name in _MEDIA_TOOLS:
            url = _audio_url_of(value)
            if url:
                content.extend(await _media_blocks(url))

        return {
            "content": content,
            "structuredContent": value if isinstance(value, dict) else {"result": value},
        }
    except Exception as exc:
        # Surface the failure to the model rather than breaking the session,
        # so it can correct itself (wrong id, missing transcript, no credits).
        detail = getattr(exc, "detail", None) or str(exc)
        return {
            "content": [{"type": "text", "text": f"{type(exc).__name__}: {detail}"}],
            "isError": True,
        }


async def _dispatch(body: dict, user: dict, db: AsyncSession) -> Optional[dict]:
    method = body.get("method")
    req_id = body.get("id")

    if method == "initialize":
        return _rpc_result(req_id, {
            "protocolVersion": PROTOCOL_VERSION,
            "capabilities": {"tools": {"listChanged": False}},
            "serverInfo": SERVER_INFO,
            "instructions": (
                "EigenTalk edits audio through its transcript. Typical flow: "
                "list_projects → get_transcript → detect_fillers / remove_all_fillers, "
                "delete_words, replace_word or remove_noise → export_audio. "
                "Every edit saves a new version; activate_version switches between them, "
                "so edits are always reversible."
            ),
        })

    if method in ("notifications/initialized", "notifications/cancelled"):
        return None  # notifications get no response

    if method == "ping":
        return _rpc_result(req_id, {})

    if method == "tools/list":
        return _rpc_result(req_id, {"tools": _TOOLS})

    if method == "tools/call":
        params = body.get("params") or {}
        result = await _call_tool(
            params.get("name", ""), params.get("arguments") or {}, user, db
        )
        return _rpc_result(req_id, result)

    return _rpc_error(req_id, -32601, f"Method not found: {method}")


async def mcp_user(request: Request, db: AsyncSession = Depends(get_db)) -> dict:
    """Authenticate an MCP caller.

    Prefers one of our own OAuth tokens; falls back to a Clerk JWT so the
    web app and local testing keep working. A 401 carries WWW-Authenticate
    so clients can discover where to authorize (RFC 9728).
    """
    header = request.headers.get("authorization") or ""
    token = header[7:].strip() if header.lower().startswith("bearer ") else ""

    def unauthorized(detail: str) -> HTTPException:
        base = public_base_url(request)
        return HTTPException(
            status_code=401,
            detail=detail,
            headers={
                "WWW-Authenticate": (
                    'Bearer error="invalid_token", '
                    f'resource_metadata="{base}/.well-known/oauth-protected-resource"'
                )
            },
        )

    if not token:
        raise unauthorized("Missing bearer token")

    resolved = await resolve_oauth_token(token, db)
    if resolved is not None:
        return resolved

    try:
        from fastapi.security import HTTPAuthorizationCredentials
        return await get_current_user(
            HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        )
    except HTTPException:
        raise unauthorized("Invalid or expired token")


@router.post("/mcp")
async def mcp_endpoint(
    request: Request,
    user: dict = Depends(mcp_user),
    db: AsyncSession = Depends(get_db),
):
    """Streamable HTTP transport. One JSON-RPC message per request."""
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(_rpc_error(None, -32700, "Parse error"), status_code=400)

    if isinstance(body, list):  # batch
        out = []
        for item in body:
            resp = await _dispatch(item, user, db)
            if resp is not None:
                out.append(resp)
        return JSONResponse(out) if out else JSONResponse(None, status_code=202)

    resp = await _dispatch(body, user, db)
    if resp is None:
        return JSONResponse(None, status_code=202)
    return JSONResponse(resp)


@router.get("/mcp")
async def mcp_get():
    """No server-initiated streaming yet; clients fall back to POST-only."""
    return JSONResponse(
        _rpc_error(None, -32000, "SSE stream not supported; use POST"), status_code=405
    )
