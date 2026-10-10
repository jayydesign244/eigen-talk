import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Tags in CRED's 2026 style: the black pill tag ("EARN ₹100"), gradient status
 * chips with a hairline rim (4px corners), and soft tinted tags.
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
        link: "border-transparent px-0 text-foreground underline decoration-brand underline-offset-4"
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
