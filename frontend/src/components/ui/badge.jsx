import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/** Hard-edged tag in NeoPOP style: extra-bold caps, square corners. */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-[3px] text-[10px] leading-none font-extrabold tracking-[0.12em] uppercase whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground [a&]:hover:bg-primary/85",
        brand: "border-brand bg-brand text-brand-foreground",
        secondary: "border-border bg-muted text-foreground [a&]:hover:bg-accent",
        destructive: "border-destructive/40 bg-destructive-soft text-destructive-ink",
        success: "border-success/40 bg-success-soft text-success-ink",
        warning: "border-warning/40 bg-warning-soft text-warning-ink",
        info: "border-info/40 bg-info-soft text-info-ink",
        outline: "border-border-strong bg-transparent text-foreground [a&]:hover:bg-accent",
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
