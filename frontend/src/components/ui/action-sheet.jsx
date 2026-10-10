import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";

/**
 * CRED's bottom sheets, composed on <Drawer>:
 *
 * <ActionSheet>: a caps title ("ACTIONS ON YOUR CARD") over rows with a square
 *   icon tile, a title, a muted subtitle and a long arrow.
 *   actions = [{ icon, title, description?, onSelect, destructive? }]
 *
 * <ConfirmSheet>: a bold question, a muted explanation, an optional note and two
 *   actions, stacked ("Remove card" / "I changed my mind") or side by side
 *   ("Yes, logout" | "Cancel"). `tone="warning"` adds the red caps eyebrow.
 *
 * Both accept `trigger` (an element) or controlled `open` / `onOpenChange`.
 */
function ActionSheet({ trigger, title, actions = [], open, onOpenChange, children }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="mx-auto max-w-lg">
        {children}
        <DrawerTitle className="text-caps border-b-[0.8px] border-border px-6 pt-5 pb-4 text-left text-[10px] font-bold tracking-[0.2em] text-label">{title}</DrawerTitle>
        <DrawerDescription className="sr-only">{title}</DrawerDescription>
        <ul className="flex flex-col px-6 pb-6">
          {actions.map((a) => (
            <li key={a.title} className="border-b-[0.8px] border-border last:border-0">
              <DrawerClose asChild>
                <button
                  type="button"
                  onClick={a.onSelect}
                  className={cn(
                    "group/action flex w-full items-center gap-4 py-4 text-left outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring",
                    a.destructive && "text-destructive-ink"
                  )}
                >
                  {a.icon && (
                    <span className="flex size-8 shrink-0 items-center justify-center border-[0.8px] border-border text-muted-foreground [&_svg]:size-4">{a.icon}</span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[13px] font-bold">{a.title}</span>
                    {a.description && <span className="text-xs font-medium text-muted-foreground">{a.description}</span>}
                  </span>
                  <ArrowRightIcon className="h-4 w-6 shrink-0 transition-transform group-hover/action:translate-x-0.5" strokeWidth={1.5} />
                </button>
              </DrawerClose>
            </li>
          ))}
        </ul>
      </DrawerContent>
    </Drawer>
  );
}

function ConfirmSheet({
  trigger,
  open,
  onOpenChange,
  tone = "default",
  eyebrow,
  title,
  description,
  note,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  layout = "stack",
  children,
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="mx-auto max-w-lg">
        <div className={cn("flex flex-col gap-3 px-6 pt-6", tone === "warning" && "items-center text-center")}>
          {(eyebrow || tone === "warning") && <p className="text-caps text-[10px] tracking-[0.2em] text-destructive-ink">{eyebrow ?? "Warning"}</p>}
          <DrawerTitle className="text-lg leading-snug font-bold">{title}</DrawerTitle>
          {description ? (
            <DrawerDescription className="text-[13px] leading-relaxed font-medium text-muted-foreground">{description}</DrawerDescription>
          ) : (
            <DrawerDescription className="sr-only">{title}</DrawerDescription>
          )}
          {note && <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground [&_svg]:size-4">{note}</p>}
        </div>
        {children && <div className="px-6 pt-4">{children}</div>}
        <div className={cn("gap-3 px-6 pt-6 pb-8", layout === "stack" ? "flex flex-col" : "grid grid-cols-2")}>
          {layout === "inline" && (
            <DrawerClose asChild>
              <Button variant="outline" size="lg">{cancelLabel}</Button>
            </DrawerClose>
          )}
          <DrawerClose asChild>
            <Button size="lg" onClick={onConfirm}>{confirmLabel}</Button>
          </DrawerClose>
          {layout === "stack" && (
            <DrawerClose asChild>
              <Button variant="outline" size="lg">{cancelLabel}</Button>
            </DrawerClose>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export { ActionSheet, ConfirmSheet };
