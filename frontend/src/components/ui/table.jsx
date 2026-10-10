import { cn } from "@/lib/utils";
function Table({ className, ...props }) {
  return <div
    data-slot="table-container"
    className="relative w-full overflow-x-auto rounded-2xl border-[0.8px] border-border bg-card"
  ><table
    data-slot="table"
    className={cn("w-full caption-bottom text-[13px]", className)}
    {...props}
  /></div>;
}
function TableHeader({ className, ...props }) {
  return <thead
    data-slot="table-header"
    className={cn("[&_tr]:border-b [&_tr]:border-border [&_tr]:hover:bg-transparent", className)}
    {...props}
  />;
}
function TableBody({ className, ...props }) {
  return <tbody
    data-slot="table-body"
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />;
}
function TableFooter({ className, ...props }) {
  return <tfoot
    data-slot="table-footer"
    className={cn(
      "border-t border-border bg-surface-2 font-semibold [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />;
}
function TableRow({ className, ...props }) {
  return <tr
    data-slot="table-row"
    className={cn(
      "border-b border-border transition-colors hover:bg-accent has-aria-expanded:bg-accent data-[state=selected]:bg-brand-soft data-[state=selected]:shadow-[inset_3px_0_0_0_var(--brand)]",
      className
    )}
    {...props}
  />;
}
function TableHead({ className, ...props }) {
  return <th
    data-slot="table-head"
    className={cn(
      "h-10 px-4 text-left align-middle text-[10px] font-bold tracking-[0.12em] whitespace-nowrap text-label uppercase [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />;
}
function TableCell({ className, ...props }) {
  return <td
    data-slot="table-cell"
    className={cn(
      "px-4 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />;
}
function TableCaption({
  className,
  ...props
}) {
  return <caption
    data-slot="table-caption"
    className={cn("mt-4 text-[13px] text-muted-foreground", className)}
    {...props}
  />;
}
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
};
