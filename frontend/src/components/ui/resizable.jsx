import { cn } from "@/lib/utils";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
function ResizablePanelGroup({
  className,
  ...props
}) {
  return <ResizablePrimitive.Group
    data-slot="resizable-panel-group"
    className={cn(
      "flex h-full w-full aria-[orientation=vertical]:flex-col",
      className
    )}
    {...props}
  />;
}
function ResizablePanel({ ...props }) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}
function ResizableHandle({
  withHandle,
  className,
  ...props
}) {
  return <ResizablePrimitive.Separator
    data-slot="resizable-handle"
    className={cn(
      "group/handle relative flex w-px items-center justify-center bg-border transition-colors hover:bg-foreground/40 active:bg-brand after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90",
      className
    )}
    {...props}
  >{withHandle && <div className="z-10 flex h-6 w-3.5 items-center justify-center rounded-full border-[0.8px] border-border-cool bg-card text-muted-foreground shadow-soft transition-colors group-hover/handle:border-foreground/40"><GripVerticalIcon className="size-2.5" /></div>}</ResizablePrimitive.Separator>;
}
export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
};
