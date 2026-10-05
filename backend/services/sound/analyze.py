"""Measure a recording so the AI (and the Sound check panel) can reason about it.

Everything here is plain DSP on numpy — no AI calls, no cost. The output is
a compact profile: numbers plus plain-language findings, each with a
suggested fix expressed as look/effect settings.
"""
import math
from typing import Dict, List, Optional

import numpy as np

from services.sound import dsp
from services.sound.dsp import SR

BANDS = [
    ("sub", 20, 60), ("low", 60, 250), ("low_mid", 250, 500), ("mid", 500, 2000),
    ("presence", 2000, 5000), ("sibilance", 5000, 9000), ("air", 9000, 16000),
]
# Long-term average speech spectrum (Byrne et al. 1994, male+female, one-third
# octave levels in dB). Converted below to per-Hz density per band, relative to
# the mid band, so it compares like-for-like with _band_levels.
_LTASS = {63: 38, 80: 43, 100: 51, 125: 55, 160: 56, 200: 57, 250: 58, 315: 57, 400: 56, 500: 55,
          630: 53, 800: 51, 1000: 50, 1250: 49, 1600: 48, 2000: 47, 2500: 46, 3150: 45, 4000: 44,
          5000: 43, 6300: 41, 8000: 40, 10000: 38, 12500: 36, 16000: 34}


def _reference() -> Dict[str, float]:
    fs = np.array(sorted(_LTASS))
    dens = np.array([_LTASS[f] - 10 * math.log10(0.2316 * f) for f in fs])
    grid = np.linspace(20, 16000, 4000)
    d = np.interp(np.log(grid), np.log(fs), dens)  # flat extension at the ends
    d = np.where(grid < 63, dens[0] - 12 * np.log2(63 / np.maximum(grid, 1)), d)
    out = {}
    for name, lo, hi in BANDS:
        sel = (grid >= lo) & (grid < hi)
        out[name] = 10 * math.log10(float(np.mean(10 ** (d[sel] / 10))))
    return {k: round(v - out["mid"], 1) for k, v in out.items()}


REFERENCE = _reference()


def _frames(mono: np.ndarray, size: int, hop: int) -> np.ndarray:
    n = 1 + max(0, (len(mono) - size) // hop)
    idx = np.arange(size)[None, :] + hop * np.arange(n)[:, None]
    return mono[idx]


def _speech_mask(words: List[dict], n: int) -> Optional[np.ndarray]:
    if not words:
        return None
    m = np.zeros(n, dtype=bool)
    for w in words:
        a, b = int(w["start"] * SR), int(w["end"] * SR)
        m[max(0, a):min(n, b)] = True
    return m if m.any() else None


def _band_levels(mono: np.ndarray) -> Dict[str, float]:
    size = 4096
    if len(mono) < size:
        mono = np.pad(mono, (0, size - len(mono)))
    frames = _frames(mono, size, size // 2)
    if len(frames) > 600:
        frames = frames[np.linspace(0, len(frames) - 1, 600).astype(int)]
    win = np.hanning(size).astype(np.float32)
    spec = np.mean(np.abs(np.fft.rfft(frames * win, axis=1)) ** 2, axis=0)
    freqs = np.fft.rfftfreq(size, 1 / SR)
    out = {}
    for name, lo, hi in BANDS:
        sel = (freqs >= lo) & (freqs < hi)
        # Mean power per Hz, so wide and narrow bands compare fairly.
        out[name] = 10 * math.log10(float(np.mean(spec[sel])) + 1e-20)
    ref = out["mid"]
    return {k: round(v - ref, 1) for k, v in out.items()}


def _pitch(mono: np.ndarray) -> Optional[dict]:
    """Median speaking pitch via autocorrelation on voiced frames."""
    size, hop = 2048, 1024
    frames = _frames(mono, size, hop)
    if not len(frames):
        return None
    energy = np.sqrt(np.mean(frames ** 2, axis=1))
    voiced = frames[energy > np.percentile(energy, 60)]
    if len(voiced) > 400:
        voiced = voiced[np.linspace(0, len(voiced) - 1, 400).astype(int)]
    lo_lag, hi_lag = int(SR / 400), int(SR / 60)
    f0s = []
    for f in voiced:
        f = f - f.mean()
        ac = np.fft.irfft(np.abs(np.fft.rfft(f, 2 * size)) ** 2)[:size]
        if ac[0] <= 0:
            continue
        seg = ac[lo_lag:hi_lag]
        lag = int(np.argmax(seg)) + lo_lag
        if ac[lag] / ac[0] > 0.35:
            f0s.append(SR / lag)
    if len(f0s) < 5:
        return None
    med = float(np.median(f0s))
    kind = "low (typical adult male)" if med < 140 else "high (typical adult female or child)" if med > 180 else "mid-range"
    return {"median_hz": round(med, 1), "range_hz": [round(float(np.percentile(f0s, 10)), 1), round(float(np.percentile(f0s, 90)), 1)], "voice_type": kind}


def _hum(mono: np.ndarray) -> Optional[dict]:
    size = 1 << 15
    seg = mono[: size * 8]
    if len(seg) < size:
        return None
    frames = _frames(seg, size, size)
    spec = np.mean(np.abs(np.fft.rfft(frames * np.hanning(size), axis=1)), axis=0)
    freqs = np.fft.rfftfreq(size, 1 / SR)
    best = None
    for base in (50.0, 60.0):
        score = 0.0
        for k in (1, 2, 3):
            f = base * k
            i = int(round(f / (SR / size)))
            peak = spec[i - 2:i + 3].max()
            around = np.median(spec[max(0, i - 40):i + 40])
            score += 20 * math.log10((peak + 1e-12) / (around + 1e-12))
        score /= 3
        if best is None or score > best[1]:
            best = (base, score)
    if best and best[1] > 9:
        return {"mains_hz": int(best[0]), "prominence_db": round(best[1], 1)}
    return None


def analyze(x: np.ndarray, words: Optional[List[dict]] = None) -> dict:
    mono = x.mean(axis=0)
    n = len(mono)
    loud = dsp.loudness(x)
    peak = float(np.max(np.abs(x))) if x.size else 0.0
    clipped = int(np.count_nonzero(np.abs(x) >= 0.999))

    mask = _speech_mask(words or [], n)
    if mask is not None:
        speech = mono[mask]
        gaps = mono[~mask]
    else:
        frames = _frames(mono, 2048, 2048)
        e = np.sqrt(np.mean(frames ** 2, axis=1)) if len(frames) else np.zeros(1)
        thr = np.percentile(e, 30)
        speech = frames[e > thr].ravel() if len(frames) else mono
        gaps = frames[e <= thr].ravel() if len(frames) else mono[:0]
    speech_db = dsp.rms_db(speech)
    # Noise floor: quietest 20% of short gap frames (avoid breaths).
    if gaps.size > 4096:
        gf = _frames(gaps, 1024, 1024)
        ge = 20 * np.log10(np.maximum(np.sqrt(np.mean(gf ** 2, axis=1)), 1e-9))
        noise_db = float(np.percentile(ge, 20))
    else:
        noise_db = -90.0
    snr = speech_db - noise_db

    bands = _band_levels(speech if speech.size > 8192 else mono)
    pitch = _pitch(speech if speech.size > 8192 else mono)
    hum = _hum(gaps if gaps.size > (1 << 16) else mono)

    # Room echo: how slowly energy dies after words end.
    echo = None
    if words and len(words) > 10:
        tails = []
        for w, nxt in zip(words, words[1:]):
            if nxt["start"] - w["end"] < 0.35:
                continue
            a = int(w["end"] * SR)
            word = mono[max(0, a - int(0.1 * SR)):a]
            tail = mono[a + int(0.05 * SR):a + int(0.2 * SR)]
            if word.size and tail.size:
                tails.append(dsp.rms_db(tail) - dsp.rms_db(word))
        if tails:
            t = float(np.median(tails))
            echo = {"tail_db": round(t, 1), "level": "high" if t > -18 else "medium" if t > -26 else "low"}

    pace = None
    if words and len(words) > 5:
        dur = words[-1]["end"] - words[0]["start"]
        long_pauses = sum(1 for a, b in zip(words, words[1:]) if b["start"] - a["end"] > 1.2)
        pace = {"wpm": round(len(words) / max(dur, 1) * 60), "long_pauses": long_pauses}

    profile = {
        "duration": round(n / SR, 2),
        "loudness_lufs": loud["lufs"],
        "true_peak_db": loud["true_peak"],
        "loudness_range_lu": loud["lra"],
        "peak_db": round(20 * math.log10(peak), 1) if peak > 0 else -120,
        "clipped_samples": clipped,
        "noise_floor_db": round(noise_db, 1),
        "snr_db": round(snr, 1),
        "bands_vs_mid_db": bands,
        "pitch": pitch,
        "hum": hum,
        "echo": echo,
        "pace": pace,
    }
    profile["findings"] = findings(profile)
    return profile


def findings(p: dict) -> List[dict]:
    """Plain-language issues, worst first, each with a one-click fix."""
    out = []

    def add(key, severity, title, detail, fix):
        out.append({"key": key, "severity": severity, "title": title, "detail": detail, "fix": fix})

    b = p["bands_vs_mid_db"]
    dev = {k: b[k] - REFERENCE[k] for k in b}
    if p["clipped_samples"] > 50:
        add("clipping", 3, "Distortion from clipping", f"{p['clipped_samples']} samples hit the maximum level.", {"look": "fix_clipping"})
    if p["hum"]:
        add("hum", 3, f"Electrical hum at {p['hum']['mains_hz']} Hz", "A steady buzz under the recording.",
            {"effects": [{"type": "hum_removal", "params": {"mains": str(p["hum"]["mains_hz"]), "depth": 25}}]})
    if p["snr_db"] < 30:
        add("noise", 3 if p["snr_db"] < 20 else 2, "Background noise is noticeable",
            f"Speech is only {p['snr_db']:.0f} dB above the noise.", {"look": "remove_noise"})
    if p["echo"] and p["echo"]["level"] == "high":
        add("echo", 2, "Room echo", "The room rings after words end.", {"look": "less_echo"})
    lufs = p["loudness_lufs"]
    if lufs < -24:
        add("quiet", 2, "Too quiet", f"{lufs:.1f} LUFS — podcasts usually sit around −16.", {"look": "podcast_ready"})
    elif lufs > -11:
        add("loud", 2, "Very loud", f"{lufs:.1f} LUFS — streaming platforms will turn it down.", {"look": "spotify_ready"})
    if p["loudness_range_lu"] > 12:
        add("uneven", 2, "Volume jumps around", f"Loudness range {p['loudness_range_lu']:.0f} LU.", {"look": "balance_volume"})
    if dev["low"] > 5 or dev["sub"] > 6:
        add("boomy", 1, "Boomy low end", "More bass than a typical clear voice.", {"look": "less_boomy"})
    elif dev["low"] < -7:
        add("thin", 1, "Thin voice", "Less body than a typical voice.", {"look": "fuller"})
    if dev["low_mid"] > 4:
        add("muddy", 1, "A little muddy", "Build-up around 250–500 Hz.", {"look": "less_muddy"})
    if dev["presence"] < -6:
        add("dull", 1, "Dull / muffled", "Not much clarity range.", {"look": "clearer"})
    elif dev["presence"] > 6:
        add("harsh", 1, "Harsh", "Strong upper mids can tire the ear.", {"look": "less_harsh"})
    if dev["sibilance"] > 6:
        add("sibilant", 1, "Sharp S sounds", "Strong energy at 5–9 kHz.", {"look": "tame_s"})
    if p["pace"] and p["pace"]["long_pauses"] >= 3:
        add("pauses", 1, f"{p['pace']['long_pauses']} long pauses", "Pauses over 1.2 s can be tightened.",
            {"edit": {"type": "trim_gaps", "max_gap": 0.7}})
    out.sort(key=lambda f: -f["severity"])
    return out


def summary_for_ai(p: Optional[dict]) -> str:
    if not p:
        return "No analysis yet."
    parts = [
        f"Loudness {p['loudness_lufs']} LUFS, true peak {p['true_peak_db']} dBTP, range {p['loudness_range_lu']} LU.",
        f"Noise floor {p['noise_floor_db']} dB, speech-to-noise {p['snr_db']} dB.",
        "Tone vs typical voice (dB, + = more than usual): " + ", ".join(
            f"{k} {p['bands_vs_mid_db'][k] - REFERENCE[k]:+.0f}" for k in REFERENCE),
    ]
    if p.get("pitch"):
        parts.append(f"Speaking pitch ~{p['pitch']['median_hz']} Hz ({p['pitch']['voice_type']}).")
    if p.get("hum"):
        parts.append(f"Hum detected at {p['hum']['mains_hz']} Hz.")
    if p.get("echo"):
        parts.append(f"Room echo {p['echo']['level']}.")
    if p.get("findings"):
        parts.append("Issues: " + "; ".join(f["title"] for f in p["findings"]))
    return " ".join(parts)
