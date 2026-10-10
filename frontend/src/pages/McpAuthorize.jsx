import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { BotIcon, CheckIcon, EyeIcon, OctagonXIcon, PencilLineIcon, ShieldCheckIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getConsentDetails, submitConsent } from '../lib/api'
import { explainError } from '../lib/errors'
import { Logo, LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { rise, stagger } from '@/lib/motion'

const SCOPES = {
  'eigentalk:read': { icon: EyeIcon, title: 'Read your projects', body: 'Projects, transcripts and versions' },
  'eigentalk:write': { icon: PencilLineIcon, title: 'Edit on your behalf', body: 'Apply edits, clean audio and export files' },
}

/**
 * OAuth consent for MCP clients (Claude, Cursor, …) asking to act on a
 * Sonicly account. Shows who is asking, exactly what they get, and where
 * the user will be sent back to.
 */
export default function McpAuthorize() {
  const [params] = useSearchParams()
  const requestId = params.get('request_id')
  const { getToken, user } = useAuth()

  const [details, setDetails] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(null) // 'approve' | 'deny'

  useEffect(() => { document.title = 'Authorize access — Sonicly' }, [])

  useEffect(() => {
    if (!requestId) {
      setError({ title: 'This link is incomplete', body: 'It’s missing an authorization request. Start the connection again from the app that sent you here.', fatal: true })
      return
    }
    getConsentDetails({ requestId, getToken })
      .then(setDetails)
      .catch(() => setError({ title: 'This request has expired', body: 'Authorization links work once and expire quickly. Start the connection again from the app that sent you here.', fatal: true }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId])

  const decide = async (approve) => {
    setBusy(approve ? 'approve' : 'deny')
    setError(null)
    try {
      const { redirect_to } = await submitConsent({ requestId, approve, getToken })
      window.location.href = redirect_to
    } catch (err) {
      setError(explainError(err.message, 'Couldn’t complete the request'))
      setBusy(null)
    }
  }

  const account = details?.account_email || user?.email

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center border-b border-border px-4 sm:px-6">
        <Link to="/dashboard" aria-label="Sonicly"><Logo /></Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div variants={stagger(0.06)} initial="hidden" animate="show" className="w-full max-w-md">
          {/* Who is connecting to whom */}
          <motion.div variants={rise} className="flex items-center justify-center gap-3" aria-hidden="true">
            <span className="surface-tile flex size-14 items-center justify-center rounded-full"><BotIcon className="size-6" /></span>
            <span className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1.5 bg-muted-foreground"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
              <ShieldCheckIcon className="mx-1 size-4 text-brand-ink" />
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="size-1.5 bg-muted-foreground"
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 + i * 0.2 }}
                />
              ))}
            </span>
            <LogoMark className="size-14 overflow-hidden rounded-2xl shadow-soft" />
          </motion.div>

          {error?.fatal ? (
            <motion.div variants={rise} className="mt-8 text-center">
              <h1 className="font-display text-4xl leading-tight">{error.title}</h1>
              <p className="mt-3 text-sm text-muted-foreground">{error.body}</p>
              <Button asChild variant="outline" className="mt-8"><Link to="/dashboard">Go to your projects</Link></Button>
            </motion.div>
          ) : !details ? (
            <div className="mt-8 space-y-4" aria-busy="true">
              <Skeleton className="mx-auto h-9 w-3/4" />
              <Skeleton className="mx-auto h-4 w-1/2" />
              <Skeleton className="mt-6 h-40 w-full" />
            </div>
          ) : (
            <>
              <motion.div variants={rise} className="mt-8 text-center">
                <h1 className="font-display text-4xl leading-tight">
                  Connect <span className="underline decoration-brand decoration-[3px] underline-offset-[6px]">{details.client_name}</span>?
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                  It wants access to your Sonicly account{account ? <> as <span className="font-bold text-foreground">{account}</span></> : null}.
                </p>
              </motion.div>

              <motion.div variants={rise} className="mt-8 border border-border bg-card">
                <p className="text-caps border-b border-border px-4 py-3 text-muted-foreground">It will be able to</p>
                <ul className="divide-y divide-border">
                  {(details.scopes || []).map((s) => {
                    const scope = SCOPES[s] || { icon: CheckIcon, title: s, body: 'Custom permission' }
                    const Icon = scope.icon
                    return (
                      <li key={s} className="flex items-start gap-3 px-4 py-3.5">
                        <span className="flex size-8 shrink-0 items-center justify-center bg-foreground text-background"><Icon className="size-4" /></span>
                        <span>
                          <span className="block text-sm font-bold">{scope.title}</span>
                          <span className="block text-[13px] text-muted-foreground">{scope.body}</span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
                <p className="border-t border-border px-4 py-3 text-[12px] text-muted-foreground">It can’t see your password or payment details.</p>
              </motion.div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <OctagonXIcon />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription>{error.body}</AlertDescription>
                </Alert>
              )}

              <motion.div variants={rise} className="mt-6 grid gap-3">
                <Button size="lg" variant="brand" onClick={() => decide(true)} disabled={Boolean(busy)}>
                  {busy === 'approve' ? <><Spinner />Connecting</> : `Allow ${details.client_name}`}
                </Button>
                <Button size="lg" variant="ghost" onClick={() => decide(false)} disabled={Boolean(busy)}>
                  {busy === 'deny' ? <><Spinner />Cancelling</> : 'Cancel'}
                </Button>
              </motion.div>
              <motion.p variants={rise} className="mt-6 text-center text-[12px] text-muted-foreground">
                You’ll be sent back to {details.client_name} after you choose.
              </motion.p>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}
