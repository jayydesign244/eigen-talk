import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";
function BubbleGroup({ className, ...props }) {
  return <div
    data-slot="bubble-group"
    className={cn("flex min-w-0 flex-col gap-2", className)}
    {...props}
  />;
}
const bubbleVariants = cva(
  "group/bubble relative flex w-fit max-w-[80%] min-w-0 flex-col gap-1 group-data-[align=end]/message:self-end data-[align=end]:self-end data-[variant=ghost]:max-w-full",
  {
    variants: {
      variant: {
        default: "*:data-[slot=bubble-content]:bg-foreground *:data-[slot=bubble-content]:text-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-foreground/85",
        secondary: "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-card *:data-[slot=bubble-content]:text-card-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:bg-accent",
        muted: "*:data-[slot=bubble-content]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklch,var(--muted),var(--foreground)_5%)]",
        tinted: "*:data-[slot=bubble-content]:border-brand/40 *:data-[slot=bubble-content]:bg-brand-soft *:data-[slot=bubble-content]:text-foreground [&>[data-slot=bubble-content]:is(button,a):hover]:border-brand",
        outline: "*:data-[slot=bubble-content]:border-border *:data-[slot=bubble-content]:bg-background [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground ",
        ghost: "border-none *:data-[slot=bubble-content]:rounded-none *:data-[slot=bubble-content]:bg-transparent *:data-[slot=bubble-content]:p-0 [&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted [&>[data-slot=bubble-content]:is(button,a):hover]:text-foreground dark:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-muted/50",
        destructive: "*:data-[slot=bubble-content]:border-destructive/40 *:data-[slot=bubble-content]:bg-destructive-soft *:data-[slot=bubble-content]:text-destructive-ink"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Bubble({
  variant = "default",
  align = "start",
  className,
  ...props
}) {
  return <div
    data-slot="bubble"
    data-variant={variant}
    data-align={align}
    className={cn(bubbleVariants({ variant }), className)}
    {...props}
  />;
}
function BubbleContent({
  asChild = false,
  className,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "div";
  return <Comp
    data-slot="bubble-content"
    className={cn(
      "w-fit max-w-full min-w-0 overflow-hidden rounded-2xl rounded-bl-md border-[0.8px] border-transparent px-3.5 py-2.5 group-data-[align=end]/bubble:rounded-bl-2xl group-data-[align=end]/bubble:rounded-br-md group-data-[align=end]/message:rounded-bl-2xl group-data-[align=end]/message:rounded-br-md text-sm leading-relaxed wrap-break-word group-data-[align=end]/bubble:self-end [button]:text-left [button,a]:transition-colors [button,a]:outline-hidden [button,a]:focus-visible:border-ring [button,a]:focus-visible:ring-3 [button,a]:focus-visible:ring-ring/50",
      className
    )}
    {...props}
  />;
}
const bubbleReactionsVariants = cva(
  "absolute z-10 flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border-[0.8px] border-border bg-popover px-2 py-0.5 text-sm shadow-soft has-[button]:p-0",
  {
    variants: {
      side: {
        top: "top-0 -translate-y-3/4",
        bottom: "bottom-0 translate-y-3/4"
      },
      align: {
        start: "left-3",
        end: "right-3"
      }
    },
    defaultVariants: {
      side: "bottom",
      align: "end"
    }
  }
);
function BubbleReactions({
  side = "bottom",
  align = "end",
  className,
  ...props
}) {
  return <div
    data-slot="bubble-reactions"
    data-align={align}
    data-side={side}
    className={cn(bubbleReactionsVariants({ side, align }), className)}
    {...props}
  />;
}
export {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions
};
