import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  AudioLinesIcon, LayoutGridIcon, ListIcon, MicIcon, OctagonXIcon, RefreshCwIcon, SearchIcon,
  SparklesIcon, TrashIcon, UploadIcon, XIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { listProjects, deleteProject } from '../lib/api'
import { AppHeader, useDisplayName } from '@/components/app/AppHeader'
import { NewProjectDialog } from '@/components/projects/NewProjectDialog'
import { ProjectCard, ProjectRow } from '@/components/projects/ProjectCard'
import { StatCards } from '@/components/ui/stat-cards'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { greeting, humanDuration, parseDuration } from '@/lib/format'
import { land, rise, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

const SORTS = {
  edited: { label: 'Last edited', fn: (a, b) => new Date(b.updated_at) - new Date(a.updated_at) },
  name: { label: 'Name', fn: (a, b) => a.name.localeCompare(b.name) },
  duration: { label: 'Longest', fn: (a, b) => parseDuration(b.duration) - parseDuration(a.duration) },
}

function readPref(key, fallback) {
  try { return localStorage.getItem(key) || fallback } catch { return fallback }
}

function QuickAction({ icon: Icon, title, body, onClick, tone = 'default', kbd }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'group plunk plunk-press flex w-full items-start gap-4 border p-5 text-left outline-hidden focus-visible:outline-2 focus-visible:outline-offset-[5px] focus-visible:outline-solid focus-visible:outline-ring',
        tone === 'brand' ? 'edge-brand border-brand bg-brand text-brand-foreground' : 'edge-card border-border bg-card hover:border-muted-foreground/50'
      )}
    >
      <span className={cn('flex size-11 shrink-0 items-center justify-center', tone === 'brand' ? 'bg-pop-black text-brand' : 'bg-foreground text-background')}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 text-base font-extrabold tracking-tight">
          {title}
          {kbd && <span className={cn('ml-auto hidden border px-1.5 font-mono text-[10px] font-bold sm:inline', tone === 'brand' ? 'border-pop-black/30' : 'border-input text-muted-foreground')}>{kbd}</span>}
        </span>
        <span className={cn('mt-1 block text-[13px] leading-snug', tone === 'brand' ? 'text-pop-black/75' : 'text-muted-foreground')}>{body}</span>
      </span>
    </button>
  )
}

function EmptyState({ onUpload, onRecord }) {
  return (
    <motion.div variants={rise} initial="hidden" animate="show" className="hatch flex flex-col items-center border border-dashed border-input px-6 py-16 text-center">
      <span className="plunk edge-card flex size-14 items-center justify-center border border-border bg-card"><AudioLinesIcon className="size-6" /></span>
      <h2 className="mt-6 font-display text-4xl leading-tight">Your first episode starts here</h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">Drop an audio file anywhere on this page, or record straight from your browser. Sonicly transcribes it so you can edit the sound by editing the words.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={onUpload}><UploadIcon />Upload audio</Button>
        <Button size="lg" variant="outline" onClick={onRecord}><MicIcon />Record</Button>
      </div>
      <ol id="how-it-works" className="mt-12 grid w-full max-w-2xl scroll-mt-24 gap-px border border-border bg-border text-left sm:grid-cols-3">
        {[
          ['01', 'Upload', 'MP3, WAV, M4A or FLAC'],
          ['02', 'Describe the change', '“Remove the ums, warm up my voice”'],
          ['03', 'Export', 'No watermarks, ever'],
        ].map(([n, t, d]) => (
          <li key={n} className="bg-card p-4">
            <span className="font-mono text-[11px] text-muted-foreground">{n}</span>
            <p className="mt-1 text-sm font-bold">{t}</p>
            <p className="text-[12px] text-muted-foreground">{d}</p>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { getToken, authReady } = useAuth()
  const { firstName } = useDisplayName()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState(() => readPref('sonicly-sort', 'edited'))
  const [view, setView] = useState(() => readPref('sonicly-view', 'grid'))
  const [dialog, setDialog] = useState({ open: false, tab: 'upload', file: null })
  const [pendingDelete, setPendingDelete] = useState(null)
  const [dragging, setDragging] = useState(false)

  const load = useCallback(async () => {
    if (!authReady) return
    setLoading(true)
    setError(null)
    try {
      setProjects((await listProjects({ getToken })) || [])
    } catch (err) {
      setError(err.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [getToken, authReady])

  useEffect(() => { load() }, [load])
  useEffect(() => { try { localStorage.setItem('sonicly-sort', sort) } catch { /* ignore */ } }, [sort])
  useEffect(() => { try { localStorage.setItem('sonicly-view', view) } catch { /* ignore */ } }, [view])
  useEffect(() => { document.title = 'Projects — Sonicly' }, [])

  const openNew = (tab = 'upload', file = null) => setDialog({ open: true, tab, file })

  // Drop a file anywhere on the page to start a project.
  useEffect(() => {
    let depth = 0
    const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files')
    const enter = (e) => { if (!hasFiles(e)) return; depth += 1; setDragging(true) }
    const leave = (e) => { if (!hasFiles(e)) return; depth = Math.max(0, depth - 1); if (!depth) setDragging(false) }
    const over = (e) => { if (hasFiles(e)) e.preventDefault() }
    const drop = (e) => {
      if (!hasFiles(e)) return
      e.preventDefault()
      depth = 0
      setDragging(false)
      const f = e.dataTransfer.files?.[0]
      if (f) openNew('upload', f)
    }
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragleave', leave)
    window.addEventListener('dragover', over)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('dragover', over)
      window.removeEventListener('drop', drop)
    }
  }, [])

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return projects.filter((p) => p.name.toLowerCase().includes(q)).sort(SORTS[sort].fn)
  }, [projects, search, sort])

  const stats = useMemo(() => {
    const total = projects.reduce((acc, p) => acc + parseDuration(p.duration), 0)
    return {
      count: projects.length,
      minutes: humanDuration(total),
      exported: projects.filter((p) => p.status === 'Exported').length,
      ready: projects.filter((p) => p.transcript).length,
    }
  }, [projects])

  // Projects that already have a transcript open straight in the editor;
  // new uploads go through Processing, which runs transcription.
  const openProject = (project) => {
    navigate(`${project.transcript ? '/editor' : '/processing'}?p=${project.id}`, { state: { project } })
  }

  const handleCreated = (project) => {
    setProjects((prev) => [project, ...prev])
    setDialog((d) => ({ ...d, open: false }))
    navigate(`/processing?p=${project.id}`, { state: { project } })
  }

  const confirmDelete = async () => {
    const project = pendingDelete
    setPendingDelete(null)
    const prev = projects
    setProjects((p) => p.filter((x) => x.id !== project.id))
    try {
      await deleteProject({ id: project.id, getToken })
      toast.success('Project deleted', { description: project.name })
    } catch (err) {
      setProjects(prev)
      toast.error('Couldn’t delete project', { description: err.message })
    }
  }

  const hasProjects = projects.length > 0

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader
        projects={projects}
        onNewProject={() => openNew('upload')}
        onRecord={() => openNew('record')}
        onOpenProject={openProject}
      />

      <main className="mx-auto max-w-[1200px] px-4 pt-10 pb-24 sm:px-6 lg:pt-14">
        {/* Greeting + quick actions */}
        <motion.section variants={stagger(0.06)} initial="hidden" animate="show">
          <motion.p variants={rise} className="text-caps text-muted-foreground">{greeting()}{firstName ? `, ${firstName}` : ''}</motion.p>
          <motion.h1 variants={rise} className="mt-3 max-w-3xl font-display text-5xl leading-[1.02] sm:text-6xl">
            What are we editing today?
          </motion.h1>
          <motion.div variants={rise} className="mt-8 grid gap-4 md:grid-cols-3">
            <QuickAction tone="brand" icon={UploadIcon} title="Upload audio" body="Drop a file anywhere, or browse. Transcribed in about a minute." onClick={() => openNew('upload')} kbd="U" />
            <QuickAction icon={MicIcon} title="Record now" body="Capture your voice in the browser with a live level meter." onClick={() => openNew('record')} kbd="R" />
            <QuickAction
              icon={SparklesIcon}
              title={hasProjects ? 'Continue editing' : 'How it works'}
              body={hasProjects ? `Pick up “${[...projects].sort(SORTS.edited.fn)[0].name}”.` : 'Describe changes in plain English — Sonicly edits the audio.'}
              onClick={() => (hasProjects ? openProject([...projects].sort(SORTS.edited.fn)[0]) : document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'center' }))}
            />
          </motion.div>
        </motion.section>

        {/* Stats */}
        {hasProjects && (
          <StatCards
            className="mt-12"
            items={[
              { label: 'Projects', value: stats.count },
              { label: 'Audio', value: stats.minutes, caption: 'across all projects' },
              { label: 'Ready to edit', value: stats.ready, caption: 'transcribed', info: 'Projects with a transcript you can edit right away.' },
              { label: 'Exported', value: stats.exported, caption: 'downloaded at least once' },
            ]}
          />
        )}

        {/* Projects */}
        <section className="mt-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-extrabold tracking-tight">Projects</h2>
              {hasProjects && <Badge variant="secondary" className="tabular">{projects.length}</Badge>}
            </div>
            {hasProjects && (
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter projects" className="h-9 pl-9" aria-label="Filter projects" />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" aria-label="Clear filter"><XIcon className="size-3.5" /></button>
                  )}
                </div>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger size="sm" className="h-9 w-36" aria-label="Sort projects"><SelectValue /></SelectTrigger>
                  <SelectContent align="end">
                    {Object.entries(SORTS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <ToggleGroup type="single" variant="outline" size="sm" value={view} onValueChange={(v) => v && setView(v)} aria-label="Layout">
                  <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9"><LayoutGridIcon /></ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view" className="h-9"><ListIcon /></ToggleGroupItem>
                </ToggleGroup>
              </div>
            )}
          </div>

          {error ? (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>Couldn’t load your projects</AlertTitle>
              <AlertDescription>
                <p className="break-all">{error}</p>
                <Button size="sm" variant="outline" className="mt-2" onClick={load}><RefreshCwIcon />Try again</Button>
              </AlertDescription>
            </Alert>
          ) : loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-border bg-card">
                  <Skeleton className="h-28 w-full" />
                  <div className="space-y-2 p-4"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
                </div>
              ))}
            </div>
          ) : !hasProjects ? (
            <EmptyState onUpload={() => openNew('upload')} onRecord={() => openNew('record')} />
          ) : visible.length === 0 ? (
            <div className="border border-dashed border-input px-6 py-14 text-center">
              <p className="text-sm font-bold">No project matches “{search}”</p>
              <Button variant="link" className="mt-2" onClick={() => setSearch('')}>Clear the filter</Button>
            </div>
          ) : view === 'grid' ? (
            <motion.div variants={stagger(0.04)} initial="hidden" animate="show" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visible.map((p) => (
                  <motion.div key={p.id} layout variants={land} exit="exit">
                    <ProjectCard project={p} onOpen={openProject} onDelete={setPendingDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="border border-border bg-card">
              <div className="hidden grid-cols-[minmax(0,1fr)_140px_90px_120px_2rem] gap-4 border-b border-border px-3 py-2.5 sm:grid">
                {['Name', 'Status', 'Length', 'Edited', ''].map((h, i) => <span key={i} className="text-caps text-[9px] text-muted-foreground">{h}</span>)}
              </div>
              <AnimatePresence initial={false}>
                {visible.map((p) => (
                  <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}>
                    <ProjectRow project={p} onOpen={openProject} onDelete={setPendingDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      {/* Full-page drop target */}
      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-overlay p-6"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="flex w-full max-w-xl flex-col items-center border-2 border-dashed border-brand bg-background px-8 py-16 text-center pop-float-lg"
            >
              <UploadIcon className="size-8 text-brand-ink" />
              <p className="mt-4 font-display text-3xl">Drop to start a project</p>
              <p className="mt-2 text-sm text-muted-foreground">We’ll upload it and transcribe it for you.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <NewProjectDialog
        open={dialog.open}
        onOpenChange={(open) => setDialog((d) => ({ ...d, open }))}
        initialTab={dialog.tab}
        initialFile={dialog.file}
        getToken={getToken}
        onCreated={handleCreated}
      />

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="text-destructive-ink"><TrashIcon /></AlertDialogMedia>
            <AlertDialogTitle>Delete “{pendingDelete?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the project, its versions and its transcript. Files you’ve already exported aren’t affected.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>Delete project</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard shortcuts for the quick actions */}
      <Shortcuts onUpload={() => openNew('upload')} onRecord={() => openNew('record')} disabled={dialog.open || Boolean(pendingDelete)} />
    </div>
  )
}

function Shortcuts({ onUpload, onRecord, disabled }) {
  useEffect(() => {
    if (disabled) return undefined
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target
      if (t.closest?.('input, textarea, select, [contenteditable=true], [role=dialog], [role=menu]')) return
      if (e.key === 'u' || e.key === 'U') { e.preventDefault(); onUpload() }
      if (e.key === 'r' || e.key === 'R') { e.preventDefault(); onRecord() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [disabled, onUpload, onRecord])
  return null
}

