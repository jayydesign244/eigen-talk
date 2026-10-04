import { cn } from "@/lib/utils";
import { overlay } from "@/components/ui/styles";
import { Drawer as DrawerPrimitive } from "vaul";
function Drawer({
  ...props
}) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}
function DrawerTrigger({
  ...props
}) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}
function DrawerPortal({
  ...props
}) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}
function DrawerClose({
  ...props
}) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}
function DrawerOverlay({
  className,
  ...props
}) {
  return <DrawerPrimitive.Overlay
    data-slot="drawer-overlay"
    className={cn(
      overlay,
      className
    )}
    {...props}
  />;
}
function DrawerContent({
  className,
  children,
  ...props
}) {
  return <DrawerPortal data-slot="drawer-portal"><DrawerOverlay /><DrawerPrimitive.Content
    data-slot="drawer-content"
    className={cn(
      "group/drawer-content fixed z-50 flex h-auto flex-col bg-card",
      "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:border-b data-[vaul-drawer-direction=top]:border-float-border",
      "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:border-t-2 data-[vaul-drawer-direction=bottom]:border-float-border",
      "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:border-float-border data-[vaul-drawer-direction=right]:sm:max-w-sm",
      "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:border-float-border data-[vaul-drawer-direction=left]:sm:max-w-sm",
      className
    )}
    {...props}
  ><div className="mx-auto mt-3 hidden h-1 w-12 shrink-0 bg-muted-foreground/50 group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />{children}</DrawerPrimitive.Content></DrawerPortal>;
}
function DrawerHeader({ className, ...props }) {
  return <div
    data-slot="drawer-header"
    className={cn(
      "flex flex-col gap-1 p-5 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
      className
    )}
    {...props}
  />;
}
function DrawerFooter({ className, ...props }) {
  return <div
    data-slot="drawer-footer"
    className={cn("mt-auto flex flex-col gap-2.5 p-5", className)}
    {...props}
  />;
}
function DrawerTitle({
  className,
  ...props
}) {
  return <DrawerPrimitive.Title
    data-slot="drawer-title"
    className={cn("text-lg font-bold tracking-tight text-foreground", className)}
    {...props}
  />;
}
function DrawerDescription({
  className,
  ...props
}) {
  return <DrawerPrimitive.Description
    data-slot="drawer-description"
    className={cn("text-[13px] text-muted-foreground", className)}
    {...props}
  />;
}
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger
};
