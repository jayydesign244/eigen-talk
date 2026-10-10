import { cn } from "@/lib/utils";
import { floatingSurface, menuItem, menuDestructiveItem, menuLabel, menuSeparator, menuShortcut } from "@/components/ui/styles";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { ContextMenu as ContextMenuPrimitive } from "radix-ui";
function ContextMenu({
  ...props
}) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}
function ContextMenuTrigger({
  ...props
}) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />;
}
function ContextMenuGroup({
  ...props
}) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}
function ContextMenuPortal({
  ...props
}) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}
function ContextMenuSub({
  ...props
}) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}
function ContextMenuRadioGroup({
  ...props
}) {
  return <ContextMenuPrimitive.RadioGroup
    data-slot="context-menu-radio-group"
    {...props}
  />;
}
function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return <ContextMenuPrimitive.SubTrigger
    data-slot="context-menu-sub-trigger"
    data-inset={inset}
    className={cn(
      menuItem, "data-[state=open]:bg-accent data-[state=open]:text-foreground",
      className
    )}
    {...props}
  >{children}<ChevronRightIcon className="ml-auto" /></ContextMenuPrimitive.SubTrigger>;
}
function ContextMenuSubContent({
  className,
  ...props
}) {
  return <ContextMenuPrimitive.SubContent
    data-slot="context-menu-sub-content"
    className={cn(
      floatingSurface, "min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden p-1",
      className
    )}
    {...props}
  />;
}
function ContextMenuContent({
  className,
  ...props
}) {
  return <ContextMenuPrimitive.Portal><ContextMenuPrimitive.Content
    data-slot="context-menu-content"
    className={cn(
      floatingSurface, "max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto p-1",
      className
    )}
    {...props}
  /></ContextMenuPrimitive.Portal>;
}
function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return <ContextMenuPrimitive.Item
    data-slot="context-menu-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      menuItem, menuDestructiveItem,
      className
    )}
    {...props}
  />;
}
function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return <ContextMenuPrimitive.CheckboxItem
    data-slot="context-menu-checkbox-item"
    className={cn(
      menuItem, "pl-8",
      className
    )}
    checked={checked}
    {...props}
  ><span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center"><ContextMenuPrimitive.ItemIndicator><CheckIcon className="size-3.5 text-current!" strokeWidth={2.5} /></ContextMenuPrimitive.ItemIndicator></span>{children}</ContextMenuPrimitive.CheckboxItem>;
}
function ContextMenuRadioItem({
  className,
  children,
  ...props
}) {
  return <ContextMenuPrimitive.RadioItem
    data-slot="context-menu-radio-item"
    className={cn(
      menuItem, "pl-8",
      className
    )}
    {...props}
  ><span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center"><ContextMenuPrimitive.ItemIndicator><span className="block size-1.5 rounded-full bg-current" /></ContextMenuPrimitive.ItemIndicator></span>{children}</ContextMenuPrimitive.RadioItem>;
}
function ContextMenuLabel({
  className,
  inset,
  ...props
}) {
  return <ContextMenuPrimitive.Label
    data-slot="context-menu-label"
    data-inset={inset}
    className={cn(
      menuLabel,
      className
    )}
    {...props}
  />;
}
function ContextMenuSeparator({
  className,
  ...props
}) {
  return <ContextMenuPrimitive.Separator
    data-slot="context-menu-separator"
    className={cn(menuSeparator, className)}
    {...props}
  />;
}
function ContextMenuShortcut({
  className,
  ...props
}) {
  return <span
    data-slot="context-menu-shortcut"
    className={cn(
      menuShortcut,
      className
    )}
    {...props}
  />;
}
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
};
