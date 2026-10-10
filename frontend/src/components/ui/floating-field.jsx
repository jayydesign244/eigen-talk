import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * CRED's form field: a square outline with the caps label notched into the top
 * border ("MOBILE NUMBER", "DATE OF BIRTH"). Placeholders can be monospace
 * masks ("DD/MM/YYYY", "XXXX XXXX XXXX XXXX") via `mono`. `hint` sits under the
 * field, `error` replaces it in red, `trailing` holds an icon button.
 */
const FloatingField = forwardRef(function FloatingField(
  { className, label, hint, error, mono, trailing, id, inputClassName, ...props },
  ref
) {
  const auto = useId();
  const inputId = id ?? auto;
  const hintId = `${inputId}-hint`;
  return (
    <div data-slot="floating-field" className={cn("w-full", className)}>
      <div
        className={cn(
          "relative flex h-14 items-center gap-2 border border-input bg-card px-3.5 transition-colors focus-within:border-foreground hover:border-muted-foreground/60",
          error && "border-destructive focus-within:border-destructive"
        )}
      >
        <label
          htmlFor={inputId}
          className="text-caps absolute -top-[7px] left-2.5 bg-card px-1.5 text-[9px] leading-none tracking-[0.2em] text-muted-foreground"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={hint || error ? hintId : undefined}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent text-[15px] font-semibold tracking-[0.02em] text-foreground outline-hidden placeholder:font-medium placeholder:text-muted-foreground/60",
            mono && "font-mono tracking-[0.12em] placeholder:tracking-[0.12em]",
            inputClassName
          )}
          {...props}
        />
        {trailing}
      </div>
      {(hint || error) && (
        <p id={hintId} className={cn("mt-2 text-xs font-medium tracking-[0.02em]", error ? "text-destructive-ink" : "text-muted-foreground")}>
          {error || hint}
        </p>
      )}
    </div>
  );
});

/**
 * The bare field on CRED's dark forms: a tiny caps label over a large value,
 * no box at all ("FULL NAME / john doe"). Good for short, confident forms.
 */
const BareField = forwardRef(function BareField({ className, label, hint, error, mono, id, inputClassName, ...props }, ref) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div data-slot="bare-field" className={cn("flex w-full flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-caps text-[9px] tracking-[0.2em] text-muted-foreground">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          "h-10 w-full bg-transparent text-xl font-semibold tracking-[0.01em] text-foreground outline-hidden placeholder:text-muted-foreground/40 read-only:text-muted-foreground focus-visible:shadow-[0_1px_0_var(--foreground)]",
          mono && "font-mono",
          error && "shadow-[0_1px_0_var(--destructive)]",
          inputClassName
        )}
        {...props}
      />
      {(hint || error) && <p className={cn("text-xs font-medium", error ? "text-destructive-ink" : "text-muted-foreground")}>{error || hint}</p>}
    </div>
  );
});

export { FloatingField, BareField };
