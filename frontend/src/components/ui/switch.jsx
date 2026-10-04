import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Blocky switch: square track and a square thumb that snaps across with a
 * small overshoot. "On" lights the track in the brand colour.
 */
function Switch({ className, size = "default", ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch inline-flex shrink-0 items-center border-[1.5px] p-[2px] transition-colors duration-200 outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45 data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=unchecked]:border-input data-[state=unchecked]:bg-muted hover:data-[state=unchecked]:border-muted-foreground",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block transition-[transform,background-color] duration-300 ease-[var(--ease-snap)] group-data-[size=default]/switch:size-[17px] group-data-[size=sm]/switch:size-[13px] data-[state=checked]:bg-pop-black data-[state=unchecked]:bg-muted-foreground group-data-[size=default]/switch:data-[state=checked]:translate-x-5 group-data-[size=sm]/switch:data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
