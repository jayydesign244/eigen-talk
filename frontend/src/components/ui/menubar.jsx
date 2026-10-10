import { cn } from "@/lib/utils";
import { floatingSurface, menuItem, menuDestructiveItem, menuLabel, menuSeparator, menuShortcut } from "@/components/ui/styles";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { Menubar as MenubarPrimitive } from "radix-ui";
function Menubar({
  className,
  ...props
}) {
  return <MenubarPrimitive.Root
    data-slot="menubar"
    className={cn(
      "flex h-10 items-center gap-0.5 rounded-xl border-[0.8px] border-border bg-card p-1",
      className
    )}
    {...props}
  />;
}
function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}
function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}
function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}
function MenubarRadioGroup({
  ...props
}) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />;
}
function MenubarTrigger({
  className,
  ...props
}) {
  return <MenubarPrimitive.Trigger
    data-slot="menubar-trigger"
    className={cn(
      "flex h-8 items-center rounded-md px-2.5 text-[13px] font-semibold outline-hidden select-none transition-colors hover:bg-accent focus:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring data-[state=open]:bg-accent data-[state=open]:text-foreground",
      className
    )}
    {...props}
  />;
}
function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}) {
  return <MenubarPortal><MenubarPrimitive.Content
    data-slot="menubar-content"
    align={align}
    alignOffset={alignOffset}
    sideOffset={sideOffset}
    className={cn(
      floatingSurface, "min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden p-1",
      className
    )}
    {...props}
  /></MenubarPortal>;
}
function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return <MenubarPrimitive.Item
    data-slot="menubar-item"
    data-inset={inset}
    data-variant={variant}
    className={cn(
      menuItem, menuDestructiveItem,
      className
    )}
    {...props}
  />;
}
function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return <MenubarPrimitive.CheckboxItem
    data-slot="menubar-checkbox-item"
    className={cn(
      menuItem, "pl-8",
      className
    )}
    checked={checked}
    {...props}
  ><span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center"><MenubarPrimitive.ItemIndicator><CheckIcon className="size-3.5 text-current!" strokeWidth={2.5} /></MenubarPrimitive.ItemIndicator></span>{children}</MenubarPrimitive.CheckboxItem>;
}
function MenubarRadioItem({
  className,
  children,
  ...props
}) {
  return <MenubarPrimitive.RadioItem
    data-slot="menubar-radio-item"
    className={cn(
      menuItem, "pl-8",
      className
    )}
    {...props}
  ><span className="pointer-events-none absolute left-2.5 flex size-3.5 items-center justify-center"><MenubarPrimitive.ItemIndicator><span className="block size-1.5 rounded-full bg-current" /></MenubarPrimitive.ItemIndicator></span>{children}</MenubarPrimitive.RadioItem>;
}
function MenubarLabel({
  className,
  inset,
  ...props
}) {
  return <MenubarPrimitive.Label
    data-slot="menubar-label"
    data-inset={inset}
    className={cn(
      menuLabel,
      className
    )}
    {...props}
  />;
}
function MenubarSeparator({
  className,
  ...props
}) {
  return <MenubarPrimitive.Separator
    data-slot="menubar-separator"
    className={cn(menuSeparator, className)}
    {...props}
  />;
}
function MenubarShortcut({
  className,
  ...props
}) {
  return <span
    data-slot="menubar-shortcut"
    className={cn(
      menuShortcut,
      className
    )}
    {...props}
  />;
}
function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}
function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return <MenubarPrimitive.SubTrigger
    data-slot="menubar-sub-trigger"
    data-inset={inset}
    className={cn(
      menuItem, "data-[state=open]:bg-accent data-[state=open]:text-foreground",
      className
    )}
    {...props}
  >{children}<ChevronRightIcon className="ml-auto h-4 w-4" /></MenubarPrimitive.SubTrigger>;
}
function MenubarSubContent({
  className,
  ...props
}) {
  return <MenubarPrimitive.SubContent
    data-slot="menubar-sub-content"
    className={cn(
      floatingSurface, "min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden p-1",
      className
    )}
    {...props}
  />;
}
export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
};
