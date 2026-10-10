import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FileAudioIcon, FileVideoIcon, MicIcon, OctagonXIcon, RotateCcwIcon, SquareIcon, UploadIcon, XIcon } from 'lucide-react'
import { createProject, uploadAudio } from '@/lib/api'
import { formatBytes, formatDuration, getAudioDuration } from '@/lib/format'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useMicLevels as useLevels } from '@/hooks/useMicLevels'

const ACCEPT = 'audio/*,video/*,.mp3,.wav,.m4a,.flac,.aac,.ogg,.webm,.mp4,.mov,.m4v'

const isVideoFile = (f) => Boolean(f) && (f.type?.startsWith('video/') || /\.(mp4|mov|m4v|mkv|avi|3gpp?)$/i.test(f.name || ''))

function stripExt(name) {
  return name.replace(/\.[^.]+$/, '')
}

function Dropzone({ file, onFile, disabled }) {
  const inputRef = useRef(null)
  const [over, setOver] = useState(false)
  if (file) {
    return (
      <div className="flex items-center gap-3 border border-foreground bg-card p-3.5 animate-rise">
        <span className="flex size-10 shrink-0 items-center justify-center border border-border bg-muted">
          {isVideoFile(file) ? <FileVideoIcon className="size-5" /> : <FileAudioIcon className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{file.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">
            {formatBytes(file.size)}{isVideoFile(file) ? ' · video — you’ll edit its audio, the picture follows' : ''}
          </p>
        </div>
        {!disabled && (
          <Button variant="ghost" size="icon-sm" onClick={() => onFile(null)} aria-label="Remove file"><XIcon /></Button>
        )}
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f)
      }}
      className={cn(
        'hatch group flex w-full flex-col items-center justify-center gap-3 border border-dashed px-6 py-10 text-center transition-colors outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
        over ? 'border-brand bg-brand-soft' : 'border-input hover:border-foreground'
      )}
    >
      <span className={cn('surface-tile flex size-12 items-center justify-center rounded-full transition-transform', over && 'scale-110')}>
        <UploadIcon className="size-5" />
      </span>
      <span className="text-sm font-bold">{over ? 'Drop it' : 'Drop an audio or video file, or browse'}</span>
      <span className="font-mono text-[11px] text-muted-foreground">MP3 · WAV · M4A · FLAC · MP4 · MOV · WEBM</span>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </button>
  )
}

function Recorder({ disabled, onRecorded, recordedBlob, onDiscard, setRecordingState }) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const levels = useLevels(stream, recording)

  const stopTracks = useCallback(() => {
    setStream((s) => {
      s?.getTracks().forEach((t) => t.stop())
      return null
    })
  }, [])

  useEffect(() => () => {
    clearInterval(timerRef.current)
    stopTracks()
  }, [stopTracks])

  const start = async () => {
    setError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(s)
      const recorder = new MediaRecorder(s)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data?.size) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        onRecorded(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }))
        stopTracks()
      }
      recorder.start()
      setRecording(true)
      setRecordingState(true)
      setElapsed(0)
      const startedAt = Date.now()
      timerRef.current = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 200)
    } catch (err) {
      setError(err?.name === 'NotAllowedError' ? 'Microphone access was blocked. Allow it in your browser’s site settings and try again.' : err.message || 'Could not start the microphone')
    }
  }

  const stop = () => {
    clearInterval(timerRef.current)
    recorderRef.current?.stop()
    setRecording(false)
    setRecordingState(false)
  }

  return (
    <div className="flex flex-col items-center gap-5 py-2">
      <div className="flex h-20 w-full items-center justify-center gap-[3px] border border-border bg-muted/50 px-4" aria-hidden="true">
        {levels.map((l, i) => (
          <span
            key={i}
            className={cn('w-1.5 transition-[height] duration-75', recording ? 'bg-destructive' : recordedBlob ? 'bg-foreground' : 'bg-muted-foreground/30')}
            style={{ height: `${recording ? Math.max(6, l * 100) : recordedBlob ? 20 + ((i * 37) % 60) : 8}%` }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2.5 font-mono text-3xl font-bold tabular" aria-live="polite">
        {recording && <span className="size-2.5 animate-live rounded-full bg-destructive" />}
        {formatDuration(elapsed) || '0:00'}
      </div>
      {error && (
        <Alert variant="destructive"><OctagonXIcon /><AlertDescription className="text-foreground">{error}</AlertDescription></Alert>
      )}
      <div className="flex items-center gap-3">
        {!recording && !recordedBlob && (
          <Button variant="destructive" size="lg" onClick={start} disabled={disabled}><MicIcon />Start recording</Button>
        )}
        {recording && (
          <Button size="lg" onClick={stop}><SquareIcon className="fill-current" />Stop</Button>
        )}
        {!recording && recordedBlob && (
          <Button variant="outline" onClick={() => { setElapsed(0); onDiscard() }} disabled={disabled}><RotateCcwIcon />Record again</Button>
        )}
      </div>
    </div>
  )
}

/**
 * Start a project from an uploaded file or a browser recording. Creates the
 * project, uploads the audio, then hands the new project to `onCreated`.
 */
export function NewProjectDialog({ open, onOpenChange, initialTab = 'upload', initialFile = null, getToken, onCreated }) {
  const [tab, setTab] = useState(initialTab)
  const [file, setFile] = useState(initialFile)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recording, setRecording] = useState(false)
  const [name, setName] = useState('')
  const [nameTouched, setNameTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    setTab(initialTab)
    setFile(initialFile)
    setRecordedBlob(null)
    setError(null)
    setBusy(false)
    setNameTouched(false)
    setName(initialFile ? stripExt(initialFile.name) : '')
  }, [open, initialTab, initialFile])

  const pickFile = (f) => {
    setFile(f)
    setError(null)
    if (f && !nameTouched) setName(stripExt(f.name))
  }

  const source = tab === 'upload' ? file : recordedBlob
  const canSubmit = Boolean(source) && !busy && !recording

  const submit = async (e) => {
    e?.preventDefault()
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    try {
      const projectName = name.trim() || (tab === 'upload' ? stripExt(file.name) : 'Untitled recording')
      const upload = tab === 'upload'
        ? file
        : new File([recordedBlob], `${projectName}.${(recordedBlob.type.split('/')[1] || 'webm').split(';')[0]}`, { type: recordedBlob.type })
      const dur = await getAudioDuration(upload)
      const created = await createProject({ name: projectName, duration: formatDuration(dur) || undefined, getToken })
      const uploaded = await uploadAudio({ id: created.id, file: upload, getToken })
      onCreated(uploaded || created)
    } catch (err) {
      setError(err.message || 'Upload failed')
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && !recording && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Upload a recording or a video, or capture one now. We’ll transcribe it so you can edit audio like text.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5">
          <Tabs value={tab} onValueChange={(v) => !busy && !recording && setTab(v)}>
            <TabsList className="w-full">
              <TabsTrigger value="upload" disabled={busy || recording}><UploadIcon />Upload</TabsTrigger>
              <TabsTrigger value="record" disabled={busy}><MicIcon />Record</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="pt-2">
              <Dropzone file={file} onFile={pickFile} disabled={busy} />
            </TabsContent>
            <TabsContent value="record" className="pt-2">
              <Recorder
                disabled={busy}
                recordedBlob={recordedBlob}
                onRecorded={setRecordedBlob}
                onDiscard={() => setRecordedBlob(null)}
                setRecordingState={setRecording}
              />
            </TabsContent>
          </Tabs>

          <AnimatePresence initial={false}>
            {source && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid gap-2 overflow-hidden">
                <Label htmlFor="np-name">Project name</Label>
                <Input
                  id="np-name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameTouched(true) }}
                  placeholder={tab === 'upload' ? 'Name it after the episode' : 'Untitled recording'}
                  disabled={busy}
                  autoComplete="off"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <Alert variant="destructive"><OctagonXIcon /><AlertDescription className="text-foreground">{error}</AlertDescription></Alert>
          )}
          {busy && (
            <div className="grid gap-2" aria-live="polite">
              <div className="flex justify-between text-[13px]">
                <span className="font-bold">{tab === 'upload' && isVideoFile(file) ? 'Uploading and preparing video' : 'Uploading'}</span>
                <span className="text-muted-foreground">Keep this window open</span>
              </div>
              <Progress />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy || recording}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit}>
              {busy ? <><Spinner />Uploading</> : 'Create project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
