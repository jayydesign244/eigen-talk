import { cn } from "@/lib/utils";
import { overlay } from "@/components/ui/styles";
import { XIcon } from "lucide-react";
import { Dialog as SheetPrimitive } from "radix-ui";
function Sheet({ ...props }) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}
function SheetTrigger({
  ...props
}) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}
function SheetClose({
  ...props
}) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}
function SheetPortal({
  ...props
}) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}
function SheetOverlay({
  className,
  ...props
}) {
  return <SheetPrimitive.Overlay
    data-slot="sheet-overlay"
    className={cn(
      overlay,
      className
    )}
    {...props}
  />;
}
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}) {
  return <SheetPortal><SheetOverlay /><SheetPrimitive.Content
    data-slot="sheet-content"
    className={cn(
      "fixed z-50 flex flex-col gap-4 bg-card transition data-[state=closed]:animate-out data-[state=closed]:duration-[350ms] data-[state=closed]:ease-[var(--ease-accelerate)] data-[state=open]:animate-in data-[state=open]:duration-[350ms] data-[state=open]:ease-[var(--ease-decelerate)]",
      side === "right" && "inset-y-0 right-0 h-full w-3/4 rounded-l-3xl border-l border-float-border shadow-float data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      side === "left" && "inset-y-0 left-0 h-full w-3/4 rounded-r-3xl border-r border-float-border shadow-float data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
      side === "top" && "inset-x-0 top-0 h-auto rounded-b-3xl border-b border-float-border shadow-float data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
      side === "bottom" && "inset-x-0 bottom-0 h-auto rounded-t-3xl border-t border-sheet-edge shadow-float data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
      className
    )}
    {...props}
  >{children}{showCloseButton && <SheetPrimitive.Close className="absolute top-3.5 right-3.5 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"><XIcon className="size-4" /><span className="sr-only">Close</span></SheetPrimitive.Close>}</SheetPrimitive.Content></SheetPortal>;
}
function SheetHeader({ className, ...props }) {
  return <div
    data-slot="sheet-header"
    className={cn("flex flex-col gap-1 border-b border-border p-5 pr-12", className)}
    {...props}
  />;
}
function SheetFooter({ className, ...props }) {
  return <div
    data-slot="sheet-footer"
    className={cn("mt-auto flex flex-col gap-2.5 border-t border-border p-5", className)}
    {...props}
  />;
}
function SheetTitle({
  className,
  ...props
}) {
  return <SheetPrimitive.Title
    data-slot="sheet-title"
    className={cn("text-lg font-bold tracking-tight text-foreground", className)}
    {...props}
  />;
}
function SheetDescription({
  className,
  ...props
}) {
  return <SheetPrimitive.Description
    data-slot="sheet-description"
    className={cn("text-[13px] text-muted-foreground", className)}
    {...props}
  />;
}
export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
};
