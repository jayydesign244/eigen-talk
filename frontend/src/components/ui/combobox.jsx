import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from "@/components/ui/input-group";
const Combobox = ComboboxPrimitive.Root;
function ComboboxValue({ ...props }) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}
function ComboboxTrigger({
  className,
  children,
  ...props
}) {
  return <ComboboxPrimitive.Trigger
    data-slot="combobox-trigger"
    className={cn("[&_svg:not([class*='size-'])]:size-4", className)}
    {...props}
  >{children}<ChevronDownIcon
    data-slot="combobox-trigger-icon"
    className="pointer-events-none size-4 text-muted-foreground"
  /></ComboboxPrimitive.Trigger>;
}
function ComboboxClear({ className, ...props }) {
  return <ComboboxPrimitive.Clear
    data-slot="combobox-clear"
    render={<InputGroupButton variant="ghost" size="icon-xs" />}
    className={cn(className)}
    {...props}
  ><XIcon className="pointer-events-none" /></ComboboxPrimitive.Clear>;
}
function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}) {
  return <InputGroup className={cn("w-auto", className)}><ComboboxPrimitive.Input
    render={<InputGroupInput disabled={disabled} />}
    {...props}
  /><InputGroupAddon align="inline-end">{showTrigger && <InputGroupButton
    size="icon-xs"
    variant="ghost"
    asChild
    data-slot="input-group-button"
    className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
    disabled={disabled}
  ><ComboboxTrigger /></InputGroupButton>}{showClear && <ComboboxClear disabled={disabled} />}</InputGroupAddon>{children}</InputGroup>;
}
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}) {
  return <ComboboxPrimitive.Portal><ComboboxPrimitive.Positioner
    side={side}
    sideOffset={sideOffset}
    align={align}
    alignOffset={alignOffset}
    anchor={anchor}
    className="isolate z-50"
  ><ComboboxPrimitive.Popup
    data-slot="combobox-content"
    data-chips={!!anchor}
    className={cn(
      "group/combobox-content relative max-h-96 w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden border bg-popover text-popover-foreground pop-float duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-9 *:data-[slot=input-group]:bg-muted data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.97] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.97]",
      className
    )}
    {...props}
  /></ComboboxPrimitive.Positioner></ComboboxPrimitive.Portal>;
}
function ComboboxList({ className, ...props }) {
  return <ComboboxPrimitive.List
    data-slot="combobox-list"
    className={cn(
      "max-h-[min(calc(--spacing(96)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto p-1 data-empty:p-0",
      className
    )}
    {...props}
  />;
}
function ComboboxItem({
  className,
  children,
  ...props
}) {
  return <ComboboxPrimitive.Item
    data-slot="combobox-item"
    className={cn(
      "relative flex w-full cursor-default items-center gap-2.5 py-2 pr-8 pl-2.5 text-[13px] font-medium outline-hidden select-none transition-colors duration-75 data-highlighted:bg-foreground data-highlighted:text-background data-[disabled]:pointer-events-none data-[disabled]:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      className
    )}
    {...props}
  >{children}<ComboboxPrimitive.ItemIndicator
    data-slot="combobox-item-indicator"
    render={<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />}
  ><CheckIcon className="pointer-events-none size-4 pointer-coarse:size-5" strokeWidth={3} /></ComboboxPrimitive.ItemIndicator></ComboboxPrimitive.Item>;
}
function ComboboxGroup({ className, ...props }) {
  return <ComboboxPrimitive.Group
    data-slot="combobox-group"
    className={cn(className)}
    {...props}
  />;
}
function ComboboxLabel({
  className,
  ...props
}) {
  return <ComboboxPrimitive.GroupLabel
    data-slot="combobox-label"
    className={cn(
      "px-2.5 pt-2.5 pb-1.5 text-[10px] font-extrabold tracking-[0.16em] text-muted-foreground uppercase",
      className
    )}
    {...props}
  />;
}
function ComboboxCollection({ ...props }) {
  return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}
function ComboboxEmpty({ className, ...props }) {
  return <ComboboxPrimitive.Empty
    data-slot="combobox-empty"
    className={cn(
      "hidden w-full justify-center py-6 text-center text-[13px] text-muted-foreground group-data-empty/combobox-content:flex",
      className
    )}
    {...props}
  />;
}
function ComboboxSeparator({
  className,
  ...props
}) {
  return <ComboboxPrimitive.Separator
    data-slot="combobox-separator"
    className={cn("-mx-1 my-1 h-px bg-border", className)}
    {...props}
  />;
}
function ComboboxChips({
  className,
  ...props
}) {
  return <ComboboxPrimitive.Chips
    data-slot="combobox-chips"
    className={cn(
      "flex min-h-10 flex-wrap items-center gap-1.5 border border-input bg-card bg-clip-padding px-2.5 py-1.5 text-sm transition-[border-color,box-shadow] hover:border-muted-foreground/60 focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_0_var(--foreground)] has-aria-invalid:border-destructive has-data-[slot=combobox-chip]:px-1.5",
      className
    )}
    {...props}
  />;
}
function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}) {
  return <ComboboxPrimitive.Chip
    data-slot="combobox-chip"
    className={cn(
      "flex h-6 w-fit animate-pop items-center justify-center gap-1 border border-border bg-muted px-1.5 text-xs font-bold whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
      className
    )}
    {...props}
  >{children}{showRemove && <ComboboxPrimitive.ChipRemove
    render={<Button variant="ghost" size="icon-xs" />}
    className="-ml-1 opacity-50 hover:opacity-100"
    data-slot="combobox-chip-remove"
  ><XIcon className="pointer-events-none" /></ComboboxPrimitive.ChipRemove>}</ComboboxPrimitive.Chip>;
}
function ComboboxChipsInput({
  className,
  children,
  ...props
}) {
  return <ComboboxPrimitive.Input
    data-slot="combobox-chip-input"
    className={cn("min-w-16 flex-1 outline-hidden", className)}
    {...props}
  />;
}
function useComboboxAnchor() {
  return React.useRef(null);
}
export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor
};
