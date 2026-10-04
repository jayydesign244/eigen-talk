import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";
import { SearchIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
function Command({
  className,
  ...props
}) {
  return <CommandPrimitive
    data-slot="command"
    className={cn(
      "flex h-full w-full flex-col overflow-hidden bg-popover text-popover-foreground",
      className
    )}
    {...props}
  />;
}
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}) {
  return <Dialog {...props}><DialogContent
    className={cn("overflow-hidden p-0 sm:max-w-xl", className)}
    showCloseButton={showCloseButton}
  ><DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader><Command className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:py-2.5">{children}</Command></DialogContent></Dialog>;
}
function CommandInput({
  className,
  ...props
}) {
  return <div
    data-slot="command-input-wrapper"
    className="flex h-12 items-center gap-2.5 border-b border-border px-3.5"
  ><SearchIcon className="size-4 shrink-0 text-muted-foreground" /><CommandPrimitive.Input
    data-slot="command-input"
    className={cn(
      "flex h-11 w-full bg-transparent py-3 text-sm font-medium outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  /></div>;
}
function CommandList({
  className,
  ...props
}) {
  return <CommandPrimitive.List
    data-slot="command-list"
    className={cn(
      "max-h-[320px] scroll-py-1 overflow-x-hidden overflow-y-auto",
      className
    )}
    {...props}
  />;
}
function CommandEmpty({
  ...props
}) {
  return <CommandPrimitive.Empty
    data-slot="command-empty"
    className="py-8 text-center text-[13px] text-muted-foreground"
    {...props}
  />;
}
function CommandGroup({
  className,
  ...props
}) {
  return <CommandPrimitive.Group
    data-slot="command-group"
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-extrabold [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase",
      className
    )}
    {...props}
  />;
}
function CommandSeparator({
  className,
  ...props
}) {
  return <CommandPrimitive.Separator
    data-slot="command-separator"
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />;
}
function CommandItem({
  className,
  ...props
}) {
  return <CommandPrimitive.Item
    data-slot="command-item"
    className={cn(
      "relative flex cursor-default items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium outline-hidden select-none transition-colors duration-75 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[selected=true]:bg-foreground data-[selected=true]:text-background [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[selected=true]:[&_svg:not([class*='text-'])]:text-background",
      className
    )}
    {...props}
  />;
}
function CommandShortcut({
  className,
  ...props
}) {
  return <span
    data-slot="command-shortcut"
    className={cn(
      "ml-auto font-mono text-[11px] text-muted-foreground in-data-[selected=true]:text-background/70",
      className
    )}
    {...props}
  />;
}
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
};
