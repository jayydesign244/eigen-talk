import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpIcon, MicIcon, PaperclipIcon, PlusIcon, SquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Browser dictation via the Web Speech API. Returns `supported` so callers
 * can hide the mic where the browser can't transcribe.
 */
function useDictation(onText) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const Ctor = typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const supported = Boolean(Ctor);

  const stop = useCallback(() => {
    recRef.current?.stop();
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!Ctor) return;
    const rec = new Ctor();
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      if (text) onText(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [Ctor, onText]);

  useEffect(() => () => recRef.current?.abort?.(), []);
  return { supported, listening, start, stop };
}

/** The small circular gauge used by ContextMeter. */
function MeterRing({ value = 0, className }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <svg viewBox="0 0 16 16" className={cn("size-3.5 -rotate-90", className)} aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <circle
        cx="8" cy="8" r="6" fill="none"
        stroke={v > 85 ? "var(--warning)" : "var(--brand)"}
        strokeWidth="2.5"
        pathLength="100"
        strokeDasharray={`${v} 100`}
        style={{ transition: "stroke-dasharray 0.4s ease" }}
      />
    </svg>
  );
}

/** Ring that fills to `value` (0–100), with the number beside it. */
function ContextMeter({ value = 0, label = "Context", className }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground tabular", className)}>
          <MeterRing value={v} />
          {Math.round(v)}%
        </span>
      </TooltipTrigger>
      <TooltipContent>{label} {Math.round(v)}% used</TooltipContent>
    </Tooltip>
  );
}

/**
 * The strip under (or over) a composer: small facts about where the agent
 * is working — e.g. project, version — and an optional meter on the right.
 * items: [{ icon, label }]
 */
function ComposerStatus({ items = [], meter, right, className }) {
  return (
    <div data-slot="composer-status" className={cn("flex items-center gap-3 px-1 text-[11px] text-muted-foreground", className)}>
      {items.map(({ icon: Icon, label }, i) => (
        <span key={i} className="inline-flex min-w-0 items-center gap-1.5">
          {Icon && <Icon className="size-3 shrink-0" />}
          <span className="truncate font-semibold">{label}</span>
        </span>
      ))}
      <span className="ml-auto flex items-center gap-3">
        {right}
        {meter !== undefined && <ContextMeter value={meter.value} label={meter.label} />}
      </span>
    </div>
  );
}

function ComposerSendButton({ canSend, working, onSend, onStop, className }) {
  if (working && onStop) {
    return (
      <Button type="button" size="icon-sm" onClick={onStop} aria-label="Stop" className={cn("rounded-full", className)}>
        <SquareIcon className="size-3 fill-current" />
      </Button>
    );
  }
  return (
    <Button type="submit" size="icon-sm" variant={canSend ? "brand" : "default"} disabled={!canSend || working} onClick={onSend} aria-label="Send" className={cn("rounded-full", className)}>
      <ArrowUpIcon strokeWidth={2.5} />
    </Button>
  );
}

function ComposerMicButton({ onText, disabled }) {
  const { supported, listening, start, stop } = useDictation(onText);
  if (!supported) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={listening ? stop : start}
          disabled={disabled}
          aria-label={listening ? "Stop dictation" : "Dictate"}
          aria-pressed={listening}
          className={cn("rounded-full", listening && "bg-destructive text-destructive-foreground hover:bg-destructive")}
        >
          <MicIcon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{listening ? "Listening… click to stop" : "Dictate"}</TooltipContent>
    </Tooltip>
  );
}

/**
 * Single-line composer: an add menu, the prompt, optional trailing controls
 * (e.g. a model menu), mic and send. `status` renders a strip underneath.
 */
function Composer({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask Sonicly anything",
  working = false,
  disabled = false,
  onStop,
  addItems,
  trailing,
  status,
  className,
}) {
  const send = (e) => {
    e?.preventDefault();
    if (!value?.trim() || working || disabled) return;
    onSubmit?.(value.trim());
  };
  return (
    <form onSubmit={send} data-slot="composer" className={cn("grid gap-2", className)}>
      <div className="flex h-12 items-center gap-1.5 rounded-2xl border-[0.8px] border-border bg-card pr-1.5 pl-1.5 shadow-soft transition-[border-color,box-shadow] focus-within:border-foreground/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Add" disabled={disabled} className="rounded-full"><PlusIcon /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-52">
            {(addItems || [{ icon: PaperclipIcon, label: "Attach a file", disabled: true }]).map(({ icon: Icon, label, onSelect, disabled: d }) => (
              <DropdownMenuItem key={label} onSelect={onSelect} disabled={d}>{Icon && <Icon />}{label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={working ? "Working…" : placeholder}
          disabled={disabled}
          aria-label="Prompt"
          className="h-full min-w-0 flex-1 bg-transparent px-1 text-sm outline-hidden placeholder:text-muted-foreground/80 disabled:opacity-60"
        />
        {trailing}
        <ComposerMicButton onText={(t) => onChange?.((value ? value + " " : "") + t)} disabled={disabled || working} />
        <ComposerSendButton canSend={Boolean(value?.trim())} working={working} onStop={onStop} />
      </div>
      {status}
    </form>
  );
}

export { Composer, ComposerMicButton, ComposerSendButton, ComposerStatus, ContextMeter, MeterRing, useDictation };
