import { useState } from 'react'
import {
  AudioLinesIcon, ChevronsUpDownIcon, FolderIcon, HomeIcon, LayoutGridIcon, MicIcon, PlusIcon, SettingsIcon,
  SparklesIcon, StarIcon, Trash2Icon, UsersIcon,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination'
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu,
  SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider, SidebarSeparator, SidebarTrigger,
} from '@/components/ui/sidebar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { DirectionProvider } from '@/components/ui/direction'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { PageHeader, Preview, Section } from './kit'

function TabsPage() {
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Tabs" description="Four flavours: a pill segmented control whose active tab lifts onto a white pill (CRED’s “recent spends” switcher), editorial line tabs with a rounded 2px rule, and CRED's caps pill and boxed filter tabs." />
      <Section title="Default (segmented)">
        <Preview center={false}>
          <Tabs defaultValue="transcript" className="w-full max-w-lg">
            <TabsList>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="notes">Show notes</TabsTrigger>
              <TabsTrigger value="locked" disabled>Clips</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript"><Card className="py-4"><CardContent className="px-4 text-sm text-muted-foreground">1,284 words · 34 fillers detected</CardContent></Card></TabsContent>
            <TabsContent value="chapters"><Card className="py-4"><CardContent className="px-4 text-sm text-muted-foreground">6 chapters, auto-generated</CardContent></Card></TabsContent>
            <TabsContent value="notes"><Card className="py-4"><CardContent className="px-4 text-sm text-muted-foreground">Draft ready to review</CardContent></Card></TabsContent>
          </Tabs>
        </Preview>
      </Section>
      <Section title="Pill and boxed (from CRED)" description="pill: small caps tabs where the active one sits in a grey pill. boxed: square outlined filters where the active one fills in.">
        <Preview center={false} contentClassName="flex-col items-start gap-8">
          <Tabs defaultValue="suggested"><TabsList variant="pill"><TabsTrigger value="suggested">Suggestions</TabsTrigger><TabsTrigger value="rewards">Win rewards</TabsTrigger></TabsList></Tabs>
          <Tabs defaultValue="trending"><TabsList variant="boxed"><TabsTrigger value="trending">trending</TabsTrigger><TabsTrigger value="podcasts">podcasts</TabsTrigger><TabsTrigger value="music">music</TabsTrigger><TabsTrigger value="sfx">sfx</TabsTrigger></TabsList></Tabs>
        </Preview>
      </Section>
      <Section title="Line">
        <Preview center={false} contentClassName="flex-col items-stretch gap-10">
          <Tabs defaultValue="all">
            <TabsList variant="line">
              <TabsTrigger value="all">All projects</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="starred"><StarIcon />Starred</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs defaultValue="general" orientation="vertical" className="flex-row">
            <TabsList variant="line">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="audio">Audio</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="pl-6 text-sm text-muted-foreground">Workspace name, timezone.</TabsContent>
            <TabsContent value="audio" className="pl-6 text-sm text-muted-foreground">Default loudness and format.</TabsContent>
            <TabsContent value="billing" className="pl-6 text-sm text-muted-foreground">Plan and invoices.</TabsContent>
          </Tabs>
        </Preview>
      </Section>
    </>
  )
}

function AccordionPage() {
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Accordion" description="The round plus turns into a cross and fills with ink as the panel opens." />
      <Section title="Single">
        <Preview center={false}>
          <Accordion type="single" collapsible defaultValue="a" className="w-full max-w-lg">
            <AccordionItem value="a">
              <AccordionTrigger>How does filler removal work?</AccordionTrigger>
              <AccordionContent>Sonicly finds “um”, “uh”, false starts and repeated words in the transcript. Nothing is cut until you confirm.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>Can I undo an edit?</AccordionTrigger>
              <AccordionContent>Every confirmed edit creates a version. Switch back to any version from the history.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger>Which formats can I export?</AccordionTrigger>
              <AccordionContent>MP3, WAV and M4A — never watermarked.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Preview>
      </Section>
    </>
  )
}

function CollapsiblePage() {
  const [open, setOpen] = useState(true)
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Collapsible" description="A bare show/hide region — the building block under accordion." />
      <Section title="Example">
        <Preview single>
          <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">3 changes applied</p>
              <CollapsibleTrigger asChild><Button variant="ghost" size="icon-sm" aria-label="Toggle"><ChevronsUpDownIcon /></Button></CollapsibleTrigger>
            </div>
            <div className="rounded-lg border-[0.8px] border-border px-3 py-2 text-[13px]">Removed 34 filler words</div>
            <CollapsibleContent className="space-y-2 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div className="rounded-lg border-[0.8px] border-border px-3 py-2 text-[13px]">Reduced background noise by 14 dB</div>
              <div className="rounded-lg border-[0.8px] border-border px-3 py-2 text-[13px]">Normalised to −16 LUFS</div>
            </CollapsibleContent>
          </Collapsible>
        </Preview>
      </Section>
    </>
  )
}

function BreadcrumbPage_() {
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Breadcrumb" description="Where you are. The current page is bold; parents underline in aqua on hover." />
      <Section title="Example">
        <Preview>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Projects</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Season 3</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Ep. 42 — The quiet room</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Preview>
      </Section>
    </>
  )
}

function PaginationPage() {
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Pagination" description="The current page is a raised key; the rest are flat." />
      <Section title="Example">
        <Preview>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </Preview>
      </Section>
    </>
  )
}

function NavigationMenuPage() {
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Navigation menu" description="Marketing-style top navigation with rich dropdowns on a soft floating panel." />
      <Section title="Example">
        <Preview single className="min-h-80" contentClassName="items-start pt-8">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[420px] grid-cols-2 gap-1 p-1">
                    {[
                      [AudioLinesIcon, 'Editor', 'Edit audio by editing text.'],
                      [SparklesIcon, 'Enhance', 'One-click studio sound.'],
                      [MicIcon, 'Record', 'Record in the browser.'],
                      [UsersIcon, 'Voices', 'Clone and fix words.'],
                    ].map(([Icon, t, d]) => (
                      <li key={t}>
                        <NavigationMenuLink href="#">
                          <span className="flex items-center gap-2 font-bold"><Icon />{t}</span>
                          <span className="text-[12px] text-muted-foreground">{d}</span>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Pricing</NavigationMenuLink></NavigationMenuItem>
              <NavigationMenuItem><NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Docs</NavigationMenuLink></NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </Preview>
      </Section>
    </>
  )
}

function SidebarPage() {
  const [active, setActive] = useState('Projects')
  const nav = [[HomeIcon, 'Home'], [LayoutGridIcon, 'Projects', '12'], [StarIcon, 'Starred'], [MicIcon, 'Recordings', '3'], [Trash2Icon, 'Trash']]
  return (
    <>
      <PageHeader eyebrow="Navigation" title="Sidebar" description="The app shell's left rail. Active items sit on a soft rounded highlight; caps labels group sections." />
      <Section title="App shell">
        <Preview single padded={false} center={false}>
          <SidebarProvider className="min-h-0 h-[540px]" style={{ '--sidebar-width': '15rem' }}>
            <Sidebar collapsible="none" className="border-r border-sidebar-border">
              <SidebarHeader className="border-b border-sidebar-border px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-7 items-center justify-center bg-foreground text-background"><AudioLinesIcon className="size-4" /></span>
                  <span className="font-display text-lg">Sonicly</span>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                  <SidebarMenu>
                    {nav.map(([Icon, label, badge]) => (
                      <SidebarMenuItem key={label}>
                        <SidebarMenuButton isActive={active === label} onClick={() => setActive(label)}><Icon />{label}</SidebarMenuButton>
                        {badge && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>Shows</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton><FolderIcon />The Quiet Room</SidebarMenuButton>
                      <SidebarMenuSub>
                        <SidebarMenuSubItem><SidebarMenuSubButton isActive>Season 3</SidebarMenuSubButton></SidebarMenuSubItem>
                        <SidebarMenuSubItem><SidebarMenuSubButton>Season 2</SidebarMenuSubButton></SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter className="border-t border-sidebar-border">
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg">
                      <Avatar size="sm"><AvatarFallback>KB</AvatarFallback></Avatar>
                      <span className="flex flex-col text-left leading-tight"><span className="font-bold">Kishan</span><span className="text-[11px] text-muted-foreground">Free plan</span></span>
                      <SettingsIcon className="ml-auto" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
            </Sidebar>
            <SidebarInset className="min-h-0 p-6">
              <p className="text-caps text-muted-foreground">{active}</p>
              <h3 className="mt-2 font-display text-3xl">Your projects</h3>
            </SidebarInset>
          </SidebarProvider>
        </Preview>
      </Section>
    </>
  )
}

function ScrollAreaPage() {
  const tags = Array.from({ length: 40 }, (_, i) => `v${40 - i} · edit ${String(i + 1).padStart(2, '0')}`)
  return (
    <>
      <PageHeader eyebrow="Layout" title="Scroll area" description="Thin rounded scrollbars that brighten on hover." />
      <Section title="Vertical & horizontal">
        <Preview>
          <ScrollArea className="h-56 w-56 rounded-2xl border-[0.8px] border-border">
            <div className="p-3">
              <p className="text-caps mb-2 text-muted-foreground">Versions</p>
              {tags.map((t) => <div key={t} className="border-b border-border py-2 font-mono text-[12px]">{t}</div>)}
            </div>
          </ScrollArea>
          <ScrollArea className="w-80 rounded-2xl border-[0.8px] border-border whitespace-nowrap">
            <div className="flex gap-3 p-3">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="flex size-24 shrink-0 items-end bg-muted p-2 font-mono text-[11px]">Clip {i + 1}</div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Preview>
      </Section>
    </>
  )
}

function ResizablePage() {
  return (
    <>
      <PageHeader eyebrow="Layout" title="Resizable" description="Drag the hairline between panels. It turns solid on hover and aqua while dragging — the editor uses this for chat / canvas." />
      <Section title="Editor layout">
        <Preview single padded={false}>
          <ResizablePanelGroup orientation="horizontal" className="h-72 w-full">
            <ResizablePanel defaultSize="30%" minSize="20%"><div className="flex h-full items-center justify-center text-sm font-bold">Chat</div></ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="70%">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize="40%"><div className="flex h-full items-center justify-center text-sm font-bold">Waveform</div></ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize="60%"><div className="flex h-full items-center justify-center text-sm font-bold">Transcript</div></ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </Preview>
      </Section>
    </>
  )
}

function SeparatorPage() {
  return (
    <>
      <PageHeader eyebrow="Layout" title="Separator" description="A 1px rule. Use space before you reach for a line." />
      <Section title="Example">
        <Preview>
          <div className="w-72">
            <p className="text-sm font-bold">Ep. 42 — The quiet room</p>
            <p className="text-[13px] text-muted-foreground">42:18 · edited 2h ago</p>
            <Separator className="my-4" />
            <div className="flex h-5 items-center gap-4 text-[13px] font-semibold">
              <span>Edit</span><Separator orientation="vertical" /><span>Export</span><Separator orientation="vertical" /><span>Share</span>
            </div>
          </div>
        </Preview>
      </Section>
    </>
  )
}

function AspectRatioPage() {
  return (
    <>
      <PageHeader eyebrow="Layout" title="Aspect ratio" description="Locks media to a ratio — cover art is 1:1, video clips 16:9." />
      <Section title="Example">
        <Preview>
          <div className="w-44"><AspectRatio ratio={1} className="flex items-end bg-foreground p-3 text-background"><span className="font-display text-2xl leading-none">The Quiet Room</span></AspectRatio><p className="mt-2 font-mono text-[11px] text-muted-foreground">1:1 cover</p></div>
          <div className="w-72"><AspectRatio ratio={16 / 9} className="hatch flex items-center justify-center rounded-2xl border-[0.8px] border-border"><span className="text-caps text-muted-foreground">16:9 clip</span></AspectRatio></div>
        </Preview>
      </Section>
    </>
  )
}

function DirectionPage() {
  return (
    <>
      <PageHeader eyebrow="Layout" title="Direction" description="Wrap a subtree in DirectionProvider to flip Radix components for right-to-left languages." />
      <Section title="LTR vs RTL">
        <Preview>
          {['ltr', 'rtl'].map((dir) => (
            <DirectionProvider key={dir} dir={dir}>
              <div dir={dir} className="w-72 space-y-3 rounded-2xl border-[0.8px] border-border p-4">
                <Badge variant="outline">{dir}</Badge>
                <Input placeholder={dir === 'rtl' ? 'ابحث عن مشروع' : 'Search a project'} />
                <div className="flex gap-2"><Button size="sm"><PlusIcon />{dir === 'rtl' ? 'جديد' : 'New'}</Button><Button size="sm" variant="ghost">{dir === 'rtl' ? 'إلغاء' : 'Cancel'}</Button></div>
              </div>
            </DirectionProvider>
          ))}
        </Preview>
      </Section>
    </>
  )
}

export const NAVIGATION_DEMOS = [
  { slug: 'tabs', title: 'Tabs', Page: TabsPage },
  { slug: 'accordion', title: 'Accordion', Page: AccordionPage },
  { slug: 'collapsible', title: 'Collapsible', Page: CollapsiblePage },
  { slug: 'breadcrumb', title: 'Breadcrumb', Page: BreadcrumbPage_ },
  { slug: 'pagination', title: 'Pagination', Page: PaginationPage },
  { slug: 'navigation-menu', title: 'Navigation Menu', Page: NavigationMenuPage },
  { slug: 'sidebar', title: 'Sidebar', Page: SidebarPage },
  { slug: 'scroll-area', title: 'Scroll Area', Page: ScrollAreaPage },
  { slug: 'resizable', title: 'Resizable', Page: ResizablePage },
  { slug: 'separator', title: 'Separator', Page: SeparatorPage },
  { slug: 'aspect-ratio', title: 'Aspect Ratio', Page: AspectRatioPage },
  { slug: 'direction', title: 'Direction', Page: DirectionPage },
]

