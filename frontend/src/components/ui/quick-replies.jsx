import { cn } from "@/lib/utils";

/**
 * Suggested answers under a bot message (CRED garage & concierge chats):
 * left-aligned outlined boxes, one per line, that send their text when tapped.
 * `options` = string[]; `onSelect(option)`. Use `disabled` once one is sent.
 */
function QuickReplies({ className, options = [], onSelect, disabled, label = "Suggested replies", ...props }) {
  return (
    <div data-slot="quick-replies" role="group" aria-label={label} className={cn("flex flex-col items-start gap-2.5", className)} {...props}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          disabled={disabled}
          onClick={() => onSelect?.(o)}
          className="border-[0.8px] border-border-strong bg-transparent px-4 py-2.5 text-left text-[13px] font-medium text-foreground outline-hidden transition-colors hover:border-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45"
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export { QuickReplies };
