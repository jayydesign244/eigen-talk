import { Progress as ProgressPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Flat, square progress bar. `tone` picks the fill; omit `value` for an
 * indeterminate sweep (used while a server job has no percentage yet).
 * `size`: "line" is CRED's 2px loader rule under a fetching screen, "lg" the
 * thick square bar under a caps "100% COMPLETE".
 */
function Progress({ className, value, tone = "brand", size = "default", ...props }) {
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
      data-size={size}
      className={cn("group/progress relative h-1.5 w-full overflow-hidden rounded-full bg-muted data-[size=line]:h-0.5 data-[size=line]:rounded-none data-[size=line]:bg-border data-[size=lg]:h-1 data-[size=lg]:rounded-none", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 rounded-full group-data-[size=line]/progress:rounded-none group-data-[size=lg]/progress:rounded-none transition-transform duration-500 ease-[var(--ease-standard)]",
          fill,
          indeterminate && "w-1/3 animate-[progress-sweep_1.2s_ease-in-out_infinite]"
        )}
        style={indeterminate ? undefined : { transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}

export { Progress };
