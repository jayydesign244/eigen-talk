import { useMemo, useRef, useState } from 'react'
import {
  AudioWaveformIcon, CheckIcon, ChevronDownIcon, MusicIcon, OctagonXIcon, PlusIcon, RotateCcwIcon, SaveIcon,
  SearchCheckIcon, SlidersHorizontalIcon, SparklesIcon, StethoscopeIcon, Trash2Icon, Undo2Icon, UploadIcon, WandSparklesIcon, XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

/* ─── Small building blocks ─────────────────────────────────────── */

function fmtNum(v, step) {
  if (typeof v !== 'number') return String(v)
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2
  return v.toFixed(decimals).replace(/\.0+$/, '')
}

function fmtTime(s) {
  if (!Number.isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = s - m * 60
  return `${m}:${sec < 10 ? '0' : ''}${sec.toFixed(1)}`
}

function Section({ id, title, icon: Icon, count, children, defaultOpen = true, action }) {
  const key = `sonicly-sound-${id}`
  const [open, setOpen] = useState(() => {
    try { const v = localStorage.getItem(key); return v === null ? defaultOpen : v === '1' } catch { return defaultOpen }
  })
  const toggle = () => setOpen((o) => { try { localStorage.setItem(key, o ? '0' : '1') } catch { /* ignore */ } return !o })
  return (
    <section className="border-b border-border">
      <div className="flex items-center gap-2 px-4">
        <button type="button" onClick={toggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 py-3 text-left outline-hidden focus-visible:underline">
          <Icon className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="text-caps text-muted-foreground">{title}</span>
          {count > 0 && <span className="font-mono text-[10px] text-muted-foreground tabular">{count}</span>}
          <ChevronDownIcon className={cn('ml-auto size-3.5 text-muted-foreground transition-transform', !open && '-rotate-90')} />
        </button>
        {action}
      </div>
      {open && <div className="px-4 pb-4">{children}</div>}
    </section>
  )
}

function ParamControl({ spec, value, onChange }) {
  if (spec.type === 'bool') {
    return (
      <label className="flex items-center justify-between gap-3 py-1 text-[12.5px]">
        <span>{spec.label}</span>
        <Switch checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} size="sm" />
      </label>
    )
  }
  if (spec.type === 'choice') {
    return (
      <div className="py-1">
        <p className="mb-1.5 text-[12.5px]">{spec.label}</p>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={spec.label}>
          {spec.options.map((o) => (
            <button
              key={String(o)}
              type="button"
              role="radio"
              aria-checked={String(value) === String(o)}
              onClick={() => onChange(o)}
              className={cn(
                'border px-2 py-0.5 font-mono text-[11px] capitalize outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
                String(value) === String(o) ? 'border-foreground bg-foreground text-background' : 'border-input hover:border-foreground'
              )}
            >
              {String(o)}
            </button>
          ))}
        </div>
      </div>
    )
  }
  const v = typeof value === 'number' ? value : spec.default
  const twoSided = spec.min < 0 && spec.max > 0
  return (
    <div className="py-0.5">
      <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
        <span>{spec.label}</span>
        <span className="font-mono text-[11px] text-muted-foreground tabular">{twoSided && v > 0 ? '+' : ''}{fmtNum(v, spec.step)}{spec.unit}</span>
      </div>
      {twoSided ? (
        <BipolarSlider value={v} min={spec.min} max={spec.max} step={spec.step} onChange={onChange} onReset={() => onChange(0)} label={spec.label} />
      ) : (
        <Slider
          value={[v]}
          min={spec.min}
          max={spec.max}
          step={spec.step}
          onValueChange={([n]) => onChange(n)}
          aria-label={spec.label}
        />
      )}
    </div>
  )
}

/**
 * A slider for two-sided settings (Thin ↔ Full): the fill grows outward
 * from the centre, so "neutral" looks neutral instead of half-filled.
 */
function BipolarSlider({ value, min, max, step = 1, onChange, onReset, label }) {
  const pct = (v) => ((v - min) / (max - min)) * 100
  const zero = pct(Math.max(min, Math.min(max, 0)))
  const at = pct(value)
  return (
    <div className="relative" onDoubleClick={onReset}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-input" aria-hidden="true">
        <div className="absolute inset-y-0 bg-brand" style={{ left: `${Math.min(zero, at)}%`, width: `${Math.abs(at - zero)}%` }} />
        <div className="absolute -top-1 -bottom-1 w-px bg-muted-foreground/60" style={{ left: `${zero}%` }} />
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([n]) => onChange(n)}
        aria-label={label}
        className="[&_[data-slot=slider-range]]:opacity-0 [&_[data-slot=slider-track]]:bg-transparent"
      />
    </div>
  )
}

/* ─── Effect card ───────────────────────────────────────────────── */

function EffectCard({ effect, spec, mode, onChange, onRemove, currentTime, duration }) {
  const [showAll, setShowAll] = useState(false)
  const params = spec.params.filter((p) => mode === 'pro' || p.simple)
  const long = params.length > 8
  const shown = long && !showAll ? params.slice(0, 8) : params
  const scope = effect.scope
  const setParam = (key, val) => onChange({ ...effect, params: { ...effect.params, [key]: val } })
  const setScope = (next) => onChange({ ...effect, scope: next })
  const scopable = !spec.changes_duration && !['fade_in', 'fade_out', 'loudness', 'limiter'].includes(spec.type)

  return (
    <div className={cn('border bg-card', effect.enabled ? 'border-border' : 'border-dashed border-input opacity-70')}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{spec.label}</p>
          <p className="font-mono text-[10.5px] text-muted-foreground">
            {scope ? `${fmtTime(scope.start)} – ${fmtTime(scope.end)}` : 'Whole recording'}
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span><Switch size="sm" checked={effect.enabled} onCheckedChange={(v) => onChange({ ...effect, enabled: v })} aria-label={`${spec.label} on/off`} /></span>
          </TooltipTrigger>
          <TooltipContent>{effect.enabled ? 'Turn off (keep settings)' : 'Turn on'}</TooltipContent>
        </Tooltip>
        <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Remove ${spec.label}`}><XIcon /></Button>
      </div>
      <div className="space-y-1 px-3 py-2">
        {mode === 'simple' && <p className="pb-1 text-[11.5px] text-muted-foreground">{spec.description}</p>}
        {shown.length === 0 && <p className="text-[12px] text-muted-foreground">No settings — it’s on or off.</p>}
        {shown.map((p) => (
          <ParamControl key={p.key} spec={p} value={effect.params[p.key]} onChange={(v) => setParam(p.key, v)} />
        ))}
        {long && (
          <button type="button" onClick={() => setShowAll((s) => !s)} className="pt-1 text-[11.5px] font-semibold underline-offset-2 hover:underline">
            {showAll ? 'Show fewer' : `Show all ${params.length} settings`}
          </button>
        )}
        {mode === 'pro' && scopable && (
          <div className="mt-2 border-t border-border pt-2">
            <div className="flex items-center justify-between text-[12px]">
              <span>Apply to</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => setScope(null)} className={cn('border px-2 py-0.5 font-mono text-[11px]', !scope ? 'border-foreground bg-foreground text-background' : 'border-input')}>Whole</button>
                <button
                  type="button"
                  onClick={() => setScope(scope || { start: Math.max(0, currentTime - 2), end: Math.min(duration || currentTime + 3, currentTime + 3) })}
                  className={cn('border px-2 py-0.5 font-mono text-[11px]', scope ? 'border-foreground bg-foreground text-background' : 'border-input')}
                >
                  Part
                </button>
              </div>
            </div>
            {scope && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['start', 'end'].map((k) => (
                  <label key={k} className="grid gap-1 text-[11px] text-muted-foreground">
                    <span className="flex items-center justify-between capitalize">{k}
                      <button type="button" className="font-semibold text-foreground hover:underline" onClick={() => setScope({ ...scope, [k]: Number(currentTime.toFixed(2)) })}>use playhead</button>
                    </span>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      value={scope[k]}
                      onChange={(e) => setScope({ ...scope, [k]: Number(e.target.value) })}
                      className="h-7 font-mono text-[12px]"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Layer card ────────────────────────────────────────────────── */

function LayerCard({ layer, kinds, onChange, onRemove, duration }) {
  const set = (k, v) => onChange({ ...layer, [k]: v })
  const kind = kinds.find((k) => k.id === layer.kind)
  const sliders = [
    { key: 'volume', label: 'Volume', min: -40, max: 6, step: 0.5, unit: 'dB' },
    { key: 'duck', label: 'Duck under speech', min: 0, max: 40, step: 1, unit: 'dB' },
    ...(layer.kind === 'outro' ? [] : [{ key: 'start', label: 'Starts at', min: 0, max: Math.max(1, Math.floor(duration || 60)), step: 0.1, unit: 's' }]),
    { key: 'fade_in', label: 'Fade in', min: 0, max: 20, step: 0.1, unit: 's' },
    { key: 'fade_out', label: 'Fade out', min: 0, max: 20, step: 0.1, unit: 's' },
    { key: 'pan', label: 'Pan (L ↔ R)', min: -100, max: 100, step: 1, unit: '' },
  ]
  return (
    <div className={cn('border bg-card', layer.enabled ? 'border-border' : 'border-dashed border-input opacity-70')}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <MusicIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold">{layer.name}</p>
          <p className="font-mono text-[10.5px] text-muted-foreground">{kind?.label}{layer.duration ? ` · ${fmtTime(layer.duration)}` : ''}</p>
        </div>
        <Switch size="sm" checked={layer.enabled} onCheckedChange={(v) => set('enabled', v)} aria-label="Layer on/off" />
        <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label={`Remove ${layer.name}`}><XIcon /></Button>
      </div>
      <div className="space-y-1 px-3 py-2">
        <div className="flex flex-wrap gap-1 pb-1">
          {kinds.map((k) => (
            <button key={k.id} type="button" onClick={() => set('kind', k.id)} className={cn('border px-2 py-0.5 font-mono text-[11px]', layer.kind === k.id ? 'border-foreground bg-foreground text-background' : 'border-input')}>
              {k.label}
            </button>
          ))}
        </div>
        {sliders.map((s) => (
          <ParamControl key={s.key} spec={{ ...s, type: 'float' }} value={layer[s.key]} onChange={(v) => set(s.key, v)} />
        ))}
        <label className="flex items-center justify-between gap-3 py-1 text-[12.5px]">
          <span>Loop to fill</span>
          <Switch size="sm" checked={layer.loop} onCheckedChange={(v) => set('loop', v)} />
        </label>
      </div>
    </div>
  )
}

/* ─── Main panel ────────────────────────────────────────────────── */

const LOOK_CATEGORIES = ['Clean-up', 'Voice tone', 'Broadcast', 'Rooms & space', 'Characters & fun']

export function SoundPanel({
  registry, state, mode, onMode, onDocChange, onLook, onUndo, onReset,
  preview, ab, onAb, dirty, applying, onApply, onDiscard,
  profile, analyzing, onAnalyze, onFix,
  presets, onSavePreset, onApplyPreset, onDeletePreset,
  onUploadLayer, uploadingLayer, currentTime = 0, duration = 0, isVideo = false, onClose,
}) {
  const [lookCat, setLookCat] = useState('Voice tone')
  const [presetName, setPresetName] = useState('')
  const fileRef = useRef(null)
  const [layerKind, setLayerKind] = useState('music')

  const effectsByType = useMemo(() => Object.fromEntries((registry?.effects || []).map((e) => [e.type, e])), [registry])
  const doc = state?.doc
  if (!registry || !doc) {
    return <div className="flex h-full items-center justify-center gap-2 text-[13px] text-muted-foreground"><Spinner />Loading sound tools…</div>
  }

  const setDoc = (next) => onDocChange({ ...doc, ...next })
  const setCharacter = (key, v) => setDoc({ character: { ...doc.character, [key]: v } })
  const updateEffect = (i, e) => setDoc({ effects: doc.effects.map((x, j) => (j === i ? e : x)), look: null })
  const removeEffect = (i) => setDoc({ effects: doc.effects.filter((_, j) => j !== i), look: null })
  const addEffect = (type) => {
    const spec = effectsByType[type]
    if (!spec) return
    const exists = doc.effects.find((e) => e.type === type && !e.scope)
    if (exists) return
    setDoc({ effects: [...doc.effects, { type, enabled: true, scope: null, params: Object.fromEntries(spec.params.map((p) => [p.key, p.default])) }] })
  }
  const looks = registry.looks.filter((l) => l.category === lookCat)
  const availableEffects = registry.effects.filter((e) => !(isVideo && (e.type === 'tempo' || e.type === 'speed')))
  const moved = registry.character.filter((c) => (c.key === 'intensity' ? doc.character[c.key] !== 100 : doc.character[c.key] !== 0)).length

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-4">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background"><SlidersHorizontalIcon className="size-3" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold leading-tight">Sound</p>
          <p className="truncate font-mono text-[10.5px] text-muted-foreground">on “{state.base?.label || 'Original'}”</p>
        </div>
        <div className="flex border border-input" role="radiogroup" aria-label="Detail level">
          {['simple', 'pro'].map((m) => (
            <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => onMode(m)} className={cn('px-2 py-0.5 text-[11px] font-semibold capitalize', mode === m ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>{m}</button>
          ))}
        </div>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={onUndo} disabled={!state.can_undo} aria-label="Undo sound change"><Undo2Icon /></Button></TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild><Button variant="ghost" size="icon-sm" onClick={onReset} disabled={state.is_empty} aria-label="Remove all effects"><RotateCcwIcon /></Button></TooltipTrigger>
          <TooltipContent>Remove all effects</TooltipContent>
        </Tooltip>
        {onClose && <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close sound panel"><XIcon /></Button>}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Sound check */}
        <Section id="check" title="Sound check" icon={StethoscopeIcon} count={profile?.findings?.length || 0}>
          {!profile ? (
            <div className="flex items-center gap-3">
              <p className="flex-1 text-[12.5px] text-muted-foreground">Measure loudness, noise, tone and echo, and get one-click fixes.</p>
              <Button size="sm" variant="outline" onClick={onAnalyze} disabled={analyzing}>{analyzing ? <><Spinner />Listening</> : <><SearchCheckIcon />Check</>}</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-px border border-border bg-border text-center">
                {[
                  ['Loudness', `${Math.round(profile.loudness_lufs)} LUFS`],
                  ['Noise', profile.snr_db > 60 ? 'Very clean' : `${Math.round(profile.snr_db)} dB clear`],
                  ['Pitch', profile.pitch ? `${Math.round(profile.pitch.median_hz)} Hz` : '—'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-card px-2 py-2">
                    <p className="font-mono text-[12px] font-bold tabular">{v}</p>
                    <p className="text-[10.5px] text-muted-foreground">{k}</p>
                  </div>
                ))}
              </div>
              {profile.findings.length === 0 ? (
                <p className="flex items-center gap-2 text-[12.5px]"><CheckIcon className="size-3.5 text-success" />Sounds healthy — no issues found.</p>
              ) : (
                <ul className="space-y-1.5">
                  {profile.findings.map((f) => (
                    <li key={f.key} className="flex items-start gap-2 border border-border bg-card px-3 py-2">
                      <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', f.severity >= 3 ? 'bg-destructive' : f.severity === 2 ? 'bg-warning' : 'bg-muted-foreground')} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-bold">{f.title}</p>
                        <p className="text-[11.5px] text-muted-foreground">{f.detail}</p>
                      </div>
                      <Button size="xs" variant="outline" onClick={() => onFix(f)}><WandSparklesIcon />Fix</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Section>

        {/* Looks */}
        <Section id="looks" title="Quick looks" icon={SparklesIcon}>
          <div className="-mx-1 mb-3 flex gap-1 overflow-x-auto px-1 pb-1">
            {LOOK_CATEGORIES.map((c) => (
              <button key={c} type="button" onClick={() => setLookCat(c)} className={cn('shrink-0 border px-2 py-1 text-[11px] font-semibold', lookCat === c ? 'border-foreground bg-foreground text-background' : 'border-input text-muted-foreground hover:text-foreground')}>{c}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {looks.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onLook(l.id)}
                title={l.description}
                className={cn(
                  'border px-2.5 py-2 text-left outline-hidden transition-colors focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-ring',
                  doc.look === l.id ? 'border-foreground shadow-[inset_0_-3px_0_0_var(--brand)]' : 'border-input hover:border-foreground'
                )}
              >
                <span className="block text-[12.5px] font-bold">{l.label}</span>
                <span className="line-clamp-2 text-[10.5px] text-muted-foreground">{l.description}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* Character */}
        <Section id="character" title="Character" icon={AudioWaveformIcon} count={moved}>
          <div className="space-y-2.5">
            {registry.character.map((c) => {
              const isIntensity = c.key === 'intensity'
              const v = doc.character[c.key] ?? (isIntensity ? 100 : 0)
              return (
                <div key={c.key}>
                  <div className="flex items-baseline justify-between text-[11.5px]">
                    <span className={cn(v < (isIntensity ? 100 : 0) && 'font-bold')}>{c.low}</span>
                    <span className="font-mono text-[10.5px] text-muted-foreground tabular">{isIntensity ? `${Math.round(v)}%` : v > 0 ? `+${Math.round(v)}` : Math.round(v)}</span>
                    <span className={cn(v > (isIntensity ? 0 : 0) && !isIntensity && 'font-bold', isIntensity && v > 50 && 'font-bold')}>{c.high}</span>
                  </div>
                  {isIntensity ? (
                    <div onDoubleClick={() => setCharacter(c.key, 100)}>
                      <Slider value={[v]} min={0} max={100} step={1} onValueChange={([n]) => setCharacter(c.key, n)} aria-label={`${c.low} to ${c.high}`} tone="brand" />
                    </div>
                  ) : (
                    <BipolarSlider
                      value={v}
                      min={-100}
                      max={100}
                      onChange={(n) => setCharacter(c.key, n)}
                      onReset={() => setCharacter(c.key, 0)}
                      label={`${c.low} to ${c.high}`}
                    />
                  )}
                </div>
              )
            })}
            <p className="text-[10.5px] text-muted-foreground">Double-click a slider to centre it.</p>
          </div>
        </Section>

        {/* Effects */}
        <Section
          id="effects"
          title="Effects"
          icon={SlidersHorizontalIcon}
          count={doc.effects.length}
          action={(
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xs"><PlusIcon />Add</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-h-96 w-64 overflow-y-auto">
                {registry.groups.map((g, gi) => {
                  const items = availableEffects.filter((e) => e.group === g.id)
                  if (!items.length) return null
                  return (
                    <DropdownMenuGroup key={g.id}>
                      {gi > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuLabel>{g.label}</DropdownMenuLabel>
                      {items.map((e) => (
                        <DropdownMenuItem key={e.type} onSelect={() => addEffect(e.type)} disabled={doc.effects.some((x) => x.type === e.type && !x.scope)}>
                          <span className="flex min-w-0 flex-col">
                            <span className="font-semibold">{e.label}</span>
                            <span className="line-clamp-1 text-[11px] text-muted-foreground in-data-[highlighted]:text-background/70">{e.description}</span>
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        >
          {doc.effects.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">No effects yet. Pick a look, move a slider, ask the assistant — or add one here.</p>
          ) : (
            <div className="space-y-2">
              {doc.effects.map((e, i) => (
                effectsByType[e.type] ? (
                  <EffectCard
                    key={`${e.id || e.type}-${i}`}
                    effect={e}
                    spec={effectsByType[e.type]}
                    mode={mode}
                    onChange={(next) => updateEffect(i, next)}
                    onRemove={() => removeEffect(i)}
                    currentTime={currentTime}
                    duration={duration}
                  />
                ) : null
              ))}
            </div>
          )}
          {mode === 'pro' && state.chain?.length > 0 && (
            <details className="mt-3 text-[11.5px]">
              <summary className="cursor-pointer font-semibold">What actually runs ({state.chain.length})</summary>
              <ol className="mt-2 list-decimal space-y-0.5 pl-5 font-mono text-[10.5px] text-muted-foreground">
                {state.chain.map((line, i) => <li key={i}>{line}</li>)}
              </ol>
            </details>
          )}
        </Section>

        {/* Layers */}
        <Section id="layers" title="Music & layers" icon={MusicIcon} count={doc.layers.length} defaultOpen={false}>
          <div className="space-y-2">
            {doc.layers.map((l, i) => (
              <LayerCard
                key={l.id || i}
                layer={l}
                kinds={registry.layer_kinds}
                duration={duration}
                onChange={(next) => setDoc({ layers: doc.layers.map((x, j) => (j === i ? next : x)) })}
                onRemove={() => setDoc({ layers: doc.layers.filter((_, j) => j !== i) })}
              />
            ))}
            <div className="flex flex-wrap items-center gap-1.5">
              {registry.layer_kinds.map((k) => (
                <Button
                  key={k.id}
                  variant="outline"
                  size="xs"
                  disabled={uploadingLayer}
                  onClick={() => { setLayerKind(k.id); fileRef.current?.click() }}
                  title={k.notes}
                >
                  {uploadingLayer && layerKind === k.id ? <Spinner /> : <UploadIcon />}{k.label}
                </Button>
              ))}
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUploadLayer(f, layerKind); e.target.value = '' }}
              />
            </div>
            <p className="text-[10.5px] text-muted-foreground">Music beds loop and automatically dip when someone talks.</p>
          </div>
        </Section>

        {/* Presets */}
        <Section id="presets" title="My presets" icon={SaveIcon} count={presets?.length || 0} defaultOpen={false}>
          <form
            className="flex gap-1.5"
            onSubmit={(e) => { e.preventDefault(); if (presetName.trim()) { onSavePreset(presetName.trim()); setPresetName('') } }}
          >
            <Input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="Name this sound, e.g. My podcast voice" className="h-8 text-[12.5px]" aria-label="Preset name" />
            <Button type="submit" size="sm" variant="outline" disabled={!presetName.trim() || state.is_empty}>Save</Button>
          </form>
          {presets?.length > 0 && (
            <ul className="mt-2 divide-y divide-border border border-border">
              {presets.map((p) => (
                <li key={p.id} className="flex items-center gap-2 px-3 py-1.5 text-[12.5px]">
                  <span className="min-w-0 flex-1 truncate font-semibold">{p.name}</span>
                  <Button size="xs" variant="ghost" onClick={() => onApplyPreset(p.id)}>Use</Button>
                  <Button size="icon-xs" variant="ghost" onClick={() => onDeletePreset(p.id)} aria-label={`Delete ${p.name}`}><Trash2Icon /></Button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* A/B + apply */}
      <div className="shrink-0 space-y-2 border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 border border-input" role="radiogroup" aria-label="Compare">
            {[['before', 'Original'], ['after', 'With effects']].map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={ab === k}
                disabled={k === 'after' && state.is_empty}
                onClick={() => onAb(k)}
                className={cn('flex-1 py-1.5 text-[12px] font-semibold disabled:opacity-40', ab === k ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="flex min-h-4 items-center gap-1.5 text-[11.5px] text-muted-foreground" aria-live="polite">
          {preview.status === 'rendering' && <><Spinner className="size-3" />Rendering preview…</>}
          {preview.status === 'ready' && !state.is_empty && <><CheckIcon className="size-3 text-success" />Preview ready — press play</>}
          {preview.status === 'error' && <span className="flex items-start gap-1.5 text-destructive-ink"><OctagonXIcon className="mt-0.5 size-3 shrink-0" />{preview.error}</span>}
          {state.is_empty && preview.status !== 'error' && 'No effects — you’re hearing the original.'}
        </p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDiscard} disabled={!dirty || applying}>Discard</Button>
          <Button size="sm" variant="brand" className="flex-1" onClick={onApply} disabled={!dirty || applying || state.is_empty}>
            {applying ? <><Spinner />Saving version</> : <><CheckIcon />Apply as new version</>}
          </Button>
        </div>
      </div>
    </div>
  )
}
