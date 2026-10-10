import { FileAudioIcon, FileIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A strip of 56px tiles above a prompt. While a file uploads, a square ring
 * draws clockwise around its tile with the percentage in the corner; at 100
 * the percentage gives way to the dismiss button.
 *
 * item: { id, name, kind: 'image' | 'audio' | 'file', url?, progress? (0–100) }
 */
function AttachmentTile({ item, onRemove }) {
  const uploading = typeof item.progress === "number" && item.progress < 100;
  const Icon = item.kind === "audio" ? FileAudioIcon : FileIcon;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      className="group relative size-14 shrink-0"
      title={item.name}
    >
      <div className="flex size-full flex-col items-center justify-center overflow-hidden rounded-xl border-[0.8px] border-border bg-muted">
        {item.kind === "image" && item.url ? (
          <img src={item.url} alt="" className="size-full object-cover" />
        ) : (
          <>
            <Icon className="size-4 text-muted-foreground" />
            <span className="mt-1 w-full truncate px-1 text-center text-[8px] font-bold text-muted-foreground">{item.name}</span>
          </>
        )}
      </div>
      {uploading && (
        <svg className="pointer-events-none absolute -inset-[3px] size-[calc(100%+6px)]" viewBox="0 0 62 62" aria-hidden="true">
          <rect
            x="1.5" y="1.5" width="59" height="59" rx="13.5" ry="13.5"
            fill="none"
            stroke="var(--brand)"
            strokeWidth="2"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - item.progress}
            style={{ transition: "stroke-dashoffset 0.3s linear" }}
          />
        </svg>
      )}
      <AnimatePresence mode="wait" initial={false}>
        {uploading ? (
          <motion.span
            key="pct"
            exit={{ opacity: 0, filter: "blur(3px)" }}
            className="absolute right-1 bottom-1 rounded-xs bg-background/90 px-0.5 font-mono text-[9px] font-bold tabular"
          >
            {Math.round(item.progress)}%
          </motion.span>
        ) : (
          onRemove && (
            <motion.button
              key="x"
              type="button"
              initial={{ opacity: 0, filter: "blur(3px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              onClick={() => onRemove(item.id)}
              className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-background shadow-soft outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
              aria-label={`Remove ${item.name}`}
            >
              <XIcon className="size-3" strokeWidth={3} />
            </motion.button>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ComposerAttachments({ items = [], onRemove, className, ...props }) {
  if (!items.length) return null;
  return (
    <div data-slot="composer-attachments" className={cn("flex gap-3 overflow-x-auto px-1 pt-2 pb-1 no-scrollbar", className)} {...props}>
      <AnimatePresence initial={false}>
        {items.map((item) => <AttachmentTile key={item.id} item={item} onRemove={onRemove} />)}
      </AnimatePresence>
    </div>
  );
}

export { ComposerAttachments, AttachmentTile };
