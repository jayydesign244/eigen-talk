import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The sticky footer on CRED's commerce screens: a caps meta line
 * ("2 NIGHTS • 1 ROOM"), the price with its strikethrough, and the CTA.
 *  - dark:  black bar, white CTA (hotel detail).
 *  - light: card bar with a hairline top (booking review, calendar).
 * Put a <Ribbon> right above it for the "UNLOCK UP TO 100% CASHBACK" strip.
 */
const actionBarVariants = cva("flex w-full items-center gap-4 px-5 py-4", {
  variants: {
    tone: {
      dark: "dark bg-pop-black text-foreground",
      light: "border-t-[0.8px] border-border bg-card text-card-foreground",
    },
  },
  defaultVariants: { tone: "light" },
});

function ActionBar({ className, tone, ...props }) {
  return <div data-slot="action-bar" data-tone={tone} className={cn(actionBarVariants({ tone }), className)} {...props} />;
}

function ActionBarSummary({ className, meta, children, ...props }) {
  return (
    <div data-slot="action-bar-summary" className={cn("min-w-0 flex-1", className)} {...props}>
      {meta && <p className="text-caps mb-1 flex items-center gap-1 text-[9px] tracking-[0.16em] text-muted-foreground">{meta}</p>}
      {children}
    </div>
  );
}

function ActionBarActions({ className, ...props }) {
  return <div data-slot="action-bar-actions" className={cn("flex shrink-0 items-center gap-2", className)} {...props} />;
}

/**
 * Two CTAs that split the width edge to edge: white "Add to cart" next to
 * black "Buy now →" (product detail). Children are the two buttons.
 */
function SplitActions({ className, ...props }) {
  return (
    <div
      data-slot="split-actions"
      className={cn("grid w-full grid-cols-2 [&>*]:h-14 [&>*]:rounded-none [&>*:first-child]:bg-card [&>*:first-child]:text-foreground [&>*:last-child]:bg-pop-black [&>*:last-child]:text-white", className)}
      {...props}
    />
  );
}

export { ActionBar, ActionBarSummary, ActionBarActions, SplitActions, actionBarVariants };
