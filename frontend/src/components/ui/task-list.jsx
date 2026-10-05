import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckIcon, ChevronDownIcon, FileAudioIcon, OctagonXIcon } from "lucide-react";
import { AgentThinking } from "@/components/ui/agent-thinking";
import { cn } from "@/lib/utils";

/** Small square chip naming a resource a step touched (a file, a version…). */
function ResourceChip({ icon: Icon = FileAudioIcon, children }) {
  return (
    <span className="inline-flex items-center gap-1 border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
      <Icon className="size-3 text-muted-foreground" />{children}
    </span>
  );
}

const reveal = {
  initial: { opacity: 0, y: 4, filter: "blur(3px)", height: 0 },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", height: "auto" },
  transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
};

/**
 * A streaming log of what an agent actually did. Tasks and their steps reveal
 * one at a time; a running task's title shimmers until its steps land. Once
 * everything is done the log collapses to one line you can reopen.
 *
 * tasks: [{ id, title, status: 'running' | 'done' | 'error', steps: [{ id, text, chips?: [] }] }]
 */
function TaskList({ tasks = [], running = false, since, summary, className }) {
  const [open, setOpen] = useState(true);
  const failed = tasks.some((t) => t.status === "error");
  const finished = !running && tasks.length > 0;
  const isOpen = open || running;
  return (
    <div data-slot="task-list" className={cn("text-[13px]", className)}>
      {finished && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={isOpen}
          className="mb-1.5 flex items-center gap-2 text-[12px] font-semibold text-muted-foreground outline-hidden hover:text-foreground focus-visible:underline"
        >
          {failed ? <OctagonXIcon className="size-3.5 text-destructive-ink" /> : <CheckIcon className="size-3.5 text-success-ink" strokeWidth={3} />}
          {summary || `${tasks.length} task${tasks.length === 1 ? "" : "s"}`}
          <ChevronDownIcon className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
        </button>
      )}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
            <AnimatePresence initial={false}>
              {tasks.map((task) => (
                <motion.li key={task.id} {...reveal} className="overflow-hidden">
                  <p className={cn("font-semibold", task.status === "running" ? "text-shimmer" : task.status === "error" ? "text-destructive-ink" : "text-foreground")}>
                    {task.title}
                  </p>
                  {task.steps?.length > 0 && (
                    <ul className="mt-1 ml-[3px] space-y-1 border-l border-border pl-3">
                      <AnimatePresence initial={false}>
                        {task.steps.map((step) => (
                          <motion.li key={step.id} {...reveal} className="flex flex-wrap items-center gap-1.5 overflow-hidden text-muted-foreground">
                            <span>{step.text}</span>
                            {step.chips?.map((c, i) => <ResourceChip key={i} icon={c.icon}>{c.label}</ResourceChip>)}
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
      {running && <AgentThinking className="mt-2.5" variant="spin" label="Working" since={since} />}
    </div>
  );
}

export { TaskList, ResourceChip };
