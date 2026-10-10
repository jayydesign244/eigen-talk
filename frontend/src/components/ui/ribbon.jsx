import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Full-width caps strips CRED pins to the edge of a screen or sheet:
 *  - success: green "UNLOCK UP TO 100% CASHBACK" with diagonal light stripes.
 *  - destructive: red "₹336 CASHBACK EXPIRING IN 23:59:58".
 *  - brand / dark: Sonicly's own variants.
 */
const ribbonVariants = cva(
  "relative flex h-7 w-full items-center justify-center overflow-hidden px-4 text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap",
  {
    variants: {
      tone: {
        success: "bg-success text-pop-black",
        destructive: "bg-destructive text-white",
        warning: "bg-warning text-pop-black",
        brand: "bg-brand text-brand-foreground",
        dark: "bg-pop-black text-white",
      },
      striped: {
        true: "before:absolute before:inset-y-0 before:left-[8%] before:w-10 before:-skew-x-[35deg] before:bg-white/25 after:absolute after:inset-y-0 after:right-[6%] after:w-6 after:-skew-x-[35deg] after:bg-white/25",
        false: "",
      },
    },
    defaultVariants: { tone: "success", striped: true },
  }
);

function Ribbon({ className, tone, striped, children, ...props }) {
  return (
    <div data-slot="ribbon" data-tone={tone} className={cn(ribbonVariants({ tone, striped }), className)} {...props}>
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </div>
  );
}

/** Counts down to `to` (a Date or ms timestamp) as HH:MM:SS, or "6D:13H" when `format="days"`. */
function Countdown({ to, format = "clock", className, ...props }) {
  const target = typeof to === "number" ? to : new Date(to).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor((target - now) / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  const text =
    format === "days"
      ? `${Math.floor(s / 86400)}D:${pad(Math.floor((s % 86400) / 3600))}H`
      : `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return (
    <time data-slot="countdown" className={cn("font-mono tabular", className)} {...props}>
      {text}
    </time>
  );
}

/**
 * The marquee pill at the top of CRED's home ("play today's jackpot · PLAY NOW >"):
 * a rounded dark pill with a leading logo, scrolling text and a trailing action.
 */
function Ticker({ className, leading, action, children, ...props }) {
  return (
    <div
      data-slot="ticker"
      className={cn(
        "flex h-10 w-full max-w-72 items-center gap-2.5 overflow-hidden rounded-full border border-warning/40 bg-pop-black pr-3 pl-1.5 text-white shadow-[0_6px_20px_rgb(240_141_50/0.18)]",
        className
      )}
      {...props}
    >
      {leading && <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full">{leading}</span>}
      <div className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        <div className="flex w-max animate-marquee text-xs font-semibold whitespace-nowrap motion-reduce:animate-none">
          <span className="pr-8">{children}</span>
          <span aria-hidden className="pr-8">{children}</span>
        </div>
      </div>
      {action && <span className="shrink-0 text-[9px] font-bold tracking-[0.12em] text-success uppercase">{action}</span>}
    </div>
  );
}

export { Ribbon, Countdown, Ticker, ribbonVariants };
