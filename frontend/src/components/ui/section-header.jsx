import { cn } from "@/lib/utils";

/**
 * CRED's section label: bold caps with wide tracking ("YOUR REWARDS & BENEFITS"),
 * optionally with a muted line under it and an action on the right
 * ("+add", "view all", a caps countdown).
 */
function SectionHeader({ className, title, description, action, children, ...props }) {
  return (
    <div data-slot="section-header" className={cn("flex items-end justify-between gap-4", className)} {...props}>
      <div className="min-w-0">
        <p data-slot="section-header-title" className="text-caps tracking-[0.2em] text-label">{title ?? children}</p>
        {description && <p className="mt-1.5 text-xs font-medium tracking-[0.02em] text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0 text-xs font-semibold">{action}</div>}
    </div>
  );
}

/**
 * A label sitting on a hairline: "— WE SUPPORT —", "— ✳ includes —",
 * "— invite friends —". `variant="serif"` sets the label in the display face.
 */
function DividerLabel({ className, variant = "caps", align = "center", icon, children, ...props }) {
  return (
    <div
      data-slot="divider-label"
      role="separator"
      className={cn("flex w-full items-center gap-3 text-muted-foreground", className)}
      {...props}
    >
      {align !== "start" && <span className="h-px flex-1 bg-border" />}
      <span
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5",
          variant === "caps" && "text-caps text-[10px] tracking-[0.2em]",
          variant === "serif" && "font-display text-xl text-foreground",
          variant === "italic" && "font-display text-sm text-foreground italic"
        )}
      >
        {icon}
        {children}
      </span>
      {align !== "end" && <span className="h-px flex-1 bg-border" />}
    </div>
  );
}

export { SectionHeader, DividerLabel };
