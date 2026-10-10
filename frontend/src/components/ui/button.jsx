import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Buttons in CRED's 2026 language (values from the app's own templates):
 *  - default: the black block CTA, 8px corners, semibold label.
 *  - brand:   the raised key — gradient face, 1px rim, hard 3px edge that
 *             collapses when pressed (Sonic aqua instead of CRED gold).
 *  - gold:    the same raised key in CRED's reward gold.
 *  - pill:    the dark pill CTA — graphite gradient, white rim, soft shadows.
 *  - chip:    the white → ice pill used for shortcuts and filters.
 *  - secondary: the grey trail CTA (50% #ECEEF1 with a cool hairline).
 *  - destructive: red label on the grey CTA, as CRED does it.
 *  - outline / ghost / link: quiet actions.
 *  - elevated: NeoPOP's 3D key — square face with lighter right and darker
 *             bottom edges (black on light pages, white on dark ones). It lifts
 *             on hover, sinks into its edge when pressed, turns grey disabled.
 *  - pay:     the same 3D key in CRED's lime pay green ("Pay ₹1", "Pay via credit card").
 * Disabled buttons fade to 50%; a busy one (aria-busy) keeps full colour.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap select-none outline-hidden transition-[background-color,color,border-color,box-shadow,filter,transform] duration-150 disabled:pointer-events-none disabled:not-aria-busy:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary/88 active:scale-[0.98]",
        brand:
          "raised rounded-xs font-bold text-brand-foreground [--raised-from:#92f2ee] [--raised-to:#2ce6e0] [--raised-rim:#c2f8f6]",
        gold: "raised rounded-xs font-bold text-raised-ink",
        pill: "surface-pop rounded-full font-semibold hover:brightness-110 active:scale-[0.98]",
        chip: "surface-pill rounded-full font-semibold text-foreground shadow-[0_2px_0_var(--pill-border)] hover:brightness-[0.98] active:translate-y-px active:shadow-[0_1px_0_var(--pill-border)]",
        secondary:
          "rounded-md border-[0.8px] border-border-cool bg-chip font-bold text-secondary-foreground hover:bg-accent active:scale-[0.98]",
        destructive:
          "rounded-md bg-secondary font-semibold text-destructive-ink hover:bg-destructive-soft active:scale-[0.98]",
        outline:
          "rounded-md border border-foreground/80 bg-transparent font-semibold text-foreground hover:bg-accent active:scale-[0.98]",
        ghost: "rounded-md bg-transparent font-semibold text-foreground hover:bg-accent active:bg-surface-2",
        link: "h-auto! px-0! font-semibold text-foreground underline decoration-[1.5px] underline-offset-[5px] hover:decoration-brand",
        elevated:
          "plunk plunk-press plunk-disable edge-primary mr-[3px] mb-[3px] rounded-none disabled:not-aria-busy:opacity-100 bg-primary font-bold text-primary-foreground",
        pay: "plunk plunk-press plunk-disable mr-[3px] mb-[3px] rounded-none disabled:not-aria-busy:opacity-100 bg-[#8fd14f] font-bold text-pop-black [--edge-r:#73b236] [--edge-b:#548a22] hover:bg-[#99d85c]",
      },
      size: {
        default: "h-10 px-5 text-[13px] tracking-[0.015em] has-[>svg]:px-4",
        xs: "h-7 gap-1.5 px-2.5 text-[11px] [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-3 text-[11px] has-[>svg]:px-2.5",
        lg: "h-[52px] px-6 text-sm tracking-[0.015em] [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-[52px] [&_svg:not([class*='size-'])]:size-5",
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
