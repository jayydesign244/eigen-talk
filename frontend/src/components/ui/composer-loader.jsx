import { cn } from "@/lib/utils";

/**
 * Wrap a composer to show the agent is working: an iridescent band
 * travels the rim with a faint bloom behind it. Toggling `active` fades the
 * effect so the composer lights up rather than switching.
 */
function ComposerLoader({ active = false, className, children, ...props }) {
  return (
    <div data-slot="composer-loader" data-active={active} className={cn("relative", className)} {...props}>
      {children}
      <span aria-hidden="true" className="composer-rim-bloom rounded-[20px]" style={{ opacity: active ? 1 : 0 }} />
      <span aria-hidden="true" className="composer-rim rounded-[18px]" style={{ opacity: active ? 1 : 0 }} />
    </div>
  );
}

export { ComposerLoader };
