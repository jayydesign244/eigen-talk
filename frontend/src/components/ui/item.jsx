import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";
import { Separator } from "@/components/ui/separator";
function ItemGroup({ className, ...props }) {
  return <div
    role="list"
    data-slot="item-group"
    className={cn("group/item-group flex flex-col", className)}
    {...props}
  />;
}
function ItemSeparator({
  className,
  ...props
}) {
  return <Separator
    data-slot="item-separator"
    orientation="horizontal"
    className={cn("my-0", className)}
    {...props}
  />;
}
const itemVariants = cva(
  "group/item flex flex-wrap items-center rounded-xl border-[0.8px] border-transparent text-sm transition-colors duration-100 outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring [a]:transition-colors [a]:hover:bg-accent [button]:hover:bg-accent",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border bg-card",
        muted: "bg-surface-2"
      },
      size: {
        default: "gap-4 p-4",
        sm: "gap-2.5 px-4 py-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Item({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot.Root : "div";
  return <Comp
    data-slot="item"
    data-variant={variant}
    data-size={size}
    className={cn(itemVariants({ variant, size, className }))}
    {...props}
  />;
}
const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:translate-y-0.5 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "surface-tile size-11 rounded-full text-foreground group-data-[size=sm]/item:size-9 [&_svg:not([class*='size-'])]:size-4",
        image: "size-11 overflow-hidden rounded-lg group-data-[size=sm]/item:size-9 [&_img]:size-full [&_img]:object-cover",
        tile: "size-8 border-[0.8px] border-border text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function ItemMedia({
  className,
  variant = "default",
  ...props
}) {
  return <div
    data-slot="item-media"
    data-variant={variant}
    className={cn(itemMediaVariants({ variant, className }))}
    {...props}
  />;
}
function ItemContent({ className, ...props }) {
  return <div
    data-slot="item-content"
    className={cn(
      "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
      className
    )}
    {...props}
  />;
}
function ItemTitle({ className, ...props }) {
  return <div
    data-slot="item-title"
    className={cn(
      "flex w-fit items-center gap-2 text-[13px] leading-snug font-bold tracking-[0.2px]",
      className
    )}
    {...props}
  />;
}
function ItemDescription({ className, ...props }) {
  return <p
    data-slot="item-description"
    className={cn(
      "line-clamp-2 text-xs leading-normal font-medium tracking-[0.4px] text-balance text-muted-foreground",
      "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
      className
    )}
    {...props}
  />;
}
function ItemActions({ className, ...props }) {
  return <div
    data-slot="item-actions"
    className={cn("flex items-center gap-2", className)}
    {...props}
  />;
}
function ItemHeader({ className, ...props }) {
  return <div
    data-slot="item-header"
    className={cn(
      "flex basis-full items-center justify-between gap-2",
      className
    )}
    {...props}
  />;
}
function ItemFooter({ className, ...props }) {
  return <div
    data-slot="item-footer"
    className={cn(
      "flex basis-full items-center justify-between gap-2",
      className
    )}
    {...props}
  />;
}
/** CRED's long thin trailing arrow for action rows ("view & update details  ⟶"). */
function ItemArrow({ className, ...props }) {
  return (
    <svg
      data-slot="item-arrow"
      viewBox="0 0 24 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden
      className={cn("h-3 w-6 shrink-0 transition-transform group-hover/item:translate-x-0.5", className)}
      {...props}
    >
      <path d="M0 6h22M17 1l5 5-5 5" />
    </svg>
  );
}
export {
  Item,
  ItemArrow,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle
};
