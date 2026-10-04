import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Flat, square progress bar. `tone` picks the fill; omit `value` for an
 * indeterminate sweep (used while a server job has no percentage yet).
 */
function Progress({ className, value, tone = "brand", ...props }) {
  const indeterminate = value === undefined || value === null;
  const fill = {
    brand: "bg-brand",
    foreground: "bg-foreground",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  }[tone];
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={indeterminate ? null : value}
      className={cn("relative h-1.5 w-full overflow-hidden bg-muted", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-transform duration-500 ease-[var(--ease-out-expo)]",
          fill,
          indeterminate && "w-1/3 animate-[progress-sweep_1.2s_ease-in-out_infinite]"
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
