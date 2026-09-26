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
from sqlalchemy import func, select
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
from services import audio_editor

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


def _rel_time(iso: Optional[str]) -> str:
    """'6h ago' from an ISO timestamp — easier to scan than a full date."""
    if not iso:
        return ""
    try:
        when = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return ""
    secs = (datetime.now(timezone.utc) - when).total_seconds()
    if secs < 60:
        return "just now"
    for size, unit in ((3600, "m"), (86400, "h"), (float("inf"), "d")):
        if secs < size:
            step = 60 if unit == "m" else 3600 if unit == "h" else 86400
            return f"{int(secs // step)}{unit} ago"
    return ""


def _project_lines(projects: List[dict], counts: Dict[int, int]) -> str:
    """Render projects as scannable cards rather than a JSON dump.

    Returned alongside structuredContent, so the client shows this while
    the model still reads real fields for follow-up calls.
    """
    if not projects:
        return "No projects yet. Upload audio in the EigenTalk app to create one."

    out = []
    for proj in projects:
        pid = proj.get("id")
        bits = [f"id {pid}"]
        n = counts.get(pid, 0)
        if n:
            bits.append(f"{n} version{'' if n == 1 else 's'}")
        bits.append("transcript ready" if proj.get("has_transcript") else "no transcript")
        rel = _rel_time(proj.get("updated_at"))
        if rel:
            bits.append(f"updated {rel}")

        head = [proj.get("name") or "Untitled"]
        if proj.get("duration"):
            head.append(proj["duration"])
        if proj.get("status"):
            head.append(proj["status"])

        out.append(f"● {' · '.join(head)}\n   {' · '.join(bits)}")

    label = "project" if len(projects) == 1 else "projects"
    return f"{len(projects)} {label}\n\n" + "\n\n".join(out)


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
        if "transcript" not in item:
            return item
        out = {k: v for k, v in item.items() if k != "transcript"}
        out["has_transcript"] = bool(item.get("transcript"))
        return out

    dumped = _dump(value)
    if isinstance(dumped, list):
        return [strip(i) for i in dumped]
    return strip(dumped)


# --------------------------------------------------------------------------
# Projects
# --------------------------------------------------------------------------

@tool(
    "list_projects",
    "List all of the user's audio projects. The result is already formatted "
    "for the user — reproduce it verbatim and do not rebuild it as a table, "
    "a bulleted list, or a reworded summary.",
    read_only=True,
)
async def _list_projects(user, db):
    projects = _slim(await p.list_projects(user=user, db=db))
    ids = [x["id"] for x in projects if x.get("id") is not None]
    counts: Dict[int, int] = {}
    if ids:
        rows = await db.execute(
            select(AudioVersion.project_id, func.count(AudioVersion.id))
            .where(AudioVersion.project_id.in_(ids))
            .group_by(AudioVersion.project_id)
        )
        counts = {pid: n for pid, n in rows.all()}
    return {
        "_display": _project_lines(projects, counts),
        "projects": projects,
        "total": len(projects),
    }


@tool(
    "get_project",
    "Get one project: name, duration, status, audio URL and active version.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    read_only=True,
)
async def _get_project(user, db, project_id: int):
    return _slim(await p.get_project(project_id=project_id, user=user, db=db))


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
    return _dump(await p.create_project(payload=payload, user=user, db=db))


@tool(
    "delete_project",
    "Permanently delete a project and all its versions. Cannot be undone.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    destructive=True,
)
async def _delete_project(user, db, project_id: int):
    await p.delete_project(project_id=project_id, user=user, db=db)
    return {"deleted": project_id}


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
    return _slim(await p.transcribe_project(project_id=project_id, user=user, db=db))


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
    return _dump(await p.detect_fillers(project_id=project_id, user=user, db=db))


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
    payload = ApplyEditsRequest(edits=[{"type": "delete", "words": words}])
    version = await p.apply_edits(project_id=project_id, payload=payload, user=user, db=db)
    return {"removed": len(words), "version": _slim(version)}


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
    return _slim(await p.apply_edits(project_id=project_id, payload=payload, user=user, db=db))


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
    return _slim(await p.apply_edits(project_id=project_id, payload=payload, user=user, db=db))


@tool(
    "remove_noise",
    "Strip background noise with ElevenLabs Voice Isolator, saving a new version.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
    media=True,
)
async def _remove_noise(user, db, project_id: int):
    return _slim(await p.denoise_project(project_id=project_id, user=user, db=db))


@tool(
    "clone_voice",
    "Clone the speaker's voice from the project audio, so replaced words sound like them.",
    _obj({"project_id": PROJECT_ID}, ["project_id"]),
)
async def _clone_voice(user, db, project_id: int):
    return _slim(await p.clone_project_voice(project_id=project_id, user=user, db=db))


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
    return _slim(await p.list_versions(project_id=project_id, user=user, db=db))


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
    return _slim(await p.activate_version(
        project_id=project_id, version_id=version_id, user=user, db=db
    ))


@tool(
    "export_audio",
    "Render a version to mp3, wav or m4a and return a download URL.",
    _obj({
        "project_id": PROJECT_ID,
        "format": {"type": "string", "enum": ["mp3", "wav", "m4a"], "description": "Default mp3"},
        "version_id": {"type": "integer", "description": "Defaults to the active version"},
        "filename": {"type": "string", "description": "Without extension"},
    }, ["project_id"]),
    read_only=True,
)
async def _export(user, db, project_id: int, format: str = "mp3",
                  version_id: Optional[int] = None, filename: Optional[str] = None):
    payload = ExportRequest(format=format, version_id=version_id, filename=filename)
    return _dump(await p.export_project(project_id=project_id, payload=payload, user=user, db=db))


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
    return _dump(await p.list_threads(project_id=project_id, user=user, db=db))


@tool(
    "create_chat_thread",
    "Start a new saved conversation inside a project.",
    _obj({"project_id": PROJECT_ID, "title": {"type": "string"}}, ["project_id"]),
)
async def _create_thread(user, db, project_id: int, title: Optional[str] = None):
    payload = ChatThreadCreate(title=title)
    return _dump(await p.create_thread(project_id=project_id, payload=payload, user=user, db=db))


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
    return _dump(await p.rename_thread(
        project_id=project_id, thread_id=thread_id, payload=payload, user=user, db=db
    ))


@tool(
    "delete_chat_thread",
    "Delete a saved conversation and its messages.",
    _obj({"project_id": PROJECT_ID, "thread_id": {"type": "integer"}},
         ["project_id", "thread_id"]),
    destructive=True,
)
async def _delete_thread(user, db, project_id: int, thread_id: int):
    await p.delete_thread(project_id=project_id, thread_id=thread_id, user=user, db=db)
    return {"deleted_thread": thread_id}


@tool(
    "get_chat_thread_messages",
    "Read the messages in a saved conversation.",
    _obj({"project_id": PROJECT_ID, "thread_id": {"type": "integer"}},
         ["project_id", "thread_id"]),
    read_only=True,
)
async def _thread_messages(user, db, project_id: int, thread_id: int):
    return _dump(await p.list_thread_messages(
        project_id=project_id, thread_id=thread_id, user=user, db=db
    ))


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

        # A handler can supply its own display text; the structured data still
        # goes back untouched so the model can act on real fields.
        display = None
        if isinstance(value, dict) and "_display" in value:
            value = dict(value)
            display = value.pop("_display")

        content: List[Dict[str, Any]] = [{
            "type": "text",
            "text": display if display else json.dumps(value, indent=2, default=str),
        }]
        if name in _MEDIA_TOOLS:
            url = _audio_url_of(value)
            if url:
                content.extend(await _media_blocks(url))

        result: Dict[str, Any] = {"content": content}
        # Clients that see structuredContent may render it instead of the text
        # block, so a tool that formats its own output sends text only.
        if display is None:
            result["structuredContent"] = (
                value if isinstance(value, dict) else {"result": value}
            )
        return result
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
