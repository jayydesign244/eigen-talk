"""Voice Studio: clone your own voice (with recorded consent) and turn scripts into audio.

Flow:
  1. GET  /voices/status        what this account/server can do + the reading script
  2. POST /voices               consent recording + 3 reading samples → verified → cloned
  3. POST /voices/generate      script + voice → a new project, transcript already timed

Consent is enforced, not decorative: the consent recording is transcribed and
must match the consent statement, and it's stored with the voice.
"""
import io
import os
import re
import tempfile
import zipfile
from difflib import SequenceMatcher
from typing import List, Optional

import httpx
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from auth import get_current_user
from database import get_db
from models.db import AudioVersion, Project, UserVoice
from models.schemas import ProjectOut
from routers.projects import _get_openai_client, _user_id, WHISPER_MODEL
from services import audio_editor, speech, voice as voice_service
from services.sound import dsp
from storage import upload_audio as storage_upload

router = APIRouter(prefix="/voices", tags=["voices"])

READING_SCRIPT = [
    "Here's the quick weather update: clear skies this morning, a light breeze from the west, "
    "and a good chance of rain by evening. If you're heading out later, grab a jacket — and maybe "
    "an umbrella, just in case.",
    "I've always loved the sound of a busy kitchen. Pans sizzling, someone laughing in the corner, "
    "the smell of fresh bread coming out of the oven. It reminds me that good things take time, "
    "and the best ones are meant to be shared.",
    "A question I get a lot is: how do you actually stay focused? Honestly, I keep it simple. "
    "Turn off notifications, pick one task, and give it twenty honest minutes. You'd be amazed "
    "how much gets done — seriously, try it today!",
]
PREVIEW_MAX_CHARS = 300
MIN_SAMPLE_SECONDS = 8


def consent_text(speaker: str) -> str:
    return (f"I, {speaker.strip()}, confirm that this is my own voice, and I give Sonicly "
            "permission to create an AI voice from these recordings.")


def _words(t: str) -> List[str]:
    return [w for w in re.sub(r"[^a-z0-9' ]+", " ", (t or "").lower()).split() if w]


def consent_matches(expected: str, heard: str) -> float:
    """Similarity (0–1) of what was said to the consent statement, ignoring the name."""
    exp = [w for w in _words(expected) if w not in ("i",)]
    got = _words(heard)
    return SequenceMatcher(None, exp, got).ratio() if exp and got else 0.0


class PreviewIn(BaseModel):
    voice: str  # "mine:<id>" or "stock:<voice_id>"
    text: str
    stability: float = 0.5
    similarity: float = 0.8
    style: float = 0.0
    speed: float = 1.0


class GenerateIn(PreviewIn):
    name: str = "Untitled script"


async def _owned_voice(db: AsyncSession, user: dict, voice_ref: int) -> UserVoice:
    row = await db.get(UserVoice, voice_ref)
    if not row or row.user_id != _user_id(user):
        raise HTTPException(status_code=404, detail="Voice not found")
    return row


async def _resolve(db: AsyncSession, user: dict, ref: str):
    """(provider voice id, display name, is_mine)"""
    kind, _, value = (ref or "").partition(":")
    if kind == "mine":
        try:
            row = await _owned_voice(db, user, int(value))
        except ValueError:
            raise HTTPException(status_code=400, detail="Bad voice reference")
        return row.voice_id, row.name, True
    if kind == "stock" and value:
        return value, "Stock voice", False
    raise HTTPException(status_code=400, detail="Pick a voice")


def _voice_out(v: UserVoice) -> dict:
    return {"id": v.id, "ref": f"mine:{v.id}", "name": v.name, "is_default": v.is_default,
            "created_at": v.created_at.isoformat() + "Z"}


def _provider_error(exc: voice_service.VoiceError, action: str) -> HTTPException:
    if exc.quota_exceeded:
        return HTTPException(status_code=402, detail=f"Not enough ElevenLabs credits to {action}. {exc}")
    if exc.plan_upgrade_required:
        return HTTPException(status_code=402, detail=(
            "Voice cloning isn't included in the server's ElevenLabs plan (it needs Starter or higher), "
            "or the API key lacks the Voices permission."))
    return HTTPException(status_code=502, detail=f"ElevenLabs couldn't {action}: {exc}")


def _settings(p: PreviewIn) -> dict:
    clamp = lambda v, lo, hi: max(lo, min(hi, float(v)))  # noqa: E731
    return {"stability": clamp(p.stability, 0, 1), "similarity_boost": clamp(p.similarity, 0, 1),
            "style": clamp(p.style, 0, 1), "speed": clamp(p.speed, 0.7, 1.2)}


# ── Status & listing ──────────────────────────────────────────────────

@router.get("/status")
async def status(user: dict = Depends(get_current_user)):
    configured = voice_service.is_configured()
    sub = await voice_service.subscription() if configured else {}
    left = None
    if sub.get("characters_limit") is not None and sub.get("characters_used") is not None:
        left = max(0, sub["characters_limit"] - sub["characters_used"])
    return {
        "configured": configured,
        "can_clone": bool(sub.get("can_clone")),
        "plan": sub.get("tier"),
        "characters_left": left,
        "voice_slots": {"used": sub.get("voice_slots_used"), "limit": sub.get("voice_limit")},
        "reading_script": READING_SCRIPT,
        "consent_template": consent_text("{name}"),
        "min_sample_seconds": MIN_SAMPLE_SECONDS,
        "max_script_chars": speech.MAX_SCRIPT_CHARS,
    }


@router.get("")
async def list_voices(user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(
        select(UserVoice).where(UserVoice.user_id == _user_id(user)).order_by(UserVoice.id.desc())
    )).scalars().all()
    stock = await voice_service.stock_voices()
    return {
        "mine": [_voice_out(v) for v in rows],
        "stock": [{**s, "ref": f"stock:{s['voice_id']}"} for s in stock],
    }


# ── Cloning ───────────────────────────────────────────────────────────

async def _to_mp3(upload: UploadFile, tmp: str, name: str) -> tuple:
    src = os.path.join(tmp, name + "_in")
    with open(src, "wb") as f:
        while chunk := await upload.read(1 << 20):
            f.write(chunk)
    out = os.path.join(tmp, name + ".mp3")
    try:
        await audio_editor._run([audio_editor._ff(), "-y", "-i", src, "-vn", "-ac", "1", "-ar", "44100",
                                 "-c:a", "libmp3lame", "-b:a", "192k", out])
    except RuntimeError:
        raise HTTPException(status_code=422, detail=f"Couldn't read the {name.replace('_', ' ')} recording")
    with open(out, "rb") as f:
        data = f.read()
    return data, await audio_editor.probe_duration(out)


@router.post("", status_code=201)
async def create_voice(
    name: str = Form(...),
    speaker: str = Form(...),
    consent: UploadFile = File(...),
    samples: List[UploadFile] = File(...),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not voice_service.is_configured():
        raise HTTPException(status_code=503, detail="ELEVENLABS_API_KEY not configured")
    speaker = (speaker or "").strip()[:80]
    if not speaker:
        raise HTTPException(status_code=400, detail="Tell us your name for the consent statement")
    if not samples:
        raise HTTPException(status_code=400, detail="Record the reading samples first")

    sub = await voice_service.subscription()
    if sub and not sub.get("can_clone"):
        raise HTTPException(status_code=402, detail=(
            "Voice cloning isn't included in the server's current ElevenLabs plan "
            f"({sub.get('tier') or 'unknown'}). Upgrade to Starter or higher to enable it."))

    uid = _user_id(user)
    expected = consent_text(speaker)
    with tempfile.TemporaryDirectory() as tmp:
        consent_mp3, consent_len = await _to_mp3(consent, tmp, "consent")
        if consent_len < 2:
            raise HTTPException(status_code=400, detail="The consent recording is too short")

        # Verify the consent statement was actually read.
        buf = io.BytesIO(consent_mp3)
        buf.name = "consent.mp3"
        try:
            heard = (await _get_openai_client().audio.transcriptions.create(model=WHISPER_MODEL, file=buf)).text
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Couldn't check the consent recording: {exc}")
        score = consent_matches(expected, heard)
        if score < 0.6:
            raise HTTPException(status_code=400, detail=(
                f"The consent recording didn't match the statement (we heard: “{heard.strip()[:160]}”). "
                "Please read it exactly as shown and try again."))

        clips, total = [], 0.0
        for i, s in enumerate(samples[:6]):
            data, secs = await _to_mp3(s, tmp, f"sample_{i + 1}")
            total += secs
            clips.append((f"sample_{i + 1}.mp3", data, "audio/mpeg"))
        if total < MIN_SAMPLE_SECONDS * len(clips) * 0.6:
            raise HTTPException(status_code=400, detail="The reading samples are too short — read each paragraph fully")

        try:
            provider_id = await voice_service.clone_from_samples(
                clips + [("consent.mp3", consent_mp3, "audio/mpeg")],
                name=f"sonicly-{uid[:24]}-{name[:40]}",
            )
        except voice_service.VoiceError as exc:
            raise _provider_error(exc, "create the voice")

        consent_url = await storage_upload(uid, "voice_consent.mp3", consent_mp3, content_type="audio/mpeg")
        sample_urls = [await storage_upload(uid, fn, data, content_type=ct) for fn, data, ct in clips]

    has_default = (await db.execute(
        select(UserVoice.id).where(UserVoice.user_id == uid, UserVoice.is_default.is_(True)).limit(1)
    )).scalar_one_or_none()
    row = UserVoice(user_id=uid, name=name.strip()[:120] or "My voice", voice_id=provider_id,
                    consent_text=expected, consent_url=consent_url, sample_urls=sample_urls,
                    is_default=has_default is None)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return _voice_out(row)


@router.post("/{voice_ref}/default")
async def make_default(voice_ref: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    row = await _owned_voice(db, user, voice_ref)
    await db.execute(update(UserVoice).where(UserVoice.user_id == row.user_id).values(is_default=False))
    row.is_default = True
    await db.commit()
    return _voice_out(row)


@router.delete("/{voice_ref}", status_code=204)
async def delete_voice(voice_ref: int, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    row = await _owned_voice(db, user, voice_ref)
    await voice_service.delete_voice(row.voice_id)
    await db.delete(row)
    await db.commit()


# ── Speech ────────────────────────────────────────────────────────────

@router.post("/preview")
async def preview(payload: PreviewIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    text = " ".join((payload.text or "").split())[:PREVIEW_MAX_CHARS]
    if not text:
        raise HTTPException(status_code=400, detail="Type something to hear")
    provider_id, _, _ = await _resolve(db, user, payload.voice)
    try:
        audio, _ = await voice_service.synthesize_with_timestamps(provider_id, text, **_settings(payload))
    except voice_service.VoiceError as exc:
        raise _provider_error(exc, "generate the preview")
    url = await storage_upload(_user_id(user), "voice_preview.mp3", audio, content_type="audio/mpeg")
    return {"url": url, "characters": len(text)}


def _docx_text(data: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        xml = z.read("word/document.xml").decode("utf8", errors="replace")
    xml = re.sub(r"</w:p>", "\n\n", xml)
    xml = re.sub(r"<w:tab/>", " ", xml)
    xml = re.sub(r"<w:br/>", "\n", xml)
    text = re.sub(r"<[^>]+>", "", xml)
    import html
    return html.unescape(text)


@router.post("/script/extract")
async def extract_script(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    data = await file.read()
    name = (file.filename or "").lower()
    try:
        if name.endswith(".docx"):
            text = _docx_text(data)
        elif name.endswith((".txt", ".md", ".text")):
            text = data.decode("utf-8", errors="replace")
        else:
            raise HTTPException(status_code=415, detail="Upload a .txt, .md or .docx file")
    except (zipfile.BadZipFile, KeyError):
        raise HTTPException(status_code=422, detail="Couldn't read that Word file")
    text = speech.clean_script(text)
    return {"text": text[:speech.MAX_SCRIPT_CHARS], "characters": len(text), "truncated": len(text) > speech.MAX_SCRIPT_CHARS}


@router.post("/generate", response_model=ProjectOut, status_code=201)
async def generate(payload: GenerateIn, user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Turn a script into a new project spoken in the chosen voice."""
    script = speech.clean_script(payload.text)
    if not script:
        raise HTTPException(status_code=400, detail="The script is empty")
    if len(script) > speech.MAX_SCRIPT_CHARS:
        raise HTTPException(status_code=400, detail=f"Scripts can be up to {speech.MAX_SCRIPT_CHARS:,} characters")
    if not audio_editor.ffmpeg_available():
        raise HTTPException(status_code=503, detail="ffmpeg not installed on the server")
    provider_id, voice_name, is_mine = await _resolve(db, user, payload.voice)

    sub = await voice_service.subscription()
    if sub.get("characters_limit") is not None:
        left = sub["characters_limit"] - (sub.get("characters_used") or 0)
        if len(script) > left:
            raise HTTPException(status_code=402, detail=(
                f"This script is {len(script):,} characters but only {max(0, left):,} are left on the ElevenLabs plan this month."))

    settings = _settings(payload)

    async def synth(text, prev_text, next_text):
        try:
            return await voice_service.synthesize_with_timestamps(
                provider_id, text, previous_text=prev_text, next_text=next_text, **settings)
        except voice_service.VoiceError as exc:
            raise _provider_error(exc, "generate the speech")

    with tempfile.TemporaryDirectory() as tmp:
        def decode_mp3(data: bytes):
            p = os.path.join(tmp, "chunk.mp3")
            with open(p, "wb") as f:
                f.write(data)
            return dsp.decode(p)

        audio, transcript = await speech.generate(script, synth, decode_mp3=decode_mp3)
        out = os.path.join(tmp, "speech.mp3")
        dsp.encode(audio, out, "mp3", "192k")
        with open(out, "rb") as f:
            data = f.read()

    uid = _user_id(user)
    try:
        url = await storage_upload(uid, f"{re.sub(r'[^A-Za-z0-9]+', '_', payload.name)[:40] or 'script'}.mp3", data,
                                   content_type="audio/mpeg")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Upload failed: {exc}")

    secs = transcript["duration"]
    project = Project(
        user_id=uid,
        name=(payload.name or "Untitled script").strip()[:255],
        duration=f"{int(secs // 60)}:{int(secs % 60):02d}",
        status="In Progress",
        audio_url=url,
        media_type="audio",
        transcript=transcript,
        # Rewriting a word later should use the same voice.
        voice_id=provider_id,
        voice_provider="elevenlabs" if is_mine else "elevenlabs-stock",
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectOut.model_validate(project)
