import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The screen title CRED uses everywhere: an optional caps eyebrow
 * ("MEMBERSHIP APPLICATION"), a lowercase serif headline and a muted line.
 *  - default: on the page.
 *  - band:    a dark header block over a light form ("tell us your name").
 */
const pageTitleVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "gap-2",
      band: "dark gap-3 bg-background px-5 pt-16 pb-8 text-foreground",
    },
    size: {
      default: "[&_[data-slot=page-title-heading]]:text-[28px] [&_[data-slot=page-title-heading]]:leading-[1.25]",
      lg: "[&_[data-slot=page-title-heading]]:text-4xl [&_[data-slot=page-title-heading]]:leading-[1.2]",
      sm: "[&_[data-slot=page-title-heading]]:text-[22px] [&_[data-slot=page-title-heading]]:leading-[1.3]",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});

function PageTitle({ className, variant, size, eyebrow, title, description, action, children, ...props }) {
  return (
    <header data-slot="page-title" data-variant={variant} className={cn(pageTitleVariants({ variant, size }), className)} {...props}>
      {eyebrow && <p className="text-caps text-[10px] tracking-[0.2em] text-muted-foreground">{eyebrow}</p>}
      <div className="flex items-start justify-between gap-4">
        <h1 data-slot="page-title-heading" className="font-display text-balance">{title}</h1>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
      {description && <p className="max-w-prose text-sm font-medium tracking-[0.02em] text-muted-foreground">{description}</p>}
      {children}
    </header>
  );
}

export { PageTitle, pageTitleVariants };
