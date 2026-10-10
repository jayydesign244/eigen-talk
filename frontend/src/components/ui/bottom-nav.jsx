import { cn } from "@/lib/utils";

/**
 * CRED's bottom navigation: a dark curved dock with outlined circular icons,
 * caps labels and one larger centre orb (the profile / "YOU" button).
 * Items take `active`, `badge` (red dot) and `tag` (a tiny green "OFFER").
 */
function BottomNav({ className, children, ...props }) {
  return (
    <nav
      data-slot="bottom-nav"
      className={cn(
        "dark relative flex items-end justify-around gap-2 bg-background px-4 pt-5 pb-3 text-foreground",
        "before:absolute before:inset-x-0 before:-top-4 before:h-8 before:rounded-[50%] before:bg-background",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

function BottomNavItem({ className, icon, label, active, badge, tag, ...props }) {
  return (
    <button
      type="button"
      data-slot="bottom-nav-item"
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative z-10 flex w-20 flex-col items-center gap-1.5 text-muted-foreground outline-hidden transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring aria-[current=page]:text-foreground",
        className
      )}
      {...props}
    >
      <span className="relative flex size-11 items-center justify-center rounded-full border border-current [&_svg:not([class*='size-'])]:size-5">
        {icon}
        {badge && <span className="absolute top-0 right-0 size-2 rounded-full bg-destructive ring-2 ring-background" />}
      </span>
      {tag && (
        <span className="absolute top-9 rounded-sm bg-background px-1 text-[7px] font-bold tracking-[0.12em] text-success-ink uppercase">{tag}</span>
      )}
      <span className="text-caps text-[9px] tracking-[0.14em]">{label}</span>
    </button>
  );
}

function BottomNavOrb({ className, children, label, ...props }) {
  return (
    <button
      type="button"
      data-slot="bottom-nav-orb"
      aria-label={label}
      className={cn(
        "relative z-10 -mt-6 flex size-16 items-center justify-center overflow-hidden rounded-full border-2 border-foreground bg-surface-2 shadow-[0_0_0_4px_var(--background),0_0_24px_rgb(255_255_255/0.18)] outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring [&_img]:size-full [&_img]:object-cover",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { BottomNav, BottomNavItem, BottomNavOrb };
