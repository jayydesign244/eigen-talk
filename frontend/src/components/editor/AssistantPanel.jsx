import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  CheckIcon, ChevronDownIcon, MessageSquarePlusIcon, OctagonXIcon, PanelRightCloseIcon, PencilIcon,
  ScissorsIcon, SparklesIcon, TrashIcon, Volume2Icon, Wand2Icon, XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Message, MessageAvatar, MessageContent } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { AgentThinking } from '@/components/ui/agent-thinking'
import { ComposerLoader } from '@/components/ui/composer-loader'
import { ComposerPanel } from '@/components/ui/composer-panel'
import { ComposerStatus } from '@/components/ui/composer'
import { TaskList } from '@/components/ui/task-list'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

function AiAvatar() {
  return (
    <MessageAvatar className="size-7 bg-brand text-brand-foreground">
      <SparklesIcon className="size-3.5" />
    </MessageAvatar>
  )
}

function ThreadSwitcher({ threads, activeThreadId, onOpen, onNew, onRename, onDelete }) {
  const [open, setOpen] = useState(false)
  const [renaming, setRenaming] = useState(null)
  const active = threads.find((t) => t.id === activeThreadId)
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setRenaming(null) }}>
      <PopoverTrigger asChild>
        <button className="flex min-w-0 items-center gap-1.5 text-left text-[13px] font-bold outline-hidden hover:text-foreground/80 focus-visible:underline">
          <span className="truncate">{active?.title || 'New conversation'}</span>
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1">
        <p className="text-caps px-2.5 pt-2 pb-1.5 text-[9px] text-muted-foreground">Conversations</p>
        {threads.length === 0 && <p className="px-2.5 py-2 text-[13px] text-muted-foreground">No saved conversations yet.</p>}
        <ul className="max-h-64 overflow-y-auto">
          {threads.map((t) => (
            <li key={t.id} className={cn('group flex items-center gap-1 px-1', t.id === activeThreadId && 'bg-accent')}>
              {renaming === t.id ? (
                <input
                  autoFocus
                  defaultValue={t.title}
                  aria-label="Conversation name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { onRename(t.id, e.currentTarget.value); setRenaming(null) }
                    if (e.key === 'Escape') setRenaming(null)
                  }}
                  onBlur={(e) => { onRename(t.id, e.currentTarget.value); setRenaming(null) }}
                  className="my-1 h-8 min-w-0 flex-1 border border-foreground bg-card px-2 text-[13px] outline-hidden"
                />
              ) : (
                <>
                  <button
                    onClick={() => { onOpen(t.id); setOpen(false) }}
                    className="flex min-w-0 flex-1 items-center gap-2 px-1.5 py-2 text-left text-[13px] font-medium outline-hidden"
                  >
                    {t.id === activeThreadId ? <CheckIcon className="size-3.5 shrink-0" strokeWidth={3} /> : <span className="size-3.5 shrink-0" />}
                    <span className="truncate">{t.title}</span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">{t.message_count}</span>
                  </button>
                  <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" onClick={() => setRenaming(t.id)} aria-label={`Rename ${t.title}`}><PencilIcon /></Button>
                  <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100 hover:text-destructive-ink focus-visible:opacity-100" onClick={() => onDelete(t.id)} aria-label={`Delete ${t.title}`}><TrashIcon /></Button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-1 border-t border-border p-1">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => { onNew(); setOpen(false) }}><MessageSquarePlusIcon />New conversation</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

function AssistantComposer({ disabled, streaming, onSend, prefill, statusItems, actions }) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (prefill?.text) setText(prefill.text)
  }, [prefill])
  return (
    <ComposerLoader active={streaming}>
      <ComposerPanel
        value={text}
        onChange={setText}
        onSubmit={(t) => { setText(''); onSend(t) }}
        working={streaming}
        disabled={disabled}
        placeholder={disabled ? 'Upload audio to start editing with AI' : 'Describe a change, e.g. “cut the long pauses”'}
        statusTab={statusItems?.length ? <ComposerStatus className="w-full px-0" items={statusItems} /> : undefined}
        addItems={actions}
        hint="Enter to send"
      />
    </ComposerLoader>
  )
}

/**
 * The AI side panel: saved conversations, a diagnosis of the audio,
 * messages, one-tap actions and the composer.
 */
export function AssistantPanel({
  threads, activeThreadId, onOpenThread, onNewThread, onRenameThread, onDeleteThread,
  messages, isStreaming, onSend,
  fillerCount, showDiagnosis, onReviewFillers, onDismissDiagnosis,
  onDenoise, denoising, onClose, transcriptReady, statusItems, thinkingSince,
}) {
  const endRef = useRef(null)
  const [prefill, setPrefill] = useState(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages])

  const chips = [
    { icon: ScissorsIcon, label: 'Remove fillers', run: onReviewFillers, disabled: !fillerCount },
    { icon: Wand2Icon, label: denoising ? 'Cleaning…' : 'Clean up noise', run: onDenoise, disabled: denoising },
    { icon: Volume2Icon, label: 'Balance volume', run: () => setPrefill({ text: 'Balance the volume so quiet parts are easier to hear.', at: Date.now() }) },
    { icon: SparklesIcon, label: 'Warmer voice', run: () => setPrefill({ text: 'Make my voice sound a little warmer.', at: Date.now() }) },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground"><SparklesIcon className="size-3" /></span>
        <div className="min-w-0 flex-1">
          <ThreadSwitcher threads={threads} activeThreadId={activeThreadId} onOpen={onOpenThread} onNew={onNewThread} onRename={onRenameThread} onDelete={onDeleteThread} />
        </div>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={onNewThread} aria-label="New conversation"><MessageSquarePlusIcon /></Button></TooltipTrigger>
          <TooltipContent>New conversation</TooltipContent>
        </Tooltip>
        {onClose && (
          <Tooltip>
            <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Hide assistant"><PanelRightCloseIcon /></Button></TooltipTrigger>
            <TooltipContent>Hide assistant</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-5">
        <AnimatePresence>
          {showDiagnosis && fillerCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="plunk edge-card border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-caps text-muted-foreground">I listened to your audio</p>
                <button onClick={onDismissDiagnosis} className="-mt-1 -mr-1 p-1 text-muted-foreground hover:text-foreground" aria-label="Dismiss"><XIcon className="size-3.5" /></button>
              </div>
              <p className="mt-2 text-[15px] font-bold">
                <span className="mr-1.5 text-3xl font-extrabold tracking-tight tabular">{fillerCount}</span>
                filler word{fillerCount === 1 ? '' : 's'} found
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">They’re highlighted in the transcript. Review the cuts before anything changes.</p>
              <Button size="sm" className="mt-3" onClick={onReviewFillers}><ScissorsIcon />Mark them for removal</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {messages.length === 0 && !(showDiagnosis && fillerCount > 0) && (
          <div className="pt-6 text-center">
            <p className="font-display text-2xl">How should it sound?</p>
            <p className="mx-auto mt-2 max-w-64 text-[13px] text-muted-foreground">Describe a change in plain English. Edits you ask for show up as a new version you can compare and undo.</p>
          </div>
        )}

        {messages.map((m, i) => {
          const last = i === messages.length - 1
          if (m.role === 'user') {
            return (
              <Message key={i} align="end">
                <MessageContent><Bubble><BubbleContent className="whitespace-pre-wrap">{m.text}</BubbleContent></Bubble></MessageContent>
              </Message>
            )
          }
          if (m.error) {
            return (
              <Message key={i}>
                <AiAvatar />
                <MessageContent>
                  <Bubble variant="destructive">
                    <BubbleContent>
                      <span className="flex items-center gap-1.5 font-bold"><OctagonXIcon className="size-3.5" />{m.error.title}</span>
                      <span className="mt-1 block text-[13px] text-foreground/80">{m.error.body}</span>
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            )
          }
          if (m.role === 'task') {
            return (
              <TaskList
                key={m.id || i}
                tasks={m.tasks}
                running={m.running}
                since={m.since}
                summary={m.summary}
                className="border-l-2 border-border pl-3"
              />
            )
          }
          if (last && isStreaming && !m.text) {
            return <AgentThinking key={i} variant="wave" label="Thinking" since={thinkingSince} />
          }
          return (
            <Message key={i}>
              <AiAvatar />
              <MessageContent>
                <Bubble variant="secondary"><BubbleContent className="whitespace-pre-wrap">{m.text}{last && isStreaming && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-blink bg-foreground" />}</BubbleContent></Bubble>
              </MessageContent>
            </Message>
          )
        })}
        <div ref={endRef} />
      </div>

      <div className="shrink-0 space-y-3 border-t border-border p-3">
        <div className="flex flex-wrap gap-1.5">
          {chips.map(({ icon: Icon, label, run, disabled }) => (
            <button
              key={label}
              onClick={run}
              disabled={disabled || !transcriptReady}
              className="flex shrink-0 items-center gap-1.5 border border-input bg-card px-2.5 py-1.5 text-[12px] font-semibold transition-colors outline-hidden hover:border-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40"
            >
              <Icon className="size-3.5" />{label}
            </button>
          ))}
        </div>
        <AssistantComposer
          disabled={!transcriptReady}
          streaming={isStreaming}
          onSend={onSend}
          prefill={prefill}
          statusItems={statusItems}
          actions={chips.map(({ icon, label, run, disabled }) => ({ icon, label, onSelect: run, disabled: disabled || !transcriptReady }))}
        />
      </div>
    </div>
  )
}
