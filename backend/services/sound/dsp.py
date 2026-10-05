"""Low-level audio helpers: decode/encode with ffmpeg, run ffmpeg filter
graphs on in-memory audio, and measure loudness.

Audio is passed around as float32 numpy arrays shaped (channels, samples)
at a fixed 44.1 kHz stereo, so every stage can be chained without temp files.
"""
import re
import subprocess
from typing import Optional, Tuple

import numpy as np

from services.audio_editor import _ff

SR = 44100
CH = 2


class DSPError(RuntimeError):
    pass


def _pipe(args, data: Optional[bytes] = None, loglevel: str = "error") -> Tuple[bytes, str]:
    proc = subprocess.run(
        [_ff(), "-hide_banner", "-nostdin", "-loglevel", loglevel, *args],
        input=data, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    if proc.returncode != 0:
        raise DSPError(proc.stderr.decode(errors="replace")[-600:])
    return proc.stdout, proc.stderr.decode(errors="replace")


def decode(path: str) -> np.ndarray:
    raw, _ = _pipe(["-i", path, "-vn", "-f", "f32le", "-ac", str(CH), "-ar", str(SR), "pipe:1"])
    x = np.frombuffer(raw, dtype=np.float32)
    if x.size == 0:
        raise DSPError("No audio decoded")
    return x.reshape(-1, CH).T.copy()


def encode(x: np.ndarray, path: str, fmt: str = "mp3", bitrate: str = "192k") -> None:
    codec = {"mp3": ["-c:a", "libmp3lame", "-b:a", bitrate], "wav": ["-c:a", "pcm_s16le"]}[fmt]
    _pipe(["-y", "-f", "f32le", "-ac", str(x.shape[0]), "-ar", str(SR), "-i", "pipe:0", *codec, path],
          np.ascontiguousarray(x.T, dtype=np.float32).tobytes())


def ff(x: np.ndarray, graph: str, *, keep_length: bool = True) -> np.ndarray:
    """Run an ffmpeg audio filter graph over in-memory audio."""
    if not graph:
        return x
    raw, _ = _pipe([
        "-f", "f32le", "-ac", str(x.shape[0]), "-ar", str(SR), "-i", "pipe:0",
        "-af", graph, "-f", "f32le", "-ac", str(x.shape[0]), "-ar", str(SR), "pipe:1",
    ], np.ascontiguousarray(x.T, dtype=np.float32).tobytes())
    y = np.frombuffer(raw, dtype=np.float32).reshape(-1, x.shape[0]).T.copy()
    if keep_length:
        y = fit_length(y, x.shape[1])
    return y


def fit_length(y: np.ndarray, n: int) -> np.ndarray:
    if y.shape[1] == n:
        return y
    if y.shape[1] > n:
        return y[:, :n]
    return np.pad(y, ((0, 0), (0, n - y.shape[1])))


_LUFS_RE = re.compile(r"I:\s*(-?[\d.]+|-inf)\s*LUFS")
_PEAK_RE = re.compile(r"Peak:\s*(-?[\d.]+|-inf)\s*dBFS")
_LRA_RE = re.compile(r"LRA:\s*(-?[\d.]+)\s*LU")


def loudness(x: np.ndarray) -> dict:
    """Integrated loudness (LUFS), true peak (dBTP) and loudness range (LU)."""
    _, err = _pipe([
        "-f", "f32le", "-ac", str(x.shape[0]), "-ar", str(SR), "-i", "pipe:0",
        "-af", "ebur128=peak=true", "-f", "null", "-",
    ], np.ascontiguousarray(x.T, dtype=np.float32).tobytes(), loglevel="info")
    err = err[err.rfind("Summary:"):] if "Summary:" in err else err
    # ffmpeg prints the summary at the end; take the last values.
    def last(rx, default):
        found = rx.findall(err)
        if not found or found[-1] == "-inf":
            return default
        return float(found[-1])
    return {
        "lufs": last(_LUFS_RE, -70.0),
        "true_peak": last(_PEAK_RE, -70.0),
        "lra": last(_LRA_RE, 0.0),
    }


def db(x: float) -> float:
    return 10 ** (x / 20.0)


def rms_db(x: np.ndarray) -> float:
    v = float(np.sqrt(np.mean(np.square(x)))) if x.size else 0.0
    return 20 * np.log10(v) if v > 1e-9 else -120.0


def mix(dry: np.ndarray, wet: np.ndarray, amount: float) -> np.ndarray:
    a = max(0.0, min(1.0, amount))
    return dry if a <= 0 else wet if a >= 1 else dry * (1 - a) + wet * a


def ramp_mask(n: int, start: int, end: int, fade: int) -> np.ndarray:
    """1.0 inside [start, end), 0 outside, with linear ramps of `fade` samples."""
    m = np.zeros(n, dtype=np.float32)
    start, end = max(0, start), min(n, end)
    if end <= start:
        return m
    m[start:end] = 1.0
    f = max(1, min(fade, (end - start) // 2))
    m[start:start + f] = np.linspace(0, 1, f, dtype=np.float32)
    m[end - f:end] = np.linspace(1, 0, f, dtype=np.float32)
    return m
