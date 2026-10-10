import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Selectable cards built on a radio group (arrow keys move between them):
 *  - row:   outlined row with a radio and a caps label (bureau quiz options).
 *  - card:  white card with media, title, meta and the radio on the right
 *           (choose card, delivery address, pay with).
 *  - tile:  a small outlined tile with a caps label over a value
 *           ("PENDING DUE ₹15,038", "MIN DUE ₹301").
 *  - choice: a full-width row with a trailing arrow; the chosen one gets an
 *           accent rule underneath ("pay total ₹15,038 →").
 */
function OptionCardGroup({ className, ...props }) {
  return <RadioGroupPrimitive.Root data-slot="option-card-group" className={cn("grid gap-2.5", className)} {...props} />;
}

const optionCardVariants = cva(
  "group/option relative flex w-full items-center gap-3.5 text-left outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        row: "min-h-13 border-[0.8px] border-border-strong px-4 py-3 text-xs font-semibold tracking-[0.06em] uppercase hover:bg-accent data-[state=checked]:border-foreground",
        card: "rounded-none border-[0.8px] border-border bg-card p-4 hover:border-border-strong data-[state=checked]:border-foreground",
        tile: "flex-col items-start gap-1.5 border-[0.8px] border-border bg-card px-4 py-3 hover:border-border-strong data-[state=checked]:border-foreground data-[state=checked]:shadow-[inset_0_0_0_0.5px_var(--foreground)]",
        choice: "justify-between border-[0.8px] border-border bg-card px-4 py-4 text-[13px] font-semibold hover:bg-accent data-[state=checked]:shadow-[inset_0_-2px_0_var(--success)]",
      },
    },
    defaultVariants: { variant: "card" },
  }
);

function Radio() {
  return (
    <span
      aria-hidden
      className="flex size-5 shrink-0 items-center justify-center rounded-full border border-foreground transition-colors group-data-[state=checked]/option:bg-foreground"
    >
      <span className="size-[7px] scale-0 rounded-full bg-background transition-transform group-data-[state=checked]/option:scale-100" />
    </span>
  );
}

function OptionCard({ className, variant = "card", media, title, description, meta, radioPosition, children, ...props }) {
  const radioEnd = radioPosition ? radioPosition === "end" : variant === "card";
  return (
    <RadioGroupPrimitive.Item data-slot="option-card" data-variant={variant} className={cn(optionCardVariants({ variant }), className)} {...props}>
      {variant === "row" && <Radio />}
      {variant === "choice" ? (
        <span className="flex w-full items-center justify-between gap-3">{children ?? title}</span>
      ) : variant === "tile" ? (
        <>
          <span className="text-caps text-[9px] tracking-[0.2em] text-muted-foreground">{title}</span>
          <span className="text-base font-bold tabular">{children ?? description}</span>
        </>
      ) : (
        <>
          {media && <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden border-[0.8px] border-border bg-card">{media}</span>}
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className={cn(variant === "card" && "text-[13px] font-bold tracking-[0.01em]")}>{title ?? children}</span>
            {description && <span className="text-xs font-medium text-muted-foreground normal-case tracking-normal">{description}</span>}
          </span>
          {meta && <span className="shrink-0 text-[13px] font-bold tabular">{meta}</span>}
          {variant === "card" && radioEnd && <Radio />}
        </>
      )}
    </RadioGroupPrimitive.Item>
  );
}

export { OptionCardGroup, OptionCard, optionCardVariants };
