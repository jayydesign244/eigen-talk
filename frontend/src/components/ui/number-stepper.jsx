import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRED's quantity stepper: two grey square keys around the number ("- 1 +").
 * Controlled through `value` / `onValueChange`, clamped to `min`–`max`.
 * At the limit the key disables; `limitText` ("max quantity added") can show below.
 */
function NumberStepper({ className, value = 0, onValueChange, min = 0, max = Infinity, step = 1, label = "Quantity", limitText, ...props }) {
  const set = (n) => onValueChange?.(Math.max(min, Math.min(max, n)));
  const atMax = value >= max;
  return (
    <div data-slot="number-stepper" className={cn("inline-flex flex-col gap-1.5", className)} {...props}>
      <div role="group" aria-label={label} className="inline-flex h-9 items-stretch">
        <button
          type="button"
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => set(value - step)}
          className="flex w-9 items-center justify-center bg-chip text-foreground outline-hidden transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:text-muted-foreground/50"
        >
          <MinusIcon className="size-3.5" />
        </button>
        <output aria-live="polite" className="flex min-w-10 items-center justify-center text-[15px] font-bold tabular">
          {value}
        </output>
        <button
          type="button"
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={atMax}
          onClick={() => set(value + step)}
          className="flex w-9 items-center justify-center bg-chip text-foreground outline-hidden transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:text-muted-foreground/50"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </div>
      {atMax && limitText && <p className="text-xs font-semibold text-warning-ink">{limitText}</p>}
    </div>
  );
}

export { NumberStepper };
