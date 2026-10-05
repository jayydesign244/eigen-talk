"""Video projects: the user edits the audio, the video follows.

A video upload is split into three files:
  - the original video (kept untouched, used for export),
  - an mp3 of its audio track (what transcription and every edit work on),
  - a small H.264 preview (what the editor plays, muted, in sync with the audio).

Audio edits never touch the video. Instead each version carries a
*timeline*: a list of segments mapping the edited audio's time back to the
original video's time. The editor uses it to keep the preview in sync and
export uses it to cut the original video to match.

    segment = {"out_start", "out_end", "src_start", "src_end"}

`out_*` is time in the edited audio, `src_*` is time in the original video.
A segment whose source range is shorter than its output range (a word
re-voiced with a longer take) holds the last frame for the remainder.
"""
import asyncio
import os
import re
import tempfile
from typing import List, Optional, Sequence, Tuple

from services.audio_editor import CROSSFADE_SECONDS, _ff, _run

VIDEO_EXTS = {"mp4", "mov", "m4v", "webm", "mkv", "3gp", "3gpp", "avi"}

# Export shapes. Each maps a requested resolution (the short side) to a frame.
ASPECTS = {
    "16:9": (16, 9),
    "9:16": (9, 16),
    "1:1": (1, 1),
}
RESOLUTIONS = (720, 1080)
PREVIEW_HEIGHT = 540


def is_video(filename: Optional[str], content_type: Optional[str]) -> bool:
    if content_type and content_type.startswith("video/"):
        return True
    ext = (filename or "").rsplit(".", 1)[-1].lower() if "." in (filename or "") else ""
    return ext in VIDEO_EXTS


# ─── Probing ───────────────────────────────────────────────────────────

_DUR_RE = re.compile(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)")
_VIDEO_RE = re.compile(r"Stream #\d+:\d+.*?: Video: (\w+).*?, (\d{2,5})x(\d{2,5})")
_FPS_RE = re.compile(r"(\d+(?:\.\d+)?) fps")
_ROT_RE = re.compile(r"rotation of (-?\d+(?:\.\d+)?) degrees|rotate\s*:\s*(-?\d+)")


async def probe(path: str) -> dict:
    """Duration, display size, codec and whether there's an audio track.

    Parsed from `ffmpeg -i` stderr so we don't need ffprobe (imageio-ffmpeg
    only ships ffmpeg). Width/height are the *displayed* size: phone videos
    store 1920x1080 with a 90° rotation flag and play as 1080x1920.
    """
    proc = await asyncio.create_subprocess_exec(
        _ff(), "-hide_banner", "-i", path,
        stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
    )
    _, stderr = await proc.communicate()
    text = stderr.decode(errors="replace")

    info = {"duration": 0.0, "width": None, "height": None, "codec": None,
            "fps": None, "has_audio": " Audio: " in text, "has_video": False}
    m = _DUR_RE.search(text)
    if m:
        h, mi, s = m.groups()
        info["duration"] = int(h) * 3600 + int(mi) * 60 + float(s)
    v = _VIDEO_RE.search(text)
    if v:
        info["has_video"] = True
        info["codec"] = v.group(1)
        w, hgt = int(v.group(2)), int(v.group(3))
        r = _ROT_RE.search(text)
        rot = abs(float(r.group(1) or r.group(2))) if r else 0.0
        if round(rot) % 180 == 90:
            w, hgt = hgt, w
        info["width"], info["height"] = w, hgt
        line = text[v.start():text.find("\n", v.start())]
        f = _FPS_RE.search(line)
        if f:
            info["fps"] = float(f.group(1))
    return info


# ─── Import ────────────────────────────────────────────────────────────

async def extract_audio(src: str, out_mp3: str) -> None:
    """Pull the audio track out as the mp3 every edit works on."""
    await _run([
        _ff(), "-y", "-i", src, "-vn",
        "-ac", "2", "-ar", "44100",
        "-c:a", "libmp3lame", "-b:a", "192k",
        out_mp3,
    ])


async def make_preview(src: str, out_mp4: str) -> None:
    """A small, browser-safe, fast-seeking copy for the editor.

    iPhone HEVC .mov files don't play in Chrome, and a 4K source seeks
    slowly, so the editor never plays the original. A keyframe every 12
    frames keeps the jumps at each cut snappy. No audio: the editor plays
    the (edited) audio separately.
    """
    await _run([
        _ff(), "-y", "-i", src, "-an",
        "-vf", f"scale=-2:'min({PREVIEW_HEIGHT},ih)':flags=bilinear,format=yuv420p",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
        "-g", "12", "-keyint_min", "12", "-sc_threshold", "0",
        "-movflags", "+faststart",
        out_mp4,
    ])


# ─── Timeline maths ────────────────────────────────────────────────────

def identity(duration: float) -> List[dict]:
    d = max(0.0, float(duration or 0.0))
    return [{"out_start": 0.0, "out_end": d, "src_start": 0.0, "src_end": d}]


def _src_at(seg: dict, t: float) -> float:
    """Source time for output time t inside seg (holds the last frame)."""
    return min(seg["src_start"] + (t - seg["out_start"]), seg["src_end"])


def map_point(timeline: Sequence[dict], t: float) -> float:
    if not timeline:
        return t
    for seg in timeline:
        if t < seg["out_end"]:
            return _src_at(seg, max(t, seg["out_start"]))
    return timeline[-1]["src_end"]


def map_range(timeline: Sequence[dict], a: float, b: float) -> List[Tuple[float, float, float, float]]:
    """Split the output range [a, b] of `timeline` into pieces.

    Returns (out_a, out_b, src_a, src_b) per piece, in output order.
    """
    if b <= a:
        return []
    pieces = []
    for seg in timeline:
        lo, hi = max(a, seg["out_start"]), min(b, seg["out_end"])
        if hi - lo > 1e-4:
            pieces.append((lo, hi, _src_at(seg, lo), _src_at(seg, hi)))
    return pieces


def compose(
    parent: Optional[Sequence[dict]],
    parent_duration: float,
    ops: Sequence[dict],
    insert_durations: dict,
    insert_sources: dict,
    crossfade: float = CROSSFADE_SECONDS,
) -> Tuple[List[dict], List[dict]]:
    """Build the new version's timeline from the render ops.

    `ops` are the keep/insert operations `render_with_ops` just rendered,
    in the parent's time. Each join overlaps by `crossfade`, so every op
    but the last loses that much from its output length; we give video
    segments hard cuts at those points.

    Returns (timeline, placed_ops) where placed_ops adds out_start/out_end
    to each op so callers can remap transcript times as well.
    """
    parent = list(parent) if parent else identity(parent_duration)
    out: List[dict] = []
    placed: List[dict] = []
    pos = 0.0
    n = len(ops)
    for i, op in enumerate(ops):
        if op["type"] == "keep":
            length = op["end"] - op["start"]
        else:
            length = insert_durations.get(op["path"], 0.0)
        span = max(0.0, length - (crossfade if i < n - 1 else 0.0))
        start, end = pos, pos + span
        placed.append({**op, "out_start": start, "out_end": end})
        if op["type"] == "keep":
            for oa, ob, sa, sb in map_range(parent, op["start"], op["start"] + span):
                out.append({
                    "out_start": round(start + (oa - op["start"]), 4),
                    "out_end": round(start + (ob - op["start"]), 4),
                    "src_start": round(sa, 4),
                    "src_end": round(sb, 4),
                })
        else:
            pa, pb = insert_sources.get(op["path"], (0.0, 0.0))
            sa, sb = map_point(parent, pa), map_point(parent, pb)
            out.append({
                "out_start": round(start, 4), "out_end": round(end, 4),
                "src_start": round(sa, 4), "src_end": round(max(sa, sb), 4),
            })
        pos = end
    return _merge(out), placed


def _merge(timeline: List[dict]) -> List[dict]:
    """Join segments that continue each other in both time bases."""
    merged: List[dict] = []
    for seg in timeline:
        if seg["out_end"] - seg["out_start"] <= 1e-4:
            continue
        if merged:
            last = merged[-1]
            if (abs(last["out_end"] - seg["out_start"]) < 2e-3
                    and abs(last["src_end"] - seg["src_start"]) < 2e-3
                    and abs((last["out_end"] - last["out_start"]) - (last["src_end"] - last["src_start"])) < 2e-3):
                last["out_end"], last["src_end"] = seg["out_end"], seg["src_end"]
                continue
        merged.append(dict(seg))
    return merged


def remap_time(placed: Sequence[dict], t: float) -> float:
    """Parent time → new output time, via the placed keep ops."""
    best = None
    for op in placed:
        if op["type"] != "keep":
            continue
        if op["start"] - 1e-3 <= t <= op["end"] + 1e-3:
            return op["out_start"] + min(t - op["start"], op["out_end"] - op["out_start"])
        # Remember the nearest keep for words clipped by a neighbouring cut.
        d = min(abs(t - op["start"]), abs(t - op["end"]))
        if best is None or d < best[0]:
            edge = op["out_start"] if abs(t - op["start"]) <= abs(t - op["end"]) else op["out_end"]
            best = (d, edge)
    return best[1] if best else t


# ─── Export ────────────────────────────────────────────────────────────

def _frame_size(aspect: str, resolution: int, src_w: int, src_h: int) -> Tuple[int, int]:
    def even(x: float) -> int:
        return max(2, int(round(x / 2)) * 2)

    if aspect in ASPECTS:
        aw, ah = ASPECTS[aspect]
        if aw >= ah:
            return even(resolution * aw / ah), resolution
        return resolution, even(resolution * ah / aw)
    # "original": keep the source shape with its short side at `resolution`.
    if not src_w or not src_h:
        return even(resolution * 16 / 9), resolution
    if src_w >= src_h:
        return even(resolution * src_w / src_h), resolution
    return resolution, even(resolution * src_h / src_w)


def _frame_filter(w: int, h: int, fit: str, fps: int) -> str:
    if fit == "fit":
        size = f"scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black"
    else:  # "fill": crop the centre so the frame is covered
        size = f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h}"
    return f"{size},setsar=1,fps={fps},format=yuv420p"


async def render_export(
    video_path: str,
    audio_path: str,
    timeline: Optional[Sequence[dict]],
    out_path: str,
    *,
    aspect: str = "original",
    resolution: int = 1080,
    fit: str = "fill",
    src_size: Tuple[Optional[int], Optional[int]] = (None, None),
    src_fps: Optional[float] = None,
) -> None:
    """Cut the original video to `timeline` and lay the edited audio under it.

    Each segment is encoded on its own with an input seek (fast on long
    files), then the parts are joined with the concat demuxer and muxed
    with the edited audio. Every part shares one encoder setup so the join
    is a stream copy.
    """
    resolution = resolution if resolution in RESOLUTIONS else 1080
    w, h = _frame_size(aspect, resolution, *(src_size or (None, None)))
    fps = 30 if not src_fps or src_fps > 31 else max(24, int(round(src_fps)))
    vf = _frame_filter(w, h, fit, fps)

    with tempfile.TemporaryDirectory() as tmp:
        if not timeline:
            video_only = os.path.join(tmp, "video.mp4")
            await _run([
                _ff(), "-y", "-i", video_path, "-an", "-vf", vf,
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                video_only,
            ])
        else:
            parts = []
            for i, seg in enumerate(timeline):
                # Count frames against absolute output time so per-segment
                # rounding never accumulates into audio/video drift.
                frames = round(seg["out_end"] * fps) - round(seg["out_start"] * fps)
                if frames <= 0:
                    continue
                dur = frames / fps
                src_len = max(0.0, seg["src_end"] - seg["src_start"])
                hold = max(0.0, dur - src_len)
                part = os.path.join(tmp, f"part_{i:05d}.mp4")
                # Always pad a little: the last segment can run into the end of
                # the source, and a held frame covers re-voiced words.
                chain = f"{vf},tpad=stop_mode=clone:stop_duration={hold + 0.25:.3f}"
                await _run([
                    _ff(), "-y",
                    "-ss", f"{seg['src_start']:.3f}", "-i", video_path,
                    "-frames:v", str(frames), "-an", "-vf", chain,
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                    "-video_track_timescale", "90000",
                    part,
                ])
                parts.append(part)
            if not parts:
                raise RuntimeError("Nothing left to export")
            listing = os.path.join(tmp, "parts.txt")
            with open(listing, "w") as f:
                f.writelines(f"file '{p}'\n" for p in parts)
            video_only = os.path.join(tmp, "video.mp4")
            await _run([
                _ff(), "-y", "-f", "concat", "-safe", "0", "-i", listing,
                "-c", "copy", video_only,
            ])

        await _run([
            _ff(), "-y", "-i", video_only, "-i", audio_path,
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart",
            out_path,
        ])
