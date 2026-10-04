import { cn } from "@/lib/utils";
function Table({ className, ...props }) {
  return <div
    data-slot="table-container"
    className="relative w-full overflow-x-auto"
  ><table
    data-slot="table"
    className={cn("w-full caption-bottom text-[13px]", className)}
    {...props}
  /></div>;
}
function TableHeader({ className, ...props }) {
  return <thead
    data-slot="table-header"
    className={cn("[&_tr]:border-b [&_tr]:border-border-strong/80", className)}
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
      "border-t border-border-strong/80 bg-muted/60 font-bold [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />;
}
function TableRow({ className, ...props }) {
  return <tr
    data-slot="table-row"
    className={cn(
      "border-b border-border transition-colors hover:bg-accent/60 has-aria-expanded:bg-accent/60 data-[state=selected]:bg-brand-soft data-[state=selected]:shadow-[inset_3px_0_0_0_var(--brand)]",
      className
    )}
    {...props}
  />;
}
function TableHead({ className, ...props }) {
  return <th
    data-slot="table-head"
    className={cn(
      "h-10 px-3 text-left align-middle text-[10px] font-extrabold tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  />;
}
function TableCell({ className, ...props }) {
  return <td
    data-slot="table-cell"
    className={cn(
      "px-3 py-2.5 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
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
