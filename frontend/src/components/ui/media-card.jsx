import { cn } from "@/lib/utils";
import { Price } from "@/components/ui/price";

/**
 * Image-led cards from CRED's store, travel and offers screens.
 *
 * <MediaCard>: a tall image with an overlaid caps eyebrow and serif title
 *   ("CALANGUTE & BAGA BEACH / starting from ₹3500/night"), or an optional
 *   white info box pinned to the bottom (guests • nights, price, cashback tag).
 * <ProductCard>: square image, muted brand, two-line name, Price, optional CTA row.
 * <OfferCard>: image with a brand logo badge in the corner, name and a muted offer line.
 */
function MediaCard({ className, image, alt = "", eyebrow, title, caption, badge, children, ratio = "4/5", ...props }) {
  return (
    <article data-slot="media-card" className={cn("relative isolate flex flex-col self-start overflow-hidden", className)} {...props}>
      <div className="relative w-full bg-surface-2" style={{ aspectRatio: ratio }}>
        {image && <img src={image} alt={alt} className="absolute inset-0 size-full object-cover" />}
        <div className="absolute inset-0 bg-linear-to-b from-black/35 via-transparent to-black/10" />
        {badge && <div className="absolute top-3 right-3">{badge}</div>}
        {(eyebrow || title) && (
          <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-1.5 px-5 pt-8 text-center text-white">
            {eyebrow && <p className="text-caps text-[10px] tracking-[0.2em]">{eyebrow}</p>}
            {title && <h3 className="font-display text-2xl leading-tight">{title}</h3>}
            {caption && <p className="text-[11px] font-medium opacity-85">{caption}</p>}
          </div>
        )}
      </div>
      {children && <div className="relative -mt-16 mx-auto mb-0 w-[78%] bg-pop-white px-4 py-3 text-center text-pop-black">{children}</div>}
    </article>
  );
}

function ProductCard({ className, image, alt = "", brand, name, price, original, discount = true, action, ...props }) {
  return (
    <article data-slot="product-card" className={cn("flex w-full flex-col", action && "border-[0.8px] border-border", className)} {...props}>
      <div className="aspect-square w-full overflow-hidden bg-surface-2">{image && <img src={image} alt={alt} className="size-full object-cover" />}</div>
      <div className={cn("flex flex-col gap-1 pt-3", action && "px-3 pb-3")}>
        {brand && <p className="text-xs font-medium text-muted-foreground">{brand}</p>}
        <h3 className="line-clamp-2 text-[13px] leading-snug font-semibold">{name}</h3>
        {price != null && <Price value={price} original={original} discount={discount} size="sm" currency="INR" />}
      </div>
      {action && <div className="mt-auto border-t-[0.8px] border-border">{action}</div>}
    </article>
  );
}

function OfferCard({ className, image, alt = "", logo, name, offer, ...props }) {
  return (
    <article data-slot="offer-card" className={cn("flex w-full flex-col gap-2", className)} {...props}>
      <div className="relative aspect-[5/6] w-full overflow-hidden bg-surface-2">
        {image && <img src={image} alt={alt} className="size-full object-cover" />}
        {logo && <span className="absolute bottom-3 left-3 flex size-9 items-center justify-center overflow-hidden bg-pop-white p-1 [&_img]:size-full [&_img]:object-contain">{logo}</span>}
      </div>
      <h3 className="text-[13px] font-semibold">{name}</h3>
      {offer && <p className="-mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">{offer}</p>}
    </article>
  );
}

export { MediaCard, ProductCard, OfferCard };
