import { ArrowUpRightIcon, FilmIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react'
import { Waveform } from '@/components/audio/Waveform'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/** What a project needs next, shown as a status badge. */
export function projectStage(p) {
  if (!p.audio_url) return { label: 'No audio', variant: 'destructive' }
  if (p.status === 'Exported') return { label: 'Exported', variant: 'success' }
  if (!p.transcript) return { label: 'Needs transcript', variant: 'warning' }
  if (p.status === 'In Progress') return { label: 'Editing', variant: 'info' }
  return { label: 'Ready to edit', variant: 'secondary' }
}

function ProjectMenu({ project, onOpen, onDelete, className }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={className}
          aria-label={`Actions for ${project.name}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onSelect={() => onOpen(project)}><ArrowUpRightIcon />Open</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => onDelete(project)}><TrashIcon />Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ProjectCard({ project, onOpen, onDelete }) {
  const stage = projectStage(project)
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(project) }}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border-[0.8px] border-border bg-card shadow-soft outline-hidden transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-float active:translate-y-0 active:scale-[0.99] has-[button:active]:scale-100 focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-solid focus-visible:outline-ring"
      aria-label={`Open ${project.name}`}
    >
      <div className="relative flex h-28 items-center border-b border-border bg-muted/40 px-4">
        <Waveform
          seed={project.id * 17 + 3}
          bars={44}
          height={56}
          progress={project.transcript ? 1 : 0}
          playedClassName="text-foreground/85 group-hover:text-foreground"
          idleClassName="text-muted-foreground/35"
        />
        <Badge variant={stage.variant} className="absolute top-3 left-3">{stage.label}</Badge>
        {project.media_type === 'video' && (
          <span className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 px-1.5 py-0.5 font-mono text-[11px] font-bold"><FilmIcon className="size-3" />VIDEO</span>
        )}
        {project.duration && (
          <span className="absolute right-3 bottom-2.5 bg-background/90 px-1.5 py-0.5 font-mono text-[11px] font-bold tabular">{project.duration}</span>
        )}
      </div>
      <div className="flex items-start gap-2 p-4 pr-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-tight">{project.name}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Edited {relativeTime(project.updated_at)}</p>
        </div>
        <ProjectMenu project={project} onOpen={onOpen} onDelete={onDelete} className="-mt-1 opacity-60 group-hover:opacity-100 data-[state=open]:opacity-100" />
      </div>
    </div>
  )
}

export function ProjectRow({ project, onOpen, onDelete }) {
  const stage = projectStage(project)
  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(project) }}
      className="group grid cursor-pointer grid-cols-[minmax(0,1fr)_2rem] items-center gap-4 border-b border-border px-3 py-3 outline-hidden transition-colors last:border-b-0 hover:bg-accent/60 focus-visible:bg-accent sm:grid-cols-[minmax(0,1fr)_140px_90px_120px_2rem]"
      aria-label={`Open ${project.name}`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden w-20 shrink-0 sm:block"><Waveform seed={project.id * 17 + 3} bars={18} height={24} progress={project.transcript ? 1 : 0} playedClassName="text-foreground/80" /></div>
        <p className="truncate text-sm font-bold">{project.name}</p>
      </div>
      <span className="hidden sm:block"><Badge variant={stage.variant}>{stage.label}</Badge></span>
      <span className="hidden font-mono text-[12px] tabular sm:block">{project.duration || '—'}</span>
      <span className={cn('hidden text-[12px] text-muted-foreground sm:block')}>{relativeTime(project.updated_at)}</span>
      <ProjectMenu project={project} onOpen={onOpen} onDelete={onDelete} className="opacity-60 group-hover:opacity-100 data-[state=open]:opacity-100" />
    </div>
  )
}
