import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function compact(n) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

/**
 * The agent budget widget: a context-window bar segmented by bucket with a
 * used / max readout, plus plan limits with reset times. Opening the context
 * row grows the card to show the per-bucket breakdown and free space.
 *
 * context: { used, max, buckets: [{ label, value, color }] }
 * limits:  [{ label, percent, resets }]
 */
function AgentLimitsCard({ context, limits = [], plan, className }) {
  const [open, setOpen] = useState(false);
  const pct = context ? Math.round((context.used / context.max) * 100) : 0;
  const free = context ? Math.max(0, context.max - context.used) : 0;
  return (
    <div data-slot="agent-limits-card" className={cn("w-full max-w-sm border border-border bg-card", className)}>
      {context && (
        <div className="border-b border-border">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="w-full px-4 pt-3.5 pb-3 text-left outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
          >
            <span className="flex items-center justify-between">
              <span className="text-caps text-muted-foreground">Context window</span>
              <span className="flex items-center gap-1.5 font-mono text-[12px] tabular">
                <span className="font-bold">{compact(context.used)}</span>
                <span className="text-muted-foreground">/ {compact(context.max)}</span>
                <span className={cn("font-bold", pct > 85 ? "text-warning-ink" : "text-foreground")}>({pct}%)</span>
                <ChevronDownIcon className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
              </span>
            </span>
            <span className="mt-2.5 flex h-2 w-full gap-px bg-muted">
              {context.buckets.map((b) => (
                <motion.span
                  key={b.label}
                  initial={{ width: 0 }}
                  animate={{ width: `${(b.value / context.max) * 100}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                  style={{ background: b.color }}
                />
              ))}
            </span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1.5 overflow-hidden px-4 pb-3.5"
              >
                {context.buckets.map((b) => (
                  <li key={b.label} className="flex items-center gap-2 text-[12px]">
                    <span className="size-2.5" style={{ background: b.color }} />
                    <span className="flex-1">{b.label}</span>
                    <span className="font-mono tabular text-muted-foreground">{compact(b.value)}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 border-t border-border pt-1.5 text-[12px]">
                  <span className="size-2.5 border border-input" />
                  <span className="flex-1 text-muted-foreground">Free space</span>
                  <span className="font-mono tabular text-muted-foreground">{compact(free)}</span>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
      {limits.length > 0 && (
        <div className="px-4 py-3.5">
          <p className="text-caps text-muted-foreground">Plan usage{plan ? ` · ${plan}` : ""}</p>
          <ul className="mt-3 space-y-3">
            {limits.map((l) => (
              <li key={l.label}>
                <div className="flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="font-bold">{l.label}</span>
                  <span className="text-muted-foreground">
                    {l.resets && <>Resets {l.resets} · </>}
                    <span className={cn("font-mono font-bold tabular", l.percent > 85 ? "text-warning-ink" : "text-foreground")}>{l.percent}%</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${l.percent}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className={cn("h-full", l.percent > 85 ? "bg-warning" : "bg-foreground")}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { AgentLimitsCard };
