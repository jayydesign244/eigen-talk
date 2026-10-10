import { useEffect, useState } from 'react'
import {
  AudioLinesIcon, CopyIcon, DownloadIcon, FileAudioIcon, FolderIcon, HistoryIcon, LogOutIcon, MicIcon,
  MoreHorizontalIcon, PencilIcon, PlusIcon, ScissorsIcon, SettingsIcon, SparklesIcon, StarIcon, TrashIcon, UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger, MenubarCheckboxItem,
} from '@/components/ui/menubar'
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Slider } from '@/components/ui/slider'
import { PageHeader, Preview, Section, Usage } from './kit'

const NOTE = 'Floating layers render at the top of the page, so they follow the app theme switch.'

function DialogPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Dialog" description={`A floating card with 22px corners and a soft shadow over a dark scrim. Pops from 90% scale in 220ms, as in CRED. ${NOTE}`} />
      <Section title="Example">
        <Preview>
          <Dialog>
            <DialogTrigger asChild><Button>Rename project</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename project</DialogTitle>
                <DialogDescription>The new name shows on the dashboard and in exported file names.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                <Label htmlFor="ds-dlg-name">Name</Label>
                <Input id="ds-dlg-name" defaultValue="Ep. 42 — The quiet room" />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                <DialogClose asChild><Button onClick={() => toast.success('Project renamed')}>Save</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline"><DownloadIcon />Export…</Button></DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Export audio</DialogTitle>
                <DialogDescription>MP3 · 320 kbps · about 8.4 MB</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2">
                {['MP3', 'WAV', 'M4A'].map((f, i) => (
                  <button key={f} className={`border px-3 py-3 text-left text-sm font-bold transition-colors ${i === 0 ? 'border-foreground shadow-[inset_0_-3px_0_0_var(--brand)]' : 'border-border hover:border-muted-foreground'}`}>{f}</button>
                ))}
              </div>
              <DialogFooter><Button variant="brand" className="w-full sm:w-auto"><DownloadIcon />Download</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </Preview>
      </Section>
    </>
  )
}

function AlertDialogPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Alert dialog" description="For irreversible actions. The destructive key names the object; cancel is always the easy way out." />
      <Section title="Example">
        <Preview>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive"><TrashIcon />Delete project</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogMedia className="text-destructive-ink"><TrashIcon /></AlertDialogMedia>
                <AlertDialogTitle>Delete “Ep. 42”?</AlertDialogTitle>
                <AlertDialogDescription>This removes the project, its 6 versions and the transcript. Exported files on your computer aren’t affected.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep it</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => toast('Project deleted', { action: { label: 'Undo', onClick: () => {} } })}>Delete project</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Small confirm</Button></AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Discard 4 edits?</AlertDialogTitle>
                <AlertDialogDescription>Unsaved transcript edits will be lost.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction>Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Preview>
      </Section>
    </>
  )
}

function SheetPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Sheet" description="A panel that slides in from an edge: 350ms decelerating in, accelerating out (CRED's sheet timing). Panels round their inner corners to 22px. Used for version history and settings on the editor." />
      <Section title="Sides">
        <Preview>
          {['right', 'left', 'top', 'bottom'].map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild><Button variant="outline" className="capitalize">{side}</Button></SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Version history</SheetTitle>
                  <SheetDescription>Every edit is a version. Switch back any time.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-1 px-5">
                  {['Removed fillers', 'Noise reduction', 'Original upload'].map((v, i) => (
                    <div key={v} className={`flex items-center justify-between border px-3 py-2.5 text-sm ${i === 0 ? 'border-foreground font-bold' : 'border-border'}`}>
                      {v}<span className="font-mono text-[11px] text-muted-foreground">v{3 - i}</span>
                    </div>
                  ))}
                </div>
                <SheetFooter><SheetClose asChild><Button>Done</Button></SheetClose></SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </Preview>
      </Section>
    </>
  )
}

function DrawerPage() {
  const [vol, setVol] = useState([70])
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Drawer" description="A draggable bottom sheet for mobile: 22px rounded top, a hairline and a soft shadow, with a small pill handle. Drag down to dismiss." />
      <Section title="Example">
        <Preview>
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Open drawer</Button></DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Output level</DrawerTitle>
                  <DrawerDescription>Set how loud the master should be.</DrawerDescription>
                </DrawerHeader>
                <div className="px-5 py-4">
                  <p className="text-center text-6xl font-extrabold tracking-tight tabular">{vol[0]}<span className="text-2xl text-muted-foreground">%</span></p>
                  <Slider value={vol} onValueChange={setVol} className="mt-6" aria-label="Output level" />
                </div>
                <DrawerFooter>
                  <Button>Apply</Button>
                  <DrawerClose asChild><Button variant="ghost">Cancel</Button></DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        </Preview>
      </Section>
    </>
  )
}

function PopoverPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Popover" description="Small, non-modal panels anchored to their trigger." />
      <Section title="Example">
        <Preview>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline"><ScissorsIcon />Trim</Button></PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="grid gap-4">
                <div><p className="text-sm font-bold">Trim silence</p><p className="text-[13px] text-muted-foreground">Shorten pauses longer than:</p></div>
                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <Slider defaultValue={[1.2]} min={0.3} max={3} step={0.1} aria-label="Pause length" />
                  <span className="font-mono text-[12px] tabular">1.2s</span>
                </div>
                <Button size="sm">Apply</Button>
              </div>
            </PopoverContent>
          </Popover>
        </Preview>
      </Section>
    </>
  )
}

function HoverCardPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Hover card" description="Previews on hover for people and links. Never put actions only here." />
      <Section title="Example">
        <Preview>
          <p className="text-sm">Recorded with{' '}
            <HoverCard>
              <HoverCardTrigger asChild><a href="#" className="font-bold underline decoration-brand underline-offset-4">@maya</a></HoverCardTrigger>
              <HoverCardContent>
                <div className="flex gap-3">
                  <Avatar size="lg"><AvatarFallback>MK</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-bold">Maya Kapoor</p>
                    <p className="text-[13px] text-muted-foreground">Co-host · 38 episodes</p>
                    <p className="mt-2 font-mono text-[11px] text-muted-foreground">Voice clone ready</p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>{' '}in Studio B.
          </p>
        </Preview>
      </Section>
    </>
  )
}

function TooltipPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Tooltip" description="A small rounded ink label that names an icon button and shows its shortcut." />
      <Section title="Sides">
        <Preview>
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger asChild><Button variant="outline" size="icon" aria-label={`Tooltip ${side}`}><SparklesIcon /></Button></TooltipTrigger>
              <TooltipContent side={side}>Enhance <KbdGroup><Kbd>⌘</Kbd><Kbd>E</Kbd></KbdGroup></TooltipContent>
            </Tooltip>
          ))}
        </Preview>
      </Section>
    </>
  )
}

function DropdownMenuPage() {
  const [showWave, setShowWave] = useState(true)
  const [sort, setSort] = useState('edited')
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Dropdown menu" description="A rounded floating panel; rows highlight on a soft grey pill. Destructive rows tint red only when highlighted, so they don't shout at rest." />
      <Section title="Example">
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" aria-label="Project actions"><MoreHorizontalIcon /></Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuLabel>Project</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem><PencilIcon />Rename<DropdownMenuShortcut>R</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><CopyIcon />Duplicate<DropdownMenuShortcut>⌘D</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><StarIcon />Star</DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger><DownloadIcon />Export as</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>MP3</DropdownMenuItem>
                    <DropdownMenuItem>WAV</DropdownMenuItem>
                    <DropdownMenuItem>M4A</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive"><TrashIcon />Delete<DropdownMenuShortcut>⌫</DropdownMenuShortcut></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">View options</Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Show</DropdownMenuLabel>
              <DropdownMenuCheckboxItem checked={showWave} onCheckedChange={setShowWave}>Waveform previews</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={false}>Durations</DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="edited">Last edited</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="duration">Duration</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-lg border-[0.8px] border-border bg-card px-2.5 py-2 text-left transition-colors hover:border-muted-foreground/60">
                <Avatar size="sm"><AvatarFallback>KB</AvatarFallback></Avatar>
                <span className="text-[13px] font-bold">Kishan</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="start">
              <DropdownMenuItem><UserIcon />Account</DropdownMenuItem>
              <DropdownMenuItem><SettingsIcon />Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem><LogOutIcon />Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </Section>
    </>
  )
}

function ContextMenuPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Context menu" description="Right-click menus. In the editor, right-clicking a word opens these actions." />
      <Section title="Example">
        <Preview>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-36 w-full max-w-md items-center justify-center rounded-2xl border border-dashed border-input hatch text-[13px] font-semibold text-muted-foreground">
              Right-click this transcript line
            </ContextMenuTrigger>
            <ContextMenuContent className="w-56">
              <ContextMenuItem><AudioLinesIcon />Play from here<ContextMenuShortcut>⇧ Click</ContextMenuShortcut></ContextMenuItem>
              <ContextMenuItem><PencilIcon />Edit word<ContextMenuShortcut>2× Click</ContextMenuShortcut></ContextMenuItem>
              <ContextMenuCheckboxItem checked>Mark as filler</ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive"><TrashIcon />Delete word<ContextMenuShortcut>⌫</ContextMenuShortcut></ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Preview>
      </Section>
    </>
  )
}

function MenubarPage() {
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Menubar" description="Desktop-style menus for dense tools. The open menu's trigger sits on a soft highlight." />
      <Section title="Example">
        <Preview>
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem><PlusIcon />New project<MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
                <MenubarItem><FolderIcon />Open…<MenubarShortcut>⌘O</MenubarShortcut></MenubarItem>
                <MenubarSeparator />
                <MenubarItem><DownloadIcon />Export<MenubarShortcut>⌘E</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo<MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                <MenubarItem>Redo<MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
                <MenubarSeparator />
                <MenubarItem><ScissorsIcon />Remove fillers</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarCheckboxItem checked>Transcript</MenubarCheckboxItem>
                <MenubarCheckboxItem>Inspector</MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarItem><HistoryIcon />Versions</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </Preview>
      </Section>
    </>
  )
}

function CommandPage() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o) }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  const list = (
    <>
      <CommandInput placeholder="Search projects and actions…" />
      <CommandList>
        <CommandEmpty>Nothing found.</CommandEmpty>
        <CommandGroup heading="Projects">
          <CommandItem><FileAudioIcon />Ep. 42 — The quiet room</CommandItem>
          <CommandItem><FileAudioIcon />Interview with Maya</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem><PlusIcon />New project<CommandShortcut>⌘N</CommandShortcut></CommandItem>
          <CommandItem><MicIcon />Start recording<CommandShortcut>R</CommandShortcut></CommandItem>
          <CommandItem><SparklesIcon />Enhance audio<CommandShortcut>⌘E</CommandShortcut></CommandItem>
          <CommandItem><SettingsIcon />Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  )
  return (
    <>
      <PageHeader eyebrow="Overlays" title="Command" description="The ⌘K palette: fuzzy search across projects and actions." />
      <Section title="Inline">
        <Preview>
          <Command className="w-full max-w-md rounded-2xl border-[0.8px] border-border">{list}</Command>
        </Preview>
      </Section>
      <Section title="Dialog">
        <Preview single>
          <Button variant="outline" onClick={() => setOpen(true)}>Open palette <KbdGroup className="ml-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup></Button>
          <CommandDialog open={open} onOpenChange={setOpen}>{list}</CommandDialog>
        </Preview>
      </Section>
    </>
  )
}

function ToastPage() {
  return (
    <>
      <PageHeader eyebrow="Feedback" title="Toast" description="Sonner toasts as rounded floating cards (12px, hairline, soft shadow). The tinted icon and the words carry the status." />
      <Section title="Types">
        <Preview>
          <Button variant="outline" onClick={() => toast('Project duplicated')}>Default</Button>
          <Button variant="outline" onClick={() => toast.success('Export ready', { description: 'ep42_enhanced.mp3 · 8.4 MB' })}>Success</Button>
          <Button variant="outline" onClick={() => toast.info('Transcript updated', { description: 'Fillers re-detected.' })}>Info</Button>
          <Button variant="outline" onClick={() => toast.warning('Clipping detected', { description: 'Peaks above −1 dBFS at 12:04.' })}>Warning</Button>
          <Button variant="outline" onClick={() => toast.error('Upload failed', { description: 'The file is larger than 2 GB.' })}>Error</Button>
          <Button variant="outline" onClick={() => toast('Word deleted', { action: { label: 'Undo', onClick: () => toast('Restored') } })}>With action</Button>
          <Button
            variant="outline"
            onClick={() => toast.promise(new Promise((r) => setTimeout(r, 2000)), { loading: 'Rendering MP3…', success: 'Rendered', error: 'Failed' })}
          >Promise</Button>
        </Preview>
      </Section>
      <Section title="Usage">
        <Usage dos={['Confirm something that happened off-screen.', 'Offer Undo for reversible destructive actions.']} donts={['Put errors that block the task in a toast — show them inline.', 'Stack more than three.']} />
      </Section>
    </>
  )
}

export const OVERLAY_DEMOS = [
  { slug: 'dialog', title: 'Dialog', Page: DialogPage },
  { slug: 'alert-dialog', title: 'Alert Dialog', Page: AlertDialogPage },
  { slug: 'sheet', title: 'Sheet', Page: SheetPage },
  { slug: 'drawer', title: 'Drawer', Page: DrawerPage },
  { slug: 'popover', title: 'Popover', Page: PopoverPage },
  { slug: 'hover-card', title: 'Hover Card', Page: HoverCardPage },
  { slug: 'tooltip', title: 'Tooltip', Page: TooltipPage },
  { slug: 'dropdown-menu', title: 'Dropdown Menu', Page: DropdownMenuPage },
  { slug: 'context-menu', title: 'Context Menu', Page: ContextMenuPage },
  { slug: 'menubar', title: 'Menubar', Page: MenubarPage },
  { slug: 'command', title: 'Command', Page: CommandPage },
  { slug: 'toast', title: 'Toast', Page: ToastPage },
]
