import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Status is carried by a solid 4px bar + icon + text, never colour alone. */
const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-1 border border-l-4 bg-card px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "border-border border-l-foreground [&>svg]:text-foreground",
        info: "border-border border-l-info bg-info-soft/40 [&>svg]:text-info-ink",
        success: "border-border border-l-success bg-success-soft/40 [&>svg]:text-success-ink",
        warning: "border-border border-l-warning bg-warning-soft/40 [&>svg]:text-warning-ink",
        destructive:
          "border-border border-l-destructive bg-destructive-soft/40 [&>svg]:text-destructive-ink *:data-[slot=alert-title]:text-destructive-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Alert({ className, variant, ...props }) {
  return (
    <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-bold tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-[13px] text-muted-foreground [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
