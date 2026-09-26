import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getConsentDetails, submitConsent } from '../lib/api'

const SCOPE_LABELS = {
  'eigentalk:read': 'Read your projects, transcripts and versions',
  'eigentalk:write': 'Edit audio, apply changes and export files',
}

export default function McpAuthorize() {
  const [params] = useSearchParams()
  const requestId = params.get('request_id')
  const { getToken, user } = useAuth()

  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null) // 'approve' | 'deny'

  useEffect(() => {
    if (!requestId) {
      setError('This link is missing an authorization request.')
      return
    }
    getConsentDetails({ requestId, getToken })
      .then(setDetails)
      .catch(() => setError('This authorization request has expired or already been used.'))
  }, [requestId])

  const decide = async (approve) => {
    setBusy(approve ? 'approve' : 'deny')
    setError(null)
    try {
      const { redirect_to } = await submitConsent({ requestId, approve, getToken })
      // Hand control back to the app that asked for access.
      window.location.href = redirect_to
    } catch (err) {
      setError(err.message)
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
              <rect x="6" y="14" width="2" height="4" rx="1" fill="white" />
              <rect x="10" y="10" width="2" height="12" rx="1" fill="white" />
              <rect x="14" y="8" width="2" height="16" rx="1" fill="white" />
              <rect x="18" y="11" width="2" height="10" rx="1" fill="white" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">EigenTalk</span>
        </div>

        {error && !details ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Can’t authorize</h1>
            <p className="text-sm text-gray-500">{error}</p>
          </>
        ) : !details ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-gray-900 mb-1">
              Connect {details.client_name}?
            </h1>
            <p className="text-sm text-gray-500 mb-5">
              It will be able to act on your EigenTalk account
              {user?.email ? <> as <span className="text-gray-700">{user.email}</span></> : null}.
            </p>

            <ul className="space-y-2 mb-6">
              {(details.scopes || []).map(s => (
                <li key={s} className="flex items-start gap-2 text-sm text-gray-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth={2} className="text-accent-500 mt-0.5 flex-shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {SCOPE_LABELS[s] || s}
                </li>
              ))}
            </ul>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={() => decide(true)}
                disabled={!!busy}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {busy === 'approve' ? 'Connecting…' : 'Allow'}
              </button>
              <button
                onClick={() => decide(false)}
                disabled={!!busy}
                className="btn-ghost flex-1 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              You can revoke access at any time from your EigenTalk settings.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
