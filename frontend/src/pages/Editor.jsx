import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowLeftIcon, AudioLinesIcon, CheckIcon, ChevronDownIcon, DownloadIcon, HistoryIcon, KeyboardIcon, PanelRightOpenIcon, PauseIcon,
  PlayIcon, RotateCcwIcon, RotateCwIcon, ScissorsIcon, SplitIcon, Undo2Icon, Volume2Icon, VolumeXIcon, XIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import {
  streamChat, getProject, detectFillers, applyEdits, removeNoise, listThreads, createThread, renameThread,
  deleteThread, listThreadMessages, listVersions, activateVersion,
} from '../lib/api'
import { transcribeOnce } from '../lib/transcribe'
import { explainError } from '../lib/errors'
import { buildContext, estimateContext, lineAttachment, quotedPhrases, searchTranscript, toPanelMessages } from '../lib/chat-context'
import { useAudioPlayer, formatTime } from '../hooks/useAudioPlayer'
import { usePendingEdits } from '../hooks/usePendingEdits'
import { useTheme } from '@/components/theme-provider'
import { LogoMark } from '@/components/brand/Logo'
import { TranscriptView, fmtClock } from '@/components/editor/TranscriptView'
import { AssistantPanel } from '@/components/editor/AssistantPanel'
import { ExportDialog } from '@/components/editor/ExportDialog'
import { CompareDialog } from '@/components/editor/CompareDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDuration, relativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const WAVE_COLORS = {
  dark: { waveColor: '#3d3d3d', progressColor: '#ffffff', cursorColor: '#2ce6e0' },
  light: { waveColor: '#c7c7c2', progressColor: '#0d0d0d', cursorColor: '#12706c' },
}
const RATES = ['0.75', '1', '1.25', '1.5', '2']
const SHORTCUTS = [
  [['Space'], 'Play / pause'],
  [['←'], 'Back 5 seconds'],
  [['→'], 'Forward 5 seconds'],
  [['⌘', 'Z'], 'Undo last cut'],
  [['⌘', '↵'], 'Apply edits'],
  [['E'], 'Export'],
  [['click'], 'Cut a word'],
  [['2× click'], 'Rewrite a word'],
  [['⇧', 'click'], 'Play from a word'],
]

function useIsLarge() {
  const [large, setLarge] = useState(() => window.matchMedia('(min-width: 1024px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const on = () => setLarge(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return large
}

function IconTip({ label, children, kbd }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}{kbd && <KbdGroup>{kbd.map((k) => <Kbd key={k}>{k}</Kbd>)}</KbdGroup>}</TooltipContent>
    </Tooltip>
  )
}

export default function Editor() {
  const location = useLocation()
  const { getToken } = useAuth()
  const { resolvedTheme } = useTheme()
  const isLarge = useIsLarge()
  const pid = Number(new URLSearchParams(location.search).get('p')) || null
  const project = location.state?.project || (pid ? { id: pid } : null)

  const [showExport, setShowExport] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [exportHistory, setExportHistory] = useState([])
  const [showDiagnosis, setShowDiagnosis] = useState(true)
  const [messages, setMessages] = useState([])
  const [attachments, setAttachments] = useState([])
  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [projectName, setProjectName] = useState(project?.name || 'Untitled')
  const [isStreaming, setIsStreaming] = useState(false)
  const [thinkingSince, setThinkingSince] = useState(null)
  const [volume, setVolumeState] = useState(80)
  const [muted, setMuted] = useState(false)
  const [rate, setRateState] = useState('1')
  const [transcript, setTranscript] = useState(project?.transcript || null)
  const [transcriptState, setTranscriptState] = useState(project?.transcript ? 'ready' : project?.audio_url ? 'idle' : 'no-audio')
  const [transcriptError, setTranscriptError] = useState(null)
  const [audioUrl, setAudioUrl] = useState(project?.audio_url || null)
  const [fillerRefs, setFillerRefs] = useState([])
  const [versions, setVersions] = useState([])
  const [activeVersionId, setActiveVersionId] = useState(project?.active_version_id || null)
  const [applyingEdits, setApplyingEdits] = useState(false)
  const [denoising, setDenoising] = useState(false)
  const [inlineEdit, setInlineEdit] = useState(null)
  const [assistantOpen, setAssistantOpen] = useState(() => {
    try { return localStorage.getItem('sonicly-assistant') !== 'closed' } catch { return true }
  })
  const [mobileAssistant, setMobileAssistant] = useState(false)
  const pending = usePendingEdits()
  const activeWordRef = useRef(null)
  const tokenRef = useRef(getToken)
  tokenRef.current = getToken
  const token = (...a) => tokenRef.current(...a)

  const player = useAudioPlayer({ url: audioUrl, height: 64, ...WAVE_COLORS[resolvedTheme] })

  useEffect(() => { document.title = `${projectName} — Sonicly` }, [projectName])
  useEffect(() => { try { localStorage.setItem('sonicly-assistant', assistantOpen ? 'open' : 'closed') } catch { /* ignore */ } }, [assistantOpen])

  useEffect(() => {
    if (player.isReady) {
      player.setVolume(muted ? 0 : volume / 100)
      player.setRate(parseFloat(rate))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.isReady])

  // Load the project; transcribe once if it has audio but no transcript yet.
  useEffect(() => {
    if (!project?.id) return undefined
    let cancelled = false
    ;(async () => {
      try {
        const fresh = await getProject({ id: project.id, getToken: token })
        if (cancelled) return
        setAudioUrl(fresh.audio_url || null)
        setActiveVersionId(fresh.active_version_id || null)
        setProjectName(fresh.name)
        if (fresh.transcript) {
          setTranscript(fresh.transcript)
          setTranscriptState('ready')
        } else if (!fresh.audio_url) {
          setTranscriptState('no-audio')
          return
        } else {
          setTranscriptState('transcribing')
          const updated = await transcribeOnce(project.id, token)
          if (cancelled) return
          setTranscript(updated.transcript || null)
          setAudioUrl(updated.audio_url || fresh.audio_url || null)
          setTranscriptState(updated.transcript ? 'ready' : 'idle')
        }
        listVersions({ id: project.id, getToken: token }).then((v) => { if (!cancelled) setVersions(v || []) }).catch(() => {})
      } catch (err) {
        if (cancelled) return
        setTranscriptError(explainError(err.message, 'Transcription failed'))
        setTranscriptState('error')
      }
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  // Saved conversations — reopen the most recent one, unless the user has
  // already started chatting while the list was loading.
  const chatStartedRef = useRef(false)
  useEffect(() => {
    if (!project?.id) return undefined
    let cancelled = false
    listThreads({ id: project.id, getToken: token })
      .then(async (list) => {
        if (cancelled) return
        setThreads((prev) => [...prev.filter((t) => !list?.some((x) => x.id === t.id)), ...(list || [])])
        if (list?.length && !chatStartedRef.current) {
          setActiveThreadId(list[0].id)
          const msgs = await listThreadMessages({ id: project.id, threadId: list[0].id, getToken: token })
          if (!cancelled && !chatStartedRef.current) setMessages((prev) => [...toPanelMessages(msgs || []), ...prev.filter((m) => m.role === 'task')])
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id])

  // Re-detect fillers whenever the transcript changes.
  useEffect(() => {
    if (!project?.id || transcriptState !== 'ready') { setFillerRefs([]); return undefined }
    let cancelled = false
    detectFillers({ id: project.id, getToken: token })
      .then((res) => { if (!cancelled) setFillerRefs(res?.fillers || []) })
      .catch(() => { if (!cancelled) setFillerRefs([]) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, transcript, transcriptState])

  // The word being spoken right now.
  const activeWordKey = useMemo(() => {
    if (!transcript?.segments?.length) return null
    const t = player.currentTime
    for (let si = 0; si < transcript.segments.length; si++) {
      const seg = transcript.segments[si]
      if (t < seg.start - 0.05) break
      if (t > seg.end + 0.25) continue
      for (let wi = 0; wi < seg.words.length; wi++) {
        const w = seg.words[wi]
        if (t >= w.start && t <= w.end + 0.05) return `${si}-${wi}`
      }
    }
    return null
  }, [player.currentTime, transcript])

  useEffect(() => {
    if (player.isPlaying) activeWordRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeWordKey, player.isPlaying])

  const wordCount = useMemo(() => transcript?.segments?.reduce((acc, s) => acc + s.words.length, 0) || 0, [transcript])
  const fillerSet = useMemo(() => new Set(fillerRefs.map((f) => `${f.segment_idx}-${f.word_idx}`)), [fillerRefs])
  const activeVersion = versions.find((v) => v.id === activeVersionId)
  const ext = audioUrl ? audioUrl.split('?')[0].split('.').pop() : null

  /* ─── Edit actions ─────────────────────────────────────────── */

  // Show the new version immediately; reconcile with the server list in the
  // background (it can include the auto-created "Original").
  const refreshAfterVersion = (version) => {
    setActiveVersionId(version.id)
    if (version.audio_url) setAudioUrl(version.audio_url)
    if (version.transcript) setTranscript(version.transcript)
    setVersions((prev) => [...prev.filter((v) => v.id !== version.id), version])
    listVersions({ id: project.id, getToken: token }).then((list) => list && setVersions(list)).catch(() => {})
  }

  const handleReviewFillers = () => {
    if (!fillerRefs.length) return
    pending.queueDeletes(fillerRefs)
    setShowDiagnosis(false)
    toast(`${fillerRefs.length} filler word${fillerRefs.length === 1 ? '' : 's'} marked`, { description: 'Review them in the transcript, then apply.' })
  }

  // Agent work (applied edits, noise cleanup) is logged in the assistant as a
  // live task list, so there's a record of what changed and how long it took.
  const startTask = (title, steps) => {
    const id = `task-${Date.now()}`
    const since = Date.now()
    setMessages((prev) => [...prev, { role: 'task', id, since, running: true, tasks: [{ id: 't', title, status: 'running', steps }] }])
    const finish = ({ ok, steps: more = [], summary, doneTitle }) => {
      const secs = ((Date.now() - since) / 1000).toFixed(1)
      setMessages((prev) => prev.map((m) => (m.id === id
        ? { ...m, running: false, summary: `${summary} · ${secs}s`, tasks: m.tasks.map((t) => ({ ...t, title: ok && doneTitle ? doneTitle : t.title, status: ok ? 'done' : 'error', steps: [...t.steps, ...more] })) }
        : m)))
    }
    return finish
  }

  const handleRemoveNoise = async () => {
    if (!project?.id || denoising) return
    setDenoising(true)
    if (!isLarge) setMobileAssistant(true)
    const finish = startTask('Cleaning up background noise', [{ id: 's1', text: 'Sending audio to the noise remover', chips: [{ label: activeVersion?.label || 'Original', icon: HistoryIcon }] }])
    try {
      const version = await removeNoise({ id: project.id, getToken: token })
      refreshAfterVersion(version)
      finish({ ok: true, summary: 'Noise reduced', doneTitle: 'Cleaned up background noise', steps: [{ id: 's2', text: 'Saved as', chips: [{ label: version.label, icon: HistoryIcon }] }] })
      toast.success('Noise reduced', { description: `Saved as “${version.label}”.` })
    } catch (err) {
      const e = explainError(err.message, 'Couldn’t clean up the audio')
      finish({ ok: false, summary: 'Noise cleanup failed', steps: [{ id: 's2', text: e.title }] })
      toast.error(e.title, { description: e.body })
    } finally {
      setDenoising(false)
    }
  }

  const handleConfirmEdits = async () => {
    if (!pending.count || !project?.id || applyingEdits) return
    setApplyingEdits(true)
    const n = pending.count
    const describe = [
      pending.deleteCount && `Cutting ${pending.deleteCount} word${pending.deleteCount === 1 ? '' : 's'}`,
      pending.replaceCount && `Re-voicing ${pending.replaceCount} word${pending.replaceCount === 1 ? '' : 's'}`,
    ].filter(Boolean)
    const finish = startTask(`Applying ${n} edit${n === 1 ? '' : 's'}`, describe.map((text, i) => ({ id: `d${i}`, text })))
    try {
      const version = await applyEdits({ id: project.id, edits: pending.serialize(), parentVersionId: activeVersionId, getToken: token })
      pending.clear()
      refreshAfterVersion(version)
      finish({
        ok: true,
        summary: `Applied ${n} edit${n === 1 ? '' : 's'}`,
        doneTitle: `Applied ${n} edit${n === 1 ? '' : 's'}`,
        steps: [{ id: 'saved', text: `Rendered ${formatDuration(version.duration) || 'new'} audio and saved`, chips: [{ label: version.label, icon: HistoryIcon }] }],
      })
      toast.success(`${n} edit${n === 1 ? '' : 's'} applied`, {
        description: `New version: ${version.label}`,
        action: { label: 'Compare', onClick: () => setShowCompare(true) },
      })
    } catch (err) {
      const e = explainError(err.message, 'Couldn’t apply your edits')
      finish({ ok: false, summary: 'Edits not applied', steps: [{ id: 'err', text: e.title }] })
      toast.error(e.title, { description: e.body })
    } finally {
      setApplyingEdits(false)
    }
  }

  const handleActivateVersion = async (versionId) => {
    const id = Number(versionId)
    if (!project?.id || id === activeVersionId) return
    if (pending.count) {
      toast.warning('Apply or discard your edits first', { description: 'Switching versions would drop them.' })
      return
    }
    setApplyingEdits(true)
    try {
      const updated = await activateVersion({ id: project.id, versionId: id, getToken: token })
      setActiveVersionId(id)
      if (updated.audio_url) setAudioUrl(updated.audio_url)
      if (updated.transcript) setTranscript(updated.transcript)
      toast(`Switched to “${versions.find((v) => v.id === id)?.label || 'version'}”`)
    } catch (err) {
      toast.error('Couldn’t switch versions', { description: explainError(err.message).body })
    } finally {
      setApplyingEdits(false)
    }
  }

  const beginInlineEdit = (si, wi, text) => setInlineEdit({ si, wi, text: (text || '').trim() })
  const commitInlineEdit = () => {
    if (!inlineEdit) return
    const next = inlineEdit.text.trim()
    const original = transcript?.segments?.[inlineEdit.si]?.words?.[inlineEdit.wi]?.text?.trim() || ''
    if (next && next !== original) pending.queueReplace(inlineEdit.si, inlineEdit.wi, next)
    setInlineEdit(null)
  }

  const retryTranscribe = async () => {
    if (!project?.id) return
    setTranscriptError(null)
    setTranscriptState('transcribing')
    try {
      const updated = await transcribeOnce(project.id, token)
      setTranscript(updated.transcript || null)
      setTranscriptState(updated.transcript ? 'ready' : 'idle')
    } catch (err) {
      setTranscriptError(explainError(err.message, 'Transcription failed'))
      setTranscriptState('error')
    }
  }

  /* ─── Conversations ────────────────────────────────────────── */

  const openThread = async (threadId) => {
    chatStartedRef.current = true
    setActiveThreadId(threadId)
    try {
      const msgs = await listThreadMessages({ id: project.id, threadId, getToken: token })
      setMessages((prev) => [...toPanelMessages(msgs || []), ...prev.filter((m) => m.role === 'task')])
    } catch {
      setMessages([])
    }
  }

  const handleNewThread = async () => {
    chatStartedRef.current = true
    try {
      const t = await createThread({ id: project.id, getToken: token })
      setThreads((prev) => [t, ...prev])
      setActiveThreadId(t.id)
      setMessages((prev) => prev.filter((m) => m.role === 'task'))
    } catch (err) {
      toast.error('Couldn’t start a conversation', { description: explainError(err.message).body })
    }
  }

  const handleRenameThread = async (threadId, title) => {
    const clean = (title || '').trim()
    const current = threads.find((t) => t.id === threadId)
    if (!clean || clean === current?.title) return
    try {
      const updated = await renameThread({ id: project.id, threadId, title: clean, getToken: token })
      setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, title: updated.title } : t)))
    } catch (err) {
      toast.error('Couldn’t rename', { description: explainError(err.message).body })
    }
  }

  const handleDeleteThread = async (threadId) => {
    try {
      await deleteThread({ id: project.id, threadId, getToken: token })
      const left = threads.filter((t) => t.id !== threadId)
      setThreads(left)
      if (activeThreadId === threadId) {
        if (left.length) await openThread(left[0].id)
        else { setActiveThreadId(null); setMessages((prev) => prev.filter((m) => m.role === 'task')) }
      }
      toast('Conversation deleted')
    } catch (err) {
      toast.error('Couldn’t delete', { description: explainError(err.message).body })
    }
  }

  /* ─── Transcript context for the assistant ─────────────────── */

  const showAssistant = () => (isLarge ? setAssistantOpen(true) : setMobileAssistant(true))

  const attachLine = (si) => {
    const line = lineAttachment(transcript, si)
    if (!line) return
    setAttachments((prev) => (prev.some((a) => a.id === line.id) ? prev : [...prev, line].slice(-6)))
    showAssistant()
  }

  const attachLineAtPlayhead = () => {
    const segs = transcript?.segments || []
    const t = player.currentTime || 0
    let si = segs.findIndex((seg, i) => t < (segs[i + 1]?.start ?? Infinity) && t >= seg.start)
    if (si < 0) si = 0
    attachLine(si)
  }

  const contextUsage = useMemo(() => estimateContext({
    transcriptChars: (transcript?.text || '').trim().length,
    fillerCount: fillerRefs.length,
    messages,
  }), [transcript, fillerRefs.length, messages])

  const sendToAI = async (userText) => {
    chatStartedRef.current = true
    let threadId = activeThreadId
    if (!threadId && project?.id) {
      try {
        const t = await createThread({ id: project.id, getToken: token })
        threadId = t.id
        setActiveThreadId(t.id)
        setThreads((prev) => [t, ...prev])
      } catch { /* chat still works unsaved */ }
    }
    // Quoted phrases are looked up in the transcript first, so the reply can
    // point at real timestamps; attached lines travel with the message.
    const searches = quotedPhrases(userText).map((phrase) => ({ phrase, hits: searchTranscript(transcript, phrase) }))
    const content = userText + buildContext({ lines: attachments, searches })
    const sent = { role: 'user', text: userText, content, attachments }
    setAttachments([])
    const history = [...messages, sent]
      .filter((m) => !m.error && (m.role === 'user' || m.role === 'ai'))
      .map((m) => ({ role: m.role, text: m.content || m.text }))
    setMessages([...messages, sent, ...(searches.length ? [{ role: 'search', searches }] : []), { role: 'ai', text: '' }])
    setIsStreaming(true)
    setThinkingSince(Date.now())
    try {
      await streamChat({
        projectId: project.id,
        threadId,
        messages: history,
        getToken: token,
        onDelta: (delta) => setMessages((prev) => {
          const next = [...prev]
          const last = next[next.length - 1]
          next[next.length - 1] = { ...last, text: (last.text || '') + delta }
          return next
        }),
      })
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev]
        next[next.length - 1] = { role: 'ai', error: explainError(err.message, 'Sonicly couldn’t reply') }
        return next
      })
    } finally {
      setIsStreaming(false)
      try { setThreads((await listThreads({ id: project.id, getToken: token })) || []) } catch { /* non-fatal */ }
    }
  }

  /* ─── Keyboard ─────────────────────────────────────────────── */

  const keyRef = useRef({})
  keyRef.current = { player, pending, handleConfirmEdits, setShowExport }
  useEffect(() => {
    const onKey = (e) => {
      const { player: p, pending: pe, handleConfirmEdits: apply } = keyRef.current
      const typing = e.target.closest?.('input, textarea, select, [contenteditable=true]')
      const inOverlay = e.target.closest?.('[role=dialog], [role=menu], [role=listbox]')
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); apply(); return }
      if (typing || inOverlay) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && pe.count) { e.preventDefault(); pe.undo(); return }
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === ' ' && !e.target.closest?.('button')) { e.preventDefault(); p.toggle() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); p.skip(-5) }
      if (e.key === 'ArrowRight') { e.preventDefault(); p.skip(5) }
      if (e.key === 'e' || e.key === 'E') { e.preventDefault(); keyRef.current.setShowExport(true) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  if (!project?.id) return <Navigate to="/dashboard" replace />

  const assistant = (
    <AssistantPanel
      threads={threads}
      activeThreadId={activeThreadId}
      onOpenThread={openThread}
      onNewThread={handleNewThread}
      onRenameThread={handleRenameThread}
      onDeleteThread={handleDeleteThread}
      messages={messages}
      isStreaming={isStreaming}
      onSend={sendToAI}
      fillerCount={fillerRefs.length}
      showDiagnosis={showDiagnosis}
      onReviewFillers={handleReviewFillers}
      onDismissDiagnosis={() => setShowDiagnosis(false)}
      onDenoise={handleRemoveNoise}
      denoising={denoising}
      onClose={() => (isLarge ? setAssistantOpen(false) : setMobileAssistant(false))}
      transcriptReady={transcriptState === 'ready'}
      thinkingSince={thinkingSince}
      attachments={attachments}
      onRemoveAttachment={(id) => setAttachments((prev) => prev.filter((a) => a.id !== id))}
      onAttachPlayhead={attachLineAtPlayhead}
      onSeek={player.seek}
      contextUsage={contextUsage}
      transcriptChars={(transcript?.text || '').trim().length}
      statusItems={transcriptState === 'ready' ? [
        { icon: HistoryIcon, label: activeVersion?.label || 'Original' },
        { icon: AudioLinesIcon, label: `${wordCount} words · ${fmtClock(player.duration || transcript?.duration)}` },
      ] : []}
    />
  )

  const sortedVersions = [...versions].sort((a, b) => b.id - a.id)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* ─── Top bar ─── */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-3 sm:px-4">
        <IconTip label="Back to projects">
          <Button asChild variant="ghost" size="icon-sm"><Link to="/dashboard" aria-label="Back to projects"><ArrowLeftIcon /></Link></Button>
        </IconTip>
        <LogoMark className="hidden size-7 sm:inline-flex" />
        <div className="ml-1 flex min-w-0 flex-1 items-center gap-2.5">
          {isEditingName ? (
            <input
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === 'Escape') && setIsEditingName(false)}
              aria-label="Project name"
              className="h-8 min-w-0 max-w-sm flex-1 border border-foreground bg-card px-2 text-[15px] font-bold outline-hidden"
            />
          ) : (
            <button onClick={() => setIsEditingName(true)} className="min-w-0 truncate text-[15px] font-bold tracking-tight hover:underline hover:decoration-brand hover:decoration-2 hover:underline-offset-4" title="Rename (this session)">
              {projectName}
            </button>
          )}
          <span className="hidden shrink-0 font-mono text-[11px] text-muted-foreground md:inline">
            {[player.duration > 0 ? formatTime(player.duration) : project.duration, ext && ext.length <= 4 ? ext.toUpperCase() : null].filter(Boolean).join(' · ')}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={!versions.length || applyingEdits} className="hidden sm:inline-flex">
              <HistoryIcon />
              <span className="max-w-32 truncate">{activeVersion?.label || 'Original'}</span>
              <ChevronDownIcon className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Versions · {versions.length}</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={String(activeVersionId ?? '')} onValueChange={handleActivateVersion}>
              {sortedVersions.map((v) => (
                <DropdownMenuRadioItem key={v.id} value={String(v.id)} className="items-start">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-bold">{v.label}</span>
                    <span className="font-mono text-[11px] text-muted-foreground in-data-[highlighted]:text-background/70">{formatDuration(v.duration) || '—'} · {relativeTime(v.created_at)}</span>
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <p className="px-2.5 py-2 text-[11px] text-muted-foreground">Every applied edit is saved as a version. Switch any time.</p>
          </DropdownMenuContent>
        </DropdownMenu>

        <IconTip label="Compare versions">
          <Button variant="ghost" size="sm" onClick={() => setShowCompare(true)} className="hidden md:inline-flex"><SplitIcon />Compare</Button>
        </IconTip>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Keyboard shortcuts" className="hidden md:inline-flex"><KeyboardIcon /></Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72">
            <p className="text-caps mb-3 text-muted-foreground">Shortcuts</p>
            <ul className="space-y-2">
              {SHORTCUTS.map(([keys, label]) => (
                <li key={label} className="flex items-center justify-between text-[13px]">
                  <span>{label}</span>
                  <KbdGroup>{keys.map((k) => <Kbd key={k}>{k}</Kbd>)}</KbdGroup>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        {(!assistantOpen || !isLarge) && (
          <IconTip label="Show assistant">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={showAssistant}
              aria-label="Show assistant"
            >
              <PanelRightOpenIcon />
            </Button>
          </IconTip>
        )}
        <Button size="sm" variant="brand" onClick={() => setShowExport(true)} className="ml-1"><DownloadIcon /><span className="hidden sm:inline">Export</span></Button>
      </header>

      {/* ─── Body ─── */}
      <div className="flex min-h-0 flex-1">
        <main className="relative flex min-w-0 flex-1 flex-col">
          {/* Transcript toolbar */}
          <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4 sm:px-8">
            <span className="text-caps text-muted-foreground">Transcript</span>
            {transcriptState === 'ready' && (
              <>
                <span className="font-mono text-[11px] text-muted-foreground tabular">{wordCount} words</span>
                {fillerRefs.length > 0 && (
                  <button onClick={handleReviewFillers} className="flex items-center gap-1.5 outline-hidden focus-visible:underline" title="Mark all filler words for removal">
                    <Badge variant="warning" className="cursor-pointer hover:border-warning"><ScissorsIcon />{fillerRefs.length} fillers</Badge>
                  </button>
                )}
              </>
            )}
            <span className="ml-auto hidden text-[12px] text-muted-foreground xl:inline">Click a word to cut · double-click to rewrite · right-click for more</span>
          </div>

          {/* Document */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 pt-8 pb-40 sm:px-8">
              <TranscriptView
                transcriptState={transcriptState}
                transcript={transcript}
                transcriptError={transcriptError}
                onRetry={retryTranscribe}
                fillerSet={fillerSet}
                pending={pending}
                activeWordKey={activeWordKey}
                activeWordRef={activeWordRef}
                onSeek={player.seek}
                inlineEdit={inlineEdit}
                onBeginEdit={beginInlineEdit}
                onInlineChange={(text) => setInlineEdit((s) => ({ ...s, text }))}
                onCommitEdit={commitInlineEdit}
                onCancelEdit={() => setInlineEdit(null)}
                onAttachLine={transcriptState === 'ready' ? attachLine : undefined}
              />
            </div>
          </div>

          {/* Pending edits bar */}
          <AnimatePresence>
            {pending.count > 0 && (
              <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center px-4"
              >
                <div className="pointer-events-auto flex w-full max-w-xl flex-wrap items-center gap-3 border border-float-border bg-popover px-4 py-3 pop-float-lg" role="status">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">
                      {pending.deleteCount > 0 && `${pending.deleteCount} cut${pending.deleteCount === 1 ? '' : 's'}`}
                      {pending.deleteCount > 0 && pending.replaceCount > 0 && ' · '}
                      {pending.replaceCount > 0 && `${pending.replaceCount} rewrite${pending.replaceCount === 1 ? '' : 's'}`}
                    </p>
                    <p className="text-[12px] text-muted-foreground">{pending.replaceCount ? 'Rewrites use your voice clone.' : 'Nothing changes until you apply.'}</p>
                  </div>
                  <IconTip label="Undo last" kbd={['⌘', 'Z']}>
                    <Button variant="ghost" size="icon-sm" onClick={pending.undo} disabled={applyingEdits} aria-label="Undo last edit"><Undo2Icon /></Button>
                  </IconTip>
                  <Button variant="ghost" size="sm" onClick={pending.clear} disabled={applyingEdits}><XIcon />Discard</Button>
                  <Button size="sm" onClick={handleConfirmEdits} disabled={applyingEdits}>
                    {applyingEdits ? <><Spinner />{pending.replaceCount ? 'Regenerating' : 'Applying'}</> : <><CheckIcon />Apply</>}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {isLarge && assistantOpen && (
          <aside className="w-[380px] shrink-0 border-l border-border bg-sidebar">{assistant}</aside>
        )}
      </div>

      {!isLarge && (
        <Sheet open={mobileAssistant} onOpenChange={setMobileAssistant}>
          <SheetContent side="right" className="w-full p-0 sm:max-w-md" aria-describedby={undefined}>
            <SheetTitle className="sr-only">Assistant</SheetTitle>
            {assistant}
          </SheetContent>
        </Sheet>
      )}

      {/* ─── Transport dock ─── */}
      <footer className="shrink-0 border-t border-border bg-card">
        <div className="relative px-4 pt-3 sm:px-6">
          {audioUrl ? (
            <>
              <div ref={player.containerRef} className="w-full cursor-pointer" aria-label="Waveform — click to seek" />
              {!player.isReady && !player.error && (
                <div className="absolute inset-x-4 top-3 flex h-16 items-center justify-center gap-2 text-[12px] text-muted-foreground sm:inset-x-6"><Spinner />Loading waveform…</div>
              )}
              {player.error && (
                <div className="flex h-16 items-center justify-center text-[12px] text-destructive-ink">{player.error}</div>
              )}
            </>
          ) : (
            <div className="hatch flex h-16 items-center justify-center border border-dashed border-input text-[12px] text-muted-foreground">No audio in this project</div>
          )}
        </div>
        <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
          <IconTip label="Back 5 s" kbd={['←']}>
            <Button variant="ghost" size="icon-sm" onClick={() => player.skip(-5)} disabled={!player.isReady} aria-label="Back 5 seconds"><RotateCcwIcon /></Button>
          </IconTip>
          <Button size="icon" onClick={player.toggle} disabled={!player.isReady} aria-label={player.isPlaying ? 'Pause' : 'Play'}>
            {player.isPlaying ? <PauseIcon className="fill-current" /> : <PlayIcon className="fill-current" />}
          </Button>
          <IconTip label="Forward 5 s" kbd={['→']}>
            <Button variant="ghost" size="icon-sm" onClick={() => player.skip(5)} disabled={!player.isReady} aria-label="Forward 5 seconds"><RotateCwIcon /></Button>
          </IconTip>
          <span className="ml-2 font-mono text-[13px] tabular">
            <span className="font-bold">{fmtClock(player.currentTime)}</span>
            <span className="text-muted-foreground"> / {fmtClock(player.duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="icon-sm" onClick={() => { const m = !muted; setMuted(m); player.setVolume(m ? 0 : volume / 100) }} aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted || volume === 0 ? <VolumeXIcon /> : <Volume2Icon />}
              </Button>
              <Slider
                className="w-24"
                value={[muted ? 0 : volume]}
                max={100}
                onValueChange={([v]) => { setVolumeState(v); setMuted(false); player.setVolume(v / 100) }}
                aria-label="Volume"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-16 font-mono tabular" aria-label="Playback speed">{rate}×</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-32">
                <DropdownMenuLabel>Speed</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={rate} onValueChange={(r) => { setRateState(r); player.setRate(parseFloat(r)) }}>
                  {RATES.map((r) => <DropdownMenuRadioItem key={r} value={r} className="font-mono">{r}×</DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </footer>

      <ExportDialog
        open={showExport}
        onOpenChange={setShowExport}
        projectId={project.id}
        projectName={projectName}
        versions={versions}
        activeVersionId={activeVersionId}
        durationSec={player.duration || transcript?.duration || 0}
        exportHistory={exportHistory}
        onExported={(record) => setExportHistory((prev) => [record, ...prev])}
        getToken={token}
      />
      <CompareDialog
        open={showCompare}
        onOpenChange={setShowCompare}
        versions={versions}
        activeVersionId={activeVersionId}
        onExport={() => setShowExport(true)}
      />
    </div>
  )
}
