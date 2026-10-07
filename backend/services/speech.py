"""Script → speech: chunking, generation with continuity, and a timed transcript.

Long scripts are split at sentence boundaries into chunks the TTS handles
well. Each chunk is generated with the neighbouring text as context so the
delivery doesn't reset at every join. ElevenLabs returns per-character
timing, which becomes word timestamps — so a generated project opens in
the editor fully editable, without a transcription pass.
"""
import re
from typing import Callable, Awaitable, List, Optional, Tuple

import numpy as np

from services.sound import dsp

CHUNK_CHARS = 1200
PARAGRAPH_PAUSE = 0.45  # seconds of silence between paragraphs
MAX_SCRIPT_CHARS = 50_000

_SENT = re.compile(r"(?<=[.!?…])[\"')\]]*\s+(?=[\"'(\[]?[A-Z0-9])")


def clean_script(text: str) -> str:
    text = (text or "").replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_sentences(paragraph: str) -> List[str]:
    parts = [p.strip() for p in _SENT.split(paragraph) if p.strip()]
    out = []
    for p in parts:
        # Very long sentences: break at commas/semicolons so chunks stay sane.
        while len(p) > CHUNK_CHARS:
            cut = max(p.rfind(", ", 0, CHUNK_CHARS), p.rfind("; ", 0, CHUNK_CHARS), p.rfind(" ", 0, CHUNK_CHARS))
            cut = cut if cut > 200 else CHUNK_CHARS
            out.append(p[:cut + 1].strip())
            p = p[cut + 1:].strip()
        if p:
            out.append(p)
    return out


def plan_chunks(script: str) -> List[dict]:
    """[{text, sentences: [..], paragraph_end: bool}] in reading order."""
    chunks = []
    for para in [p.strip() for p in clean_script(script).split("\n\n") if p.strip()]:
        para = " ".join(para.split("\n"))
        cur: List[str] = []
        for sent in split_sentences(para):
            if cur and len(" ".join(cur)) + len(sent) + 1 > CHUNK_CHARS:
                chunks.append({"sentences": cur, "paragraph_end": False})
                cur = []
            cur.append(sent)
        if cur:
            chunks.append({"sentences": cur, "paragraph_end": True})
    for c in chunks:
        c["text"] = " ".join(c["sentences"])
    return chunks


def _words_from_alignment(alignment: dict, offset: float) -> List[dict]:
    chars = alignment.get("characters") or []
    starts = alignment.get("character_start_times_seconds") or []
    ends = alignment.get("character_end_times_seconds") or []
    words, cur, w_start, w_end = [], "", None, None
    for ch, a, b in zip(chars, starts, ends):
        if ch.isspace():
            if cur.strip():
                words.append({"text": " " + cur, "start": round(offset + w_start, 3), "end": round(offset + w_end, 3)})
            cur, w_start, w_end = "", None, None
            continue
        if w_start is None:
            w_start = a
        cur += ch
        w_end = b
    if cur.strip():
        words.append({"text": " " + cur, "start": round(offset + w_start, 3), "end": round(offset + w_end, 3)})
    return words


def _segments(words: List[dict], sentences: List[str]) -> List[dict]:
    """Group a chunk's words back into one segment per sentence."""
    segs, i = [], 0
    for sent in sentences:
        n = len(sent.split())
        ws = words[i:i + n] or []
        i += n
        if ws:
            segs.append({"start": ws[0]["start"], "end": ws[-1]["end"], "text": sent, "words": ws})
    if i < len(words) and segs:  # alignment produced extra tokens — keep them
        segs[-1]["words"].extend(words[i:])
        segs[-1]["end"] = words[-1]["end"]
    elif i < len(words):
        rest = words[i:]
        segs.append({"start": rest[0]["start"], "end": rest[-1]["end"],
                     "text": " ".join(w["text"].strip() for w in rest), "words": rest})
    return segs


async def generate(
    script: str,
    synth: Callable[..., Awaitable[Tuple[bytes, dict]]],
    *,
    decode_mp3: Callable[[bytes], np.ndarray],
    progress: Optional[Callable[[int, int], Awaitable[None]]] = None,
) -> Tuple[np.ndarray, dict]:
    """Generate the whole script. `synth(text, previous_text, next_text)` → (mp3, alignment)."""
    chunks = plan_chunks(script)
    if not chunks:
        raise ValueError("The script is empty")
    pieces: List[np.ndarray] = []
    segments: List[dict] = []
    t = 0.0
    for i, c in enumerate(chunks):
        prev_text = chunks[i - 1]["text"] if i else None
        next_text = chunks[i + 1]["text"] if i + 1 < len(chunks) else None
        mp3, alignment = await synth(c["text"], prev_text, next_text)
        audio = decode_mp3(mp3)
        words = _words_from_alignment(alignment, t)
        segments.extend(_segments(words, c["sentences"]))
        pieces.append(audio)
        t += audio.shape[1] / dsp.SR
        if c["paragraph_end"] and i + 1 < len(chunks):
            gap = np.zeros((audio.shape[0], int(PARAGRAPH_PAUSE * dsp.SR)), dtype=np.float32)
            pieces.append(gap)
            t += PARAGRAPH_PAUSE
        if progress:
            await progress(i + 1, len(chunks))
    audio = np.concatenate(pieces, axis=1)
    transcript = {
        "language": None,
        "duration": round(audio.shape[1] / dsp.SR, 3),
        "text": " ".join(s["text"] for s in segments),
        "segments": segments,
        "source": "tts",
    }
    return audio, transcript
