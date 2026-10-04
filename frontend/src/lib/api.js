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

export async function exportProject({ id, format, versionId, filename, getToken } = {}) {
  const res = await authedFetch(`${API_URL}/projects/${id}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      format,
      version_id: versionId ?? null,
      filename: filename ?? null,
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

export async function streamChat({ projectId, threadId, messages, getToken, onDelta, signal }) {
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
        if (data.done) return
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }
}
