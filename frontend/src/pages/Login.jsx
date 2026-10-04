import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRightIcon, EyeIcon, EyeOffIcon, OctagonXIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { AuthItem, AuthLayout, SOCIAL_PROVIDERS, SocialIcon } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithProvider, authReady } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(null) // null | 'email' | provider
  const [error, setError] = useState('')
  const busy = Boolean(submitting) || !authReady

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

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setSubmitting('email')
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message || 'Login failed')
      setSubmitting(null)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout
      footer={<>By continuing you agree to Sonicly’s <a href="#" className="underline decoration-border underline-offset-4 hover:text-foreground">Terms</a> and <a href="#" className="underline decoration-border underline-offset-4 hover:text-foreground">Privacy Policy</a>.</>}
    >
      <AuthItem>
        <p className="text-caps text-muted-foreground">Welcome back</p>
        <h1 className="mt-3 font-display text-[44px] leading-[1.02]">Log in to Sonicly</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          New here? <Link to="/signup" className="font-bold text-foreground underline decoration-brand decoration-2 underline-offset-4">Create an account</Link>
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
        <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
          {error && (
            <Alert variant="destructive" className="animate-rise">
              <OctagonXIcon />
              <AlertDescription className="text-foreground">{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.fm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error) && !email}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <button
                type="button"
                className="text-[12px] font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => toast.info('Password reset', { description: 'Sign in with Google or Apple, or contact support to reset your password.' })}
              >
                Forgot password?
              </button>
            </div>
            <InputGroup className="h-11">
              <InputGroupInput
                id="login-password"
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error) && !password}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={() => setShowPass((v) => !v)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={busy}>
            {!authReady ? <><Spinner />Loading</> : submitting === 'email' ? <><Spinner />Logging in</> : <>Log in<ArrowRightIcon /></>}
          </Button>
        </form>
      </AuthItem>
    </AuthLayout>
  )
}
