import { useState } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A row that slides left to reveal grey square actions (CRED cart: delete, Edit).
 * Drag past half the action width to open; tap elsewhere or drag back to close.
 * Keyboard and screen-reader users get the actions as normal buttons after the
 * row (they stay focusable even while hidden visually).
 */
function SwipeRow({ className, actions, actionWidth = 132, children, ...props }) {
  const x = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const snap = (to) => {
    setOpen(to !== 0);
    animate(x, to, { type: "spring", stiffness: 600, damping: 45 });
  };
  return (
    <div data-slot="swipe-row" data-state={open ? "open" : "closed"} className={cn("relative overflow-hidden", className)} {...props}>
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-3" style={{ width: actionWidth }} onFocus={() => snap(-actionWidth)}>
        {actions}
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.05}
        style={{ x }}
        onDragEnd={() => snap(x.get() < -actionWidth / 2 ? -actionWidth : 0)}
        onClick={() => open && snap(0)}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  );
}

/** A grey square action for SwipeRow (icon or short label). */
function SwipeAction({ className, ...props }) {
  return (
    <button
      type="button"
      data-slot="swipe-action"
      className={cn(
        "flex h-11 min-w-11 items-center justify-center gap-1.5 bg-chip px-3 text-xs font-semibold text-foreground outline-hidden hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring [&_svg]:size-4",
        className
      )}
      {...props}
    />
  );
}

export { SwipeRow, SwipeAction };
