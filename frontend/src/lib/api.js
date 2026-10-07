const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function authHeaders(getToken, fresh = false) {
  const token = getToken ? await getToken(fresh ? { skipCache: true } : undefined) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * fetch with the Clerk session token. A tab that sat idle can hold a stale
 * cached token, so a 401 is retried once with a freshly minted one.
 */
async function authedFetch(url, init = {}, getToken) {
  const send = async (fresh) =>
    fetch(url, { ...init, headers: { ...(init.headers || {}), ...(await authHeaders(getToken, fresh)) } })
  let res = await send(false)
  if (res.status === 401 && getToken) res = await send(true)
  return res
}

async function handleJson(res) {
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}: ${detail}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function listProjects({ getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/`, {}, getToken)
  return handleJson(res)
}

export async function createProject({ name, duration, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, ...(duration ? { duration } : {}) }),
  }, getToken)
  return handleJson(res)
}

export async function deleteProject({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}`, {
    method: 'DELETE',
  }, getToken)
  return handleJson(res)
}

export async function uploadAudio({ id, file, getToken } = {}) {
  const form = new FormData()
  form.append('file', file)
  const res = await authedFetch(`${API_URL}/projects/${id}/upload`, {
    method: 'POST',
    body: form,
  }, getToken)
  return handleJson(res)
}

export async function getProject({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}`, {}, getToken)
  return handleJson(res)
}

export async function transcribeAudio({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/transcribe`, {
    method: 'POST',
  }, getToken)
  return handleJson(res)
}

export async function cloneVoice({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/voice/clone`, {
    method: 'POST',
  }, getToken)
  return handleJson(res)
}

export async function detectFillers({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/fillers`, {
    method: 'POST',
  }, getToken)
  return handleJson(res)
}

// OAuth endpoints live at the server root, not under /api.
const ROOT_URL = API_URL.replace(/\/api\/?$/, '')

export async function getConsentDetails({ requestId, getToken } = {}) {
  const res = await authedFetch(`${ROOT_URL}/oauth/consent/${requestId}`, {}, getToken)
  return handleJson(res)
}

export async function submitConsent({ requestId, approve, getToken } = {}) {
  const res = await authedFetch(`${ROOT_URL}/oauth/consent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request_id: requestId, approve }),
  }, getToken)
  return handleJson(res)
}

export async function listThreads({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/threads`, {}, getToken)
  return handleJson(res)
}

export async function createThread({ id, title, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: title ?? null }),
  }, getToken)
  return handleJson(res)
}

export async function renameThread({ id, threadId, title, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/threads/${threadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  }, getToken)
  return handleJson(res)
}

export async function deleteThread({ id, threadId, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/threads/${threadId}`, {
    method: 'DELETE',
  }, getToken)
  if (!res.ok) throw new Error(`Delete failed (${res.status})`)
}

export async function listThreadMessages({ id, threadId, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/threads/${threadId}/messages`, {}, getToken)
  return handleJson(res)
}

export async function removeNoise({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/denoise`, {
    method: 'POST',
  }, getToken)
  return handleJson(res)
}

export async function applyEdits({ id, edits, parentVersionId, label, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/edits/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      edits,
      parent_version_id: parentVersionId ?? null,
      label: label ?? null,
    }),
  }, getToken)
  return handleJson(res)
}

export async function listVersions({ id, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/versions`, {}, getToken)
  return handleJson(res)
}

export async function exportProject({ id, format, versionId, filename, video, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format,
      version_id: versionId ?? null,
      filename: filename ?? null,
      // MP4 only: { aspect, resolution, fit }
      ...(video || {}),
    }),
  }, getToken)
  return handleJson(res)
}

export async function activateVersion({ id, versionId, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/versions/${versionId}/activate`, {
    method: 'POST',
  }, getToken)
  return handleJson(res)
}

export async function streamChat({ projectId, threadId, messages, getToken, onDelta, onEvent, signal }) {
  const res = await authedFetch(`${API_URL}/projects/${projectId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      thread_id: threadId ?? null,
      messages: messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.text ?? m.content ?? '',
      })),
    }),
    signal,
  }, getToken)

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Chat failed (${res.status}): ${detail}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''

    for (const event of events) {
      const line = event.split('\n').find(l => l.startsWith('data: '))
      if (!line) continue
      try {
        const data = JSON.parse(line.slice(6))
        if (data.error) throw new Error(data.error)
        if (data.delta) onDelta(data.delta)
        if (data.sound || data.version) onEvent?.(data)
        if (data.done) return
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }
}

/* ─── Sound engine ───────────────────────────────────────────── */

const jsonInit = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body ?? {}),
})

export async function getSoundRegistry({ getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/sound/registry`, {}, getToken))
}

export async function getSound({ id, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound`, {}, getToken))
}

export async function putSound({ id, doc, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound`, jsonInit('PUT', { doc }), getToken))
}

export async function soundAction({ id, action, getToken } = {}) {
  // action: 'undo' | 'reset'
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/${action}`, { method: 'POST' }, getToken))
}

export async function applySoundLook({ id, lookId, strength = 1, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/look`, jsonInit('POST', { look_id: lookId, strength }), getToken))
}

export async function previewSound({ id, doc, getToken, signal } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/preview`, { ...jsonInit('POST', { doc }), signal }, getToken))
}

export async function applySound({ id, doc, label, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/apply`, jsonInit('POST', { doc, label: label || null }), getToken))
}

export async function analyzeSound({ id, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/analyze`, { method: 'POST' }, getToken))
}

export async function uploadSoundLayer({ id, file, kind, getToken } = {}) {
  const form = new FormData()
  form.append('file', file)
  form.append('kind', kind)
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/layers`, { method: 'POST', body: form }, getToken))
}

export async function listSoundPresets({ getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/sound/presets`, {}, getToken))
}

export async function createSoundPreset({ name, doc, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/sound/presets`, jsonInit('POST', { name, doc }), getToken))
}

export async function deleteSoundPreset({ presetId, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/sound/presets/${presetId}`, { method: 'DELETE' }, getToken))
}

export async function applySoundPreset({ id, presetId, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/projects/${id}/sound/preset/${presetId}`, { method: 'POST' }, getToken))
}

/* ─── Voice Studio ───────────────────────────────────────────── */

export async function getVoiceStatus({ getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/voices/status`, {}, getToken))
}

export async function listVoices({ getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/voices`, {}, getToken))
}

export async function createVoice({ name, speaker, consent, samples, getToken } = {}) {
  const form = new FormData()
  form.append('name', name)
  form.append('speaker', speaker)
  form.append('consent', consent, 'consent.webm')
  samples.forEach((s, i) => form.append('samples', s, `sample_${i + 1}.webm`))
  return handleJson(await authedFetch(`${API_URL}/voices`, { method: 'POST', body: form }, getToken))
}

export async function deleteVoice({ voiceId, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/voices/${voiceId}`, { method: 'DELETE' }, getToken))
}

export async function setDefaultVoice({ voiceId, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/voices/${voiceId}/default`, { method: 'POST' }, getToken))
}

export async function previewVoice({ voice, text, settings, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/voices/preview`, jsonInit('POST', { voice, text, ...settings }), getToken))
}

export async function extractScript({ file, getToken } = {}) {
  const form = new FormData()
  form.append('file', file)
  return handleJson(await authedFetch(`${API_URL}/voices/script/extract`, { method: 'POST', body: form }, getToken))
}

export async function generateSpeech({ name, text, voice, settings, getToken } = {}) {
  return handleJson(await authedFetch(`${API_URL}/voices/generate`, jsonInit('POST', { name, text, voice, ...settings }), getToken))
}
