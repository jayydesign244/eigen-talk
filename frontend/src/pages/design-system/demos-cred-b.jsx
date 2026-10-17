import { useState } from 'react'
import {
  ArrowRightIcon, AudioLinesIcon, BookOpenIcon, CopyIcon, CreditCardIcon, DownloadIcon, FileAudioIcon, HeadphonesIcon, InfoIcon, LayersIcon,
  MicIcon, PencilIcon, PhoneIcon, RadioIcon, RotateCcwIcon, ScissorsIcon, ShareIcon, SparklesIcon, TrashIcon, UploadIcon, Wand2Icon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { KeyValue, KeyValueGrid, SummaryRow, SummaryTable, SummaryTotal } from '@/components/ui/key-value'
import { Gauge } from '@/components/ui/gauge'
import { StatusScreen } from '@/components/ui/status-screen'
import { TourPanel } from '@/components/ui/tour'
import { QuickReplies } from '@/components/ui/quick-replies'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Badge } from '@/components/ui/badge'
import { CredRefs, PageHeader, Preview, Section, StateGrid, Usage } from './kit'
import { CRED_REFS } from './cred-refs'

/** Gradient placeholder art so the demos need no external images. */
const art = (a, b, angle = 160) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><linearGradient id="g" gradientTransform="rotate(${angle - 90} .5 .5)"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="500" fill="url(#g)"/><circle cx="300" cy="120" r="70" fill="#fff" fill-opacity=".18"/><path d="M0 380 Q100 330 200 380 T400 380 V500 H0Z" fill="#000" fill-opacity=".18"/></svg>`
  )}`

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
  { slug: 'key-value', title: 'Key Value & Summary', isNew: true, Page: KeyValuePage },
  { slug: 'gauge', title: 'Gauge', isNew: true, Page: GaugePage },
  { slug: 'status-screen', title: 'Status Screen', isNew: true, Page: StatusScreenPage },
  { slug: 'tour', title: 'Tour', isNew: true, Page: TourPage },
  { slug: 'quick-replies', title: 'Quick Replies', isNew: true, Page: QuickRepliesPage },
]
