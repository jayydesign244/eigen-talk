import { useMemo, useState } from 'react'
import {
  flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable,
} from '@tanstack/react-table'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts'
import {
  AlertTriangleIcon, ArrowUpDownIcon, AudioLinesIcon, CheckCircle2Icon, ChevronRightIcon, FileAudioIcon, InfoIcon,
  MicIcon, MoreHorizontalIcon, OctagonXIcon, UploadIcon,
} from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@/components/ui/avatar'
import {
  Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle,
} from '@/components/ui/item'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Marker, MarkerContent, MarkerIcon } from '@/components/ui/marker'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { PageHeader, Preview, Section, Usage } from './kit'

function CardPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Card" description="CRED's card: 16px corners on a 0.8px hairline. Flat for dense layouts, elevated on a soft shadow, interactive lifts on hover and settles when clicked." />
      <Section title="Variants">
        <Preview contentClassName="items-stretch gap-8">
          {[['flat', 'Flat', 'Dense content'], ['elevated', 'Elevated', 'Groups a task'], ['interactive', 'Interactive', 'The whole card is a link']].map(([v, t, d]) => (
            <Card key={v} variant={v} className="w-60">
              <CardHeader><CardTitle>{t}</CardTitle><CardDescription>{d}</CardDescription></CardHeader>
              <CardContent className="text-caps text-muted-foreground">variant=&quot;{v}&quot;</CardContent>
            </Card>
          ))}
        </Preview>
      </Section>
      <Section title="Composition">
        <Preview>
          <Card variant="elevated" className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Quality score</CardTitle>
              <CardDescription>After enhancement</CardDescription>
              <CardAction><Badge variant="success">+45</Badge></CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-6xl font-extrabold tracking-tight tabular">87<span className="text-xl text-muted-foreground">/100</span></p>
              <Progress value={87} className="mt-4" />
            </CardContent>
            <CardFooter className="border-t border-border">
              <Button variant="ghost" size="sm">Details</Button>
              <Button size="sm" className="ml-auto">Export</Button>
            </CardFooter>
          </Card>
        </Preview>
      </Section>
    </>
  )
}

const ROWS = [
  { name: 'Ep. 42 — The quiet room', duration: '42:18', status: 'Exported', size: '38.7 MB' },
  { name: 'Interview with Maya', duration: '58:02', status: 'In progress', size: '53.1 MB' },
  { name: 'Ad read — Northwind', duration: '01:12', status: 'New', size: '1.1 MB' },
  { name: 'Trailer cut', duration: '02:45', status: 'Exported', size: '2.6 MB' },
]
const STATUS = { Exported: 'success', 'In progress': 'warning', New: 'secondary' }

function TablePage() {
  return (
    <>
      <PageHeader eyebrow="Data" title="Table" description="Caps headers on a strong rule, hairline rows, tabular numbers. Selected rows get an aqua bar." />
      <Section title="Example">
        <Preview center={false}>
          <Table>
            <TableCaption>4 projects · 1 h 44 m total</TableCaption>
            <TableHeader>
              <TableRow><TableHead>Project</TableHead><TableHead>Duration</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Size</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {ROWS.map((r, i) => (
                <TableRow key={r.name} data-state={i === 1 ? 'selected' : undefined}>
                  <TableCell className="font-bold">{r.name}</TableCell>
                  <TableCell className="font-mono tabular">{r.duration}</TableCell>
                  <TableCell><Badge variant={STATUS[r.status]}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right font-mono tabular">{r.size}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter><TableRow><TableCell colSpan={3}>Total</TableCell><TableCell className="text-right font-mono tabular">95.5 MB</TableCell></TableRow></TableFooter>
          </Table>
        </Preview>
      </Section>
    </>
  )
}

function DataTablePage() {
  const [sorting, setSorting] = useState([])
  const [filter, setFilter] = useState('')
  const [selection, setSelection] = useState({})
  const data = useMemo(() => [...ROWS, ...ROWS.map((r) => ({ ...r, name: r.name + ' (v2)' }))], [])
  const columns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button className="inline-flex items-center gap-1 uppercase" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Project <ArrowUpDownIcon className="size-3" />
        </button>
      ),
      cell: ({ getValue }) => <span className="font-bold">{getValue()}</span>,
    },
    { accessorKey: 'duration', header: 'Duration', cell: ({ getValue }) => <span className="font-mono tabular">{getValue()}</span> },
    { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <Badge variant={STATUS[getValue()]}>{getValue()}</Badge> },
    { id: 'actions', cell: () => <Button variant="ghost" size="icon-sm" aria-label="Row actions"><MoreHorizontalIcon /></Button> },
  ], [])
  const table = useReactTable({
    data, columns, state: { sorting, globalFilter: filter, rowSelection: selection },
    onSortingChange: setSorting, onGlobalFilterChange: setFilter, onRowSelectionChange: setSelection,
    getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: 5 } },
  })
  return (
    <>
      <PageHeader eyebrow="Data" title="Data table" description="TanStack Table on top of Table: sort, filter, select and paginate." />
      <Section title="Projects">
        <Preview single center={false} contentClassName="flex-col items-stretch gap-4">
          <div className="flex items-center justify-between gap-3">
            <Input placeholder="Filter projects…" value={filter} onChange={(e) => setFilter(e.target.value)} className="max-w-xs" />
            <span className="text-[13px] text-muted-foreground tabular">{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} selected</span>
          </div>
          <div>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>{hg.headers.map((h) => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                    {row.getVisibleCells().map((c) => <TableCell key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</TableCell>)}
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No projects match.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="mr-auto text-[13px] text-muted-foreground tabular">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </Preview>
      </Section>
    </>
  )
}

const CHART_DATA = [
  { day: 'Mon', minutes: 42, exports: 3 }, { day: 'Tue', minutes: 65, exports: 5 }, { day: 'Wed', minutes: 38, exports: 2 },
  { day: 'Thu', minutes: 92, exports: 7 }, { day: 'Fri', minutes: 71, exports: 4 }, { day: 'Sat', minutes: 24, exports: 1 },
  { day: 'Sun', minutes: 55, exports: 3 },
]
const chartConfig = {
  minutes: { label: 'Minutes edited', color: 'var(--chart-1)' },
  exports: { label: 'Exports', color: 'var(--chart-2)' },
}

function ChartPage() {
  return (
    <>
      <PageHeader eyebrow="Data" title="Chart" description="Recharts with system colours: hairline grids and a floating tooltip with the same soft shadow as menus." />
      <Section title="Bar · Area · Line">
        <Preview center={false} contentClassName="grid gap-6 xl:grid-cols-3">
          {[
            ['Bar', (
              <BarChart data={CHART_DATA} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Bar dataKey="minutes" fill="var(--color-minutes)" radius={0} />
              </BarChart>
            )],
            ['Area', (
              <AreaChart data={CHART_DATA} accessibilityLayer margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area dataKey="minutes" type="linear" fill="var(--color-minutes)" fillOpacity={0.18} stroke="var(--color-minutes)" strokeWidth={2} />
              </AreaChart>
            )],
            ['Line', (
              <LineChart data={CHART_DATA} accessibilityLayer margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} interval={0} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="minutes" type="linear" stroke="var(--color-minutes)" strokeWidth={2} dot={false} />
                <Line dataKey="exports" type="linear" stroke="var(--color-exports)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            )],
          ].map(([t, chart]) => (
            <Card key={t} className="py-4">
              <CardHeader className="px-4"><CardTitle className="text-sm">{t}</CardTitle><CardDescription>This week</CardDescription></CardHeader>
              <CardContent className="px-2"><ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">{chart}</ChartContainer></CardContent>
            </Card>
          ))}
        </Preview>
      </Section>
    </>
  )
}

function AvatarPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Avatar" description="Circles. Fallbacks are initials on a tinted circle, as in CRED's contact rows." />
      <Section title="Sizes & states">
        <Preview>
          <Avatar size="sm"><AvatarFallback>KB</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>MK</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarImage src="https://i.pravatar.cc/120?img=12" alt="Host" /><AvatarFallback>JM</AvatarFallback></Avatar>
          <Avatar size="lg"><AvatarFallback>AR</AvatarFallback><AvatarBadge /></Avatar>
          <AvatarGroup>
            <Avatar><AvatarFallback>KB</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>MK</AvatarFallback></Avatar>
            <Avatar><AvatarFallback>JM</AvatarFallback></Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
        </Preview>
      </Section>
    </>
  )
}

function ItemPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Item" description="A flexible row: media, title, description, actions. Lists of projects, versions and settings are built from it." />
      <Section title="Variants">
        <Preview center={false} contentClassName="grid max-w-xl gap-4">
          <Item variant="outline">
            <ItemMedia variant="icon"><FileAudioIcon /></ItemMedia>
            <ItemContent><ItemTitle>Ep. 42 — The quiet room</ItemTitle><ItemDescription>42:18 · edited 2 hours ago</ItemDescription></ItemContent>
            <ItemActions><Button variant="outline" size="sm">Open</Button></ItemActions>
          </Item>
          <Item variant="muted">
            <ItemMedia variant="icon"><MicIcon /></ItemMedia>
            <ItemContent><ItemTitle>Voice clone ready <Badge variant="brand">New</Badge></ItemTitle><ItemDescription>Edited words will be regenerated in your voice.</ItemDescription></ItemContent>
          </Item>
          <ItemGroup className="rounded-2xl border-[0.8px] border-border">
            {['Original upload', 'Noise reduction', 'Removed 34 fillers'].map((t, i, a) => (
              <div key={t}>
                <Item asChild size="sm">
                  <a href="#">
                    <ItemContent><ItemTitle>{t}</ItemTitle></ItemContent>
                    <ItemActions><span className="font-mono text-[11px] text-muted-foreground">v{i + 1}</span><ChevronRightIcon className="size-4" /></ItemActions>
                  </a>
                </Item>
                {i < a.length - 1 && <ItemSeparator />}
              </div>
            ))}
          </ItemGroup>
        </Preview>
      </Section>
    </>
  )
}

function EmptyPage() {
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Empty" description="Every empty state says what this place is for and gives one way forward." />
      <Section title="Example">
        <Preview>
          <Empty className="max-w-md rounded-2xl border border-dashed border-input hatch">
            <EmptyHeader>
              <EmptyMedia variant="icon"><AudioLinesIcon /></EmptyMedia>
              <EmptyTitle>No projects yet</EmptyTitle>
              <EmptyDescription>Upload a recording or record in the browser. Sonicly transcribes it so you can edit audio like text.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-3"><Button><UploadIcon />Upload audio</Button><Button variant="outline"><MicIcon />Record</Button></div>
            </EmptyContent>
          </Empty>
        </Preview>
      </Section>
    </>
  )
}

function SkeletonPage() {
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Skeleton" description="Shimmering placeholders shaped like the content that is coming." />
      <Section title="Project card loading">
        <Preview>
          {[0, 1].map((i) => (
            <div key={i} className="w-64 space-y-3 rounded-2xl border-[0.8px] border-border p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
          <div className="flex items-center gap-3"><Skeleton className="size-10 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-24" /></div></div>
        </Preview>
      </Section>
    </>
  )
}

function ProgressPage() {
  const [v, setV] = useState(38)
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Progress" description="A rounded track and bar. Omit the value for an indeterminate sweep while the server hasn't reported a percentage." />
      <Section title="Tones & states">
        <Preview center={false} contentClassName="grid max-w-md gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-[13px]"><span className="font-bold">Uploading</span><span className="font-mono tabular">{v}%</span></div>
            <Progress value={v} />
            <div className="flex gap-2 pt-1"><Button size="xs" variant="outline" onClick={() => setV((x) => Math.max(0, x - 15))}>−15</Button><Button size="xs" variant="outline" onClick={() => setV((x) => Math.min(100, x + 15))}>+15</Button></div>
          </div>
          <div className="space-y-2"><p className="text-[13px] font-bold">Transcribing…</p><Progress /></div>
          <Progress value={100} tone="success" />
          <Progress value={64} tone="warning" />
          <Progress value={22} tone="destructive" />
          <Progress value={50} tone="foreground" />
        </Preview>
      </Section>
    </>
  )
}

function AlertPage() {
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Alert" description="Inline messages with a 4px status bar, an icon and words — meaning never relies on colour alone." />
      <Section title="Variants">
        <Preview center={false} contentClassName="grid max-w-xl gap-3">
          <Alert><InfoIcon /><AlertTitle>Transcription runs once per upload</AlertTitle><AlertDescription>Edits re-use the same transcript, so they’re instant.</AlertDescription></Alert>
          <Alert variant="info"><InfoIcon /><AlertTitle>New: voice cloning</AlertTitle><AlertDescription>Fix a word by typing it.</AlertDescription></Alert>
          <Alert variant="success"><CheckCircle2Icon /><AlertTitle>Export complete</AlertTitle><AlertDescription>ep42_enhanced.mp3 · 8.4 MB</AlertDescription></Alert>
          <Alert variant="warning"><AlertTriangleIcon /><AlertTitle>Clipping at 12:04</AlertTitle><AlertDescription>The peak is above −1 dBFS. Lower the gain before export.</AlertDescription></Alert>
          <Alert variant="destructive"><OctagonXIcon /><AlertTitle>Upload failed</AlertTitle><AlertDescription>The file is over 2 GB. Split it and try again.</AlertDescription></Alert>
        </Preview>
      </Section>
    </>
  )
}

function CarouselPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Carousel" description="Embla-powered; arrow keys work when focused. Controls are outline keys outside the track." />
      <Section title="Templates">
        <Preview single>
          <Carousel className="w-full max-w-md" opts={{ align: 'start' }}>
            <CarouselContent>
              {['Interview', 'Solo show', 'Panel', 'Audiobook', 'Ad read'].map((t, i) => (
                <CarouselItem key={t} className="basis-1/2">
                  <Card variant="elevated" className="py-4">
                    <CardContent className="flex aspect-square flex-col justify-between px-4">
                      <span className="font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                      <span className="font-display text-2xl leading-none">{t}</span>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </Preview>
      </Section>
    </>
  )
}

function MarkerPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Marker" description="Inline status lines and labelled separators — e.g. 'Sonicly is thinking' or a date divider in chat." />
      <Section title="Variants">
        <Preview center={false} contentClassName="grid max-w-md gap-5">
          <Marker><MarkerIcon><Spinner /></MarkerIcon><MarkerContent>Applying 3 edits…</MarkerContent></Marker>
          <Marker variant="separator"><MarkerContent>Today</MarkerContent></Marker>
          <Marker variant="border"><MarkerIcon><CheckCircle2Icon className="text-success-ink" /></MarkerIcon><MarkerContent>Version 4 saved · <a href="#">view</a></MarkerContent></Marker>
        </Preview>
      </Section>
    </>
  )
}

function TypographyPage() {
  return (
    <>
      <PageHeader eyebrow="Display" title="Typography" description="The prose styles, built from the type foundations." />
      <Section title="Prose">
        <Preview center={false}>
          <article className="max-w-2xl">
            <p className="text-caps text-brand-ink">Changelog · v1.4</p>
            <h1 className="mt-3 font-display text-5xl leading-[1.04]">Edit audio like a document.</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">The lead paragraph sets context in one or two sentences, a size up from body.</p>
            <h2 className="mt-10 border-b border-border pb-2 font-display text-3xl">What changed</h2>
            <p className="mt-4 text-sm leading-relaxed">Sonicly now detects <strong>false starts</strong> as well as fillers. Use <code className="rounded-lg border-[0.8px] border-border bg-muted px-1.5 py-0.5 font-mono text-[12px]">⌘E</code> to enhance.</p>
            <h3 className="mt-8 text-xl font-bold tracking-tight">Under the hood</h3>
            <ul className="mt-3 ml-5 list-[square] space-y-1.5 text-sm leading-relaxed marker:text-brand">
              <li>Word timings accurate to 20 ms</li>
              <li>Edits render 3× faster</li>
              <li>Exports are never watermarked</li>
            </ul>
            <blockquote className="mt-8 border-l-4 border-brand pl-5 font-display text-2xl leading-snug">“It’s the first editor that feels like my notes app.”</blockquote>
            <p className="mt-6 text-[13px] text-muted-foreground">Small text · <span className="font-mono">00:42:18</span></p>
          </article>
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage dos={['Use Fraunces for page titles and one-line statements.', 'Use caps labels to name sections and data.']} donts={['Set body copy in the serif.', 'Use more than three sizes on one screen.']} />
      </Section>
    </>
  )
}

export const DATA_DEMOS = [
  { slug: 'card', title: 'Card', Page: CardPage },
  { slug: 'table', title: 'Table', Page: TablePage },
  { slug: 'data-table', title: 'Data Table', Page: DataTablePage },
  { slug: 'chart', title: 'Chart', Page: ChartPage },
  { slug: 'avatar', title: 'Avatar', Page: AvatarPage },
  { slug: 'item', title: 'Item', Page: ItemPage },
  { slug: 'empty', title: 'Empty', Page: EmptyPage },
  { slug: 'skeleton', title: 'Skeleton', Page: SkeletonPage },
  { slug: 'progress', title: 'Progress', Page: ProgressPage },
  { slug: 'alert', title: 'Alert', Page: AlertPage },
  { slug: 'carousel', title: 'Carousel', Page: CarouselPage },
  { slug: 'marker', title: 'Marker', Page: MarkerPage },
  { slug: 'typography', title: 'Typography', Page: TypographyPage },
]

