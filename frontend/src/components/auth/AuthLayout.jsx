import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { MoonIcon, SparklesIcon, SunIcon } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { generateBars } from '@/components/audio/Waveform'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useTheme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'
import { ease, rise, stagger } from '@/lib/motion'

const PROMPT = 'Remove the ums and make my voice warmer.'
const BARS = generateBars(7, 56)
// Bars that represent filler words in the demo clip.
const FILLERS = new Set([6, 7, 15, 16, 17, 29, 30, 41, 42, 49])

/**
 * A looping, self-running demo of the product: a prompt types itself, the
 * filler words light up and fall out of the waveform, the quality score
 * climbs. Pauses on the final frame when reduced motion is requested.
 */
function Showcase() {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState(reduce ? 'done' : 'typing') // typing → working → cutting → done
  const [typed, setTyped] = useState(reduce ? PROMPT.length : 0)
  const [cycle, setCycle] = useState(0)
  const score = useMotionValue(reduce ? 87 : 42)
  const scoreText = useTransform(score, (v) => Math.round(v))

  useEffect(() => {
    if (reduce) return undefined
    const timers = []
    setPhase('typing')
    setTyped(0)
    score.set(42)
    let i = 0
    const typeTimer = setInterval(() => {
      i += 1
      setTyped(i)
      if (i >= PROMPT.length) clearInterval(typeTimer)
    }, 38)
    timers.push(setTimeout(() => setPhase('working'), PROMPT.length * 38 + 350))
    timers.push(setTimeout(() => setPhase('cutting'), PROMPT.length * 38 + 1500))
    timers.push(setTimeout(() => {
      setPhase('done')
      animate(score, 87, { duration: 1.1, ease: ease.out })
    }, PROMPT.length * 38 + 2500))
    timers.push(setTimeout(() => setCycle((c) => c + 1), PROMPT.length * 38 + 7200))
    return () => { clearInterval(typeTimer); timers.forEach(clearTimeout) }
  }, [cycle, reduce, score])

  const cut = phase === 'cutting' || phase === 'done'
  const showFillers = phase === 'working' || phase === 'cutting'

  return (
    <div className="w-full max-w-[460px] space-y-4">
      {/* Prompt */}
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-foreground px-4 py-3 text-[15px] leading-snug text-background">
          {PROMPT.slice(0, typed)}
          {phase === 'typing' && <span className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-blink bg-background" />}
        </div>
      </div>

      {/* Result card */}
      <div className="border border-border bg-card p-5 pop-float-lg">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-caps flex items-center gap-2 text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground"><SparklesIcon className="size-3" /></span>
            ep42_interview.wav
          </span>
          <AnimatePresence mode="wait" initial={false}>
            {phase === 'working' || phase === 'cutting' ? (
              <motion.span key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[12px] font-semibold text-muted-foreground">
                <Spinner className="size-3.5 text-brand" />Editing
              </motion.span>
            ) : phase === 'done' ? (
              <motion.span key="d" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-caps text-success-ink">
                10 fillers removed
              </motion.span>
            ) : <span key="i" className="text-caps text-muted-foreground/60">Original</span>}
          </AnimatePresence>
        </div>

        <div className="flex h-20 items-center gap-[3px]" aria-hidden="true">
          {BARS.map((h, i) => {
            const filler = FILLERS.has(i)
            return (
              <motion.span
                key={`${cycle}-${i}`}
                className={cn('min-w-0 bg-current', filler && showFillers ? 'text-warning' : 'text-foreground')}
                initial={false}
                animate={{
                  height: filler && cut ? '0%' : `${Math.max(8, h * 100)}%`,
                  flexGrow: filler && cut ? 0.0001 : 1,
                  opacity: filler && cut ? 0 : phase === 'typing' ? 0.45 : 1,
                }}
                transition={{ duration: 0.45, ease: ease.out, delay: filler && cut ? (i % 10) * 0.025 : 0 }}
                style={{ flexBasis: 0 }}
              />
            )
          })}
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
          <div>
            <p className="text-caps text-muted-foreground">Quality score</p>
            <p className="mt-1 text-5xl leading-none font-extrabold tracking-tight tabular">
              <motion.span>{scoreText}</motion.span>
              <span className="text-lg text-muted-foreground">/100</span>
            </p>
          </div>
          <div className="text-right font-mono text-[12px] text-muted-foreground tabular">
            <p>42:18 → <span className={cn('transition-colors', cut && 'text-foreground')}>{cut ? '40:51' : '42:18'}</span></p>
            <p>−16 LUFS</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme()
  return (
    <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}>
      {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

/** Split auth screen: the form on the left, a live product demo on the right. */
export function AuthLayout({ children, footer }) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
      <div className="flex min-h-dvh flex-col px-6 py-6 sm:px-10">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Sonicly home"><Logo /></Link>
          <ThemeToggle />
        </header>
        <main className="flex flex-1 items-center justify-center py-10">
          <motion.div variants={stagger(0.05)} initial="hidden" animate="show" className="w-full max-w-[380px]">
            {children}
          </motion.div>
        </main>
        <footer className="text-[12px] leading-relaxed text-muted-foreground">{footer}</footer>
      </div>

      <aside className="dark relative hidden overflow-hidden border-l border-border bg-background text-foreground lg:flex lg:flex-col">
        <div className="hatch pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex flex-1 flex-col justify-between p-12">
          <motion.div variants={rise} initial="hidden" animate="show">
            <p className="text-caps text-brand-ink">AI audio editor</p>
            <h2 className="mt-4 max-w-md font-display text-5xl leading-[1.04]">Say what you want. Hear it happen.</h2>
          </motion.div>
          <div className="flex flex-1 items-center justify-center py-10">
            <Showcase />
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
            {['Edit audio by editing text', 'Undo any change', 'No watermarks, ever'].map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="size-1.5 bg-brand" />{t}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

/** Animated child wrapper so form sections rise in sequence. */
export function AuthItem({ children, className }) {
  return <motion.div variants={rise} className={className}>{children}</motion.div>
}

export function SocialIcon({ provider }) {
  if (provider === 'google') {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    )
  }
  if (provider === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className="size-[18px]" fill="#1877F2" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  )
}

export const SOCIAL_PROVIDERS = [
  { provider: 'google', label: 'Google' },
  { provider: 'apple', label: 'Apple' },
  { provider: 'facebook', label: 'Facebook' },
]
