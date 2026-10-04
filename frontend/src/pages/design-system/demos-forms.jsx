import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, CopyIcon, LinkIcon, MicIcon, SearchIcon, SendIcon, Volume1Icon, Volume2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxInput,
  ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor,
} from '@/components/ui/combobox'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle,
} from '@/components/ui/field'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireChoices,
  QuestionnaireDescription, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress,
  QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle,
} from '@/components/ui/questionnaire'
import { Kbd } from '@/components/ui/kbd'
import { PageHeader, Preview, Section, StateGrid, Usage } from './kit'

const W = 'w-full max-w-64'

function InputPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Input" description="A square field on a hairline. Focus turns the border solid and draws a 2px rule along the bottom — NeoPOP's input language." />
      <Section title="States">
        <Preview>
          <StateGrid columns={3} states={[
            { label: 'Empty', node: <Input className={W} placeholder="Episode title" /> },
            { label: 'Filled', node: <Input className={W} defaultValue="Ep. 42 — The quiet room" /> },
            { label: 'Hover', node: <Input className={`${W} border-muted-foreground/60`} placeholder="Episode title" /> },
            { label: 'Focus', node: <Input className={`${W} border-foreground shadow-[inset_0_-2px_0_0_var(--foreground)]`} defaultValue="Ep. 42" /> },
            { label: 'Invalid', node: <Input className={W} aria-invalid defaultValue="ep 42!!" /> },
            { label: 'Disabled', node: <Input className={W} disabled defaultValue="Locked while exporting" /> },
          ]} />
        </Preview>
      </Section>
      <Section title="Types">
        <Preview>
          <Input className={W} type="email" placeholder="you@studio.fm" />
          <Input className={W} type="password" placeholder="Password" />
          <Input className={W} type="number" placeholder="−16" />
          <Input className={W} type="file" />
        </Preview>
      </Section>
    </>
  )
}

function TextareaPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Textarea" description="Grows with content. Same focus rule as inputs." />
      <Section title="States">
        <Preview>
          <StateGrid columns={3} states={[
            { label: 'Default', node: <Textarea className="w-72" placeholder="Describe the change — e.g. 'remove the ums and make my voice warmer'" /> },
            { label: 'Focus', node: <Textarea className="w-72 border-foreground shadow-[inset_0_-2px_0_0_var(--foreground)]" defaultValue="Cut the intro music after 0:12" /> },
            { label: 'Invalid', node: <Textarea className="w-72" aria-invalid defaultValue="" placeholder="Required" /> },
            { label: 'Disabled', node: <Textarea className="w-72" disabled defaultValue="Read-only notes" /> },
          ]} />
        </Preview>
      </Section>
    </>
  )
}

function LabelPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Label" description="Semibold 13px, sits 8px above its control. Clicking it focuses the control." />
      <Section title="Examples">
        <Preview>
          {(s) => (
            <>
              <div className="grid gap-2"><Label htmlFor={`ds-l1-${s}`}>Project name</Label><Input id={`ds-l1-${s}`} className={W} placeholder="Untitled" /></div>
              <div className="flex items-center gap-2.5"><Checkbox id={`ds-l2-${s}`} /><Label htmlFor={`ds-l2-${s}`}>Remove filler words</Label></div>
              <div className="flex items-center gap-2.5"><Checkbox id={`ds-l3-${s}`} disabled /><Label htmlFor={`ds-l3-${s}`}>Disabled option</Label></div>
            </>
          )}
        </Preview>
      </Section>
    </>
  )
}

const formSchema = z.object({
  title: z.string().min(3, 'Give it at least 3 characters.'),
  email: z.string().email('That email doesn’t look right.'),
})

function FieldPage() {
  const form = useForm({ resolver: zodResolver(formSchema), defaultValues: { title: '', email: '' } })
  return (
    <>
      <PageHeader eyebrow="Forms" title="Field" description="Composable label + control + help + error. Use FieldSet/FieldGroup for whole forms; Form wires it to react-hook-form + zod." />
      <Section title="Field set">
        <Preview center={false}>
          {(sc) => (
          <FieldSet className="w-full max-w-md">
            <FieldLegend>Export defaults</FieldLegend>
            <FieldDescription>Applied to every new export. You can change them per file.</FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`ds-f1-${sc}`}>File name pattern</FieldLabel>
                <Input id={`ds-f1-${sc}`} defaultValue="{project}_{date}" />
                <FieldDescription>Use {'{project}'}, {'{date}'} and {'{version}'}.</FieldDescription>
              </Field>
              <Field data-invalid="true">
                <FieldLabel htmlFor={`ds-f2-${sc}`}>Target loudness</FieldLabel>
                <Input id={`ds-f2-${sc}`} aria-invalid defaultValue="-3" />
                <FieldError>Podcasts should sit between −19 and −14 LUFS.</FieldError>
              </Field>
              <FieldSeparator>Options</FieldSeparator>
              <Field orientation="horizontal">
                <Switch id={`ds-f3-${sc}`} defaultChecked />
                <FieldContent>
                  <FieldLabel htmlFor={`ds-f3-${sc}`}>Normalise loudness</FieldLabel>
                  <FieldDescription>Match the platform target automatically.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
          )}
        </Preview>
      </Section>
      <Section title="Choice cards">
        <Preview center={false}>
          {(sc) => (
          <RadioGroup defaultValue="pod" className="w-full max-w-md">
            {[['pod', 'Podcast', '−16 LUFS · stereo'], ['yt', 'YouTube', '−14 LUFS · voice boost'], ['raw', 'Keep original', 'No loudness change']].map(([v, t, d]) => (
              <FieldLabel key={v} htmlFor={`ds-c-${v}-${sc}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t}</FieldTitle>
                    <FieldDescription>{d}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={v} id={`ds-c-${v}-${sc}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          )}
        </Preview>
      </Section>
      <Section title="Form (react-hook-form + zod)">
        <Preview center={false}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((v) => toast.success('Saved', { description: `${v.title} · ${v.email}` }))}
              className="grid w-full max-w-md gap-5"
            >
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Show title</FormLabel>
                  <FormControl><Input placeholder="The Quiet Room" {...field} /></FormControl>
                  <FormDescription>Shown on every episode page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact email</FormLabel>
                  <FormControl><Input placeholder="host@studio.fm" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div><Button type="submit">Save show</Button></div>
            </form>
          </Form>
        </Preview>
      </Section>
    </>
  )
}

function CheckboxPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Checkbox" description="Square box; checking inverts it to solid and pops the tick in." />
      <Section title="States">
        <Preview>
          <StateGrid columns={6} states={[
            { label: 'Off', node: <Checkbox aria-label="off" /> },
            { label: 'Hover', node: <Checkbox aria-label="hover" className="border-foreground" /> },
            { label: 'On', node: <Checkbox aria-label="on" defaultChecked /> },
            { label: 'Mixed', node: <Checkbox aria-label="mixed" checked="indeterminate" /> },
            { label: 'Invalid', node: <Checkbox aria-label="invalid" aria-invalid /> },
            { label: 'Disabled', node: <Checkbox aria-label="disabled" disabled defaultChecked /> },
          ]} />
        </Preview>
      </Section>
      <Section title="With labels">
        <Preview center={false}>
          {(sc) => (
            <div className="grid gap-3.5">
              {['Remove filler words', 'Cut long silences', 'Reduce background noise'].map((l, i) => (
                <div key={l} className="flex items-center gap-2.5">
                  <Checkbox id={`ds-cb-${i}-${sc}`} defaultChecked={i !== 1} />
                  <Label htmlFor={`ds-cb-${i}-${sc}`}>{l}</Label>
                </div>
              ))}
            </div>
          )}
        </Preview>
      </Section>
    </>
  )
}

function RadioGroupPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Radio group" description="Circles stay circles — the one shape the grid allows besides avatars." />
      <Section title="Default">
        <Preview>
          {(sc) => (<>
          <RadioGroup defaultValue="mp3">
            {[['mp3', 'MP3 · 320 kbps'], ['wav', 'WAV · 24-bit lossless'], ['m4a', 'M4A · AAC 256 kbps']].map(([v, l]) => (
              <div key={v} className="flex items-center gap-2.5"><RadioGroupItem value={v} id={`ds-r-${v}-${sc}`} /><Label htmlFor={`ds-r-${v}-${sc}`}>{l}</Label></div>
            ))}
          </RadioGroup>
          <StateGrid columns={4} states={[
            { label: 'Off', node: <RadioGroup><RadioGroupItem value="x" aria-label="off" /></RadioGroup> },
            { label: 'On', node: <RadioGroup defaultValue="x"><RadioGroupItem value="x" aria-label="on" /></RadioGroup> },
            { label: 'Invalid', node: <RadioGroup><RadioGroupItem value="x" aria-invalid aria-label="invalid" /></RadioGroup> },
            { label: 'Disabled', node: <RadioGroup defaultValue="x" disabled><RadioGroupItem value="x" aria-label="disabled" /></RadioGroup> },
          ]} />
          </>)}
        </Preview>
      </Section>
    </>
  )
}

function SwitchPage() {
  const [on, setOn] = useState(true)
  return (
    <>
      <PageHeader eyebrow="Forms" title="Switch" description="A square thumb that snaps across with a little overshoot. On lights the track in Sonic aqua." />
      <Section title="States">
        <Preview>
          <StateGrid columns={5} states={[
            { label: 'Off', node: <Switch aria-label="off" /> },
            { label: 'On', node: <Switch aria-label="on" defaultChecked /> },
            { label: 'Small', node: <Switch aria-label="small" size="sm" defaultChecked /> },
            { label: 'Focus', node: <Switch aria-label="focus" className="outline-2 outline-solid outline-offset-2 outline-ring" /> },
            { label: 'Disabled', node: <Switch aria-label="disabled" disabled defaultChecked /> },
          ]} />
        </Preview>
      </Section>
      <Section title="Setting row">
        <Preview center={false}>
          <div className="flex w-full max-w-md items-center justify-between border border-border bg-card p-4">
            <div>
              <p className="text-sm font-bold">Auto-enhance on upload</p>
              <p className="text-[13px] text-muted-foreground">{on ? 'New uploads are cleaned automatically.' : 'You’ll clean audio manually.'}</p>
            </div>
            <Switch checked={on} onCheckedChange={setOn} aria-label="Auto-enhance" />
          </div>
        </Preview>
      </Section>
    </>
  )
}

function SliderPage() {
  const [vol, setVol] = useState([72])
  return (
    <>
      <PageHeader eyebrow="Forms" title="Slider" description="A fader cap on a hairline track — a nod to the mixing desk. The cap grows while dragged." />
      <Section title="Examples">
        <Preview center={false} contentClassName="flex-col gap-8">
          <div className="flex w-full max-w-md items-center gap-3">
            <Volume1Icon className="size-4 text-muted-foreground" />
            <Slider value={vol} onValueChange={setVol} max={100} aria-label="Volume" />
            <Volume2Icon className="size-4 text-muted-foreground" />
            <span className="w-8 text-right font-mono text-[12px] tabular">{vol[0]}</span>
          </div>
          <div className="w-full max-w-md"><Slider defaultValue={[20, 70]} aria-label="Trim range" tone="brand" /></div>
          <div className="w-full max-w-md"><Slider defaultValue={[40]} disabled aria-label="Disabled" /></div>
          <div className="flex h-40 gap-8">
            {[30, 65, 45, 80, 55].map((v, i) => <Slider key={i} orientation="vertical" defaultValue={[v]} aria-label={`Band ${i + 1}`} />)}
          </div>
        </Preview>
      </Section>
    </>
  )
}

function SelectPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Select" description="The list opens as a floating layer with a solid extrusion; the highlighted row inverts like a pressed key." />
      <Section title="Default">
        <Preview>
          <Select defaultValue="16">
            <SelectTrigger className="w-60"><SelectValue placeholder="Target loudness" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Podcast</SelectLabel>
                <SelectItem value="16">−16 LUFS · Apple / Spotify</SelectItem>
                <SelectItem value="19">−19 LUFS · Mono speech</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Video</SelectLabel>
                <SelectItem value="14">−14 LUFS · YouTube</SelectItem>
                <SelectItem value="23" disabled>−23 LUFS · Broadcast (Pro)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger size="sm" className="w-40"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="edited">Last edited</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
          <Select disabled><SelectTrigger className="w-40"><SelectValue placeholder="Disabled" /></SelectTrigger></Select>
          <Select><SelectTrigger className="w-40" aria-invalid><SelectValue placeholder="Invalid" /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>
        </Preview>
      </Section>
    </>
  )
}

function NativeSelectPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Native select" description="The browser's own picker, styled to match. Best on mobile and for long, simple lists." />
      <Section title="Examples">
        <Preview>
          <NativeSelect defaultValue="1">
            <NativeSelectOption value="1">1× speed</NativeSelectOption>
            <NativeSelectOption value="1.25">1.25×</NativeSelectOption>
            <NativeSelectOption value="1.5">1.5×</NativeSelectOption>
            <NativeSelectOption value="2">2×</NativeSelectOption>
          </NativeSelect>
          <NativeSelect size="sm" defaultValue="mp3"><NativeSelectOption value="mp3">MP3</NativeSelectOption><NativeSelectOption value="wav">WAV</NativeSelectOption></NativeSelect>
          <NativeSelect disabled><NativeSelectOption>Disabled</NativeSelectOption></NativeSelect>
        </Preview>
      </Section>
    </>
  )
}

const VOICES = ['Warm narrator', 'Bright host', 'Deep anchor', 'Soft storyteller', 'Energetic promo', 'Calm explainer']

function ComboboxPage() {
  const anchor = useComboboxAnchor()
  return (
    <>
      <PageHeader eyebrow="Forms" title="Combobox" description="Type to filter, arrow to move, enter to pick. Multiple selection collects chips that pop in." />
      <Section title="Single">
        <Preview>
          <Combobox items={VOICES}>
            <ComboboxInput placeholder="Pick a voice" className="w-64" />
            <ComboboxContent>
              <ComboboxEmpty>No voice matches.</ComboboxEmpty>
              <ComboboxList>{(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Preview>
      </Section>
      <Section title="Multiple">
        <Preview>
          <Combobox multiple autoHighlight items={VOICES} defaultValue={[VOICES[0], VOICES[2]]}>
            <ComboboxChips ref={anchor} className="w-full max-w-sm">
              <ComboboxValue>
                {(values) => (
                  <>
                    {values.map((v) => <ComboboxChip key={v}>{v}</ComboboxChip>)}
                    <ComboboxChipsInput placeholder="Add voice" />
                  </>
                )}
              </ComboboxValue>
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>No voice matches.</ComboboxEmpty>
              <ComboboxList>{(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}</ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Preview>
      </Section>
    </>
  )
}

function InputOtpPage() {
  const [code, setCode] = useState('482')
  return (
    <>
      <PageHeader eyebrow="Forms" title="Input OTP" description="Each digit is its own key in mono; the active slot shows an aqua base line and a blinking caret." />
      <Section title="Examples">
        <Preview contentClassName="flex-col gap-8">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0, 1, 2].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
          <InputOTP maxLength={4} disabled value="12">
            <InputOTPGroup>{[0, 1, 2, 3].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
          </InputOTP>
        </Preview>
      </Section>
    </>
  )
}

function InputGroupPage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Input group" description="Icons, text and buttons that live inside the field's rule." />
      <Section title="Examples">
        <Preview center={false} contentClassName="grid max-w-md gap-4">
          <InputGroup>
            <InputGroupAddon><SearchIcon /></InputGroupAddon>
            <InputGroupInput placeholder="Search projects" />
            <InputGroupAddon align="inline-end"><Kbd>⌘K</Kbd></InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupAddon><LinkIcon /></InputGroupAddon>
            <InputGroupInput defaultValue="sonicly.fm/s/ep42" readOnly />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Copy" onClick={() => toast('Link copied')}><CopyIcon /></InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput placeholder="Loudness" defaultValue="-16" />
            <InputGroupAddon align="inline-end"><InputGroupText>LUFS</InputGroupText></InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupTextarea placeholder="Ask Sonicly to change something…" />
            <InputGroupAddon align="block-end" className="border-t border-border">
              <InputGroupButton size="icon-xs" aria-label="Dictate"><MicIcon /></InputGroupButton>
              <InputGroupText className="ml-auto text-[11px]">Enter to send</InputGroupText>
              <InputGroupButton size="icon-xs" variant="default" aria-label="Send"><SendIcon /></InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Preview>
      </Section>
    </>
  )
}

function CalendarPage() {
  const [date, setDate] = useState(new Date())
  const [range, setRange] = useState({ from: new Date(), to: new Date(Date.now() + 4 * 864e5) })
  return (
    <>
      <PageHeader eyebrow="Forms" title="Calendar" description="Selected days invert; today gets an aqua base line; ranges fill with the hover surface." />
      <Section title="Single & range">
        <Preview>
          <Calendar mode="single" selected={date} onSelect={setDate} className="border border-border bg-card" />
          <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={1} className="border border-border bg-card" />
        </Preview>
      </Section>
    </>
  )
}

function DatePickerPage() {
  const [date, setDate] = useState()
  return (
    <>
      <PageHeader eyebrow="Forms" title="Date picker" description="Popover + Calendar. Used for scheduling a publish." />
      <Section title="Default">
        <Preview>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-64 justify-start font-medium">
                <CalendarIcon />{date ? format(date, 'EEE d MMM yyyy') : <span className="text-muted-foreground">Schedule publish</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
        </Preview>
      </Section>
    </>
  )
}

function QuestionnairePage() {
  return (
    <>
      <PageHeader eyebrow="Forms" title="Questionnaire" description="One question at a time — for onboarding and feedback. Choices are full-width keys with number shortcuts." />
      <Section title="Onboarding">
        <Preview center={false}>
          <Questionnaire
            className="w-full max-w-lg"
            shortcuts="numbers"
            onSubmit={(e) => { e.preventDefault(); toast.success('Thanks — your workspace is ready') }}
          >
            <QuestionnaireProgress />
            <QuestionnaireItem name="kind" required>
              <QuestionnaireTitle>What do you make?</QuestionnaireTitle>
              <QuestionnaireDescription>We’ll tune the defaults for it.</QuestionnaireDescription>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="podcast">Podcasts<QuestionnaireChoiceDescription>Long-form talk, interviews</QuestionnaireChoiceDescription></QuestionnaireChoice>
                <QuestionnaireChoice value="video">Talking-head video<QuestionnaireChoiceDescription>YouTube, courses</QuestionnaireChoiceDescription></QuestionnaireChoice>
                <QuestionnaireChoice value="music">Music & voice-over<QuestionnaireChoiceDescription>Short, polished takes</QuestionnaireChoiceDescription></QuestionnaireChoice>
              </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireItem name="pain" multiple>
              <QuestionnaireTitle>What slows you down?</QuestionnaireTitle>
              <QuestionnaireChoices>
                <QuestionnaireChoice value="noise">Background noise</QuestionnaireChoice>
                <QuestionnaireChoice value="fillers">Ums and ahs</QuestionnaireChoice>
                <QuestionnaireChoice value="levels">Uneven levels</QuestionnaireChoice>
              </QuestionnaireChoices>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <QuestionnairePrevious />
              <QuestionnaireSkip />
              <QuestionnaireNext />
              <QuestionnaireSubmit>Finish</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage dos={['Ask one thing per step.', 'Let people skip anything optional.']} donts={['Use it for settings people edit often — use Field instead.']} />
      </Section>
    </>
  )
}

export const FORM_DEMOS = [
  { slug: 'input', title: 'Input', Page: InputPage },
  { slug: 'textarea', title: 'Textarea', Page: TextareaPage },
  { slug: 'label', title: 'Label', Page: LabelPage },
  { slug: 'field', title: 'Field', Page: FieldPage },
  { slug: 'checkbox', title: 'Checkbox', Page: CheckboxPage },
  { slug: 'radio-group', title: 'Radio Group', Page: RadioGroupPage },
  { slug: 'switch', title: 'Switch', Page: SwitchPage },
  { slug: 'slider', title: 'Slider', Page: SliderPage },
  { slug: 'select', title: 'Select', Page: SelectPage },
  { slug: 'native-select', title: 'Native Select', Page: NativeSelectPage },
  { slug: 'combobox', title: 'Combobox', Page: ComboboxPage },
  { slug: 'input-otp', title: 'Input OTP', Page: InputOtpPage },
  { slug: 'input-group', title: 'Input Group', Page: InputGroupPage },
  { slug: 'calendar', title: 'Calendar', Page: CalendarPage },
  { slug: 'date-picker', title: 'Date Picker', Page: DatePickerPage },
  { slug: 'questionnaire', title: 'Questionnaire', Page: QuestionnairePage },
]

