import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The processing CTA CRED shows after "Pay": a mint bar that fills left to
 * right behind the label ("completing payment…"), with an outlined square
 * cancel button beside it. Pass `value` (0–100) for real progress, or leave it
 * out for an indeterminate sweep.
 */
function ProgressButton({ className, value, label = "Working…", onCancel, cancelLabel = "Cancel", ...props }) {
  const indeterminate = value == null;
  return (
    <div data-slot="progress-button" className={cn("flex w-full items-stretch gap-2.5", className)} {...props}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : value}
        className="relative flex h-12 flex-1 items-center justify-center overflow-hidden bg-success-soft text-[13px] font-semibold text-foreground"
      >
        <span
          className={cn(
            "absolute inset-y-0 left-0 bg-success-track transition-[width] duration-300 ease-[var(--ease-standard)]",
            indeterminate && "w-1/3 animate-[progress-sweep_1.4s_ease-in-out_infinite]"
          )}
          style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, value))}%` }}
        />
        <span className="relative">{label}</span>
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          aria-label={cancelLabel}
          className="flex size-12 shrink-0 items-center justify-center border border-foreground bg-card text-foreground outline-hidden transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
        >
          <XIcon className="size-5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

export { ProgressButton };
