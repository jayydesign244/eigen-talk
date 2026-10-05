import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileAudioIcon, LayoutTemplateIcon, LogOutIcon, MicIcon, MonitorIcon, MoonIcon, PlusIcon, SearchIcon, SunIcon, UploadIcon,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/components/theme-provider'
import { Logo } from '@/components/brand/Logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from '@/components/ui/command'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { relativeTime } from '@/lib/format'
import { ActivityBell } from '@/components/app/ActivityBell'

export function useDisplayName() {
  const { user } = useAuth()
  const name = user?.user_metadata?.name || user?.email?.split('@')[0] || 'You'
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
  return { name, initials, firstName: name.split(/\s+/)[0], email: user?.email, imageUrl: user?.imageUrl }
}

function UserMenu() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { name, initials, email, imageUrl } = useDisplayName()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 border border-transparent py-1 pr-2.5 pl-1 transition-colors outline-hidden hover:border-border hover:bg-accent focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring data-[state=open]:border-border data-[state=open]:bg-accent"
          aria-label="Account menu"
        >
          <Avatar size="sm">
            {imageUrl && <AvatarImage src={imageUrl} alt="" />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate text-[13px] font-bold sm:block">{name}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block text-[13px] font-bold text-foreground">{name}</span>
          {email && <span className="block truncate text-[12px] font-medium text-muted-foreground">{email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger><MonitorIcon />Theme</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild><Link to="/design-system"><LayoutTemplateIcon />Design system</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut()
            navigate('/')
          }}
        >
          <LogOutIcon />Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * ⌘K palette: jump to any project or start a new one. `projects` and the
 * action callbacks come from the page that owns the data.
 */
function CommandPalette({ open, onOpenChange, projects = [], onNewProject, onRecord, onOpenProject }) {
  const run = (fn) => () => { onOpenChange(false); fn?.() }
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} title="Search" description="Search projects and actions">
      <CommandInput placeholder="Search projects or type a command…" />
      <CommandList>
        <CommandEmpty>No project or action matches.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={run(onNewProject)}><UploadIcon />Upload audio<CommandShortcut>U</CommandShortcut></CommandItem>
          <CommandItem onSelect={run(onRecord)}><MicIcon />Record in browser<CommandShortcut>R</CommandShortcut></CommandItem>
        </CommandGroup>
        {projects.length > 0 && <CommandSeparator />}
        {projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.slice(0, 30).map((p) => (
              <CommandItem key={p.id} value={`${p.name} ${p.id}`} onSelect={run(() => onOpenProject?.(p))}>
                <FileAudioIcon />
                <span className="truncate">{p.name}</span>
                <span className="ml-auto shrink-0 font-mono text-[11px] text-muted-foreground in-data-[selected=true]:text-background/70">
                  {p.duration || relativeTime(p.updated_at)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}

export function AppHeader({ projects, onNewProject, onRecord, onOpenProject }) {
  const [open, setOpen] = useState(false)
  const { resolvedTheme, toggleTheme } = useTheme()

  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <Link to="/dashboard" aria-label="Sonicly — projects" className="mr-2"><Logo /></Link>
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex h-9 w-full max-w-72 items-center gap-2.5 border border-input bg-card px-3 text-[13px] text-muted-foreground transition-colors outline-hidden hover:border-muted-foreground/60 hover:text-foreground focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring sm:ml-6 md:ml-auto"
        >
          <SearchIcon className="size-4 shrink-0" />
          <span className="truncate">Search projects…</span>
          <KbdGroup className="ml-auto hidden sm:inline-flex"><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>
        </button>
        <ActivityBell projects={projects} onOpenProject={onOpenProject} />
        <Button variant="ghost" size="icon-sm" onClick={toggleTheme} aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`} className="hidden sm:inline-flex">
          {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </Button>
        {onNewProject && (
          <Button size="sm" onClick={onNewProject} className="hidden md:inline-flex"><PlusIcon />New project</Button>
        )}
        <UserMenu />
      </div>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        projects={projects}
        onNewProject={onNewProject}
        onRecord={onRecord}
        onOpenProject={onOpenProject}
      />
    </header>
  )
}
