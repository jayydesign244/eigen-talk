import { cn } from '@/lib/utils'

/** The Sonicly mark: four level bars in a solid square; the first bar is "live" aqua. */
export function LogoMark({ className }) {
  return (
    <span className={cn('inline-flex size-8 shrink-0 items-center justify-center bg-foreground', className)} aria-hidden="true">
      <svg viewBox="0 0 20 20" className="size-[62%]">
        <rect x="1" y="7" width="3" height="6" fill="var(--brand)" />
        <rect x="6" y="4" width="3" height="12" fill="var(--background)" />
        <rect x="11" y="1.5" width="3" height="17" fill="var(--background)" />
        <rect x="16" y="6" width="3" height="8" fill="var(--background)" />
      </svg>
    </span>
  )
}

export function Logo({ className, markClassName, showWordmark = true }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={markClassName} />
      {showWordmark && <span className="font-display text-xl leading-none tracking-tight">Sonicly</span>}
    </span>
  )
}
