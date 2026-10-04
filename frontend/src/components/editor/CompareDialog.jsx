import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRightIcon, DownloadIcon, PauseIcon, PlayIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { formatDuration } from '@/lib/format'
import { cn } from '@/lib/utils'

function words(transcript) {
  return transcript?.segments?.reduce((acc, s) => acc + (s.words?.length || 0), 0) || 0
}

function Delta({ label, a, b, format = (v) => v, lowerIsBetter }) {
  const diff = b - a
  const better = lowerIsBetter ? diff < 0 : diff > 0
  return (
    <div className="border-l border-border pl-4 first:border-l-0 first:pl-0">
      <p className="text-caps text-muted-foreground">{label}</p>
      <p className="mt-2 flex items-baseline gap-2 font-mono text-sm tabular">
        <span className="text-muted-foreground">{format(a)}</span>
        <ArrowRightIcon className="size-3 self-center text-muted-foreground" />
        <span className="text-lg font-bold">{format(b)}</span>
      </p>
      {diff !== 0 && (
        <p className={cn('mt-1 text-[11px] font-bold', better ? 'text-success-ink' : 'text-muted-foreground')}>
          {diff > 0 ? '+' : '−'}{format(Math.abs(diff))}
        </p>
      )}
    </div>
  )
}

/**
 * Real A/B listening between two saved versions. One shared playhead:
 * switching sides keeps the position, so you hear exactly what changed.
 */
export function CompareDialog({ open, onOpenChange, versions = [], activeVersionId, onExport }) {
  const sorted = useMemo(() => [...versions].sort((a, b) => a.id - b.id), [versions])
  const original = sorted.find((v) => v.label === 'Original') || sorted[0]
  const current = sorted.find((v) => v.id === activeVersionId) || sorted[sorted.length - 1]
  const [aId, setAId] = useState(original ? String(original.id) : '')
  const [bId, setBId] = useState(current ? String(current.id) : '')
  const [side, setSide] = useState('b')
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const audioA = useRef(null)
  const audioB = useRef(null)

  useEffect(() => {
    if (!open) { audioA.current?.pause(); audioB.current?.pause(); setPlaying(false); return }
    setAId(original ? String(original.id) : '')
    setBId(current ? String(current.id) : '')
    setSide('b')
    setTime(0)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const a = sorted.find((v) => String(v.id) === aId)
  const b = sorted.find((v) => String(v.id) === bId)
  const active = side === 'a' ? audioA : audioB
  const other = side === 'a' ? audioB : audioA
  const total = (side === 'a' ? a?.duration : b?.duration) || 0

  const switchTo = (next) => {
    if (!next || next === side) return
    const from = side === 'a' ? audioA.current : audioB.current
    const to = next === 'a' ? audioA.current : audioB.current
    const t = from?.currentTime || 0
    const wasPlaying = from && !from.paused
    from?.pause()
    if (to) {
      to.currentTime = Math.min(t, to.duration || t)
      if (wasPlaying) to.play().catch(() => {})
    }
    setSide(next)
  }

  const toggle = () => {
    const el = active.current
    if (!el) return
    other.current?.pause()
    if (el.paused) el.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    else { el.pause(); setPlaying(false) }
  }

  if (sorted.length < 2) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Compare versions</DialogTitle>
            <DialogDescription>Make your first edit — remove a few fillers, for example — and you’ll be able to A/B it against the original here.</DialogDescription>
          </DialogHeader>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Back to editor</Button>
        </DialogContent>
      </Dialog>
    )
  }

  const pickers = [
    ['a', 'A', aId, setAId],
    ['b', 'B', bId, setBId],
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compare versions</DialogTitle>
          <DialogDescription>One playhead for both — flip between A and B while it plays to hear exactly what changed.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {pickers.map(([key, letter, value, setValue]) => (
            <div key={key} className={cn('border p-3 transition-colors', side === key ? 'border-foreground' : 'border-border')}>
              <div className="mb-2 flex items-center justify-between">
                <span className={cn('flex size-6 items-center justify-center text-[12px] font-extrabold', side === key ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground')}>{letter}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{formatDuration(sorted.find((v) => String(v.id) === value)?.duration) || '—'}</span>
              </div>
              <Select value={value} onValueChange={(v) => { audioA.current?.pause(); audioB.current?.pause(); setPlaying(false); setValue(v) }}>
                <SelectTrigger size="sm" className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sorted.map((v) => <SelectItem key={v.id} value={String(v.id)}>{v.label || `Version ${v.id}`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 border border-border bg-muted/40 p-4">
          <Button size="icon-lg" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <PauseIcon className="fill-current" /> : <PlayIcon className="fill-current" />}</Button>
          <div className="min-w-0 flex-1">
            <div className="h-1.5 w-full bg-input">
              <div className="h-full bg-brand transition-[width] duration-200" style={{ width: `${total ? Math.min(100, (time / total) * 100) : 0}%` }} />
            </div>
            <p className="mt-1.5 font-mono text-[11px] text-muted-foreground tabular">{formatDuration(time) || '0:00'} / {formatDuration(total) || '0:00'}</p>
          </div>
          <ToggleGroup type="single" variant="outline" value={side} onValueChange={switchTo} aria-label="Listen to">
            <ToggleGroupItem value="a" className="w-12 font-extrabold">A</ToggleGroupItem>
            <ToggleGroupItem value="b" className="w-12 font-extrabold">B</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {a && b && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Delta label="Length" a={a.duration || 0} b={b.duration || 0} format={(v) => formatDuration(v) || '0:00'} lowerIsBetter />
            <Delta label="Words" a={words(a.transcript)} b={words(b.transcript)} lowerIsBetter />
            <div className="hidden border-l border-border pl-4 sm:block">
              <p className="text-caps text-muted-foreground">B is</p>
              <p className="mt-2 text-sm font-bold">{b.label}</p>
              <p className="text-[11px] text-muted-foreground">{new Date(b.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Back to editor</Button>
          <Button onClick={() => { onOpenChange(false); onExport?.() }}><DownloadIcon />Export</Button>
        </div>

        {a && <audio ref={audioA} src={a.audio_url} preload="auto" onTimeUpdate={(e) => side === 'a' && setTime(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />}
        {b && <audio ref={audioB} src={b.audio_url} preload="auto" onTimeUpdate={(e) => side === 'b' && setTime(e.currentTarget.currentTime)} onEnded={() => setPlaying(false)} />}
      </DialogContent>
    </Dialog>
  )
}
