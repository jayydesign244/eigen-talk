/** "3:42" from seconds; null when unknown. */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`
}

/** Seconds from "m:ss" or "h:mm:ss"; 0 when it can't be parsed. */
export function parseDuration(text) {
  if (!text) return 0
  const parts = String(text).split(':').map(Number)
  if (parts.some((n) => !Number.isFinite(n))) return 0
  return parts.reduce((acc, n) => acc * 60 + n, 0)
}

/** "1 h 44 m" / "12 m" / "40 s" — for totals. */
export function humanDuration(seconds) {
  if (!seconds) return '0 m'
  const h = Math.floor(seconds / 3600)
  const m = Math.round((seconds % 3600) / 60)
  if (h) return `${h} h ${m} m`
  if (m) return `${m} m`
  return `${Math.round(seconds)} s`
}

export function relativeTime(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Math.max(0, (Date.now() - then) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) {
    const h = Math.floor(diff / 3600)
    return `${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diff < 86400 * 2) return 'yesterday'
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} days ago`
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function getAudioDuration(blob) {
  return new Promise((resolve) => {
    const audio = document.createElement('audio')
    audio.preload = 'metadata'
    const url = URL.createObjectURL(blob)
    audio.src = url
    const done = (val) => {
      URL.revokeObjectURL(url)
      resolve(val)
    }
    audio.addEventListener('loadedmetadata', () => done(audio.duration))
    audio.addEventListener('error', () => done(NaN))
  })
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '—'
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`
  return `${bytes} B`
}

export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Working late'
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
