import { CheckIcon, ChevronDownIcon, PaperclipIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ComposerAttachments } from "@/components/ui/composer-attachments";
import { ComposerMicButton, ComposerSendButton } from "@/components/ui/composer";
import { cn } from "@/lib/utils";

/**
 * A compact picker for the bottom row of the panel (permission mode, model…).
 * options: [{ value, label, description?, icon? }]
 */
function ComposerPicker({ value, onChange, options = [], label, icon: Icon, side = "top" }) {
  const current = options.find((o) => o.value === value) || options[0];
  const CurrentIcon = current?.icon || Icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-[12px] font-semibold text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground">
          {CurrentIcon && <CurrentIcon className="size-3.5" />}
          {current?.label}
          <ChevronDownIcon className="size-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={side} className="w-64">
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {options.map((o) => {
          const OIcon = o.icon;
          const on = o.value === current?.value;
          return (
            <DropdownMenuItem key={o.value} onSelect={() => onChange?.(o.value)} className="items-start">
              {OIcon ? <OIcon className="mt-0.5" /> : <span className="size-4" />}
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold">{o.label}</span>
                {o.description && <span className="text-[11px] font-normal text-muted-foreground in-data-[highlighted]:text-background/70">{o.description}</span>}
              </span>
              {on && <CheckIcon className="mt-0.5 text-current!" strokeWidth={3} />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The tall, two-row composer for agent surfaces: the prompt on top, controls
 * underneath, an optional status tab hanging off the top edge and an
 * attachments strip above the prompt.
 */
function ComposerPanel({
  value,
  onChange,
  onSubmit,
  placeholder = "What do you need today?",
  working = false,
  disabled = false,
  onStop,
  statusTab,
  attachments,
  onRemoveAttachment,
  addItems,
  pickers,
  hint,
  className,
}) {
  const send = (e) => {
    e?.preventDefault();
    if (!value?.trim() || working || disabled) return;
    onSubmit?.(value.trim());
  };
  return (
    <form onSubmit={send} data-slot="composer-panel" className={cn("relative", statusTab && "pt-7", className)}>
      {statusTab && (
        <div className="absolute top-0 right-3 left-3 flex h-7 items-center gap-3 border border-b-0 border-border bg-muted px-2.5">
          {statusTab}
        </div>
      )}
      <div className="relative border border-input bg-card transition-[border-color,box-shadow] focus-within:border-foreground focus-within:shadow-[inset_0_-2px_0_0_var(--foreground)]">
        <ComposerAttachments items={attachments} onRemove={onRemoveAttachment} className="px-3" />
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder={working ? "Working…" : placeholder}
          aria-label="Prompt"
          className="field-sizing-content max-h-40 min-h-16 w-full resize-none bg-transparent px-3.5 pt-3 text-sm outline-hidden placeholder:text-muted-foreground/80 disabled:opacity-60"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Add" disabled={disabled}><PlusIcon /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              {(addItems || [{ icon: PaperclipIcon, label: "Attach a file", disabled: true }]).map(({ icon: Icon, label, onSelect, disabled: d }, i) =>
                label === "-" ? <DropdownMenuSeparator key={i} /> : (
                  <DropdownMenuItem key={label} onSelect={onSelect} disabled={d}>{Icon && <Icon />}{label}</DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {pickers}
          {hint && <span className="ml-1 hidden truncate text-[11px] text-muted-foreground sm:inline">{hint}</span>}
          <span className="ml-auto flex items-center gap-1">
            <ComposerMicButton onText={(t) => onChange?.((value ? value + " " : "") + t)} disabled={disabled || working} />
            <ComposerSendButton canSend={Boolean(value?.trim())} working={working} onStop={onStop} />
          </span>
        </div>
      </div>
    </form>
  );
}

export { ComposerPanel, ComposerPicker };
