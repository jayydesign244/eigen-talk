import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Labelled icon buttons in a grid, as on CRED's explore and bills screens:
 *  - circle: dark/raised circular well with a line icon ("pay contacts").
 *  - square: square tile with a coloured 3D-style icon ("electricity", help topics).
 *  - logo:   white circle holding a brand/bank logo ("HDFC", "Myntra").
 * `tag` adds the tiny green "OFFER" chip under the well.
 */
const iconTileWellVariants = cva(
  "relative flex shrink-0 items-center justify-center overflow-hidden transition-colors [&_img]:size-full [&_img]:object-contain",
  {
    variants: {
      shape: {
        circle: "rounded-full bg-surface-2 text-foreground group-hover/icon-tile:bg-accent [&_svg:not([class*='size-'])]:size-6",
        square: "border-[0.8px] border-border bg-card text-foreground group-hover/icon-tile:border-border-strong [&_svg:not([class*='size-'])]:size-7",
        logo: "rounded-full border-[0.8px] border-border bg-pop-white p-2.5 text-pop-black",
        "circle-light": "rounded-full bg-pop-white text-pop-black [&_svg:not([class*='size-'])]:size-6",
      },
      size: { default: "size-16", sm: "size-12", lg: "size-20" },
    },
    defaultVariants: { shape: "circle", size: "default" },
  }
);

function IconTile({ className, shape, size, icon, label, tag, ...props }) {
  const Comp = props.href ? "a" : "button";
  return (
    <Comp
      data-slot="icon-tile"
      type={props.href ? undefined : "button"}
      className={cn(
        "group/icon-tile flex w-full min-w-0 flex-col items-center gap-2 text-center outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      <span className={iconTileWellVariants({ shape, size })}>{icon}</span>
      {tag && (
        <span className="-mt-4 rounded-sm bg-background px-1.5 py-px text-[8px] font-bold tracking-[0.12em] text-success-ink uppercase ring-1 ring-success/40">
          {tag}
        </span>
      )}
      <span className="line-clamp-2 text-[11px] leading-tight font-medium tracking-[0.02em] text-muted-foreground group-hover/icon-tile:text-foreground">{label}</span>
    </Comp>
  );
}

function IconTileGrid({ className, columns = 4, ...props }) {
  return (
    <div
      data-slot="icon-tile-grid"
      className={cn("grid gap-x-3 gap-y-6", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      {...props}
    />
  );
}

export { IconTile, IconTileGrid, iconTileWellVariants };
