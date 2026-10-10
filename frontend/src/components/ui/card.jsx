import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card surfaces (CRED 2026: 16px corners, 0.8px hairline at 10% ink):
 *  - flat: the hairline card (default, for dense layouts)
 *  - elevated: the same card lifted on a soft shadow
 *  - interactive: elevated, lifts further on hover, settles when pressed
 */
const cardVariants = cva(
  "flex flex-col gap-5 rounded-2xl border-[0.8px] bg-card py-5 text-card-foreground",
  {
    variants: {
      variant: {
        flat: "border-border",
        elevated: "border-border shadow-soft",
        interactive:
          "cursor-pointer border-border shadow-soft transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-float active:translate-y-0 active:scale-[0.99]",
        ghost: "border-transparent bg-transparent",
      },
    },
    defaultVariants: { variant: "flat" },
  }
);

function Card({ className, variant = "flat", ...props }) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-5",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-base leading-snug font-bold tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-[13px] leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn("px-5", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-3 px-5 [.border-t]:pt-5", className)}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
