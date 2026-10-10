import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * CRED's promo / info card: art on one side, a heading (serif or bold), a muted
 * line and a CTA. One component, many skins:
 *  - light:   white card on a dark page ("reduce credit card bills with cashback").
 *  - dark:    raised dark surface with a full-width white CTA footer ("reserved for you: ₹50").
 *  - outline: hairline box ("win assured cashback", "no fuel spends found").
 *  - pattern: dark tile with a topographic line pattern ("on time payments").
 *  - tinted:  coloured fill (green "easy way to win more", Sonicly aqua).
 * `layout="row"` puts the art on the right of the text.
 */
const promoCardVariants = cva("relative flex overflow-hidden", {
  variants: {
    tone: {
      light: "light bg-pop-white text-pop-black [&_[data-slot=promo-card-description]]:text-pop-black/60",
      dark: "dark bg-[#232323] text-white [&_[data-slot=promo-card-description]]:text-white/60",
      outline: "border-[0.8px] border-border bg-card text-card-foreground",
      pattern:
        "dark bg-[#171717] text-white [&_[data-slot=promo-card-description]]:text-white/55 [background-image:repeating-radial-gradient(circle_at_0%_0%,transparent_0_14px,rgb(255_255_255/0.05)_14px_15px)]",
      tinted: "dark bg-[#0f4d33] text-white [&_[data-slot=promo-card-description]]:text-white/75",
      brand: "bg-brand-soft text-foreground",
    },
    layout: {
      stack: "flex-col",
      row: "flex-row items-center",
    },
  },
  defaultVariants: { tone: "outline", layout: "stack" },
});

function PromoCard({ className, tone, layout, eyebrow, title, description, media, action, footer, serif, children, ...props }) {
  return (
    <article data-slot="promo-card" data-tone={tone} className={cn(promoCardVariants({ tone, layout }), className)} {...props}>
      {media && layout !== "row" && <div className="flex justify-center px-6 pt-6">{media}</div>}
      <div className={cn("flex flex-1 flex-col gap-2 p-6", layout === "row" && "pr-2")}>
        {eyebrow && <p className="text-caps text-[9px] tracking-[0.2em] opacity-60">{eyebrow}</p>}
        {title && <h3 className={cn(serif ? "font-display text-[22px] leading-snug" : "text-base leading-snug font-bold")}>{title}</h3>}
        {description && <p data-slot="promo-card-description" className="text-xs leading-relaxed font-medium text-muted-foreground">{description}</p>}
        {children}
        {action && <div className="mt-3">{action}</div>}
      </div>
      {media && layout === "row" && <div className="shrink-0 py-4 pr-5">{media}</div>}
      {footer && <div className="mt-auto [&>*]:h-12 [&>*]:w-full [&>*]:rounded-none">{footer}</div>}
    </article>
  );
}

export { PromoCard, promoCardVariants };
