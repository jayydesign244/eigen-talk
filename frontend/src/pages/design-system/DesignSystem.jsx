import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftIcon, ArrowRightIcon, AudioLinesIcon, ColumnsIcon, MenuIcon, MoonIcon, SearchIcon, SquareIcon, SunIcon } from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'
import { ease } from '@/lib/motion'
import { PreviewModeContext } from './kit'
import { FOUNDATIONS, OverviewPage } from './foundations'
import { ACTION_DEMOS } from './demos-actions'
import { FORM_DEMOS } from './demos-forms'
import { OVERLAY_DEMOS } from './demos-overlays'
import { NAVIGATION_DEMOS } from './demos-navigation'
import { DATA_DEMOS } from './demos-data'
import { CHAT_DEMOS } from './demos-chat'
import { AGENT_DEMOS } from './demos-agents'

const COMPONENTS = [...ACTION_DEMOS, ...FORM_DEMOS, ...OVERLAY_DEMOS, ...NAVIGATION_DEMOS, ...DATA_DEMOS, ...CHAT_DEMOS, ...AGENT_DEMOS]
  .sort((a, b) => a.title.localeCompare(b.title))

const ORDER = [
  { to: '/design-system', title: 'Overview' },
  ...FOUNDATIONS.map((f) => ({ to: `/design-system/foundations/${f.slug}`, title: f.title })),
  ...COMPONENTS.map((c) => ({ to: `/design-system/components/${c.slug}`, title: c.title })),
]

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex h-8 items-center px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          isActive && 'bg-foreground font-bold text-background hover:bg-foreground hover:text-background'
        )
      }
    >
      {children}
    </NavLink>
  )
}

function Nav({ onNavigate }) {
  const [q, setQ] = useState('')
  const inputRef = useRef(null)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const filtered = COMPONENTS.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()))
  return (
    <nav className="flex h-full flex-col" onClick={(e) => e.target.closest('a') && onNavigate?.()}>
      <Link to="/design-system" className={cn('flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-4', onNavigate && 'pr-14')}>
        <span className="flex size-7 items-center justify-center bg-foreground text-background"><AudioLinesIcon className="size-4" /></span>
        <span className="font-display text-lg leading-none">Sonicly</span>
        <span className="text-caps ml-auto text-[9px] text-muted-foreground">DS v1</span>
      </Link>
      <div className="border-b border-border p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a component" className="h-9 pl-9 pr-9" aria-label="Find a component" />
          <Kbd className="absolute top-1/2 right-2.5 -translate-y-1/2">/</Kbd>
        </div>
      </div>
      <div className="flex-1 space-y-6 overflow-y-auto px-2 py-4">
        {!q && (
          <div className="space-y-0.5">
            <p className="text-caps px-3 pb-2 text-[9px] text-muted-foreground">Start</p>
            <NavItem to="/design-system" end>Overview</NavItem>
          </div>
        )}
        {!q && (
          <div className="space-y-0.5">
            <p className="text-caps px-3 pb-2 text-[9px] text-muted-foreground">Foundations</p>
            {FOUNDATIONS.map((f) => <NavItem key={f.slug} to={`/design-system/foundations/${f.slug}`}>{f.title}</NavItem>)}
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-caps flex justify-between px-3 pb-2 text-[9px] text-muted-foreground">
            Components <span className="tabular">{filtered.length}</span>
          </p>
          {filtered.map((c) => <NavItem key={c.slug} to={`/design-system/components/${c.slug}`}>{c.title}</NavItem>)}
          {!filtered.length && <p className="px-3 py-2 text-[13px] text-muted-foreground">No match for “{q}”.</p>}
        </div>
      </div>
    </nav>
  )
}

function PrevNext() {
  const { pathname } = useLocation()
  const i = ORDER.findIndex((o) => o.to === pathname.replace(/\/$/, ''))
  if (i < 0) return null
  const prev = ORDER[i - 1]
  const next = ORDER[i + 1]
  return (
    <div className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
      {prev ? (
        <Link to={prev.to} className="group border border-border p-4 transition-colors hover:border-foreground">
          <span className="text-caps flex items-center gap-1.5 text-[9px] text-muted-foreground"><ArrowLeftIcon className="size-3" />Previous</span>
          <span className="mt-1 block font-bold">{prev.title}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link to={next.to} className="group border border-border p-4 text-right transition-colors hover:border-foreground">
          <span className="text-caps flex items-center justify-end gap-1.5 text-[9px] text-muted-foreground">Next<ArrowRightIcon className="size-3" /></span>
          <span className="mt-1 block font-bold">{next.title}</span>
        </Link>
      )}
    </div>
  )
}

function ComponentRoute() {
  const { slug } = useParams()
  const entry = COMPONENTS.find((c) => c.slug === slug)
  if (!entry) return <Navigate to="/design-system" replace />
  return <entry.Page />
}

function FoundationRoute() {
  const { slug } = useParams()
  const entry = FOUNDATIONS.find((f) => f.slug === slug)
  if (!entry) return <Navigate to="/design-system" replace />
  return <entry.Page />
}

export default function DesignSystem() {
  const location = useLocation()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('sonicly-ds-preview') || 'split' } catch { return 'split' }
  })
  const [navOpen, setNavOpen] = useState(false)
  const mainRef = useRef(null)
  const ctx = useMemo(() => ({ mode }), [mode])

  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }) }, [location.pathname])
  useEffect(() => {
    try { localStorage.setItem('sonicly-ds-preview', mode) } catch { /* ignore */ }
  }, [mode])
  useEffect(() => { document.title = 'Sonicly — Design System' }, [])

  return (
    <PreviewModeContext.Provider value={ctx}>
      <div className="flex h-dvh overflow-hidden bg-background">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
          <Nav />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 lg:px-8">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation"><MenuIcon /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0" aria-describedby={undefined}>
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Nav onNavigate={() => setNavOpen(false)} />
              </SheetContent>
            </Sheet>
            <span className="text-caps hidden text-muted-foreground sm:inline">Design system</span>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-caps hidden text-[9px] text-muted-foreground md:inline">Previews</span>
              <ToggleGroup type="single" variant="outline" size="sm" value={mode} onValueChange={(v) => v && setMode(v)} aria-label="Preview mode">
                <ToggleGroupItem value="split" aria-label="Dark and light side by side"><ColumnsIcon />Both</ToggleGroupItem>
                <ToggleGroupItem value="page" aria-label="Follow page theme"><SquareIcon />Page</ToggleGroupItem>
              </ToggleGroup>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon-sm" onClick={toggleTheme} aria-label="Toggle theme">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={resolvedTheme}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex"
                      >
                        {resolvedTheme === 'dark' ? <MoonIcon className="size-4" /> : <SunIcon className="size-4" />}
                      </motion.span>
                    </AnimatePresence>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Switch to {resolvedTheme === 'dark' ? 'light' : 'dark'}</TooltipContent>
              </Tooltip>
              <Button asChild size="sm" className="hidden sm:inline-flex"><Link to="/dashboard">Open app</Link></Button>
            </div>
          </header>
          <main ref={mainRef} className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.22, ease: ease.out }}
                className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14"
              >
                <Routes location={location}>
                  <Route index element={<OverviewPage counts={{ components: COMPONENTS.length, foundations: FOUNDATIONS.length }} />} />
                  <Route path="foundations/:slug" element={<FoundationRoute />} />
                  <Route path="components/:slug" element={<ComponentRoute />} />
                  <Route path="*" element={<Navigate to="/design-system" replace />} />
                </Routes>
                <PrevNext />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </PreviewModeContext.Provider>
  )
}
