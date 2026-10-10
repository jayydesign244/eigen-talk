import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Edge-to-edge banners:
 *  - success: the solid green bar under the status bar ("your vehicle details have been updated").
 *  - mint:    the soft savings banner with a badge icon ("you just saved ₹2,400!").
 *  - info / warning: tinted notices.
 * Unlike <Alert>, a banner spans the screen and has no border or corners.
 */
const bannerVariants = cva(
  "flex w-full items-center gap-3 px-5 py-3.5 text-[13px] font-semibold tracking-[0.01em] [&>svg]:size-5 [&>svg]:shrink-0",
  {
    variants: {
      tone: {
        success: "bg-success text-pop-black",
        mint: "bg-success-soft text-foreground [&>svg]:text-success-ink",
        info: "bg-info-soft text-info-ink",
        warning: "bg-warning-soft text-warning-ink",
        destructive: "bg-destructive-soft text-destructive-ink",
        brand: "bg-brand-soft text-foreground [&>svg]:text-brand-ink",
      },
    },
    defaultVariants: { tone: "mint" },
  }
);

function Banner({ className, tone, role = "status", action, children, ...props }) {
  return (
    <div data-slot="banner" data-tone={tone} role={role} className={cn(bannerVariants({ tone }), className)} {...props}>
      {children}
      {action && <div className="ml-auto shrink-0">{action}</div>}
    </div>
  );
}

export { Banner, bannerVariants };
