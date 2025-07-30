import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from './LoginForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, ShieldX } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
  requiredRole?: string
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You don't have the required role to access this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Check permission-based access
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}