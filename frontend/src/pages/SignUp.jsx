import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRightIcon, CheckIcon, EyeIcon, EyeOffIcon, MinusIcon, OctagonXIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { AuthItem, AuthLayout, SOCIAL_PROVIDERS, SocialIcon } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const RULES = [
  { id: 'len', label: '8 or more characters', test: (p) => p.length >= 8, required: true },
  { id: 'num', label: 'A number', test: (p) => /\d/.test(p) },
  { id: 'case', label: 'Upper and lower case', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { id: 'sym', label: 'A symbol', test: (p) => /[^A-Za-z0-9]/.test(p) },
]
const STRENGTH = ['Too short', 'Weak', 'Okay', 'Strong', 'Very strong']
const STRENGTH_TONE = ['bg-destructive', 'bg-destructive', 'bg-warning', 'bg-success', 'bg-success']

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp, signInWithProvider, authReady } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(null)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const busy = Boolean(submitting) || !authReady

  const passed = useMemo(() => RULES.map((r) => r.test(form.password)), [form.password])
  const score = passed[0] ? passed.filter(Boolean).length : 0

  const handleSocial = async (provider) => {
    setError('')
    setSubmitting(provider)
    const { error } = await signInWithProvider(provider)
    if (error) {
      setError(error.message || 'Sign-in failed')
      setSubmitting(null)
    } else {
      navigate('/dashboard')
    }
  }

  const handleEmailSignUp = async (e) => {
    e.preventDefault()
    setTouched(true)
    setError('')
    if (!form.email || !form.password || form.password.length < 8) {
      setError('Email and a password (8+ chars) are required.')
      return
    }
    setSubmitting('email')
    const { error } = await signUp(form.email, form.password, form.name)
    if (error) {
      setError(error.message || 'Sign-up failed')
      setSubmitting(null)
    } else {
      navigate('/dashboard')
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <AuthLayout
      footer={<>By creating an account you agree to Sonicly’s <a href="#" className="underline decoration-border underline-offset-4 hover:text-foreground">Terms</a> and <a href="#" className="underline decoration-border underline-offset-4 hover:text-foreground">Privacy Policy</a>.</>}
    >
      <AuthItem>
        <p className="text-caps text-muted-foreground">Free to start · no card</p>
        <h1 className="mt-3 font-display text-[44px] leading-[1.02]">Create your account</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Already have one? <Link to="/login" className="font-bold text-foreground underline decoration-brand decoration-2 underline-offset-4">Log in</Link>
        </p>
      </AuthItem>

      <AuthItem className="mt-8 grid grid-cols-3 gap-2">
        {SOCIAL_PROVIDERS.map(({ provider, label }) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="h-11 gap-2 px-2"
            onClick={() => handleSocial(provider)}
            disabled={busy}
            aria-label={`Continue with ${label}`}
          >
            {submitting === provider ? <Spinner /> : <SocialIcon provider={provider} />}
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </AuthItem>

      <AuthItem className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caps text-[10px] text-muted-foreground">or with email</span>
        <span className="h-px flex-1 bg-border" />
      </AuthItem>

      <AuthItem>
        <form onSubmit={handleEmailSignUp} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive" className="animate-rise">
              <OctagonXIcon />
              <AlertDescription className="text-foreground">{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="su-name">Full name <span className="font-normal text-muted-foreground">(optional)</span></Label>
            <Input id="su-name" autoComplete="name" placeholder="Alex Johnson" value={form.name} onChange={set('name')} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-email">Email</Label>
            <Input
              id="su-email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.fm"
              value={form.email}
              onChange={set('email')}
              aria-invalid={touched && !form.email}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-password">Password</Label>
            <InputGroup className="h-11">
              <InputGroupInput
                id="su-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set('password')}
                aria-invalid={touched && form.password.length < 8}
                aria-describedby="su-password-rules"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            <div id="su-password-rules" className="pt-1" aria-live="polite">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className="h-1 flex-1 bg-muted">
                    <span
                      className={cn('block h-full origin-left transition-transform duration-300 ease-[var(--ease-out-expo)]', STRENGTH_TONE[score])}
                      style={{ transform: `scaleX(${score >= n ? 1 : 0})` }}
                    />
                  </span>
                ))}
                <span className="text-caps ml-2 w-20 text-right text-[9px] text-muted-foreground">
                  {form.password ? STRENGTH[score] : 'Strength'}
                </span>
              </div>
              <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {RULES.map((r, i) => (
                  <li key={r.id} className={cn('flex items-center gap-1.5 text-[12px] transition-colors', passed[i] ? 'text-foreground' : 'text-muted-foreground')}>
                    <span className={cn('flex size-3.5 items-center justify-center transition-colors', passed[i] ? 'bg-success text-background' : 'border border-input')}>
                      {passed[i] ? <CheckIcon className="size-2.5 animate-pop" strokeWidth={4} /> : r.required ? null : <MinusIcon className="size-2 opacity-0" />}
                    </span>
                    {r.label}{r.required && !passed[i] && <span className="text-destructive-ink">*</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={busy}>
            {!authReady ? <><Spinner />Loading</> : submitting === 'email' ? <><Spinner />Creating account</> : <>Create account<ArrowRightIcon /></>}
          </Button>
        </form>
      </AuthItem>
    </AuthLayout>
  )
}
