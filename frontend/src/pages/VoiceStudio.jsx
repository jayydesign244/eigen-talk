import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon, CheckIcon, FileTextIcon, InfoIcon, MicIcon, OctagonXIcon, PlayIcon, PlusIcon, RotateCcwIcon,
  ShieldCheckIcon, SparklesIcon, SquareIcon, StarIcon, Trash2Icon, UploadIcon, Volume2Icon, WandSparklesIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import {
  createVoice, deleteVoice, extractScript, generateSpeech, getVoiceStatus, listVoices, previewVoice, setDefaultVoice,
} from '../lib/api'
import { explainError } from '../lib/errors'
import { formatDuration } from '../lib/format'
import { useMicLevels } from '@/hooks/useMicLevels'
import { LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const WORDS_PER_MIN = 150
const DEFAULT_SETTINGS = { stability: 0.5, similarity: 0.8, style: 0, speed: 1 }
const SETTING_SPECS = [
  { key: 'stability', label: 'Stability', low: 'Expressive', high: 'Steady', min: 0, max: 1, step: 0.05 },
  { key: 'similarity', label: 'Similarity', low: 'Looser', high: 'Closer to the voice', min: 0, max: 1, step: 0.05 },
  { key: 'style', label: 'Style', low: 'Neutral', high: 'Dramatic', min: 0, max: 1, step: 0.05 },
  { key: 'speed', label: 'Speed', low: 'Slower', high: 'Faster', min: 0.7, max: 1.2, step: 0.01 },
]

function playUrl(url) {
  const a = new Audio(url)
  a.play().catch(() => {})
  return a
}

/* ─── One recording step ────────────────────────────────────────── */

function RecordStep({ title, text, hint, blob, onBlob, minSeconds = 3 }) {
  const [stream, setStream] = useState(null)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState(null)
  const recRef = useRef(null)
  const chunks = useRef([])
  const timer = useRef(null)
  const levels = useMicLevels(stream, recording, 32)
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!blob) { setUrl(null); return undefined }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  useEffect(() => () => { clearInterval(timer.current); stream?.getTracks().forEach((t) => t.stop()) }, [stream])

  const start = async () => {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } })
      setStream(s)
      const rec = new MediaRecorder(s)
      recRef.current = rec
      chunks.current = []
      rec.ondataavailable = (e) => { if (e.data?.size) chunks.current.push(e.data) }
      rec.onstop = () => {
        const b = new Blob(chunks.current, { type: rec.mimeType || 'audio/webm' })
        b.seconds = (Date.now() - rec.startedAt) / 1000
        onBlob(b)
        s.getTracks().forEach((t) => t.stop())
        setStream(null)
      }
      rec.startedAt = Date.now()
      rec.start()
      setRecording(true)
      setElapsed(0)
      timer.current = setInterval(() => setElapsed((Date.now() - rec.startedAt) / 1000), 200)
    } catch (err) {
      setError(err?.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it in your browser’s site settings.' : err.message)
    }
  }
  const stop = () => {
    clearInterval(timer.current)
    recRef.current?.stop()
    setRecording(false)
  }
  const tooShort = blob && blob.seconds < minSeconds

  return (
    <div className="grid gap-4">
      <div>
        <p className="text-caps text-muted-foreground">{title}</p>
        <blockquote className="mt-2 border-l-2 border-brand bg-muted/40 px-4 py-3 font-display text-[19px] leading-snug">{text}</blockquote>
        {hint && <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>}
      </div>
      <div className="flex h-14 items-center justify-center gap-[3px] border border-border bg-muted/40 px-3" aria-hidden="true">
        {levels.map((l, i) => (
          <span key={i} className={cn('w-1.5', recording ? 'bg-destructive' : blob ? 'bg-foreground/70' : 'bg-muted-foreground/30')} style={{ height: `${recording ? Math.max(8, l * 100) : blob ? 18 + ((i * 37) % 55) : 10}%` }} />
        ))}
      </div>
      {error && <Alert variant="destructive"><OctagonXIcon /><AlertDescription>{error}</AlertDescription></Alert>}
      <div className="flex flex-wrap items-center gap-2">
        {!recording && !blob && <Button variant="destructive" onClick={start}><MicIcon />Start recording</Button>}
        {recording && <Button onClick={stop}><SquareIcon className="fill-current" />Stop · {formatDuration(elapsed) || '0:00'}</Button>}
        {!recording && blob && (
          <>
            <Button variant="outline" onClick={() => url && playUrl(url)}><PlayIcon />Listen back</Button>
            <Button variant="ghost" onClick={() => { onBlob(null); start() }}><RotateCcwIcon />Record again</Button>
            <span className={cn('ml-auto flex items-center gap-1.5 text-[12px]', tooShort ? 'text-destructive-ink' : 'text-success-ink')}>
              {tooShort ? <><OctagonXIcon className="size-3.5" />Too short — read it all</> : <><CheckIcon className="size-3.5" />{formatDuration(blob.seconds) || '0:00'} recorded</>}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Create-a-voice wizard ─────────────────────────────────────── */

function CreateVoiceDialog({ open, onOpenChange, status, getToken, onCreated }) {
  const [step, setStep] = useState(0)
  const [speaker, setSpeaker] = useState('')
  const [voiceName, setVoiceName] = useState('My voice')
  const [consent, setConsent] = useState(null)
  const [samples, setSamples] = useState([null, null, null])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const paragraphs = status?.reading_script || []
  const consentText = (status?.consent_template || '').replace('{name}', speaker.trim() || 'your name')
  const minSec = status?.min_sample_seconds || 8

  useEffect(() => {
    if (!open) return
    setStep(0); setConsent(null); setSamples([null, null, null]); setError(null); setBusy(false)
  }, [open])

  const steps = ['About you', 'Consent', ...paragraphs.map((_, i) => `Paragraph ${i + 1}`), 'Create']
  const last = steps.length - 1
  const canNext = step === 0 ? speaker.trim().length > 1 && voiceName.trim()
    : step === 1 ? consent && consent.seconds >= 3
      : step < last ? samples[step - 2] && samples[step - 2].seconds >= minSec * 0.6
        : true

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const v = await createVoice({ name: voiceName.trim(), speaker: speaker.trim(), consent, samples: samples.filter(Boolean), getToken })
      toast.success(`“${v.name}” is ready`, { description: 'Pick it under Voice to generate scripts in your own voice.' })
      onCreated(v)
      onOpenChange(false)
    } catch (err) {
      setError(explainError(err.message, 'Couldn’t create the voice'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create your voice</DialogTitle>
          <DialogDescription>About 2 minutes. Read in a quiet room, at your normal pace, the way you usually talk.</DialogDescription>
        </DialogHeader>
        <ol className="flex gap-1" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s} className={cn('h-1 flex-1', i < step ? 'bg-foreground' : i === step ? 'bg-brand' : 'bg-input')} title={s} />
          ))}
        </ol>

        {step === 0 && (
          <div className="grid gap-4">
            <Alert><ShieldCheckIcon /><AlertTitle>Only your own voice</AlertTitle><AlertDescription>You’ll read a short consent statement first. We check it before creating the voice and keep it with your voice. Cloning someone else’s voice isn’t allowed.</AlertDescription></Alert>
            <div className="grid gap-2"><Label htmlFor="vs-speaker">Your full name</Label><Input id="vs-speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} placeholder="As you’ll say it in the consent line" autoComplete="name" /></div>
            <div className="grid gap-2"><Label htmlFor="vs-name">Name this voice</Label><Input id="vs-name" value={voiceName} onChange={(e) => setVoiceName(e.target.value)} /></div>
            <ul className="grid gap-1 text-[12.5px] text-muted-foreground">
              <li>• Quiet room, soft furnishings, no music or fan</li>
              <li>• Mic a hand’s width from your mouth</li>
              <li>• Read naturally — the clone copies how you speak</li>
            </ul>
          </div>
        )}
        {step === 1 && (
          <RecordStep title="Read this consent statement" text={consentText} hint="Read it exactly as written, including your name." blob={consent} onBlob={setConsent} minSeconds={3} />
        )}
        {step >= 2 && step < last && (
          <RecordStep
            key={step}
            title={`Paragraph ${step - 1} of ${paragraphs.length}`}
            text={paragraphs[step - 2]}
            hint="Varied sentences help the clone learn your full range."
            blob={samples[step - 2]}
            onBlob={(b) => setSamples((prev) => prev.map((x, i) => (i === step - 2 ? b : x)))}
            minSeconds={minSec * 0.6}
          />
        )}
        {step === last && (
          <div className="grid gap-3">
            <p className="text-[14px]">Everything’s recorded. Creating <strong>{voiceName}</strong> takes about 10–30 seconds.</p>
            <ul className="grid gap-1 text-[13px]">
              <li className="flex items-center gap-2"><CheckIcon className="size-3.5 text-success" />Consent statement ({formatDuration(consent?.seconds) || '—'})</li>
              {samples.map((s, i) => <li key={i} className="flex items-center gap-2"><CheckIcon className="size-3.5 text-success" />Paragraph {i + 1} ({formatDuration(s?.seconds) || '—'})</li>)}
            </ul>
            {error && (
              <Alert variant="destructive"><OctagonXIcon /><AlertTitle>{error.title}</AlertTitle><AlertDescription>{error.body}</AlertDescription></Alert>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" onClick={() => (step === 0 ? onOpenChange(false) : setStep(step - 1))} disabled={busy}>{step === 0 ? 'Cancel' : 'Back'}</Button>
          {step < last ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}>Next</Button>
          ) : (
            <Button variant="brand" onClick={create} disabled={busy}>{busy ? <><Spinner />Creating</> : <><SparklesIcon />Create my voice</>}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Page ──────────────────────────────────────────────────────── */

export default function VoiceStudio() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const tokenRef = useRef(getToken)
  tokenRef.current = getToken
  const token = (...a) => tokenRef.current(...a)

  const [status, setStatus] = useState(null)
  const [voices, setVoices] = useState({ mine: [], stock: [] })
  const [loading, setLoading] = useState(true)
  const [voice, setVoice] = useState('')
  const [name, setName] = useState('')
  const [script, setScript] = useState('')
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [showSettings, setShowSettings] = useState(false)
  const [previewing, setPreviewing] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState(null)
  const [creating, setCreating] = useState(false)
  const [sayText, setSayText] = useState('Hi! This is my voice, made in Sonicly.')
  const fileRef = useRef(null)

  useEffect(() => { document.title = 'Voice Studio — Sonicly' }, [])

  const load = async () => {
    try {
      const [st, vs] = await Promise.all([getVoiceStatus({ getToken: token }), listVoices({ getToken: token })])
      setStatus(st)
      setVoices(vs)
      setVoice((cur) => cur || (vs.mine.find((v) => v.is_default) || vs.mine[0] || vs.stock[0])?.ref || '')
    } catch (err) {
      toast.error('Couldn’t load Voice Studio', { description: explainError(err.message).body })
    } finally {
      setLoading(false)
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  const chars = script.trim().length
  const words = useMemo(() => (script.trim() ? script.trim().split(/\s+/).length : 0), [script])
  const minutes = words / WORDS_PER_MIN / (settings.speed || 1)
  const left = status?.characters_left
  const overBudget = left != null && chars > left
  const selected = [...voices.mine, ...voices.stock].find((v) => v.ref === voice)

  const preview = async (ref, text) => {
    setPreviewing(ref + text)
    try {
      const res = await previewVoice({ voice: ref, text, settings, getToken: token })
      playUrl(res.url)
      setStatus((s) => (s && s.characters_left != null ? { ...s, characters_left: s.characters_left - res.characters } : s))
    } catch (err) {
      toast.error('Couldn’t play a preview', { description: explainError(err.message).body })
    } finally {
      setPreviewing(null)
    }
  }

  const onFile = async (file) => {
    if (!file) return
    try {
      if (/\.(txt|md|text)$/i.test(file.name)) setScript(await file.text())
      else {
        const res = await extractScript({ file, getToken: token })
        setScript(res.text)
        if (res.truncated) toast.warning('Script shortened', { description: `Only the first ${res.text.length.toLocaleString()} characters fit.` })
      }
      if (!name) setName(file.name.replace(/\.[^.]+$/, ''))
    } catch (err) {
      toast.error('Couldn’t read that file', { description: explainError(err.message).body })
    }
  }

  const generate = async () => {
    setGenerating(true)
    setGenError(null)
    try {
      const project = await generateSpeech({ name: name.trim() || 'Untitled script', text: script, voice, settings, getToken: token })
      toast.success('Your audio is ready', { description: 'Opening it in the editor — everything is editable.' })
      navigate(`/editor?p=${project.id}`, { state: { project } })
    } catch (err) {
      setGenError(explainError(err.message, 'Couldn’t generate the audio'))
      setGenerating(false)
    }
  }

  const firstSentence = (script.trim().match(/^[^.!?]{1,280}[.!?]?/) || [''])[0]

  return (
    <div className="min-h-dvh bg-background">
      <header className="flex h-14 items-center gap-2 border-b border-border px-3 sm:px-6">
        <Button asChild variant="ghost" size="icon-sm"><Link to="/dashboard" aria-label="Back to projects"><ArrowLeftIcon /></Link></Button>
        <LogoMark className="size-7" />
        <h1 className="ml-1 text-[15px] font-bold">Voice Studio</h1>
      </header>

      <main className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {loading ? (
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground"><Spinner />Loading…</div>
        ) : (
          <>
            {/* Script → audio */}
            <section className="min-w-0 border border-border bg-card">
              <div className="border-b border-border px-5 py-4">
                <h2 className="font-display text-3xl">Script to audio</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">Paste or upload a script and get a finished, editable recording in your chosen voice.</p>
              </div>
              <div className="grid gap-5 px-5 py-5">
                {!status?.configured && (
                  <Alert variant="destructive"><OctagonXIcon /><AlertTitle>Voice generation isn’t set up</AlertTitle><AlertDescription>The server has no ElevenLabs key.</AlertDescription></Alert>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="vs-title">Project name</Label>
                    <Input id="vs-title" value={name} onChange={(e) => setName(e.target.value)} placeholder="Episode 12 intro" />
                  </div>
                  <div className="grid min-w-0 gap-2">
                    <Label>Voice</Label>
                    <Select value={voice} onValueChange={setVoice}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Choose a voice" /></SelectTrigger>
                      <SelectContent className="max-h-80">
                        {voices.mine.length > 0 && (
                          <SelectGroup>
                            <SelectLabel>My voices</SelectLabel>
                            {voices.mine.map((v) => <SelectItem key={v.ref} value={v.ref}>{v.name}{v.is_default ? ' · default' : ''}</SelectItem>)}
                          </SelectGroup>
                        )}
                        <SelectGroup>
                          <SelectLabel>Built-in voices</SelectLabel>
                          {voices.stock.map((v) => <SelectItem key={v.ref} value={v.ref}>{v.name}</SelectItem>)}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-end justify-between gap-2">
                    <Label htmlFor="vs-script">Script</Label>
                    <Button variant="outline" size="xs" onClick={() => fileRef.current?.click()}><UploadIcon />Upload .txt or .docx</Button>
                    <input ref={fileRef} type="file" accept=".txt,.md,.docx,text/plain" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
                  </div>
                  <Textarea
                    id="vs-script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder={'Write or paste your script here.\n\nBlank lines become natural paragraph pauses.'}
                    className="min-h-64 text-[15px] leading-relaxed"
                    maxLength={status?.max_script_chars || 50000}
                  />
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11.5px] text-muted-foreground">
                    <span>{chars.toLocaleString()} characters</span>
                    <span>~{words.toLocaleString()} words</span>
                    <span>{words === 0 ? '≈ 0 s' : minutes < 1 ? `≈ ${Math.max(1, Math.round(minutes * 60))} s` : `≈ ${minutes.toFixed(1)} min`}</span>
                    {left != null && <span className={cn(overBudget && 'text-destructive-ink')}>uses {chars.toLocaleString()} of {left.toLocaleString()} credits left</span>}
                  </div>
                </div>

                <div className="border border-border">
                  <button type="button" onClick={() => setShowSettings((s) => !s)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-[13px] font-semibold" aria-expanded={showSettings}>
                    <WandSparklesIcon className="size-3.5" />Delivery
                    <span className="ml-auto font-mono text-[11px] font-normal text-muted-foreground">
                      {JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS) ? 'Default' : 'Custom'}
                    </span>
                  </button>
                  {showSettings && (
                    <div className="grid gap-3 border-t border-border px-4 py-4 sm:grid-cols-2">
                      {SETTING_SPECS.map((s) => (
                        <div key={s.key}>
                          <div className="flex justify-between text-[11.5px]"><span>{s.low}</span><span className="font-semibold">{s.label} {settings[s.key].toFixed(2)}</span><span>{s.high}</span></div>
                          <Slider value={[settings[s.key]]} min={s.min} max={s.max} step={s.step} onValueChange={([v]) => setSettings((p) => ({ ...p, [s.key]: v }))} aria-label={s.label} />
                        </div>
                      ))}
                      <Button variant="ghost" size="xs" className="justify-self-start" onClick={() => setSettings(DEFAULT_SETTINGS)}><RotateCcwIcon />Reset</Button>
                    </div>
                  )}
                </div>

                {genError && <Alert variant="destructive"><OctagonXIcon /><AlertTitle>{genError.title}</AlertTitle><AlertDescription>{genError.body}</AlertDescription></Alert>}

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => preview(voice, firstSentence)} disabled={!voice || !firstSentence || Boolean(previewing) || generating}>
                    {previewing === voice + firstSentence ? <Spinner /> : <Volume2Icon />}Preview first sentence
                  </Button>
                  <Button variant="brand" size="lg" onClick={generate} disabled={!voice || !chars || overBudget || generating || !status?.configured}>
                    {generating ? <><Spinner />Generating {minutes >= 1 ? `${minutes.toFixed(1)} min` : ''}…</> : <><SparklesIcon />Generate audio</>}
                  </Button>
                </div>
                {selected && <p className="-mt-2 text-right text-[11.5px] text-muted-foreground">Voice: {selected.name}{selected.description ? ` — ${selected.description}` : ''}</p>}
              </div>
            </section>

            {/* My voices */}
            <aside className="grid content-start gap-4">
              <section className="border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h2 className="text-[14px] font-bold">My voices</h2>
                  <Button size="xs" variant="outline" onClick={() => setCreating(true)} disabled={!status?.can_clone}><PlusIcon />Create my voice</Button>
                </div>
                <div className="grid gap-3 px-4 py-4">
                  {!status?.can_clone && status?.configured && (
                    <Alert>
                      <InfoIcon />
                      <AlertTitle>Voice cloning isn’t enabled yet</AlertTitle>
                      <AlertDescription>
                        The server’s ElevenLabs plan ({status.plan || 'unknown'}) doesn’t include voice cloning — it needs Starter or higher. You can still generate scripts with the built-in voices.
                      </AlertDescription>
                    </Alert>
                  )}
                  {voices.mine.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">Read a consent line and three short paragraphs, and your scripts — and any word you rewrite in the editor — will sound like you.</p>
                  ) : (
                    <>
                      <ul className="divide-y divide-border border border-border">
                        {voices.mine.map((v) => (
                          <li key={v.id} className="flex items-center gap-2 px-3 py-2">
                            <MicIcon className="size-3.5 shrink-0 text-muted-foreground" />
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{v.name}</span>
                            <Button size="icon-xs" variant="ghost" aria-label={`Preview ${v.name}`} onClick={() => preview(v.ref, sayText)} disabled={Boolean(previewing)}>
                              {previewing === v.ref + sayText ? <Spinner /> : <PlayIcon />}
                            </Button>
                            <Button size="icon-xs" variant="ghost" aria-label={v.is_default ? 'Default voice' : `Make ${v.name} the default`} onClick={async () => { await setDefaultVoice({ voiceId: v.id, getToken: token }); load() }}>
                              <StarIcon className={cn(v.is_default && 'fill-current text-brand')} />
                            </Button>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              aria-label={`Delete ${v.name}`}
                              onClick={async () => {
                                if (!window.confirm(`Delete “${v.name}”? Projects already made keep their audio.`)) return
                                try { await deleteVoice({ voiceId: v.id, getToken: token }); load() } catch (err) { toast.error('Couldn’t delete', { description: explainError(err.message).body }) }
                              }}
                            >
                              <Trash2Icon />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <div className="grid gap-1.5">
                        <Label htmlFor="vs-say" className="text-[12px]">Hear it say…</Label>
                        <Input id="vs-say" value={sayText} onChange={(e) => setSayText(e.target.value.slice(0, 300))} className="h-8 text-[12.5px]" />
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="border border-border bg-card px-4 py-4 text-[12.5px] text-muted-foreground">
                <p className="flex items-center gap-2 font-semibold text-foreground"><FileTextIcon className="size-3.5" />How it works</p>
                <ul className="mt-2 grid gap-1.5">
                  <li>• Long scripts are generated in parts and joined seamlessly, with natural pauses between paragraphs.</li>
                  <li>• The result opens in the editor with a word-by-word transcript — cut, rewrite, add music or effects like any recording.</li>
                  <li>• Built-in voices: {voices.stock.length}. Credits left this month: {left != null ? left.toLocaleString() : '—'}.</li>
                </ul>
              </section>
            </aside>
          </>
        )}
      </main>

      <CreateVoiceDialog
        open={creating}
        onOpenChange={setCreating}
        status={status}
        getToken={token}
        onCreated={(v) => { setVoice(v.ref); load() }}
      />
    </div>
  )
}
