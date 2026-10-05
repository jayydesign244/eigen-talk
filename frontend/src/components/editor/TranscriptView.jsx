import { useState } from 'react'
import { motion } from 'motion/react'
import { FileAudioIcon, MessageSquareQuoteIcon, OctagonXIcon, PencilIcon, PlayIcon, RefreshCwIcon, RotateCcwIcon, TrashIcon } from 'lucide-react'
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

export const fmtClock = (s) => {
  if (!Number.isFinite(s) || s < 0) s = 0
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function Word({ word, si, wi, state, active, editing, inlineText, onInlineChange, onCommit, onCancel, onClick, onDoubleClick, onContext, activeRef }) {
  const original = (word.text || '').trim()
  if (editing) {
    return (
      <span className="inline-block">
        <input
          autoFocus
          value={inlineText}
          onChange={(e) => onInlineChange(e.target.value)}
          onBlur={onCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onCommit() }
            if (e.key === 'Escape') { e.preventDefault(); onCancel() }
          }}
          aria-label={`Replace “${original}”`}
          className="-my-0.5 border border-brand bg-brand-soft px-1 text-[17px] text-foreground outline-hidden"
          size={Math.max(inlineText.length, 4)}
        />{' '}
      </span>
    )
  }
  const { deleted, replacedTo, filler } = state
  const replaced = replacedTo !== undefined
  return (
    <>
      <span
        ref={active ? activeRef : null}
        data-si={si}
        data-wi={wi}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContext}
        title={
          deleted ? 'Will be cut · click to restore'
            : replaced ? `Will become “${replacedTo}” · click to cut instead`
              : filler ? 'Filler word · click to cut'
                : 'Click to cut · double-click to edit · ⇧-click to play from here'
        }
        className={cn(
          'cursor-pointer px-[1px] transition-[background-color,color] duration-100',
          deleted && 'text-destructive-ink line-through decoration-destructive decoration-2 opacity-70',
          !deleted && replaced && 'bg-brand-soft text-foreground underline decoration-brand decoration-2 underline-offset-4',
          !deleted && !replaced && active && 'bg-brand text-brand-foreground',
          !deleted && !replaced && !active && filler && 'bg-warning-soft text-warning-ink underline decoration-warning decoration-dotted decoration-2 underline-offset-4',
          !deleted && !replaced && !active && !filler && 'hover:bg-accent hover:underline hover:decoration-muted-foreground hover:underline-offset-4'
        )}
      >
        {replaced ? replacedTo : original}
      </span>{' '}
    </>
  )
}

/**
 * The transcript as an editable document. Words are the editing surface:
 * click cuts, double-click rewrites, ⇧-click plays, right-click opens the
 * word menu. Nothing changes the audio until edits are applied.
 */
export function TranscriptView({
  transcriptState,
  transcript,
  transcriptError,
  onRetry,
  fillerSet,
  pending,
  activeWordKey,
  activeWordRef,
  onSeek,
  inlineEdit,
  onBeginEdit,
  onInlineChange,
  onCommitEdit,
  onCancelEdit,
  onAttachLine,
}) {
  const [menuWord, setMenuWord] = useState(null) // { si, wi, start, text }

  if (transcriptState === 'no-audio') {
    return (
      <div className="hatch flex flex-col items-center border border-dashed border-input px-6 py-20 text-center">
        <FileAudioIcon className="size-6 text-muted-foreground" />
        <p className="mt-4 font-display text-3xl">No audio yet</p>
        <p className="mt-2 text-sm text-muted-foreground">Upload a file to this project from the dashboard to get a transcript.</p>
      </div>
    )
  }

  if (transcriptState === 'transcribing') {
    return (
      <div aria-live="polite">
        <div className="mb-8 flex items-center gap-3 text-sm font-bold"><Spinner className="text-brand" />Writing the transcript…</div>
        <div className="space-y-6">
          {[0.92, 0.78, 0.86, 0.6].map((w, i) => (
            <div key={i} className="flex gap-5">
              <Skeleton className="h-4 w-12 shrink-0" />
              <div className="flex-1 space-y-2.5"><Skeleton className="h-4" style={{ width: `${w * 100}%` }} /><Skeleton className="h-4" style={{ width: `${w * 70}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (transcriptState === 'error') {
    return (
      <Alert variant="destructive">
        <OctagonXIcon />
        <AlertTitle>{transcriptError?.title || 'Transcription failed'}</AlertTitle>
        <AlertDescription>
          <p>{transcriptError?.body}</p>
          {transcriptError?.technical && <p className="mt-1 font-mono text-[11px] break-all opacity-70">{transcriptError.technical}</p>}
          <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}><RefreshCwIcon />Try again</Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (transcriptState !== 'ready' || !transcript?.segments?.length) {
    return <p className="text-sm text-muted-foreground">Loading transcript…</p>
  }

  const menuDeleted = menuWord && pending.isDeleted(menuWord.si, menuWord.wi)

  return (
    <ContextMenu onOpenChange={(o) => !o && setMenuWord(null)}>
      <ContextMenuTrigger asChild>
        <div className="space-y-1">
          {transcript.segments.map((seg, si) => (
            <motion.div
              key={si}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(si * 0.03, 0.4), duration: 0.3 }}
              className="group grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 py-2"
            >
              <button
                onClick={() => onSeek(seg.start, { play: true })}
                className="h-fit pt-1 text-left font-mono text-[11px] text-muted-foreground/70 tabular transition-colors outline-hidden group-hover:text-foreground hover:text-brand-ink focus-visible:text-brand-ink"
                aria-label={`Play from ${fmtClock(seg.start)}`}
              >
                {fmtClock(seg.start)}
              </button>
              <p className="text-[17px] leading-[1.9] text-pretty">
                {seg.words.map((w, wi) => {
                  const key = `${si}-${wi}`
                  const original = (w.text || '').trim()
                  return (
                    <Word
                      key={wi}
                      word={w}
                      si={si}
                      wi={wi}
                      active={activeWordKey === key}
                      activeRef={activeWordRef}
                      state={{ deleted: pending.isDeleted(si, wi), replacedTo: pending.replacedText(si, wi), filler: fillerSet.has(key) }}
                      editing={inlineEdit && inlineEdit.si === si && inlineEdit.wi === wi}
                      inlineText={inlineEdit?.text || ''}
                      onInlineChange={onInlineChange}
                      onCommit={onCommitEdit}
                      onCancel={onCancelEdit}
                      onClick={(e) => {
                        if (e.shiftKey) return onSeek(w.start, { play: true })
                        if (e.altKey || e.metaKey) return onBeginEdit(si, wi, original)
                        pending.toggleDelete(si, wi)
                      }}
                      onDoubleClick={(e) => { e.preventDefault(); onBeginEdit(si, wi, original) }}
                      onContext={() => setMenuWord({ si, wi, start: w.start, text: original })}
                    />
                  )
                })}
              </p>
            </motion.div>
          ))}
        </div>
      </ContextMenuTrigger>
      {menuWord && (
        <ContextMenuContent className="w-56">
          <ContextMenuLabel className="truncate normal-case tracking-normal">“{menuWord.text}”</ContextMenuLabel>
          <ContextMenuItem onSelect={() => onSeek(menuWord.start, { play: true })}><PlayIcon />Play from here<ContextMenuShortcut>⇧ click</ContextMenuShortcut></ContextMenuItem>
          <ContextMenuItem onSelect={() => onBeginEdit(menuWord.si, menuWord.wi, menuWord.text)}><PencilIcon />Rewrite word<ContextMenuShortcut>2× click</ContextMenuShortcut></ContextMenuItem>
          {onAttachLine && <ContextMenuItem onSelect={() => onAttachLine(menuWord.si)}><MessageSquareQuoteIcon />Ask AI about this line</ContextMenuItem>}
          <ContextMenuSeparator />
          <ContextMenuItem variant={menuDeleted ? 'default' : 'destructive'} onSelect={() => pending.toggleDelete(menuWord.si, menuWord.wi)}>
            {menuDeleted ? <><RotateCcwIcon />Restore word</> : <><TrashIcon />Cut word</>}
            <ContextMenuShortcut>click</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  )
}
