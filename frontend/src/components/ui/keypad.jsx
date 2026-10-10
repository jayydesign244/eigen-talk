import { DeleteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

/**
 * CRED's custom number pad: square white keys on a hairline grid (pay screens),
 * with "." and backspace as quiet keys. `onKey` receives "0"–"9", "." or
 * "back". Pass `decimal={false}` to hide the dot.
 */
function Keypad({ className, onKey, decimal = true, disabled, ...props }) {
  return (
    <div data-slot="keypad" role="group" aria-label="Number pad" className={cn("grid w-full max-w-80 grid-cols-3", className)} {...props}>
      {KEYS.map((k) => {
        const quiet = k === "." || k === "back";
        if (k === "." && !decimal) return <span key={k} />;
        return (
          <button
            key={k}
            type="button"
            disabled={disabled}
            onClick={() => onKey?.(k)}
            aria-label={k === "back" ? "Delete" : k === "." ? "Decimal point" : k}
            className={cn(
              "flex h-14 items-center justify-center text-lg font-semibold tabular outline-hidden transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:opacity-40",
              quiet
                ? "bg-transparent text-foreground hover:bg-accent"
                : "border-[0.5px] border-pop-black/15 bg-pop-white text-pop-black hover:bg-[#ededed] active:bg-[#e2e2e2]"
            )}
          >
            {k === "back" ? <DeleteIcon className="size-5" strokeWidth={1.5} /> : k}
          </button>
        );
      })}
    </div>
  );
}

/** Apply a keypad key to a string value (keeps one decimal point, two decimals max). */
function applyKey(value, key, { maxLength = 9 } = {}) {
  const v = String(value ?? "");
  if (key === "back") return v.slice(0, -1);
  if (key === ".") return v.includes(".") ? v : (v || "0") + ".";
  if (v.includes(".") && v.split(".")[1].length >= 2) return v;
  if (v.replace(".", "").length >= maxLength) return v;
  return v === "0" ? key : v + key;
}

export { Keypad, applyKey };
