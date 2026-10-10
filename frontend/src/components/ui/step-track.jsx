import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Milestone track (CRED's "₹40 cashback on next 4 UPI payments" and referral
 * levels): nodes joined by a line, done nodes turn green with a check, and an
 * optional caps label sits under each. `steps` = [{ label?, reward? }]; `value`
 * is how many are done.
 *  - cube:  raised hexagonal 3D nodes (dark surfaces).
 *  - dot:   small dots on a thin track with caps labels (levels).
 */
function StepTrack({ className, steps = [], value = 0, variant = "cube", label = "Progress", ...props }) {
  return (
    <ol
      data-slot="step-track"
      aria-label={label}
      className={cn("relative flex w-full items-start justify-between", className)}
      {...props}
    >
      <span aria-hidden className={cn("absolute inset-x-5 bg-border-strong", variant === "cube" ? "top-5 h-px" : "top-[5px] h-[3px]")} />
      {steps.map((s, i) => {
        const done = i < value;
        const current = i === value;
        return (
          <li key={i} aria-current={current ? "step" : undefined} className="relative z-10 flex flex-col items-center gap-2">
            {variant === "cube" ? (
              <span
                className={cn(
                  "flex size-10 items-center justify-center [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]",
                  done ? "bg-success text-pop-black" : "bg-linear-to-b from-[#f2f2f2] to-[#9a9a9a] text-pop-black"
                )}
              >
                {done ? <CheckIcon className="size-4" strokeWidth={3} /> : <span className="size-3 rotate-45 bg-pop-black/80" />}
              </span>
            ) : (
              <span className={cn("size-[13px] rounded-full border-2 border-background", done || current ? "bg-warning" : "bg-muted-foreground")} />
            )}
            {(s.label || s.reward) && (
              <span className={cn("text-caps text-[8px] tracking-[0.14em]", done ? "text-success-ink" : "text-muted-foreground")}>{s.reward ?? s.label}</span>
            )}
            <span className="sr-only">{done ? "done" : current ? "current" : "to do"}</span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Pagers: `variant="square"` is CRED's onboarding (active square white, others
 * dim), `dot` the image carousel dots, `line` the gallery segment bar.
 */
function PageDots({ className, count = 3, index = 0, variant = "square", onSelect, label = "Slide", ...props }) {
  return (
    <div data-slot="page-dots" role="tablist" className={cn("flex items-center", variant === "line" ? "gap-0" : "gap-1.5", className)} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === index}
          aria-label={`${label} ${i + 1} of ${count}`}
          onClick={() => onSelect?.(i)}
          className={cn(
            "outline-hidden transition-all duration-300 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
            variant === "square" && cn("size-2", i === index ? "bg-foreground" : "bg-muted-foreground/30"),
            variant === "dot" && cn("h-1.5 rounded-full", i === index ? "w-4 bg-foreground" : "w-1.5 bg-muted-foreground/40"),
            variant === "line" && cn("h-0.5 w-8", i === index ? "bg-foreground" : "bg-border-strong")
          )}
        />
      ))}
    </div>
  );
}

export { StepTrack, PageDots };
