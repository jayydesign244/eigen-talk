import { transcribeAudio } from './api'

// One transcription per project at a time, even if a screen's effect
// re-runs (React dev double-invokes effects; Clerk can hand us a new
// getToken). Both Processing and Editor go through this.
const inflight = new Map()

export function transcribeOnce(id, getToken) {
  if (!inflight.has(id)) {
    inflight.set(id, transcribeAudio({ id, getToken }).finally(() => inflight.delete(id)))
  }
  return inflight.get(id)
}
