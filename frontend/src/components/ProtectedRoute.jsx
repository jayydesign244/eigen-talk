import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogoMark } from '@/components/brand/Logo'
import { Spinner } from '@/components/ui/spinner'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background" aria-busy="true">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <LogoMark className="size-10 animate-pop" />
          <span className="flex items-center gap-2 text-[13px] font-semibold"><Spinner className="text-brand" />Loading your studio…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
