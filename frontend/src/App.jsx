import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, isClerkConfigured } from './context/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/sonner'
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react'
import { MotionConfig } from 'motion/react'
import ProtectedRoute from './components/ProtectedRoute'
import { Spinner } from './components/ui/spinner'
const Landing = lazy(() => import('./pages/Landing'))
const SignUp = lazy(() => import('./pages/SignUp'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Processing = lazy(() => import('./pages/Processing'))
const Editor = lazy(() => import('./pages/Editor'))
const McpAuthorize = lazy(() => import('./pages/McpAuthorize'))
const DesignSystem = lazy(() => import('./pages/design-system/DesignSystem'))

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
      <Spinner className="size-5 text-brand" />
    </div>
  )
}

function SSOCallback() {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true })
  }, [isLoaded, isSignedIn, navigate])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-[13px] font-semibold text-muted-foreground"><Spinner className="text-brand" />Signing you in…</div>
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </div>
  )
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
    <TooltipProvider delayDuration={250}>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/design-system/*" element={<DesignSystem />} />
          {isClerkConfigured() && (
            <Route path="/sso-callback" element={<SSOCallback />} />
          )}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/processing"
            element={
              <ProtectedRoute>
                <Processing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mcp/authorize"
            element={
              <ProtectedRoute>
                <McpAuthorize />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
    </MotionConfig>
  )
}
