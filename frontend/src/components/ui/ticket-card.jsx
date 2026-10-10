import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRED's voucher: a ticket with scalloped top and bottom edges, semicircle
 * notches on both sides at the perforation and a dotted tear line. Above the
 * line sits the brand, category and offer; below it the action.
 * `expired` greys it out and shows the caps status ("ALREADY EXPIRED").
 */
function TicketCard({ className, logo, category, title, status, expired, footer, onClick, ...props }) {
  const scallop = (y) => `radial-gradient(circle at 6px ${y}, transparent 4px, #000 4.5px)`;
  const mask = `${scallop("0")} top / 12px 51% repeat-x, ${scallop("100%")} bottom / 12px 51% repeat-x`;
  return (
    <article
      data-slot="ticket-card"
      data-expired={expired || undefined}
      className={cn("relative flex flex-col bg-card text-card-foreground data-expired:bg-muted data-expired:text-muted-foreground", className)}
      style={{ WebkitMask: mask, mask }}
      {...props}
    >
      <div className="flex flex-col gap-1.5 px-4 pt-6 pb-4">
        {logo && <span className="mb-2 flex size-12 items-center justify-center overflow-hidden rounded-full bg-pop-white p-1.5 [&_img]:size-full [&_img]:object-contain">{logo}</span>}
        {category && <p className="text-[11px] font-medium text-muted-foreground">{category}</p>}
        <h3 className="line-clamp-3 text-[13px] leading-snug font-semibold">{title}</h3>
        {status && <p className="text-caps text-[9px] tracking-[0.14em] text-muted-foreground">{status}</p>}
      </div>
      <div className="relative">
        <span className="absolute top-0 -left-1.5 size-3 -translate-y-1/2 rounded-full bg-background" />
        <span className="absolute top-0 -right-1.5 size-3 -translate-y-1/2 rounded-full bg-background" />
        <div className="mx-2 border-t-[1.5px] border-dotted border-border-strong" />
      </div>
      <div className="px-4 pt-3 pb-6">
        {footer ?? (
          <button type="button" onClick={onClick} aria-label={`Open ${title}`} className="text-foreground outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring">
            <ArrowRightIcon className="h-4 w-6" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </article>
  );
}

export { TicketCard };
