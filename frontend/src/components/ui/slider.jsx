import * as React from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Slider with a fader-cap thumb (a mixing-desk nod). Hairline track, the
 * filled range in foreground; the cap grows slightly while dragged.
 */
function Slider({ className, defaultValue, value, min = 0, max = 100, tone = "foreground", ...props }) {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  );
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "group/slider relative flex w-full touch-none items-center py-2 select-none data-[disabled]:opacity-45 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-2 data-[orientation=vertical]:py-0",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-input data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute rounded-full data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            tone === "brand" ? "bg-brand" : "bg-foreground"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block size-5 shrink-0 rounded-full border-[0.8px] border-border bg-white shadow-soft outline-hidden transition-transform duration-150 ease-[var(--ease-standard)] after:absolute after:inset-[6px] after:rounded-full after:bg-foreground hover:scale-110 focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-125 disabled:pointer-events-none"
          aria-label={props["aria-label"] || "Value"}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
