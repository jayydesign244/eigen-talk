import { LockIcon, ShieldCheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The reassurance line at the foot of CRED's sensitive screens:
 *  - powered: "powered by <partner logos>".
 *  - secure:  a lock + "256-bit encryption" followed by a row of small logo tiles.
 *  - protect: "powered by CRED protect" with a shield, centred.
 * `logos` is an array of nodes (images or text marks) shown as small tiles.
 */
function TrustFooter({ className, variant = "secure", label, logos = [], ...props }) {
  return (
    <div
      data-slot="trust-footer"
      className={cn("flex w-full flex-wrap items-center justify-center gap-x-2.5 gap-y-2 py-3 text-[11px] font-medium text-muted-foreground", className)}
      {...props}
    >
      {variant === "secure" && <LockIcon className="size-3" aria-hidden />}
      <span>{label ?? (variant === "powered" ? "powered by" : variant === "protect" ? "powered by Sonicly protect" : "256-bit encryption")}</span>
      {variant === "protect" && <ShieldCheckIcon className="size-4 text-success-ink" aria-hidden />}
      {logos.length > 0 && (
        <span className="flex flex-wrap items-center gap-1.5">
          {logos.map((l, i) => (
            <span key={i} className="flex h-5 min-w-8 items-center justify-center border-[0.6px] border-border bg-card px-1.5 text-[8px] font-bold tracking-wide text-foreground [&_img]:h-3">
              {l}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

export { TrustFooter };
