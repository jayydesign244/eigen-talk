import { cn } from "@/lib/utils";
import { floatingSurface } from "@/components/ui/styles";
import { Popover as PopoverPrimitive } from "radix-ui";
function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}
function PopoverTrigger({
  ...props
}) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return <PopoverPrimitive.Portal><PopoverPrimitive.Content
    data-slot="popover-content"
    align={align}
    sideOffset={sideOffset}
    className={cn(
      floatingSurface,
      "w-72 origin-(--radix-popover-content-transform-origin) p-4",
      className
    )}
    {...props}
  /></PopoverPrimitive.Portal>;
}
function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}
function PopoverHeader({ className, ...props }) {
  return <div
    data-slot="popover-header"
    className={cn("flex flex-col gap-1 text-sm", className)}
    {...props}
  />;
}
function PopoverTitle({ className, ...props }) {
  return <div
    data-slot="popover-title"
    className={cn("font-bold", className)}
    {...props}
  />;
}
function PopoverDescription({
  className,
  ...props
}) {
  return <p
    data-slot="popover-description"
    className={cn("text-[13px] text-muted-foreground", className)}
    {...props}
  />;
}
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger
};
