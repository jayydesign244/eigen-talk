import { createContext, useContext, useState } from 'react'
import { motion } from 'motion/react'
import { CheckIcon, CopyIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { rise, stagger } from '@/lib/motion'

/** Which theme(s) previews render in: follow the app, or show both side by side. */
export const PreviewModeContext = createContext({ mode: 'split' })
export const usePreviewMode = () => useContext(PreviewModeContext)

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <motion.header variants={stagger(0.06)} initial="hidden" animate="show" className="mb-10 max-w-3xl">
      {eyebrow && (
        <motion.p variants={rise} className="text-caps mb-4 text-brand-ink">
          {eyebrow}
        </motion.p>
      )}
      <motion.h1 variants={rise} className="font-display text-5xl leading-[1.02] tracking-tight md:text-6xl">
        {title}
      </motion.h1>
      {description && (
        <motion.p variants={rise} className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
          {description}
        </motion.p>
      )}
      {children && <motion.div variants={rise} className="mt-6">{children}</motion.div>}
    </motion.header>
  )
}

export function Section({ title, description, children, className }) {
  return (
    <motion.section
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className={cn('mb-12', className)}
    >
      <div className="mb-4 flex items-end justify-between gap-4 border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  )
}

function ThemeScope({ theme, children, className }) {
  return (
    <div className={cn(theme, 'relative bg-background text-foreground', className)}>
      <span className="text-caps pointer-events-none absolute top-3 right-3 text-[9px] text-muted-foreground/70">
        {theme}
      </span>
      {children}
    </div>
  )
}

/**
 * A preview canvas. In "split" mode the same content renders twice — once in
 * a dark scope and once in a light scope — so every state is visible in both
 * themes at the same time.
 */
export function Preview({ children, className, contentClassName, center = true, padded = true, single = false }) {
  const { mode: pageMode } = usePreviewMode()
  // `single` renders once (for demos whose open/closed state is shared).
  const mode = single ? 'page' : pageMode
  // children may be a function of the scope name, so ids stay unique when
  // the same demo renders twice (dark + light).
  const body = (scope) => (
    <div
      className={cn(
        'flex min-h-36 flex-wrap gap-5',
        center && 'items-center justify-center',
        padded && 'p-8',
        contentClassName
      )}
    >
      {typeof children === 'function' ? children(scope) : children}
    </div>
  )
  return (
    <div className={cn('overflow-hidden border border-border', className)}>
      {mode === 'split' ? (
        <div className="grid divide-border lg:grid-cols-2 lg:divide-x max-lg:divide-y">
          <ThemeScope theme="dark">{body('dark')}</ThemeScope>
          <ThemeScope theme="light">{body('light')}</ThemeScope>
        </div>
      ) : (
        <div className="bg-background">{body('page')}</div>
      )}
    </div>
  )
}

/** A labelled grid of states: Default / Hover / Focus / Pressed / Disabled … */
export function StateGrid({ states, columns }) {
  return (
    <div
      className="grid w-full gap-x-6 gap-y-5"
      style={{ gridTemplateColumns: `repeat(${columns || Math.min(states.length, 4)}, minmax(0, 1fr))` }}
    >
      {states.map(({ label, node }) => (
        <div key={label} className="flex min-w-0 flex-col items-start gap-2.5">
          <span className="text-caps text-[9px] text-muted-foreground">{label}</span>
          {node}
        </div>
      ))}
    </div>
  )
}

export function Row({ label, children, className }) {
  return (
    <div className={cn('flex w-full flex-wrap items-center gap-4', className)}>
      {label && <span className="text-caps w-24 shrink-0 text-[9px] text-muted-foreground">{label}</span>}
      {children}
    </div>
  )
}

export function Usage({ dos = [], donts = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border border-border border-t-4 border-t-success bg-card p-5">
        <p className="text-caps mb-3 text-success-ink">Do</p>
        <ul className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          {dos.map((d) => (
            <li key={d} className="flex gap-2"><CheckIcon className="mt-0.5 size-3.5 shrink-0 text-success-ink" strokeWidth={3} />{d}</li>
          ))}
        </ul>
      </div>
      <div className="border border-border border-t-4 border-t-destructive bg-card p-5">
        <p className="text-caps mb-3 text-destructive-ink">Don&rsquo;t</p>
        <ul className="space-y-2 text-[13px] leading-relaxed text-muted-foreground">
          {donts.map((d) => (
            <li key={d} className="flex gap-2"><span className="mt-[7px] h-0.5 w-2.5 shrink-0 bg-destructive" />{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function CodeLine({ children }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex items-center justify-between gap-3 border border-border bg-muted px-3.5 py-2.5 font-mono text-[12px]">
      <code className="truncate">{children}</code>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard?.writeText(children)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        }}
        className="inline-flex size-7 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Copy"
      >
        {copied ? <CheckIcon className="size-3.5 text-success-ink" /> : <CopyIcon className="size-3.5" />}
      </button>
    </div>
  )
}

/** Props table for a component's main options. */
export function PropsTable({ rows }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-left">
            {['Prop', 'Values', 'Default'].map((h) => (
              <th key={h} className="text-caps px-3 py-2.5 text-[9px] text-muted-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([prop, values, def]) => (
            <tr key={prop} className="border-b border-border last:border-0">
              <td className="px-3 py-2.5 font-mono text-[12px] font-bold">{prop}</td>
              <td className="px-3 py-2.5 font-mono text-[12px] text-muted-foreground">{values}</td>
              <td className="px-3 py-2.5 font-mono text-[12px]">{def}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Marks components added in the latest batch so they're easy to find. */
export function NewBadge({ className }) {
  return (
    <span className={cn('inline-flex animate-pop items-center bg-brand px-1.5 py-[2px] text-[9px] leading-none font-extrabold tracking-[0.12em] text-brand-foreground uppercase', className)}>
      New
    </span>
  )
}
