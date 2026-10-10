import { useEffect, useRef, useState } from 'react'
import {
  AudioLinesIcon, BotIcon, ClockIcon, DownloadIcon, FileAudioIcon, FolderIcon, GitBranchIcon,
  HistoryIcon, ListChecksIcon, PaperclipIcon, RefreshCwIcon, RotateCcwIcon, ShieldCheckIcon, SparklesIcon,
  UploadIcon, UsersIcon, WandSparklesIcon, ZapIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AgentThinking } from '@/components/ui/agent-thinking'
import { ComposerLoader } from '@/components/ui/composer-loader'
import { Composer, ComposerStatus } from '@/components/ui/composer'
import { ComposerPanel, ComposerPicker } from '@/components/ui/composer-panel'
import { ComposerAttachments } from '@/components/ui/composer-attachments'
import { AgentProgress } from '@/components/ui/agent-progress'
import { TaskList } from '@/components/ui/task-list'
import { WebSearch } from '@/components/ui/web-search'
import { AgentLimitsCard } from '@/components/ui/agent-limits-card'
import { NotificationCenter } from '@/components/ui/notification-center'
import { StatCards } from '@/components/ui/stat-cards'
import { NewBadge, PageHeader, Preview, PropsTable, Section, Usage } from './kit'

/** Re-runs a scripted sequence of state changes; returns [state, replay]. */
function useScript(steps, initial) {
  const [state, setState] = useState(initial)
  const [run, setRun] = useState(0)
  useEffect(() => {
    setState(typeof initial === 'function' ? initial() : initial)
    const timers = steps.map(([at, fn]) => setTimeout(() => setState((s) => fn(s)), at))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run])
  return [state, () => setRun((r) => r + 1)]
}

const Replay = ({ onClick }) => (
  <div className="mb-4"><Button variant="outline" size="sm" onClick={onClick}><RotateCcwIcon />Replay</Button></div>
)

/* ─── Agent Thinking ─────────────────────────────────────────── */

function AgentThinkingPage() {
  const [since] = useState(() => Date.now())
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Agent thinking" description="The line that sits above a composer while the agent works: an indicator, a shimmering label and an elapsed timer. Four indicators, all drawn on the square grid." />
      <Section title="Variants">
        <Preview center={false} contentClassName="grid gap-5 sm:grid-cols-2">
          <AgentThinking variant="wave" label="Thinking" since={since} />
          <AgentThinking variant="spin" label="Working" since={since} />
          <AgentThinking variant="stars" label="Reading sources" since={since} />
          <AgentThinking variant="infinity" label="Rendering audio" since={since} />
        </Preview>
      </Section>
      <Section title="Tone & timer">
        <Preview center={false} contentClassName="grid gap-5 sm:grid-cols-2">
          <AgentThinking variant="wave" tone="muted" label="Listening" since={since} />
          <AgentThinking variant="spin" label="Cutting 7 words" showTimer={false} />
        </Preview>
      </Section>
      <Section title="Above a composer">
        <Preview>
          <div className="w-full max-w-lg space-y-3">
            <div className="flex justify-end"><span className="bg-foreground px-3.5 py-2.5 text-sm text-background">Remove the ums and tighten the intro.</span></div>
            <AgentThinking variant="wave" label="Thinking" since={since} />
            <Composer value="" onChange={() => {}} working placeholder="Ask Sonicly anything" />
          </div>
        </Preview>
      </Section>
      <Section title="API">
        <PropsTable rows={[
          ['variant', 'wave | spin | stars | infinity', 'wave'],
          ['label', 'string', 'Thinking'],
          ['since', 'ms timestamp the work started', 'now'],
          ['showTimer', 'boolean', 'true'],
          ['tone', 'brand | muted', 'brand'],
        ]} />
      </Section>
    </>
  )
}

/* ─── Composer ───────────────────────────────────────────────── */

function ComposerPage() {
  const [value, setValue] = useState('')
  const [working, setWorking] = useState(false)
  const send = (t) => { toast(`Sent: “${t}”`); setValue(''); setWorking(true); setTimeout(() => setWorking(false), 2500) }
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Composer" description="The single-line chat composer: an add menu, the prompt, an optional model menu, dictation and send, with a status strip underneath. The mic uses the browser’s own speech recognition when available." />
      <Section title="Default">
        <Preview>
          {(s) => (
            <div className="w-full max-w-xl">
              <Composer
                value={value}
                onChange={setValue}
                onSubmit={send}
                working={working}
                onStop={() => setWorking(false)}
                trailing={<span className="hidden px-1 text-[12px] font-semibold text-muted-foreground sm:inline">Sonicly · Fast</span>}
                status={
                  <ComposerStatus
                    items={[{ icon: FolderIcon, label: 'The Quiet Room' }, { icon: HistoryIcon, label: 'v3 · Removed fillers' }]}
                    right={<span className="inline-flex items-center gap-1 font-semibold"><BotIcon className="size-3" />Agent</span>}
                    meter={{ value: 57, label: 'Context' }}
                  />
                }
                key={s}
              />
            </div>
          )}
        </Preview>
      </Section>
      <Section title="States">
        <Preview center={false} contentClassName="grid gap-6">
          <Composer value="" onChange={() => {}} placeholder="Empty" />
          <Composer value="Make my voice warmer" onChange={() => {}} />
          <ComposerLoader active><Composer value="" onChange={() => {}} working onStop={() => {}} /></ComposerLoader>
          <Composer value="" onChange={() => {}} disabled placeholder="Upload audio to start chatting" />
        </Preview>
      </Section>
    </>
  )
}

/* ─── Composer Panel ─────────────────────────────────────────── */

const MODES = [
  { value: 'ask', label: 'Ask first', description: 'Propose edits, apply when you confirm', icon: ShieldCheckIcon },
  { value: 'auto', label: 'Auto-apply', description: 'Apply edits as new versions straight away', icon: ZapIcon },
  { value: 'plan', label: 'Plan only', description: 'Describe the changes, don’t touch audio', icon: ListChecksIcon },
]
const MODELS = [
  { value: 'fast', label: 'Sonicly Fast', description: 'Quick replies, everyday edits' },
  { value: 'studio', label: 'Sonicly Studio', description: 'Slower, more careful on long episodes' },
]

function ComposerPanelPage() {
  const [value, setValue] = useState('')
  const [mode, setMode] = useState('ask')
  const [model, setModel] = useState('fast')
  const [working, setWorking] = useState(false)
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Composer panel" description="The taller, two-row composer for agent surfaces: the prompt on top, controls below — add menu, a permission picker, a model picker, dictation and send — plus a status tab hanging off the top edge." />
      <Section title="Default">
        <Preview>
          <div className="w-full max-w-xl">
            <ComposerLoader active={working}>
              <ComposerPanel
                value={value}
                onChange={setValue}
                onSubmit={(t) => { toast(`Sent: “${t}”`); setValue(''); setWorking(true); setTimeout(() => setWorking(false), 2600) }}
                working={working}
                onStop={() => setWorking(false)}
                statusTab={
                  <ComposerStatus
                    className="w-full px-0"
                    items={[{ icon: GitBranchIcon, label: 'v3' }, { icon: FolderIcon, label: 'The Quiet Room' }]}
                    meter={{ value: 57, label: 'Context' }}
                  />
                }
                addItems={[
                  { icon: UploadIcon, label: 'Upload audio', onSelect: () => toast('Upload') },
                  { icon: PaperclipIcon, label: 'Attach a reference', onSelect: () => toast('Attach') },
                ]}
                pickers={<>
                  <ComposerPicker value={mode} onChange={setMode} options={MODES} label="When Sonicly edits" />
                  <ComposerPicker value={model} onChange={setModel} options={MODELS} label="Model" icon={SparklesIcon} />
                </>}
              />
            </ComposerLoader>
          </div>
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage
          dos={['Use the panel where the agent can act on things (the editor).', 'Name permission modes by what they do to the user’s work.']}
          donts={['Show pickers that don’t change anything — hide them until they’re real.', 'Put more than two pickers in the bottom row.']}
        />
      </Section>
    </>
  )
}

/* ─── Composer Attachments ───────────────────────────────────── */

const QUEUE = [
  { id: 'a', name: 'cover.png', kind: 'image', url: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56 56'><rect width='56' height='56' fill='%230d0d0d'/><rect x='10' y='22' width='6' height='12' fill='%232ce6e0'/><rect x='20' y='14' width='6' height='28' fill='white'/><rect x='30' y='8' width='6' height='40' fill='white'/><rect x='40' y='18' width='6' height='20' fill='white'/></svg>" },
  { id: 'b', name: 'intro.wav', kind: 'audio' },
  { id: 'c', name: 'notes.pdf', kind: 'file' },
]

function ComposerAttachmentsPage() {
  const [items, setItems] = useState([])
  const timers = useRef([])
  const clearAll = () => { timers.current.forEach((t) => { clearInterval(t); clearTimeout(t) }); timers.current = [] }
  const run = () => {
    clearAll()
    setItems([])
    QUEUE.forEach((q, qi) => {
      timers.current.push(setTimeout(() => {
        let p = 0
        setItems((list) => [...list, { ...q, progress: 0 }])
        const iv = setInterval(() => {
          p = Math.min(100, p + 7 + Math.random() * 9)
          setItems((list) => list.map((it) => (it.id === q.id ? { ...it, progress: p } : it)))
          if (p >= 100) clearInterval(iv)
        }, 120)
        timers.current.push(iv)
      }, qi * 650))
    })
  }
  useEffect(() => { run(); return clearAll }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Composer attachments" description="A strip of 56px tiles above the prompt. Queued files land one after another; a square ring draws clockwise around each tile as it uploads, then the percentage gives way to the dismiss." />
      <Section title="Upload queue">
        <Replay onClick={run} />
        <Preview single>
          <div className="w-full max-w-xl">
            <ComposerPanel value="" onChange={() => {}} attachments={items} onRemoveAttachment={(id) => setItems((l) => l.filter((i) => i.id !== id))} placeholder="Describe what to do with these files" />
          </div>
        </Preview>
      </Section>
      <Section title="Tile kinds">
        <Preview>
          <ComposerAttachments items={[{ ...QUEUE[0], progress: 100 }, { ...QUEUE[1], progress: 64 }, { ...QUEUE[2], progress: 100 }]} onRemove={() => {}} />
        </Preview>
      </Section>
    </>
  )
}

/* ─── Composer Loader ────────────────────────────────────────── */

function ComposerLoaderPage() {
  const [active, setActive] = useState(true)
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Composer loader" description="Wraps a composer while the agent works: an iridescent band travels the rim at constant speed, drawn from the NeoPOP accent palette, with a faint aqua bloom behind it. Toggling fades the effect in and out." />
      <Section title="Toggle">
        <div className="mb-4"><Button variant="outline" size="sm" onClick={() => setActive((a) => !a)}>{active ? 'Stop' : 'Start'} loader</Button></div>
        <Preview>
          <div className="w-full max-w-xl space-y-3">
            {active && <AgentThinking label="Working" />}
            <ComposerLoader active={active}><Composer value="" onChange={() => {}} working={active} onStop={() => setActive(false)} /></ComposerLoader>
          </div>
        </Preview>
      </Section>
      <Section title="On the panel">
        <Preview>
          <div className="w-full max-w-xl"><ComposerLoader active><ComposerPanel value="" onChange={() => {}} working /></ComposerLoader></div>
        </Preview>
      </Section>
    </>
  )
}

/* ─── Agent Progress ─────────────────────────────────────────── */

const PROGRESS_LABELS = ['Read project audio', 'Write the transcript', 'Find filler words', 'Render the new version', 'Save version history']

function AgentProgressPage() {
  const total = PROGRESS_LABELS.length
  const init = () => ({ i: 0, p: 0, done: false, t0: Date.now(), took: null })
  const [s, replay] = useScript(
    Array.from({ length: total * 5 }, (_, k) => [
      400 + k * 260,
      (st) => {
        if (st.done) return st
        const p = st.p + 25
        if (p >= 100) {
          const i = st.i + 1
          return i >= total ? { ...st, i, p: 100, done: true, took: ((Date.now() - st.t0) / 1000).toFixed(1) + 's' } : { ...st, i, p: 0 }
        }
        return { ...st, p }
      },
    ]),
    init
  )
  const steps = PROGRESS_LABELS.map((label, idx) => ({
    id: label,
    label,
    status: idx < s.i ? 'done' : idx === s.i && !s.done ? 'active' : s.done ? 'done' : 'pending',
    progress: idx === s.i ? s.p : undefined,
    detail: idx < s.i || s.done ? 'done' : undefined,
  }))
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Agent progress" description="A collapsible block for multi-step work. Steps arrive with a soft stagger, the active step’s ring and the header ring move together, progress survives being minimised, and the header reports total time at the end. Sonicly’s Processing screen uses it." />
      <Section title="Live">
        <Replay onClick={replay} />
        <Preview single>
          <AgentProgress steps={steps} duration={s.took} className="w-full max-w-md" />
        </Preview>
      </Section>
      <Section title="States">
        <Preview center={false} contentClassName="grid gap-4 md:grid-cols-2">
          <AgentProgress steps={[{ id: 1, label: 'Upload audio', status: 'done' }, { id: 2, label: 'Write the transcript', status: 'active' }, { id: 3, label: 'Find filler words', status: 'pending' }]} />
          <AgentProgress steps={[{ id: 1, label: 'Upload audio', status: 'done' }, { id: 2, label: 'Write the transcript', status: 'error', detail: 'out of credits' }]} />
          <AgentProgress duration="38.2s" steps={[{ id: 1, label: 'Upload audio', status: 'done' }, { id: 2, label: 'Write the transcript', status: 'done', detail: '1,284 words' }]} />
          <AgentProgress defaultOpen={false} steps={[{ id: 1, label: 'Upload audio', status: 'done' }, { id: 2, label: 'Write the transcript', status: 'active' }]} />
        </Preview>
      </Section>
    </>
  )
}

/* ─── Task List ──────────────────────────────────────────────── */

function TaskListPage() {
  const SCRIPT = [
    { id: 't1', title: 'Reading the transcript', steps: [{ id: 's1', text: 'Opened', chips: [{ label: 'ep42.m4a' }] }, { id: 's2', text: 'Found 34 filler words and 6 long pauses' }] },
    { id: 't2', title: 'Cutting fillers', steps: [{ id: 's3', text: 'Removed 34 words' }, { id: 's4', text: 'Shortened 6 pauses to 0.6 s' }] },
    { id: 't3', title: 'Rendering a new version', steps: [{ id: 's5', text: 'Saved', chips: [{ label: 'v4 · Cleaned up', icon: HistoryIcon }] }] },
  ]
  const events = []
  let t = 300
  SCRIPT.forEach((task, ti) => {
    events.push([t, (st) => ({ ...st, tasks: [...st.tasks, { ...task, status: 'running', steps: [] }] })]); t += 600
    task.steps.forEach((step) => { events.push([t, (st) => ({ ...st, tasks: st.tasks.map((x) => (x.id === task.id ? { ...x, steps: [...x.steps, step] } : x)) })]); t += 650 })
    events.push([t, (st) => ({ ...st, tasks: st.tasks.map((x) => (x.id === task.id ? { ...x, status: 'done' } : x)), running: ti < SCRIPT.length - 1 })]); t += 300
  })
  const [s, replay] = useScript(events, () => ({ tasks: [], running: true, t0: Date.now() }))
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Task list" description="A streaming log of what the agent actually did. Tasks and steps reveal one at a time with a short blur and lift; a running task shimmers until its steps land; when the run ends it folds into one line. Sonicly’s assistant logs applied edits with it." />
      <Section title="Live">
        <Replay onClick={replay} />
        <Preview single center={false}>
          <div className="w-full max-w-md">
            <TaskList tasks={s.tasks} running={s.running} since={s.t0} summary={`Worked through ${s.tasks.length} tasks`} />
          </div>
        </Preview>
      </Section>
    </>
  )
}

/* ─── Web Search ─────────────────────────────────────────────── */

function WebSearchPage() {
  const STEPS = [
    { id: 1, type: 'search', text: 'podcast loudness standard spotify apple', results: 8, sources: [{ name: 'Spotify', color: '#1db954' }, { name: 'Apple', color: '#555' }, { name: 'Reddit', color: '#ff4500' }, { name: 'Auphonic', color: '#e8590c' }, { name: 'Sound On Sound', color: '#144cc7' }] },
    { id: 2, type: 'open', text: 'Loudness normalization on Spotify', domain: 'support.spotify.com' },
    { id: 3, type: 'search', text: 'how to remove room reverb from voice', results: 5, sources: [{ name: 'YouTube', color: '#ff0000' }, { name: 'iZotope', color: '#6a35ff' }] },
  ]
  const [s, replay] = useScript(
    [...STEPS.map((st, i) => [400 + i * 1100, (x) => ({ ...x, steps: [...x.steps, st] })]), [400 + STEPS.length * 1100, (x) => ({ ...x, running: false })]],
    () => ({ steps: [], running: true, t0: Date.now() })
  )
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Web search" description="The research log: every query the agent ran and every page it opened. A search that found something lists its sources as overlapping square site marks, so a thread is recognisable without reading a domain." />
      <Section title="Live">
        <Replay onClick={replay} />
        <Preview single center={false}>
          <div className="w-full max-w-lg"><WebSearch steps={s.steps} running={s.running} since={s.t0} /></div>
        </Preview>
      </Section>
    </>
  )
}

/* ─── Agent Limits ───────────────────────────────────────────── */

function AgentLimitsPage() {
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Agent limits card" description="The agent budget: a context-window bar segmented by bucket with a used / max readout, and plan limits with reset times. Open the context row to see the breakdown and free space." />
      <Section title="Example">
        <Preview>
          <AgentLimitsCard
            plan="Studio"
            context={{
              used: 820_000,
              max: 1_000_000,
              buckets: [
                { label: 'Transcript', value: 420_000, color: 'var(--chart-1)' },
                { label: 'Conversation', value: 210_000, color: 'var(--chart-3)' },
                { label: 'Show notes', value: 110_000, color: 'var(--chart-2)' },
                { label: 'Instructions', value: 80_000, color: 'var(--chart-4)' },
              ],
            }}
            limits={[
              { label: 'Transcription · this month', percent: 38, resets: 'in 12 days' },
              { label: 'AI edits · today', percent: 91, resets: 'tomorrow 00:00' },
              { label: 'Voice regeneration', percent: 5, resets: 'Tue' },
            ]}
          />
        </Preview>
      </Section>
    </>
  )
}

/* ─── Notification Center ────────────────────────────────────── */

function NotificationCenterPage() {
  const seed = [
    { id: 1, group: 'Today', title: 'Maya mentioned you', body: 'Can you check the intro cut before we publish?', time: '2m', unread: true, category: 'mention', avatar: { initials: 'MK' }, actions: [{ label: 'Reply', primary: true }, { label: 'Open' }] },
    { id: 2, group: 'Today', title: 'Export ready', body: 'ep42_enhanced.mp3 · 38.7 MB', time: '18m', unread: true, category: 'system', icon: DownloadIcon, tone: 'success', actions: [{ label: 'Download' }] },
    { id: 3, group: 'Today', title: 'Transcript ready', body: 'Interview with Maya — 1,284 words, 34 fillers', time: '1h', unread: true, category: 'system', icon: AudioLinesIcon, tone: 'brand' },
    { id: 4, group: 'Earlier', title: 'You joined The Quiet Room', body: 'Jay added you as an editor.', time: 'Mon', category: 'system', icon: UsersIcon },
    { id: 5, group: 'Earlier', title: 'Voice clone failed', body: 'The voice plan needs an upgrade.', time: 'Sun', category: 'system', icon: RefreshCwIcon, tone: 'destructive' },
  ]
  const [items, setItems] = useState(seed)
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Notification center" description="An activity inbox: filter tabs with counts and a sliding rule, grouped timeline, unread markers, avatar or status tiles, inline actions, mark-all-read and an empty state. The app’s top bar uses it for project activity." />
      <Section title="Example">
        <Preview single>
          <div className="w-full max-w-sm border border-border pop-float">
            <NotificationCenter
              items={items}
              onMarkAllRead={() => setItems((l) => l.map((i) => ({ ...i, unread: false })))}
              onItemClick={(it) => setItems((l) => l.map((i) => (i.id === it.id ? { ...i, unread: false } : i)))}
              filters={[
                { value: 'all', label: 'All', match: () => true },
                { value: 'mention', label: 'Mentions', match: (i) => i.category === 'mention' },
                { value: 'system', label: 'System', match: (i) => i.category === 'system' },
              ]}
            />
          </div>
        </Preview>
      </Section>
      <Section title="Empty">
        <Preview><div className="w-full max-w-sm rounded-2xl border-[0.8px] border-border"><NotificationCenter items={[]} onMarkAllRead={() => {}} /></div></Preview>
      </Section>
    </>
  )
}

/* ─── Stat Cards ─────────────────────────────────────────────── */

function StatCardsPage() {
  return (
    <>
      <PageHeader eyebrow={<span className="inline-flex items-center gap-2">Agents<NewBadge /></span>} title="Stat cards" description="KPI cards for dashboard headers in two looks: the compact ruled row the dashboard uses, and a footer variant with an icon tile, an info tooltip, a display value and a footer band with the comparison and a delta pill." />
      <Section title="Compact">
        <Preview center={false}>
          <StatCards className="w-full" items={[
            { label: 'Projects', value: '12', delta: 20, caption: 'vs last month' },
            { label: 'Audio', value: '6 h 12 m', caption: 'across all projects' },
            { label: 'Ready to edit', value: '9', caption: 'transcribed' },
            { label: 'Exported', value: '7', delta: -5, caption: 'vs last month' },
          ]} />
        </Preview>
      </Section>
      <Section title="Footer">
        <Preview center={false}>
          <StatCards variant="footer" className="w-full" items={[
            { label: 'Minutes edited', value: '1,284', delta: 16, caption: 'From last month', icon: AudioLinesIcon, tone: 'brand', info: 'Audio minutes processed by any edit.' },
            { label: 'Fillers removed', value: '3,847', delta: 8.1, caption: 'From last month', icon: WandSparklesIcon, tone: 'default' },
            { label: 'Exports', value: '152', delta: 20, caption: 'From last month', icon: DownloadIcon, tone: 'success' },
            { label: 'Avg. turnaround', value: '4m 12s', delta: -2.4, deltaInvert: true, caption: 'Upload → export', icon: ClockIcon, tone: 'info' },
          ]} />
        </Preview>
      </Section>
    </>
  )
}

export const AGENT_DEMOS = [
  { slug: 'agent-limits-card', title: 'Agent Limits Card', isNew: true, Page: AgentLimitsPage },
  { slug: 'agent-progress', title: 'Agent Progress', isNew: true, Page: AgentProgressPage },
  { slug: 'agent-thinking', title: 'Agent Thinking', isNew: true, Page: AgentThinkingPage },
  { slug: 'composer', title: 'Composer', isNew: true, Page: ComposerPage },
  { slug: 'composer-attachments', title: 'Composer Attachments', isNew: true, Page: ComposerAttachmentsPage },
  { slug: 'composer-loader', title: 'Composer Loader', isNew: true, Page: ComposerLoaderPage },
  { slug: 'composer-panel', title: 'Composer Panel', isNew: true, Page: ComposerPanelPage },
  { slug: 'notification-center', title: 'Notification Center', isNew: true, Page: NotificationCenterPage },
  { slug: 'stat-cards', title: 'Stat Cards', isNew: true, Page: StatCardsPage },
  { slug: 'task-list', title: 'Task List', isNew: true, Page: TaskListPage },
  { slug: 'web-search', title: 'Web Search', isNew: true, Page: WebSearchPage },
]

