"""Every effect the engine can apply, described once.

Each effect lists its parameters with range, default, unit and a *neutral*
value (the setting at which it does nothing). The neutral value powers the
global Natural ↔ Effect slider, which scales every parameter toward it.

`stage` fixes the processing order — clean → pitch/time → tone → dynamics →
creative → space → fades → master — so however many prompts a user sends,
the chain stays one predictable list. Parameters flagged `simple` are the
ones shown in Simple mode; Pro mode shows all of them.

`notes` are written for the AI: what the effect does to a voice, in the
words people use to ask for it.
"""
from typing import Dict, List, Optional


def P(key, label, lo, hi, default, unit="", step=None, neutral=None, simple=False, kind="float", options=None):
    p = {
        "key": key, "label": label, "type": kind, "min": lo, "max": hi,
        "default": default, "unit": unit,
        "step": step if step is not None else (1 if kind == "int" else round((hi - lo) / 200, 4) if hi is not None else 1),
        "simple": simple,
    }
    if neutral is not None:
        p["neutral"] = neutral
    if options is not None:
        p["options"] = options
    return p


def C(key, label, options, default, simple=False):
    return {"key": key, "label": label, "type": "choice", "options": options, "default": default, "simple": simple}


def B(key, label, default, simple=False):
    return {"key": key, "label": label, "type": "bool", "default": default, "simple": simple}


SLOPES = [6, 12, 24, 36, 48]
CURVES = ["linear", "smooth", "exponential", "logarithmic", "s-curve"]

GROUPS = [
    {"id": "clean", "label": "Clean & repair"},
    {"id": "pitch", "label": "Pitch & speed"},
    {"id": "tone", "label": "Tone & EQ"},
    {"id": "dynamics", "label": "Volume & dynamics"},
    {"id": "creative", "label": "Creative & character"},
    {"id": "space", "label": "Space & echo"},
    {"id": "fades", "label": "Fades & time"},
    {"id": "master", "label": "Final loudness"},
]

GRAPHIC_BANDS = [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800,
                 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000]
PEQ_DEFAULTS = [(100, 0.9), (300, 1.2), (1000, 1.0), (3000, 1.0), (8000, 0.8)]


EFFECTS: List[dict] = [
    # ── Clean & repair ───────────────────────────────────────────────
    {"type": "voice_isolation", "label": "Voice isolation", "group": "clean", "stage": 10, "engine": "ai",
     "description": "AI separates the voice from everything else, then mixes back as much background as you want.",
     "notes": "Removes fans, AC, traffic, music and a lot of room echo. 'clean up', 'remove background', 'studio sound', 'enhance speech'. Costs AI credits (ElevenLabs).",
     "params": [P("strength", "Strength", 0, 100, 80, "%", 1, neutral=0, simple=True),
                P("background", "Keep background", 0, 100, 5, "%", 1, simple=True)]},
    {"type": "declip", "label": "Clip repair", "group": "clean", "stage": 11, "engine": "ff",
     "description": "Rebuilds peaks that were flattened because the recording was too loud.",
     "notes": "Fixes crunchy, distorted, 'too loud mic' recordings.",
     "params": [P("sensitivity", "Sensitivity", 1, 100, 40, "%", 1, simple=True)]},
    {"type": "declick", "label": "Click removal", "group": "clean", "stage": 12, "engine": "ff",
     "description": "Finds short clicks and pops — mouth clicks, lip smacks, crackle — and smooths them out.",
     "notes": "'mouth clicks', 'lip smacks', 'crackle', 'pops'.",
     "params": [P("sensitivity", "Sensitivity", 1, 100, 40, "%", 1, simple=True),
                P("window", "Window", 10, 100, 55, "ms", 1)]},
    {"type": "hum_removal", "label": "Hum removal", "group": "clean", "stage": 13, "engine": "ff",
     "description": "Notches out electrical hum (50 or 60 Hz) and its harmonics.",
     "notes": "'buzz', 'hum', 'electrical noise', 'ground loop'. Use 50 Hz for Europe/Asia/India, 60 Hz for the Americas; analysis detects it.",
     "params": [C("mains", "Mains frequency", ["50", "60"], "50", simple=True),
                P("harmonics", "Harmonics", 1, 8, 4, "", 1, kind="int"),
                P("depth", "Depth", 0, 40, 25, "dB", 1, neutral=0, simple=True),
                P("q", "Narrowness", 1, 60, 30, "Q", 1)]},
    {"type": "noise_reduction", "label": "Noise reduction", "group": "clean", "stage": 14, "engine": "ff",
     "description": "Spectral noise reduction for steady hiss and hum, without AI.",
     "notes": "'hiss', 'static', 'fan noise' when voice isolation isn't wanted. Too much sounds watery.",
     "params": [P("amount", "Amount", 0, 40, 12, "dB", 0.5, neutral=0, simple=True),
                P("noise_floor", "Noise floor", -80, -20, -50, "dB", 1),
                B("track_noise", "Adapt to changing noise", True)]},
    {"type": "noise_gate", "label": "Noise gate", "group": "clean", "stage": 15, "engine": "ff",
     "description": "Turns the audio down whenever nobody is speaking, so gaps go quiet.",
     "notes": "'silence the gaps', 'remove noise between sentences'. Too aggressive cuts word endings.",
     "params": [P("threshold", "Threshold", -80, -10, -45, "dB", 1, simple=True),
                P("reduction", "Reduction", 0, 60, 20, "dB", 1, neutral=0, simple=True),
                P("attack", "Attack", 1, 200, 10, "ms", 1),
                P("release", "Release", 10, 2000, 200, "ms", 10)]},
    {"type": "breath_reduction", "label": "Breath reduction", "group": "clean", "stage": 16, "engine": "np",
     "description": "Lowers the gaps between words (breaths, lip noise) using the transcript timing.",
     "notes": "'remove breaths', 'less breathing', 'quieter gaps'. Needs a transcript.",
     "params": [P("amount", "Amount", 0, 30, 12, "dB", 1, neutral=0, simple=True),
                P("min_gap", "Min gap", 0.1, 1.5, 0.25, "s", 0.05)]},
    {"type": "de_esser", "label": "De-esser", "group": "clean", "stage": 17, "engine": "ff",
     "description": "Tames sharp S, SH and T sounds.",
     "notes": "'harsh S sounds', 'sibilance', 'hissy S', 'sharp'.",
     "params": [P("amount", "Amount", 0, 100, 50, "%", 1, neutral=0, simple=True),
                P("frequency", "Frequency", 3000, 10000, 6000, "Hz", 100)]},

    # ── Pitch & speed ────────────────────────────────────────────────
    {"type": "pitch", "label": "Pitch & formant", "group": "pitch", "stage": 20, "engine": "pb",
     "description": "Moves the voice higher or lower. Formant changes the size of the voice (thin/small vs. big/deep) separately from the note.",
     "notes": "'higher', 'lower', 'deeper', 'thinner', 'younger', 'chipmunk', 'monster'. Keep pitch within ±3 semitones for natural results; formant +1..+2 sounds smaller/thinner, −1..−2 bigger/deeper.",
     "params": [P("semitones", "Pitch", -12, 12, 0, "st", 0.1, neutral=0, simple=True),
                P("formant", "Formant", -6, 6, 0, "st", 0.1, neutral=0, simple=True),
                P("cents", "Fine tune", -100, 100, 0, "ct", 1, neutral=0)]},
    {"type": "tempo", "label": "Tempo", "group": "pitch", "stage": 21, "engine": "pb", "changes_duration": True,
     "description": "Faster or slower speech without changing the pitch.",
     "notes": "'speed up', 'talk faster', 'slow down'. Changes the length; not available on video projects.",
     "params": [P("rate", "Speed", 0.5, 2.0, 1.0, "×", 0.01, neutral=1.0, simple=True)]},
    {"type": "speed", "label": "Tape speed", "group": "pitch", "stage": 22, "engine": "np", "changes_duration": True,
     "description": "Speeds up or slows down like a tape — pitch moves with speed.",
     "notes": "'chipmunk', 'slowed down', 'vinyl slow-down'. Changes length; not available on video projects.",
     "params": [P("rate", "Speed", 0.5, 2.0, 1.0, "×", 0.01, neutral=1.0, simple=True)]},

    # ── Tone & EQ ────────────────────────────────────────────────────
    {"type": "high_pass", "label": "Low cut (high-pass)", "group": "tone", "stage": 30, "engine": "ff",
     "description": "Removes everything below a frequency.",
     "notes": "60–90 Hz removes rumble with no audible change to a voice; 120–200 Hz makes a voice thinner/lighter; 300+ is telephone-like.",
     "params": [P("frequency", "Frequency", 20, 1000, 80, "Hz", 1, neutral=20, simple=True),
                C("slope", "Slope (dB/oct)", SLOPES, 12)]},
    {"type": "low_pass", "label": "High cut (low-pass)", "group": "tone", "stage": 31, "engine": "ff",
     "description": "Removes everything above a frequency.",
     "notes": "12–16 kHz trims hiss; 6–8 kHz sounds dull/muffled; 3–4 kHz is 'through a wall', telephone, underwater.",
     "params": [P("frequency", "Frequency", 1000, 20000, 16000, "Hz", 100, neutral=20000, simple=True),
                C("slope", "Slope (dB/oct)", SLOPES, 12)]},
    {"type": "band_pass", "label": "Band-pass", "group": "tone", "stage": 32, "engine": "ff",
     "description": "Keeps only a band of frequencies.",
     "notes": "300–3400 Hz = phone call; 500–3000 Hz = megaphone/walkie-talkie; 800–2500 Hz = old radio.",
     "params": [P("low", "Low edge", 50, 2000, 300, "Hz", 10, simple=True),
                P("high", "High edge", 1000, 12000, 3400, "Hz", 50, simple=True)]},
    {"type": "notch", "label": "Notch", "group": "tone", "stage": 33, "engine": "ff",
     "description": "Cuts one narrow frequency — a whine, whistle or resonance.",
     "notes": "Use for a single tone problem at a known frequency.",
     "params": [P("frequency", "Frequency", 20, 20000, 1000, "Hz", 1, simple=True),
                P("depth", "Depth", 0, 40, 20, "dB", 1, neutral=0, simple=True),
                P("q", "Narrowness", 0.5, 60, 10, "Q", 0.5)]},
    {"type": "low_shelf", "label": "Low shelf (body)", "group": "tone", "stage": 34, "engine": "ff",
     "description": "Boosts or cuts all the low end below a frequency.",
     "notes": "+ = fuller, warmer, deeper, bassier; − = thinner, lighter, less boomy.",
     "params": [P("frequency", "Frequency", 40, 600, 200, "Hz", 5, simple=True),
                P("gain", "Gain", -18, 18, 0, "dB", 0.5, neutral=0, simple=True)]},
    {"type": "mud_cut", "label": "Mud & boxiness", "group": "tone", "stage": 35, "engine": "ff",
     "description": "Cuts the low-mid build-up that makes voices muddy or boxy.",
     "notes": "'muddy', 'boxy', 'honky', 'cardboard', 'small room'. Cut 2–6 dB around 250–500 Hz.",
     "params": [P("frequency", "Frequency", 150, 800, 350, "Hz", 5, simple=True),
                P("gain", "Gain", -12, 6, -3, "dB", 0.5, neutral=0, simple=True),
                P("q", "Width", 0.3, 4, 1.2, "Q", 0.1)]},
    {"type": "presence", "label": "Presence", "group": "tone", "stage": 36, "engine": "ff",
     "description": "Lifts or lowers the clarity range where speech is understood.",
     "notes": "+ = clearer, more forward, cuts through music; − = softer, less harsh, more distant.",
     "params": [P("frequency", "Frequency", 1500, 7000, 3500, "Hz", 50, simple=True),
                P("gain", "Gain", -12, 12, 0, "dB", 0.5, neutral=0, simple=True),
                P("q", "Width", 0.3, 4, 1.0, "Q", 0.1)]},
    {"type": "high_shelf", "label": "High shelf (air)", "group": "tone", "stage": 37, "engine": "ff",
     "description": "Boosts or cuts all the top end above a frequency.",
     "notes": "+ = brighter, crisper, airy; − = darker, warmer, smoother, less hiss.",
     "params": [P("frequency", "Frequency", 2000, 16000, 8000, "Hz", 100, simple=True),
                P("gain", "Gain", -18, 18, 0, "dB", 0.5, neutral=0, simple=True)]},
    {"type": "bass_treble", "label": "Bass & treble", "group": "tone", "stage": 38, "engine": "ff",
     "description": "Simple two-knob tone control.",
     "notes": "Quick bass/treble moves when the user speaks in those words.",
     "params": [P("bass", "Bass", -18, 18, 0, "dB", 0.5, neutral=0, simple=True),
                P("treble", "Treble", -18, 18, 0, "dB", 0.5, neutral=0, simple=True)]},
    {"type": "parametric_eq", "label": "Parametric EQ", "group": "tone", "stage": 39, "engine": "ff",
     "description": "Five fully adjustable bands for precise shaping.",
     "notes": "For technical requests ('cut 2 dB at 400 Hz'). Each band: frequency, gain, width (Q).",
     "params": [p for i, (f, q) in enumerate(PEQ_DEFAULTS, 1) for p in (
         P(f"b{i}_freq", f"Band {i} freq", 20, 20000, f, "Hz", 1),
         P(f"b{i}_gain", f"Band {i} gain", -18, 18, 0, "dB", 0.5, neutral=0, simple=True),
         P(f"b{i}_q", f"Band {i} Q", 0.1, 10, q, "Q", 0.1))]},
    {"type": "graphic_eq", "label": "Graphic EQ (31-band)", "group": "tone", "stage": 40, "engine": "ff",
     "description": "One-third-octave faders from 20 Hz to 20 kHz.",
     "notes": "For detailed curves. Values in dB per band.",
     "params": [P(f"g{f}", f"{f if f < 1000 else str(f / 1000).rstrip('0').rstrip('.') + 'k'}", -12, 12, 0, "dB", 0.5, neutral=0)
                for f in GRAPHIC_BANDS]},
    {"type": "exciter", "label": "Exciter", "group": "tone", "stage": 41, "engine": "ff",
     "description": "Adds gentle high harmonics for sparkle and intelligibility.",
     "notes": "'more crisp', 'sparkle', 'expensive sound'. Subtle is best (10–30%).",
     "params": [P("amount", "Amount", 0, 100, 20, "%", 1, neutral=0, simple=True),
                P("frequency", "From", 2000, 12000, 6000, "Hz", 100)]},

    # ── Volume & dynamics ────────────────────────────────────────────
    {"type": "compressor", "label": "Compressor", "group": "dynamics", "stage": 50, "engine": "ff",
     "description": "Evens out loud and soft words so the voice sits steadily.",
     "notes": "'more consistent', 'punchier', 'radio', 'tighter'. Ratio 2–3 natural, 4–6 broadcast, 8+ squashed.",
     "params": [P("threshold", "Threshold", -60, 0, -20, "dB", 0.5, neutral=0, simple=True),
                P("ratio", "Ratio", 1, 20, 3, ":1", 0.1, neutral=1, simple=True),
                P("attack", "Attack", 0.1, 200, 10, "ms", 0.1),
                P("release", "Release", 10, 2000, 150, "ms", 5),
                P("knee", "Knee", 1, 8, 2.8, "", 0.1),
                P("makeup", "Make-up gain", 0, 24, 0, "dB", 0.5, neutral=0)]},
    {"type": "auto_level", "label": "Auto level", "group": "dynamics", "stage": 51, "engine": "ff",
     "description": "Rides the volume like an engineer so quiet and loud sentences come out similar.",
     "notes": "'balance the volume', 'some parts are too quiet', 'even out the levels'.",
     "params": [P("amount", "Amount", 0, 100, 50, "%", 1, neutral=0, simple=True),
                P("max_boost", "Max boost", 1, 30, 10, "dB", 0.5)]},
    {"type": "multiband", "label": "Multiband compressor", "group": "dynamics", "stage": 52, "engine": "ff",
     "description": "Compresses lows, mids and highs separately for a polished broadcast sound.",
     "notes": "'broadcast polish', 'radio-ready', 'professional'. Use moderately.",
     "params": [P("low", "Lows", 0, 100, 40, "%", 1, neutral=0, simple=True),
                P("mid", "Mids", 0, 100, 40, "%", 1, neutral=0, simple=True),
                P("high", "Highs", 0, 100, 40, "%", 1, neutral=0, simple=True)]},
    {"type": "gain", "label": "Volume", "group": "dynamics", "stage": 53, "engine": "ff",
     "description": "Turns the whole selection up or down.",
     "notes": "'louder', 'quieter' for a part of the audio. For overall loudness prefer Loudness.",
     "params": [P("gain", "Gain", -24, 24, 0, "dB", 0.5, neutral=0, simple=True)]},

    # ── Creative & character ─────────────────────────────────────────
    {"type": "saturation", "label": "Warmth / saturation", "group": "creative", "stage": 60, "engine": "ff",
     "description": "Soft analog-style saturation that thickens and warms.",
     "notes": "'analog', 'tape warmth', 'vintage', 'thicker'. Low drive is subtle; high drive becomes distortion.",
     "params": [C("character", "Character", ["tape", "tube", "soft", "hard"], "tape", simple=True),
                P("drive", "Drive", 0, 30, 6, "dB", 0.5, neutral=0, simple=True),
                P("mix", "Mix", 0, 100, 100, "%", 1, neutral=0)]},
    {"type": "distortion", "label": "Distortion", "group": "creative", "stage": 61, "engine": "pb",
     "description": "Gritty overdrive for megaphone, walkie-talkie, angry or lo-fi sounds.",
     "notes": "'megaphone', 'walkie-talkie', 'broken speaker', 'distorted'. Combine with band-pass.",
     "params": [P("drive", "Drive", 0, 50, 20, "dB", 0.5, neutral=0, simple=True),
                P("mix", "Mix", 0, 100, 100, "%", 1, neutral=0, simple=True)]},
    {"type": "bitcrush", "label": "Bitcrusher", "group": "creative", "stage": 62, "engine": "pb",
     "description": "Lo-fi digital degradation, like an old game console or bad stream.",
     "notes": "'8-bit', 'retro game', 'lo-fi', 'bad connection'.",
     "params": [P("bits", "Bit depth", 2, 16, 8, "bit", 1, neutral=16, simple=True),
                P("rate", "Sample rate", 2000, 44100, 11025, "Hz", 100, neutral=44100, simple=True),
                P("mix", "Mix", 0, 100, 100, "%", 1, neutral=0)]},
    {"type": "robot", "label": "Robot voice", "group": "creative", "stage": 63, "engine": "ff",
     "description": "Removes natural pitch movement for a flat, robotic voice.",
     "notes": "'robot', 'AI voice', 'android', 'Dalek'.",
     "params": [P("mix", "Mix", 0, 100, 100, "%", 1, neutral=0, simple=True),
                P("buzz", "Metallic buzz", 0, 100, 30, "%", 1, neutral=0, simple=True)]},
    {"type": "whisper", "label": "Whisper", "group": "creative", "stage": 64, "engine": "ff",
     "description": "Turns speech into a breathy whisper.",
     "notes": "'whisper', 'ghostly', 'ASMR-like'.",
     "params": [P("mix", "Mix", 0, 100, 100, "%", 1, neutral=0, simple=True)]},
    {"type": "chorus", "label": "Chorus", "group": "creative", "stage": 65, "engine": "pb",
     "description": "Doubles the voice with slight detuning for a wide, shimmering sound.",
     "notes": "'double voice', 'dreamy', 'many voices', 'underwater' (with low-pass).",
     "params": [P("rate", "Rate", 0.1, 10, 1.0, "Hz", 0.1, simple=True),
                P("depth", "Depth", 0, 100, 25, "%", 1, neutral=0, simple=True),
                P("delay", "Delay", 1, 30, 7, "ms", 0.5),
                P("mix", "Mix", 0, 100, 50, "%", 1, neutral=0)]},
    {"type": "flanger", "label": "Flanger", "group": "creative", "stage": 66, "engine": "ff",
     "description": "Sweeping jet-plane comb effect.",
     "notes": "'jet', 'sci-fi', 'whoosh', 'spacey'.",
     "params": [P("speed", "Speed", 0.1, 10, 0.5, "Hz", 0.1, simple=True),
                P("depth", "Depth", 0, 10, 2, "ms", 0.1, neutral=0, simple=True),
                P("feedback", "Feedback", -95, 95, 0, "%", 1)]},
    {"type": "phaser", "label": "Phaser", "group": "creative", "stage": 67, "engine": "pb",
     "description": "Swirling, swooshing phase sweep.",
     "notes": "'swirly', 'psychedelic', 'sci-fi'.",
     "params": [P("rate", "Rate", 0.1, 10, 0.8, "Hz", 0.1, simple=True),
                P("depth", "Depth", 0, 100, 50, "%", 1, neutral=0, simple=True),
                P("feedback", "Feedback", 0, 95, 30, "%", 1),
                P("mix", "Mix", 0, 100, 50, "%", 1, neutral=0)]},
    {"type": "tremolo", "label": "Tremolo", "group": "creative", "stage": 68, "engine": "ff",
     "description": "Pulses the volume up and down.",
     "notes": "'wobble', 'pulsing', 'helicopter', 'shaky'.",
     "params": [P("rate", "Rate", 0.1, 30, 5, "Hz", 0.1, simple=True),
                P("depth", "Depth", 0, 100, 50, "%", 1, neutral=0, simple=True)]},
    {"type": "vibrato", "label": "Vibrato", "group": "creative", "stage": 69, "engine": "ff",
     "description": "Wobbles the pitch.",
     "notes": "'wavy', 'drunk', 'old tape warble', 'nervous'.",
     "params": [P("rate", "Rate", 0.1, 20, 5, "Hz", 0.1, simple=True),
                P("depth", "Depth", 0, 100, 30, "%", 1, neutral=0, simple=True)]},
    {"type": "reverse", "label": "Reverse", "group": "creative", "stage": 70, "engine": "np",
     "description": "Plays the selection backwards. Best used on a short time range.",
     "notes": "'backwards', 'reverse'. Usually scoped to a word or phrase.",
     "params": []},

    # ── Space & echo ─────────────────────────────────────────────────
    {"type": "reverb", "label": "Reverb", "group": "space", "stage": 80, "engine": "pb",
     "description": "Places the voice in a room, hall or church.",
     "notes": "'roomy', 'hall', 'church', 'cathedral', 'bathroom', 'cave', 'stadium', 'dreamy'. Small room: size 20–35, mix 15–25. Hall: 70–85, mix 25–35. Cathedral: 95, mix 40.",
     "params": [P("room_size", "Room size", 0, 100, 40, "%", 1, simple=True),
                P("mix", "Amount", 0, 100, 20, "%", 1, neutral=0, simple=True),
                P("damping", "Damping", 0, 100, 50, "%", 1),
                P("pre_delay", "Pre-delay", 0, 200, 15, "ms", 1),
                P("width", "Width", 0, 100, 100, "%", 1)]},
    {"type": "echo", "label": "Echo / delay", "group": "space", "stage": 81, "engine": "pb",
     "description": "Distinct repeats of the voice.",
     "notes": "'echo', 'canyon', 'slapback', 'dramatic echo'. Slapback 0.08–0.15 s; canyon 0.4–0.8 s with feedback 40–60.",
     "params": [P("time", "Delay time", 0.02, 2.0, 0.35, "s", 0.01, simple=True),
                P("feedback", "Repeats", 0, 95, 35, "%", 1, simple=True),
                P("mix", "Amount", 0, 100, 25, "%", 1, neutral=0, simple=True)]},
    {"type": "stereo_width", "label": "Stereo width", "group": "space", "stage": 82, "engine": "ff",
     "description": "Narrows or widens the stereo image. 0% is mono.",
     "notes": "'mono', 'wider'. Speech is usually best centred.",
     "params": [P("width", "Width", 0, 200, 100, "%", 1, neutral=100, simple=True)]},

    # ── Fades ────────────────────────────────────────────────────────
    {"type": "fade_in", "label": "Fade in", "group": "fades", "stage": 90, "engine": "np",
     "description": "Ramps up from silence at the start.",
     "notes": "'fade in', 'smooth start'.",
     "params": [P("duration", "Length", 0.05, 15, 1.5, "s", 0.05, simple=True),
                C("curve", "Curve", CURVES, "smooth")]},
    {"type": "fade_out", "label": "Fade out", "group": "fades", "stage": 91, "engine": "np",
     "description": "Ramps down to silence at the end.",
     "notes": "'fade out', 'smooth ending'.",
     "params": [P("duration", "Length", 0.05, 15, 2.0, "s", 0.05, simple=True),
                C("curve", "Curve", CURVES, "smooth")]},

    # ── Master ───────────────────────────────────────────────────────
    {"type": "loudness", "label": "Loudness target", "group": "master", "stage": 100, "engine": "np",
     "description": "Sets the overall loudness to a platform standard.",
     "notes": "Spotify/YouTube −14 LUFS, Apple Podcasts −16, Audible −19, broadcast −23. 'louder overall', 'ready for Spotify'.",
     "params": [P("target", "Target", -30, -9, -16, "LUFS", 0.5, simple=True),
                C("platform", "Platform", ["custom", "spotify", "youtube", "apple", "audible", "broadcast"], "apple", simple=True)]},
    {"type": "limiter", "label": "Limiter", "group": "master", "stage": 101, "engine": "ff",
     "description": "Stops peaks from going above a ceiling. Always the last step.",
     "notes": "Safety on loud results.",
     "params": [P("ceiling", "Ceiling", -6, 0, -1, "dB", 0.1, simple=True),
                P("release", "Release", 5, 500, 50, "ms", 5)]},
]

EFFECTS_BY_TYPE: Dict[str, dict] = {e["type"]: e for e in EFFECTS}

PLATFORM_LUFS = {"spotify": -14, "youtube": -14, "apple": -16, "audible": -19, "broadcast": -23}

# The six character sliders. Each moves several real effects (see render.derive_character).
CHARACTER = [
    {"key": "body", "label": "Body", "low": "Thin", "high": "Full",
     "notes": "Thinner (negative): more low cut, less low end, slightly smaller formant. Fuller (positive): more low end, slightly bigger formant."},
    {"key": "brightness", "label": "Brightness", "low": "Dark", "high": "Bright",
     "notes": "Darker: less top end and presence, softer. Brighter: more presence and air."},
    {"key": "space", "label": "Space", "low": "Close", "high": "Roomy",
     "notes": "Closer: more proximity warmth and steadier level. Roomier: more reverb."},
    {"key": "punch", "label": "Punch", "low": "Soft", "high": "Punchy",
     "notes": "Punchier: more compression and presence. Softer: gentler top, less edge."},
    {"key": "pitch", "label": "Pitch", "low": "Lower", "high": "Higher",
     "notes": "Moves the note up to ±4 semitones, keeping the speaker recognisable."},
    {"key": "intensity", "label": "Intensity", "low": "Natural", "high": "Effect",
     "notes": "0–100 (default 100). Scales every effect toward neutral. 'too much' → lower it."},
]

LAYER_KINDS = [
    {"id": "music", "label": "Music bed", "notes": "Loops under the voice, ducks when people talk."},
    {"id": "intro", "label": "Intro", "notes": "Starts at 0:00."},
    {"id": "outro", "label": "Outro", "notes": "Ends with the audio."},
    {"id": "sfx", "label": "Sound effect", "notes": "Plays once at a chosen time."},
]


def empty_doc() -> dict:
    return {
        "version": 1,
        "character": {"body": 0, "brightness": 0, "space": 0, "punch": 0, "pitch": 0, "intensity": 100},
        "effects": [],
        "layers": [],
        "match_loudness": True,
        "look": None,
    }


def clamp_param(spec: dict, value):
    t = spec["type"]
    if t == "bool":
        return bool(value)
    if t == "choice":
        opts = spec["options"]
        if value in opts:
            return value
        # numbers sent as strings (and vice versa)
        for o in opts:
            if str(o) == str(value):
                return o
        return spec["default"]
    try:
        v = float(value)
    except (TypeError, ValueError):
        return spec["default"]
    v = max(spec["min"], min(spec["max"], v))
    return int(round(v)) if t == "int" else round(v, 4)


def normalize_effect(raw: dict, *, keep_id: Optional[str] = None) -> Optional[dict]:
    """Validate one effect entry against the registry; fill defaults."""
    spec = EFFECTS_BY_TYPE.get((raw or {}).get("type"))
    if not spec:
        return None
    given = raw.get("params") or {}
    params = {p["key"]: clamp_param(p, given.get(p["key"], p["default"])) for p in spec["params"]}
    scope = raw.get("scope") or None
    if scope:
        try:
            a, b = float(scope.get("start")), float(scope.get("end"))
            scope = {"start": max(0.0, min(a, b)), "end": max(a, b)} if abs(b - a) > 0.02 else None
        except (TypeError, ValueError, AttributeError):
            scope = None
    return {
        "id": keep_id or raw.get("id") or f"{spec['type']}",
        "type": spec["type"],
        "enabled": raw.get("enabled", True) is not False,
        "params": params,
        "scope": scope,
    }


def normalize_doc(doc: Optional[dict]) -> dict:
    """Clamp everything to the registry and put effects in processing order.

    One entry per (type, scope): asking for 'warmer' three times adjusts the
    same EQ instead of stacking three.
    """
    out = empty_doc()
    if not isinstance(doc, dict):
        return out
    ch = doc.get("character") or {}
    for c in CHARACTER:
        lo, hi = (0, 100) if c["key"] == "intensity" else (-100, 100)
        try:
            out["character"][c["key"]] = max(lo, min(hi, float(ch.get(c["key"], out["character"][c["key"]]))))
        except (TypeError, ValueError):
            pass
    seen = {}
    for raw in doc.get("effects") or []:
        e = normalize_effect(raw)
        if not e:
            continue
        key = (e["type"], tuple(sorted(e["scope"].items())) if e["scope"] else None)
        if key in seen:
            out["effects"][seen[key]] = {**e, "id": out["effects"][seen[key]]["id"]}
        else:
            seen[key] = len(out["effects"])
            if e["scope"]:
                e["id"] = f"{e['type']}@{e['scope']['start']:.2f}"
            out["effects"].append(e)
    out["effects"].sort(key=lambda e: (EFFECTS_BY_TYPE[e["type"]]["stage"], (e["scope"] or {}).get("start", -1)))
    out["layers"] = [l for l in (normalize_layer(l) for l in doc.get("layers") or []) if l]
    out["match_loudness"] = doc.get("match_loudness", True) is not False
    out["look"] = doc.get("look") if isinstance(doc.get("look"), str) else None
    return out


def normalize_layer(raw: dict) -> Optional[dict]:
    if not isinstance(raw, dict) or not raw.get("url"):
        return None
    kind = raw.get("kind") if raw.get("kind") in {k["id"] for k in LAYER_KINDS} else "music"

    def num(key, default, lo, hi):
        try:
            return max(lo, min(hi, float(raw.get(key, default))))
        except (TypeError, ValueError):
            return default

    return {
        "id": str(raw.get("id") or raw["url"].rsplit("/", 1)[-1])[:64],
        "kind": kind,
        "name": str(raw.get("name") or "Audio")[:120],
        "url": raw["url"],
        "duration": num("duration", 0, 0, 36000),
        "enabled": raw.get("enabled", True) is not False,
        "start": num("start", 0, 0, 36000),
        "volume": num("volume", -18 if kind == "music" else -6, -40, 6),
        "duck": num("duck", 12 if kind == "music" else 0, 0, 40),
        "fade_in": num("fade_in", 1.5 if kind != "sfx" else 0, 0, 20),
        "fade_out": num("fade_out", 3 if kind != "sfx" else 0, 0, 20),
        "loop": bool(raw.get("loop", kind == "music")),
        "pan": num("pan", 0, -100, 100),
    }


def public_registry() -> dict:
    """What the editor needs to build every panel."""
    from services.sound.looks import LOOKS  # noqa: avoid import cycle at module load
    return {
        "groups": GROUPS,
        "effects": EFFECTS,
        "character": CHARACTER,
        "layer_kinds": LAYER_KINDS,
        "platforms": PLATFORM_LUFS,
        "looks": [{k: l[k] for k in ("id", "label", "category", "description")} for l in LOOKS],
    }
