import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Small pill controls and value chips from CRED:
 *  - outline: hairline pill ("@okaxis", filter themes, "PAYING FOR: HOUSE RENT").
 *  - success: green outlined quick-amount chips ("₹500").
 *  - value:   a dark pill holding a number with a leading icon (coin balance "2,87,222").
 *  - soft:    grey pill (date chips "03 APR – 05 APR").
 *  - action:  a pill with a circular icon and a two-line label ("check balance").
 * Selectable chips take `aria-pressed` or `data-state="on"` and fill in.
 */
const chipVariants = cva(
  "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap font-semibold outline-hidden transition-colors select-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        outline:
          "rounded-full border-[0.8px] border-border-strong bg-transparent text-foreground hover:bg-accent aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background",
        success:
          "rounded-xs border border-success/70 bg-transparent text-success-ink hover:bg-success-soft aria-pressed:bg-success-soft aria-pressed:border-success-ink",
        value: "rounded-full border-[0.8px] border-white/10 bg-pop-black/90 text-white tabular",
        soft: "rounded-xs bg-chip text-foreground",
        action:
          "rounded-full border-[0.8px] border-border-strong bg-card pr-4 pl-1.5 text-left text-[11px] leading-tight text-foreground hover:bg-accent [&_[data-slot=chip-icon]]:size-7",
      },
      size: {
        default: "h-8 px-3 text-xs",
        sm: "h-6 px-2.5 text-[11px]",
        lg: "h-10 px-4 text-[13px]",
      },
    },
    compoundVariants: [{ variant: "action", size: "default", className: "h-11" }],
    defaultVariants: { variant: "outline", size: "default" },
  }
);

function Chip({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="chip"
      data-variant={variant}
      type={asChild ? undefined : props.type ?? "button"}
      className={cn(chipVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** The circular icon well at the start of an action chip, or a coin/avatar in a value chip. */
function ChipIcon({ className, ...props }) {
  return (
    <span
      data-slot="chip-icon"
      className={cn("flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-foreground [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    />
  );
}

export { Chip, ChipIcon, chipVariants };
