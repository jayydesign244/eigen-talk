import { useState } from 'react'
import {
  ArrowRightIcon, AudioLinesIcon, BookOpenIcon, CopyIcon, CreditCardIcon, DownloadIcon, FileAudioIcon, HeadphonesIcon, InfoIcon, LayersIcon,
  MicIcon, PencilIcon, PhoneIcon, RadioIcon, RotateCcwIcon, ScissorsIcon, ShareIcon, SparklesIcon, TrashIcon, UploadIcon, Wand2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionGroup, TransactionRow } from '@/components/ui/transaction-row'
import { KeyValue, KeyValueGrid, SummaryRow, SummaryTable, SummaryTotal } from '@/components/ui/key-value'
import { NumberedList } from '@/components/ui/numbered-list'
import { SwipeAction, SwipeRow } from '@/components/ui/swipe-row'
import { PromoCard } from '@/components/ui/promo-card'
import { IconTile, IconTileGrid } from '@/components/ui/icon-tile'
import { MediaCard, OfferCard, ProductCard } from '@/components/ui/media-card'
import { TicketCard } from '@/components/ui/ticket-card'
import { Receipt } from '@/components/ui/receipt'
import { TrustFooter } from '@/components/ui/trust-footer'
import { PageDots, StepTrack } from '@/components/ui/step-track'
import { Gauge } from '@/components/ui/gauge'
import { FlipCounter } from '@/components/ui/flip-counter'
import { StatusScreen } from '@/components/ui/status-screen'
import { ActionSheet, ConfirmSheet } from '@/components/ui/action-sheet'
import { TourPanel } from '@/components/ui/tour'
import { QuickReplies } from '@/components/ui/quick-replies'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Badge } from '@/components/ui/badge'
import { Price } from '@/components/ui/price'
import { CredRefs, PageHeader, Preview, Section, StateGrid, Usage } from './kit'
import { CRED_REFS } from './cred-refs'

/** Gradient placeholder art so the demos need no external images. */
const art = (a, b, angle = 160) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" gradientTransform="rotate(${angle - 90} .5 .5)"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="300" cy="120" r="70" fill="#fff" fill-opacity=".18"/><path d="M0 380 Q100 330 200 380 T400 380 V500 H0Z" fill="#000" fill-opacity=".18"/></svg>`
  )}`

function TransactionRowPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Transaction Row" description="A history row: square icon tile or letter avatar, title, a meta line with an optional status check, and the amount with a chevron. TransactionGroup adds the caps month label and hairline dividers.">
        <CredRefs refs={CRED_REFS['transaction-row']} />
      </PageHeader>
      <Section title="Grouped list">
        <Preview center={false} contentClassName="max-w-md">
          <div className="w-full">
            <TransactionGroup label="Oct 2026">
              <TransactionRow icon={<FileAudioIcon />} title="Ep. 42 — The quiet room" meta="exported · 04:38pm, 9th oct" status="success" amount="38.7 MB" onClick={() => {}} />
              <TransactionRow icon="M" title="Interview with Maya" meta="render failed · 10:46pm, 8th oct" status="failed" amount="—" amountTone="muted" onClick={() => {}} />
            </TransactionGroup>
            <TransactionGroup label="Sep 2026">
              <TransactionRow icon={<SparklesIcon />} title="Pro plan" meta="renewed · 1st sep" status="success" amount="₹799" onClick={() => {}} />
              <TransactionRow icon={<RotateCcwIcon />} title="Refund · duplicate charge" meta="28th aug" amount="+₹799" amountTone="positive" chevron={false} />
            </TransactionGroup>
          </div>
        </Preview>
      </Section>
    </>
  )
}

function KeyValuePage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Key Value & Summary" description="Two ways to show labelled values. KeyValueGrid stacks a muted label over the value in columns (caps for spec rows). SummaryTable puts the label left and the value right, with a separated total.">
        <CredRefs refs={CRED_REFS['key-value']} />
      </PageHeader>
      <Section title="Key–value grid">
        <Preview center={false} contentClassName="flex-col gap-10 max-w-md">
          <KeyValueGrid columns={3} className="w-full">
            <KeyValue caps label="Loudness">-16 LUFS</KeyValue>
            <KeyValue caps label="Peak">-1.0 dBTP</KeyValue>
            <KeyValue caps label="Length">42:18</KeyValue>
          </KeyValueGrid>
          <KeyValueGrid className="w-full">
            <KeyValue label="format">WAV</KeyValue>
            <KeyValue label="sample rate">48 kHz</KeyValue>
            <KeyValue label="bit depth">24-bit</KeyValue>
            <KeyValue label="channels">stereo</KeyValue>
          </KeyValueGrid>
        </Preview>
      </Section>
      <Section title="Summary table">
        <Preview center={false} contentClassName="max-w-md">
          <SummaryTable className="w-full">
            <SummaryRow label="Pro · yearly">₹9,588</SummaryRow>
            <SummaryRow label="credits used">₵ 2,000</SummaryRow>
            <SummaryRow label="annual discount" tone="positive">-₹2,588</SummaryRow>
            <SummaryRow label="next renewal" description="1st oct 2027" tone="muted">₹9,588</SummaryRow>
            <SummaryTotal label="total payable">₹7,000</SummaryTotal>
          </SummaryTable>
        </Preview>
      </Section>
    </>
  )
}

function NumberedListPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Numbered List" description="Numbered link lists. Caps rows with a vertical rule after the number and an ↗ (CRED concierge); a serif variant with a tiny number and a long arrow (hotel policies).">
        <CredRefs refs={CRED_REFS['numbered-list']} />
      </PageHeader>
      <Section title="Variants">
        <Preview center={false} contentClassName="flex-col gap-10 max-w-md">
          <NumberedList className="w-full" items={[{ label: 'Clean up my audio' }, { label: 'Remove filler words' }, { label: 'Match loudness to Spotify' }, { label: 'Talk to support' }]} />
          <NumberedList className="w-full" variant="serif" items={[{ label: 'export settings' }, { label: 'licence & usage' }, { label: 'cancellation policy' }]} />
        </Preview>
      </Section>
    </>
  )
}

function SwipeRowPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Swipe Row" description="Slide a row left to reveal grey square actions, as in CRED's cart. The actions stay reachable by keyboard: focusing one opens the row.">
        <CredRefs refs={CRED_REFS['swipe-row']} />
      </PageHeader>
      <Section title="Example (drag the row left)">
        <Preview single center={false} contentClassName="max-w-md">
          <SwipeRow className="w-full border-y-[0.8px] border-border" actions={<><SwipeAction aria-label="Delete"><TrashIcon /></SwipeAction><SwipeAction><PencilIcon />Edit</SwipeAction></>}>
            <TransactionRow icon={<FileAudioIcon />} title="Trailer cut" meta="02:45 · edited today" amount="2.6 MB" chevron={false} className="px-4" />
          </SwipeRow>
        </Preview>
      </Section>
    </>
  )
}

function PromoCardPage() {
  const illo = (Icon) => <span className="flex size-20 items-center justify-center bg-brand text-brand-foreground [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]"><Icon className="size-8" /></span>
  return (
    <>
      <PageHeader eyebrow="From CRED · Cards" title="Promo Card" description="Art, a heading (serif or bold), a muted line and a CTA, in several skins: light card on a dark page, dark raised card with a full-width CTA footer, hairline outline, dark tile with a line pattern, and tinted fills.">
        <CredRefs refs={CRED_REFS['promo-card']} />
      </PageHeader>
      <Section title="Tones">
        <Preview center={false} contentClassName="grid grid-cols-1 gap-5 md:grid-cols-2">
          <PromoCard tone="light" serif media={illo(Wand2Icon)} title="make every episode sound studio-made" description="Studio Sound removes room echo and hum in one pass." action={<Button>Try it <ArrowRightIcon /></Button>} />
          <PromoCard tone="dark" serif media={illo(MicIcon)} title="reserved for you: 3 free exports" description="record your first episode to unlock them" footer={<Button variant="elevated" className="bg-pop-white text-pop-black">Record now <ArrowRightIcon /></Button>} />
          <PromoCard tone="outline" layout="row" media={illo(SparklesIcon)} title="win a free month of Pro" description="on your first published episode" />
          <PromoCard tone="pattern" title="on-time uploads" description="publish on your schedule to grow faster" media={<span className="flex size-12 items-center justify-center rounded-full bg-white/10"><RadioIcon className="size-5" /></span>} layout="row" />
          <PromoCard tone="tinted" layout="row" title="easy way to earn credits" description="invite a friend, both get a month free" action={<Button variant="elevated" size="sm" className="bg-pop-white text-pop-black">Invite <ArrowRightIcon /></Button>} />
          <PromoCard tone="brand" eyebrow="New" title="voice cloning is here" description="read three paragraphs and edit in your own voice" />
        </Preview>
      </Section>
    </>
  )
}

function IconTilePage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Navigation" title="Icon Tile" description="Labelled icon buttons in a grid, as on CRED's explore and bills screens: dark circular wells with line icons, square tiles with coloured icons, and white circles for brand logos. A tiny green tag can sit under the well.">
        <CredRefs refs={CRED_REFS['icon-tile']} />
      </PageHeader>
      <Section title="Circle (explore)">
        <Preview center={false} contentClassName="max-w-md">
          <IconTileGrid className="w-full">
            <IconTile icon={<MicIcon />} label="record" tag="new" />
            <IconTile icon={<UploadIcon />} label="upload audio" />
            <IconTile icon={<ScissorsIcon />} label="edit transcript" />
            <IconTile icon={<LayersIcon />} label="view all" />
          </IconTileGrid>
        </Preview>
      </Section>
      <Section title="Square (topics) and logo (partners)">
        <Preview center={false} contentClassName="flex-col gap-10 max-w-md">
          <IconTileGrid columns={3} className="w-full">
            <IconTile shape="square" size="lg" icon={<BookOpenIcon className="text-success" />} label="getting started" />
            <IconTile shape="square" size="lg" icon={<CreditCardIcon className="text-warning" />} label="billing & refunds" />
            <IconTile shape="square" size="lg" icon={<HeadphonesIcon className="text-brand-ink" />} label="audio quality" />
          </IconTileGrid>
          <IconTileGrid className="w-full">
            {['Spotify', 'Apple', 'YouTube', 'RSS'].map((n) => <IconTile key={n} shape="logo" size="sm" icon={<span className="text-[9px] font-extrabold">{n}</span>} label={n} />)}
          </IconTileGrid>
        </Preview>
      </Section>
    </>
  )
}

function MediaCardPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Cards" title="Media Card" description="Image-led cards from CRED's store, travel and offers. MediaCard overlays a caps eyebrow and serif title, or pins a white info box to the bottom. ProductCard is square art, brand, name and Price. OfferCard puts a logo badge on the image.">
        <CredRefs refs={CRED_REFS['media-card']} />
      </PageHeader>
      <Section title="Media card">
        <Preview center={false} contentClassName="grid grid-cols-2 gap-5 max-w-lg">
          <MediaCard image={art('#2ce6e0', '#0b3b3a')} eyebrow="Series" title="the quiet room" caption="12 episodes · weekly" />
          <MediaCard image={art('#7c5cff', '#160c3d')} badge={<Badge variant="brand">Pick</Badge>}>
            <p className="text-caps text-[9px] tracking-[0.2em]">2 hosts • 48 min</p>
            <Price value={0} original={499} currency="INR" className="justify-center" />
            <Badge variant="success-soft" className="mx-auto mt-1">Free this week</Badge>
          </MediaCard>
        </Preview>
      </Section>
      <Section title="Product and offer">
        <Preview center={false} contentClassName="grid grid-cols-3 gap-4 max-w-xl">
          <ProductCard image={art('#f6b800', '#b35a00')} brand="Sonicly" name="Studio mic preset pack" price={599} original={2999} />
          <ProductCard image={art('#ff7a59', '#7a1f0b')} brand="Sonicly" name="Lo-fi music bed bundle" price={349} original={999} action={<Button variant="ghost" className="w-full justify-between rounded-none">Add to cart <ArrowRightIcon /></Button>} />
          <OfferCard image={art('#06c270', '#03432a')} logo={<AudioLinesIcon className="size-5 text-pop-black" />} name="Pro" offer="2 months free on yearly" />
        </Preview>
      </Section>
    </>
  )
}

function TicketCardPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Cards" title="Ticket Card" description="CRED's voucher: scalloped top and bottom edges, notches at the perforation and a dotted tear line. Brand and offer above the line, the action below. Expired tickets turn grey.">
        <CredRefs refs={CRED_REFS['ticket-card']} />
      </PageHeader>
      <Section title="Active and expired">
        <Preview contentClassName="gap-6">
          <TicketCard className="w-44" logo={<SparklesIcon className="size-5 text-pop-black" />} category="Pro plan" title="you won 1 free month of Sonicly Pro" />
          <TicketCard className="w-44" logo={<HeadphonesIcon className="size-5 text-pop-black" />} category="Partner" title="20% off studio headphones" status="Already expired" expired />
        </Preview>
      </Section>
    </>
  )
}

function ReceiptPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Feedback" title="Receipt" description="The confirmation after a payment or export: a coloured band behind a check and payee pair, a paper card with the serif title, a big amount, a caps reference and a vertical monospace stamp, and actions at the foot.">
        <CredRefs refs={CRED_REFS.receipt} />
      </PageHeader>
      <Section title="Example">
        <Preview single padded={false}>
          <div className="w-full max-w-[360px] bg-pop-black">
            <Receipt
              status="Paid instantly · 0.67 sec"
              title="Sonicly Pro · yearly"
              amount="₹7,000"
              reference="Txn ID: 4Q8DEZ0XDPW1"
              stamp="11:52am · 10 oct '26"
              avatar={<AudioLinesIcon className="size-5" />}
              actions={<><Button variant="outline" size="sm" className="border-pop-black text-pop-black hover:bg-black/5">Share</Button><Button size="sm" className="bg-pop-black text-white">View invoice</Button></>}
            />
          </div>
        </Preview>
      </Section>
    </>
  )
}

function TrustFooterPage() {
  const logos = ['VISA', 'MC', 'RuPay', 'UPI', 'PCI']
  return (
    <>
      <PageHeader eyebrow="From CRED · Feedback" title="Trust Footer" description="The reassurance line at the foot of sensitive screens: 'powered by' partners, encryption with a row of small logo tiles, or the shield line.">
        <CredRefs refs={CRED_REFS['trust-footer']} />
      </PageHeader>
      <Section title="Variants">
        <Preview center={false} contentClassName="flex-col gap-4 max-w-md">
          <TrustFooter logos={logos} />
          <TrustFooter variant="powered" logos={['OpenAI', 'ElevenLabs']} />
          <TrustFooter variant="protect" />
        </Preview>
      </Section>
    </>
  )
}

function StepTrackPage() {
  const [i, setI] = useState(0)
  return (
    <>
      <PageHeader eyebrow="From CRED · Feedback" title="Step Track" description="Milestones joined by a line. Finished nodes turn green with a check, and each can carry a caps reward under it. CRED uses 3D hexagonal 'cube' nodes on dark surfaces and dots for levels. PageDots are the pagers: square (onboarding), dot (carousels) and line (galleries).">
        <CredRefs refs={CRED_REFS['step-track']} />
      </PageHeader>
      <Section title="Step track">
        <Preview center={false} contentClassName="flex-col gap-10 max-w-md">
          <StepTrack value={1} steps={[{ reward: '1 export' }, { reward: 'earn 2' }, {}, {}, {}]} label="Publishing streak" />
          <StepTrack variant="dot" value={1} steps={[{ label: 'Level 1' }, { label: 'Level 2' }, { label: 'Level 3' }, { label: 'Level 4' }]} label="Referral levels" />
        </Preview>
      </Section>
      <Section title="Page dots">
        <Preview center={false}>
          <StateGrid columns={3} states={[
            { label: 'square', node: <PageDots index={i} onSelect={setI} /> },
            { label: 'dot', node: <PageDots variant="dot" count={5} index={i} onSelect={setI} /> },
            { label: 'line', node: <PageDots variant="line" count={4} index={i} onSelect={setI} /> },
          ]} />
        </Preview>
      </Section>
    </>
  )
}

function GaugePage() {
  const [v, setV] = useState(72)
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Gauge" description="A score ring: a 270° arc with a dot at its tip, the number in the middle with a caps rating, and the range below. CRED uses it for credit score; in Sonicly it shows audio quality. tone='auto' colours by band.">
        <CredRefs refs={CRED_REFS.gauge} />
      </PageHeader>
      <Section title="Bands">
        <Preview contentClassName="gap-10">
          <Gauge value={28} label="Audio quality" rating="Poor" />
          <Gauge value={54} label="Audio quality" rating="Average" />
          <Gauge value={v} label="Audio quality" rating={v >= 80 ? 'Great' : 'Good'} size={180} />
          <Gauge value={94} label="Audio quality" rating="Great" size={110} showRange={false} />
        </Preview>
        <div className="mt-4 flex gap-2"><Button size="sm" variant="outline" onClick={() => setV((x) => Math.max(0, x - 10))}>−10</Button><Button size="sm" variant="outline" onClick={() => setV((x) => Math.min(100, x + 10))}>+10</Button></div>
      </Section>
    </>
  )
}

function FlipCounterPage() {
  const [n, setN] = useState(715)
  return (
    <>
      <PageHeader eyebrow="From CRED · Data" title="Flip Counter" description="Split-flap digits on dark tiles with a hinge line. A digit drops in when it changes. Good for streaks and milestones.">
        <CredRefs refs={CRED_REFS['flip-counter']} />
      </PageHeader>
      <Section title="Example">
        <Preview single contentClassName="flex-col">
          <FlipCounter value={n} minDigits={3} caption={<>days of<br />daily publishing</>} />
          <Button size="sm" variant="outline" onClick={() => setN((x) => x + 1)}>Add a day</Button>
        </Preview>
      </Section>
    </>
  )
}

function StatusScreenPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Feedback" title="Status Screen" description="Full-bleed moments between steps: success (a check in concentric rings), loading (a pulsing ring with a serif line), error, and celebrate (a radial burst behind a bold display word). tone='green' paints the screen success green.">
        <CredRefs refs={CRED_REFS['status-screen']} />
      </PageHeader>
      <Section title="States">
        <Preview single center={false} padded={false} contentClassName="grid grid-cols-1 gap-px bg-border md:grid-cols-2">
          <StatusScreen state="success" title="your episode is ready to publish." />
          <StatusScreen state="loading" eyebrow="Rendering" title="cleaning up your audio at top speed" />
          <StatusScreen tone="green" state="success" title="export complete"><p className="text-xs font-medium opacity-60">do not close the app just yet</p></StatusScreen>
          <StatusScreen state="celebrate" display="Great take!"><p className="text-sm font-semibold"><span className="text-success">0 retakes</span> needed. the mark of a pro.</p></StatusScreen>
        </Preview>
      </Section>
    </>
  )
}

function ActionSheetPage() {
  return (
    <>
      <PageHeader eyebrow="From CRED · Overlays" title="Action Sheet" description="CRED's bottom sheets on Drawer. ActionSheet: a caps title over rows with a square icon tile, title, muted subtitle and long arrow. ConfirmSheet: a bold question, a muted explanation, an optional note and two actions, stacked or side by side. The warning tone adds a red caps eyebrow.">
        <CredRefs refs={CRED_REFS['action-sheet']} />
      </PageHeader>
      <Section title="Open a sheet">
        <Preview single>
          <ActionSheet
            trigger={<Button variant="outline">Actions on project</Button>}
            title="Actions on your project"
            actions={[
              { icon: <DownloadIcon />, title: 'export audio', description: 'MP3, WAV or M4A' },
              { icon: <ShareIcon />, title: 'share a clip', description: 'pick up to 60 seconds' },
              { icon: <CopyIcon />, title: 'duplicate project', description: 'keeps every version' },
              { icon: <PhoneIcon />, title: 'talk to us', description: 'contact Sonicly support' },
            ]}
          />
          <ConfirmSheet
            trigger={<Button variant="outline">Delete project</Button>}
            title="are you sure you want to delete this project?"
            description="you won't be able to restore its versions or exports once it's deleted."
            note={<><InfoIcon />you cannot undo this action</>}
            confirmLabel="Delete project"
            cancelLabel="I changed my mind"
          />
          <ConfirmSheet trigger={<Button variant="outline">Log out</Button>} layout="inline" title="are you sure, you want to logout?" confirmLabel="Cancel" cancelLabel="Yes, logout" />
          <ConfirmSheet trigger={<Button variant="outline">Change plan</Button>} tone="warning" title="this will change your bill amount" description="please note that this action cannot be reversed" confirmLabel="Update plan">
            <div className="text-left">
              <SummaryTable><SummaryRow label="current plan" description="renews 1st oct">₹799</SummaryRow><SummaryRow label="team plan" tone="positive">₹2,999</SummaryRow></SummaryTable>
            </div>
          </ConfirmSheet>
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage dos={['Put the safer action in the outlined button.', 'Ask the question in the title, in plain words.']} donts={['Stack more than two buttons.', 'Use a sheet for a single confirmation that can be undone; use a toast.']} />
      </Section>
    </>
  )
}

const TOUR = [
  { title: 'Your smart editor', body: 'edit your audio by editing the words.' },
  { title: 'Studio sound', body: 'one tap removes echo, hum and background noise.' },
  { title: 'Versions', body: 'every edit is saved. go back any time.' },
  { title: 'Export', body: 'MP3, WAV or video, sized for every platform.' },
]

function TourPage() {
  const [step, setStep] = useState(0)
  return (
    <>
      <PageHeader eyebrow="From CRED · Overlays" title="Tour" description="CRED's product-tour panel: a dark card with a green progress line on its top edge, a caps step title with a 01/04 counter, a monospace body, and caps NEXT → / FINISH →.">
        <CredRefs refs={CRED_REFS.tour} />
      </PageHeader>
      <Section title="Example">
        <Preview single padded={false}>
          <div className="w-full max-w-[360px]"><TourPanel steps={TOUR} step={step} onStepChange={setStep} onFinish={() => setStep(0)} /></div>
        </Preview>
      </Section>
    </>
  )
}

function QuickRepliesPage() {
  const [sent, setSent] = useState(null)
  return (
    <>
      <PageHeader eyebrow="From CRED · Chat" title="Quick Replies" description="Suggested answers under a bot message: left-aligned outlined boxes, one per line, that send their text when tapped.">
        <CredRefs refs={CRED_REFS['quick-replies']} />
      </PageHeader>
      <Section title="Example">
        <Preview single center={false} contentClassName="flex-col gap-4 max-w-md">
          <Bubble><BubbleContent>hi! I can help you fix your recording. what's going on?</BubbleContent></Bubble>
          {sent ? (
            <Bubble align="end"><BubbleContent>{sent}</BubbleContent></Bubble>
          ) : (
            <QuickReplies options={['there is background noise', 'the volume keeps changing', 'I want to remove ums', 'something else']} onSelect={setSent} />
          )}
        </Preview>
      </Section>
    </>
  )
}

export const CRED_DEMOS_B = [
  { slug: 'transaction-row', title: 'Transaction Row', isNew: true, Page: TransactionRowPage },
  { slug: 'key-value', title: 'Key Value & Summary', isNew: true, Page: KeyValuePage },
  { slug: 'numbered-list', title: 'Numbered List', isNew: true, Page: NumberedListPage },
  { slug: 'swipe-row', title: 'Swipe Row', isNew: true, Page: SwipeRowPage },
  { slug: 'promo-card', title: 'Promo Card', isNew: true, Page: PromoCardPage },
  { slug: 'icon-tile', title: 'Icon Tile', isNew: true, Page: IconTilePage },
  { slug: 'media-card', title: 'Media Card', isNew: true, Page: MediaCardPage },
  { slug: 'ticket-card', title: 'Ticket Card', isNew: true, Page: TicketCardPage },
  { slug: 'receipt', title: 'Receipt', isNew: true, Page: ReceiptPage },
  { slug: 'trust-footer', title: 'Trust Footer', isNew: true, Page: TrustFooterPage },
  { slug: 'step-track', title: 'Step Track', isNew: true, Page: StepTrackPage },
  { slug: 'gauge', title: 'Gauge', isNew: true, Page: GaugePage },
  { slug: 'flip-counter', title: 'Flip Counter', isNew: true, Page: FlipCounterPage },
  { slug: 'status-screen', title: 'Status Screen', isNew: true, Page: StatusScreenPage },
  { slug: 'action-sheet', title: 'Action Sheet', isNew: true, Page: ActionSheetPage },
  { slug: 'tour', title: 'Tour', isNew: true, Page: TourPage },
  { slug: 'quick-replies', title: 'Quick Replies', isNew: true, Page: QuickRepliesPage },
]
