import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDownIcon, GlobeIcon, SearchIcon } from "lucide-react";
import { AgentThinking } from "@/components/ui/agent-thinking";
import { cn } from "@/lib/utils";

/** A round site mark: the site's initial on its colour, so sources read at a glance. */
function SiteMark({ name, color = "var(--muted)", className }) {
  return (
    <span
      className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-card text-[9px] font-extrabold text-white", className)}
      style={{ background: color }}
      title={name}
    >
      {name?.[0]?.toUpperCase()}
    </span>
  );
}

function SiteMarks({ sources = [], max = 4 }) {
  const shown = sources.slice(0, max);
  return (
    <span className="flex -space-x-1.5">
      {shown.map((s, i) => <SiteMark key={i} name={s.name} color={s.color} />)}
      {sources.length > max && (
        <span className="flex size-5 items-center justify-center rounded-full border-2 border-card bg-muted font-mono text-[9px] font-bold">+{sources.length - max}</span>
      )}
    </span>
  );
}

const reveal = {
  initial: { opacity: 0, y: 4, filter: "blur(3px)", height: 0 },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", height: "auto" },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

/**
 * The research log: each step is a query the agent ran or a page it opened.
 * A search that found something lists its sources as overlapping site marks.
 *
 * steps: [{ id, type: 'search' | 'open', text, results?, icon?, sources?: [{ name, domain, color }],
 *          links?: [{ label, title?, onClick }] }]
 * label / runningLabel: header text, e.g. "Searched the transcript" for a local search.
 */
function WebSearch({ steps = [], running = false, since, label, runningLabel = "Searching the web", className }) {
  const [open, setOpen] = useState(true);
  const searches = steps.filter((s) => s.type === "search").length;
  const isOpen = open || running;
  return (
    <div data-slot="web-search" className={cn("text-[13px]", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={isOpen}
        className="mb-1.5 -ml-1.5 flex items-center gap-2 rounded-md px-1.5 py-0.5 text-[12px] font-semibold text-muted-foreground outline-hidden transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
      >
        <SearchIcon className="size-3.5" />
        {running ? runningLabel : label || `Ran ${searches} search${searches === 1 ? "" : "es"}`}
        <ChevronDownIcon className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="ml-[6px] space-y-2 overflow-hidden border-l border-border pl-3">
            <AnimatePresence initial={false}>
              {steps.map((s) => (
                <motion.li key={s.id} {...reveal} className="overflow-hidden">
                  <div className="flex items-start gap-2">
                    {(() => {
                      const Icon = s.icon || (s.type === "search" ? SearchIcon : GlobeIcon);
                      return <Icon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />;
                    })()}
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground">{s.type === "search" ? `${running ? "Searching" : "Searched"} for “${s.text}”` : s.text}</span>
                      {s.domain && <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{s.domain}</span>}
                    </span>
                    {s.results !== undefined && <span className="shrink-0 font-mono text-[11px] text-muted-foreground tabular">{s.results} {s.results === 1 ? "result" : "results"}</span>}
                  </div>
                  {s.links?.length > 0 && (
                    <div className="mt-1.5 ml-5.5 flex flex-wrap gap-1">
                      {s.links.map((l, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={l.onClick}
                          title={l.title}
                          aria-label={l.title}
                          className="rounded-full border-[0.8px] border-border-cool bg-chip px-2 py-[1px] font-mono text-[11px] tabular transition-colors outline-hidden hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring"
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {s.sources?.length > 0 && (
                    <div className="mt-1.5 ml-5.5 flex items-center gap-2">
                      <SiteMarks sources={s.sources} />
                      <span className="truncate text-[11px] text-muted-foreground">{s.sources.map((x) => x.name).join(", ")}</span>
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
      {running && <AgentThinking className="mt-2.5" variant="stars" label="Reading" since={since} />}
    </div>
  );
}

export { WebSearch, SiteMark, SiteMarks };
