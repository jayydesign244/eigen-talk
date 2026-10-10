import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Chip } from "@/components/ui/chip";

/**
 * CRED's amount entry: a caps label ("ENTER AMOUNT"), an optional hint on the
 * right ("min accepted is ₹500"), then a big currency symbol and value with the
 * blue caret. `size="display"` is the centred hero amount on pay screens.
 */
const AmountInput = forwardRef(function AmountInput(
  { className, label, hint, symbol = "₹", size = "default", id, error, ...props },
  ref
) {
  const auto = useId();
  const inputId = id ?? auto;
  const display = size === "display";
  return (
    <div data-slot="amount-input" className={cn("flex w-full flex-col gap-2", display && "items-center", className)}>
      {(label || hint) && (
        <div className="flex w-full items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={inputId} className="text-caps text-[10px] tracking-[0.2em] text-muted-foreground">
              {label}
            </label>
          )}
          {hint && <span className="text-[11px] font-medium text-muted-foreground">{hint}</span>}
        </div>
      )}
      <div className={cn("flex items-baseline gap-1 tabular", display ? "justify-center text-5xl font-extrabold" : "text-2xl font-bold")}>
        <span aria-hidden className="text-foreground">{symbol}</span>
        <input
          ref={ref}
          id={inputId}
          inputMode="decimal"
          autoComplete="off"
          aria-invalid={error ? true : undefined}
          className={cn(
            "min-w-0 bg-transparent text-foreground outline-hidden placeholder:text-muted-foreground/40 [field-sizing:content]",
            display ? "max-w-[6ch] text-center" : "flex-1"
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-destructive-ink">{error}</p>}
    </div>
  );
});

/** Quick-pick amounts under the field: green outlined chips ("₹500 ₹600 ₹700"). */
function QuickAmounts({ className, amounts = [], value, onSelect, symbol = "₹", ...props }) {
  return (
    <div data-slot="quick-amounts" role="group" aria-label="Quick amounts" className={cn("flex flex-wrap gap-2.5", className)} {...props}>
      {amounts.map((a) => (
        <Chip key={a} variant="success" aria-pressed={String(value) === String(a)} onClick={() => onSelect?.(a)} className="tabular">
          {symbol}
          {a}
        </Chip>
      ))}
    </div>
  );
}

export { AmountInput, QuickAmounts };
