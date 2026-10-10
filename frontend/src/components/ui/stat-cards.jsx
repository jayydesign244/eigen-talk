import { motion } from "motion/react";
import { ArrowDownRightIcon, ArrowUpRightIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { land, stagger } from "@/lib/motion";

/** A small delta pill: green up, red down, neutral at zero. */
function DeltaPill({ value, suffix = "%", invert = false }) {
  if (value === undefined || value === null) return null;
  const up = value > 0;
  const good = invert ? value < 0 : value > 0;
  const Icon = up ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border-[0.8px] px-1.5 py-[2px] font-mono text-[10px] font-bold tabular",
        value === 0 ? "border-border bg-muted text-muted-foreground" : good ? "border-success/40 bg-success-soft text-success-ink" : "border-destructive/40 bg-destructive-soft text-destructive-ink"
      )}
    >
      {value !== 0 && <Icon className="size-3" />}
      {Math.abs(value)}{suffix}
    </span>
  );
}

const ICON_TONES = {
  brand: "bg-brand text-brand-foreground",
  default: "bg-foreground text-background",
  success: "bg-success text-background",
  warning: "bg-warning text-background",
  info: "bg-info text-white",
};

/**
 * KPI cards for dashboard headers.
 *  - compact: label, big number, optional delta — a ruled row.
 *  - footer: elevated cards with an icon tile, info tooltip, display value
 *    and a footer band carrying the comparison caption and delta pill.
 *
 * items: [{ label, value, delta?, deltaInvert?, caption?, icon?, tone?, info? }]
 */
function StatCards({ items = [], variant = "compact", className }) {
  if (variant === "footer") {
    return (
      <div className={cn("@container", className)}>
      <motion.div
        variants={stagger(0.05)}
        initial="hidden"
        animate="show"
        data-slot="stat-cards"
        className="grid gap-5 @lg:grid-cols-2 @4xl:grid-cols-4"
      >
        {items.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={land} className="flex flex-col overflow-hidden rounded-2xl border-[0.8px] border-border bg-card shadow-soft">
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  {Icon && <span className={cn("flex size-11 items-center justify-center rounded-full", ICON_TONES[s.tone || "default"])}><Icon className="size-4" /></span>}
                  {s.info && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="rounded-full text-muted-foreground outline-hidden hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring" aria-label={`About ${s.label}`}><InfoIcon className="size-4" /></button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-56">{s.info}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <p className="mt-4 text-[12px] font-semibold text-muted-foreground">{s.label}</p>
                <p className="mt-1 text-3xl leading-none font-extrabold tracking-tight tabular">{s.value}</p>
              </div>
              {(s.caption || s.delta !== undefined) && (
                <div className="flex items-center justify-between gap-2 border-t-[0.8px] border-border bg-muted/50 px-4 py-2.5">
                  <span className="truncate text-[11px] text-muted-foreground">{s.caption}</span>
                  <DeltaPill value={s.delta} invert={s.deltaInvert} />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
      </div>
    );
  }
  return (
    <div className={cn("@container border-y border-border py-6", className)}>
    <motion.div
      variants={stagger(0.05)}
      initial="hidden"
      animate="show"
      data-slot="stat-cards"
      className="grid grid-cols-2 gap-y-6 @3xl:grid-cols-4"
    >
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          variants={land}
          className={cn(
            "min-w-0 border-l border-border pl-5",
            i % 2 === 0 && "border-l-0 pl-0",
            i % 2 === 0 && i > 0 && "@3xl:border-l @3xl:pl-5"
          )}
        >
          <p className="text-caps flex items-center gap-1.5 text-label">
            {s.label}
            {s.info && (
              <Tooltip>
                <TooltipTrigger asChild><button className="rounded-full outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring" aria-label={`About ${s.label}`}><InfoIcon className="size-3" /></button></TooltipTrigger>
                <TooltipContent className="max-w-56 normal-case tracking-normal">{s.info}</TooltipContent>
              </Tooltip>
            )}
          </p>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-3xl leading-none font-extrabold tracking-tight tabular @3xl:text-4xl">
            {s.value}
            <DeltaPill value={s.delta} invert={s.deltaInvert} />
          </p>
          {s.caption && <p className="mt-1.5 truncate text-[12px] text-muted-foreground">{s.caption}</p>}
        </motion.div>
      ))}
    </motion.div>
    </div>
  );
}

export { StatCards, DeltaPill };
