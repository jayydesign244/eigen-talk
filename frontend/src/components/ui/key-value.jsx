import { cn } from "@/lib/utils";

/**
 * Labelled values. CRED uses two layouts:
 *  - <KeyValueGrid> of <KeyValue>: muted label over the value, in 2–3 columns
 *    (vehicle "KEY INFORMATION", registration details, stat rows).
 *    `caps` turns labels into tracked caps ("POWER / TOP SPEED").
 *  - <SummaryTable>: label left, value right, with a separated total
 *    (order summary, price breakup, "this will change your bill amount").
 */
function KeyValueGrid({ className, columns = 2, ...props }) {
  return (
    <dl
      data-slot="key-value-grid"
      className={cn("grid gap-x-6 gap-y-5", className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      {...props}
    />
  );
}

function KeyValue({ className, label, caps, children, ...props }) {
  return (
    <div data-slot="key-value" className={cn("flex min-w-0 flex-col gap-1", className)} {...props}>
      <dt className={cn(caps ? "text-caps text-[9px] tracking-[0.2em] text-muted-foreground" : "text-xs font-medium text-muted-foreground")}>{label}</dt>
      <dd className="truncate text-[15px] font-semibold tracking-[0.01em] tabular">{children}</dd>
    </div>
  );
}

function SummaryTable({ className, ...props }) {
  return <dl data-slot="summary-table" className={cn("flex flex-col border-[0.8px] border-border bg-card", className)} {...props} />;
}

/** `tone="positive"` for discounts and credits, `muted` for pending; `description` adds a small second line. */
function SummaryRow({ className, label, description, tone = "default", children, ...props }) {
  return (
    <div data-slot="summary-row" className={cn("flex items-start justify-between gap-4 px-5 py-2.5 first:pt-4 last:pb-4", className)} {...props}>
      <dt className="min-w-0">
        <span className="block text-xs font-medium text-muted-foreground">{label}</span>
        {description && <span className="mt-0.5 block text-[11px] text-muted-foreground/80">{description}</span>}
      </dt>
      <dd
        className={cn(
          "shrink-0 text-xs font-semibold tabular",
          tone === "positive" && "text-success-ink",
          tone === "negative" && "text-destructive-ink",
          tone === "muted" && "text-muted-foreground"
        )}
      >
        {children}
      </dd>
    </div>
  );
}

function SummaryTotal({ className, label, children, ...props }) {
  return (
    <div data-slot="summary-total" className={cn("flex items-center justify-between gap-4 border-t-[0.8px] border-border px-5 py-4", className)} {...props}>
      <dt className="text-[13px] font-bold">{label}</dt>
      <dd className="text-[13px] font-bold tabular">{children}</dd>
    </div>
  );
}

export { KeyValueGrid, KeyValue, SummaryTable, SummaryRow, SummaryTotal };
