import { cn } from "@/lib/utils";

/** A tiny physical key: square, with a 2px bottom edge like a keycap. */
function Kbd({ className, ...props }) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 border border-input border-b-2 bg-muted px-1 font-mono text-[10px] font-bold text-muted-foreground select-none",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:border-background/30 [[data-slot=tooltip-content]_&]:bg-background/15 [[data-slot=tooltip-content]_&]:text-background",
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }) {
  return <kbd data-slot="kbd-group" className={cn("inline-flex items-center gap-1", className)} {...props} />;
}

export { Kbd, KbdGroup };
