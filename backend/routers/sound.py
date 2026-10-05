"""Sound panel API: registry, working draft, preview/apply, analysis, layers, presets.

The working draft lives on the project (`sound_draft`) so the editor and the
AI chat share one state — "a bit more" in chat adjusts exactly what the
sliders show. Effects are always rendered from the *dry* base version, so
re-editing never stacks processing on already-processed audio.
"""
import asyncio
import copy
import hashlib
import json
import os
import tempfile
from typing import List, Optional, Tuple

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from auth import get_current_user
from database import get_db
from models.db import AudioVersion, Project, SoundPreset
from models.schemas import AudioVersionOut
from routers.projects import _get_owned_project, _snapshot_original, _user_id
from services import audio_editor, voice as voice_service
from services.sound import analyze as analyzer, dsp, looks, registry, render as renderer
from storage import upload_audio as storage_upload

router = APIRouter(tags=["sound"])

HISTORY_LIMIT = 30
CACHE_LIMIT = 40


class DocIn(BaseModel):
    doc: Optional[dict] = None


class LookIn(BaseModel):
    look_id: str
    strength: float = 1.0


class ApplyIn(BaseModel):
    doc: Optional[dict] = None
    label: Optional[str] = None


class PresetIn(BaseModel):
    name: str
    doc: Optional[dict] = None


# ── Draft state ───────────────────────────────────────────────────────

async def _base(db: AsyncSession, project: Project) -> Tuple[Optional[AudioVersion], str, Optional[dict], Optional[list], Optional[dict]]:
    """(base version, base audio url, transcript, timeline, effects doc of the active version).

    If the active version came from the sound panel, its dry source is the
    base and its effects are the starting draft.
    """
    active = None
    if project.active_version_id:
        active = await db.get(AudioVersion, project.active_version_id)
    if active and active.effects_source_id:
        src = await db.get(AudioVersion, active.effects_source_id)
        if src:
            return src, src.audio_url, src.transcript, src.timeline, active.effects
    return active, project.audio_url, project.transcript, project.timeline, None


async def _draft(db: AsyncSession, project: Project) -> dict:
    base, base_url, _, _, applied = await _base(db, project)
    d = project.sound_draft or {}
    if d.get("base_url") != base_url:
        d = {
            "base_url": base_url,
            "base_version_id": base.id if base else None,
            "doc": registry.normalize_doc(applied) if applied else registry.empty_doc(),
            "history": [],
            "applied": bool(applied),
        }
        project.sound_draft = d
        flag_modified(project, "sound_draft")
    d["doc"] = registry.normalize_doc(d.get("doc"))
    return d


def _set_doc(project: Project, d: dict, doc: dict, *, record: bool = True) -> dict:
    doc = registry.normalize_doc(doc)
    if record and json.dumps(d.get("doc"), sort_keys=True) != json.dumps(doc, sort_keys=True):
        d["history"] = (d.get("history") or [])[-(HISTORY_LIMIT - 1):] + [d.get("doc")]
    d["doc"] = doc
    project.sound_draft = d
    flag_modified(project, "sound_draft")
    return doc


def _state(project: Project, d: dict, base: Optional[AudioVersion], applied: Optional[dict] = None) -> dict:
    doc = d["doc"]
    chain = renderer.effective_chain(doc)
    return {
        "doc": doc,
        "base": {
            "version_id": d.get("base_version_id"),
            "label": base.label if base else "Original",
            "audio_url": d.get("base_url"),
        },
        # What the active version already has — the editor's "unsaved changes" baseline.
        "applied_doc": registry.normalize_doc(applied) if applied else registry.empty_doc(),
        "can_undo": bool(d.get("history")),
        "is_empty": not chain and not doc["layers"],
        "chain": renderer.describe_chain(chain),
        "preview_url": (project.sound_cache or {}).get(f"pv:{_key(d.get('base_url'), doc)}"),
        "profile": project.sound_profile if (project.sound_profile or {}).get("_url") == d.get("base_url") else None,
    }


def _key(base_url: Optional[str], doc: dict) -> str:
    return hashlib.sha1((str(base_url) + json.dumps(doc, sort_keys=True)).encode()).hexdigest()[:20]


def _cache_put(project: Project, key: str, value) -> None:
    cache = dict(project.sound_cache or {})
    cache.pop(key, None)
    cache[key] = value
    while len(cache) > CACHE_LIMIT:
        cache.pop(next(iter(cache)))
    project.sound_cache = cache
    flag_modified(project, "sound_cache")


# ── Rendering ─────────────────────────────────────────────────────────

async def _download(client: httpx.AsyncClient, url: str, path: str) -> None:
    async with client.stream("GET", url) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            async for chunk in r.aiter_bytes(1 << 20):
                f.write(chunk)


def _words(transcript: Optional[dict]) -> List[dict]:
    out = []
    for seg in (transcript or {}).get("segments") or []:
        for w in seg.get("words") or []:
            try:
                out.append({"start": float(w["start"]), "end": float(w["end"])})
            except (KeyError, TypeError, ValueError):
                pass
    return out


def check_doc_allowed(project: Project, doc: dict) -> None:
    if project.media_type == "video":
        for e in doc["effects"]:
            if e["enabled"] and e["type"] in ("tempo", "speed") and abs(e["params"]["rate"] - 1) > 0.005:
                raise HTTPException(
                    status_code=400,
                    detail=f"{registry.EFFECTS_BY_TYPE[e['type']]['label']} changes the length, which would put the "
                           "video out of sync. It's available on audio projects.",
                )


async def render_doc(
    db: AsyncSession, project: Project, user: dict, doc: dict, *, preview: bool
) -> dict:
    """Render `doc` on the project's dry base. Returns url + details."""
    if not audio_editor.ffmpeg_available():
        raise HTTPException(status_code=503, detail="ffmpeg not installed on the server")
    base, base_url, transcript, timeline, _ = await _base(db, project)
    if not base_url:
        raise HTTPException(status_code=400, detail="Project has no audio")
    doc = registry.normalize_doc(doc)
    check_doc_allowed(project, doc)
    key = _key(base_url, doc) + ("" if preview else ":hq")
    cached = (project.sound_cache or {}).get(f"pv:{key}" if preview else f"hq:{key}")
    if cached and preview:
        return {"url": cached, "cached": True, "doc": doc}

    needs_iso = any(e["enabled"] and e["type"] == "voice_isolation" and e["params"]["strength"] > 0 for e in doc["effects"])
    uid = _user_id(user)
    with tempfile.TemporaryDirectory() as tmp:
        src_path = os.path.join(tmp, "base")
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, read=600.0)) as client:
                await _download(client, base_url, src_path)
                iso_path = None
                if needs_iso:
                    iso_key = f"iso:{hashlib.sha1(base_url.encode()).hexdigest()[:20]}"
                    iso_url = (project.sound_cache or {}).get(iso_key)
                    if not iso_url:
                        if not voice_service.is_configured():
                            raise HTTPException(status_code=503, detail="Voice isolation needs ELEVENLABS_API_KEY on the server")
                        with open(src_path, "rb") as f:
                            try:
                                cleaned = await voice_service.isolate_audio(f.read())
                            except voice_service.VoiceError as exc:
                                if exc.quota_exceeded:
                                    raise HTTPException(status_code=402, detail=f"Not enough ElevenLabs credits for voice isolation: {exc}")
                                raise HTTPException(status_code=502, detail=f"Voice isolation failed: {exc}")
                        iso_url = await storage_upload(uid, f"isolated_{project.id}.mp3", cleaned, content_type="audio/mpeg")
                        _cache_put(project, iso_key, iso_url)
                    iso_path = os.path.join(tmp, "iso")
                    await _download(client, iso_url, iso_path)
                layer_paths = {}
                for i, layer in enumerate(l for l in doc["layers"] if l["enabled"]):
                    lp = os.path.join(tmp, f"layer{i}")
                    await _download(client, layer["url"], lp)
                    layer_paths[layer["url"]] = lp
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Fetch audio: {exc}")

        words = _words(transcript)

        def work():
            x = dsp.decode(src_path)
            iso = dsp.decode(iso_path) if iso_path else None
            if iso is not None:
                iso = dsp.fit_length(iso, x.shape[1])
            layers_audio = {u: dsp.decode(p) for u, p in layer_paths.items()}
            ref = dsp.loudness(x)["lufs"]
            out = renderer.render(x, doc, words=words, isolated=iso, layers_audio=layers_audio,
                                  preview=preview, reference_lufs=ref)
            out_path = os.path.join(tmp, "out.mp3")
            dsp.encode(out["audio"], out_path, "mp3", "160k" if preview else "256k")
            with open(out_path, "rb") as f:
                data = f.read()
            return data, out, out["audio"].shape[1] / dsp.SR

        try:
            data, out, duration = await asyncio.to_thread(work)
        except (dsp.DSPError, renderer.RenderError) as exc:
            raise HTTPException(status_code=500, detail=f"Render failed: {exc}")

    url = await storage_upload(uid, f"{'preview' if preview else 'sound'}_{project.id}.mp3", data, content_type="audio/mpeg")
    if preview:
        _cache_put(project, f"pv:{_key(base_url, doc)}", url)
    return {
        "url": url,
        "cached": False,
        "doc": doc,
        "duration": round(duration, 3),
        "duration_factor": out["duration_factor"],
        "chain": renderer.describe_chain(out["chain"]),
        "base": base,
        "transcript": transcript,
        "timeline": timeline,
    }


def _scale_transcript(transcript: Optional[dict], f: float) -> Optional[dict]:
    if not transcript or abs(f - 1) < 1e-4:
        return transcript
    t = copy.deepcopy(transcript)
    for seg in t.get("segments") or []:
        seg["start"] = round(seg.get("start", 0) * f, 3)
        seg["end"] = round(seg.get("end", 0) * f, 3)
        for w in seg.get("words") or []:
            w["start"] = round(w["start"] * f, 3)
            w["end"] = round(w["end"] * f, 3)
    if t.get("duration"):
        t["duration"] = t["duration"] * f
    return t


def summarize_doc(doc: dict) -> str:
    if doc.get("look") and doc["look"] in looks.LOOKS_BY_ID:
        base = looks.LOOKS_BY_ID[doc["look"]]["label"]
    else:
        base = None
    labels = [registry.EFFECTS_BY_TYPE[e["type"]]["label"] for e in doc["effects"] if e["enabled"]]
    moved = [c["label"] for c in registry.CHARACTER if c["key"] != "intensity" and abs(doc["character"].get(c["key"], 0)) > 1]
    parts = ([base] if base else []) + moved + [l for l in labels if not base]
    if doc["layers"]:
        parts.append(f"{len(doc['layers'])} layer{'s' if len(doc['layers']) != 1 else ''}")
    text = ", ".join(dict.fromkeys(parts)) or "Sound"
    return text if len(text) <= 60 else text[:57] + "…"


async def apply_doc(db: AsyncSession, project: Project, user: dict, doc: dict, label: Optional[str] = None) -> AudioVersion:
    result = await render_doc(db, project, user, doc, preview=False)
    base = result["base"]
    f = result["duration_factor"]
    transcript = _scale_transcript(result["transcript"], f)
    timeline = result["timeline"]
    if abs(f - 1) > 1e-4 and timeline:
        timeline = [{**s, "out_start": s["out_start"] * f, "out_end": s["out_end"] * f} for s in timeline]
    original_id = await _snapshot_original(db, project)
    base_id = base.id if base else original_id
    version = AudioVersion(
        project_id=project.id,
        parent_id=base_id,
        label=(label or f"Sound: {summarize_doc(result['doc'])}")[:128],
        audio_url=result["url"],
        transcript=transcript,
        duration=result["duration"],
        timeline=timeline,
        effects=result["doc"],
        effects_source_id=base_id,
    )
    db.add(version)
    await db.flush()
    project.audio_url = result["url"]
    project.active_version_id = version.id
    project.transcript = transcript
    project.timeline = timeline
    flag_modified(project, "transcript")
    # The draft keeps pointing at the same dry base, now marked as applied.
    d = await _draft(db, project)
    d["applied"] = True
    project.sound_draft = d
    flag_modified(project, "sound_draft")
    await db.commit()
    await db.refresh(version)
    return version


async def analyze_project(db: AsyncSession, project: Project) -> dict:
    _, base_url, transcript, _, _ = await _base(db, project)
    if not base_url:
        raise HTTPException(status_code=400, detail="Project has no audio")
    cached = project.sound_profile
    if cached and cached.get("_url") == base_url:
        return cached
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "a")
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, read=600.0)) as client:
                await _download(client, base_url, path)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Fetch audio: {exc}")
        words = _words(transcript)
        profile = await asyncio.to_thread(lambda: analyzer.analyze(dsp.decode(path), words))
    profile["_url"] = base_url
    project.sound_profile = profile
    flag_modified(project, "sound_profile")
    await db.commit()
    return profile


# ── Routes ────────────────────────────────────────────────────────────

@router.get("/sound/registry")
async def get_registry(user: dict = Depends(get_current_user)):
    return registry.public_registry()


@router.get("/projects/{project_id}/sound")
async def get_sound(project_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    d = await _draft(db, project)
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)


@router.put("/projects/{project_id}/sound")
async def put_sound(project_id: int, payload: DocIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    d = await _draft(db, project)
    _set_doc(project, d, payload.doc or registry.empty_doc())
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)


@router.post("/projects/{project_id}/sound/undo")
async def undo_sound(project_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    d = await _draft(db, project)
    if d.get("history"):
        prev = d["history"].pop()
        _set_doc(project, d, prev, record=False)
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)


@router.post("/projects/{project_id}/sound/reset")
async def reset_sound(project_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    d = await _draft(db, project)
    _set_doc(project, d, registry.empty_doc())
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)


@router.post("/projects/{project_id}/sound/look")
async def apply_look_route(project_id: int, payload: LookIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    if payload.look_id not in looks.LOOKS_BY_ID:
        raise HTTPException(status_code=404, detail="Unknown look")
    d = await _draft(db, project)
    _set_doc(project, d, looks.apply_look(d["doc"], payload.look_id, payload.strength))
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)


@router.post("/projects/{project_id}/sound/preview")
async def preview_sound(project_id: int, payload: DocIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    d = await _draft(db, project)
    if payload.doc is not None:
        _set_doc(project, d, payload.doc)
    result = await render_doc(db, project, user, d["doc"], preview=True)
    await db.commit()
    return {"url": result["url"], "cached": result["cached"], "chain": renderer.describe_chain(renderer.effective_chain(d["doc"])),
            "duration": result.get("duration")}


@router.post("/projects/{project_id}/sound/apply", response_model=AudioVersionOut)
async def apply_sound(project_id: int, payload: ApplyIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    d = await _draft(db, project)
    if payload.doc is not None:
        _set_doc(project, d, payload.doc)
    if not renderer.effective_chain(d["doc"]) and not d["doc"]["layers"]:
        raise HTTPException(status_code=400, detail="No effects to apply")
    version = await apply_doc(db, project, user, d["doc"], payload.label)
    return AudioVersionOut.model_validate(version)


@router.post("/projects/{project_id}/sound/analyze")
async def analyze_route(project_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    return await analyze_project(db, project)


@router.post("/projects/{project_id}/sound/layers")
async def upload_layer(
    project_id: int,
    file: UploadFile = File(...),
    kind: str = Form("music"),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a music bed / intro / outro / sound effect and add it as a layer."""
    project = await _get_owned_project(db, project_id, user)
    with tempfile.TemporaryDirectory() as tmp:
        path = os.path.join(tmp, "in")
        with open(path, "wb") as f:
            while chunk := await file.read(1 << 20):
                f.write(chunk)
        try:
            duration = await audio_editor.probe_duration(path)
            mp3 = os.path.join(tmp, "layer.mp3")
            await audio_editor._run([audio_editor._ff(), "-y", "-i", path, "-vn", "-ac", "2", "-ar", "44100",
                                     "-c:a", "libmp3lame", "-b:a", "192k", mp3])
        except RuntimeError as exc:
            raise HTTPException(status_code=422, detail=f"Couldn't read that audio file: {exc}")
        with open(mp3, "rb") as f:
            url = await storage_upload(_user_id(user), f"layer_{file.filename or 'audio'}.mp3", f.read(), content_type="audio/mpeg")
    layer = registry.normalize_layer({"url": url, "kind": kind, "name": file.filename or "Audio", "duration": duration})
    d = await _draft(db, project)
    doc = copy.deepcopy(d["doc"])
    doc["layers"].append(layer)
    _set_doc(project, d, doc)
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)


@router.get("/sound/presets")
async def list_presets(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(SoundPreset).where(SoundPreset.user_id == _user_id(user)).order_by(SoundPreset.id.desc())
    )).scalars().all()
    return [{"id": r.id, "name": r.name, "doc": r.doc, "created_at": r.created_at.isoformat() + "Z"} for r in rows]


@router.post("/sound/presets", status_code=201)
async def create_preset(payload: PresetIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    name = (payload.name or "").strip()[:120]
    if not name:
        raise HTTPException(status_code=400, detail="Preset needs a name")
    doc = registry.normalize_doc(payload.doc)
    doc["layers"] = []  # layers are per-project media
    row = SoundPreset(user_id=_user_id(user), name=name, doc=doc)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return {"id": row.id, "name": row.name, "doc": row.doc}


@router.delete("/sound/presets/{preset_id}", status_code=204)
async def delete_preset(preset_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    row = await db.get(SoundPreset, preset_id)
    if not row or row.user_id != _user_id(user):
        raise HTTPException(status_code=404, detail="Preset not found")
    await db.delete(row)
    await db.commit()


@router.post("/projects/{project_id}/sound/preset/{preset_id}")
async def apply_preset(project_id: int, preset_id: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    project = await _get_owned_project(db, project_id, user)
    row = await db.get(SoundPreset, preset_id)
    if not row or row.user_id != _user_id(user):
        raise HTTPException(status_code=404, detail="Preset not found")
    d = await _draft(db, project)
    doc = registry.normalize_doc(row.doc)
    doc["layers"] = d["doc"]["layers"]
    _set_doc(project, d, doc)
    base, _u, _t, _tl, applied = await _base(db, project)
    await db.commit()
    return _state(project, d, base, applied)
