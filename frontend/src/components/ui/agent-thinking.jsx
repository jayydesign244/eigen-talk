import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Seconds since `since` (ms timestamp), ticking every 100ms. */
function useElapsed(since, running = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);
  return Math.max(0, (now - (since ?? now)) / 1000);
}

function DotWave() {
  return (
    <span className="grid grid-cols-3 gap-[2px]" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => {
        const diag = (i % 3) + Math.floor(i / 3);
        return (
          <span
            key={i}
            className="size-[4px] bg-current"
            style={{ animation: "think-wave 1.2s ease-in-out infinite", animationDelay: `${diag * 0.12}s` }}
          />
        );
      })}
    </span>
  );
}

function DotSpin() {
  // Perimeter of a 3×3 grid, clockwise, so the bright head orbits the centre.
  const order = [0, 1, 2, 5, 8, 7, 6, 3];
  return (
    <span className="grid grid-cols-3 gap-[2px]" aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => {
        const pos = order.indexOf(i);
        return (
          <span
            key={i}
            className={cn("size-[4px] bg-current", pos === -1 && "opacity-20")}
            style={pos === -1 ? undefined : { animation: "think-orbit 0.96s linear infinite", animationDelay: `${pos * 0.12}s` }}
          />
        );
      })}
    </span>
  );
}

function Stars() {
  const stars = [
    { x: 1, y: 1, s: 6, d: 0 },
    { x: 9, y: 3, s: 4, d: 0.4 },
    { x: 4, y: 9, s: 5, d: 0.8 },
    { x: 11, y: 10, s: 3, d: 0.2 },
  ];
  return (
    <span className="relative block size-[14px]" aria-hidden="true">
      {stars.map((st, i) => (
        <svg
          key={i}
          viewBox="0 0 10 10"
          className="absolute"
          style={{ left: st.x - st.s / 2, top: st.y - st.s / 2, width: st.s, height: st.s, animation: "think-twinkle 1.4s ease-in-out infinite", animationDelay: `${st.d}s` }}
        >
          <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

function InfinityLoop() {
  return (
    <svg viewBox="0 0 24 12" className="h-[12px] w-[24px]" aria-hidden="true">
      <path
        d="M12 6c-2-3-4.5-4.5-7-4.5S1 3.5 1 6s1.5 4.5 4 4.5S10 9 12 6s4.5-4.5 7-4.5S23 3.5 23 6s-1.5 4.5-4 4.5S14 9 12 6z"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="1.6"
      />
      <path
        d="M12 6c-2-3-4.5-4.5-7-4.5S1 3.5 1 6s1.5 4.5 4 4.5S10 9 12 6s4.5-4.5 7-4.5S23 3.5 23 6s-1.5 4.5-4 4.5S14 9 12 6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="square"
        pathLength="100"
        strokeDasharray="18 82"
        style={{ animation: "think-infinity 1.6s linear infinite" }}
      />
    </svg>
  );
}

const INDICATORS = { wave: DotWave, spin: DotSpin, stars: Stars, infinity: InfinityLoop };

/**
 * The "agent is working" line that sits above a composer: an animated
 * indicator, a shimmering label and an elapsed timer.
 */
function AgentThinking({ variant = "wave", label = "Thinking", since, showTimer = true, tone = "brand", className, ...props }) {
  const Indicator = INDICATORS[variant] || DotWave;
  const elapsed = useElapsed(since, showTimer);
  return (
    <div
      role="status"
      aria-live="polite"
      data-slot="agent-thinking"
      className={cn("flex items-center gap-2.5 text-[13px]", className)}
      {...props}
    >
      <span className={cn("flex size-4 items-center justify-center", tone === "brand" ? "text-brand-ink" : "text-muted-foreground")}>
        <Indicator />
      </span>
      <span className="text-shimmer font-semibold">{label}</span>
      {showTimer && <span className="font-mono text-[11px] text-muted-foreground tabular">{elapsed.toFixed(1)}s</span>}
    </div>
  );
}

export { AgentThinking, useElapsed };
