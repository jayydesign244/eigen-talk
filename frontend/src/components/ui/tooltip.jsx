import { cn } from "@/lib/utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";
function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return <TooltipPrimitive.Provider
    data-slot="tooltip-provider"
    delayDuration={delayDuration}
    {...props}
  />;
}
function Tooltip({
  ...props
}) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}
function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return <TooltipPrimitive.Portal><TooltipPrimitive.Content
    data-slot="tooltip-content"
    sideOffset={sideOffset}
    className={cn(
      "z-50 flex w-fit origin-(--radix-tooltip-content-transform-origin) animate-in items-center gap-2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-semibold text-balance text-background fade-in-0 zoom-in-[0.96] duration-100 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]",
      className
    )}
    {...props}
  >{children}<TooltipPrimitive.Arrow className="z-50 size-2 translate-y-[calc(-50%_-_1px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" /></TooltipPrimitive.Content></TooltipPrimitive.Portal>;
}
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
};
