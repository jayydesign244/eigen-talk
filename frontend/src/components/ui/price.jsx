import { cn } from "@/lib/utils";

const fmt = (v, currency) =>
  typeof v === "number" ? new Intl.NumberFormat("en-IN", { style: currency ? "currency" : "decimal", currency: currency || undefined, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(v) : v;

/**
 * A price as CRED sets it: the amount, the struck-through original and a green
 * "80% off". Amounts can be numbers (formatted) or strings (shown as given).
 * `layout="stacked"` puts the original under the amount (sticky bars).
 */
function Price({ className, value, original, discount, currency, size = "default", layout = "inline", ...props }) {
  const pct =
    discount === true && typeof value === "number" && typeof original === "number" && original > value
      ? `${Math.round((1 - value / original) * 100)}% off`
      : discount;
  return (
    <span
      data-slot="price"
      className={cn(
        "inline-flex tabular",
        layout === "inline" ? "flex-wrap items-baseline gap-x-1.5" : "flex-col items-start",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "font-bold tracking-tight",
          size === "sm" && "text-[13px]",
          size === "default" && "text-base",
          size === "lg" && "text-2xl",
          size === "xl" && "text-4xl font-extrabold"
        )}
      >
        {fmt(value, currency)}
      </span>
      {original != null && (
        <s className={cn("font-medium text-muted-foreground decoration-1", size === "sm" ? "text-[11px]" : "text-xs")}>
          <span className="sr-only">was </span>
          {fmt(original, currency)}
        </s>
      )}
      {pct && <span className={cn("font-semibold text-success-ink", size === "sm" ? "text-[11px]" : "text-xs")}>{pct}</span>}
    </span>
  );
}

export { Price };
