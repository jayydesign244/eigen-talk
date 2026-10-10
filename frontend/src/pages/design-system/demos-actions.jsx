import { useState } from 'react'
import {
  ArrowRightIcon, BoldIcon, ChevronDownIcon, DownloadIcon, ItalicIcon, Loader2Icon, MicIcon, MinusIcon,
  PauseIcon, PlayIcon, PlusIcon, Repeat2Icon, ScissorsIcon, SkipBackIcon, SkipForwardIcon, SparklesIcon,
  TrashIcon, UnderlineIcon, Volume2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from '@/components/ui/button-group'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Badge } from '@/components/ui/badge'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import { PageHeader, Preview, PropsTable, Section, StateGrid, Usage } from './kit'

const hover = { '--plunk': '4px' }
const focusRing = 'outline-2 outline-solid outline-offset-[5px] outline-ring'

function ButtonPage() {
  const [loading, setLoading] = useState(false)
  const variants = ['default', 'pill', 'chip', 'gold', 'brand', 'secondary', 'destructive', 'outline', 'ghost', 'link', 'elevated', 'pay']
  return (
    <>
      <PageHeader eyebrow="Actions" title="Button" description="Every button type in CRED's 2026 app: the black block CTA, the dark pill, the ice chip, the raised gold key (and Sonic aqua brand key), the grey trail CTA, a red-label destructive, and quiet outline / ghost / link." />
      <Section title="Variants">
        <Preview>
          <Button>Continue</Button>
          <Button variant="pill">Check now</Button>
          <Button variant="chip">garage</Button>
          <Button variant="gold">Play now</Button>
          <Button variant="brand"><SparklesIcon />Enhance</Button>
          <Button variant="secondary">Compare</Button>
          <Button variant="destructive"><TrashIcon />Delete</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Learn more</Button>
        </Preview>
      </Section>
      <Section title="Elevated keys (NeoPOP)" description="From the Mobbin review, the most-used CTA on CRED's dark screens: a square key with a lighter right edge and a darker bottom edge. It is black on light pages and white on dark ones. It lifts on hover, sinks into its edge when pressed, and turns grey when disabled instead of fading. pay is the lime key used for “Pay ₹1”.">
        <Preview center={false}>
          <StateGrid columns={2} states={[
            { label: 'elevated', node: <Button variant="elevated" size="lg">Refresh details<ArrowRightIcon /></Button> },
            { label: 'elevated · disabled', node: <Button variant="elevated" size="lg" disabled>Submit</Button> },
            { label: 'pay', node: <Button variant="pay" size="lg">Pay ₹1</Button> },
            { label: 'pay · disabled', node: <Button variant="pay" size="lg" disabled>Pay ₹1</Button> },
          ]} />
        </Preview>
      </Section>
      <Section title="Sizes">
        <Preview>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large<ArrowRightIcon /></Button>
          <Button size="icon-xs" variant="outline" aria-label="Add"><PlusIcon /></Button>
          <Button size="icon-sm" variant="outline" aria-label="Add"><PlusIcon /></Button>
          <Button size="icon" aria-label="Play"><PlayIcon /></Button>
          <Button size="icon-lg" variant="brand" aria-label="Record"><MicIcon /></Button>
        </Preview>
      </Section>
      <Section title="States" description="Hover deepens the fill; pressed settles the button (the raised key drops into its 3px edge); focus draws a ring; disabled fades to 50%, while a busy button keeps its colour.">
        <Preview center={false} contentClassName="flex-col gap-8">
          {variants.slice(0, 8).map((v) => (
            <StateGrid
              key={v}
              columns={5}
              states={[
                { label: `${v} · default`, node: <Button variant={v}>Export</Button> },
                { label: 'Hover', node: <Button variant={v} style={hover} className={v === 'outline' ? 'bg-accent' : ''}>Export</Button> },
                { label: 'Focus', node: <Button variant={v} className={focusRing}>Export</Button> },
                { label: 'Pressed', node: <Button variant={v} data-pressed="true" className={v === 'outline' ? 'bg-surface-2' : ''}>Export</Button> },
                { label: 'Disabled', node: <Button variant={v} disabled>Export</Button> },
              ]}
            />
          ))}
        </Preview>
      </Section>
      <Section title="Loading">
        <Preview>
          <Button
            disabled={loading}
            aria-busy={loading}
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1800) }}
          >
            {loading ? <><Spinner />Rendering…</> : <><DownloadIcon />Export MP3</>}
          </Button>
          <Button variant="brand" disabled aria-busy><Loader2Icon className="animate-spin" />Cleaning audio</Button>
          <Button variant="outline" disabled><Spinner />Uploading 64%</Button>
        </Preview>
      </Section>
      <Section title="Glint" description="A 45° light band sweeps the button in 1.5s, then rests 5s. Add the pop-shimmer class to the one CTA that should catch the eye.">
        <Preview>
          <Button size="lg" className="pop-shimmer">Start for free</Button>
          <Button size="lg" variant="brand" className="pop-shimmer">Enhance audio</Button>
        </Preview>
      </Section>
      <Section title="API">
        <PropsTable rows={[
          ['variant', 'default | brand | secondary | destructive | outline | ghost | link', 'default'],
          ['size', 'xs | sm | default | lg | icon | icon-xs | icon-sm | icon-lg', 'default'],
          ['asChild', 'boolean — render as the child element (e.g. a Link)', 'false'],
        ]} />
      </Section>
      <Section title="Usage">
        <Usage
          dos={['One raised key per area — the next step.', 'Use brand only for the AI / enhance action.', 'Label destructive actions with the object: "Delete project".']}
          donts={['Put two dark pills or raised keys side by side — one hero action per screen.', 'Use ghost for the primary action.', 'Disable a button without saying why nearby.']}
        />
      </Section>
    </>
  )
}

function ButtonGroupPage() {
  return (
    <>
      <PageHeader eyebrow="Actions" title="Button group" description="Related actions share edges: inner corners go square, the outer corners keep their 8px radius." />
      <Section title="Transport">
        <Preview>
          <ButtonGroup>
            <Button variant="outline" size="icon" aria-label="Back 10s"><SkipBackIcon /></Button>
            <Button variant="outline" size="icon" aria-label="Play"><PlayIcon /></Button>
            <Button variant="outline" size="icon" aria-label="Forward 10s"><SkipForwardIcon /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">Export</Button>
            <ButtonGroupSeparator />
            <Button variant="outline" size="icon" aria-label="More export options"><ChevronDownIcon /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroupText>Speed</ButtonGroupText>
            <Button variant="outline">1×</Button>
            <Button variant="outline">1.5×</Button>
            <Button variant="outline">2×</Button>
          </ButtonGroup>
        </Preview>
      </Section>
      <Section title="With input & vertical">
        <Preview>
          <ButtonGroup>
            <Input placeholder="Episode name" className="w-56" />
            <Button variant="outline">Rename</Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button variant="outline" size="icon" aria-label="Volume up"><PlusIcon /></Button>
            <Button variant="outline" size="icon" aria-label="Volume down"><MinusIcon /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroup>
              <Button variant="outline" size="sm">Cut</Button>
              <Button variant="outline" size="sm">Trim</Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button variant="outline" size="sm">Undo</Button>
              <Button variant="outline" size="sm">Redo</Button>
            </ButtonGroup>
          </ButtonGroup>
        </Preview>
      </Section>
    </>
  )
}

function TogglePage() {
  return (
    <>
      <PageHeader eyebrow="Actions" title="Toggle" description="A two-state button with 8px corners. On fills with the soft accent and darkens the label; the outline style lifts onto a white card with an ink hairline." />
      <Section title="Variants & sizes">
        <Preview>
          <Toggle aria-label="Bold"><BoldIcon /></Toggle>
          <Toggle variant="outline" aria-label="Italic"><ItalicIcon /></Toggle>
          <Toggle variant="outline" defaultPressed><Repeat2Icon />Loop</Toggle>
          <Toggle size="sm" variant="outline">Small</Toggle>
          <Toggle size="lg" variant="outline" aria-label="Mute"><Volume2Icon /></Toggle>
        </Preview>
      </Section>
      <Section title="States">
        <Preview>
          <StateGrid columns={5} states={[
            { label: 'Off', node: <Toggle variant="outline"><ScissorsIcon />Ripple</Toggle> },
            { label: 'Hover', node: <Toggle variant="outline" className="border-foreground bg-accent"><ScissorsIcon />Ripple</Toggle> },
            { label: 'On', node: <Toggle variant="outline" pressed><ScissorsIcon />Ripple</Toggle> },
            { label: 'Focus', node: <Toggle variant="outline" className="outline-2 outline-solid outline-offset-2 outline-ring"><ScissorsIcon />Ripple</Toggle> },
            { label: 'Disabled', node: <Toggle variant="outline" disabled><ScissorsIcon />Ripple</Toggle> },
          ]} />
        </Preview>
      </Section>
    </>
  )
}

function ToggleGroupPage() {
  const [view, setView] = useState('grid')
  return (
    <>
      <PageHeader eyebrow="Actions" title="Toggle group" description="With no spacing it becomes a segmented control — one outer rule, rounded at the ends, the active cell lifted." />
      <Section title="Segmented (single)">
        <Preview>
          <ToggleGroup type="single" variant="outline" value={view} onValueChange={(v) => v && setView(v)}>
            <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
            <ToggleGroupItem value="board">Board</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" variant="outline" size="sm" defaultValue="mp3">
            <ToggleGroupItem value="mp3">MP3</ToggleGroupItem>
            <ToggleGroupItem value="wav">WAV</ToggleGroupItem>
            <ToggleGroupItem value="m4a">M4A</ToggleGroupItem>
          </ToggleGroup>
        </Preview>
      </Section>
      <Section title="Multiple & spaced">
        <Preview>
          <ToggleGroup type="multiple" variant="outline" defaultValue={['bold']}>
            <ToggleGroupItem value="bold" aria-label="Bold"><BoldIcon /></ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic"><ItalicIcon /></ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline"><UnderlineIcon /></ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="multiple" spacing={2} defaultValue={['denoise']}>
            <ToggleGroupItem value="denoise" variant="outline">Denoise</ToggleGroupItem>
            <ToggleGroupItem value="level" variant="outline">Level</ToggleGroupItem>
            <ToggleGroupItem value="fillers" variant="outline">Fillers</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" variant="outline" disabled defaultValue="a">
            <ToggleGroupItem value="a">Disabled</ToggleGroupItem>
            <ToggleGroupItem value="b">Group</ToggleGroupItem>
          </ToggleGroup>
        </Preview>
      </Section>
    </>
  )
}

function BadgePage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Badge" description="CRED's tags: the black pill tag (“EARN ₹100”), gradient status chips with a hairline rim and 4px corners, and soft tinted tags. Status badges always pair colour with a word." />
      <Section title="Variants">
        <Preview>
          {['default', 'brand', 'secondary', 'outline', 'success', 'warning', 'destructive', 'info', 'ghost'].map((v) => (
            <Badge key={v} variant={v}>{v}</Badge>
          ))}
        </Preview>
      </Section>
      <Section title="From CRED" description="Soft status tags on rows, the grey “+5 more”, the folder tab on reward cards, the offset “in-store” notch and the red monospace setup status.">
        <Preview>
          <Badge variant="success-soft">Active</Badge>
          <Badge variant="destructive-soft">Low balance</Badge>
          <Badge variant="destructive-soft">Expired</Badge>
          <Badge variant="muted">+5 more</Badge>
          <Badge variant="tab">For 02 days</Badge>
          <Badge variant="notch">In-store</Badge>
          <Badge variant="mono"><span className="size-1.5 rounded-full bg-destructive" />Card setup pending</Badge>
        </Preview>
      </Section>
      <Section title="In context">
        <Preview>
          <Badge variant="success"><span className="size-1.5 rounded-full bg-success" />Exported</Badge>
          <Badge variant="warning"><span className="size-1.5 rounded-full bg-warning" />In progress</Badge>
          <Badge variant="secondary">New</Badge>
          <Badge variant="destructive">Failed</Badge>
          <Badge variant="outline"><MicIcon />Voice ready</Badge>
          <Badge variant="brand"><SparklesIcon />AI</Badge>
          <Badge variant="default" className="tabular">12</Badge>
        </Preview>
      </Section>
    </>
  )
}

function KbdPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Kbd" description="Keyboard keys drawn as tiny rounded keycaps with a 2px bottom edge." />
      <Section title="Shortcuts">
        <Preview>
          <KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
          <KbdGroup><Kbd>Space</Kbd></KbdGroup>
          <span className="text-[13px] text-muted-foreground">Delete a word with <Kbd>⌫</Kbd> · jump with <Kbd>⇧</Kbd>+click</span>
          <Button variant="outline">Search<KbdGroup className="ml-2"><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup></Button>
        </Preview>
      </Section>
    </>
  )
}

function SpinnerPage() {
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Spinner" description="An equaliser instead of a wheel — it reads as 'audio is working'. Inherits the text colour." />
      <Section title="Sizes & colours">
        <Preview>
          <Spinner className="size-3" />
          <Spinner />
          <Spinner className="size-6" />
          <Spinner className="size-10" />
          <Spinner className="size-6 text-brand" />
          <Spinner className="size-6 text-muted-foreground" />
        </Preview>
      </Section>
      <Section title="Dots" description="CRED's busy button: four small squares lighting in turn.">
        <Preview>
          <Spinner variant="dots" />
          <Button size="lg" className="w-56" aria-busy="true" disabled><Spinner variant="dots" /></Button>
        </Preview>
      </Section>
      <Section title="In context">
        <Preview>
          <Button disabled><Spinner />Transcribing</Button>
          <Badge variant="secondary"><Spinner className="size-3" />Processing</Badge>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground"><Spinner />Loading waveform…</div>
          <Button variant="outline" size="icon" disabled aria-label="Loading"><PauseIcon className="hidden" /><Spinner /></Button>
        </Preview>
      </Section>
    </>
  )
}

export const ACTION_DEMOS = [
  { slug: 'button', title: 'Button', Page: ButtonPage },
  { slug: 'button-group', title: 'Button Group', Page: ButtonGroupPage },
  { slug: 'toggle', title: 'Toggle', Page: TogglePage },
  { slug: 'toggle-group', title: 'Toggle Group', Page: ToggleGroupPage },
  { slug: 'badge', title: 'Badge', Page: BadgePage },
  { slug: 'kbd', title: 'Kbd', Page: KbdPage },
  { slug: 'spinner', title: 'Spinner', Page: SpinnerPage },
]

