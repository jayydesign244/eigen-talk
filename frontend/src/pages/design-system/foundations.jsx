import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Kbd } from '@/components/ui/kbd'
import { PageHeader, Preview, Section, Usage } from './kit'
import { land, spring, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* ─── Overview ─────────────────────────────────────────────────── */

const PRINCIPLES = [
  ['Calm and monochrome', 'White pages, ink type and hairlines at 10% do the work. Colour is a signal, not decoration.'],
  ['One accent, used rarely', 'Sonic aqua marks focus, live states and the single most important number on a screen.'],
  ['Soft, not flat', 'Cards round to 16px, buttons to 8px, chips to pills. Depth comes from gentle gradients and two soft shadows.'],
  ['One key still clicks', 'The raised key keeps NeoPOP’s hard 3px edge and sinks into it when pressed — save it for the moment that matters.'],
  ['Serif to speak, sans to work', 'Fraunces for headlines that set the tone; Plus Jakarta Sans for everything you read and use.'],
  ['Motion explains', 'Things rise in, land, and snap — always under 450ms, always respecting reduced motion.'],
]

export function OverviewPage({ counts }) {
  return (
    <>
      <PageHeader
        eyebrow="Sonicly Design System · v1"
        title={<>Soft to the touch.<br />Calm like a studio.</>}
        description="Every shadcn/ui component, rebuilt in CRED's 2026 language — white space, rounded cards on hairlines, pill chips, gradient icon tiles and a serif voice — with Sonicly's own accent. Light and dark are both first-class."
      >
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild variant="brand" size="lg"><Link to="/design-system/components/button">Browse components</Link></Button>
          <span className="text-[13px] text-muted-foreground">
            <span className="font-bold text-foreground tabular">{counts.components}</span> components ·{' '}
            <span className="font-bold text-foreground tabular">{counts.foundations}</span> foundations
          </span>
        </div>
      </PageHeader>
      <Section title="Principles">
        <motion.div
          variants={stagger(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {PRINCIPLES.map(([title, body], i) => (
            <motion.div key={title} variants={land}>
              <Card variant="elevated" className="h-full">
                <CardHeader>
                  <span className="font-mono text-[11px] text-muted-foreground tabular">0{i + 1}</span>
                  <CardTitle className="text-[17px]">{title}</CardTitle>
                  <CardDescription>{body}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Section>
      <Section title="The signature" description="The block CTA, the dark pill, the ice chip and the raised key — try pressing them.">
        <Preview>
          <Button size="lg">Proceed</Button>
          <Button size="lg" variant="pill">Check now</Button>
          <Button variant="chip">Explore</Button>
          <Button variant="gold">Play now</Button>
          <Card variant="interactive" className="w-56 py-4">
            <CardContent className="px-4">
              <p className="text-caps text-label">Interactive card</p>
              <p className="mt-2 text-sm font-bold">Lifts on hover, settles when pressed.</p>
            </CardContent>
          </Card>
        </Preview>
      </Section>
    </>
  )
}

/* ─── Colour ───────────────────────────────────────────────────── */

function toHex(rgb) {
  const m = rgb.match(/\d+(\.\d+)?/g)
  if (!m) return rgb
  const [r, g, b, a] = m.map(Number)
  const hex = '#' + [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('').toUpperCase()
  return a !== undefined && a < 1 ? `${hex} · ${Math.round(a * 100)}%` : hex
}

function Swatch({ token, name, note, fg }) {
  const ref = useRef(null)
  const [hex, setHex] = useState('')
  useLayoutEffect(() => {
    const read = () => ref.current && setHex(toHex(getComputedStyle(ref.current).backgroundColor))
    read()
    const obs = new MutationObserver(read)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return (
    <div className="min-w-0">
      <div
        ref={ref}
        className="flex h-20 items-end rounded-lg border-[0.8px] border-border p-2.5"
        style={{ background: `var(--${token})`, color: fg ? `var(--${fg})` : undefined }}
      >
        {fg && <span className="text-sm font-bold">Aa</span>}
      </div>
      <p className="mt-2 truncate text-[13px] font-bold">{name}</p>
      <p className="truncate font-mono text-[11px] text-muted-foreground">--{token}</p>
      <p className="font-mono text-[11px] text-muted-foreground tabular">{hex}</p>
      {note && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{note}</p>}
    </div>
  )
}

const COLOR_GROUPS = [
  ['Surfaces', 'The page, the cards on it, and the layers that float above.', [
    ['background', 'Background', 'foreground'],
    ['card', 'Card', 'card-foreground'],
    ['popover', 'Popover', 'popover-foreground'],
    ['muted', 'Muted', 'muted-foreground'],
    ['surface-2', 'Surface 2'],
    ['accent', 'Hover surface', 'accent-foreground'],
  ]],
  ['Content & lines', 'Text colours and the rules that separate things.', [
    ['foreground', 'Foreground'],
    ['muted-foreground', 'Muted text'],
    ['border', 'Border'],
    ['input', 'Input border'],
    ['border-strong', 'Strong border'],
    ['ring', 'Focus ring'],
    ['caret', 'Text cursor', null, 'CRED\'s blue cursor.'],
  ]],
  ['Action', 'Keys people press. Primary inverts with the theme.', [
    ['primary', 'Primary', 'primary-foreground'],
    ['secondary', 'Secondary', 'secondary-foreground'],
    ['brand', 'Sonic (brand)', 'brand-foreground', 'Use once per screen at most.'],
    ['brand-soft', 'Sonic soft', 'foreground'],
    ['brand-ink', 'Sonic ink', null, 'Brand-coloured text that passes contrast.'],
    ['disabled', 'Disabled key', 'disabled-foreground', 'CRED\'s grey key for any disabled solid button.'],
  ]],
  ['Status', 'Never reused as the accent. Each has a solid, a soft and an ink tone.', [
    ['success', 'Success'], ['success-soft', 'Success soft', 'success-ink'],
    ['warning', 'Warning'], ['warning-soft', 'Warning soft', 'warning-ink'],
    ['destructive', 'Danger'], ['destructive-soft', 'Danger soft', 'destructive-ink'],
    ['info', 'Info'], ['info-soft', 'Info soft', 'info-ink'],
  ]],
  ['Plunk edges', 'The two faces of every raised element: right edge lighter, bottom edge darker.', [
    ['edge-primary-r', 'Primary · right'], ['edge-primary-b', 'Primary · bottom'],
    ['edge-brand-r', 'Brand · right'], ['edge-brand-b', 'Brand · bottom'],
    ['edge-card-r', 'Card · right'], ['edge-card-b', 'Card · bottom'],
    ['edge-destructive-r', 'Danger · right'], ['edge-destructive-b', 'Danger · bottom'],
    ['edge-disabled-r', 'Disabled · right'], ['edge-disabled-b', 'Disabled · bottom'],
  ]],
  ['Data', 'Chart series, drawn from the NeoPOP accent palette.', [
    ['chart-1', 'Series 1'], ['chart-2', 'Series 2'], ['chart-3', 'Series 3'], ['chart-4', 'Series 4'], ['chart-5', 'Series 5'],
  ]],
]

export function ColorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Colour"
        description="White pages, ink type and hairlines at 10% of the ink colour do almost all the work, as in CRED 2026; a cool grey-blue (#E5ECF0) and ice gradients add the softness. Sonic aqua is the one accent; status colours come from NeoPOP's main palette and are never used decoratively."
      />
      {COLOR_GROUPS.map(([title, description, tokens]) => (
        <Section key={title} title={title} description={description}>
          <Preview center={false} contentClassName="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
            {tokens.map(([token, name, fg, note]) => (
              <Swatch key={token} token={token} name={name} fg={fg} note={note} />
            ))}
          </Preview>
        </Section>
      ))}
      <Section title="Sonic scale">
        <div className="grid grid-cols-4 sm:grid-cols-8">
          {[100, 200, 300, 400, 500, 600, 700, 800].map((n) => (
            <div key={n} className="h-16 p-2" style={{ background: `var(--color-sonic-${n})` }}>
              <span className={cn('font-mono text-[11px] font-bold', n >= 600 ? 'text-white' : 'text-pop-black')}>{n}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Usage">
        <Usage
          dos={[
            'Let black/white carry hierarchy; reach for colour only to signal.',
            'Pair every status colour with an icon or word.',
            'Use brand-ink (not brand) for aqua text on light surfaces.',
          ]}
          donts={[
            'Put two accent-coloured keys on one screen.',
            'Use status red for anything that is not destructive or an error.',
            'Add blurred drop shadows — depth is always a solid edge.',
          ]}
        />
      </Section>
    </>
  )
}

/* ─── Typography ───────────────────────────────────────────────── */

const TYPE_SCALE = [
  ['Display', 'font-display text-6xl leading-[1.2]', 'Fraunces 60/72', 'Sounds exactly right.'],
  ['Heading 1', 'font-display text-[40px] leading-[1.25]', 'Fraunces 40/50', 'Your episodes, cleaned up'],
  ['Heading 2', 'font-display text-3xl leading-[1.25]', 'Fraunces 30/38', 'Recent projects'],
  ['Heading 3', 'text-xl font-bold leading-[1.25] tracking-[0.01em]', 'Jakarta Bold 20/25 · 0.01em', 'Export settings'],
  ['Heading 4', 'text-base font-bold leading-[1.25] tracking-[0.01em]', 'Jakarta Bold 16/20 · 0.01em', 'Version history'],
  ['Body large', 'text-[15px] leading-normal', 'Jakarta Medium 15/22 · 0.02em', 'Describe the change in plain English and Sonicly handles the rest.'],
  ['Body', 'text-sm leading-normal', 'Jakarta Medium 14/21 · 0.02em', 'Removed 34 filler words and balanced the loudness to −16 LUFS.'],
  ['Small', 'text-xs leading-normal text-muted-foreground', 'Jakarta Medium 12/18 · 0.02em', 'Edited 2 hours ago · 12:04'],
  ['Caps label', 'text-caps', 'Jakarta Bold 11 · 0.2em', 'Quality score'],
  ['Number', 'text-4xl font-extrabold tracking-tight tabular', 'Jakarta ExtraBold · tabular', '87'],
  ['Timecode', 'font-mono text-sm tabular', 'Overpass Mono 14', '00:03:42.180'],
]

export function TypographyFoundationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Type"
        description="Fraunces stands in for CRED's Denton (a variable, high-contrast serif) and Plus Jakarta Sans for Gilroy (geometric, wide). Overpass Mono is the same mono CRED uses, reserved for timecodes and keys. All three are free to use commercially."
      />
      <Section title="Scale">
        <Preview center={false} padded={false} contentClassName="flex-col gap-0">
          {TYPE_SCALE.map(([name, cls, spec, sample]) => (
            <div key={name} className="grid w-full items-baseline gap-2 border-b border-border px-6 py-5 last:border-0 md:grid-cols-[160px_1fr]">
              <div>
                <p className="text-[13px] font-bold">{name}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{spec}</p>
              </div>
              <p className={cn(cls, 'min-w-0 truncate')}>{sample}</p>
            </div>
          ))}
        </Preview>
      </Section>
      <Section title="Typefaces">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['Fraunces', 'font-display', 'Display & headings', 'Aa'],
            ['Plus Jakarta Sans', 'font-sans font-extrabold', 'Interface & reading', 'Aa'],
            ['Overpass Mono', 'font-mono font-bold', 'Timecodes & keys', '00:42'],
          ].map(([name, cls, role, glyph]) => (
            <Card key={name} variant="elevated" className="py-6">
              <CardContent className="px-6">
                <p className={cn(cls, 'text-7xl leading-none')}>{glyph}</p>
                <p className="mt-6 text-[15px] font-bold">{name}</p>
                <p className="text-[13px] text-muted-foreground">{role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── Shape & elevation ────────────────────────────────────────── */

export function ElevationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Shape & depth"
        description="CRED 2026 is soft: cards round to 16px on a 0.8px hairline, buttons to 8px, icon tiles to 10px and chips to full pills. Depth comes from gentle gradients and two soft shadows; only the raised key keeps a hard 3px edge."
      />
      <Section title="Levels">
        <Preview contentClassName="gap-10">
          {[
            ['Flat', 'Dense lists, tables, inputs', <Card key="f" className="w-44 py-6"><CardContent className="px-5 text-sm font-bold">Level 0</CardContent></Card>],
            ['Elevated', 'Cards that group content', <Card key="e" variant="elevated" className="w-44 py-6"><CardContent className="px-5 text-sm font-bold">Level 1</CardContent></Card>],
            ['Interactive', 'Anything clickable', <Card key="i" variant="interactive" className="w-44 py-6"><CardContent className="px-5 text-sm font-bold">Level 1 · press me</CardContent></Card>],
            ['Floating', 'Menus, popovers, dialogs', <div key="p" className="w-44 border bg-popover px-5 py-6 text-sm font-bold pop-float">Level 2</div>],
            ['Pop', 'The one dark pill CTA', <div key="d" className="flex h-[76px] w-44 items-center justify-center rounded-full surface-pop text-sm font-semibold">Level 3</div>],
          ].map(([name, note, node]) => (
            <div key={name} className="flex flex-col gap-3">
              {node}
              <div>
                <p className="text-[13px] font-bold">{name}</p>
                <p className="text-[12px] text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </Preview>
      </Section>
      <Section title="Surfaces" description="The three fills from CRED's templates: the circular icon tile, the ice pill / square tile and the dark pill.">
        <Preview contentClassName="gap-10">
          {[
            ['Tile', 'Circle 44 · white → warm white', <div key="t" className="size-11 rounded-full surface-tile" />],
            ['Ice', 'Square 44 · white → ice, cool hairline', <div key="i" className="size-11 rounded-lg surface-pill" />],
            ['Chip', 'Pill · ice with a light bottom edge', <span key="c" className="inline-flex h-9 items-center rounded-full px-4 text-[13px] font-semibold surface-pill shadow-[0_2px_0_var(--pill-border)]">garage</span>],
            ['Pop', 'Pill · graphite, rim, sheen', <span key="p" className="inline-flex h-10 items-center rounded-full px-5 text-[13px] font-semibold surface-pop">Check now</span>],
          ].map(([name, note, node]) => (
            <div key={name} className="flex flex-col items-start gap-3">
              {node}
              <div>
                <p className="text-[13px] font-bold">{name}</p>
                <p className="text-[12px] text-muted-foreground">{note}</p>
              </div>
            </div>
          ))}
        </Preview>
      </Section>
      <Section title="Raised key states" description="The one hard edge left: rest → press collapses the 3px edge in 50ms and the face drops into the gap.">
        <Preview contentClassName="gap-10">
          {[['Rest', {}], ['Pressed', { '--plunk': '0px' }], ['Disabled', {}, true]].map(([label, style, disabled]) => (
            <div key={label} className="flex flex-col items-start gap-3">
              <span className="text-caps text-[9px] text-label">{label}</span>
              <Button variant="gold" style={style} disabled={disabled}>Play now</Button>
            </div>
          ))}
        </Preview>
      </Section>
      <Section title="Radius">
        <Preview contentClassName="gap-8">
          {[['2 · raised key', 'rounded-xs'], ['4 · badges', 'rounded-sm'], ['8 · buttons, inputs', 'rounded-md'], ['10 · icon tiles', 'rounded-lg'], ['12 · menus', 'rounded-xl'], ['16 · cards', 'rounded-2xl'], ['22 · sheets, dialogs', 'rounded-3xl'], ['full · chips, pills', 'rounded-full']].map(([label, cls]) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className={cn('size-20 border-[0.8px] border-border bg-surface-2', cls)} />
              <span className="font-mono text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </Preview>
      </Section>
    </>
  )
}

/* ─── Spacing & layout ─────────────────────────────────────────── */

export function SpacingPage() {
  const steps = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Space & grid"
        description="A 4px grid. Components use 8–20px inside, sections use 40–96px between. Content is boxed at 1200px with a 24px gutter (16px on phones)."
      />
      <Section title="Spacing scale">
        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s} className="flex items-center gap-4">
              <span className="w-14 font-mono text-[11px] text-muted-foreground tabular">{s * 4}px</span>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: s * 4 * 2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: s * 0.01 }}
                className="h-3 bg-foreground"
              />
              <span className="font-mono text-[11px] text-muted-foreground">space-{s}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Layout">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['App shell', '248px sidebar · 56px top bar · fluid content'],
            ['Content width', 'Boxed 1200px, centred, 24px gutter'],
            ['Editor', 'Chat 360px · canvas fluid · inspector 320px'],
          ].map(([t, d]) => (
            <Card key={t} className="py-5"><CardHeader><CardTitle>{t}</CardTitle><CardDescription>{d}</CardDescription></CardHeader></Card>
          ))}
        </div>
      </Section>
    </>
  )
}

/* ─── Motion ───────────────────────────────────────────────────── */

const MOTION_TOKENS = [
  ['Press', '50ms', 'accelerate-decelerate (.37,0,.63,1)', 'Plunk keys sinking into their edge'],
  ['Hover', '150ms', 'ease', 'Colour, border changes'],
  ['Fast', '200ms', 'FastOutSlowIn (.4,0,.2,1)', 'Switch thumbs, ticks, small state changes'],
  ['Enter', '300ms', 'FastOutSlowIn (.4,0,.2,1)', 'Pages, cards, sections rising in'],
  ['Dialog', '220ms', 'decelerate (0,0,.2,1) · scale 0.9 → 1', 'Dialogs and alerts popping in'],
  ['Sheet', '350ms', 'decelerate in · accelerate out', 'Bottom sheets and side panels'],
  ['Spring', 'damping 0.75 · stiffness 200', 'motion/react', 'Cards landing, lists reordering'],
  ['Loop', '1.5s', 'linear', 'Shimmer; the NeoPOP glint rests 5s between sweeps'],
]

export function MotionPage() {
  const [key, setKey] = useState(0)
  const [items, setItems] = useState(['Intro', 'Interview', 'Ad read', 'Outro'])
  const [on, setOn] = useState(true)
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Motion"
        description="Motion explains what happened: a key went down, a card arrived, a list changed. It is short, physical and never decorative. Everything collapses to instant when the OS asks for reduced motion."
      />
      <Section title="Tokens">
        <div className="overflow-x-auto rounded-2xl border-[0.8px] border-border">
          <table className="w-full text-[13px]">
            <tbody>
              {MOTION_TOKENS.map(([n, d, e, u]) => (
                <tr key={n} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bold">{n}</td>
                  <td className="px-4 py-3 font-mono text-[12px] tabular">{d}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{e}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Rise & stagger" description="How pages and lists enter.">
        <div className="mb-4"><Button variant="outline" size="sm" onClick={() => setKey((k) => k + 1)}><Icons.RotateCcwIcon />Replay</Button></div>
        <Preview>
          <motion.div key={key} variants={stagger(0.07)} initial="hidden" animate="show" className="grid w-full max-w-xl gap-3 sm:grid-cols-3">
            {['Upload', 'Transcribe', 'Polish'].map((t) => (
              <motion.div key={t} variants={land}>
                <Card variant="elevated" className="py-5"><CardContent className="px-5 text-sm font-bold">{t}</CardContent></Card>
              </motion.div>
            ))}
          </motion.div>
        </Preview>
      </Section>
      <Section title="Layout & reorder" description="Lists animate position changes with a spring, so nothing teleports.">
        <div className="mb-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setItems((l) => [...l].sort(() => Math.random() - 0.5))}><Icons.ShuffleIcon />Shuffle</Button>
          <Button variant="outline" size="sm" onClick={() => setItems((l) => l.slice(1))} disabled={!items.length}><Icons.MinusIcon />Remove</Button>
          <Button variant="outline" size="sm" onClick={() => setItems((l) => [`Segment ${l.length + 1}`, ...l])}><Icons.PlusIcon />Add</Button>
        </div>
        <Preview>
          <ul className="w-full max-w-sm space-y-2">
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <motion.li
                  key={t}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={spring.soft}
                  className="flex items-center justify-between rounded-2xl border-[0.8px] border-border bg-card px-4 py-3 text-sm font-semibold"
                >
                  {t}
                  <Icons.GripVerticalIcon className="size-4 text-muted-foreground" />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Preview>
      </Section>
      <Section title="Micro-interactions">
        <Preview contentClassName="gap-10">
          <div className="flex flex-col items-center gap-3"><Button>Press me</Button><span className="text-caps text-[9px] text-muted-foreground">Plunk</span></div>
          <div className="flex flex-col items-center gap-3"><Switch checked={on} onCheckedChange={setOn} /><span className="text-caps text-[9px] text-muted-foreground">Snap</span></div>
          <div className="flex flex-col items-center gap-3"><Spinner className="size-6" /><span className="text-caps text-[9px] text-muted-foreground">Equaliser</span></div>
          <div className="flex flex-col items-center gap-3"><span className="size-2.5 animate-live rounded-full bg-destructive" /><span className="text-caps text-[9px] text-muted-foreground">Live</span></div>
          <div className="flex w-40 flex-col items-center gap-3"><Skeleton className="h-8 w-full" /><span className="text-caps text-[9px] text-muted-foreground">Shimmer</span></div>
          <div className="flex flex-col items-center gap-3"><Badge key={String(on)} variant="brand" className="animate-pop">New</Badge><span className="text-caps text-[9px] text-muted-foreground">Pop</span></div>
        </Preview>
      </Section>
      <Section title="Reduced motion">
        <p className="max-w-2xl text-sm text-muted-foreground">
          A global <Kbd>prefers-reduced-motion</Kbd> rule reduces every CSS animation and transition to ~0ms, and motion/react
          components honour the same setting. Nothing in the product depends on motion to be understood.
        </p>
      </Section>
    </>
  )
}

/* ─── Icons ────────────────────────────────────────────────────── */

const ICON_SET = [
  'AudioLinesIcon', 'MicIcon', 'AudioWaveformIcon', 'ScissorsIcon', 'SparklesIcon', 'Wand2Icon', 'PlayIcon', 'PauseIcon',
  'SkipBackIcon', 'SkipForwardIcon', 'Volume2Icon', 'UploadIcon', 'DownloadIcon', 'ShareIcon', 'HistoryIcon', 'LayersIcon',
  'MessageSquareIcon', 'SearchIcon', 'SettingsIcon', 'LogOutIcon', 'PlusIcon', 'TrashIcon', 'PencilIcon', 'CheckIcon',
]

export function IconsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title="Icons"
        description="Lucide at a 2px stroke, sized 16px in controls and 20px in empty states. Icons always sit next to a label unless the control has an accessible name and a tooltip."
      />
      <Section title="Product set">
        <Preview contentClassName="grid grid-cols-4 gap-0 sm:grid-cols-6 lg:grid-cols-8" padded={false} center={false}>
          {ICON_SET.map((name) => {
            const Icon = Icons[name] || Icons.CircleIcon
            return (
              <div key={name} className="flex flex-col items-center gap-2 border-r border-b border-border p-5 transition-colors hover:bg-accent">
                <Icon className="size-5" />
                <span className="w-full truncate text-center font-mono text-[10px] text-muted-foreground">{name.replace('Icon', '')}</span>
              </div>
            )
          })}
        </Preview>
      </Section>
    </>
  )
}

export const FOUNDATIONS = [
  { slug: 'colors', title: 'Colour', Page: ColorsPage },
  { slug: 'typography', title: 'Type', Page: TypographyFoundationPage },
  { slug: 'elevation', title: 'Shape & depth', Page: ElevationPage },
  { slug: 'spacing', title: 'Space & grid', Page: SpacingPage },
  { slug: 'motion', title: 'Motion', Page: MotionPage },
  { slug: 'icons', title: 'Icons', Page: IconsPage },
]

