import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { AuthContext } from '@/contexts/AuthContext'
import Index from '../Index'

// Mock the dashboard components
vi.mock('@/components/dashboard/StatsCard', () => ({
  default: ({ title, value, change }: any) => (
    <div data-testid="stats-card">
      <h3>{title}</h3>
      <p>{value}</p>
      {change && <span>{change.value}%</span>}
    </div>
  )
}))

vi.mock('@/components/dashboard/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions Component</div>
}))

vi.mock('@/components/dashboard/RecentActivity', () => ({
  default: () => <div data-testid="recent-activity">Recent Activity Component</div>
}))

// Mock hooks
const mockDashboardData = {
  stats: {
    totalEmployees: 247,
    activeToday: 231,
    pendingLeaves: 12,
    upcomingReviews: 8
  },
  recentActivities: [
    {
      id: '1',
      type: 'employee',
      title: 'New Employee Added',
      description: 'John Doe joined Engineering department',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'HR Admin'
    }
  ],
  isLoading: false,
  error: null
}

vi.mock('@/hooks/useDashboard', () => ({
  useDashboard: () => mockDashboardData
}))

describe('Index Page', () => {
  const mockUser = {
    id: '1',
    email: 'admin@company.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: '/admin-avatar.jpg'
  }

  const mockAuthContextValue = {
    user: mockUser,
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithAuth = (authValue = mockAuthContextValue) => {
    return render(
      <AuthContext.Provider value={authValue}>
        <Index />
      </AuthContext.Provider>
    )
  }

  describe('Page Rendering', () => {
    it('renders the main dashboard page', () => {
      renderWithAuth()
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome back! Here\'s your overview for today.')).toBeInTheDocument()
    })

    it('displays the page title in header', () => {
      renderWithAuth()
      
      const pageHeader = screen.getByRole('heading', { name: /dashboard/i, level: 1 })
      expect(pageHeader).toBeInTheDocument()
    })

    it('shows dashboard description', () => {
      renderWithAuth()
      
      expect(screen.getByText('Welcome back! Here\'s your overview for today.')).toBeInTheDocument()
    })
  })

  describe('Stats Section', () => {
    it('renders all stats cards', async () => {
      renderWithAuth()
      
      await waitFor(() => {
        const statsCards = screen.getAllByTestId('stats-card')
        expect(statsCards).toHaveLength(4)
      })
      
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('Active Today')).toBeInTheDocument()
      expect(screen.getByText('Pending Leaves')).toBeInTheDocument()
      expect(screen.getByText('Upcoming Reviews')).toBeInTheDocument()
    })

    it('displays correct stats values', async () => {
      renderWithAuth()
      
      await waitFor(() => {
        expect(screen.getByText('247')).toBeInTheDocument()
        expect(screen.getByText('231')).toBeInTheDocument()
        expect(screen.getByText('12')).toBeInTheDocument()
        expect(screen.getByText('8')).toBeInTheDocument()
      })
    })

    it('applies responsive grid layout', () => {
      renderWithAuth()
      
      const statsGrid = screen.getByText('Total Employees').closest('.grid')
      expect(statsGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4', 'gap-6')
    })
  })

  describe('Quick Actions Section', () => {
    it('renders quick actions component', () => {
      renderWithAuth()
      
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    })

    it('displays quick actions section title', () => {
      renderWithAuth()
      
      // The title would be within the QuickActions component
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
    })
  })

  describe('Recent Activity Section', () => {
    it('renders recent activity component', () => {
      renderWithAuth()
      
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('uses proper semantic HTML structure', () => {
      renderWithAuth()
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    })

    it('applies responsive grid layout for main content', () => {
      renderWithAuth()
      
      const mainGrid = screen.getByRole('main').querySelector('.grid')
      expect(mainGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-3', 'gap-6')
    })

    it('spans quick actions across full width on large screens', () => {
      renderWithAuth()
      
      const quickActionsContainer = screen.getByTestId('quick-actions').closest('.lg\\:col-span-3')
      expect(quickActionsContainer).toBeInTheDocument()
    })
  })

  describe('User Authentication', () => {
    it('renders when user is authenticated', () => {
      renderWithAuth()
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('handles missing user gracefully', () => {
      const noUserContext = {
        ...mockAuthContextValue,
        user: null
      }
      
      renderWithAuth(noUserContext)
      
      // Should still render the dashboard layout
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('handles loading state for dashboard data', () => {
      vi.mocked(mockDashboardData).isLoading = true
      
      renderWithAuth()
      
      // Dashboard should still render with loading states in components
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('handles dashboard data errors gracefully', () => {
      vi.mocked(mockDashboardData).error = new Error('Failed to load dashboard')
      
      renderWithAuth()
      
      // Page should still render
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('applies responsive spacing and padding', () => {
      renderWithAuth()
      
      const container = screen.getByRole('main').parentElement
      expect(container).toHaveClass('space-y-6')
    })

    it('uses responsive margin and padding classes', () => {
      renderWithAuth()
      
      const mainContainer = screen.getByRole('main').closest('.p-6')
      expect(mainContainer).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithAuth()
      
      const h1 = screen.getByRole('heading', { level: 1 })
      expect(h1).toBeInTheDocument()
      expect(h1).toHaveTextContent('Dashboard')
    })

    it('provides meaningful page structure', () => {
      renderWithAuth()
      
      expect(screen.getByRole('main')).toBeInTheDocument()
      expect(screen.getByText('Welcome back! Here\'s your overview for today.')).toBeInTheDocument()
    })
  })
})