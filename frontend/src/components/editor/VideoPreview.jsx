import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, FilmIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

/**
 * Read-only video preview for video projects. It never plays its own sound:
 * the edited audio drives it (see useVideoSync), so cutting a word in the
 * transcript cuts the picture too.
 */
export function VideoPreview({ src, meta, onVideo, onToggle }) {
  const [collapsed, setCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const portrait = meta?.width && meta?.height && meta.height > meta.width

  return (
    <div className="shrink-0 border-b border-border bg-muted/40">
      <div className="flex h-9 items-center gap-2 px-4 sm:px-8">
        <FilmIcon className="size-3.5 text-muted-foreground" />
        <span className="text-caps text-muted-foreground">Video preview</span>
        <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
          {meta?.width && meta?.height ? `${meta.width}×${meta.height}` : ''} · follows your audio edits
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex items-center gap-1 text-[12px] text-muted-foreground outline-hidden hover:text-foreground focus-visible:underline"
          aria-expanded={!collapsed}
        >
          {collapsed ? <>Show <ChevronDownIcon className="size-3.5" /></> : <>Hide <ChevronUpIcon className="size-3.5" /></>}
        </button>
      </div>
      <div className={cn('flex justify-center px-4 pb-4 sm:px-8', collapsed && 'hidden')}>
        <div className={cn('relative overflow-hidden border border-border bg-black', portrait ? 'h-[34vh] aspect-[9/16]' : 'w-full max-w-xl aspect-video max-h-[34vh]')}>
          <video
            ref={onVideo}
            src={src}
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setLoading(false)}
            onClick={onToggle}
            className="size-full cursor-pointer object-contain"
            aria-label="Video preview, click to play or pause"
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-[12px] text-white/70"><Spinner />Loading video…</div>
          )}
        </div>
      </div>
    </div>
  )
}
