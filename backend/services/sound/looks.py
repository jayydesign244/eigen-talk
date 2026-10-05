"""Named looks ("radio voice", "warmer", "phone call"…) and the fast matcher.

A look is a partial sound document: character slider values and effect
settings. Applying one *sets* those values (scaled by a strength), so
"warmer" twice doesn't stack and "a bit more" just raises the strength.

The matcher handles short, common requests without calling the language
model — free, instant and available even when the AI provider is down.
Anything it isn't confident about goes to the model.
"""
import copy
import re
from typing import List, Optional, Tuple

from services.sound.registry import EFFECTS_BY_TYPE, empty_doc, normalize_doc


def E(type_, **params):
    return {"type": type_, "params": params}


LOOKS: List[dict] = [
    # ── Clean-up ─────────────────────────────────────────────────────
    {"id": "studio_clean", "label": "Studio clean", "category": "Clean-up",
     "description": "AI noise removal, rumble cut, smooth S's and steady level.",
     "keywords": ["studio sound", "studio quality", "clean up", "cleanup", "clean it", "enhance", "enhance speech", "make it pro", "professional", "sound pro", "fix my audio", "fix the audio", "improve", "better quality", "make it better", "sound better"],
     "effects": [E("voice_isolation", strength=80, background=5), E("high_pass", frequency=80), E("de_esser", amount=35),
                 E("compressor", threshold=-22, ratio=2.5), E("loudness", target=-16, platform="apple")]},
    {"id": "remove_noise", "label": "Remove background noise", "category": "Clean-up",
     "description": "AI separates your voice from fans, AC, traffic and music.",
     "keywords": ["background noise", "remove noise", "noise", "noisy", "fan", "ac noise", "air conditioner", "traffic", "remove background", "static"],
     "effects": [E("voice_isolation", strength=90, background=5)]},
    {"id": "light_denoise", "label": "Light hiss removal", "category": "Clean-up",
     "description": "Gentle non-AI noise reduction for steady hiss.",
     "keywords": ["hiss", "hissing", "light denoise", "gentle noise"],
     "effects": [E("noise_reduction", amount=12), E("high_pass", frequency=70)]},
    {"id": "remove_hum", "label": "Remove hum", "category": "Clean-up",
     "description": "Notches electrical hum and its harmonics.",
     "keywords": ["hum", "humming", "buzz", "buzzing", "electrical noise", "ground loop"],
     "effects": [E("hum_removal", depth=25, harmonics=4)]},
    {"id": "remove_clicks", "label": "Remove mouth clicks", "category": "Clean-up",
     "description": "Smooths lip smacks, clicks and pops.",
     "keywords": ["clicks", "mouth clicks", "lip smack", "lip smacks", "pops", "crackle", "clicking"],
     "effects": [E("declick", sensitivity=45)]},
    {"id": "fix_clipping", "label": "Fix distortion", "category": "Clean-up",
     "description": "Repairs peaks crushed by a too-loud recording.",
     "keywords": ["clipping", "distorted mic", "too loud mic", "crackly", "crunchy", "fix distortion"],
     "effects": [E("declip", sensitivity=45), E("limiter", ceiling=-1)]},
    {"id": "less_breaths", "label": "Fewer breaths", "category": "Clean-up",
     "description": "Lowers breaths and noises between words.",
     "keywords": ["breaths", "breathing", "breath", "less breathing", "remove breaths", "breathy gaps"],
     "effects": [E("breath_reduction", amount=12)]},
    {"id": "tame_s", "label": "Tame harsh S's", "category": "Clean-up",
     "description": "Softens sharp S and SH sounds.",
     "keywords": ["sibilance", "harsh s", "s sounds", "sharp s", "esses", "hissy s", "too many s"],
     "effects": [E("de_esser", amount=60)]},
    {"id": "silence_gaps", "label": "Silence the gaps", "category": "Clean-up",
     "description": "Turns down noise whenever nobody is talking.",
     "keywords": ["silence the gaps", "quiet gaps", "noise between", "gate"],
     "effects": [E("noise_gate", threshold=-45, reduction=20)]},
    {"id": "less_echo", "label": "Less room echo", "category": "Clean-up",
     "description": "AI isolation removes much of the room sound; a gate tidies tails.",
     "keywords": ["echo", "echoey", "echoy", "room echo", "reverb", "less echo", "remove echo", "de-reverb", "dereverb", "sounds like a bathroom", "too roomy", "hollow"],
     "effects": [E("voice_isolation", strength=95, background=0), E("noise_gate", threshold=-40, reduction=10, release=120)]},

    # ── Voice tone ───────────────────────────────────────────────────
    {"id": "thinner", "label": "Thinner", "category": "Voice tone",
     "description": "Lighter, less bass-heavy, slightly smaller voice.",
     "keywords": ["thin", "thinner", "lighter", "less bass", "less heavy", "slimmer", "smaller voice", "less deep"],
     "character": {"body": -45}},
    {"id": "fuller", "label": "Fuller", "category": "Voice tone",
     "description": "More weight and body.",
     "keywords": ["full", "fuller", "thicker", "more body", "richer", "heavier", "more weight", "more bass"],
     "character": {"body": 45}},
    {"id": "deeper", "label": "Deeper", "category": "Voice tone",
     "description": "Lower and bigger, still sounds like you.",
     "keywords": ["deep", "deeper", "lower voice", "lower my voice", "manlier", "bigger voice", "baritone", "voice lower"],
     "effects": [E("pitch", semitones=-1.5, formant=-1.0), E("low_shelf", frequency=160, gain=3)]},
    {"id": "higher", "label": "Higher", "category": "Voice tone",
     "description": "Raises the voice a little.",
     "keywords": ["higher", "higher voice", "raise my voice", "higher pitch", "voice higher", "lighter pitch"],
     "effects": [E("pitch", semitones=1.5, formant=0.6)]},
    {"id": "warmer", "label": "Warmer", "category": "Voice tone",
     "description": "Cozier low end, softer top, a touch of analog warmth.",
     "keywords": ["warm", "warmer", "cozy", "cosy", "smooth and warm", "warmth", "rich and warm"],
     "effects": [E("low_shelf", frequency=200, gain=3), E("high_shelf", frequency=8000, gain=-2), E("saturation", character="tape", drive=3, mix=100)]},
    {"id": "brighter", "label": "Brighter", "category": "Voice tone",
     "description": "More presence and air.",
     "keywords": ["bright", "brighter", "airy", "more air", "more treble", "sparkle", "sparkly"],
     "character": {"brightness": 45}},
    {"id": "darker", "label": "Darker", "category": "Voice tone",
     "description": "Softer top end, mellow.",
     "keywords": ["dark", "darker", "mellow", "less treble", "less bright", "dull it", "softer top"],
     "character": {"brightness": -45}},
    {"id": "clearer", "label": "Clearer", "category": "Voice tone",
     "description": "Cuts mud, lifts the speech range.",
     "keywords": ["clear", "clearer", "clarity", "more clear", "intelligible", "easier to understand", "crisp", "crisper", "cut through"],
     "effects": [E("high_pass", frequency=90), E("mud_cut", frequency=320, gain=-3), E("presence", frequency=3500, gain=3), E("de_esser", amount=30)]},
    {"id": "less_boomy", "label": "Less boomy", "category": "Voice tone",
     "description": "Removes excess bass resonance.",
     "keywords": ["boomy", "boomey", "too much bass", "bassy", "rumble", "rumbly", "proximity"],
     "effects": [E("high_pass", frequency=90), E("low_shelf", frequency=150, gain=-4)]},
    {"id": "less_muddy", "label": "Less muddy", "category": "Voice tone",
     "description": "Cuts low-mid build-up.",
     "keywords": ["muddy", "mud", "boxy", "cardboard", "muffled", "unclear"],
     "effects": [E("mud_cut", frequency=350, gain=-5, q=1.1), E("presence", frequency=3500, gain=1.5)]},
    {"id": "less_nasal", "label": "Less nasal", "category": "Voice tone",
     "description": "Reduces honky nasal resonance.",
     "keywords": ["nasal", "nasally", "honky", "through the nose"],
     "effects": [E("parametric_eq", b3_freq=1000, b3_gain=-4, b3_q=1.4)]},
    {"id": "less_harsh", "label": "Less harsh", "category": "Voice tone",
     "description": "Smooths piercing upper mids.",
     "keywords": ["harsh", "piercing", "shrill", "tinny", "sharp", "ear fatigue", "hurts"],
     "effects": [E("presence", frequency=3200, gain=-3), E("de_esser", amount=45)]},
    {"id": "smoother", "label": "Smoother", "category": "Voice tone",
     "description": "Silky, relaxed top end.",
     "keywords": ["smooth", "smoother", "silky", "velvet", "relaxed"],
     "effects": [E("high_shelf", frequency=7000, gain=-3), E("de_esser", amount=45), E("saturation", character="tape", drive=2, mix=100)]},
    {"id": "younger", "label": "Younger", "category": "Voice tone",
     "description": "Slightly smaller, brighter voice.",
     "keywords": ["younger", "young", "youthful"],
     "effects": [E("pitch", semitones=1.0, formant=1.2)], "character": {"brightness": 15}},
    {"id": "older", "label": "Older", "category": "Voice tone",
     "description": "Slightly lower, bigger, with a softer top.",
     "keywords": ["older", "old man", "aged", "elderly"],
     "effects": [E("pitch", semitones=-1.0, formant=-0.8), E("vibrato", rate=5.5, depth=8)], "character": {"brightness": -15}},
    {"id": "closer", "label": "Closer, more intimate", "category": "Voice tone",
     "description": "Warmer and more up-front, like close to the mic.",
     "keywords": ["intimate", "closer", "close to the mic", "close mic", "asmr", "up front", "more present"],
     "character": {"space": -55}},

    # ── Broadcast & platforms ────────────────────────────────────────
    {"id": "radio_voice", "label": "Radio voice", "category": "Broadcast",
     "description": "Big, punchy, polished broadcast sound.",
     "keywords": ["radio", "radio voice", "broadcast voice", "announcer", "dj", "fm", "radio host"],
     "effects": [E("high_pass", frequency=80), E("low_shelf", frequency=120, gain=2.5), E("mud_cut", frequency=300, gain=-2),
                 E("presence", frequency=3500, gain=3), E("de_esser", amount=40), E("compressor", threshold=-24, ratio=4, attack=8, release=120),
                 E("multiband", low=45, mid=40, high=35), E("loudness", target=-16, platform="apple")]},
    {"id": "podcast_ready", "label": "Podcast ready", "category": "Broadcast",
     "description": "Clean, clear, even and at Apple Podcasts loudness.",
     "keywords": ["podcast", "podcast ready", "ready for podcast", "podcast sound", "for my podcast"],
     "effects": [E("high_pass", frequency=80), E("mud_cut", frequency=300, gain=-2), E("presence", frequency=3500, gain=2),
                 E("de_esser", amount=35), E("compressor", threshold=-22, ratio=3), E("auto_level", amount=40), E("loudness", target=-16, platform="apple")]},
    {"id": "audiobook", "label": "Audiobook (ACX)", "category": "Broadcast",
     "description": "Gentle, natural and at audiobook loudness.",
     "keywords": ["audiobook", "acx", "audible", "narration", "narrator", "voiceover", "voice over"],
     "effects": [E("high_pass", frequency=70), E("de_esser", amount=40), E("compressor", threshold=-24, ratio=2.5), E("loudness", target=-19, platform="audible")]},
    {"id": "spotify_ready", "label": "Spotify / YouTube loudness", "category": "Broadcast",
     "description": "−14 LUFS with a safe peak ceiling.",
     "keywords": ["spotify", "youtube", "youtube ready", "spotify ready", "streaming", "tiktok", "instagram", "reels", "shorts"],
     "effects": [E("loudness", target=-14, platform="spotify"), E("limiter", ceiling=-1)]},
    {"id": "apple_ready", "label": "Apple Podcasts loudness", "category": "Broadcast",
     "description": "−16 LUFS, the Apple Podcasts target.",
     "keywords": ["apple podcasts", "apple", "itunes"],
     "effects": [E("loudness", target=-16, platform="apple"), E("limiter", ceiling=-1)]},
    {"id": "broadcast_ready", "label": "Broadcast (EBU R128)", "category": "Broadcast",
     "description": "−23 LUFS for TV and radio delivery.",
     "keywords": ["ebu", "r128", "tv", "television", "broadcast standard"],
     "effects": [E("loudness", target=-23, platform="broadcast"), E("limiter", ceiling=-1)]},
    {"id": "balance_volume", "label": "Balance volume", "category": "Broadcast",
     "description": "Evens out quiet and loud parts.",
     "keywords": ["balance", "balance the volume", "balance volume", "even out", "consistent volume", "some parts are quiet", "too quiet in parts", "uneven", "level it", "levels"],
     "effects": [E("auto_level", amount=60, max_boost=12), E("compressor", threshold=-22, ratio=2.5)]},
    {"id": "louder", "label": "Louder", "category": "Broadcast",
     "description": "Louder overall without clipping.",
     "keywords": ["louder", "more volume", "turn it up", "too quiet", "boost volume", "increase volume"],
     "effects": [E("compressor", threshold=-20, ratio=3), E("loudness", target=-14, platform="spotify"), E("limiter", ceiling=-1)]},
    {"id": "quieter", "label": "Quieter", "category": "Broadcast",
     "description": "Turns everything down.",
     "keywords": ["quieter", "softer volume", "turn it down", "too loud", "lower volume", "reduce volume"],
     "effects": [E("loudness", target=-20, platform="custom")]},
    {"id": "punchier", "label": "Punchier", "category": "Broadcast",
     "description": "More impact and energy.",
     "keywords": ["punch", "punchy", "punchier", "more energy", "energetic", "impact", "powerful"],
     "character": {"punch": 50}},

    # ── Rooms & space ────────────────────────────────────────────────
    {"id": "small_room", "label": "Small room", "category": "Rooms & space",
     "description": "A natural touch of room.",
     "keywords": ["small room", "a bit of room", "natural room", "some space", "less dry"],
     "effects": [E("reverb", room_size=25, mix=16, damping=55, pre_delay=8)]},
    {"id": "bathroom", "label": "Bathroom", "category": "Rooms & space",
     "description": "Bright, tiled reflections.",
     "keywords": ["bathroom", "shower", "tiled", "toilet"],
     "effects": [E("reverb", room_size=32, mix=32, damping=12, pre_delay=4)]},
    {"id": "hall", "label": "Concert hall", "category": "Rooms & space",
     "description": "Big, smooth hall.",
     "keywords": ["hall", "concert hall", "big room", "auditorium", "theatre", "theater", "stage"],
     "effects": [E("reverb", room_size=78, mix=30, damping=45, pre_delay=25)]},
    {"id": "church", "label": "Church / cathedral", "category": "Rooms & space",
     "description": "Huge, long, airy reverb.",
     "keywords": ["church", "cathedral", "temple", "mosque", "chapel", "huge room"],
     "effects": [E("reverb", room_size=95, mix=40, damping=35, pre_delay=45)]},
    {"id": "cave", "label": "Cave", "category": "Rooms & space",
     "description": "Dark, rocky echoes.",
     "keywords": ["cave", "cavern", "tunnel", "dungeon"],
     "effects": [E("reverb", room_size=88, mix=42, damping=70, pre_delay=30), E("echo", time=0.22, feedback=30, mix=14)]},
    {"id": "stadium", "label": "Stadium", "category": "Rooms & space",
     "description": "Giant space with distant slap echoes.",
     "keywords": ["stadium", "arena", "pa system", "public address"],
     "effects": [E("reverb", room_size=95, mix=34, damping=40, pre_delay=60), E("echo", time=0.55, feedback=25, mix=14)]},
    {"id": "slapback", "label": "Slapback echo", "category": "Rooms & space",
     "description": "One quick vintage echo.",
     "keywords": ["slapback", "slap back", "quick echo", "rockabilly"],
     "effects": [E("echo", time=0.11, feedback=5, mix=25)]},
    {"id": "canyon", "label": "Canyon echo", "category": "Rooms & space",
     "description": "Long, repeating echoes.",
     "keywords": ["canyon", "mountain", "valley", "long echo", "add echo", "with echo", "echo effect"],
     "effects": [E("echo", time=0.6, feedback=55, mix=32)]},
    {"id": "dreamy", "label": "Dreamy", "category": "Rooms & space",
     "description": "Soft, washy and floating.",
     "keywords": ["dreamy", "dream", "ethereal", "floaty", "heavenly", "angelic"],
     "effects": [E("reverb", room_size=82, mix=36, damping=40, pre_delay=20), E("chorus", rate=0.6, depth=30, mix=30)]},
    {"id": "dramatic_echo", "label": "Dramatic echo", "category": "Rooms & space",
     "description": "Movie-trailer style echo.",
     "keywords": ["dramatic", "dramatic echo", "trailer", "epic", "cinematic"],
     "effects": [E("echo", time=0.45, feedback=45, mix=32), E("reverb", room_size=70, mix=22), E("low_shelf", frequency=120, gain=3)]},

    # ── Characters & fun ─────────────────────────────────────────────
    {"id": "phone_call", "label": "Phone call", "category": "Characters & fun",
     "description": "Narrow, compressed telephone sound.",
     "keywords": ["phone", "phone call", "telephone", "on the phone", "call quality", "voicemail"],
     "effects": [E("band_pass", low=300, high=3400), E("saturation", character="hard", drive=6, mix=100), E("compressor", threshold=-25, ratio=5), E("stereo_width", width=0)]},
    {"id": "walkie_talkie", "label": "Walkie-talkie", "category": "Characters & fun",
     "description": "Crunchy two-way radio.",
     "keywords": ["walkie", "walkie talkie", "walkie-talkie", "two way radio", "police radio", "intercom", "cb radio", "pilot"],
     "effects": [E("band_pass", low=500, high=3000), E("distortion", drive=24, mix=80), E("bitcrush", bits=12, rate=16000, mix=100), E("compressor", threshold=-28, ratio=6), E("stereo_width", width=0)]},
    {"id": "megaphone", "label": "Megaphone", "category": "Characters & fun",
     "description": "Loud, horn-like bullhorn.",
     "keywords": ["megaphone", "bullhorn", "loudspeaker", "protest", "announcement speaker"],
     "effects": [E("band_pass", low=600, high=3200), E("distortion", drive=18, mix=90), E("presence", frequency=2000, gain=5), E("stereo_width", width=0)]},
    {"id": "old_radio", "label": "Old radio", "category": "Characters & fun",
     "description": "1940s AM radio.",
     "keywords": ["old radio", "vintage radio", "am radio", "1940s", "1950s", "gramophone", "old timey", "retro radio"],
     "effects": [E("band_pass", low=700, high=3000), E("saturation", character="tube", drive=10, mix=100), E("stereo_width", width=0)]},
    {"id": "vinyl", "label": "Vintage vinyl", "category": "Characters & fun",
     "description": "Warm, dusty record sound.",
     "keywords": ["vinyl", "record player", "turntable", "vintage", "analog", "analogue"],
     "effects": [E("low_pass", frequency=7500), E("high_pass", frequency=120), E("saturation", character="tape", drive=8, mix=100), E("vibrato", rate=0.6, depth=6)]},
    {"id": "lofi", "label": "Lo-fi", "category": "Characters & fun",
     "description": "Crunchy, low-resolution texture.",
     "keywords": ["lofi", "lo-fi", "lo fi", "low quality", "crunchy", "degraded"],
     "effects": [E("bitcrush", bits=10, rate=16000, mix=100), E("low_pass", frequency=6000), E("saturation", character="tape", drive=8, mix=100)]},
    {"id": "eight_bit", "label": "8-bit game", "category": "Characters & fun",
     "description": "Retro console crunch.",
     "keywords": ["8 bit", "8-bit", "8bit", "retro game", "video game", "arcade", "chiptune"],
     "effects": [E("bitcrush", bits=6, rate=8000, mix=100)]},
    {"id": "robot", "label": "Robot", "category": "Characters & fun",
     "description": "Flat, metallic machine voice.",
     "keywords": ["robot", "robotic", "android", "machine voice", "ai voice", "cyborg", "dalek"],
     "effects": [E("robot", mix=100, buzz=40)]},
    {"id": "alien", "label": "Alien", "category": "Characters & fun",
     "description": "High, swirling extraterrestrial.",
     "keywords": ["alien", "extraterrestrial", "martian", "et"],
     "effects": [E("pitch", semitones=4, formant=3), E("flanger", speed=0.8, depth=3, feedback=50), E("reverb", room_size=60, mix=20)]},
    {"id": "chipmunk", "label": "Chipmunk", "category": "Characters & fun",
     "description": "Tiny, squeaky cartoon voice.",
     "keywords": ["chipmunk", "squeaky", "cartoon", "mouse", "tiny voice"],
     "effects": [E("pitch", semitones=7, formant=4)]},
    {"id": "helium", "label": "Helium", "category": "Characters & fun",
     "description": "Same note, much smaller head.",
     "keywords": ["helium", "balloon"],
     "effects": [E("pitch", semitones=2, formant=5)]},
    {"id": "monster", "label": "Monster", "category": "Characters & fun",
     "description": "Deep, growly beast.",
     "keywords": ["monster", "demon", "beast", "villain", "evil", "scary", "darth", "horror"],
     "effects": [E("pitch", semitones=-7, formant=-4), E("saturation", character="hard", drive=8, mix=60), E("reverb", room_size=60, mix=15)]},
    {"id": "giant", "label": "Giant", "category": "Characters & fun",
     "description": "Huge, booming, slow-sounding.",
     "keywords": ["giant", "god voice", "booming", "huge voice", "titan"],
     "effects": [E("pitch", semitones=-4, formant=-3), E("low_shelf", frequency=120, gain=4), E("reverb", room_size=85, mix=28, pre_delay=40)]},
    {"id": "underwater", "label": "Underwater", "category": "Characters & fun",
     "description": "Muffled and wobbly, like under water.",
     "keywords": ["underwater", "under water", "drowning", "submerged", "in a pool"],
     "effects": [E("low_pass", frequency=650, slope=24), E("chorus", rate=0.8, depth=60, mix=50), E("vibrato", rate=2, depth=25)]},
    {"id": "through_wall", "label": "Through a wall", "category": "Characters & fun",
     "description": "Muffled, next-room sound.",
     "keywords": ["through a wall", "next room", "neighbour", "neighbor", "far away", "distant", "muffled voice"],
     "effects": [E("low_pass", frequency=900, slope=24), E("reverb", room_size=35, mix=18)]},
    {"id": "whisper", "label": "Whisper", "category": "Characters & fun",
     "description": "Breathy whisper.",
     "keywords": ["whisper", "whispering", "whispery"],
     "effects": [E("whisper", mix=100)]},
    {"id": "ghost", "label": "Ghost", "category": "Characters & fun",
     "description": "Whispery and haunting.",
     "keywords": ["ghost", "ghostly", "haunted", "spooky", "spirit"],
     "effects": [E("whisper", mix=60), E("reverb", room_size=92, mix=42), E("vibrato", rate=3, depth=15)]},
    {"id": "drunk", "label": "Wobbly", "category": "Characters & fun",
     "description": "Woozy pitch wobble.",
     "keywords": ["drunk", "wobbly", "woozy", "dizzy", "warble"],
     "effects": [E("vibrato", rate=1.2, depth=45)]},
    {"id": "helicopter", "label": "Helicopter", "category": "Characters & fun",
     "description": "Chopping volume pulse.",
     "keywords": ["helicopter", "chopper", "stutter", "choppy"],
     "effects": [E("tremolo", rate=12, depth=80)]},
]

LOOKS_BY_ID = {l["id"]: l for l in LOOKS}


def _scale(value, neutral, strength):
    return neutral + (value - neutral) * strength


def look_patch(look: dict, strength: float = 1.0) -> Tuple[dict, List[dict]]:
    """(character values, effect entries) for a look at a strength (0.25–2)."""
    strength = max(0.25, min(2.0, strength))
    character = {k: max(-100, min(100, v * strength)) for k, v in (look.get("character") or {}).items()}
    effects = []
    for e in look.get("effects") or []:
        spec = EFFECTS_BY_TYPE[e["type"]]
        params = {}
        for p in spec["params"]:
            if p["key"] not in e["params"]:
                continue
            v = e["params"][p["key"]]
            if p["type"] in ("float", "int") and "neutral" in p and strength != 1.0:
                v = _scale(v, p["neutral"], strength)
            params[p["key"]] = v
        effects.append({"type": e["type"], "params": params})
    return character, effects


def apply_look(doc: dict, look_id: str, strength: float = 1.0) -> dict:
    look = LOOKS_BY_ID.get(look_id)
    if not look:
        return doc
    out = copy.deepcopy(doc)
    character, effects = look_patch(look, strength)
    out["character"].update(character)
    by_type = {e["type"]: i for i, e in enumerate(out["effects"]) if not e.get("scope")}
    for e in effects:
        if e["type"] in by_type:
            cur = out["effects"][by_type[e["type"]]]
            cur["params"] = {**cur["params"], **e["params"]}
            cur["enabled"] = True
        else:
            out["effects"].append({"type": e["type"], "params": e["params"]})
    out["look"] = look_id
    return normalize_doc(out)


# ── Fast matcher ──────────────────────────────────────────────────────

GREETING = re.compile(r"^(hi+|hey+|hello+|hii+|yo|hola|namaste|good (morning|afternoon|evening)|sup|what'?s up|howdy|hey there|hi there)\b[\s!.?]*$", re.I)
THANKS = re.compile(r"^(thanks|thank you|thx|ty|great|awesome|perfect|nice|cool|ok(ay)?|got it)\b[\s!.]*$", re.I)
UNDO = re.compile(r"^(undo|go back|revert( that)?|undo (that|it|last)|back)\b[\s!.]*$", re.I)
RESET = re.compile(r"^(reset|start over|remove all (effects|changes)|clear (all )?effects|back to original|original sound|no effects)\b[\s!.]*$", re.I)
MORE = re.compile(r"^(more|a bit more|a little more|stronger|even more|increase it|more please|go further|push it|turn it up)\b[\s!.]*$", re.I)
LESS = re.compile(r"^(less|a bit less|a little less|too much|weaker|tone it down|softer please|subtler|more subtle|dial it back|reduce it)\b[\s!.]*$", re.I)

RELATIVE = re.compile(r"\b(too|that'?s|that is|it'?s now|now it|instead|still|again|than before|anymore|back to)\b", re.I)
SOFT = re.compile(r"\b(a bit|a little|little|slightly|bit|subtle|subtly|gently|lightly|a touch|tiny bit|somewhat|kinda)\b", re.I)
STRONG = re.compile(r"\b(very|really|much|a lot|lots|way|super|extremely|heavily|strong|strongly|massively|so much|more)\b", re.I)

FILLER = re.compile(
    r"\b(can you|could you|would you|will you|please|pls|make|my|the|it|this|that|audio|sound|sounds|voice|a|an|to|me|more|less|"
    r"some|be|bit|little|slightly|very|really|much|lot|add|apply|give|put|i|want|need|like|just|let'?s|it'?s|is|too|and|with|on|of|"
    r"kind|kinda|sort|subtle|subtly|gently|lightly|touch|tiny|somewhat|way|super|extremely|heavily|strong|strongly|effect|recording|"
    r"version|try|use|turn|into|in|for|so|bring|get|do|have|was|were|be|sounding|sounds?|like a|style|feel|feeling|tone|quality|"
    r"remove|reduce|fix|rid|eliminate|kill|take|out|away|clean|lose|stop|there'?s|there|any|all|whole|entire|"
    r"background|now|thing|bit|please|thanks|ok|okay|hey|hi)\b",
    re.I,
)


def _strength(text: str) -> float:
    if SOFT.search(text):
        return 0.5
    if STRONG.search(text):
        return 1.5
    return 1.0


def _match_part(part: str) -> Optional[str]:
    """Best look for one clause, or None if anything meaningful is left over."""
    p = " " + re.sub(r"[^a-z0-9' -]+", " ", part.lower()) + " "
    best, best_len = None, 0
    for look in LOOKS:
        for kw in look["keywords"]:
            if f" {kw} " in p and len(kw) > best_len:
                best, best_len = look["id"], len(kw)
    if not best:
        return None
    # Refuse if words remain that we don't understand ("warmer but only in the intro").
    rest = p
    for kw in sorted((k for l in LOOKS for k in l["keywords"]), key=len, reverse=True):
        rest = rest.replace(f" {kw} ", " ")
    rest = FILLER.sub(" ", rest)
    leftover = [w for w in rest.split() if len(w) > 2]
    return best if not leftover else None


def match(text: str) -> Optional[dict]:
    """Classify a short request without the language model.

    Returns one of:
      {"kind": "greeting"|"thanks"|"undo"|"reset"}
      {"kind": "more"|"less"}
      {"kind": "looks", "looks": [(id, strength), ...]}
    or None when the request needs the model.
    """
    t = (text or "").strip()
    if not t or len(t) > 120:
        return None
    if GREETING.match(t):
        return {"kind": "greeting"}
    if THANKS.match(t):
        return {"kind": "thanks"}
    if RESET.match(t):
        return {"kind": "reset"}
    if UNDO.match(t):
        return {"kind": "undo"}
    if MORE.match(t):
        return {"kind": "more"}
    if LESS.match(t):
        return {"kind": "less"}
    if len(t.split()) > 14 or "?" in t:
        return None
    # "that's too much echo", "it's too bright now" refer to what's already
    # applied — the model sees the current settings, so let it decide.
    if RELATIVE.search(t):
        return None
    parts = [p for p in re.split(r"\s*(?:,|&|\band\b|\bplus\b|\balso\b|\bthen\b)\s*", t, flags=re.I) if p.strip()]
    found = []
    for part in parts:
        look_id = _match_part(part)
        if not look_id:
            return None
        found.append((look_id, _strength(part)))
    return {"kind": "looks", "looks": found} if found else None


def describe_looks(found) -> str:
    """'made your voice warmer and applied the Phone call sound'."""
    tone = [LOOKS_BY_ID[i]["label"].lower() for i, _ in found if LOOKS_BY_ID[i]["category"] == "Voice tone"]
    other = [LOOKS_BY_ID[i]["label"] for i, _ in found if LOOKS_BY_ID[i]["category"] != "Voice tone"]

    def join(xs):
        return xs[0] if len(xs) == 1 else ", ".join(xs[:-1]) + " and " + xs[-1]

    parts = []
    if tone:
        parts.append(f"made your voice {join(tone)}")
    if other:
        parts.append(f"applied {join(other)}")
    return " and ".join(parts)


def fresh_doc_from_looks(found, base: Optional[dict] = None) -> dict:
    doc = normalize_doc(base) if base else empty_doc()
    for look_id, strength in found:
        doc = apply_look(doc, look_id, strength)
    return doc
