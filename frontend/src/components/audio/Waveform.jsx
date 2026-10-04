import { useMemo } from 'react'
import { cn } from '@/lib/utils'

/** Deterministic pseudo-random bar heights so a project always has the same "shape". */
export function generateBars(seed, count) {
  const bars = []
  let s = Math.abs(Number(seed) || 42)
  for (let i = 0; i < count; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    const envelope = Math.pow(Math.sin(((i + 0.5) / count) * Math.PI), 0.5)
    const noise = (s % 1000) / 1000
    const secondary = Math.abs(Math.sin(i * 0.37 + (Number(seed) || 1) * 0.11)) * 0.35
    bars.push(Math.min(0.98, Math.max(0.08, (noise * 0.55 + secondary + 0.1) * envelope)))
  }
  return bars
}

/**
 * Square-bar waveform drawn in currentColor. `progress` (0–1) paints the
 * played part in `playedClassName`; `highlight` is a set of bar indexes to
 * mark (e.g. filler words) in the warning colour.
 */
export function Waveform({
  seed = 42,
  bars = 64,
  height = 48,
  gap = 2,
  progress = 0,
  highlight,
  className,
  playedClassName = 'text-foreground',
  idleClassName = 'text-muted-foreground/40',
  animate = false,
}) {
  const data = useMemo(() => generateBars(seed, bars), [seed, bars])
  const playedUntil = Math.round(progress * bars)
  return (
    <div className={cn('flex w-full items-center', className)} style={{ height, gap }} aria-hidden="true">
      {data.map((h, i) => (
        <span
          key={i}
          className={cn(
            'min-w-0 flex-1 bg-current transition-[height,color] duration-300',
            highlight?.has(i) ? 'text-warning' : i < playedUntil ? playedClassName : idleClassName,
            animate && 'animate-eq'
          )}
          style={{
            height: `${Math.max(6, h * 100)}%`,
            animationDelay: animate ? `${(i % 12) * 0.08}s` : undefined,
          }}
        />
      ))}
    </div>
  )
}

export default Waveform
