/**
 * Turn raw API errors ("502 Bad Gateway: {detail: ...}") into a short,
 * human explanation. The raw text stays available as `technical`.
 */
export function explainError(raw, fallbackTitle = 'Something went wrong') {
  const text = String(raw || '')
  const lower = text.toLowerCase()
  const has = (...needles) => needles.some((n) => lower.includes(n))
  let title = fallbackTitle
  let body = 'Please try again in a moment.'
  if (has('insufficient_quota', 'credit_balance', 'no credits')) {
    title = 'The AI service is out of credits'
    body = 'Your audio is saved, but the speech and language service rejected the request because its account has no credits left. Try again once it’s topped up.'
  } else if (has('openai_api_key not configured', 'not configured')) {
    title = 'This feature isn’t set up yet'
    body = 'The server is missing an API key for this feature.'
  } else if (has('could not fetch audio')) {
    title = 'We couldn’t read the uploaded file'
    body = 'The audio may still be uploading or the link expired. Try again, or re-upload the file.'
  } else if (has('401', 'unauthorized', 'invalid token')) {
    title = 'Your session expired'
    body = 'Refresh the page or log in again.'
  } else if (has('failed to fetch', 'networkerror', 'load failed')) {
    title = 'Can’t reach the server'
    body = 'Check your connection and try again.'
  } else if (has('elevenlabs', 'voice')) {
    body = 'The voice service couldn’t complete the request.'
  }
  return { title, body, technical: text }
}
