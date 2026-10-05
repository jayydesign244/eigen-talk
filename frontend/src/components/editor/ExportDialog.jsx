import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckIcon, DownloadIcon, OctagonXIcon, RotateCcwIcon } from 'lucide-react'
import { exportProject } from '@/lib/api'
import { formatBytes, formatDuration } from '@/lib/format'
import { explainError } from '@/lib/errors'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const FORMATS = [
  { id: 'mp3', label: 'MP3', sub: '320 kbps', note: 'Best for sharing', bps: 320_000 },
  { id: 'wav', label: 'WAV', sub: '24-bit', note: 'Lossless, for editing', bps: 24 * 48_000 * 2 },
  { id: 'm4a', label: 'M4A', sub: 'AAC 256', note: 'Apple Podcasts', bps: 256_000 },
]
// Video projects get the cut video too. Bitrate is a rough libx264 CRF 20 figure.
const VIDEO_FORMAT = { id: 'mp4', label: 'MP4', sub: 'Video', note: 'Picture follows your edits', bps: 0 }
const VIDEO_BPS = { 720: 3_500_000, 1080: 7_000_000 }
const ASPECTS = [
  { id: 'original', label: 'Original' },
  { id: '16:9', label: '16:9', note: 'YouTube' },
  { id: '9:16', label: '9:16', note: 'Reels · TikTok · Shorts' },
  { id: '1:1', label: '1:1', note: 'Feed' },
]

function Segmented({ label, value, onChange, options }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.id)}
              className={cn(
                'border px-3 py-1.5 text-[13px] font-bold transition-[border-color,box-shadow] outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
                on ? 'border-foreground shadow-[inset_0_-3px_0_0_var(--brand)]' : 'border-input hover:border-muted-foreground/60'
              )}
            >
              {o.label}
              {o.note && <span className="ml-1.5 font-mono text-[10px] font-normal text-muted-foreground">{o.note}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ExportDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  isVideo = false,
  versions = [],
  activeVersionId = null,
  durationSec = 0,
  exportHistory = [],
  onExported,
  getToken,
}) {
  const versionOptions = useMemo(() => {
    const sorted = [...versions].sort((a, b) => b.id - a.id)
    const i = sorted.findIndex((v) => v.id === activeVersionId)
    if (i > 0) sorted.unshift(sorted.splice(i, 1)[0])
    return sorted
  }, [versions, activeVersionId])

  const base = useMemo(() => (projectName || 'audio').replace(/\.[a-z0-9]{1,5}$/i, ''), [projectName])
  const formats = isVideo ? [VIDEO_FORMAT, ...FORMATS] : FORMATS
  const [format, setFormat] = useState(isVideo ? 'mp4' : 'mp3')
  const [aspect, setAspect] = useState('original')
  const [resolution, setResolution] = useState(1080)
  const [fit, setFit] = useState('fill')
  const [filename, setFilename] = useState(`${base}_enhanced`)
  const [versionId, setVersionId] = useState(activeVersionId ? String(activeVersionId) : '')
  const [status, setStatus] = useState('idle') // idle | exporting | done | error
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!open) return
    setStatus('idle')
    setError(null)
    setResult(null)
    setFilename(`${base}_enhanced`)
    setFormat(isVideo ? 'mp4' : 'mp3')
    setVersionId(activeVersionId ? String(activeVersionId) : '')
  }, [open, base, activeVersionId, isVideo])

  const selectedVersion = versionOptions.find((v) => String(v.id) === versionId)
  const seconds = selectedVersion?.duration || durationSec || 0
  const bps = format === 'mp4' ? VIDEO_BPS[resolution] + 192_000 : formats.find((f) => f.id === format)?.bps || 0
  const estimate = Math.round((bps * seconds) / 8)

  const handleDownload = async (e) => {
    e?.preventDefault()
    if (!projectId || status === 'exporting' || !filename.trim()) return
    setStatus('exporting')
    setError(null)
    try {
      const res = await exportProject({
        id: projectId,
        format,
        versionId: versionId ? Number(versionId) : null,
        filename,
        video: format === 'mp4' ? { aspect, resolution, fit } : null,
        getToken,
      })
      // Download through a blob so the browser keeps our clean filename.
      const blob = await fetch(res.download_url).then((r) => {
        if (!r.ok) throw new Error(`Download failed (${r.status})`)
        return r.blob()
      })
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = res.filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
      const record = { ...res, exported_at: new Date().toISOString() }
      setResult(record)
      setStatus('done')
      onExported?.(record)
    } catch (err) {
      setError(explainError(err.message, 'Export failed'))
      setStatus('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => status !== 'exporting' && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <AnimatePresence mode="wait" initial={false}>
          {status === 'done' && result ? (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center py-6 text-center">
              <span className="flex size-14 items-center justify-center bg-success text-background"><CheckIcon className="size-7 animate-pop" strokeWidth={3} /></span>
              <DialogTitle className="mt-5 font-display text-3xl font-normal">Your file is ready</DialogTitle>
              <DialogDescription className="mt-2 font-mono text-[12px]">{result.filename} · {formatBytes(result.size_bytes)}</DialogDescription>
              <p className="mt-1 text-[12px] text-muted-foreground">Check your downloads folder. No watermark, ever.</p>
              <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => { setStatus('idle'); setResult(null) }}><RotateCcwIcon />Export another</Button>
                <Button onClick={() => onOpenChange(false)}>Back to editor</Button>
              </div>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleDownload} initial={false} exit={{ opacity: 0 }} className="grid gap-5">
              <DialogHeader>
                <DialogTitle>{isVideo ? 'Export' : 'Export audio'}</DialogTitle>
                <DialogDescription>
                  {isVideo
                    ? 'Export the video with your edited audio, or just the audio. Never watermarked.'
                    : 'Pick a version and format. Exports are full quality and never watermarked.'}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2">
                <Label>Version</Label>
                {versionOptions.length === 0 ? (
                  <p className="border border-dashed border-input px-3 py-2.5 text-[13px] text-muted-foreground">No edits yet — the original audio will be exported.</p>
                ) : (
                  <Select value={versionId} onValueChange={setVersionId}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Choose a version" /></SelectTrigger>
                    <SelectContent>
                      {versionOptions.map((v) => (
                        <SelectItem key={v.id} value={String(v.id)}>
                          {v.label || 'Edit'}
                          <span className="font-mono text-[11px] text-muted-foreground in-data-[highlighted]:text-background/70">
                            {v.duration ? formatDuration(v.duration) : ''}{v.id === activeVersionId ? ' · current' : ''}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Format</Label>
                <div role="radiogroup" aria-label="Format" className={cn('grid gap-2', formats.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3')}>
                  {formats.map((f) => {
                    const on = format === f.id
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setFormat(f.id)}
                        className={cn(
                          'border px-3 py-3 text-left transition-[border-color,box-shadow] outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
                          on ? 'border-foreground shadow-[inset_0_-3px_0_0_var(--brand)]' : 'border-input hover:border-muted-foreground/60'
                        )}
                      >
                        <span className="flex items-baseline justify-between">
                          <span className="text-base font-extrabold">{f.label}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{f.sub}</span>
                        </span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">{f.note}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {format === 'mp4' && (
                <div className="grid gap-4 border border-border bg-muted/40 p-3">
                  <Segmented label="Shape" value={aspect} onChange={setAspect} options={ASPECTS} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Segmented
                      label="Quality"
                      value={resolution}
                      onChange={setResolution}
                      options={[{ id: 720, label: '720p' }, { id: 1080, label: '1080p' }]}
                    />
                    {aspect !== 'original' && (
                      <Segmented
                        label="Framing"
                        value={fit}
                        onChange={setFit}
                        options={[{ id: 'fill', label: 'Fill', note: 'crop' }, { id: 'fit', label: 'Fit', note: 'bars' }]}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="export-name">File name</Label>
                <InputGroup>
                  <InputGroupInput id="export-name" value={filename} onChange={(e) => setFilename(e.target.value)} aria-invalid={!filename.trim()} />
                  <InputGroupAddon align="inline-end"><InputGroupText className="font-mono text-[12px]">.{format}</InputGroupText></InputGroupAddon>
                </InputGroup>
              </div>

              <div className="flex items-center justify-between border-y border-border py-3 text-[13px]">
                <span className="text-muted-foreground">Estimated size</span>
                <span className="font-mono font-bold tabular">{formatBytes(estimate)}{seconds ? <span className="font-normal text-muted-foreground"> · {formatDuration(seconds)}</span> : null}</span>
              </div>

              {error && (
                <Alert variant="destructive">
                  <OctagonXIcon />
                  <AlertTitle>{error.title}</AlertTitle>
                  <AlertDescription><p>{error.body}</p><p className="mt-1 font-mono text-[11px] break-all opacity-70">{error.technical}</p></AlertDescription>
                </Alert>
              )}

              <Button type="submit" variant="brand" size="lg" className="w-full" disabled={status === 'exporting' || !filename.trim()}>
                {status === 'exporting' ? <><Spinner />Rendering {format.toUpperCase()}…</> : <><DownloadIcon />Download</>}
              </Button>

              {exportHistory.length > 0 && (
                <div>
                  <p className="text-caps mb-2 text-muted-foreground">Exported this session</p>
                  <ul className="max-h-28 divide-y divide-border overflow-y-auto border border-border">
                    {exportHistory.map((h, i) => (
                      <li key={`${h.filename}-${h.exported_at}-${i}`} className="flex items-center justify-between px-3 py-2 text-[12px]">
                        <span className="truncate font-medium">{h.filename}</span>
                        <span className="ml-3 shrink-0 font-mono text-muted-foreground">{formatBytes(h.size_bytes)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
