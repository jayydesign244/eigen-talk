import { cn } from "@/lib/utils";
import { floatingSurface, menuItem, menuDestructiveItem, menuLabel, menuSeparator, menuShortcut } from "@/components/ui/styles";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
function DropdownMenu({
  ...props
}) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}
function DropdownMenuPortal({
  ...props
}) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}
function DropdownMenuTrigger({
  ...props
}) {
  return <DropdownMenuPrimitive.Trigger
    data-slot="dropdown-menu-trigger"
    {...props}
  />;
}
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content
    data-slot="dropdown-menu-content"
    sideOffset={sideOffset}
    className={cn(
      floatingSurface, "max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto p-1",
      className
    )}
    {...props}
  /></DropdownMenuPrimitive.Portal>;
}
function DropdownMenuGroup({
  ...props
}) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return <DropdownMenuPrimitive.Item
    data-slot="dropdown-menu-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      menuItem, menuDestructiveItem,
      className
    )}
    {...props}
  />;
}
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return <DropdownMenuPrimitive.CheckboxItem
    data-slot="dropdown-menu-checkbox-item"
    className={cn(
      menuItem, "pl-8",
      className
    )}
    checked={checked}
    {...props}
  ><span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center"><DropdownMenuPrimitive.ItemIndicator><CheckIcon className="size-3.5 text-current!" strokeWidth={2.5} /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.CheckboxItem>;
}
function DropdownMenuRadioGroup({
  ...props
}) {
  return <DropdownMenuPrimitive.RadioGroup
    data-slot="dropdown-menu-radio-group"
    {...props}
  />;
}
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return <DropdownMenuPrimitive.RadioItem
    data-slot="dropdown-menu-radio-item"
    className={cn(
      menuItem, "pl-8",
      className
    )}
    {...props}
  ><span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center"><DropdownMenuPrimitive.ItemIndicator><span className="block size-1.5 rounded-full bg-current" /></DropdownMenuPrimitive.ItemIndicator></span>{children}</DropdownMenuPrimitive.RadioItem>;
}
function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return <DropdownMenuPrimitive.Label
    data-slot="dropdown-menu-label"
    data-inset={inset}
    className={cn(
      menuLabel,
      className
    )}
    {...props}
  />;
}
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return <DropdownMenuPrimitive.Separator
    data-slot="dropdown-menu-separator"
    className={cn(menuSeparator, className)}
    {...props}
  />;
}
function DropdownMenuShortcut({
  className,
  ...props
}) {
  return <span
    data-slot="dropdown-menu-shortcut"
    className={cn(
      menuShortcut,
      className
    )}
    {...props}
  />;
}
function DropdownMenuSub({
  ...props
}) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return <DropdownMenuPrimitive.SubTrigger
    data-slot="dropdown-menu-sub-trigger"
    data-inset={inset}
    className={cn(
      menuItem, "data-[state=open]:bg-accent data-[state=open]:text-foreground",
      className
    )}
    {...props}
  >{children}<ChevronRightIcon className="ml-auto size-4" /></DropdownMenuPrimitive.SubTrigger>;
}
function DropdownMenuSubContent({
  className,
  ...props
}) {
  return <DropdownMenuPrimitive.SubContent
    data-slot="dropdown-menu-sub-content"
    className={cn(
      floatingSurface, "min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden p-1",
      className
    )}
    {...props}
  />;
}
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
};
