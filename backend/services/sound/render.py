"""Render a sound document onto audio.

Order of work:
  1. character sliders → extra effect entries (derive_character)
  2. Natural ↔ Effect intensity scales every parameter toward neutral
  3. effects run in registry stage order; consecutive ffmpeg effects with no
     time scope are batched into one ffmpeg call
  4. scoped effects process only their time range and crossfade back in
  5. layers (music bed, intro, outro, sfx) are mixed in, ducked under speech
  6. master: loudness target (or match the original's loudness) + limiter

Everything is deterministic: the same document on the same audio gives the
same output, which is what makes preview/apply/undo honest.
"""
import copy
import math
from typing import Callable, Dict, List, Optional

import numpy as np

from services.sound import dsp
from services.sound.dsp import SR
from services.sound.registry import EFFECTS_BY_TYPE, PLATFORM_LUFS, normalize_doc


class RenderError(RuntimeError):
    pass


# ── Character sliders → effects ───────────────────────────────────────

def derive_character(character: dict) -> List[dict]:
    b = character.get("body", 0) / 100
    r = character.get("brightness", 0) / 100
    s = character.get("space", 0) / 100
    p = character.get("punch", 0) / 100
    t = character.get("pitch", 0) / 100
    out: List[dict] = []

    def add(type_, **params):
        out.append({"type": type_, "params": params, "source": "character", "enabled": True, "scope": None})

    formant = 0.0
    if b < 0:
        a = -b
        add("high_pass", frequency=40 + 160 * a, slope=12)
        add("low_shelf", frequency=250, gain=-6 * a)
        formant += 1.2 * a
    elif b > 0:
        add("low_shelf", frequency=160, gain=5 * b)
        formant -= 0.8 * b
    if r:
        add("presence", frequency=3500, gain=4 * r, q=1.0)
        add("high_shelf", frequency=7500, gain=6 * r)
        if r < -0.5:
            add("low_pass", frequency=20000 - (abs(r) - 0.5) * 2 * 12000, slope=12)
    if s > 0:
        add("reverb", room_size=30 + 55 * s, mix=8 + 30 * s, damping=50, pre_delay=15, width=100)
    elif s < 0:
        a = -s
        add("low_shelf", frequency=180, gain=2.5 * a)
        add("compressor", threshold=-20, ratio=1 + 1.5 * a, attack=15, release=150, knee=2.8, makeup=0)
    if p > 0:
        add("compressor", threshold=-18 - 8 * p, ratio=1.5 + 4.5 * p, attack=12, release=120, knee=2.8, makeup=0)
        add("presence", frequency=3000, gain=2 * p, q=1.0)
    elif p < 0:
        a = -p
        add("high_shelf", frequency=6000, gain=-3 * a)
        add("de_esser", amount=40 * a, frequency=6000)
    if t or formant:
        add("pitch", semitones=4 * t, formant=formant, cents=0)
    return out


def _scale_toward_neutral(effect: dict, k: float) -> dict:
    if k >= 0.999:
        return effect
    spec = EFFECTS_BY_TYPE[effect["type"]]
    params = dict(effect["params"])
    for p in spec["params"]:
        if p["type"] in ("float", "int") and "neutral" in p and p["key"] in params:
            params[p["key"]] = p["neutral"] + (params[p["key"]] - p["neutral"]) * k
    return {**effect, "params": params}


def effective_chain(doc: dict) -> List[dict]:
    """The full ordered list of effects that will run, including derived ones."""
    doc = normalize_doc(doc)
    explicit = [e for e in doc["effects"] if e.get("enabled", True)]
    derived = derive_character(doc["character"])
    # One pitch stage: fold the character's pitch/formant into an explicit one.
    explicit_pitch = next((e for e in explicit if e["type"] == "pitch" and not e.get("scope")), None)
    if explicit_pitch:
        for d in [d for d in derived if d["type"] == "pitch"]:
            explicit_pitch = explicit_pitch
            explicit_pitch["params"] = {
                **explicit_pitch["params"],
                "semitones": explicit_pitch["params"]["semitones"] + d["params"]["semitones"],
                "formant": explicit_pitch["params"]["formant"] + d["params"]["formant"],
            }
            derived.remove(d)
    chain = derived + explicit
    k = doc["character"].get("intensity", 100) / 100
    chain = [_scale_toward_neutral(e, k) for e in chain]
    chain.sort(key=lambda e: (EFFECTS_BY_TYPE[e["type"]]["stage"], 0 if e.get("source") == "character" else 1))
    return chain


# ── ffmpeg filter strings ─────────────────────────────────────────────

def _passes(kind: str, freq: float, slope) -> str:
    slope = int(slope)
    if slope <= 6:
        return f"{kind}=f={freq:.1f}:p=1"
    return ",".join([f"{kind}=f={freq:.1f}:p=2"] * {12: 1, 24: 2, 36: 3, 48: 4}.get(slope, 1))


def _lin(dbv: float) -> float:
    return 10 ** (dbv / 20)


def ff_graph(e: dict) -> Optional[str]:
    t, p = e["type"], e["params"]
    if t == "declip":
        return f"adeclip=t={max(1, 30 - 0.28 * p['sensitivity']):.1f}"
    if t == "declick":
        return f"adeclick=w={p['window']:.0f}:t={max(1, 10 - 0.09 * p['sensitivity']):.2f}"
    if t == "hum_removal":
        if p["depth"] <= 0.1:
            return None
        base = float(p["mains"])
        return ",".join(f"equalizer=f={base * k:.1f}:t=q:w={p['q']:.1f}:g={-p['depth']:.1f}"
                        for k in range(1, int(p["harmonics"]) + 1) if base * k < 18000)
    if t == "noise_reduction":
        if p["amount"] <= 0.05:
            return None
        return f"afftdn=nr={max(0.01, p['amount']):.2f}:nf={p['noise_floor']:.0f}:tn={1 if p['track_noise'] else 0}"
    if t == "noise_gate":
        if p["reduction"] <= 0.1:
            return None
        return (f"agate=threshold={_lin(p['threshold']):.6f}:range={_lin(-p['reduction']):.6f}"
                f":attack={p['attack']:.1f}:release={p['release']:.1f}:ratio=4")
    if t == "de_esser":
        if p["amount"] <= 0.5:
            return None
        return f"deesser=i={p['amount'] / 100:.3f}:m=0.5:f={min(1, max(0, (p['frequency'] - 3000) / 7000)):.3f}"
    if t == "high_pass":
        return _passes("highpass", p["frequency"], p["slope"]) if p["frequency"] > 20.5 else None
    if t == "low_pass":
        return _passes("lowpass", p["frequency"], p["slope"]) if p["frequency"] < 19950 else None
    if t == "band_pass":
        lo, hi = sorted((p["low"], p["high"]))
        return f"highpass=f={lo:.0f}:p=2,highpass=f={lo:.0f}:p=2,lowpass=f={hi:.0f}:p=2,lowpass=f={hi:.0f}:p=2"
    if t == "notch":
        return f"equalizer=f={p['frequency']:.1f}:t=q:w={p['q']:.2f}:g={-p['depth']:.1f}" if p["depth"] > 0.1 else None
    if t == "low_shelf":
        return f"lowshelf=f={p['frequency']:.0f}:g={p['gain']:.2f}" if abs(p["gain"]) > 0.05 else None
    if t == "high_shelf":
        return f"highshelf=f={p['frequency']:.0f}:g={p['gain']:.2f}" if abs(p["gain"]) > 0.05 else None
    if t in ("mud_cut", "presence"):
        return f"equalizer=f={p['frequency']:.0f}:t=q:w={p['q']:.2f}:g={p['gain']:.2f}" if abs(p["gain"]) > 0.05 else None
    if t == "bass_treble":
        parts = []
        if abs(p["bass"]) > 0.05:
            parts.append(f"bass=g={p['bass']:.2f}:f=110")
        if abs(p["treble"]) > 0.05:
            parts.append(f"treble=g={p['treble']:.2f}:f=3500")
        return ",".join(parts) or None
    if t == "parametric_eq":
        parts = [f"equalizer=f={p[f'b{i}_freq']:.0f}:t=q:w={p[f'b{i}_q']:.2f}:g={p[f'b{i}_gain']:.2f}"
                 for i in range(1, 6) if abs(p[f"b{i}_gain"]) > 0.05]
        return ",".join(parts) or None
    if t == "graphic_eq":
        parts = [f"equalizer=f={k[1:]}:t=o:w=0.33:g={v:.2f}" for k, v in p.items() if abs(v) > 0.05]
        return ",".join(parts) or None
    if t == "exciter":
        return (f"aexciter=amount={max(0.01, p['amount'] / 25):.3f}:drive=6:blend=0:freq={p['frequency']:.0f}"
                if p["amount"] > 0.5 else None)
    if t == "compressor":
        if p["ratio"] <= 1.02:
            return None
        return (f"acompressor=threshold={max(0.001, _lin(p['threshold'])):.6f}:ratio={p['ratio']:.2f}"
                f":attack={max(0.01, p['attack']):.2f}:release={p['release']:.1f}:knee={p['knee']:.2f}"
                f":makeup={max(1, _lin(p['makeup'])):.4f}")
    if t == "auto_level":
        if p["amount"] <= 0.5:
            return None
        e_ = max(1.0, _lin(p["max_boost"] * p["amount"] / 100))
        return f"speechnorm=e={e_:.3f}:c={e_:.3f}:r=0.0005:f=0.001:p=0.9:l=1"
    if t == "multiband":
        bands = []
        for amt, xover in ((p["low"], 250), (p["mid"], 3000), (p["high"], 22000)):
            r = 1 + 3 * amt / 100
            out = -30 + 30 / r
            makeup = (30 - 30 / r) * 0.45
            bands.append(f"0.005,0.15 6 -90/-90,-30/-30,0/{out:.1f} {xover} 0 0 {makeup:.1f}")
        return "mcompand=" + "'" + " | ".join(bands) + "'"
    if t == "gain":
        return f"volume={p['gain']:.2f}dB" if abs(p["gain"]) > 0.05 else None
    if t == "flanger":
        return (f"flanger=delay=0:depth={p['depth']:.2f}:regen={p['feedback']:.0f}:speed={p['speed']:.2f}"
                if p["depth"] > 0.05 else None)
    if t == "tremolo":
        return f"tremolo=f={p['rate']:.2f}:d={min(1, p['depth'] / 100):.3f}" if p["depth"] > 0.5 else None
    if t == "vibrato":
        return f"vibrato=f={p['rate']:.2f}:d={min(1, p['depth'] / 100):.3f}" if p["depth"] > 0.5 else None
    if t == "stereo_width":
        return f"extrastereo=m={p['width'] / 100:.3f}:c=0" if abs(p["width"] - 100) > 0.5 else None
    if t == "speed":
        r = p["rate"]
        return f"asetrate={SR * r:.0f},aresample={SR}" if abs(r - 1) > 0.005 else None
    if t == "limiter":
        return None  # applied in the master stage
    return None


# Effects that ffmpeg renders but that need wet/dry or special handling.
ROBOT = "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=1024:overlap=0.75"
WHISPER = ("afftfilt=real='hypot(re,im)*cos((random(0)*2-1)*2*3.14)'"
           ":imag='hypot(re,im)*sin((random(1)*2-1)*2*3.14)':win_size=128:overlap=0.8")
SATURATION_TYPES = {"tape": "tanh", "tube": "atan", "soft": "alg", "hard": "hard"}


def _pb(x: np.ndarray, plugin) -> np.ndarray:
    return plugin(x, SR, reset=True).astype(np.float32)


def run_effect(x: np.ndarray, e: dict, ctx: dict) -> np.ndarray:
    """Process one effect. ffmpeg-only effects are handled by the batcher."""
    import pedalboard as pb

    t, p = e["type"], e["params"]
    if t == "voice_isolation":
        iso = ctx.get("isolated")
        if iso is None:
            raise RenderError("Voice isolation needs the AI-isolated audio, which isn't available")
        iso = dsp.fit_length(iso, x.shape[1]) if iso.shape[1] != x.shape[1] else iso
        target = iso + (x - iso) * (p["background"] / 100)
        return dsp.mix(x, target, p["strength"] / 100)
    if t == "declip":
        return _declip(x, p)
    if t == "breath_reduction":
        return _breath_reduction(x, p, ctx.get("words") or [])
    if t == "pitch":
        semis = p["semitones"] + p["cents"] / 100
        formant = p["formant"]
        if abs(semis) < 0.01 and abs(formant) < 0.01:
            return x
        hq = not ctx.get("preview", False)
        y = x
        if abs(formant) >= 0.01:
            # Rubber Band shifts formants only along with pitch. Shift by the
            # formant amount without preserving them, then shift the note back
            # to the requested pitch preserving them: net formant moves alone.
            y = pb.time_stretch(y, SR, 1.0, pitch_shift_in_semitones=formant,
                                high_quality=hq, preserve_formants=False)
            y = pb.time_stretch(y, SR, 1.0, pitch_shift_in_semitones=semis - formant,
                                high_quality=hq, preserve_formants=True)
        else:
            y = pb.time_stretch(y, SR, 1.0, pitch_shift_in_semitones=semis,
                                high_quality=hq, preserve_formants=True)
        return dsp.fit_length(y.astype(np.float32), x.shape[1])
    if t == "tempo":
        if abs(p["rate"] - 1) < 0.005:
            return x
        return pb.time_stretch(x, SR, p["rate"], high_quality=not ctx.get("preview", False),
                               preserve_formants=True).astype(np.float32)
    if t == "saturation":
        if p["drive"] <= 0.05:
            return x
        kind = SATURATION_TYPES.get(p["character"], "tanh")
        wet = dsp.ff(x, f"volume={p['drive']:.2f}dB,asoftclip=type={kind},volume={-p['drive'] * 0.85:.2f}dB")
        return dsp.mix(x, wet, p["mix"] / 100)
    if t == "distortion":
        wet = _pb(x, pb.Pedalboard([pb.Distortion(drive_db=p["drive"]), pb.Gain(gain_db=-p["drive"] * 0.6)]))
        return dsp.mix(x, wet, p["mix"] / 100)
    if t == "bitcrush":
        chain = [pb.Bitcrush(bit_depth=float(p["bits"]))]
        if p["rate"] < SR - 50:
            chain.append(pb.Resample(target_sample_rate=float(p["rate"]), quality=pb.Resample.Quality.ZeroOrderHold))
        return dsp.mix(x, _pb(x, pb.Pedalboard(chain)), p["mix"] / 100)
    if t == "robot":
        wet = dsp.ff(x, ROBOT)
        if p["buzz"] > 0.5:
            tt = np.arange(x.shape[1], dtype=np.float32) / SR
            ring = x * np.sin(2 * math.pi * 55 * tt)
            wet = wet * (1 - p["buzz"] / 250) + ring * (p["buzz"] / 150)
        return dsp.mix(x, wet, p["mix"] / 100)
    if t == "whisper":
        return dsp.mix(x, dsp.ff(x, WHISPER) * 1.4, p["mix"] / 100)
    if t == "chorus":
        return _pb(x, pb.Chorus(rate_hz=p["rate"], depth=p["depth"] / 100, centre_delay_ms=p["delay"],
                                feedback=0.0, mix=p["mix"] / 100))
    if t == "phaser":
        return _pb(x, pb.Phaser(rate_hz=p["rate"], depth=p["depth"] / 100, centre_frequency_hz=1300,
                                feedback=p["feedback"] / 100, mix=p["mix"] / 100))
    if t == "reverse":
        return x[:, ::-1].copy()
    if t == "reverb":
        m = p["mix"] / 100
        if m <= 0.005:
            return x
        delay = int(SR * p["pre_delay"] / 1000)
        src = np.pad(x, ((0, 0), (delay, 0)))[:, :x.shape[1]] if delay else x
        wet = _pb(src, pb.Reverb(room_size=p["room_size"] / 100, damping=p["damping"] / 100,
                                 wet_level=1.0, dry_level=0.0, width=p["width"] / 100))
        return x * (1 - 0.45 * m) + wet * m
    if t == "echo":
        if p["mix"] <= 0.5:
            return x
        return _pb(x, pb.Delay(delay_seconds=p["time"], feedback=min(0.95, p["feedback"] / 100), mix=p["mix"] / 100))
    if t in ("fade_in", "fade_out"):
        return _fade(x, p, t == "fade_in")
    if t in ("loudness", "limiter"):
        return x  # master stage
    graph = ff_graph(e)
    if not graph:
        return x
    return dsp.ff(x, graph, keep_length=not EFFECTS_BY_TYPE[t].get("changes_duration"))


def _declip(x: np.ndarray, p: dict) -> np.ndarray:
    """Repair only around clipped runs — ffmpeg's adeclip is far too slow to
    run over a whole episode."""
    peak = float(np.max(np.abs(x))) if x.size else 0.0
    if peak < 0.5:
        return x
    thr = peak * (0.995 - 0.0004 * p["sensitivity"])
    hits = np.flatnonzero(np.max(np.abs(x), axis=0) >= thr)
    if hits.size < 3:
        return x
    pad = int(0.05 * SR)
    regions = []
    for h in hits:
        if regions and h - pad <= regions[-1][1]:
            regions[-1][1] = h + pad
        else:
            regions.append([max(0, h - pad), h + pad])
    y = x.copy()
    graph = ff_graph({"type": "declip", "params": p})
    for a, b in regions[:400]:
        b = min(b, x.shape[1])
        y[:, a:b] = dsp.ff(x[:, a:b], graph)
    return y


def _curve(n: int, kind: str) -> np.ndarray:
    u = np.linspace(0, 1, n, dtype=np.float32)
    if kind == "linear":
        return u
    if kind == "exponential":
        return u ** 2.5
    if kind == "logarithmic":
        return np.sqrt(u)
    if kind == "s-curve":
        return u * u * (3 - 2 * u)
    return np.sin(u * math.pi / 2)  # smooth (equal-power)


def _fade(x: np.ndarray, p: dict, fade_in: bool) -> np.ndarray:
    n = min(x.shape[1], int(SR * p["duration"]))
    if n <= 1:
        return x
    y = x.copy()
    c = _curve(n, p["curve"])
    if fade_in:
        y[:, :n] *= c
    else:
        y[:, -n:] *= c[::-1]
    return y


def _breath_reduction(x: np.ndarray, p: dict, words: List[dict]) -> np.ndarray:
    """Attenuate the gaps between words (breaths, lip noise)."""
    if p["amount"] <= 0.1 or len(words) < 2:
        return x
    gain = np.ones(x.shape[1], dtype=np.float32)
    floor = dsp.db(-p["amount"])
    fade = int(SR * 0.03)
    guard = 0.04
    for a, b in zip(words, words[1:]):
        g0, g1 = a["end"] + guard, b["start"] - guard
        if g1 - g0 < p["min_gap"]:
            continue
        s, e = int(g0 * SR), int(g1 * SR)
        m = dsp.ramp_mask(x.shape[1], s, e, fade)
        gain = np.minimum(gain, 1 - m * (1 - floor))
    return x * gain


# ── Layers ────────────────────────────────────────────────────────────

def _speech_envelope(x: np.ndarray) -> np.ndarray:
    """0..1 'someone is talking' curve with attack/release smoothing."""
    hop = int(SR * 0.02)
    mono = np.abs(x).mean(axis=0)
    frames = mono[: (len(mono) // hop) * hop].reshape(-1, hop)
    rms = np.sqrt(np.mean(frames ** 2, axis=1)) if frames.size else np.zeros(1)
    lvl = 20 * np.log10(np.maximum(rms, 1e-7))
    thr = np.percentile(lvl, 60) - 12 if lvl.size else -40
    active = (lvl > thr).astype(np.float32)
    env = np.zeros_like(active)
    a_att, a_rel = 0.5, 0.06  # per 20 ms frame
    v = 0.0
    for i, on in enumerate(active):
        v += (on - v) * (a_att if on > v else a_rel)
        env[i] = v
    env = np.repeat(env, hop)
    return dsp.fit_length(env[None, :], x.shape[1])[0]


def mix_layers(voice: np.ndarray, layers: List[dict], decoded: Dict[str, np.ndarray]) -> np.ndarray:
    active = [l for l in layers if l.get("enabled", True) and l["url"] in decoded]
    if not active:
        return voice
    n = voice.shape[1]
    out = voice.copy()
    env = None
    for l in active:
        src = decoded[l["url"]]
        if src.size == 0:
            continue
        if l["kind"] == "outro":
            start = max(0, n - src.shape[1])
        else:
            start = int(l["start"] * SR)
        if start >= n:
            continue
        length = n - start
        if l["loop"] and src.shape[1] < length:
            reps = int(math.ceil(length / src.shape[1]))
            src = np.tile(src, (1, reps))
        seg = src[:, :length].copy()
        k = seg.shape[1]
        if l["fade_in"] > 0:
            f = min(k, int(SR * l["fade_in"]))
            seg[:, :f] *= _curve(f, "smooth")
        if l["fade_out"] > 0:
            f = min(k, int(SR * l["fade_out"]))
            seg[:, k - f:] *= _curve(f, "smooth")[::-1]
        seg *= dsp.db(l["volume"])
        if l["pan"]:
            pan = l["pan"] / 100
            seg[0] *= math.cos((pan + 1) * math.pi / 4) * math.sqrt(2)
            seg[1] *= math.sin((pan + 1) * math.pi / 4) * math.sqrt(2)
        if l["duck"] > 0:
            if env is None:
                env = _speech_envelope(voice)
            g = 1 - env[start:start + k] * (1 - dsp.db(-l["duck"]))
            seg *= g
        out[:, start:start + k] += seg
    return out


# ── Main entry ────────────────────────────────────────────────────────

def render(
    x: np.ndarray,
    doc: dict,
    *,
    words: Optional[List[dict]] = None,
    isolated: Optional[np.ndarray] = None,
    layers_audio: Optional[Dict[str, np.ndarray]] = None,
    preview: bool = False,
    reference_lufs: Optional[float] = None,
    progress: Optional[Callable[[str], None]] = None,
) -> dict:
    """Apply `doc` to `x`. Returns {"audio", "duration_factor", "chain"}."""
    doc = normalize_doc(doc)
    chain = effective_chain(doc)
    ctx = {"words": words or [], "isolated": isolated, "preview": preview}
    y = x
    duration_factor = 1.0

    batch: List[str] = []

    def flush():
        nonlocal y
        if batch:
            y = dsp.ff(y, ",".join(batch))
            batch.clear()

    for e in chain:
        spec = EFFECTS_BY_TYPE[e["type"]]
        if spec.get("changes_duration"):
            if e.get("scope"):
                continue  # can't change the length of just part of a file
            flush()
            before = y.shape[1]
            y = run_effect(y, e, ctx)
            if before:
                duration_factor *= y.shape[1] / before
            # Word timings move with the audio.
            if ctx["words"] and before:
                f = y.shape[1] / before
                ctx["words"] = [{**w, "start": w["start"] * f, "end": w["end"] * f} for w in ctx["words"]]
            if ctx["isolated"] is not None and before:
                ctx["isolated"] = None  # isolation must come before tempo anyway (stage order)
            continue
        graph = ff_graph(e) if spec["engine"] == "ff" and e["type"] not in ("robot", "whisper", "saturation") else None
        if graph and not e.get("scope"):
            batch.append(graph)
            continue
        flush()
        if e.get("scope"):
            y = _run_scoped(y, e, ctx)
        else:
            y = run_effect(y, e, ctx)
        if progress:
            progress(spec["label"])
    flush()

    if layers_audio is not None and doc["layers"]:
        y = mix_layers(y, doc["layers"], layers_audio)

    # Master: loudness target, or keep the original loudness so "brighter"
    # never just means "louder", then a limiter on every render.
    loud_e = next((e for e in chain if e["type"] == "loudness"), None)
    lim_e = next((e for e in chain if e["type"] == "limiter"), None)
    target = None
    if loud_e:
        plat = loud_e["params"].get("platform")
        target = PLATFORM_LUFS.get(plat, loud_e["params"]["target"]) if plat and plat != "custom" else loud_e["params"]["target"]
    elif doc["match_loudness"] and reference_lufs is not None and chain:
        target = reference_lufs
    if target is not None and y.size:
        measured = dsp.loudness(y)["lufs"]
        if measured > -69:
            y = y * dsp.db(max(-30.0, min(30.0, target - measured)))
    ceiling = lim_e["params"]["ceiling"] if lim_e else -1.0
    release = lim_e["params"]["release"] if lim_e else 50
    peak = float(np.max(np.abs(y))) if y.size else 0.0
    if peak > dsp.db(ceiling) or lim_e:
        y = dsp.ff(y, f"alimiter=limit={dsp.db(ceiling):.5f}:attack=5:release={release:.0f}:level=0")
    y = np.clip(y, -1.0, 1.0)
    return {"audio": y.astype(np.float32), "duration_factor": duration_factor, "chain": chain, "words": ctx["words"]}


def _run_scoped(x: np.ndarray, e: dict, ctx: dict) -> np.ndarray:
    """Process [start, end) only (with margins so filters settle) and blend it back."""
    n = x.shape[1]
    s, t = int(e["scope"]["start"] * SR), int(e["scope"]["end"] * SR)
    s, t = max(0, min(s, n)), max(0, min(t, n))
    if t - s < int(0.02 * SR):
        return x
    margin = int(0.5 * SR)
    a, b = max(0, s - margin), min(n, t + margin)
    seg = x[:, a:b]
    if e["type"] == "reverse":
        out = x.copy()
        out[:, s:t] = x[:, s:t][:, ::-1]
        m = dsp.ramp_mask(n, s, t, int(0.01 * SR))
        return x * (1 - m) + out * m
    words = [w for w in ctx["words"] if w["end"] > a / SR and w["start"] < b / SR]
    sub_ctx = {**ctx, "words": [{**w, "start": w["start"] - a / SR, "end": w["end"] - a / SR} for w in words]}
    if ctx.get("isolated") is not None:
        sub_ctx["isolated"] = ctx["isolated"][:, a:b]
    wet_seg = dsp.fit_length(run_effect(seg, e, sub_ctx), seg.shape[1])
    wet = x.copy()
    wet[:, a:b] = wet_seg
    m = dsp.ramp_mask(n, s, t, int(0.03 * SR))
    return x * (1 - m) + wet * m


def describe_chain(chain: List[dict]) -> List[str]:
    """Human-readable list of what will run (for the Advanced view and the AI)."""
    lines = []
    for e in chain:
        spec = EFFECTS_BY_TYPE[e["type"]]
        shown = []
        for p in spec["params"]:
            if not p.get("simple"):
                continue
            v = e["params"].get(p["key"])
            if isinstance(v, float):
                v = round(v, 1)
            shown.append(f"{p['label']} {v}{p.get('unit', '')}")
        src = " (from character)" if e.get("source") == "character" else ""
        scope = f" [{e['scope']['start']:.1f}–{e['scope']['end']:.1f}s]" if e.get("scope") else ""
        lines.append(f"{spec['label']}{src}{scope}: " + ", ".join(shown[:4]))
    return lines
