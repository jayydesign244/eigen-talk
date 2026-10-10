import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRED's top bar: a long thin back arrow, a title (plain, two-line with a
 * subtitle, or centred caps like "CRED STORE"), and trailing actions
 * (outlined pills, square or circular icon buttons, a coin balance).
 */
function AppBar({ className, children, ...props }) {
  return (
    <div
      data-slot="app-bar"
      className={cn("relative flex h-14 w-full items-center gap-3 px-1", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AppBarBack({ className, label = "Back", ...props }) {
  return (
    <button
      type="button"
      data-slot="app-bar-back"
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-12 shrink-0 items-center justify-start text-foreground outline-hidden transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
        className
      )}
      {...props}
    >
      <ArrowLeftIcon className="h-5 w-8" strokeWidth={1.25} />
    </button>
  );
}

/** `variant="center"` puts a caps title in the middle, as on store and gallery screens. */
function AppBarTitle({ className, variant = "default", subtitle, children, ...props }) {
  if (variant === "center") {
    return (
      <p
        data-slot="app-bar-title"
        className={cn("text-caps pointer-events-none absolute inset-x-16 truncate text-center text-[13px] tracking-[0.16em]", className)}
        {...props}
      >
        {children}
      </p>
    );
  }
  return (
    <div data-slot="app-bar-title" className={cn("min-w-0 flex-1", className)} {...props}>
      <p className="truncate text-sm font-semibold tracking-[0.02em]">{children}</p>
      {subtitle && <p className="truncate text-xs font-medium text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function AppBarActions({ className, ...props }) {
  return <div data-slot="app-bar-actions" className={cn("ml-auto flex shrink-0 items-center gap-2", className)} {...props} />;
}

export { AppBar, AppBarBack, AppBarTitle, AppBarActions };
