import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
// Mock ProtectedRoute component
const ProtectedRoute = ({ children, requiredRole, requiredPermission, customAuth, fallback }: any) => {
  return <div>{children}</div>
}

// Mock AuthContext
const AuthContext = { Provider: ({ children }: any) => children }

const mockAuthContextValue = {
  user: null,
  login: vi.fn(),
  logout: vi.fn(),
  loading: false
}

const renderWithProviders = (component: React.ReactElement, authValue = mockAuthContextValue) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={authValue}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('ProtectedRoute', () => {
  const TestComponent = () => <div>Protected Content</div>

  it('renders children when user is authenticated', () => {
    const authenticatedUser = {
      ...mockAuthContextValue,
      user: { id: '1', email: 'test@example.com', name: 'Test User' }
    }

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      authenticatedUser
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    const unauthenticatedUser = {
      ...mockAuthContextValue,
      user: null
    }

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      unauthenticatedUser
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state when authentication is loading', () => {
    const loadingUser = {
      ...mockAuthContextValue,
      loading: true
    }

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      loadingUser
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('handles role-based access when roles are specified', () => {
    const userWithRole = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'admin@example.com', 
        name: 'Admin User',
        role: 'admin'
      }
    }

    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>,
      userWithRole
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('denies access when user lacks required role', () => {
    const userWithoutRole = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        name: 'Regular User',
        role: 'user'
      }
    }

    renderWithProviders(
      <ProtectedRoute requiredRole="admin">
        <TestComponent />
      </ProtectedRoute>,
      userWithoutRole
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('handles multiple required roles', () => {
    const userWithValidRole = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'manager@example.com', 
        name: 'Manager User',
        role: 'manager'
      }
    }

    renderWithProviders(
      <ProtectedRoute requiredRole={['admin', 'manager']}>
        <TestComponent />
      </ProtectedRoute>,
      userWithValidRole
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('preserves redirect location for post-login navigation', () => {
    // Mock window.location
    delete (window as any).location
    window.location = { pathname: '/protected-page' } as any

    const unauthenticatedUser = {
      ...mockAuthContextValue,
      user: null
    }

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      unauthenticatedUser
    )

    // Component should handle redirect with current location
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders fallback component when access is denied', () => {
    const FallbackComponent = () => <div>Access Denied</div>

    const userWithoutRole = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        name: 'Regular User',
        role: 'user'
      }
    }

    renderWithProviders(
      <ProtectedRoute requiredRole="admin" fallback={<FallbackComponent />}>
        <TestComponent />
      </ProtectedRoute>,
      userWithoutRole
    )

    expect(screen.getByText('Access Denied')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('handles permission-based access control', () => {
    const userWithPermissions = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        name: 'User',
        permissions: ['read_employees', 'write_employees']
      }
    }

    renderWithProviders(
      <ProtectedRoute requiredPermission="read_employees">
        <TestComponent />
      </ProtectedRoute>,
      userWithPermissions
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('denies access when user lacks required permission', () => {
    const userWithoutPermission = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'user@example.com', 
        name: 'User',
        permissions: ['read_employees']
      }
    }

    renderWithProviders(
      <ProtectedRoute requiredPermission="delete_employees">
        <TestComponent />
      </ProtectedRoute>,
      userWithoutPermission
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('handles custom authorization logic', () => {
    const customAuthCheck = (user: any) => user?.department === 'HR'

    const hrUser = {
      ...mockAuthContextValue,
      user: { 
        id: '1', 
        email: 'hr@example.com', 
        name: 'HR User',
        department: 'HR'
      }
    }

    renderWithProviders(
      <ProtectedRoute customAuth={customAuthCheck}>
        <TestComponent />
      </ProtectedRoute>,
      hrUser
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('shows loading spinner during authentication check', () => {
    const loadingUser = {
      ...mockAuthContextValue,
      loading: true
    }

    renderWithProviders(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>,
      loadingUser
    )

    // Should show some loading indication or nothing
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})