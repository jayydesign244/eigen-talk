import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, ChevronDownIcon, OctagonXIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Circular progress; indeterminate (spinning arc) when `value` is undefined. */
function Ring({ value, size = 16, className }) {
  const indeterminate = value === undefined || value === null;
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={cn("-rotate-90 shrink-0", indeterminate && "animate-spin", className)} aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <circle
        cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.5"
        pathLength="100"
        strokeDasharray={indeterminate ? "28 100" : `${Math.max(0, Math.min(100, value))} 100`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
  );
}

function StepIcon({ status, progress }) {
  if (status === "done") {
    return (
      <span className="flex size-4 items-center justify-center rounded-sm bg-success text-background">
        <CheckIcon className="size-3 animate-pop" strokeWidth={3.5} />
      </span>
    );
  }
  if (status === "error") {
    return <span className="flex size-4 items-center justify-center rounded-sm bg-destructive text-destructive-foreground"><OctagonXIcon className="size-3" /></span>;
  }
  if (status === "active") return <Ring value={progress} className="text-brand" />;
  return <span className="size-4 rounded-sm border border-input" />;
}

/**
 * A collapsible block for multi-step agent work. Steps arrive with a soft
 * stagger; the active one carries a ring that mirrors the header's; when
 * everything is done the header reports how long it took.
 *
 * steps: [{ id, label, status: 'pending' | 'active' | 'done' | 'error', detail?, progress? }]
 */
function AgentProgress({ steps = [], title, duration, defaultOpen = true, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const done = steps.filter((s) => s.status === "done").length;
  const failed = steps.some((s) => s.status === "error");
  const complete = done === steps.length && steps.length > 0;
  const active = steps.find((s) => s.status === "active");
  const left = steps.length - done;
  const overall = steps.length ? ((done + (active?.progress ?? 0) / 100) / steps.length) * 100 : 0;

  const heading =
    title ||
    (failed ? "Stopped with an error" : complete ? `Done${duration ? ` in ${duration}` : ""}` : `${left} step${left === 1 ? "" : "s"} left`);

  return (
    <div data-slot="agent-progress" className={cn("overflow-hidden rounded-2xl border-[0.8px] border-border bg-card", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left outline-hidden transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
      >
        {complete ? (
          <span className="flex size-4 items-center justify-center rounded-sm bg-success text-background"><CheckIcon className="size-3" strokeWidth={3.5} /></span>
        ) : failed ? (
          <span className="flex size-4 items-center justify-center rounded-sm bg-destructive text-destructive-foreground"><OctagonXIcon className="size-3" /></span>
        ) : (
          <Ring value={active?.progress === undefined ? undefined : overall} className="text-brand" />
        )}
        <span className={cn("text-[13px] font-bold", !complete && !failed && "text-shimmer")}>{heading}</span>
        {!open && active && <span className="min-w-0 truncate text-[12px] text-muted-foreground">· {active.label}</span>}
        <ChevronDownIcon className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t-[0.8px] border-border p-1"
          >
            {steps.map((s, i) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-[opacity,background-color] hover:bg-accent/50", s.status === "pending" && "opacity-45")}
              >
                <StepIcon status={s.status} progress={s.progress} />
                <span className={cn("text-[13px]", s.status === "active" ? "font-bold" : "font-medium")}>{s.label}</span>
                {s.detail && <span className="ml-auto font-mono text-[11px] text-muted-foreground tabular">{s.detail}</span>}
              </motion.li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

export { AgentProgress, Ring };
