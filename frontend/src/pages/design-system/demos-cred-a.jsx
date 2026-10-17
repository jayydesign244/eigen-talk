import { useState } from 'react'
import {
  ArrowRightIcon, BellIcon, BuildingIcon, CoinsIcon, ContactIcon, InfoIcon, MessageSquareIcon, MicIcon, PercentIcon, PhoneIcon,
  ShareIcon, ShoppingBagIcon, SparklesIcon, UserIcon, WalletIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionHeader, DividerLabel } from '@/components/ui/section-header'
import { PageTitle } from '@/components/ui/page-title'
import { TextLink } from '@/components/ui/text-link'
import { ProgressButton } from '@/components/ui/progress-button'
import { Banner } from '@/components/ui/banner'
import { Chip, ChipIcon } from '@/components/ui/chip'
import { SearchField, SearchFieldChip } from '@/components/ui/search-field'
import { OptionCard, OptionCardGroup } from '@/components/ui/option-card'
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
          <SectionHeader title="Scheduled posts" action={<span className="text-caps text-[10px] text-foreground">3 this week</span>} />
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
              <div className="space-y-2"><Label htmlFor="pt-first">First name</Label><Input id="pt-first" /></div>
              <div className="space-y-2"><Label htmlFor="pt-last">Last name</Label><Input id="pt-last" /></div>
            </div>
          </Phone>
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

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1))
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
const YEARS = ['2025', '2026', '2027', '2028']

export const CRED_DEMOS_A = [
  { slug: 'section-header', title: 'Section Header', isNew: true, Page: SectionHeaderPage },
  { slug: 'page-title', title: 'Page Title', isNew: true, Page: PageTitlePage },
  { slug: 'text-link', title: 'Text Link', isNew: true, Page: TextLinkPage },
  { slug: 'progress-button', title: 'Progress Button', isNew: true, Page: ProgressButtonPage },
  { slug: 'banner', title: 'Banner', isNew: true, Page: BannerPage },
  { slug: 'chip', title: 'Chip', isNew: true, Page: ChipPage },
  { slug: 'search-field', title: 'Search Field', isNew: true, Page: SearchFieldPage },
  { slug: 'option-card', title: 'Option Card', isNew: true, Page: OptionCardPage },
]
