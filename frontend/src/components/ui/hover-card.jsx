import { cn } from "@/lib/utils";
import { floatingSurface } from "@/components/ui/styles";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
function HoverCard({
  ...props
}) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}
function HoverCardTrigger({
  ...props
}) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return <HoverCardPrimitive.Portal data-slot="hover-card-portal"><HoverCardPrimitive.Content
    data-slot="hover-card-content"
    align={align}
    sideOffset={sideOffset}
    className={cn(
      floatingSurface,
      "w-64 origin-(--radix-hover-card-content-transform-origin) p-4",
      className
    )}
    {...props}
  /></HoverCardPrimitive.Portal>;
}
export {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
};
