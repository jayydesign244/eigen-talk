import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

const ROW = 36;

/**
 * An iOS-style wheel (CRED's PUC expiry date picker): rows snap into a grey
 * selection band in the middle and fade towards the edges. Each column is a
 * listbox; arrow keys step through it. Put several in a <WheelPickerGroup>.
 */
function WheelPickerGroup({ className, children, ...props }) {
  return (
    <div data-slot="wheel-picker-group" className={cn("relative flex w-full border-[0.8px] border-border bg-card", className)} {...props}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-9 -translate-y-1/2 bg-surface-2" />
      {children}
    </div>
  );
}

function WheelPicker({ className, options = [], value, onValueChange, label, visible = 5 }) {
  const ref = useRef(null);
  const uid = useId();
  const index = Math.max(0, options.findIndex((o) => (o.value ?? o) === value));
  const settle = useRef();

  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ROW) !== index) el.scrollTo({ top: index * ROW });
  }, [index]);

  const pick = (i) => {
    const o = options[Math.max(0, Math.min(options.length - 1, i))];
    if (o !== undefined) onValueChange?.(o.value ?? o);
  };

  return (
    <div
      ref={ref}
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={`${uid}-${index}`}
      onScroll={(e) => {
        clearTimeout(settle.current);
        const top = e.currentTarget.scrollTop;
        settle.current = setTimeout(() => pick(Math.round(top / ROW)), 90);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") (e.preventDefault(), pick(index + 1));
        if (e.key === "ArrowUp") (e.preventDefault(), pick(index - 1));
      }}
      className={cn(
        "relative z-10 flex-1 snap-y snap-mandatory overflow-y-auto overscroll-contain outline-hidden [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring [&::-webkit-scrollbar]:hidden",
        "[mask-image:linear-gradient(transparent,#000_35%,#000_65%,transparent)]",
        className
      )}
      style={{ height: ROW * visible, paddingBlock: (ROW * (visible - 1)) / 2 }}
    >
      {options.map((o, i) => (
        <div
          key={o.value ?? o}
          id={`${uid}-${i}`}
          role="option"
          aria-selected={i === index}
          onClick={() => pick(i)}
          className={cn(
            "flex snap-center items-center justify-center text-[15px] tabular transition-colors",
            i === index ? "font-semibold text-foreground" : "font-medium text-muted-foreground"
          )}
          style={{ height: ROW }}
        >
          {o.label ?? o}
        </div>
      ))}
    </div>
  );
}

export { WheelPickerGroup, WheelPicker };
