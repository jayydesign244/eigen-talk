import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, OctagonXIcon, RefreshCwIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { detectFillers, getProject, transcribeAudio } from '../lib/api'
import { Logo } from '@/components/brand/Logo'
import { Waveform } from '@/components/audio/Waveform'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { ease } from '@/lib/motion'
import { explainError } from '@/lib/errors'

const STEPS = [
  { id: 'upload', label: 'Audio uploaded', headline: 'Got your audio.' },
  { id: 'transcribe', label: 'Writing the transcript', headline: 'Listening closely…' },
  { id: 'fillers', label: 'Finding filler words', headline: 'Finding the ums…' },
  { id: 'ready', label: 'Ready to edit', headline: 'Ready when you are.' },
]

function useElapsed(running) {
  const [s, setS] = useState(0)
  useEffect(() => {
    if (!running) return undefined
    setS(0)
    const t0 = Date.now()
    const id = setInterval(() => setS(Math.floor((Date.now() - t0) / 1000)), 500)
    return () => clearInterval(id)
  }, [running])
  return s
}

// One transcription per project at a time, even if the effect re-runs
// (React dev double-invokes effects; Clerk can hand us a new getToken).
const inflight = new Map()
function transcribeOnce(id, getToken) {
  if (!inflight.has(id)) {
    inflight.set(id, transcribeAudio({ id, getToken }).finally(() => inflight.delete(id)))
  }
  return inflight.get(id)
}

function wordCount(transcript) {
  return transcript?.segments?.reduce((acc, s) => acc + (s.words?.length || 0), 0) || 0
}

/**
 * Runs the real preparation work for a new upload — transcription and filler
 * detection — and shows each step as it actually happens, then opens the
 * editor. Projects that are already transcribed pass straight through.
 */
export default function Processing() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getToken } = useAuth()
  const initial = location.state?.project

  const [step, setStep] = useState('upload')
  const [project, setProject] = useState(initial)
  const [details, setDetails] = useState({})
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const navTimer = useRef(null)
  const tokenRef = useRef(getToken)
  tokenRef.current = getToken
  const elapsed = useElapsed(step === 'transcribe' && !error)

  useEffect(() => { document.title = 'Preparing — Sonicly' }, [])

  useEffect(() => {
    if (!initial?.id) return undefined
    let cancelled = false
    setError(null)
    const getToken = (...args) => tokenRef.current(...args)
    const run = async () => {
      try {
        setStep('upload')
        let fresh = await getProject({ id: initial.id, getToken })
        if (cancelled) return
        if (!fresh.audio_url) {
          setError({ title: 'This project has no audio', body: 'Upload a file to it from the dashboard to start editing.', fatal: true })
          return
        }
        setProject(fresh)
        if (!fresh.transcript) {
          setStep('transcribe')
          fresh = await transcribeOnce(initial.id, getToken)
          if (cancelled) return
          setProject(fresh)
        }
        setDetails((d) => ({ ...d, words: wordCount(fresh.transcript) }))
        setStep('fillers')
        const res = await detectFillers({ id: initial.id, getToken }).catch(() => null)
        if (cancelled) return
        setDetails((d) => ({ ...d, fillers: res?.total ?? res?.fillers?.length ?? 0 }))
        setStep('ready')
        navTimer.current = setTimeout(() => navigate('/editor', { state: { project: fresh }, replace: true }), 1400)
      } catch (err) {
        if (!cancelled) setError(explainError(err.message, 'Transcription didn’t finish'))
      }
    }
    run()
    return () => { cancelled = true; clearTimeout(navTimer.current) }
  }, [initial?.id, attempt, navigate])

  if (!initial?.id) return <Navigate to="/dashboard" replace />

  const index = STEPS.findIndex((s) => s.id === step)
  const headline = error ? 'Something went wrong.' : STEPS[index].headline
  const fileName = project?.name || 'Untitled'
  const progress = step === 'ready' ? 100 : step === 'fillers' ? 85 : step === 'upload' ? 15 : undefined

  const detailFor = (id) => {
    if (id === 'upload') return project?.duration ? `${project.duration} of audio` : null
    if (id === 'transcribe') {
      if (index > 1) return `${details.words ?? 0} words`
      if (step === 'transcribe') return `${elapsed}s`
    }
    if (id === 'fillers' && index > 2) return `${details.fillers ?? 0} found`
    return null
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <Link to="/dashboard" aria-label="Sonicly — projects"><Logo /></Link>
        <Button asChild variant="ghost" size="sm"><Link to="/dashboard"><ArrowLeftIcon />Projects</Link></Button>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl">
          <p className="text-caps truncate text-muted-foreground">
            Preparing <span className="text-foreground">{fileName}</span>
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={headline}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: ease.out }}
              className="mt-3 font-display text-5xl leading-[1.04] sm:text-6xl"
            >
              {headline}
            </motion.h1>
          </AnimatePresence>

          {/* Waveform with a scan line while we listen */}
          <div className="relative mt-10 overflow-hidden border border-border bg-card px-5 py-6">
            <Waveform
              seed={(initial.id || 1) * 17 + 3}
              bars={64}
              height={72}
              progress={step === 'ready' ? 1 : 0}
              animate={!error && step !== 'ready'}
              playedClassName="text-foreground"
              idleClassName="text-muted-foreground/45"
            />
            {!error && step === 'transcribe' && (
              <motion.span
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-brand/25 to-transparent"
                initial={{ left: '-10%' }}
                animate={{ left: '100%' }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Steps */}
          <ol className="mt-8 border-t border-border" aria-live="polite">
            {STEPS.map((s, i) => {
              const state = error && i === index ? 'error' : i < index || step === 'ready' ? 'done' : i === index ? 'active' : 'pending'
              const detail = detailFor(s.id)
              return (
                <li key={s.id} className={cn('flex items-center gap-3 border-b border-border py-3.5 transition-opacity duration-300', state === 'pending' && 'opacity-40')}>
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center border transition-colors',
                      state === 'done' && 'border-success bg-success text-background',
                      state === 'active' && 'border-foreground text-brand',
                      state === 'error' && 'border-destructive bg-destructive text-destructive-foreground',
                      state === 'pending' && 'border-input'
                    )}
                  >
                    {state === 'done' && <CheckIcon className="size-3.5 animate-pop" strokeWidth={3.5} />}
                    {state === 'active' && <Spinner className="size-3.5" />}
                    {state === 'error' && <OctagonXIcon className="size-3.5" />}
                  </span>
                  <span className={cn('text-[15px]', state === 'active' ? 'font-bold' : 'font-medium')}>{s.label}</span>
                  {detail && <span className="ml-auto font-mono text-[12px] text-muted-foreground tabular">{detail}</span>}
                </li>
              )
            })}
          </ol>

          {error ? (
            <Alert variant="destructive" className="mt-6 animate-rise">
              <OctagonXIcon />
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>
                <p>{error.body}</p>
                {error.technical && (
                  <details className="mt-2 text-[12px]">
                    <summary className="cursor-pointer font-semibold text-muted-foreground hover:text-foreground">Technical details</summary>
                    <p className="mt-1 font-mono break-all text-muted-foreground">{error.technical}</p>
                  </details>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {!error.fatal && <Button size="sm" onClick={() => setAttempt((a) => a + 1)}><RefreshCwIcon />Try again</Button>}
                  {!error.fatal && (
                    <Button size="sm" variant="outline" onClick={() => navigate('/editor', { state: { project }, replace: true })}>Open editor anyway</Button>
                  )}
                  <Button size="sm" variant="ghost" asChild><Link to="/dashboard">Back to projects</Link></Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="mt-6 flex items-center gap-4">
              <Progress value={progress} className="flex-1" tone={step === 'ready' ? 'success' : 'brand'} />
              {step === 'ready' ? (
                <Button size="sm" onClick={() => navigate('/editor', { state: { project }, replace: true })}>Open editor<ArrowRightIcon /></Button>
              ) : (
                <span className="text-[12px] text-muted-foreground">Keep this tab open</span>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
