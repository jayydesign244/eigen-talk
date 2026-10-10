import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Numbered link lists from CRED:
 *  - caps:  "01. | GET CLAIMS ASSISTANCE | ↗" with a vertical rule after the number (concierge).
 *  - serif: a tiny "01" before a serif label with a long arrow (hotel policies).
 * Items are { label, onClick?, href? }.
 */
function NumberedList({ className, items = [], variant = "caps", ...props }) {
  return (
    <ol data-slot="numbered-list" className={cn("flex flex-col border-t-[0.8px] border-border", className)} {...props}>
      {items.map((item, i) => {
        const n = String(i + 1).padStart(2, "0");
        const Comp = item.href ? "a" : "button";
        return (
          <li key={item.label} className="border-b-[0.8px] border-border">
            <Comp
              href={item.href}
              type={item.href ? undefined : "button"}
              onClick={item.onClick}
              className="group/numbered flex w-full items-center gap-4 text-left outline-hidden transition-colors hover:bg-accent/60 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
            >
              {variant === "caps" ? (
                <>
                  <span className="w-12 shrink-0 self-stretch border-r-[0.8px] border-border py-4 pl-1 text-[13px] font-semibold tabular">{n}.</span>
                  <span className="flex-1 py-4 text-[13px] font-semibold tracking-[0.06em] uppercase">{item.label}</span>
                  <ArrowUpRightIcon className="mr-1 size-5 shrink-0 transition-transform group-hover/numbered:translate-x-0.5 group-hover/numbered:-translate-y-0.5" strokeWidth={1.25} />
                </>
              ) : (
                <>
                  <span className="w-5 shrink-0 text-[9px] font-medium text-muted-foreground tabular">{n}</span>
                  <span className="flex-1 py-3.5 font-display text-[17px]">{item.label}</span>
                  <ArrowRightIcon className="mr-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover/numbered:translate-x-0.5" strokeWidth={1.5} />
                </>
              )}
            </Comp>
          </li>
        );
      })}
    </ol>
  );
}

export { NumberedList };
