import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * NeoPOP button. Solid variants carry the 3D "plunk" edge and sink when
 * pressed; quiet variants (outline, ghost, link) stay flat so a screen never
 * has more than one or two raised keys competing for attention.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-bold whitespace-nowrap select-none outline-hidden disabled:pointer-events-none disabled:opacity-45 aria-invalid:ring-2 aria-invalid:ring-destructive focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[5px] focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "plunk plunk-press edge-primary bg-primary text-primary-foreground",
        brand: "plunk plunk-press edge-brand bg-brand text-brand-foreground",
        secondary:
          "plunk plunk-press plunk-bordered edge-secondary border border-border-strong bg-secondary text-secondary-foreground",
        destructive: "plunk plunk-press edge-destructive bg-destructive text-destructive-foreground",
        outline:
          "border border-input bg-transparent text-foreground transition-colors hover:border-foreground hover:bg-accent active:bg-surface-2",
        ghost:
          "bg-transparent text-foreground transition-colors hover:bg-accent active:bg-surface-2",
        link: "h-auto! px-0! text-foreground underline decoration-2 decoration-brand underline-offset-4 transition-colors hover:text-brand-ink",
      },
      size: {
        default: "h-10 px-5 text-sm has-[>svg]:px-4",
        xs: "h-7 gap-1.5 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3.5 text-[13px] has-[>svg]:px-3",
        lg: "h-12 px-7 text-[15px] has-[>svg]:px-6 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
