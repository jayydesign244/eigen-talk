import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Tags in CRED's 2026 style: the black pill tag ("EARN ₹100"), gradient status
 * chips with a hairline rim (4px corners), and soft tinted tags.
 * From the Mobbin review: soft status tags on rows ("ACTIVE", "LOW BALANCE",
 * "EXPIRED"), the grey "+5 MORE", the folder tab on reward cards ("FOR 02 DAYS"),
 * the offset "IN-STORE" notch and the red monospace "CARD SETUP PENDING".
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border-[0.7px] px-2.5 py-1 text-[10px] leading-none font-bold tracking-[0.1em] uppercase whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground [a&]:hover:bg-primary/85",
        brand: "border-brand bg-brand text-brand-foreground",
        secondary: "border-border-cool bg-chip text-foreground [a&]:hover:bg-accent",
        destructive: "rounded-sm border-[#d06060] bg-linear-to-r from-[#d0403a] to-[#c93636] text-white",
        success: "rounded-sm border-[#3fa68f] bg-linear-to-r from-[#13866d] to-[#11785f] text-white",
        warning: "rounded-sm border-transparent bg-warning-soft text-warning-ink",
        info: "rounded-sm border-transparent bg-info-soft text-info-ink",
        outline: "border-foreground/80 bg-transparent text-foreground [a&]:hover:bg-accent",
        ghost: "border-transparent text-muted-foreground [a&]:hover:bg-accent [a&]:hover:text-foreground",
        link: "border-transparent px-0 text-foreground underline decoration-brand underline-offset-4",
        "success-soft": "rounded-xs border-transparent bg-success-soft px-2 text-success-ink",
        "destructive-soft": "rounded-xs border-transparent bg-destructive-soft px-2 text-destructive-ink",
        muted: "rounded-xs border-transparent bg-chip px-2 text-muted-foreground",
        tab: "rounded-none border-foreground border-b-0 bg-card px-3 py-1.5 text-foreground",
        notch: "rounded-none border-pop-black bg-success text-pop-black shadow-[2px_2px_0_#0d0d0d]",
        mono: "rounded-none border-transparent bg-transparent px-0 font-mono tracking-[0.12em] text-destructive-ink"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

function Badge({ className, variant = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
