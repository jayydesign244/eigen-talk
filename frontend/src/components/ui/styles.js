// Shared class recipes so every floating surface and menu row in the system
// looks and moves the same way. Import these instead of re-typing classes.

/** Popover / menu / select container: hard border + 45° extrusion, quick scale-in. */
export const floatingSurface =
  "z-50 border bg-popover text-popover-foreground pop-float outline-hidden " +
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.97] " +
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.97] " +
  "data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 " +
  "data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1";

/** One row inside a menu. Highlight = solid inverted bar, like a selected key. */
export const menuItem =
  "relative flex cursor-default items-center gap-2.5 px-2.5 py-2 text-[13px] font-medium outline-hidden select-none " +
  "transition-colors duration-75 focus:bg-foreground focus:text-background " +
  "data-[highlighted]:bg-foreground data-[highlighted]:text-background " +
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[inset]:pl-8 " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 " +
  "[&_svg:not([class*='text-'])]:text-muted-foreground focus:[&_svg:not([class*='text-'])]:text-background " +
  "data-[highlighted]:[&_svg:not([class*='text-'])]:text-background";

export const menuDestructiveItem =
  "data-[variant=destructive]:text-destructive-ink data-[variant=destructive]:focus:bg-destructive " +
  "data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:data-[highlighted]:bg-destructive " +
  "data-[variant=destructive]:data-[highlighted]:text-destructive-foreground data-[variant=destructive]:*:[svg]:!text-current";

export const menuLabel = "px-2.5 pt-2.5 pb-1.5 text-[10px] font-extrabold tracking-[0.16em] text-muted-foreground uppercase data-[inset]:pl-8";

export const menuSeparator = "-mx-1 my-1 h-px bg-border";

export const menuShortcut = "ml-auto font-mono text-[11px] tracking-normal text-muted-foreground in-data-[highlighted]:text-background/70";

/** Full-screen scrim behind dialogs, sheets and drawers. */
export const overlay =
  "fixed inset-0 z-50 bg-overlay data-[state=open]:animate-in data-[state=open]:fade-in-0 " +
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0";
