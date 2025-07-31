import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { userEvent } from '@testing-library/user-event'
import LeaveManagement from '../LeaveManagement'

// Mock the leave hooks
vi.mock('@/hooks/useLeave', () => ({
  useLeaveStats: () => ({
    data: {
      pendingRequests: 18,
      approvedToday: 5,
      onLeaveToday: 12,
      onLeavePercentage: 4.9,
      avgResponseTime: 2.3
    },
    isLoading: false
  }),
  useLeaveRequests: () => ({
    data: {
      data: [
        {
          id: '1',
          employeeName: 'John Doe',
          leaveType: 'Annual Leave',
          startDate: '2024-01-20',
          endDate: '2024-01-25',
          status: 'pending'
        },
        {
          id: '2',
          employeeName: 'Jane Smith',
          leaveType: 'Sick Leave',
          startDate: '2024-01-18',
          endDate: '2024-01-19',
          status: 'approved'
        }
      ]
    },
    isLoading: false
  }),
  useUpdateLeaveRequest: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}))

// Mock child components
vi.mock('@/components/leave/LeaveRequestForm', () => ({
  LeaveRequestForm: () => <div data-testid="leave-request-form">Leave Request Form</div>
}))

vi.mock('@/components/leave/LeaveApprovalWorkflow', () => ({
  LeaveApprovalWorkflow: () => <div data-testid="leave-approval-workflow">Leave Approval Workflow</div>
}))

vi.mock('@/components/leave/LeaveBalance', () => ({
  LeaveBalance: () => <div data-testid="leave-balance">Leave Balance</div>
}))

vi.mock('@/components/leave/LeaveCalendar', () => ({
  LeaveCalendar: () => <div data-testid="leave-calendar">Leave Calendar</div>
}))

describe('LeaveManagement Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the leave management page with header and main sections', () => {
      render(<LeaveManagement />)

      // Check header
      expect(screen.getByText('Leave Management')).toBeInTheDocument()
      expect(screen.getByText('Manage leave requests and balances')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /request leave/i })).toBeInTheDocument()
    })

    it('displays leave statistics cards', () => {
      render(<LeaveManagement />)

      // Check stats cards
      expect(screen.getByText('Pending Requests')).toBeInTheDocument()
      expect(screen.getByText('18')).toBeInTheDocument()
      expect(screen.getByText('Approved Today')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
      expect(screen.getByText('On Leave Today')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('Avg. Response Time')).toBeInTheDocument()
      expect(screen.getByText('2.3')).toBeInTheDocument()
    })

    it('renders tab navigation correctly', () => {
      render(<LeaveManagement />)

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /requests/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /my balance/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /calendar/i })).toBeInTheDocument()
    })

    it('shows recent leave requests in overview tab', () => {
      render(<LeaveManagement />)

      expect(screen.getByText('Recent Leave Requests')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
      expect(screen.getByText('Annual Leave')).toBeInTheDocument()
      expect(screen.getByText('Sick Leave')).toBeInTheDocument()
    })
  })

  describe('Dialog Functionality', () => {
    it('opens and closes leave request dialog', async () => {
      render(<LeaveManagement />)

      const requestButton = screen.getByRole('button', { name: /request leave/i })
      await user.click(requestButton)

      await waitFor(() => {
        expect(screen.getByText('Submit Leave Request')).toBeInTheDocument()
        expect(screen.getByTestId('leave-request-form')).toBeInTheDocument()
      })
    })

    it('renders dialog with correct title and form', async () => {
      render(<LeaveManagement />)

      const requestButton = screen.getByRole('button', { name: /request leave/i })
      await user.click(requestButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Submit Leave Request')).toBeInTheDocument()
      })
    })
  })

  describe('Tab Navigation', () => {
    it('switches between tabs correctly', async () => {
      render(<LeaveManagement />)

      // Initially overview tab should be active
      expect(screen.getByText('Recent Leave Requests')).toBeInTheDocument()

      // Click on requests tab
      const requestsTab = screen.getByRole('tab', { name: /requests/i })
      await user.click(requestsTab)

      await waitFor(() => {
        expect(screen.getByTestId('leave-approval-workflow')).toBeInTheDocument()
      })

      // Click on balance tab
      const balanceTab = screen.getByRole('tab', { name: /my balance/i })
      await user.click(balanceTab)

      await waitFor(() => {
        expect(screen.getByTestId('leave-balance')).toBeInTheDocument()
      })

      // Click on calendar tab
      const calendarTab = screen.getByRole('tab', { name: /calendar/i })
      await user.click(calendarTab)

      await waitFor(() => {
        expect(screen.getByTestId('leave-calendar')).toBeInTheDocument()
      })
    })

    it('shows correct tab content for each tab', async () => {
      render(<LeaveManagement />)

      // Test each tab content
      const tabs = [
        { name: /requests/i, testId: 'leave-approval-workflow' },
        { name: /my balance/i, testId: 'leave-balance' },
        { name: /calendar/i, testId: 'leave-calendar' }
      ]

      for (const tab of tabs) {
        const tabElement = screen.getByRole('tab', { name: tab.name })
        await user.click(tabElement)

        await waitFor(() => {
          expect(screen.getByTestId(tab.testId)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Leave Request Actions', () => {
    it('displays approve and reject buttons for pending requests', () => {
      render(<LeaveManagement />)

      // John Doe's request should have approve/reject buttons (status: pending)
      const pendingRequest = screen.getByText('John Doe').closest('div')
      expect(pendingRequest).toBeInTheDocument()

      const approveButton = screen.getByRole('button', { name: /approve/i })
      const rejectButton = screen.getByRole('button', { name: /reject/i })

      expect(approveButton).toBeInTheDocument()
      expect(rejectButton).toBeInTheDocument()
    })

    it('handles approve button click', async () => {
      const { useUpdateLeaveRequest } = await import('@/hooks/useLeave')
      const mockMutate = vi.fn()
      vi.mocked(useUpdateLeaveRequest).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        isError: false,
        isIdle: true,
        data: undefined,
        error: null,
        variables: undefined,
        reset: vi.fn(),
        mutateAsync: vi.fn()
      } as any)

      render(<LeaveManagement />)

      const approveButton = screen.getByRole('button', { name: /approve/i })
      await user.click(approveButton)

      expect(mockMutate).toHaveBeenCalledWith({ id: '1', status: 'approved' })
    })

    it('handles reject button click', async () => {
      const { useUpdateLeaveRequest } = await import('@/hooks/useLeave')
      const mockMutate = vi.fn()
      vi.mocked(useUpdateLeaveRequest).mockReturnValue({
        mutate: mockMutate,
        isPending: false,
        isSuccess: false,
        isError: false,
        isIdle: true,
        data: undefined,
        error: null,
        variables: undefined,
        reset: vi.fn(),
        mutateAsync: vi.fn()
      } as any)

      render(<LeaveManagement />)

      const rejectButton = screen.getByRole('button', { name: /reject/i })
      await user.click(rejectButton)

      expect(mockMutate).toHaveBeenCalledWith({ id: '1', status: 'rejected' })
    })

    it('disables buttons when update is pending', () => {
      const { useUpdateLeaveRequest } = require('@/hooks/useLeave')
      vi.mocked(useUpdateLeaveRequest).mockReturnValue({
        mutate: vi.fn(),
        isPending: true
      })

      render(<LeaveManagement />)

      const approveButton = screen.getByRole('button', { name: /approve/i })
      const rejectButton = screen.getByRole('button', { name: /reject/i })

      expect(approveButton).toBeDisabled()
      expect(rejectButton).toBeDisabled()
    })
  })

  describe('Status Badges', () => {
    it('displays correct status badges for different request states', () => {
      render(<LeaveManagement />)

      // Check for different status badges
      const pendingBadge = screen.getByText('pending')
      const approvedBadge = screen.getByText('approved')

      expect(pendingBadge).toBeInTheDocument()
      expect(approvedBadge).toBeInTheDocument()
    })

    it('shows appropriate icons with status badges', () => {
      render(<LeaveManagement />)

      // Status badges should contain icons
      const badges = screen.getAllByText(/pending|approved/)
      badges.forEach(badge => {
        const parent = badge.closest('.badge')
        expect(parent?.querySelector('svg')).toBeInTheDocument()
      })
    })
  })

  describe('Data Display', () => {
    it('displays leave statistics with correct formatting', () => {
      render(<LeaveManagement />)

      // Check stats display
      expect(screen.getByText('18')).toBeInTheDocument() // Pending requests
      expect(screen.getByText('5')).toBeInTheDocument() // Approved today
      expect(screen.getByText('12')).toBeInTheDocument() // On leave today
      expect(screen.getByText('4.9% of workforce')).toBeInTheDocument()
      expect(screen.getByText('2.3')).toBeInTheDocument() // Avg response time
      expect(screen.getByText('Days')).toBeInTheDocument()
    })

    it('formats dates correctly in leave requests', () => {
      render(<LeaveManagement />)

      // Check that dates are formatted properly
      expect(screen.getByText(/1\/20\/2024 - 1\/25\/2024/)).toBeInTheDocument()
      expect(screen.getByText(/1\/18\/2024 - 1\/19\/2024/)).toBeInTheDocument()
    })

    it('shows leave type information correctly', () => {
      render(<LeaveManagement />)

      expect(screen.getByText('Annual Leave • 1/20/2024 - 1/25/2024')).toBeInTheDocument()
      expect(screen.getByText('Sick Leave • 1/18/2024 - 1/19/2024')).toBeInTheDocument()
    })
  })

  describe('Layout and Design', () => {
    it('has proper grid layout for stats cards', () => {
      render(<LeaveManagement />)

      const statsContainer = screen.getByText('Pending Requests').closest('.grid')
      expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-4')
    })

    it('maintains proper spacing throughout the page', () => {
      render(<LeaveManagement />)

      const pageContainer = screen.getByText('Leave Management').closest('div')
      expect(pageContainer).toHaveClass('p-6', 'space-y-6')
    })

    it('uses appropriate icons in section headers', () => {
      render(<LeaveManagement />)

      // Icons should be present in the stats cards and tabs
      const statsSection = screen.getByText('Pending Requests').closest('.card')
      const iconsInStats = statsSection?.querySelectorAll('svg')
      expect(iconsInStats?.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<LeaveManagement />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Leave Management')
    })

    it('provides accessible tab navigation', () => {
      render(<LeaveManagement />)

      const tabList = screen.getByRole('tablist')
      const tabs = screen.getAllByRole('tab')

      expect(tabList).toBeInTheDocument()
      expect(tabs).toHaveLength(4)
    })

    it('includes descriptive button labels', () => {
      render(<LeaveManagement />)

      const requestButton = screen.getByRole('button', { name: /request leave/i })
      const approveButton = screen.getByRole('button', { name: /approve/i })
      const rejectButton = screen.getByRole('button', { name: /reject/i })

      expect(requestButton).toBeInTheDocument()
      expect(approveButton).toBeInTheDocument()
      expect(rejectButton).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('adapts layout for different screen sizes', () => {
      render(<LeaveManagement />)

      const statsGrid = screen.getByText('Pending Requests').closest('.grid')
      expect(statsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-4')

      const tabsList = screen.getByRole('tablist')
      expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-4')
    })
  })

  describe('Integration', () => {
    it('integrates with all child components correctly', async () => {
      render(<LeaveManagement />)

      // Check that all tab content components are available
      const tabs = [
        { name: /requests/i, component: 'leave-approval-workflow' },
        { name: /my balance/i, component: 'leave-balance' },
        { name: /calendar/i, component: 'leave-calendar' }
      ]

      for (const tab of tabs) {
        const tabElement = screen.getByRole('tab', { name: tab.name })
        await user.click(tabElement)

        await waitFor(() => {
          expect(screen.getByTestId(tab.component)).toBeInTheDocument()
        })
      }
    })
  })
})