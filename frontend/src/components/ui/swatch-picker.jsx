import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Square image or colour swatches (CRED store "COLOUR"): the chosen one gets a
 * 1px ink frame, sold-out options fade and carry a caps "SOLD OUT" caption and
 * can't be picked. `options` = [{ value, label, image?, color?, soldOut? }].
 */
function SwatchPicker({ className, options = [], soldOutLabel = "Sold out", ...props }) {
  return (
    <RadioGroupPrimitive.Root data-slot="swatch-picker" className={cn("flex flex-wrap gap-3", className)} {...props}>
      {options.map((o) => (
        <RadioGroupPrimitive.Item
          key={o.value}
          value={o.value}
          disabled={o.soldOut}
          aria-label={o.soldOut ? `${o.label}, ${soldOutLabel.toLowerCase()}` : o.label}
          className="group/swatch relative flex size-16 flex-col items-center justify-center overflow-hidden border-[0.8px] border-border bg-surface-2 outline-hidden transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=checked]:border-foreground data-[state=checked]:shadow-[inset_0_0_0_1px_var(--foreground)] disabled:cursor-not-allowed"
        >
          {o.image ? (
            <img src={o.image} alt="" className="size-full object-cover group-disabled/swatch:opacity-40" />
          ) : (
            <span className="size-8 rounded-full border-[0.8px] border-black/10 group-disabled/swatch:opacity-40" style={{ background: o.color }} />
          )}
          {o.soldOut && (
            <span className="absolute inset-x-0 bottom-1 text-center text-[7px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
              {soldOutLabel}
            </span>
          )}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

export { SwatchPicker };
