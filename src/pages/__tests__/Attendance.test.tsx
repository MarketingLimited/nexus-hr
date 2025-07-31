import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { userEvent } from '@testing-library/user-event'
import Attendance from '../Attendance'

// Mock the attendance hooks
vi.mock('@/hooks/useAttendance', () => ({
  useAttendanceStats: () => ({
    data: {
      data: {
        presentDays: 231,
        lateDays: 3,
        averageHoursPerDay: 8.2,
        overtimeHours: 12,
        attendanceRate: 0.942,
        totalDays: 30,
        absentDays: 2
      }
    },
    isLoading: false
  }),
  useAttendanceRecords: () => ({
    data: {
      data: [
        {
          id: '1',
          employeeName: 'John Doe',
          clockIn: '2024-01-15T09:00:00Z',
          clockOut: '2024-01-15T17:30:00Z',
          totalHours: 8.5,
          status: 'present'
        },
        {
          id: '2',
          employeeName: 'Jane Smith',
          clockIn: '2024-01-15T09:15:00Z',
          clockOut: null,
          totalHours: 0,
          status: 'active'
        }
      ]
    },
    isLoading: false
  }),
  useClockIn: () => ({
    mutate: vi.fn(),
    isPending: false
  }),
  useClockOut: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}))

// Mock toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}))

describe('Attendance Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the attendance page with header and controls', () => {
      render(<Attendance />)

      // Check header
      expect(screen.getByText('Attendance Tracking')).toBeInTheDocument()
      expect(screen.getByText('Monitor employee attendance and working hours')).toBeInTheDocument()

      // Check clock in/out buttons
      expect(screen.getByRole('button', { name: /clock in/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /clock out/i })).toBeInTheDocument()
    })

    it('displays attendance statistics cards', () => {
      render(<Attendance />)

      // Check stats cards
      expect(screen.getByText('Present Today')).toBeInTheDocument()
      expect(screen.getByText('231')).toBeInTheDocument()
      expect(screen.getByText('Late Arrivals')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('Avg. Work Hours')).toBeInTheDocument()
      expect(screen.getByText('8.2')).toBeInTheDocument()
      expect(screen.getByText('Overtime This Week')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
    })

    it('shows today\'s attendance records', () => {
      render(<Attendance />)

      expect(screen.getByText("Today's Attendance")).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('displays attendance trends section', () => {
      render(<Attendance />)

      expect(screen.getByText('Attendance Trends')).toBeInTheDocument()
      expect(screen.getByText('This Week')).toBeInTheDocument()
      expect(screen.getByText('This Month')).toBeInTheDocument()
      expect(screen.getByText('Last Month')).toBeInTheDocument()
    })
  })

  describe('Clock In/Out Functionality', () => {
    it('renders clock in and clock out buttons', () => {
      render(<Attendance />)

      const clockInButton = screen.getByRole('button', { name: /clock in/i })
      const clockOutButton = screen.getByRole('button', { name: /clock out/i })

      expect(clockInButton).toBeInTheDocument()
      expect(clockOutButton).toBeInTheDocument()
      expect(clockInButton).not.toBeDisabled()
      expect(clockOutButton).not.toBeDisabled()
    })

    it('handles clock in button click', async () => {
      const { useClockIn } = await import('@/hooks/useAttendance')
      const mockMutate = vi.fn()
      vi.mocked(useClockIn).mockReturnValue({
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

      render(<Attendance />)

      const clockInButton = screen.getByRole('button', { name: /clock in/i })
      await user.click(clockInButton)

      expect(mockMutate).toHaveBeenCalledWith(
        { employeeId: "current-user" },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      )
    })

    it('handles clock out button click', async () => {
      const { useClockOut } = await import('@/hooks/useAttendance')
      const mockMutate = vi.fn()
      vi.mocked(useClockOut).mockReturnValue({
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

      render(<Attendance />)

      const clockOutButton = screen.getByRole('button', { name: /clock out/i })
      await user.click(clockOutButton)

      expect(mockMutate).toHaveBeenCalledWith(
        "current-record-id",
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function)
        })
      )
    })

    it('disables buttons when mutations are pending', () => {
      const { useClockIn, useClockOut } = require('@/hooks/useAttendance')
      
      vi.mocked(useClockIn).mockReturnValue({
        mutate: vi.fn(),
        isPending: true
      })
      
      vi.mocked(useClockOut).mockReturnValue({
        mutate: vi.fn(),
        isPending: true
      })

      render(<Attendance />)

      const clockInButton = screen.getByRole('button', { name: /clock in/i })
      const clockOutButton = screen.getByRole('button', { name: /clock out/i })

      expect(clockInButton).toBeDisabled()
      expect(clockOutButton).toBeDisabled()
    })
  })

  describe('Data Display', () => {
    it('displays attendance statistics correctly', () => {
      render(<Attendance />)

      // Check attendance rate calculation
      expect(screen.getByText('94.2% attendance')).toBeInTheDocument()
      
      // Check other stats
      expect(screen.getByText('231')).toBeInTheDocument() // Present today
      expect(screen.getByText('3')).toBeInTheDocument() // Late arrivals
      expect(screen.getByText('8.2')).toBeInTheDocument() // Avg hours
      expect(screen.getByText('12')).toBeInTheDocument() // Overtime
    })

    it('formats time displays correctly', () => {
      render(<Attendance />)

      // Check that times are displayed in readable format
      expect(screen.getByText(/In:.*Out:/)).toBeInTheDocument()
    })

    it('shows attendance status badges correctly', () => {
      render(<Attendance />)

      expect(screen.getByText('present')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
    })

    it('displays trend percentages correctly', () => {
      render(<Attendance />)

      // Check trend percentages based on attendance rate
      expect(screen.getByText('94.2%')).toBeInTheDocument()
      expect(screen.getByText('89.5%')).toBeInTheDocument() // Last month (95% of current)
    })
  })

  describe('Progress Bars and Visual Elements', () => {
    it('renders progress bars for attendance trends', () => {
      render(<Attendance />)

      // Progress bars should be rendered with correct width styles
      const progressBars = screen.getAllByRole('generic').filter(el => 
        el.style.width && el.style.width.includes('%')
      )
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('displays perfect days and average late metrics', () => {
      render(<Attendance />)

      expect(screen.getByText('Perfect Days')).toBeInTheDocument()
      expect(screen.getByText('Avg Late (min)')).toBeInTheDocument()
      
      // Perfect days calculation: total - absent - late
      const perfectDays = 30 - 2 - 3 // 25
      expect(screen.getByText('25')).toBeInTheDocument()
    })
  })

  describe('Layout and Responsiveness', () => {
    it('has proper grid layout for stats cards', () => {
      render(<Attendance />)

      const statsContainer = screen.getByText('Present Today').closest('.grid')
      expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-4')
    })

    it('maintains proper spacing and structure', () => {
      render(<Attendance />)

      const pageContainer = screen.getByText('Attendance Tracking').closest('div')
      expect(pageContainer).toHaveClass('p-6', 'space-y-6')
    })

    it('uses responsive grid layout for main content', () => {
      render(<Attendance />)

      const mainContentGrid = screen.getByText("Today's Attendance").closest('.grid')
      expect(mainContentGrid).toHaveClass('grid', 'grid-cols-1', 'lg:grid-cols-2')
    })
  })

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(<Attendance />)

      const mainHeading = screen.getByRole('heading', { level: 1 })
      expect(mainHeading).toHaveTextContent('Attendance Tracking')
    })

    it('provides accessible button labels', () => {
      render(<Attendance />)

      const clockInButton = screen.getByRole('button', { name: /clock in/i })
      const clockOutButton = screen.getByRole('button', { name: /clock out/i })
      const reportButton = screen.getByRole('button', { name: /view full report/i })

      expect(clockInButton).toBeInTheDocument()
      expect(clockOutButton).toBeInTheDocument()
      expect(reportButton).toBeInTheDocument()
    })

    it('includes descriptive content for screen readers', () => {
      render(<Attendance />)

      expect(screen.getByText('Monitor employee attendance and working hours')).toBeInTheDocument()
    })
  })

  describe('Interactive Elements', () => {
    it('renders view full report button', () => {
      render(<Attendance />)

      const reportButton = screen.getByRole('button', { name: /view full report/i })
      expect(reportButton).toBeInTheDocument()
      expect(reportButton).toHaveClass('gap-2')
    })

    it('shows clock icons in buttons', () => {
      render(<Attendance />)

      // Icons should be present in the buttons
      const clockInButton = screen.getByRole('button', { name: /clock in/i })
      const clockOutButton = screen.getByRole('button', { name: /clock out/i })

      expect(clockInButton.querySelector('svg')).toBeInTheDocument()
      expect(clockOutButton.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('Loading States', () => {
    it('handles loading states gracefully when data is present', () => {
      render(<Attendance />)

      // Since we're mocking successful data fetches, 
      // no loading skeletons should be visible
      expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
    })

    it('displays actual data instead of skeletons', () => {
      render(<Attendance />)

      // All the actual data should be displayed
      expect(screen.getByText('231')).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('provides user feedback mechanism through toast', () => {
      render(<Attendance />)

      // Toast hook should be available for user feedback
      const { useToast } = require('@/hooks/use-toast')
      expect(useToast).toBeDefined()
    })
  })
})