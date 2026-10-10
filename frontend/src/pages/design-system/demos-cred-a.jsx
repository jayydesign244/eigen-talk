import { useState } from 'react'
import {
  ArrowRightIcon, BellIcon, BuildingIcon, CoinsIcon, ContactIcon, InfoIcon, MessageSquareIcon, MicIcon, PercentIcon, PhoneIcon,
  ShareIcon, ShoppingBagIcon, SparklesIcon, UserIcon, WalletIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeader, DividerLabel } from '@/components/ui/section-header'
import { PageTitle } from '@/components/ui/page-title'
import { AppBar, AppBarActions, AppBarBack, AppBarTitle } from '@/components/ui/app-bar'
import { BottomNav, BottomNavItem, BottomNavOrb } from '@/components/ui/bottom-nav'
import { TextLink } from '@/components/ui/text-link'
import { SlideToConfirm } from '@/components/ui/slide-to-confirm'
import { ProgressButton } from '@/components/ui/progress-button'
import { ActionBar, ActionBarActions, ActionBarSummary, SplitActions } from '@/components/ui/action-bar'
import { Countdown, Ribbon, Ticker } from '@/components/ui/ribbon'
import { Banner } from '@/components/ui/banner'
import { Chip, ChipIcon } from '@/components/ui/chip'
import { Price } from '@/components/ui/price'
import { SearchField, SearchFieldChip } from '@/components/ui/search-field'
import { BareField, FloatingField } from '@/components/ui/floating-field'
import { AmountInput, QuickAmounts } from '@/components/ui/amount-input'
import { Keypad, applyKey } from '@/components/ui/keypad'
import { OptionCard, OptionCardGroup } from '@/components/ui/option-card'
import { NumberStepper } from '@/components/ui/number-stepper'
import { SwatchPicker } from '@/components/ui/swatch-picker'
import { WheelPicker, WheelPickerGroup } from '@/components/ui/wheel-picker'
import { CredRefs, PageHeader, Preview, PropsTable, Section, StateGrid, Usage } from './kit'
import { CRED_REFS } from './cred-refs'

const Phone = ({ children, className = '' }) => (
  <div className={`w-full max-w-[360px] overflow-hidden border-[0.8px] border-border bg-background ${className}`}>{children}</div>
)

function SectionHeaderPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Structure" title="Section Header" description="The most used element in CRED: a bold caps label with 0.2em tracking that names every block on a screen. Add a muted line under it or an action on the right. DividerLabel puts a label on a hairline.">
        <CredRefs refs={CRED_REFS['section-header']} />
      </PageHeader>
      <Section title="Section header">
        <Preview center={false} contentClassName="flex-col gap-8 max-w-md">
          <SectionHeader title="Your projects" />
          <SectionHeader title="Recent exports" description="across 12 episodes" />
          <SectionHeader title="Suggested voices" action={<TextLink size="sm" tone="info" href="#">view all</TextLink>} />
          <SectionHeader title="Offer ends in" action={<Countdown to={Date.now() + 6 * 864e5 + 13 * 36e5} format="days" className="text-caps text-[10px] text-foreground" />} />
        </Preview>
      </Section>
      <Section title="Divider label" description="Caps for small separators, serif for a section title, italic for an inline label.">
        <Preview center={false} contentClassName="flex-col gap-8 max-w-md">
          <DividerLabel>We support</DividerLabel>
          <DividerLabel variant="serif">invite friends</DividerLabel>
          <DividerLabel variant="italic" align="start" icon={<SparklesIcon className="size-3.5" />}>includes</DividerLabel>
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage dos={['Name every block on a screen with one.', 'Keep it to two or three words.']} donts={['Use it as a heading for the whole page; use Page Title.', 'Mix it with other label styles on the same screen.']} />
      </Section>
    </>
  )
}

function PageTitlePage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Structure" title="Page Title" description="CRED opens nearly every screen with a lowercase serif headline, a muted line under it and sometimes a caps eyebrow. The band variant is the dark header block over a light form.">
        <CredRefs refs={CRED_REFS['page-title']} />
      </PageHeader>
      <Section title="Default">
        <Preview center={false} contentClassName="flex-col gap-10 max-w-md">
          <PageTitle title="your projects" description="everything you've recorded and edited" />
          <PageTitle eyebrow="Voice studio" title="clone your voice" description="read three short paragraphs and we'll do the rest" action={<Button variant="outline" size="sm">Help</Button>} />
          <PageTitle size="sm" title="export settings" />
        </Preview>
      </Section>
      <Section title="Band" description="A dark block that stays dark in both themes, over the light body of a form.">
        <Preview single center={false} padded={false}>
          <Phone className="light">
            <PageTitle variant="band" eyebrow="Membership application" title="tell us your name" />
            <div className="space-y-5 p-5">
              <FloatingField label="First name" />
              <FloatingField label="Last name" hint="as it appears on your bank records" />
            </div>
          </Phone>
        </Preview>
      </Section>
    </>
  )
}

function AppBarPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Navigation" title="App Bar" description="A long thin back arrow, a title (plain, with a subtitle, or centred caps) and trailing actions: outlined pills, square or circular icon buttons, a coin balance.">
        <CredRefs refs={CRED_REFS['app-bar']} />
      </PageHeader>
      <Section title="Variants">
        <Preview center={false} contentClassName="flex-col gap-4">
          <Phone><AppBar><AppBarBack /><AppBarTitle>profile</AppBarTitle><AppBarActions><Button variant="outline" size="sm" className="rounded-full"><MessageSquareIcon />support</Button></AppBarActions></AppBar></Phone>
          <Phone><AppBar><AppBarBack /><AppBarTitle subtitle="episode 42 · 42:18">export</AppBarTitle></AppBar></Phone>
          <Phone><AppBar><AppBarBack /><AppBarTitle variant="center">Sonicly <span className="font-medium text-muted-foreground">store</span></AppBarTitle><AppBarActions><Button variant="outline" size="icon-sm" className="rounded-full" aria-label="Orders"><ShoppingBagIcon /></Button></AppBarActions></AppBar></Phone>
          <Phone><AppBar><AppBarBack /><AppBarActions><Chip variant="value" size="sm"><ChipIcon className="bg-warning text-pop-black"><CoinsIcon /></ChipIcon>2,87,222</Chip><Button variant="outline" size="icon-sm" className="rounded-none" aria-label="Share"><ShareIcon /></Button></AppBarActions></AppBar></Phone>
        </Preview>
      </Section>
    </>
  )
}

function BottomNavPage() {
  const [tab, setTab] = useState('record')
  return (
    <>
      <PageHeader eyebrow="From CRED · Navigation" title="Bottom Nav" description="A dark curved dock with outlined circular icons, caps labels and a larger centre orb for the profile. Items can carry a red dot or a tiny green tag. It stays dark in both themes.">
        <CredRefs refs={CRED_REFS['bottom-nav']} />
      </PageHeader>
      <Section title="Example">
        <Preview single>
          <div className="w-full max-w-[360px] pt-6">
            <BottomNav>
              <BottomNavItem icon={<MicIcon />} label="Record" tag="new" active={tab === 'record'} onClick={() => setTab('record')} />
              <BottomNavOrb label="You"><UserIcon className="size-7 text-muted-foreground" /></BottomNavOrb>
              <BottomNavItem icon={<WalletIcon />} label="Projects" badge active={tab === 'projects'} onClick={() => setTab('projects')} />
            </BottomNav>
          </div>
        </Preview>
      </Section>
    </>
  )
}

function TextLinkPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Actions" title="Text Link" description="Inline actions: underlined ('skip for now'), dotted ('know more') and chevron ('more ›'). The blue info tone is CRED's link for account actions such as 'Check balance'.">
        <CredRefs refs={CRED_REFS['text-link']} />
      </PageHeader>
      <Section title="Variants and tones">
        <Preview center={false}>
          <StateGrid columns={4} states={[
            { label: 'underline', node: <TextLink href="#">View export history</TextLink> },
            { label: 'dotted', node: <TextLink variant="dotted" href="#">know more</TextLink> },
            { label: 'chevron · info', node: <TextLink variant="chevron" tone="info" href="#">more <ArrowRightIcon /></TextLink> },
            { label: 'muted · xs', node: <TextLink tone="muted" size="xs" href="#">skip for now</TextLink> },
          ]} />
        </Preview>
      </Section>
      <Section title="API">
        <PropsTable rows={[['variant', 'underline | dotted | chevron', 'underline'], ['tone', 'default | muted | info | brand', 'default'], ['size', 'default | sm | xs', 'default'], ['asChild', 'boolean', 'false']]} />
      </Section>
    </>
  )
}

function SlideToConfirmPage() {
  const [done, setDone] = useState(false)
  return (
    <>
      <PageHeader eyebrow="From CRED · Actions" title="Slide to Confirm" description="For a deliberate, hard-to-undo action. Drag the ringed knob past 85% to confirm; letting go earlier springs it back. Keyboard users press Enter or Space on the knob.">
        <CredRefs refs={CRED_REFS['slide-to-confirm']} />
      </PageHeader>
      <Section title="States">
        <Preview center={false}>
          <StateGrid columns={3} states={[
            { label: 'Idle (try it)', node: <SlideToConfirm label={done ? 'Published' : 'Slide to publish episode'} onConfirm={() => setDone(true)} /> },
            { label: 'Confirmed', node: <SlideToConfirm label="Published" confirmed /> },
            { label: 'Disabled', node: <SlideToConfirm label="Slide to publish" disabled /> },
          ]} />
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage dos={['Use it for publishing, deleting or spending credits.', 'Say what happens in the label: "Slide to publish episode".']} donts={['Use it for routine actions; a button is faster.', 'Put two on one screen.']} />
      </Section>
    </>
  )
}

function ProgressButtonPage() {
  const [p, setP] = useState(45)
  return (
    <>
      <PageHeader eyebrow="From CRED · Actions" title="Progress Button" description="What the CTA becomes once tapped: a mint bar fills behind the label, with an outlined square to cancel. Pass a value for real progress, or leave it out for a sweep.">
        <CredRefs refs={CRED_REFS['progress-button']} />
      </PageHeader>
      <Section title="Examples">
        <Preview center={false} contentClassName="flex-col gap-5 max-w-md">
          <ProgressButton value={p} label={`rendering export… ${p}%`} onCancel={() => setP(0)} />
          <ProgressButton label="uploading audio…" />
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setP((v) => Math.min(100, v + 15))}>Advance</Button><Button size="sm" variant="ghost" onClick={() => setP(0)}>Reset</Button></div>
        </Preview>
      </Section>
    </>
  )
}

function ActionBarPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Actions" title="Action Bar" description="The sticky footer on commerce screens: a caps meta line, the price with its strikethrough, and the CTA. Dark on detail pages, light on review pages. A Ribbon sits right above it. SplitActions are the edge-to-edge 'Add to cart | Buy now' pair.">
        <CredRefs refs={CRED_REFS['action-bar']} />
      </PageHeader>
      <Section title="Dark, with ribbon">
        <Preview single padded={false}>
          <Phone>
            <Ribbon>Save 20% on the yearly plan</Ribbon>
            <ActionBar tone="dark">
              <ActionBarSummary meta="Pro · yearly"><Price value={7000} original={10000} currency="INR" layout="stacked" size="lg" /></ActionBarSummary>
              <ActionBarActions><Button variant="elevated" size="lg" className="bg-pop-white text-pop-black">Upgrade <ArrowRightIcon /></Button></ActionBarActions>
            </ActionBar>
          </Phone>
        </Preview>
      </Section>
      <Section title="Light, and split actions">
        <Preview single center={false} contentClassName="flex-col gap-6">
          <Phone>
            <ActionBar tone="light">
              <ActionBarSummary meta={<>03 apr – 05 apr <InfoIcon className="size-3" /></>}><Price value={7000} original={10000} currency="INR" layout="stacked" size="lg" /></ActionBarSummary>
              <ActionBarActions><Button size="lg">Review booking <ArrowRightIcon /></Button></ActionBarActions>
            </ActionBar>
          </Phone>
          <Phone><SplitActions><Button>Add to cart</Button><Button>Buy now <ArrowRightIcon /></Button></SplitActions></Phone>
        </Preview>
      </Section>
    </>
  )
}

function RibbonPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Feedback" title="Ribbon & Ticker" description="Ribbons are full-width caps strips pinned to an edge: green with diagonal light stripes for offers, red with a live countdown for expiring ones. Ticker is the marquee pill at the top of CRED's home.">
        <CredRefs refs={CRED_REFS.ribbon} />
      </PageHeader>
      <Section title="Ribbon">
        <Preview center={false} contentClassName="flex-col gap-3">
          <Ribbon>Unlock up to 100% cashback</Ribbon>
          <Ribbon tone="destructive" striped={false}>Offer expiring in <Countdown to={Date.now() + 86399e3} className="text-warning" /></Ribbon>
          <Ribbon tone="brand">New: AI voice cleanup</Ribbon>
          <Ribbon tone="dark" striped={false}>Win up to ₹1000 cashback on payment</Ribbon>
        </Preview>
      </Section>
      <Section title="Ticker">
        <Preview>
          <Ticker leading={<span className="flex size-full items-center justify-center bg-brand text-brand-foreground"><SparklesIcon className="size-3.5" /></span>} action="Try now ›">
            Studio Sound is free this week · clean up any recording in one tap
          </Ticker>
        </Preview>
      </Section>
    </>
  )
}

function BannerPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Feedback" title="Banner" description="Edge-to-edge notices with no border or corners: the solid green 'updated' bar under the status bar, and the mint savings banner with a badge icon. For boxed messages inside content, use Alert.">
        <CredRefs refs={CRED_REFS.banner} />
      </PageHeader>
      <Section title="Tones">
        <Preview center={false} contentClassName="flex-col gap-3" padded={false}>
          <Banner tone="success">your project details have been updated</Banner>
          <Banner tone="mint"><PercentIcon />you just saved ₹2,400!</Banner>
          <Banner tone="info"><InfoIcon />transcripts are now accurate to 20 ms</Banner>
          <Banner tone="warning" action={<TextLink size="sm" href="#">Fix</TextLink>}><BellIcon />2 projects need audio</Banner>
          <Banner tone="brand"><SparklesIcon />Studio Sound is on for this project</Banner>
        </Preview>
      </Section>
    </>
  )
}

function ChipPage() {
  const [themes, setThemes] = useState(['podcast'])
  const toggle = (t) => setThemes((v) => (v.includes(t) ? v.filter((x) => x !== t) : [...v, t]))
  return (
    <>
      <PageHeader eyebrow="From CRED · Actions" title="Chip" description="Small pills and value chips: outlined filters and suggestions, green quick-amount chips, the dark coin-balance chip, grey date chips, and action chips with a circular icon and a two-line label.">
        <CredRefs refs={CRED_REFS.chip} />
      </PageHeader>
      <Section title="Variants">
        <Preview>
          <Chip>@okaxis</Chip>
          <Chip variant="success">₹500</Chip>
          <Chip variant="value"><ChipIcon className="bg-warning text-pop-black"><CoinsIcon /></ChipIcon>2,87,222</Chip>
          <Chip variant="soft" size="sm">03 apr – 05 apr</Chip>
          <Chip variant="action"><ChipIcon><WalletIcon /></ChipIcon>check<br />balance</Chip>
          <Chip variant="action"><ChipIcon><PhoneIcon /></ChipIcon>phone<br />number</Chip>
        </Preview>
      </Section>
      <Section title="Selectable" description="aria-pressed fills the chip in.">
        <Preview>
          {['podcast', 'interview', 'audiobook', 'ad read'].map((t) => (
            <Chip key={t} aria-pressed={themes.includes(t)} onClick={() => toggle(t)}>{t}</Chip>
          ))}
        </Preview>
      </Section>
      <Section title="Sizes">
        <Preview><Chip size="sm">Small</Chip><Chip>Default</Chip><Chip size="lg">Large</Chip></Preview>
      </Section>
    </>
  )
}

function PricePage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Price" description="An amount with its struck-through original and a green discount. Numbers are formatted for India (₹2,87,222). discount={true} works out the percentage.">
        <CredRefs refs={CRED_REFS.price} />
      </PageHeader>
      <Section title="Sizes and layouts">
        <Preview center={false}>
          <StateGrid columns={4} states={[
            { label: 'sm', node: <Price value={599} original={2999} discount currency="INR" size="sm" /> },
            { label: 'default', node: <Price value={649} original={2999} discount currency="INR" /> },
            { label: 'lg · stacked', node: <Price value={7000} original={10000} currency="INR" size="lg" layout="stacked" /> },
            { label: 'xl', node: <Price value="₹0" original="₹10" size="xl" /> },
          ]} />
        </Preview>
      </Section>
    </>
  )
}

function SearchFieldPage() {
  const [q, setQ] = useState('ep. 42')
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Search Field" description="A square outlined search, the dark rounded pill from CRED's UPI screens (stays dark in both themes, with an optional '123' keypad toggle) and a filled variant. A clear button appears once there's text.">
        <CredRefs refs={CRED_REFS['search-field']} />
      </PageHeader>
      <Section title="Variants">
        <Preview center={false} contentClassName="flex-col gap-4 max-w-md">
          <SearchField placeholder="search projects" />
          <SearchField placeholder="search voices" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ('')} />
          <SearchField variant="pill" placeholder="search contacts" trailing={<SearchFieldChip aria-label="Open number pad">123</SearchFieldChip>} />
          <SearchField variant="filled" placeholder="search from 131 sound effects" />
        </Preview>
      </Section>
    </>
  )
}

function FloatingFieldPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Floating Field" description="CRED's form field: a square outline with the caps label notched into the top border. mono gives masks like DD/MM/YYYY. BareField is the boxless version from CRED's dark forms: a tiny caps label over a large value.">
        <CredRefs refs={CRED_REFS['floating-field']} />
      </PageHeader>
      <Section title="Floating field states">
        <Preview center={false}>
          <StateGrid columns={2} states={[
            { label: 'Empty', node: <FloatingField label="Email" placeholder="you@studio.fm" /> },
            { label: 'Mask (mono)', node: <FloatingField label="Date of birth" placeholder="DD/MM/YYYY" mono hint="helps us verify your account" /> },
            { label: 'Filled', node: <FloatingField label="Show name" defaultValue="The Quiet Room" /> },
            { label: 'Error', node: <FloatingField label="Card number" defaultValue="4111 1111" mono error="enter all 16 digits" /> },
            { label: 'Trailing icon', node: <FloatingField label="Phone (optional)" placeholder="+91" trailing={<ContactIcon className="size-4 text-muted-foreground" />} /> },
            { label: 'Disabled', node: <FloatingField label="Workspace" defaultValue="sonicly-hq" disabled /> },
          ]} />
        </Preview>
      </Section>
      <Section title="Bare field" description="Good for short, confident forms on dark screens.">
        <Preview center={false} contentClassName="flex-col gap-6 max-w-sm">
          <BareField label="Full name" placeholder="john doe" />
          <BareField label="Account number" defaultValue="15XXXXXXXXXX" mono readOnly />
          <BareField label="IFSC code" defaultValue="ABC00" error="IFSC is 11 characters" />
        </Preview>
      </Section>
    </>
  )
}

function AmountInputPage() {
  const [v, setV] = useState('')
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Amount Input" description="A caps label with an optional hint on the right, then a large currency symbol and value with the blue caret. QuickAmounts are the green chips under it. The display size is the centred hero amount on pay screens.">
        <CredRefs refs={CRED_REFS['amount-input']} />
      </PageHeader>
      <Section title="Default, with quick amounts">
        <Preview center={false} contentClassName="flex-col gap-4 max-w-sm">
          <AmountInput label="Enter amount" hint="min accepted is ₹500" placeholder="00.00" value={v} onChange={(e) => setV(e.target.value.replace(/[^\d.]/g, ''))} />
          <QuickAmounts amounts={[500, 600, 700]} value={v} onSelect={(a) => setV(String(a))} />
        </Preview>
      </Section>
      <Section title="Display">
        <Preview><AmountInput size="display" placeholder="0" defaultValue="1" aria-label="Amount" /></Preview>
      </Section>
    </>
  )
}

function KeypadPage() {
  const [v, setV] = useState('')
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Keypad" description="CRED's own number pad on pay screens: square white keys on a hairline grid, with quiet '.' and backspace keys. applyKey() keeps one decimal point and two decimals.">
        <CredRefs refs={CRED_REFS.keypad} />
      </PageHeader>
      <Section title="Example">
        <Preview single contentClassName="flex-col">
          <p className="text-4xl font-extrabold tabular">₹{v || '0'}</p>
          <Keypad onKey={(k) => setV((x) => applyKey(x, k))} />
        </Preview>
      </Section>
    </>
  )
}

function OptionCardPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Option Card" description="Selectable cards on a radio group (arrow keys move between them): outlined caps rows, white cards with media and a trailing radio, small amount tiles, and full-width choice rows where the chosen one gets an accent rule.">
        <CredRefs refs={CRED_REFS['option-card']} />
      </PageHeader>
      <Section title="Row">
        <Preview center={false} contentClassName="max-w-md">
          <OptionCardGroup defaultValue="mp3" className="w-full">
            {['MP3 · 320 kbps', 'WAV · 24-bit / 48 kHz', 'M4A · 256 kbps'].map((o, i) => <OptionCard key={o} variant="row" value={['mp3', 'wav', 'm4a'][i]}>{o}</OptionCard>)}
          </OptionCardGroup>
        </Preview>
      </Section>
      <Section title="Card">
        <Preview center={false} contentClassName="max-w-md">
          <OptionCardGroup defaultValue="pro" className="w-full">
            <OptionCard value="pro" media={<SparklesIcon className="size-5" />} title="Pro · monthly" description="unlimited exports, Studio Sound" meta="₹799" />
            <OptionCard value="team" media={<BuildingIcon className="size-5" />} title="Team" description="5 seats, shared voices" meta="₹2,999" />
            <OptionCard value="free" media={<UserIcon className="size-5" />} title="Free" description="3 exports a month" meta="₹0" disabled />
          </OptionCardGroup>
        </Preview>
      </Section>
      <Section title="Tile and choice">
        <Preview center={false} contentClassName="flex-col gap-8 max-w-md">
          <OptionCardGroup defaultValue="all" className="grid-cols-2">
            <OptionCard variant="tile" value="all" title="Whole episode">42:18</OptionCard>
            <OptionCard variant="tile" value="clip" title="Selected clip">01:12</OptionCard>
            <OptionCard variant="tile" value="custom" title="Custom range">— : —</OptionCard>
          </OptionCardGroup>
          <OptionCardGroup defaultValue="total" className="w-full">
            <OptionCard variant="choice" value="total">clean whole episode <ArrowRightIcon className="size-4" /></OptionCard>
            <OptionCard variant="choice" value="fillers">remove fillers only <ArrowRightIcon className="size-4" /></OptionCard>
          </OptionCardGroup>
        </Preview>
      </Section>
    </>
  )
}

function NumberStepperPage() {
  const [n, setN] = useState(1)
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Number Stepper" description="Two grey square keys around the number. It clamps to min and max; at the limit the key disables and an optional line explains why.">
        <CredRefs refs={CRED_REFS['number-stepper']} />
      </PageHeader>
      <Section title="States">
        <Preview center={false}>
          <StateGrid columns={3} states={[
            { label: 'Interactive (max 3)', node: <NumberStepper value={n} onValueChange={setN} min={1} max={3} label="Seats" limitText="max seats added" /> },
            { label: 'At minimum', node: <NumberStepper value={0} label="Guests" /> },
            { label: 'At maximum', node: <NumberStepper value={2} max={2} label="Rooms" limitText="max quantity added" /> },
          ]} />
        </Preview>
      </Section>
    </>
  )
}

function SwatchPickerPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Swatch Picker" description="Square image or colour swatches. The chosen one gets an ink frame; sold-out options fade, carry a caps caption and can't be picked.">
        <CredRefs refs={CRED_REFS['swatch-picker']} />
      </PageHeader>
      <Section title="Waveform colour">
        <Preview>
          <SwatchPicker
            aria-label="Waveform colour"
            defaultValue="aqua"
            options={[
              { value: 'ink', label: 'Ink', color: '#0d0d0d' },
              { value: 'aqua', label: 'Sonic aqua', color: '#2ce6e0' },
              { value: 'violet', label: 'Violet', color: '#7c5cff' },
              { value: 'gold', label: 'Gold', color: '#f6b800', soldOut: true },
            ]}
          />
        </Preview>
      </Section>
    </>
  )
}

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const YEARS = ['2025', '2026', '2027', '2028']

function WheelPickerPage() {
  const [d, setD] = useState('23')
  const [m, setM] = useState('march')
  const [y, setY] = useState('2026')
  return (
    <>
      <PageHeader eyebrow="From CRED · Forms" title="Wheel Picker" description="An iOS-style wheel: rows snap into a grey band and fade towards the edges. Each column is a listbox that arrow keys can step through.">
        <CredRefs refs={CRED_REFS['wheel-picker']} />
      </PageHeader>
      <Section title="Schedule publish date">
        <Preview single contentClassName="flex-col">
          <WheelPickerGroup className="max-w-xs">
            <WheelPicker label="Day" options={DAYS} value={d} onValueChange={setD} />
            <WheelPicker label="Month" options={MONTHS} value={m} onValueChange={setM} />
            <WheelPicker label="Year" options={YEARS} value={y} onValueChange={setY} />
          </WheelPickerGroup>
          <p className="text-[13px] font-medium text-muted-foreground">Publishes on <span className="font-bold text-foreground">{d} {m} {y}</span></p>
        </Preview>
      </Section>
    </>
  )
}

export const CRED_DEMOS_A = [
  { slug: 'section-header', title: 'Section Header', isNew: true, Page: SectionHeaderPage },
  { slug: 'page-title', title: 'Page Title', isNew: true, Page: PageTitlePage },
  { slug: 'app-bar', title: 'App Bar', isNew: true, Page: AppBarPage },
  { slug: 'bottom-nav', title: 'Bottom Nav', isNew: true, Page: BottomNavPage },
  { slug: 'text-link', title: 'Text Link', isNew: true, Page: TextLinkPage },
  { slug: 'slide-to-confirm', title: 'Slide to Confirm', isNew: true, Page: SlideToConfirmPage },
  { slug: 'progress-button', title: 'Progress Button', isNew: true, Page: ProgressButtonPage },
  { slug: 'action-bar', title: 'Action Bar', isNew: true, Page: ActionBarPage },
  { slug: 'ribbon', title: 'Ribbon & Ticker', isNew: true, Page: RibbonPage },
  { slug: 'banner', title: 'Banner', isNew: true, Page: BannerPage },
  { slug: 'chip', title: 'Chip', isNew: true, Page: ChipPage },
  { slug: 'price', title: 'Price', isNew: true, Page: PricePage },
  { slug: 'search-field', title: 'Search Field', isNew: true, Page: SearchFieldPage },
  { slug: 'floating-field', title: 'Floating Field', isNew: true, Page: FloatingFieldPage },
  { slug: 'amount-input', title: 'Amount Input', isNew: true, Page: AmountInputPage },
  { slug: 'keypad', title: 'Keypad', isNew: true, Page: KeypadPage },
  { slug: 'option-card', title: 'Option Card', isNew: true, Page: OptionCardPage },
  { slug: 'number-stepper', title: 'Number Stepper', isNew: true, Page: NumberStepperPage },
  { slug: 'swatch-picker', title: 'Swatch Picker', isNew: true, Page: SwatchPickerPage },
  { slug: 'wheel-picker', title: 'Wheel Picker', isNew: true, Page: WheelPickerPage },
]
