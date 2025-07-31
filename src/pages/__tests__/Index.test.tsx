import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { userEvent } from '@testing-library/user-event'
import Index from '../Index'

// Mock the dashboard hooks
vi.mock('@/hooks/useDashboard', () => ({
  useDashboardStats: () => ({
    data: {
      totalEmployees: 247,
      pendingLeaveRequests: 18,
      monthlyPayroll: 284000,
      performanceReviews: 89
    },
    isLoading: false
  }),
  useRecentActivity: () => ({
    data: [
      { id: 1, type: 'employee_created', message: 'New employee John Doe added', timestamp: new Date().toISOString() },
      { id: 2, type: 'leave_approved', message: 'Leave request approved for Sarah Johnson', timestamp: new Date().toISOString() }
    ],
    isLoading: false
  })
}))

// Mock child components
vi.mock('@/components/layout/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}))

vi.mock('@/components/layout/Header', () => ({
  Header: () => <div data-testid="header">Header</div>
}))

vi.mock('@/components/dashboard/StatsCard', () => ({
  default: ({ title, value, change, changeType, icon: Icon, color }: any) => (
    <div data-testid={`stats-card-${color}`}>
      <h3>{title}</h3>
      <div>{value}</div>
      <div data-testid={`change-${changeType}`}>{change}</div>
      {Icon && <Icon data-testid="icon" />}
    </div>
  )
}))

vi.mock('@/components/dashboard/ModuleCard', () => ({
  default: ({ title, description, stats, actions, notifications, color }: any) => (
    <div data-testid={`module-card-${color}`}>
      <h3>{title}</h3>
      <p>{description}</p>
      {stats && stats.map((stat: any, index: number) => (
        <div key={index} data-testid={`stat-${index}`}>
          {stat.label}: {stat.value}
        </div>
      ))}
      {actions && actions.map((action: any, index: number) => (
        <a key={index} href={action.href} data-testid={`action-${index}`}>
          {action.label}
        </a>
      ))}
      {notifications && <div data-testid="notifications">{notifications}</div>}
    </div>
  )
}))

vi.mock('@/components/dashboard/QuickActions', () => ({
  default: () => <div data-testid="quick-actions">Quick Actions</div>
}))

vi.mock('@/components/dashboard/RecentActivity', () => ({
  default: () => <div data-testid="recent-activity">Recent Activity</div>
}))

describe('Index Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the dashboard with all main sections', async () => {
      render(<Index />)

      // Check main layout components
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()

      // Check welcome section
      expect(screen.getByText('Good morning, John!')).toBeInTheDocument()
      expect(screen.getByText("Here's what's happening at your organization today.")).toBeInTheDocument()

      // Check quick actions and recent activity
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
    })

    it('renders all stats cards with correct data', () => {
      render(<Index />)

      // Check stats cards are rendered
      expect(screen.getByTestId('stats-card-employees')).toBeInTheDocument()
      expect(screen.getByTestId('stats-card-leaves')).toBeInTheDocument()
      expect(screen.getByTestId('stats-card-payroll')).toBeInTheDocument()
      expect(screen.getByTestId('stats-card-performance')).toBeInTheDocument()

      // Check stats card content
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('247')).toBeInTheDocument()
      expect(screen.getByText('Pending Leave Requests')).toBeInTheDocument()
      expect(screen.getByText('18')).toBeInTheDocument()
      expect(screen.getByText("This Month's Payroll")).toBeInTheDocument()
      expect(screen.getByText('$284K')).toBeInTheDocument()
      expect(screen.getByText('Performance Reviews')).toBeInTheDocument()
      expect(screen.getByText('89%')).toBeInTheDocument()
    })

    it('renders all module cards with correct information', () => {
      render(<Index />)

      // Check module cards
      expect(screen.getByTestId('module-card-employees')).toBeInTheDocument()
      expect(screen.getByTestId('module-card-leaves')).toBeInTheDocument()
      expect(screen.getByTestId('module-card-payroll')).toBeInTheDocument()
      expect(screen.getByTestId('module-card-performance')).toBeInTheDocument()
      expect(screen.getByTestId('module-card-onboarding')).toBeInTheDocument()
      expect(screen.getByTestId('module-card-attendance')).toBeInTheDocument()

      // Check module card content
      expect(screen.getByText('Employee Management')).toBeInTheDocument()
      expect(screen.getByText('Leave Management')).toBeInTheDocument()
      expect(screen.getByText('Payroll System')).toBeInTheDocument()
      expect(screen.getByText('Performance Reviews')).toBeInTheDocument()
      expect(screen.getByText('Onboarding')).toBeInTheDocument()
      expect(screen.getByText('Attendance Tracking')).toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('displays module notifications correctly', () => {
      render(<Index />)

      // Check that notifications are displayed
      const notifications = screen.getAllByTestId('notifications')
      expect(notifications).toHaveLength(4) // Employee, Leave, Performance, Onboarding modules have notifications

      // Check specific notification counts
      expect(notifications[0]).toHaveTextContent('3') // Employee Management
      expect(notifications[1]).toHaveTextContent('18') // Leave Management
      expect(notifications[2]).toHaveTextContent('5') // Performance Reviews
      expect(notifications[3]).toHaveTextContent('2') // Onboarding
    })

    it('renders action links for each module', () => {
      render(<Index />)

      // Check that action links are present
      expect(screen.getByTestId('action-0')).toHaveAttribute('href', '#employees')
      expect(screen.getByTestId('action-1')).toHaveAttribute('href', '#employees/new')
    })

    it('displays stats with trend indicators', () => {
      render(<Index />)

      // Check trend indicators
      expect(screen.getByTestId('change-positive')).toBeInTheDocument()
      expect(screen.getByTestId('change-neutral')).toBeInTheDocument()
    })
  })

  describe('Layout and Responsiveness', () => {
    it('has proper grid layout classes for responsive design', () => {
      render(<Index />)

      // The grid containers should have responsive classes
      const statsContainer = screen.getByTestId('stats-card-employees').parentElement
      expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4')
    })

    it('maintains proper spacing and layout structure', () => {
      render(<Index />)

      // Check that the main content area has proper classes
      const mainContent = screen.getByRole('main')
      expect(mainContent).toHaveClass('flex-1', 'overflow-y-auto', 'p-6')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Index />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Good morning, John!')
    })

    it('has descriptive content for screen readers', () => {
      render(<Index />)

      expect(screen.getByText("Here's what's happening at your organization today.")).toBeInTheDocument()
    })

    it('renders icons with proper accessibility', () => {
      render(<Index />)

      const icons = screen.getAllByTestId('icon')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Performance and Loading States', () => {
    it('handles data loading gracefully', async () => {
      render(<Index />)

      // Components should render without data loading states showing
      // since we're mocking successful data fetches
      await waitFor(() => {
        expect(screen.getByText('247')).toBeInTheDocument()
      })
    })

    it('displays all content without loading delays', () => {
      render(<Index />)

      // All major sections should be immediately visible
      expect(screen.getByTestId('sidebar')).toBeInTheDocument()
      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('quick-actions')).toBeInTheDocument()
      expect(screen.getByTestId('recent-activity')).toBeInTheDocument()
    })
  })

  describe('Data Integration', () => {
    it('correctly displays dashboard statistics', () => {
      render(<Index />)

      // Verify that the stats from our mocked hook are displayed
      expect(screen.getByText('247')).toBeInTheDocument() // Total employees
      expect(screen.getByText('18')).toBeInTheDocument() // Pending leave requests
      expect(screen.getByText('$284K')).toBeInTheDocument() // Monthly payroll
      expect(screen.getByText('89%')).toBeInTheDocument() // Performance reviews
    })

    it('shows correct module statistics', () => {
      render(<Index />)

      // Check that module cards show the right stats
      expect(screen.getAllByText('247')).toHaveLength(2) // Total and Active employees
      expect(screen.getByText('12')).toBeInTheDocument() // New employees
      expect(screen.getByText('18')).toBeInTheDocument() // Pending requests
      expect(screen.getByText('5')).toBeInTheDocument() // Approved today
    })
  })

  describe('Theme and Design System', () => {
    it('uses correct design system classes', () => {
      render(<Index />)

      // Check that the page uses the gradient background
      const container = screen.getByText('Good morning, John!').closest('div')
      expect(container?.parentElement?.parentElement).toHaveClass('bg-gradient-dashboard')
    })

    it('applies proper text styling for headings and descriptions', () => {
      render(<Index />)

      const heading = screen.getByText('Good morning, John!')
      expect(heading).toHaveClass('text-3xl', 'font-bold', 'text-foreground')

      const description = screen.getByText("Here's what's happening at your organization today.")
      expect(description).toHaveClass('text-muted-foreground')
    })
  })
})