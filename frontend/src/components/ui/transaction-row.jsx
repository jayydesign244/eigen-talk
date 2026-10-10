import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A history row as CRED lists them: a square icon tile (or letter avatar),
 * a title, a meta line with an optional status check ("✓ 04:38pm, 15th aug'23"),
 * and the amount on the right with a chevron. `amountTone` colours credits
 * green and failures red; `status="failed"` swaps the check for red text.
 */
function TransactionRow({ className, icon, title, meta, amount, amountTone = "default", status, chevron = true, ...props }) {
  const Comp = props.href ? "a" : props.onClick ? "button" : "div";
  return (
    <Comp
      data-slot="transaction-row"
      type={Comp === "button" ? "button" : undefined}
      className={cn(
        "flex w-full items-center gap-3.5 py-3 text-left outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring [a&]:hover:bg-accent/60 [button&]:hover:bg-accent/60",
        className
      )}
      {...props}
    >
      <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden border-[0.8px] border-border bg-card text-sm font-bold [&_svg:not([class*='size-'])]:size-4.5 [&_img]:size-full [&_img]:object-cover">
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[13px] font-bold tracking-[0.01em]">{title}</span>
        {meta && (
          <span className={cn("flex items-center gap-1.5 text-xs font-medium text-muted-foreground", status === "failed" && "text-destructive-ink")}>
            {status === "success" && (
              <span className="flex size-3.5 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon className="size-2.5" strokeWidth={4} />
              </span>
            )}
            {meta}
          </span>
        )}
      </span>
      {amount != null && (
        <span
          className={cn(
            "shrink-0 text-[13px] font-bold tabular",
            amountTone === "positive" && "text-success-ink",
            amountTone === "negative" && "text-destructive-ink",
            amountTone === "muted" && "text-muted-foreground"
          )}
        >
          {amount}
        </span>
      )}
      {chevron && <ChevronRightIcon className="size-4 shrink-0 text-foreground" />}
    </Comp>
  );
}

/** A caps group label inside a list ("AUG 2023", "BILL PAYMENTS OF 2024"). */
function TransactionGroup({ className, label, children, ...props }) {
  return (
    <div data-slot="transaction-group" className={cn("flex flex-col", className)} {...props}>
      <p className="text-caps pt-4 pb-1 text-[10px] tracking-[0.2em] text-muted-foreground">{label}</p>
      <div className="flex flex-col divide-y divide-border">{children}</div>
    </div>
  );
}

export { TransactionRow, TransactionGroup };
