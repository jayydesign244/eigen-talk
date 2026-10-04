import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, isClerkConfigured } from './context/AuthContext'
import { ThemeProvider } from './components/theme-provider'
import { TooltipProvider } from './components/ui/tooltip'
import { Toaster } from './components/ui/sonner'
import { AuthenticateWithRedirectCallback, useUser } from '@clerk/clerk-react'
import ProtectedRoute from './components/ProtectedRoute'
import { Spinner } from './components/ui/spinner'
import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Processing from './pages/Processing'
import Editor from './pages/Editor'
import McpAuthorize from './pages/McpAuthorize'
import DesignSystem from './pages/design-system/DesignSystem'

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
    <ThemeProvider>
    <TooltipProvider delayDuration={250}>
    <AuthProvider>
      <BrowserRouter>
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
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
    </TooltipProvider>
    </ThemeProvider>
  )
}
