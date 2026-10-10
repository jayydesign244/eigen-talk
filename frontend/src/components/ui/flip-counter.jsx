import { cn } from "@/lib/utils";

/**
 * Split-flap digits (CRED's "715 days with 0 challans"): each digit sits on a
 * dark tile with a hinge line and drops in when it changes. `minDigits` pads
 * with zeros; a caption can sit to the right.
 */
function FlipCounter({ className, value = 0, minDigits = 1, caption, ...props }) {
  const digits = String(Math.max(0, Math.floor(value))).padStart(minDigits, "0").split("");
  return (
    <div data-slot="flip-counter" className={cn("inline-flex items-center gap-4", className)} {...props}>
      <span className="flex gap-1.5" role="img" aria-label={String(value)}>
        {digits.map((d, i) => (
          <span
            key={`${i}-${d}`}
            aria-hidden
            className="relative flex h-14 w-11 items-center justify-center overflow-hidden rounded-xs bg-linear-to-b from-[#3a3a3a] via-[#1e1e1e] to-[#2b2b2b] text-[34px] font-extrabold text-[#e8e8e8] tabular shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_2px_0_#000] [perspective:200px] motion-safe:animate-[flip-in_320ms_var(--ease-standard)]"
          >
            {d}
            <span className="absolute inset-x-0 top-1/2 h-px bg-black/70" />
          </span>
        ))}
      </span>
      {caption && <span className="text-xs leading-snug font-medium text-muted-foreground">{caption}</span>}
    </div>
  );
}

export { FlipCounter };
