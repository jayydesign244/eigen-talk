import { useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { CheckIcon, LockIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CRED's "slide to unlock" pill: a dark track with a ringed knob. Dragging the
 * knob past 85% confirms; letting go earlier springs it back. Keyboard users
 * press Enter or Space on the knob. `onConfirm` fires once; `confirmed` shows
 * the done state (a check), `disabled` greys it out.
 */
function SlideToConfirm({ className, label = "Slide to confirm", confirmed: confirmedProp, onConfirm, disabled, icon, ...props }) {
  const track = useRef(null);
  const x = useMotionValue(0);
  const [done, setDone] = useState(false);
  const confirmed = confirmedProp ?? done;
  const fade = useTransform(x, [0, 120], [1, 0]);

  const max = () => (track.current ? track.current.offsetWidth - 56 : 0);
  const confirm = () => {
    if (confirmed || disabled) return;
    animate(x, max(), { type: "spring", stiffness: 600, damping: 40 });
    setDone(true);
    onConfirm?.();
  };

  return (
    <div
      ref={track}
      data-slot="slide-to-confirm"
      data-state={confirmed ? "confirmed" : "idle"}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative flex h-14 w-full max-w-80 items-center overflow-hidden rounded-full bg-pop-black text-white select-none aria-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <motion.span style={{ opacity: fade }} className="pointer-events-none flex-1 pl-16 pr-6 text-center text-xs font-semibold tracking-[0.02em]">
        {label}
      </motion.span>
      <motion.button
        type="button"
        aria-label={confirmed ? "Confirmed" : label}
        disabled={disabled || confirmed}
        drag={confirmed || disabled ? false : "x"}
        dragConstraints={track}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => (x.get() > max() * 0.85 ? confirm() : animate(x, 0, { type: "spring", stiffness: 500, damping: 35 }))}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), confirm())}
        className={cn(
          "absolute top-1 left-1 flex size-12 cursor-grab items-center justify-center rounded-full border border-white/20 bg-pop-black text-white shadow-[0_0_0_2px_var(--success)] outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring active:cursor-grabbing",
          confirmed && "bg-success text-pop-black"
        )}
      >
        {confirmed ? <CheckIcon className="size-5" strokeWidth={3} /> : icon ?? <LockIcon className="size-5" strokeWidth={1.5} />}
      </motion.button>
    </div>
  );
}

export { SlideToConfirm };
