import { CheckIcon, XIcon } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Full-bleed moments between steps, as CRED stages them:
 *  - success:  a large check inside concentric rings ("CRED garage is ready for you.").
 *  - loading:  a ring with a slow pulse and a serif line ("refreshing your vehicle details at top speed").
 *  - error:    the same frame with a cross.
 *  - celebrate: a radial burst behind a bold display word ("GREAT DRIVING!").
 * `tone="green"` paints the whole screen in success green (payment complete).
 * Children render under the message (a caption, a CTA).
 */
const statusScreenVariants = cva("relative isolate flex min-h-80 w-full flex-col items-center justify-center gap-6 overflow-hidden px-8 py-12 text-center", {
  variants: {
    tone: {
      dark: "dark bg-pop-black text-foreground",
      green: "bg-success text-pop-black",
      plain: "bg-background text-foreground",
    },
  },
  defaultVariants: { tone: "dark" },
});

function StatusScreen({ className, tone, state = "success", eyebrow, title, display, children, ...props }) {
  const ring = (inner) => (
    <span className="relative flex size-36 items-center justify-center rounded-full border border-current/20">
      <span className={cn("absolute inset-3 rounded-full border border-current/35", state === "loading" && "motion-safe:animate-ping [animation-duration:2s]")} />
      {inner}
    </span>
  );
  return (
    <section
      data-slot="status-screen"
      data-state={state}
      role={state === "loading" ? "status" : undefined}
      aria-live="polite"
      className={cn(statusScreenVariants({ tone }), className)}
      {...props}
    >
      {state === "celebrate" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60 [background:repeating-conic-gradient(from_0deg,rgb(255_255_255/0.05)_0_6deg,transparent_6deg_18deg)]"
        />
      )}
      {state === "success" &&
        ring(
          <span className={cn("flex size-20 items-center justify-center rounded-full", tone === "green" ? "bg-pop-black text-white" : "border-2 border-success text-success")}>
            <CheckIcon className="size-10" strokeWidth={3} />
          </span>
        )}
      {state === "error" &&
        ring(
          <span className="flex size-20 items-center justify-center rounded-full border-2 border-destructive text-destructive">
            <XIcon className="size-10" strokeWidth={3} />
          </span>
        )}
      {state === "loading" && ring(<span className="size-6 rounded-full bg-current opacity-80 motion-safe:animate-pulse" />)}
      {eyebrow && <p className="text-caps text-[10px] tracking-[0.2em] opacity-60">{eyebrow}</p>}
      {display && <p className="max-w-[12ch] text-5xl leading-[1.05] font-extrabold tracking-tight text-[#f472e6] uppercase">{display}</p>}
      {title && <h2 className="max-w-[18ch] font-display text-[26px] leading-snug">{title}</h2>}
      {children}
    </section>
  );
}

export { StatusScreen, statusScreenVariants };
