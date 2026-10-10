import { cn } from "@/lib/utils";

/**
 * Loading indicator drawn as three equaliser bars — it reads as "audio is
 * working" rather than a generic wheel. Inherits currentColor.
 * `variant="dots"`: CRED's busy button — four small squares lighting in turn.
 */
function Spinner({ className, variant = "bars", ...props }) {
  if (variant === "dots") {
    return (
      <span role="status" aria-label="Loading" data-slot="spinner" data-variant="dots" className={cn("inline-flex items-center gap-1.5", className)} {...props}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="size-1.5 bg-current motion-safe:animate-blink" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </span>
    );
  }
  return (
    <span
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      className={cn("inline-flex size-4 items-center justify-center gap-[2px]", className)}
      {...props}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-full w-[22%] origin-center animate-eq rounded-full bg-current"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

export { Spinner };
