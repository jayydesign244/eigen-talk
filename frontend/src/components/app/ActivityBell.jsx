import { useMemo, useState } from 'react'
import { AudioLinesIcon, BellIcon, DownloadIcon, FileWarningIcon, UploadIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationCenter } from '@/components/ui/notification-center'
import { relativeTime } from '@/lib/format'

const SEEN_KEY = 'sonicly-activity-seen'

function readSeen() {
  try { return Number(localStorage.getItem(SEEN_KEY)) || 0 } catch { return 0 }
}

function dayGroup(iso) {
  const d = new Date(iso)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const y = new Date(today)
  y.setDate(today.getDate() - 1)
  if (d.toDateString() === y.toDateString()) return 'Yesterday'
  return 'Earlier'
}

/**
 * Turn the project list into an activity feed. Only facts the API actually
 * gives us: when a project was created, whether it has a transcript or an
 * export, and whether audio is missing.
 */
function toActivity(projects, seen, onOpen) {
  const items = []
  for (const p of projects) {
    const created = new Date(p.created_at).getTime()
    const updated = new Date(p.updated_at).getTime()
    items.push({
      id: `${p.id}-created`, at: created, category: 'uploads', icon: UploadIcon, tone: 'default',
      title: 'Project created', body: p.name,
    })
    if (!p.audio_url) {
      items.push({
        id: `${p.id}-noaudio`, at: updated, category: 'attention', icon: FileWarningIcon, tone: 'warning',
        title: 'Needs audio', body: `${p.name} has no audio yet.`,
      })
    } else if (p.transcript) {
      items.push({
        id: `${p.id}-ready`, at: updated, category: 'ready', icon: AudioLinesIcon, tone: 'brand',
        title: 'Ready to edit', body: p.name, actions: [{ label: 'Open', primary: true, onClick: () => onOpen?.(p) }],
      })
    }
    if (p.status === 'Exported') {
      items.push({
        id: `${p.id}-exported`, at: updated, category: 'ready', icon: DownloadIcon, tone: 'success',
        title: 'Exported', body: p.name,
      })
    }
  }
  return items
    .sort((a, b) => b.at - a.at)
    .slice(0, 30)
    .map((it) => ({ ...it, time: relativeTime(new Date(it.at).toISOString()).replace(' ago', ''), group: dayGroup(it.at), unread: it.at > seen }))
}

const FILTERS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'ready', label: 'Ready', match: (i) => i.category === 'ready' },
  { value: 'attention', label: 'Needs you', match: (i) => i.category === 'attention' },
]

/** Header bell: project activity in a Notification Center popover. */
export function ActivityBell({ projects = [], onOpenProject }) {
  const [seen, setSeen] = useState(readSeen)
  const [open, setOpen] = useState(false)
  const items = useMemo(() => toActivity(projects, seen, (p) => { setOpen(false); onOpenProject?.(p) }), [projects, seen, onOpenProject])
  const unread = items.filter((i) => i.unread).length

  const markAllRead = () => {
    const now = Date.now()
    setSeen(now)
    try { localStorage.setItem(SEEN_KEY, String(now)) } catch { /* private mode */ }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label={unread ? `Activity, ${unread} unread` : 'Activity'}>
          <BellIcon />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 animate-pop items-center justify-center bg-brand px-1 font-mono text-[9px] font-bold text-brand-foreground tabular">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0">
        <NotificationCenter
          title="Activity"
          className="max-w-none"
          items={items}
          filters={FILTERS}
          onMarkAllRead={markAllRead}
          onItemClick={(it) => {
            const pid = Number(String(it.id).split('-')[0])
            const p = projects.find((x) => x.id === pid)
            if (p) { setOpen(false); onOpenProject?.(p) }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
