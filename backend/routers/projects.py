import copy
import io
import os
import json
import re
import tempfile
import httpx
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Response
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from models.schemas import (
    ProjectCreate,
    ProjectOut,
    ChatRequest,
    ExportRequest,
    ExportResult,
    ProcessingStatus,
    ApplyEditsRequest,
    AudioVersionOut,
    FillersResponse,
    WordRef,
    ChatThreadCreate,
    ChatThreadUpdate,
    ChatThreadOut,
    ChatMessageOut,
)
from models.db import Project, AudioVersion, ChatThread, ChatMessage
from auth import get_current_user
from database import get_db, SessionLocal
from storage import upload_audio as storage_upload, is_configured as storage_configured
from services import audio_editor, fillers as fillers_service, voice as voice_service, video as video_service
from typing import List, Optional, Tuple

router = APIRouter(prefix="/projects", tags=["projects"])

OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "whisper-1")

_openai_client: Optional[AsyncOpenAI] = None


def _get_openai_client() -> AsyncOpenAI:
    """Lazy so the app can boot without OPENAI_API_KEY for non-AI endpoints."""
    global _openai_client
    if _openai_client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="OPENAI_API_KEY not configured on the server",
            )
        _openai_client = AsyncOpenAI(api_key=api_key)
    return _openai_client

SYSTEM_PROMPT = (
    "You are Sonicly, an AI audio editing assistant inside a web app. "
    "The user is editing an audio recording (podcast, interview, voiceover).\n\n"
    "IMPORTANT: You are a text-only advisor. You cannot modify the user's audio. "
    "Never say you have applied, removed, cleaned, adjusted or changed anything — "
    "you have not, and claiming otherwise misleads the user into shipping an "
    "unedited file. Instead, tell them which control to use.\n\n"
    "What the app can actually do today:\n"
    "- Remove background noise: the 'Clean up audio' button in the assistant panel.\n"
    "- Remove filler words: the 'Remove all fillers' button above the transcript.\n"
    "- Delete a single word: click it in the transcript.\n"
    "- Replace a word: double-click it (regenerated in the user's voice).\n"
    "- Revert: pick an earlier version chip under the player.\n"
    "- Export: the Export button (MP3, WAV or M4A).\n\n"
    "Volume levelling, EQ and pitch changes are NOT implemented. "
    "If asked for one, say plainly that it isn't supported yet rather than pretending. "
    "Be concise and conversational; if the user is unclear, ask one short follow-up."
)


def _chat_system_prompt(project) -> str:
    """Give the model the transcript it's being asked about — without it the
    assistant tells users it can't analyze their audio."""
    transcript = project.transcript
    if not transcript:
        return SYSTEM_PROMPT + "\n\nThis project has no transcript yet."

    parts = [SYSTEM_PROMPT]
    text = (transcript.get("text") or "").strip()
    if text:
        parts.append(f"Transcript of the user's audio:\n{text[:6000]}")

    try:
        refs = fillers_service.find_fillers(transcript)
    except Exception:
        refs = []
    if refs:
        segments = transcript.get("segments") or []
        found = []
        for si, wi in refs:
            try:
                found.append(segments[si]["words"][wi]["text"].strip())
            except (IndexError, KeyError, TypeError):
                continue
        if found:
            parts.append(
                f"Filler words already detected in this audio ({len(found)}): "
                + ", ".join(f'"{w}"' for w in found)
                + ". The user can remove them with the 'Remove all fillers' button."
            )

    return "\n\n".join(parts)


def _user_id(user: dict) -> str:
    return user.get("sub") or "anonymous"


async def _get_owned_project(
    db: AsyncSession, project_id: int, user: dict
) -> Project:
    result = await db.execute(
        select(Project).where(
            Project.id == project_id, Project.user_id == _user_id(user)
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/", response_model=List[ProjectOut])
async def list_projects(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Project)
        .where(Project.user_id == _user_id(user))
        .order_by(Project.updated_at.desc())
    )
    return [ProjectOut.model_validate(p) for p in result.scalars()]


@router.post("/", response_model=ProjectOut, status_code=201)
async def create_project(
    payload: ProjectCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(
        user_id=_user_id(user),
        name=payload.name,
        duration=payload.duration,
        status="New",
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectOut.model_validate(project)


@router.get("/{project_id}", response_model=ProjectOut)
async def get_project(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    return ProjectOut.model_validate(project)


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    await db.delete(project)
    await db.commit()


@router.post("/{project_id}/upload", response_model=ProjectOut)
async def upload_audio(
    project_id: int,
    file: UploadFile = File(...),
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)

    if not storage_configured():
        raise HTTPException(
            status_code=503,
            detail="Storage not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
        )

    if video_service.is_video(file.filename, file.content_type):
        await _import_video(project, file, user)
        project.status = "In Progress"
        await db.commit()
        await db.refresh(project)
        return ProjectOut.model_validate(project)

    data = await file.read()
    try:
        public_url = await storage_upload(
            user_id=_user_id(user),
            filename=file.filename or "audio.bin",
            data=data,
            content_type=file.content_type or "application/octet-stream",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Upload failed: {exc}")

    project.audio_url = public_url
    project.media_type = "audio"
    project.status = "In Progress"
    await db.commit()
    await db.refresh(project)
    return ProjectOut.model_validate(project)


async def _import_video(project: Project, file: UploadFile, user: dict) -> None:
    """Store the original video, its audio track and a light preview.

    Everything downstream (transcription, cuts, noise removal) runs on the
    extracted audio; the video is only re-cut at export time.
    """
    if not audio_editor.ffmpeg_available():
        raise HTTPException(status_code=503, detail="ffmpeg not installed on the server")

    uid = _user_id(user)
    name = file.filename or "video.mp4"
    stem = re.sub(r"\.[A-Za-z0-9]{1,5}$", "", name) or "video"
    with tempfile.TemporaryDirectory() as tmp:
        src_path = os.path.join(tmp, "source" + os.path.splitext(name)[1].lower())
        with open(src_path, "wb") as f:
            while chunk := await file.read(1 << 20):
                f.write(chunk)

        info = await video_service.probe(src_path)
        if not info["has_video"]:
            raise HTTPException(status_code=400, detail="Couldn't read a video stream from this file")
        if not info["has_audio"]:
            raise HTTPException(status_code=400, detail="This video has no audio track to edit")

        audio_path = os.path.join(tmp, "audio.mp3")
        preview_path = os.path.join(tmp, "preview.mp4")
        try:
            await video_service.extract_audio(src_path, audio_path)
            await video_service.make_preview(src_path, preview_path)
        except RuntimeError as exc:
            raise HTTPException(status_code=422, detail=f"Couldn't process this video: {exc}")

        try:
            with open(src_path, "rb") as f:
                project.video_url = await storage_upload(
                    uid, name, f.read(), content_type=file.content_type or "video/mp4"
                )
            with open(audio_path, "rb") as f:
                project.audio_url = await storage_upload(
                    uid, f"{stem}.mp3", f.read(), content_type="audio/mpeg"
                )
            with open(preview_path, "rb") as f:
                project.video_preview_url = await storage_upload(
                    uid, f"{stem}_preview.mp4", f.read(), content_type="video/mp4"
                )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Upload failed: {exc}")

    project.media_type = "video"
    project.video_meta = {k: info[k] for k in ("width", "height", "duration", "codec", "fps")}
    project.timeline = None
    project.transcript = None
    project.active_version_id = None
    flag_modified(project, "video_meta")


def _filename_from_url(url: str) -> str:
    name = url.rsplit("/", 1)[-1].split("?", 1)[0] or "audio.bin"
    # Whisper picks the decoder from the extension — guarantee one it accepts.
    if "." not in name:
        name += ".mp3"
    return name


def _build_transcript(whisper_response: dict) -> dict:
    """Reshape Whisper's verbose_json into our segments+words structure.

    Whisper returns top-level `segments` (no per-word timing) and a flat
    `words` list with timing. We assign each word to the segment whose
    [start, end] window contains its midpoint, so the UI can render lines
    while still having word-level click-to-seek.
    """
    raw_segments = whisper_response.get("segments") or []
    raw_words = whisper_response.get("words") or []

    segments = [
        {
            "start": float(s.get("start", 0.0)),
            "end": float(s.get("end", 0.0)),
            "text": (s.get("text") or "").strip(),
            "words": [],
        }
        for s in raw_segments
    ]

    if not segments and raw_words:
        # No segments — fall back to a single segment spanning the whole audio.
        segments = [{
            "start": float(raw_words[0].get("start", 0.0)),
            "end": float(raw_words[-1].get("end", 0.0)),
            "text": (whisper_response.get("text") or "").strip(),
            "words": [],
        }]

    for w in raw_words:
        start = float(w.get("start", 0.0))
        end = float(w.get("end", start))
        mid = (start + end) / 2
        target = next(
            (s for s in segments if s["start"] <= mid <= s["end"]),
            segments[-1] if segments else None,
        )
        if target is not None:
            target["words"].append({
                "text": w.get("word", ""),
                "start": start,
                "end": end,
            })

    return {
        "language": whisper_response.get("language"),
        "duration": whisper_response.get("duration"),
        "text": whisper_response.get("text", ""),
        "segments": segments,
    }


@router.post("/{project_id}/transcribe", response_model=ProjectOut)
async def transcribe_project(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    if not project.audio_url:
        raise HTTPException(status_code=400, detail="Project has no uploaded audio")
    if not os.environ.get("OPENAI_API_KEY"):
        raise HTTPException(status_code=503, detail="OPENAI_API_KEY not configured")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(project.audio_url)
            resp.raise_for_status()
            audio_bytes = resp.content
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Could not fetch audio: {exc}")

    filename = _filename_from_url(project.audio_url)
    audio_buf = io.BytesIO(audio_bytes)
    audio_buf.name = filename

    try:
        result = await _get_openai_client().audio.transcriptions.create(
            model=WHISPER_MODEL,
            file=audio_buf,
            response_format="verbose_json",
            timestamp_granularities=["word", "segment"],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {exc}")

    transcript = _build_transcript(
        result.model_dump() if hasattr(result, "model_dump") else dict(result)
    )

    project.transcript = transcript
    flag_modified(project, "transcript")
    await db.commit()
    await db.refresh(project)
    return ProjectOut.model_validate(project)


async def _get_owned_thread(
    db: AsyncSession, project_id: int, thread_id: int, user: dict
) -> ChatThread:
    await _get_owned_project(db, project_id, user)
    result = await db.execute(
        select(ChatThread).where(
            ChatThread.id == thread_id, ChatThread.project_id == project_id
        )
    )
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Chat thread not found")
    return thread


def _derive_title(text: str) -> str:
    """First user message becomes the thread title, trimmed to a line."""
    # The editor appends attached transcript lines after this marker; they
    # belong to the prompt, not the title.
    text = (text or "").split("\n\n[Context from the transcript]\n")[0]
    clean = " ".join(text.split())
    if not clean:
        return "New chat"
    return clean[:60] + ("…" if len(clean) > 60 else "")


@router.get("/{project_id}/threads", response_model=List[ChatThreadOut])
async def list_threads(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_project(db, project_id, user)
    counts = (
        select(ChatMessage.thread_id, func.count(ChatMessage.id).label("n"))
        .group_by(ChatMessage.thread_id)
        .subquery()
    )
    result = await db.execute(
        select(ChatThread, func.coalesce(counts.c.n, 0))
        .outerjoin(counts, counts.c.thread_id == ChatThread.id)
        .where(ChatThread.project_id == project_id)
        .order_by(ChatThread.updated_at.desc())
    )
    out = []
    for thread, n in result.all():
        item = ChatThreadOut.model_validate(thread)
        item.message_count = n
        out.append(item)
    return out


@router.post("/{project_id}/threads", response_model=ChatThreadOut, status_code=201)
async def create_thread(
    project_id: int,
    payload: ChatThreadCreate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_project(db, project_id, user)
    thread = ChatThread(project_id=project_id, title=(payload.title or "New chat")[:200])
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return ChatThreadOut.model_validate(thread)


@router.patch("/{project_id}/threads/{thread_id}", response_model=ChatThreadOut)
async def rename_thread(
    project_id: int,
    thread_id: int,
    payload: ChatThreadUpdate,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await _get_owned_thread(db, project_id, thread_id, user)
    title = (payload.title or "").strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    thread.title = title[:200]
    await db.commit()
    await db.refresh(thread)
    return ChatThreadOut.model_validate(thread)


@router.delete("/{project_id}/threads/{thread_id}", status_code=204)
async def delete_thread(
    project_id: int,
    thread_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread = await _get_owned_thread(db, project_id, thread_id, user)
    # SQLite doesn't enforce ON DELETE CASCADE by default — clear children first.
    await db.execute(delete(ChatMessage).where(ChatMessage.thread_id == thread.id))
    await db.delete(thread)
    await db.commit()
    return Response(status_code=204)


@router.get(
    "/{project_id}/threads/{thread_id}/messages", response_model=List[ChatMessageOut]
)
async def list_thread_messages(
    project_id: int,
    thread_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_thread(db, project_id, thread_id, user)
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.thread_id == thread_id)
        .order_by(ChatMessage.id)
    )
    return [ChatMessageOut.model_validate(m) for m in result.scalars().all()]


@router.post("/{project_id}/chat")
async def chat(
    project_id: int,
    payload: ChatRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The assistant. Streams server-sent events:
      {"delta": text}       reply text
      {"sound": state}      the sound panel changed (same shape as GET /sound)
      {"version": version}  a new version was saved
      {"done": true} / {"error": message}
    Short common requests are handled by the instant matcher; everything
    else goes to the language model, which can only act through tools.
    """
    project = await _get_owned_project(db, project_id, user)

    thread: Optional[ChatThread] = None
    if payload.thread_id is not None:
        thread = await _get_owned_thread(db, project_id, payload.thread_id, user)

    latest_user = next(
        (m.content for m in reversed(payload.messages) if m.role == "user"), ""
    )
    if thread is not None and latest_user:
        db.add(ChatMessage(thread_id=thread.id, role="user", content=latest_user))
        if thread.title == "New chat":
            thread.title = _derive_title(latest_user)
        await db.commit()

    thread_id = thread.id if thread else None
    history_msgs = [
        {"role": "assistant" if m.role in ("assistant", "ai") else "user", "content": m.content}
        for m in payload.messages[-12:]
    ]

    async def event_generator():
        from routers import sound as S
        from services.sound import ai, looks as looks_lib, render as rn, analyze as an

        def ev(obj):
            return f"data: {json.dumps(obj)}\n\n"

        reply_parts: List[str] = []
        sound_changes: List[str] = []
        try:
            async with SessionLocal() as wdb:
                proj = await _get_owned_project(wdb, project_id, user)
                d = await S._draft(wdb, proj)
                base, _u, _t, _tl, applied = await S._base(wdb, proj)
                profile = proj.sound_profile if (proj.sound_profile or {}).get("_url") == d.get("base_url") else None
                text = (latest_user or "").split("\n\n[Context from the transcript]\n")[0].strip()
                quick = looks_lib.match(text)
                handled = False

                if quick:
                    kind = quick["kind"]
                    if kind == "greeting":
                        reply_parts.append(ai.greeting_reply(profile))
                        handled = True
                    elif kind == "thanks":
                        reply_parts.append(ai.THANKS_REPLY)
                        handled = True
                    elif kind == "reset":
                        S._set_doc(proj, d, ai.empty_doc())
                        reply_parts.append("Done — all effects are off, you're hearing the original sound again.")
                        handled = True
                    elif kind == "undo":
                        if d.get("history"):
                            S._set_doc(proj, d, d["history"].pop(), record=False)
                            reply_parts.append("Undone — back to the previous settings.")
                        else:
                            reply_parts.append("There's nothing to undo yet.")
                        handled = True
                    elif kind in ("more", "less") and d.get("last_looks"):
                        f = 1.5 if kind == "more" else 0.5
                        found = [(i, max(0.25, min(2.0, s * f))) for i, s in d["last_looks"]]
                        doc = d["doc"]
                        for look_id, strength in found:
                            doc = looks_lib.apply_look(doc, look_id, strength)
                        S._set_doc(proj, d, doc)
                        d["last_looks"] = found
                        reply_parts.append(("Turned it up a notch." if kind == "more" else "Dialled it back.")
                                           + " Keep going, or fine-tune with the sliders.")
                        handled = True
                    elif kind == "looks":
                        doc = d["doc"]
                        for look_id, strength in quick["looks"]:
                            doc = looks_lib.apply_look(doc, look_id, strength)
                        doc = _strip_length_effects(proj, doc, reply_parts)
                        S._set_doc(proj, d, doc)
                        d["last_looks"] = quick["looks"]
                        reply_parts.insert(0, f"Done — I {looks_lib.describe_looks(quick['looks'])}. "
                                              "Have a listen, then fine-tune with the sliders in the Sound panel or say \"a bit more\" or \"less\".")
                        handled = True
                    if handled and kind not in ("greeting", "thanks"):
                        proj.sound_draft = d
                        await wdb.commit()
                        yield ev({"sound": S._state(proj, d, base, applied)})

                if not handled:
                    if profile is None and proj.audio_url:
                        try:
                            profile = await S.analyze_project(wdb, proj)
                        except Exception:
                            profile = None
                    try:
                        refs = fillers_service.find_fillers(proj.transcript) if proj.transcript else []
                    except Exception:
                        refs = []
                    filler_note = f"Filler words detected: {len(refs)} (user can remove them with the 'Remove fillers' button)." if refs else ""
                    system = ai.system_prompt(
                        project_name=proj.name, media_type=proj.media_type or "audio", doc=d["doc"],
                        chain_lines=rn.describe_chain(rn.effective_chain(d["doc"])),
                        analysis=an.summary_for_ai(profile), transcript_text=ai.transcript_for_prompt(proj.transcript),
                        filler_note=filler_note,
                        isolation_available=voice_service.is_configured(),
                    )
                    resp = await _get_openai_client().chat.completions.create(
                        model=ai.SOUND_MODEL,
                        messages=[{"role": "system", "content": system}] + history_msgs,
                        tools=ai.TOOLS,
                        tool_choice="auto",
                        temperature=0.3,
                    )
                    msg = resp.choices[0].message
                    calls = msg.tool_calls or []
                    if msg.content and not calls:
                        reply_parts.append(msg.content.strip())
                    for call in calls:
                        try:
                            args = json.loads(call.function.arguments or "{}")
                        except json.JSONDecodeError:
                            continue
                        if os.environ.get("SONICLY_DEBUG_TOOLS"):
                            print("[chat-tool]", call.function.name, json.dumps(args)[:2000], flush=True)
                        if call.function.name == "update_sound":
                            before = rn.describe_chain(rn.effective_chain(d["doc"]))
                            doc, notes, save_label = ai.apply_sound_ops(d["doc"], args.get("operations") or [], d.setdefault("history", []))
                            doc = _strip_length_effects(proj, doc, notes)
                            S._set_doc(proj, d, doc)
                            d.pop("last_looks", None)
                            proj.sound_draft = d
                            await wdb.commit()
                            yield ev({"sound": S._state(proj, d, base, applied)})
                            if save_label:
                                version = await S.apply_doc(wdb, proj, user, d["doc"], None if save_label == "save" else save_label)
                                yield ev({"version": json.loads(AudioVersionOut.model_validate(version).model_dump_json())})
                                reply_parts.append(f"Saved as a new version: “{version.label}”.")
                            # The reply must match reality: list what actually changed,
                            # and never let the model claim a change that didn't happen.
                            changes = ai.diff_chains(before, rn.describe_chain(rn.effective_chain(d["doc"])))
                            if changes:
                                if args.get("explanation"):
                                    reply_parts.append(args["explanation"].strip())
                                sound_changes.extend(changes)
                            elif not save_label:
                                reply_parts.append("I didn't change anything this time — the settings already match that.")
                            if notes:
                                reply_parts.append("(Note: " + "; ".join(notes) + ".)")
                        elif call.function.name == "edit_audio":
                            edits, notes = ai.edit_ops_to_edits(proj.transcript, args.get("operations") or [])
                            if edits:
                                version = await apply_edits(
                                    project_id,
                                    ApplyEditsRequest(edits=edits, parent_version_id=proj.active_version_id),
                                    user=user, db=wdb,
                                )
                                yield ev({"version": json.loads(version.model_dump_json())})
                                if args.get("explanation"):
                                    reply_parts.append(args["explanation"].strip())
                            if notes:
                                reply_parts.append("I " + "; ".join(notes) + ".")
                    if sound_changes:
                        shown = sound_changes[:6]
                        reply_parts.append("\n\nChanged: " + "; ".join(shown) + ("…" if len(sound_changes) > 6 else ""))
                    if not reply_parts:
                        reply_parts.append("Done.")

            reply = " ".join(p for p in reply_parts if p).replace(" \n\n", "\n\n")
            yield ev({"delta": reply})
            if thread_id is not None and reply:
                async with SessionLocal() as write_db:
                    write_db.add(ChatMessage(thread_id=thread_id, role="ai", content=reply))
                    await write_db.commit()
            yield ev({"done": True})
        except HTTPException as exc:
            yield ev({"error": f"{exc.status_code}: {exc.detail}"})
        except Exception as exc:
            yield ev({"error": str(exc)})

    return StreamingResponse(event_generator(), media_type="text/event-stream")


def _strip_length_effects(project: Project, doc: dict, notes: list) -> dict:
    """Tempo/speed would desync a video's picture — drop them with a note."""
    if project.media_type != "video":
        return doc
    kept = [e for e in doc["effects"] if not (e["type"] in ("tempo", "speed") and abs(e["params"]["rate"] - 1) > 0.005)]
    if len(kept) != len(doc["effects"]):
        notes.append("speed changes aren't available on video projects because they'd put the picture out of sync")
        doc = {**doc, "effects": kept}
    return doc


@router.get("/{project_id}/processing", response_model=ProcessingStatus)
async def processing_status(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    has_audio = bool(project.audio_url)
    has_transcript = bool(project.transcript)
    if not has_audio:
        step = "awaiting_audio"
    elif not has_transcript:
        step = "transcribing"
    else:
        step = "ready"
    # No progress figure: transcription is one blocking call, so any
    # percentage would be invented.
    return ProcessingStatus(
        project_id=project_id,
        step=step,
        complete=step == "ready",
        has_audio=has_audio,
        has_transcript=has_transcript,
    )


@router.post("/{project_id}/export", response_model=ExportResult)
async def export_project(
    project_id: int,
    payload: ExportRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)

    fmt = (payload.format or "mp3").lower()
    if fmt == "mp4":
        if project.media_type != "video" or not project.video_url:
            raise HTTPException(status_code=400, detail="MP4 export needs a video project")
    elif fmt not in audio_editor.FORMAT_SPECS:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {fmt}")
    if not audio_editor.ffmpeg_available():
        raise HTTPException(status_code=503, detail="FFmpeg not available on server")

    # Resolve source — explicit version_id wins, else the project's active audio.
    source_url: Optional[str] = project.audio_url
    source_timeline: Optional[list] = project.timeline
    chosen_version_id: Optional[int] = None
    if payload.version_id is not None:
        result = await db.execute(
            select(AudioVersion).where(
                AudioVersion.id == payload.version_id,
                AudioVersion.project_id == project_id,
            )
        )
        version = result.scalar_one_or_none()
        if not version:
            raise HTTPException(status_code=404, detail="Version not found")
        source_url = version.audio_url
        source_timeline = version.timeline
        chosen_version_id = version.id
    else:
        chosen_version_id = project.active_version_id

    if not source_url:
        raise HTTPException(status_code=400, detail="Project has no audio to export")

    # Sanitize filename — strip any extension the user typed, replace bad chars.
    raw_name = (payload.filename or project.name or "audio").strip()
    base_name = re.sub(r"\.[A-Za-z0-9]{1,5}$", "", raw_name)
    base_name = re.sub(r"[^A-Za-z0-9._-]+", "_", base_name).strip("_") or "audio"

    if fmt == "mp4":
        return await _export_video(
            project, payload, source_url, source_timeline, base_name, chosen_version_id, user, db
        )

    spec = audio_editor.FORMAT_SPECS[fmt]
    out_filename = f"{base_name}.{spec['ext']}"

    with tempfile.TemporaryDirectory() as tmp:
        src_path = os.path.join(tmp, "source.bin")
        out_path = os.path.join(tmp, out_filename)
        async with httpx.AsyncClient(timeout=120.0) as client:
            r = await client.get(source_url)
            r.raise_for_status()
            with open(src_path, "wb") as f:
                f.write(r.content)
        await audio_editor.transcode(src_path, out_path, fmt)
        with open(out_path, "rb") as f:
            data = f.read()
        download_url = await storage_upload(
            _user_id(user),
            out_filename,
            data,
            content_type=spec["content_type"],
        )

    project.status = "Exported"
    await db.commit()

    return ExportResult(
        download_url=download_url,
        filename=out_filename,
        size_bytes=len(data),
        format=fmt,
        version_id=chosen_version_id,
    )


async def _export_video(
    project: Project,
    payload: ExportRequest,
    audio_url: str,
    timeline: Optional[list],
    base_name: str,
    version_id: Optional[int],
    user: dict,
    db: AsyncSession,
) -> ExportResult:
    """Re-cut the original video to match the chosen audio version."""
    aspect = payload.aspect if payload.aspect in (*video_service.ASPECTS, "original") else "original"
    fit = payload.fit if payload.fit in ("fill", "fit") else "fill"
    meta = project.video_meta or {}
    out_filename = f"{base_name}.mp4"

    with tempfile.TemporaryDirectory() as tmp:
        video_path = os.path.join(tmp, "source_video")
        audio_path = os.path.join(tmp, "audio.mp3")
        out_path = os.path.join(tmp, out_filename)
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(60.0, read=600.0)) as client:
                for url, path in ((project.video_url, video_path), (audio_url, audio_path)):
                    async with client.stream("GET", url) as r:
                        r.raise_for_status()
                        with open(path, "wb") as f:
                            async for chunk in r.aiter_bytes(1 << 20):
                                f.write(chunk)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Fetch source media: {exc}")

        try:
            await video_service.render_export(
                video_path, audio_path, timeline, out_path,
                aspect=aspect,
                resolution=payload.resolution,
                fit=fit,
                src_size=(meta.get("width"), meta.get("height")),
                src_fps=meta.get("fps"),
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=f"Video render failed: {exc}")

        with open(out_path, "rb") as f:
            data = f.read()
        try:
            download_url = await storage_upload(
                _user_id(user), out_filename, data, content_type="video/mp4"
            )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Upload export: {exc}")

    project.status = "Exported"
    await db.commit()
    return ExportResult(
        download_url=download_url,
        filename=out_filename,
        size_bytes=len(data),
        format="mp4",
        version_id=version_id,
    )


# ─── Transcript-driven editing ────────────────────────────────────────


@router.post("/{project_id}/fillers", response_model=FillersResponse)
async def detect_fillers(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    if not project.transcript:
        raise HTTPException(status_code=400, detail="Project has no transcript yet")
    refs = fillers_service.find_fillers(project.transcript)
    return FillersResponse(
        fillers=[WordRef(segment_idx=s, word_idx=w) for s, w in refs],
        total=len(refs),
    )


@router.get("/{project_id}/versions", response_model=List[AudioVersionOut])
async def list_versions(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _get_owned_project(db, project_id, user)
    result = await db.execute(
        select(AudioVersion)
        .where(AudioVersion.project_id == project_id)
        .order_by(AudioVersion.created_at.asc())
    )
    return [AudioVersionOut.model_validate(v) for v in result.scalars()]


@router.post(
    "/{project_id}/versions/{version_id}/activate", response_model=ProjectOut
)
async def activate_version(
    project_id: int,
    version_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    result = await db.execute(
        select(AudioVersion).where(
            AudioVersion.id == version_id,
            AudioVersion.project_id == project_id,
        )
    )
    version = result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    project.active_version_id = version.id
    project.audio_url = version.audio_url
    project.timeline = version.timeline
    if version.transcript:
        project.transcript = version.transcript
        flag_modified(project, "transcript")
    await db.commit()
    await db.refresh(project)
    return ProjectOut.model_validate(project)


def _resolve_word_refs(
    transcript: dict, refs: List[dict]
) -> List[Tuple[int, int]]:
    out: List[Tuple[int, int]] = []
    for r in refs:
        try:
            out.append((int(r["segment_idx"]), int(r["word_idx"])))
        except (KeyError, TypeError, ValueError):
            continue
    return out


def _apply_edits_to_transcript(
    transcript: dict,
    deletes: List[Tuple[int, int]],
    replaces: List[Tuple[int, int, str]],
) -> dict:
    """Return a deep copy of the transcript with deletes stripped and
    replaces' word text overwritten. Word timestamps are kept (the
    audio splice keeps the timeline aligned at word boundaries)."""
    drop = {(s, w) for s, w in deletes}
    rmap = {(s, w): new for s, w, new in replaces}
    out = copy.deepcopy(transcript)
    for si, seg in enumerate(out.get("segments") or []):
        kept = []
        for wi, w in enumerate(seg.get("words") or []):
            if (si, wi) in drop:
                continue
            if (si, wi) in rmap:
                w = {**w, "text": rmap[(si, wi)]}
            kept.append(w)
        seg["words"] = kept
        if kept:
            seg["start"], seg["end"] = kept[0].get("start", seg.get("start")), kept[-1].get("end", seg.get("end"))
        seg["text"] = " ".join((w.get("text", "") or "").strip() for w in kept).strip()
    out["segments"] = [s for s in out["segments"] if s.get("words")]
    out["text"] = " ".join(s.get("text", "") for s in out["segments"]).strip()
    return out


def _retime_transcript(
    transcript: dict,
    placed: List[dict],
    replaced_at: dict,
) -> dict:
    """Move every word's timestamps into the new audio's time.

    Cuts shift everything after them earlier; a re-voiced word takes the
    length of its generated take. Without this, the next edit on this
    version would cut at the old positions.
    """
    out = copy.deepcopy(transcript)
    for si, seg in enumerate(out.get("segments") or []):
        words = seg.get("words") or []
        for wi, w in enumerate(words):
            if (si, wi) in replaced_at:
                w["start"], w["end"] = replaced_at[(si, wi)]
                continue
            try:
                start = video_service.remap_time(placed, float(w["start"]))
                end = video_service.remap_time(placed, float(w["end"]))
            except (KeyError, TypeError, ValueError):
                continue
            w["start"], w["end"] = round(start, 3), round(max(start, end), 3)
        if words:
            seg["start"] = words[0].get("start", seg.get("start"))
            seg["end"] = words[-1].get("end", seg.get("end"))
    return out


def _long_gaps(transcript: dict, max_gap: float) -> List[Tuple[float, float]]:
    """Ranges to cut so no pause between words is longer than max_gap."""
    words = [w for seg in (transcript or {}).get("segments") or [] for w in seg.get("words") or []]
    cuts = []
    for a, b in zip(words, words[1:]):
        try:
            gap = float(b["start"]) - float(a["end"])
        except (KeyError, TypeError, ValueError):
            continue
        if gap > max_gap + 0.05:
            keep = max_gap / 2
            cuts.append((float(a["end"]) + keep, float(b["start"]) - keep))
    return cuts


async def _generate(path: str, seconds: float, *, tone: bool) -> None:
    src = f"sine=frequency=1000:sample_rate=44100:duration={seconds:.3f}" if tone else \
        f"anullsrc=r=44100:cl=stereo:d={seconds:.3f}"
    await audio_editor._run([
        audio_editor._ff(), "-y", "-f", "lavfi", "-i", src, "-t", f"{seconds:.3f}",
        "-af", "volume=0.25" if tone else "anull", "-ac", "2", "-ar", "44100",
        "-c:a", "libmp3lame", "-b:a", "192k", path,
    ])


def _word_range(transcript: dict, si: int, wi: int, pad: float = 0.04) -> Optional[Tuple[float, float]]:
    segs = (transcript or {}).get("segments") or []
    if si < 0 or si >= len(segs):
        return None
    words = segs[si].get("words") or []
    if wi < 0 or wi >= len(words):
        return None
    w = words[wi]
    try:
        return (max(0.0, float(w["start"]) - pad), float(w["end"]) + pad)
    except (KeyError, TypeError, ValueError):
        return None


async def _snapshot_original(db: AsyncSession, project: Project) -> Optional[int]:
    """Preserve the pre-edit audio as an 'Original' version before anything
    overwrites project.audio_url. Without this the source becomes unreachable.
    No-op once the project already has versions. Returns its id, if created.
    """
    existing = await db.execute(
        select(AudioVersion.id).where(AudioVersion.project_id == project.id).limit(1)
    )
    if existing.scalar_one_or_none() is not None or not project.audio_url:
        return None
    original = AudioVersion(
        project_id=project.id,
        parent_id=None,
        label="Original",
        audio_url=project.audio_url,
        transcript=project.transcript,
        duration=(project.transcript or {}).get("duration"),
        timeline=project.timeline,
    )
    db.add(original)
    await db.flush()
    return original.id


async def _ensure_voice_clone(project: Project, source_audio: bytes) -> Tuple[str, bool]:
    """Return (voice_id, used_fallback). Clones the user's voice from the
    source audio; if the ElevenLabs plan doesn't include Instant Voice
    Cloning, falls back to a premade voice so the replace pipeline still
    works (with a clear "fallback voice" label on the resulting version).
    """
    if project.voice_id:
        return project.voice_id, project.voice_provider == voice_service.FALLBACK_VOICE_PROVIDER
    try:
        voice_id = await voice_service.clone_voice(
            source_audio, name=f"sonicly-{project.id}-{project.name[:32]}"
        )
        project.voice_id = voice_id
        project.voice_provider = "elevenlabs"
        return voice_id, False
    except voice_service.VoiceError as exc:
        if not exc.plan_upgrade_required:
            raise
        # Free-tier fallback: use a premade voice so the user can still
        # exercise the feature end-to-end. The version label will say so.
        project.voice_id = voice_service.FALLBACK_VOICE_ID
        project.voice_provider = voice_service.FALLBACK_VOICE_PROVIDER
        return voice_service.FALLBACK_VOICE_ID, True


@router.post("/{project_id}/voice/clone", response_model=ProjectOut)
async def clone_project_voice(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Clone the user's voice from the project's source audio. Idempotent —
    returns the existing voice_id when one is already attached."""
    project = await _get_owned_project(db, project_id, user)
    if project.voice_id:
        return ProjectOut.model_validate(project)
    if not project.audio_url:
        raise HTTPException(status_code=400, detail="Project has no audio to clone")
    if not voice_service.is_configured():
        raise HTTPException(
            status_code=503, detail="ELEVENLABS_API_KEY not configured"
        )

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.get(project.audio_url)
            resp.raise_for_status()
            audio_bytes = resp.content
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Fetch source audio: {exc}")

    try:
        _, used_fallback = await _ensure_voice_clone(project, audio_bytes)
    except voice_service.VoiceError as exc:
        if exc.plan_upgrade_required:
            raise HTTPException(
                status_code=402,
                detail=(
                    "ElevenLabs Instant Voice Cloning requires a paid plan "
                    "(Starter or higher). Upgrade at https://elevenlabs.io/pricing, "
                    "or proceed with a built-in voice — the Confirm flow will use "
                    "the premade voice automatically."
                ),
            )
        raise HTTPException(status_code=502, detail=str(exc))

    await db.commit()
    await db.refresh(project)
    return ProjectOut.model_validate(project)


@router.post("/{project_id}/denoise", response_model=AudioVersionOut)
async def denoise_project(
    project_id: int,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run the active audio through ElevenLabs Voice Isolator and save the
    cleaned result as a new version. Isolation preserves speech timing, so the
    existing transcript stays valid against the output.
    """
    project = await _get_owned_project(db, project_id, user)
    if not project.audio_url:
        raise HTTPException(status_code=400, detail="Project has no audio to clean")
    if not voice_service.is_configured():
        raise HTTPException(
            status_code=503, detail="ELEVENLABS_API_KEY not configured"
        )

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.get(project.audio_url)
            resp.raise_for_status()
            source_bytes = resp.content
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Fetch source audio: {exc}")

    try:
        cleaned = await voice_service.isolate_audio(source_bytes)
    except voice_service.VoiceError as exc:
        if exc.quota_exceeded:
            raise HTTPException(status_code=402, detail=f"Not enough ElevenLabs credits: {exc}")
        raise HTTPException(status_code=502, detail=f"Voice Isolator: {exc}")

    try:
        public_url = await storage_upload(
            user_id=_user_id(user),
            filename=f"denoised_{project_id}.mp3",
            data=cleaned,
            content_type="audio/mpeg",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Upload cleaned audio: {exc}")

    original_version_id = await _snapshot_original(db, project)

    version = AudioVersion(
        project_id=project_id,
        parent_id=project.active_version_id or original_version_id,
        label="Noise removed",
        audio_url=public_url,
        transcript=project.transcript,
        duration=(project.transcript or {}).get("duration"),
        # Isolation keeps timing, so the video mapping carries over as-is.
        timeline=project.timeline,
    )
    db.add(version)
    await db.flush()

    project.audio_url = public_url
    project.active_version_id = version.id
    await db.commit()
    await db.refresh(version)
    return AudioVersionOut.model_validate(version)


@router.post("/{project_id}/edits/apply", response_model=AudioVersionOut)
async def apply_edits(
    project_id: int,
    payload: ApplyEditsRequest,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_owned_project(db, project_id, user)
    if not project.audio_url:
        raise HTTPException(status_code=400, detail="Project has no audio")
    if not project.transcript:
        raise HTTPException(status_code=400, detail="Project has no transcript")
    if not audio_editor.ffmpeg_available():
        raise HTTPException(status_code=503, detail="ffmpeg not installed on the server")
    if not storage_configured():
        raise HTTPException(status_code=503, detail="Storage not configured")

    # Pick the source (parent version's URL if provided, else current).
    source_url = project.audio_url
    source_transcript = project.transcript
    source_timeline = project.timeline
    if payload.parent_version_id is not None:
        result = await db.execute(
            select(AudioVersion).where(
                AudioVersion.id == payload.parent_version_id,
                AudioVersion.project_id == project_id,
            )
        )
        parent = result.scalar_one_or_none()
        if parent:
            source_url = parent.audio_url
            source_transcript = parent.transcript or source_transcript
            source_timeline = parent.timeline

    # Collect refs.
    delete_refs: List[Tuple[int, int]] = []
    replace_refs: List[Tuple[int, int, str]] = []
    bleep_refs: List[Tuple[int, int, str]] = []
    pause_refs: List[Tuple[int, int, float]] = []
    gap_cuts: List[Tuple[float, float]] = []
    for edit in payload.edits:
        t = edit.get("type")
        if t == "delete":
            delete_refs.extend(
                _resolve_word_refs(transcript=source_transcript, refs=edit.get("words", []))
            )
        elif t == "replace":
            w = edit.get("word", {})
            new_text = (edit.get("new_text") or "").strip()
            if not new_text:
                continue
            try:
                replace_refs.append((int(w["segment_idx"]), int(w["word_idx"]), new_text))
            except (KeyError, TypeError, ValueError):
                continue
        elif t == "bleep":
            mode = "mute" if edit.get("mode") == "mute" else "tone"
            for si, wi in _resolve_word_refs(transcript=source_transcript, refs=edit.get("words", [])):
                bleep_refs.append((si, wi, mode))
        elif t == "pause":
            w = edit.get("after", {})
            try:
                secs = max(0.1, min(10.0, float(edit.get("seconds", 1.0))))
                pause_refs.append((int(w["segment_idx"]), int(w["word_idx"]), secs))
            except (KeyError, TypeError, ValueError):
                continue
        elif t == "trim_gaps":
            try:
                max_gap = max(0.15, min(5.0, float(edit.get("max_gap", 0.7))))
            except (TypeError, ValueError):
                max_gap = 0.7
            gap_cuts.extend(_long_gaps(source_transcript, max_gap))

    if not delete_refs and not replace_refs and not bleep_refs and not pause_refs and not gap_cuts:
        raise HTTPException(status_code=400, detail="No edits to apply")

    if replace_refs and not voice_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="ELEVENLABS_API_KEY not configured (required for word replacement)",
        )

    with tempfile.TemporaryDirectory() as tmp:
        src_path = os.path.join(tmp, "in.mp3")
        out_path = os.path.join(tmp, "out.mp3")

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.get(source_url)
                resp.raise_for_status()
                src_bytes = resp.content
            with open(src_path, "wb") as f:
                f.write(src_bytes)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Fetch source audio: {exc}")

        duration = await audio_editor.probe_duration(src_path)
        if duration <= 0:
            raise HTTPException(status_code=500, detail="Could not probe audio duration")

        # If we have replaces, ensure a voice clone is attached.
        used_fallback_voice = False
        if replace_refs:
            try:
                _, used_fallback_voice = await _ensure_voice_clone(project, src_bytes)
            except voice_service.VoiceError as exc:
                if exc.plan_upgrade_required:
                    raise HTTPException(
                        status_code=402,
                        detail=str(exc),
                    )
                raise HTTPException(status_code=502, detail=f"Voice clone: {exc}")

            # Generate one mp3 per replace, dump into the temp dir.
            for i, (si, wi, new_text) in enumerate(replace_refs):
                try:
                    audio = await voice_service.synthesize(project.voice_id, new_text)
                except voice_service.VoiceError as exc:
                    raise HTTPException(status_code=502, detail=f"TTS: {exc}")
                gen_path = os.path.join(tmp, f"gen_{i}.mp3")
                with open(gen_path, "wb") as f:
                    f.write(audio)
                replace_refs[i] = (si, wi, new_text, gen_path)  # type: ignore

        # Build chronological op list.
        events: List[dict] = []  # each: {start, end, type: 'delete'|'replace', path?}
        for si, wi in delete_refs:
            r = _word_range(source_transcript, si, wi)
            if r:
                events.append({"start": r[0], "end": r[1], "type": "delete"})
        for ref in replace_refs:
            if len(ref) < 4:
                continue  # safety
            si, wi, new_text, gen_path = ref  # type: ignore
            r = _word_range(source_transcript, si, wi, pad=0.0)
            if r:
                events.append({
                    "start": r[0], "end": r[1], "type": "replace", "path": gen_path,
                    "word": (si, wi),
                })
        # Bleeps: a 1 kHz tone (or silence) exactly as long as the word.
        for i, (si, wi, mode) in enumerate(bleep_refs):
            r = _word_range(source_transcript, si, wi, pad=0.0)
            if not r or r[1] - r[0] < 0.05:
                continue
            gen = os.path.join(tmp, f"bleep_{i}.mp3")
            await _generate(gen, r[1] - r[0], tone=(mode == "tone"))
            events.append({"start": r[0], "end": r[1], "type": "replace", "path": gen, "word": (si, wi)})
        # Pauses: silence inserted right after a word.
        for i, (si, wi, secs) in enumerate(pause_refs):
            r = _word_range(source_transcript, si, wi, pad=0.0)
            if not r:
                continue
            gen = os.path.join(tmp, f"pause_{i}.mp3")
            await _generate(gen, secs, tone=False)
            events.append({"start": r[1], "end": r[1], "type": "replace", "path": gen, "word": None})
        for a, b in gap_cuts:
            events.append({"start": a, "end": b, "type": "delete"})
        events.sort(key=lambda e: (e["start"], e["end"]))

        # Convert events → ops (keep segments + replace inserts; deletes are gaps).
        ops: List[dict] = []
        cursor = 0.0
        for ev in events:
            if ev["start"] > cursor + 0.001:
                ops.append({"type": "keep", "start": cursor, "end": min(ev["start"], duration)})
            if ev["type"] == "replace":
                ops.append({"type": "insert", "path": ev["path"]})
            cursor = max(cursor, ev["end"])
        if cursor < duration - 0.001:
            ops.append({"type": "keep", "start": cursor, "end": duration})

        if not ops:
            raise HTTPException(status_code=400, detail="Edits would remove the entire audio")

        try:
            await audio_editor.render_with_ops(src_path, ops, out_path)
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc))

        with open(out_path, "rb") as f:
            rendered = f.read()
        new_duration = await audio_editor.probe_duration(out_path)

        # Where every op landed in the new audio: drives the video mapping
        # and shifts word timestamps so later edits and seeks line up.
        insert_events = [ev for ev in events if ev["type"] == "replace"]
        insert_durations = {
            ev["path"]: await audio_editor.probe_duration(ev["path"]) for ev in insert_events
        }
        new_timeline, placed = video_service.compose(
            source_timeline,
            duration,
            ops,
            insert_durations,
            {ev["path"]: (ev["start"], ev["end"]) for ev in insert_events},
        )
        replaced_at = {
            ev["word"]: (op["out_start"], op["out_end"])
            for ev in insert_events
            for op in placed
            if op["type"] == "insert" and op["path"] == ev["path"]
        }

    # Persist new file → storage → version row.
    try:
        public_url = await storage_upload(
            user_id=_user_id(user),
            filename=f"edit_{project_id}.mp3",
            data=rendered,
            content_type="audio/mpeg",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Upload edited audio: {exc}")

    new_transcript = _apply_edits_to_transcript(
        _retime_transcript(source_transcript, placed, replaced_at),
        delete_refs,
        [(si, wi, new_text) for ref in replace_refs for si, wi, new_text, *_ in [ref]]
        + [(si, wi, "[bleep]") for si, wi, _ in bleep_refs],
    )
    new_transcript["duration"] = new_duration

    parts = []
    if delete_refs:
        parts.append(f"Removed {len(delete_refs)}")
    if replace_refs:
        parts.append(f"Replaced {len(replace_refs)}")
    word_label = (" · ".join(parts) + " word" + ("s" if (len(delete_refs) + len(replace_refs)) != 1 else "")) if parts else ""
    extra = []
    if bleep_refs:
        extra.append(f"Bleeped {len(bleep_refs)}")
    if pause_refs:
        extra.append(f"Added {len(pause_refs)} pause{'s' if len(pause_refs) != 1 else ''}")
    if gap_cuts:
        extra.append(f"Tightened {len(gap_cuts)} pause{'s' if len(gap_cuts) != 1 else ''}")
    default_label = " · ".join([p for p in [word_label, *extra] if p])
    if replace_refs and used_fallback_voice:
        default_label += " (premade voice)"

    original_version_id = await _snapshot_original(db, project)

    version = AudioVersion(
        project_id=project_id,
        parent_id=payload.parent_version_id or original_version_id,
        label=payload.label or default_label,
        audio_url=public_url,
        transcript=new_transcript,
        duration=new_duration,
        timeline=new_timeline,
    )
    db.add(version)
    await db.flush()

    project.audio_url = public_url
    project.timeline = new_timeline
    project.transcript = new_transcript
    project.active_version_id = version.id
    flag_modified(project, "transcript")
    await db.commit()
    await db.refresh(version)
    return AudioVersionOut.model_validate(version)
