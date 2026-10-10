import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRED's product-tour panel: a dark card docked at the bottom with a green
 * progress line on its top edge, a caps step title with a "01/04" counter, a
 * monospace body, and caps NEXT → / FINISH → (plus ← back after step one).
 * Controlled: pass `step` (0-based), `steps` = [{ title, body }], `onStepChange`
 * and `onFinish`. Pair it with a dimmed screen behind to spotlight the area.
 */
function TourPanel({ className, steps = [], step = 0, onStepChange, onFinish, ...props }) {
  const s = steps[step] ?? {};
  const last = step === steps.length - 1;
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <section
      data-slot="tour-panel"
      aria-roledescription="tour step"
      aria-label={`${s.title}, step ${step + 1} of ${steps.length}`}
      className={cn("dark relative w-full bg-[#1c1c1c] px-6 pt-7 pb-5 text-foreground", className)}
      {...props}
    >
      <span className="absolute inset-x-0 top-0 h-[3px] bg-white/10">
        <span className="block h-full bg-success transition-[width] duration-500 ease-[var(--ease-standard)]" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
      </span>
      <div className="flex items-center justify-between gap-4 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        <span>{s.title}</span>
        <span className="text-foreground tabular">
          {pad(step + 1)}/{pad(steps.length)}
        </span>
      </div>
      <p aria-live="polite" className="mt-5 min-h-[3lh] font-mono text-[15px] leading-relaxed">{s.body}</p>
      <div className="mt-6 flex items-center justify-between border-t-[0.8px] border-border pt-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => onStepChange?.(step - 1)}
            aria-label="Previous step"
            className="text-foreground outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => (last ? onFinish?.() : onStepChange?.(step + 1))}
          className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-[0.14em] uppercase underline underline-offset-4 outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
        >
          {last ? "Finish" : "Next"} <ArrowRightIcon className="size-4" />
        </button>
      </div>
    </section>
  );
}

export { TourPanel };
