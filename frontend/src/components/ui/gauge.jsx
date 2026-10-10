import { cn } from "@/lib/utils";

const TONES = {
  auto: null,
  success: "var(--success)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  brand: "var(--brand)",
};

/**
 * A score ring (CRED's credit score; in Sonicly, the audio quality score):
 * a 270° arc from `min` to `max`, a dot at the tip, the number in the middle with
 * a caps rating under it ("AVERAGE"), and the range below. `tone="auto"` picks
 * red / orange / yellow-green / green from where the value falls.
 */
function Gauge({ className, value = 0, min = 0, max = 100, label, rating, tone = "auto", size = 140, showRange = true, ...props }) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const r = 42;
  const c = 2 * Math.PI * r;
  const arc = c * 0.75;
  const auto = t < 0.35 ? TONES.destructive : t < 0.6 ? TONES.warning : t < 0.8 ? "#d6e04a" : TONES.success;
  const color = TONES[tone] ?? auto;
  const angle = (135 + 270 * t) * (Math.PI / 180);
  const dot = { x: 50 + r * Math.cos(angle), y: 50 + r * Math.sin(angle) };
  return (
    <div data-slot="gauge" className={cn("inline-flex flex-col items-center", className)} {...props}>
      <div
        role="meter"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={rating ? `${value}, ${rating}` : String(value)}
        aria-label={label}
        className="relative"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 100 100" className="size-full -rotate-0" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" style={{ stroke: "var(--border-strong, var(--border))" }} strokeWidth="1" strokeDasharray={`${arc} ${c}`} transform="rotate(135 50 50)" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            style={{ stroke: color }}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${arc * t} ${c}`}
            transform="rotate(135 50 50)"
            className="transition-[stroke-dasharray] duration-700 ease-[var(--ease-standard)]"
          />
          <circle cx={dot.x} cy={dot.y} r="2.2" style={{ fill: color }} />
          <circle cx="50" cy="50" r="30" style={{ fill: "var(--surface-2)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[26px] leading-none font-extrabold tabular" style={{ fontSize: size * 0.19 }}>
            {value}
          </span>
          {rating && (
            <span className="text-caps mt-1 text-[8px] tracking-[0.16em]" style={{ color }}>
              {rating}
            </span>
          )}
        </div>
      </div>
      {showRange && (
        <div className="-mt-3 flex w-full justify-between px-[14%] text-[11px] font-medium text-muted-foreground tabular" style={{ width: size }}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

export { Gauge };
