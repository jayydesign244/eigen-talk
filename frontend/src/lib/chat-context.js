// m:ss, short enough for a 56px attachment tile.
const fmtClock = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/**
 * Transcript context that rides along with a chat message: lines the user
 * attached and searches for phrases they quoted. It's appended to the
 * message text the model sees (and that gets saved), in a plain format we
 * can parse back when a conversation is reopened.
 */
const MARK = '\n\n[Context from the transcript]\n'

/** The backend sends the model at most this much transcript (see _chat_system_prompt). */
export const TRANSCRIPT_BUDGET = 6000
/** gpt-4o-mini, the backend's default chat model. */
export const MODEL_CONTEXT = 128_000
/** Length of the backend's SYSTEM_PROMPT, so the estimate starts from the real baseline. */
const SYSTEM_PROMPT_CHARS = 1059

const norm = (s) => (s || '').toLowerCase().replace(/[^\p{L}\p{N}']+/gu, ' ').trim()

/** A transcript segment as an attachment tile. */
export function lineAttachment(transcript, si) {
  const seg = transcript?.segments?.[si]
  if (!seg) return null
  const text = seg.words.map((w) => (w.text || '').trim()).join(' ').trim()
  const end = seg.end ?? seg.words[seg.words.length - 1]?.end ?? seg.start
  return {
    id: `line-${si}`,
    kind: 'audio',
    name: `${fmtClock(seg.start)}–${fmtClock(end)}`,
    start: seg.start,
    end,
    text,
  }
}

/** Phrases the user put in double quotes, e.g. cut every “you know”. */
export function quotedPhrases(text) {
  const out = []
  for (const m of (text || '').matchAll(/["“]([^"“”]{1,60})["”]/g)) {
    const p = m[1].trim()
    if (norm(p) && !out.some((x) => norm(x) === norm(p))) out.push(p)
  }
  return out.slice(0, 4)
}

/** Every place a phrase is spoken, as start times. Matches whole words, ignoring case and punctuation. */
export function searchTranscript(transcript, phrase) {
  const target = norm(phrase).split(' ')
  if (!target[0]) return []
  const words = []
  transcript?.segments?.forEach((seg) => seg.words.forEach((w) => words.push({ t: norm(w.text), start: w.start })))
  const hits = []
  for (let i = 0; i + target.length <= words.length; i++) {
    if (target.every((t, k) => words[i + k].t === t)) hits.push(words[i].start)
  }
  return hits
}

export function buildContext({ lines = [], searches = [] }) {
  if (!lines.length && !searches.length) return ''
  const rows = [
    ...lines.map((l) => `Line ${l.name}: "${l.text}"`),
    ...searches.map((s) => `Search "${s.phrase}": ${s.hits.length} match${s.hits.length === 1 ? '' : 'es'}${s.hits.length ? ` at ${s.hits.slice(0, 12).map(fmtClock).join(', ')}` : ''}`),
  ]
  return MARK + rows.join('\n')
}

const parseClock = (s) => s.split(':').reduce((acc, n) => acc * 60 + Number(n), 0)

/** Split a saved message back into what the user typed and its context. */
export function splitContext(content) {
  const at = (content || '').indexOf(MARK)
  if (at < 0) return { text: content, lines: [], searches: [] }
  const lines = []
  const searches = []
  for (const row of content.slice(at + MARK.length).split('\n')) {
    let m = row.match(/^Line ([\d:]+)–([\d:]+): "(.*)"$/)
    if (m) {
      lines.push({ id: `line-${m[1]}`, kind: 'audio', name: `${m[1]}–${m[2]}`, start: parseClock(m[1]), end: parseClock(m[2]), text: m[3] })
      continue
    }
    m = row.match(/^Search "(.*)": \d+ match(?:es)?(?: at (.*))?$/)
    if (m) searches.push({ phrase: m[1], hits: m[2] ? m[2].split(', ').map(parseClock) : [] })
  }
  return { text: content.slice(0, at), lines, searches }
}

/** Saved thread messages → panel messages, re-creating attachments and search logs. */
export function toPanelMessages(saved = []) {
  const out = []
  for (const m of saved) {
    if (m.role !== 'user') { out.push({ role: m.role, text: m.content }); continue }
    const { text, lines, searches } = splitContext(m.content)
    out.push({ role: 'user', text, content: m.content, attachments: lines })
    if (searches.length) out.push({ role: 'search', searches })
  }
  return out
}

/**
 * A rough token budget for the next reply, using ~4 characters per token.
 * Mirrors what the backend sends: system prompt + filler list, the
 * transcript (capped at TRANSCRIPT_BUDGET characters) and the conversation.
 */
export function estimateContext({ transcriptChars = 0, fillerCount = 0, messages = [] }) {
  const tok = (chars) => Math.ceil(chars / 4)
  const instructions = tok(SYSTEM_PROMPT_CHARS + (fillerCount ? 120 + fillerCount * 8 : 0))
  const transcript = tok(Math.min(transcriptChars, TRANSCRIPT_BUDGET))
  const conversation = tok(messages.filter((m) => m.role === 'user' || m.role === 'ai').reduce((n, m) => n + (m.content || m.text || '').length, 0))
  return {
    used: instructions + transcript + conversation,
    max: MODEL_CONTEXT,
    buckets: [
      { label: 'Instructions', value: instructions, color: 'var(--muted-foreground)' },
      { label: 'Transcript', value: transcript, color: 'var(--brand)' },
      { label: 'Conversation', value: conversation, color: 'var(--info)' },
    ],
  }
}
