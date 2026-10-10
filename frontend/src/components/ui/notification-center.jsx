import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BellOffIcon, CheckCheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TONES = {
  default: "bg-foreground text-background",
  brand: "bg-brand text-brand-foreground",
  success: "bg-success text-background",
  warning: "bg-warning text-background",
  destructive: "bg-destructive text-destructive-foreground",
};

/**
 * Activity inbox: filter tabs with counts, grouped timeline, unread markers,
 * avatar or status visuals, optional inline actions, mark-all-read and an
 * empty state.
 *
 * items: [{ id, title, body?, time, group, unread?, category?, avatar?: { src, initials },
 *           icon?, tone?, actions?: [{ label, onClick, primary? }] }]
 * filters: [{ value, label, match: (item) => boolean }]
 */
function NotificationCenter({ items = [], filters, onMarkAllRead, onItemClick, title = "Notifications", className }) {
  const tabs = filters || [{ value: "all", label: "All", match: () => true }];
  const [tab, setTab] = useState(tabs[0].value);
  const current = tabs.find((t) => t.value === tab) || tabs[0];
  const unread = items.filter((i) => i.unread).length;

  const groups = useMemo(() => {
    const visible = items.filter(current.match);
    const map = new Map();
    for (const it of visible) {
      if (!map.has(it.group)) map.set(it.group, []);
      map.get(it.group).push(it);
    }
    return [...map.entries()];
  }, [items, current]);

  return (
    <div data-slot="notification-center" className={cn("flex w-full max-w-sm flex-col rounded-[inherit] bg-card", className)}>
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-[15px] font-bold tracking-tight">{title}</p>
          <p className="text-[12px] text-muted-foreground">{unread ? `${unread} unread` : "All caught up"}</p>
        </div>
        {onMarkAllRead && (
          <Button variant="ghost" size="xs" onClick={onMarkAllRead} disabled={!unread}><CheckCheckIcon />Mark all read</Button>
        )}
      </div>

      {tabs.length > 1 && (
        <div role="tablist" className="mx-4 mt-3 flex gap-0.5 self-start rounded-full bg-chip p-0.5">
          {tabs.map((t) => {
            const count = items.filter(t.match).length;
            const on = t.value === tab;
            return (
              <button
                key={t.value}
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.value)}
                className={cn("relative isolate flex h-7 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring", on ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                {t.label}
                <span className="rounded-full bg-foreground/[0.06] px-1.5 font-mono text-[10px] tabular">{count}</span>
                {on && <motion.span layoutId="notification-tab" className="absolute inset-0 -z-10 rounded-full bg-card shadow-soft dark:bg-accent" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="max-h-[420px] min-h-40 overflow-y-auto px-2 py-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {groups.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center px-6 py-10 text-center">
              <span className="surface-tile flex size-11 items-center justify-center rounded-full"><BellOffIcon className="size-4 text-muted-foreground" /></span>
              <p className="mt-3 text-sm font-bold">Nothing here yet</p>
              <p className="mt-1 text-[12px] text-muted-foreground">New activity will show up here.</p>
            </motion.div>
          ) : (
            groups.map(([group, list]) => (
              <motion.section key={group} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-caps px-2 pt-2 pb-1.5 text-[10px] text-label">{group}</p>
                <ul>
                  {list.map((it, i) => {
                    const Icon = it.icon;
                    return (
                      <motion.li
                        key={it.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => onItemClick?.(it)}
                        className={cn("relative flex gap-3 rounded-md px-2 py-2.5 transition-colors", onItemClick && "cursor-pointer hover:bg-accent", it.unread && "bg-brand-soft/40")}
                      >
                        {it.avatar ? (
                          <Avatar>
                            {it.avatar.src && <AvatarImage src={it.avatar.src} alt="" />}
                            <AvatarFallback>{it.avatar.initials}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", TONES[it.tone || "default"])}>
                            {Icon && <Icon className="size-4" />}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <p className="min-w-0 flex-1 text-[13px] leading-snug font-bold">{it.title}</p>
                            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{it.time}</span>
                            {it.unread && <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
                          </div>
                          {it.body && <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{it.body}</p>}
                          {it.actions?.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {it.actions.map((a) => (
                                <Button key={a.label} size="xs" variant={a.primary ? "default" : "outline"} onClick={(e) => { e.stopPropagation(); a.onClick?.() }}>
                                  {a.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </motion.section>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export { NotificationCenter };
