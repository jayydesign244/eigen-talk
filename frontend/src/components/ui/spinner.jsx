import { cn } from "@/lib/utils";

/**
 * Loading indicator drawn as three equaliser bars — it reads as "audio is
 * working" rather than a generic wheel. Inherits currentColor.
 */
function Spinner({ className, ...props }) {
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
          className="h-full w-[22%] origin-center animate-eq bg-current"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

export { Spinner };
