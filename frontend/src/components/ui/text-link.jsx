import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Inline text actions as CRED draws them:
 *  - underline: "View balance history", "skip for now" (1px rule, offset).
 *  - dotted:    "know more" under a trust row.
 *  - chevron:   "more >" with a small trailing chevron.
 * `tone="info"` is the blue link ("get your statement", "Check balance").
 */
const textLinkVariants = cva(
  "inline-flex w-fit items-center gap-1 font-semibold outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        underline: "underline decoration-1 underline-offset-[5px] hover:decoration-2",
        dotted: "underline decoration-dotted decoration-1 underline-offset-[5px]",
        chevron: "no-underline hover:underline hover:underline-offset-4",
      },
      tone: {
        default: "text-foreground",
        muted: "text-muted-foreground hover:text-foreground",
        info: "text-info-ink",
        brand: "text-brand-ink",
      },
      size: { default: "text-[13px]", sm: "text-xs", xs: "text-[11px]" },
    },
    defaultVariants: { variant: "underline", tone: "default", size: "default" },
  }
);

function TextLink({ className, variant, tone, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "a";
  return <Comp data-slot="text-link" className={cn(textLinkVariants({ variant, tone, size }), className)} {...props} />;
}

export { TextLink, textLinkVariants };
