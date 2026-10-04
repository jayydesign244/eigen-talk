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
        className="relative grow overflow-hidden bg-input data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            tone === "brand" ? "bg-brand" : "bg-foreground"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="relative block h-5 w-3 shrink-0 border-2 border-background bg-foreground outline-hidden transition-transform duration-150 ease-[var(--ease-snap)] after:absolute after:inset-x-[2px] after:top-1/2 after:h-[2px] after:-translate-y-1/2 after:bg-background hover:scale-110 focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-125 disabled:pointer-events-none group-data-[orientation=vertical]/slider:h-3 group-data-[orientation=vertical]/slider:w-5 group-data-[orientation=vertical]/slider:after:inset-x-auto group-data-[orientation=vertical]/slider:after:inset-y-[2px] group-data-[orientation=vertical]/slider:after:left-1/2 group-data-[orientation=vertical]/slider:after:h-auto group-data-[orientation=vertical]/slider:after:w-[2px] group-data-[orientation=vertical]/slider:after:-translate-x-1/2 group-data-[orientation=vertical]/slider:after:translate-y-0"
          aria-label={props["aria-label"] || "Value"}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
