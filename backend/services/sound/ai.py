"""The assistant's brain: system prompt, tools, and how tool calls change things.

The model never touches audio directly. It can only:
  - update_sound: change the sound document (looks, character sliders,
    individual effects with exact parameters, undo/reset, save a version)
  - edit_audio:   transcript-driven edits (bleep, pause, cut, tighten pauses)
Every value it sends is clamped to the registry's ranges, so a bad guess can
never produce something unsafe — at worst it's undone with one click.
"""
import copy
import json
import os
import re
from typing import List, Optional, Tuple

from services.sound import looks as looks_lib
from services.sound.registry import CHARACTER, EFFECTS, EFFECTS_BY_TYPE, GROUPS, normalize_doc, empty_doc

# A stronger tool-using model than the general chat default; override per deploy.
SOUND_MODEL = os.environ.get("OPENAI_SOUND_MODEL", "gpt-4.1-mini")

SCOPE_REFUSAL = (
    "I can only help with your audio and video here in Sonicly — things like cleaning up "
    "background noise, making your voice warmer or deeper, balancing the volume, adding music, "
    "or cutting words from the transcript. What would you like to do with this recording?"
)


def greeting_reply(profile: Optional[dict]) -> str:
    tip = ""
    findings = (profile or {}).get("findings") or []
    if findings:
        tip = f" I had a quick listen — {findings[0]['title'].lower()} is the first thing I'd fix."
    return (
        "Hi! I'm your Sonicly sound assistant. Tell me how you want this recording to sound — "
        "\"remove the background noise\", \"make my voice warmer\", \"radio voice\", \"balance the volume\" — "
        "and I'll set it up with sliders you can fine-tune." + tip + " What would you like to do?"
    )


THANKS_REPLY = "Happy to help! Want to change anything else, or save this as a new version?"


def _registry_text() -> str:
    lines = []
    for g in GROUPS:
        lines.append(f"## {g['label']}")
        for e in (e for e in EFFECTS if e["group"] == g["id"]):
            params = []
            for p in e["params"]:
                if p["type"] == "choice":
                    params.append(f"{p['key']}∈{p['options']} (default {p['default']})")
                elif p["type"] == "bool":
                    params.append(f"{p['key']}:bool")
                else:
                    params.append(f"{p['key']} {p['min']}..{p['max']}{p['unit']} (default {p['default']})")
            if e["type"] == "graphic_eq":
                params = ["g20..g20000 one per third-octave band, −12..12 dB (keys g20,g25,g31,…,g16000,g20000)"]
            lines.append(f"- {e['type']}: {e['description']} {e['notes']} Params: {'; '.join(params) or 'none'}")
    return "\n".join(lines)


def _looks_text() -> str:
    return "\n".join(f"- {l['id']}: {l['label']} — {l['description']}" for l in looks_lib.LOOKS)


def _character_text() -> str:
    return "\n".join(f"- {c['key']} ({c['low']} ↔ {c['high']}): {c['notes']}" for c in CHARACTER)


REGISTRY_TEXT = _registry_text()
LOOKS_TEXT = _looks_text()
CHARACTER_TEXT = _character_text()


def system_prompt(*, project_name: str, media_type: str, doc: dict, chain_lines: List[str],
                  analysis: str, transcript_text: str, filler_note: str, isolation_available: bool = True) -> str:
    current = "\n".join(f"  - {l}" for l in chain_lines) or "  (no effects — original sound)"
    return f"""You are Sonicly, the AI sound assistant inside an audio and video editor. The user is editing "{project_name}" ({media_type or 'audio'} project).

# What you help with — and nothing else
- Changing how this recording sounds (any request, from "make it better" to "high-pass at 100 Hz, 24 dB/oct").
- Editing the recording through its transcript (cut words, bleep words, add or tighten pauses).
- Questions about this recording, its transcript, and how to use Sonicly.
- General audio, voice, podcast and video-sound know-how (mic technique, loudness standards, recording tips).
Anything else (general knowledge, space, planets, coding, maths, news, homework, other apps, personal advice, jokes or stories unrelated to the recording) is out of scope. Reply exactly in this spirit, in one or two sentences, without answering the off-topic part: "{SCOPE_REFUSAL}"
If the user greets you or makes small talk, reply warmly in one or two sentences and suggest one or two concrete things you can do for this recording (use the analysis below). Don't call tools for greetings.

# How you make changes
You can only change things through tools. Never claim a change happened unless you called a tool for it in this reply.
- update_sound: for anything about how it SOUNDS. Prefer, in order: a matching look (apply_look) → character sliders (set_character) for vague "feel" words → exact effects (set_effect) for specific or technical requests. Combine them when needed.
- edit_audio: for bleeping, cutting, adding pauses, or tightening pauses.
Changes are a preview until saved; the user hears them immediately and gets sliders to fine-tune. Only use the "save" operation when the user asks to save/keep/apply/finalize.

# Choosing values
- Use the analysis: don't add bass to a boomy voice; if noise is low, don't run heavy noise removal.
- Relative requests ("a bit more", "too much", "less echo") change the CURRENT values below — read them and adjust (e.g. +50% for "more", halve for "a bit less"). "Natural ↔ Effect" (character.intensity) scales everything at once.
- "a bit / slightly" = gentle values; "very / much" = strong but natural values. Pitch beyond ±3 semitones sounds like an effect, not the same person.
- Scope: if the user names a part ("only the intro", "between 3 and 6 seconds", "from 1:10 to 1:30", "when I say 'basically'"), you MUST put "scope": {{"start": s, "end": e}} in seconds on every set_effect for that request, using the transcript timings below. Example — "big hall reverb only between 3 and 6 seconds": {{"op":"set_effect","effect":"reverb","params":{{"room_size":85,"mix":35}},"scope":{{"start":3,"end":6}}}}. Fades always apply to the whole file.
- Only change what was asked. Never add fades, loudness changes or other effects the user didn't request (looks may include a few related effects — that's fine). For a request about one time range, add exactly one entry with that scope — never extra entries for other ranges.
- To adjust an effect that already exists, send set_effect with the same effect type AND the exact same scope it has in "Current effects" below (omit scope only if it has none). To remove a scoped effect, use set_effect with "enabled": false and its scope.
- "The intro" = roughly the first transcript segment or first ~15 s; "the outro/ending" = the last segment or ~15 s. Use those as the scope instead of asking. Example — "make the intro louder" with a first segment ending at 12.4 s: {{"op":"set_effect","effect":"gain","params":{{"gain":4}},"scope":{{"start":0,"end":12.4}}}}. If your explanation mentions a part of the recording, the operation MUST carry that scope.
- Voice isolation (and the looks studio_clean, remove_noise, less_echo) uses paid AI processing. Use it only when the problem is background noise, room echo, or the user asks to "clean up". For tone problems (muffled, boomy, thin, harsh) use EQ effects instead.
- Video projects: tempo and speed are not allowed (they would desync the picture).
- If a request is impossible with these tools (e.g. sound like a specific celebrity, change the words without re-recording, separate music stems), say so plainly and offer the closest real option.
- If a request is genuinely ambiguous, make the most likely change and say what else you could try — only ask a question when you truly can't guess.

{"" if isolation_available else "- Voice isolation is NOT available on this server right now (no ElevenLabs key). Use noise_reduction, noise_gate and hum_removal instead, and say so if the user asks for AI cleanup."}

# Your reply
Write the `explanation` for the person: 1–3 short sentences, plain language, no jargon unless they used technical words themselves (then be precise with Hz/dB). Say what you changed and which slider to move if they want more or less. No markdown headings or lists.

# Character sliders (−100..100; intensity 0..100, default 100)
{CHARACTER_TEXT}

# Looks (apply_look with strength 0.25–2, default 1)
{LOOKS_TEXT}

# Effects (set_effect with exact params; omitted params keep their current/default value)
{REGISTRY_TEXT}

# Current sound settings
Character: {doc['character']}
Current effects (exact data): {json.dumps([{"type": e["type"], "params": e["params"], "scope": e["scope"], "enabled": e["enabled"]} for e in doc["effects"]])}
What actually runs (including character sliders):
{current}
Music/extra layers: {len(doc['layers'])}

# Audio analysis of the original
{analysis}
{filler_note}

# Transcript (with start times in seconds)
{transcript_text}
"""


_OP_SCHEMA = {
    "type": "object",
    "properties": {
        "op": {"type": "string", "enum": ["apply_look", "set_character", "set_effect", "remove_effect", "reset", "undo", "save"]},
        "look": {"type": "string", "description": "Look id for apply_look"},
        "strength": {"type": "number", "description": "apply_look strength 0.25–2"},
        "character": {"type": "object", "description": "set_character: any of body, brightness, space, punch, pitch (−100..100), intensity (0..100)",
                      "properties": {c["key"]: {"type": "number"} for c in CHARACTER}},
        "effect": {"type": "string", "enum": [e["type"] for e in EFFECTS], "description": "Effect type for set_effect/remove_effect"},
        "params": {"type": "object", "description": "Exact parameter values for set_effect (registry keys)"},
        "enabled": {"type": "boolean"},
        "scope": {"type": "object", "description": "Optional time range in seconds", "properties": {"start": {"type": "number"}, "end": {"type": "number"}}},
        "label": {"type": "string", "description": "Optional version name for save"},
    },
    "required": ["op"],
}

TOOLS = [
    {"type": "function", "function": {
        "name": "update_sound",
        "description": "Change how the recording sounds. Operations run in order on the current sound settings.",
        "parameters": {"type": "object", "properties": {
            "operations": {"type": "array", "items": _OP_SCHEMA},
            "explanation": {"type": "string", "description": "Short plain-language message to the user about what changed"},
        }, "required": ["operations", "explanation"]},
    }},
    {"type": "function", "function": {
        "name": "edit_audio",
        "description": "Edit the recording via its transcript: bleep or cut words/phrases, add a pause after a phrase, or tighten long pauses. Creates a new saved version.",
        "parameters": {"type": "object", "properties": {
            "operations": {"type": "array", "items": {"type": "object", "properties": {
                "op": {"type": "string", "enum": ["bleep", "cut", "pause", "tighten_pauses"]},
                "phrase": {"type": "string", "description": "Exact words from the transcript (bleep/cut/pause)"},
                "occurrence": {"type": "string", "enum": ["all", "first", "last"], "description": "Which matches; default all for bleep/cut, first for pause"},
                "mode": {"type": "string", "enum": ["tone", "mute"], "description": "bleep sound; default tone"},
                "seconds": {"type": "number", "description": "pause length, 0.2–5"},
                "max_gap": {"type": "number", "description": "tighten_pauses: longest pause to keep, seconds (0.3–2, default 0.7)"},
            }, "required": ["op"]}},
            "explanation": {"type": "string"},
        }, "required": ["operations", "explanation"]},
    }},
]


def transcript_for_prompt(transcript: Optional[dict], limit: int = 7000) -> str:
    if not transcript:
        return "(no transcript yet)"
    lines, total = [], 0
    for seg in transcript.get("segments") or []:
        line = f"[{seg.get('start', 0):.1f}s] {(seg.get('text') or '').strip()}"
        total += len(line)
        if total > limit:
            lines.append("…(truncated)")
            break
        lines.append(line)
    return "\n".join(lines)


# ── Executing update_sound operations on a document ───────────────────

def apply_sound_ops(doc: dict, ops: List[dict], history: List[dict]) -> Tuple[dict, List[str], Optional[str]]:
    """Returns (new doc, notes about skipped ops, save label or None)."""
    doc = normalize_doc(copy.deepcopy(doc))
    notes: List[str] = []
    save_label: Optional[str] = None
    for op in ops or []:
        kind = op.get("op")
        if kind == "reset":
            doc = empty_doc()
        elif kind == "undo":
            if history:
                doc = normalize_doc(history.pop())
            else:
                notes.append("nothing to undo")
        elif kind == "apply_look":
            look = op.get("look")
            if look in looks_lib.LOOKS_BY_ID:
                doc = looks_lib.apply_look(doc, look, float(op.get("strength") or 1.0))
            else:
                notes.append(f"unknown look '{look}'")
        elif kind == "set_character":
            ch = op.get("character") or {}
            for c in CHARACTER:
                if c["key"] in ch:
                    try:
                        doc["character"][c["key"]] = float(ch[c["key"]])
                    except (TypeError, ValueError):
                        pass
            doc = normalize_doc(doc)
        elif kind == "set_effect":
            etype = op.get("effect")
            if etype not in EFFECTS_BY_TYPE:
                notes.append(f"unknown effect '{etype}'")
                continue
            scope = op.get("scope") or None
            target = None
            for e in doc["effects"]:
                if e["type"] == etype and _same_scope(e.get("scope"), scope):
                    target = e
                    break
            params = op.get("params") or {}
            if target:
                target["params"] = {**target["params"], **params}
                if "enabled" in op:
                    target["enabled"] = bool(op["enabled"])
                else:
                    target["enabled"] = True
            else:
                doc["effects"].append({"type": etype, "params": params, "scope": scope,
                                       "enabled": op.get("enabled", True)})
            doc = normalize_doc(doc)
        elif kind == "remove_effect":
            etype = op.get("effect")
            before = len(doc["effects"])
            doc["effects"] = [e for e in doc["effects"] if e["type"] != etype]
            if len(doc["effects"]) == before:
                notes.append(f"{etype} wasn't active")
        elif kind == "save":
            save_label = (op.get("label") or "").strip() or "save"
    return normalize_doc(doc), notes, save_label


def diff_chains(before: List[str], after: List[str]) -> List[str]:
    """Plain list of what changed between two describe_chain() outputs."""
    b, a = set(before), set(after)
    removed = [x for x in before if x not in a]
    added = [x for x in after if x not in b]
    out = []
    for x in added:
        name = x.split(":")[0]
        old = next((r for r in removed if r.split(":")[0] == name), None)
        if old:
            removed.remove(old)
            out.append(f"{name}: {old.split(':', 1)[1].strip() or '—'} → {x.split(':', 1)[1].strip() or 'on'}")
        else:
            out.append(f"added {x}")
    out += [f"removed {r.split(':')[0]}" for r in removed]
    return out


def _same_scope(a: Optional[dict], b: Optional[dict]) -> bool:
    if not a and not b:
        return True
    if not a or not b:
        return False
    try:
        return abs(float(a["start"]) - float(b["start"])) < 0.05 and abs(float(a["end"]) - float(b["end"])) < 0.05
    except (KeyError, TypeError, ValueError):
        return False


# ── Resolving phrases in the transcript ───────────────────────────────

def _norm(t: str) -> str:
    return re.sub(r"[^a-z0-9']+", "", (t or "").lower())


def find_phrase(transcript: Optional[dict], phrase: str) -> List[List[Tuple[int, int]]]:
    """Every occurrence of `phrase` as a list of (segment_idx, word_idx)."""
    target = [w for w in (_norm(x) for x in (phrase or "").split()) if w]
    if not target or not transcript:
        return []
    flat = []
    for si, seg in enumerate(transcript.get("segments") or []):
        for wi, w in enumerate(seg.get("words") or []):
            flat.append((si, wi, _norm(w.get("text", ""))))
    hits = []
    i = 0
    while i <= len(flat) - len(target):
        if all(flat[i + k][2] == target[k] for k in range(len(target))):
            hits.append([(flat[i + k][0], flat[i + k][1]) for k in range(len(target))])
            i += len(target)
        else:
            i += 1
    return hits


def edit_ops_to_edits(transcript: Optional[dict], ops: List[dict]) -> Tuple[List[dict], List[str]]:
    """Turn edit_audio operations into the editor's edit payload."""
    edits, notes = [], []
    for op in ops or []:
        kind = op.get("op")
        if kind == "tighten_pauses":
            try:
                gap = float(op.get("max_gap") or 0.7)
            except (TypeError, ValueError):
                gap = 0.7
            edits.append({"type": "trim_gaps", "max_gap": max(0.3, min(2.0, gap))})
            continue
        hits = find_phrase(transcript, op.get("phrase") or "")
        if not hits:
            notes.append(f"couldn't find \"{op.get('phrase')}\" in the transcript")
            continue
        occ = op.get("occurrence") or ("first" if kind == "pause" else "all")
        if occ == "first":
            hits = hits[:1]
        elif occ == "last":
            hits = hits[-1:]
        refs = [{"segment_idx": s, "word_idx": w} for h in hits for s, w in h]
        if kind == "bleep":
            edits.append({"type": "bleep", "words": refs, "mode": op.get("mode") or "tone"})
        elif kind == "cut":
            edits.append({"type": "delete", "words": refs})
        elif kind == "pause":
            try:
                secs = float(op.get("seconds") or 1.0)
            except (TypeError, ValueError):
                secs = 1.0
            for h in hits:
                s, w = h[-1]
                edits.append({"type": "pause", "after": {"segment_idx": s, "word_idx": w}, "seconds": secs})
    return edits, notes
