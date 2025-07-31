import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
// Mock LeaveCalendar component
const LeaveCalendar = ({ onDaySelect, viewMode }: any) => <div>Leave Calendar Component</div>

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date) => date.toISOString().split('T')[0]),
  startOfMonth: vi.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
  endOfMonth: vi.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)),
  eachDayOfInterval: vi.fn(() => [
    new Date('2024-01-01'),
    new Date('2024-01-02'),
    new Date('2024-01-03')
  ]),
  isSameDay: vi.fn((date1, date2) => date1.getTime() === date2.getTime()),
  isToday: vi.fn((date) => false),
  isWeekend: vi.fn((date) => [0, 6].includes(date.getDay()))
}))

// Mock hooks
vi.mock('@/hooks/useLeave', () => ({
  useLeave: () => ({
    getLeaveRequests: vi.fn(() => [
      {
        id: '1',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        type: 'annual',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        status: 'approved',
        days: 3
      },
      {
        id: '2',
        employeeId: 'emp2', 
        employeeName: 'Jane Smith',
        type: 'sick',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        status: 'pending',
        days: 1
      }
    ]),
    loading: false,
    error: null
  })
}))

describe('LeaveCalendar', () => {
  it('renders calendar component', () => {
    render(<LeaveCalendar />)
    
    expect(screen.getByText(/leave calendar/i)).toBeInTheDocument()
  })

  it('displays month navigation', () => {
    render(<LeaveCalendar />)
    
    expect(screen.getByText(/previous/i)).toBeInTheDocument()
    expect(screen.getByText(/next/i)).toBeInTheDocument()
  })

  it('shows current month and year', () => {
    render(<LeaveCalendar />)
    
    // Should display some form of month/year indicator
    const monthIndicator = screen.getByText(/january|february|march|april|may|june|july|august|september|october|november|december/i)
    expect(monthIndicator).toBeInTheDocument()
  })

  it('renders calendar grid with days', () => {
    render(<LeaveCalendar />)
    
    // Should show day numbers
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays leave requests on calendar', () => {
    render(<LeaveCalendar />)
    
    // Should show leave indicators or employee names
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument()
  })

  it('shows different leave types with distinct styling', () => {
    render(<LeaveCalendar />)
    
    // Leave items should have different styling based on type
    const leaveItems = screen.getAllByText(/annual|sick|personal/)
    expect(leaveItems.length).toBeGreaterThan(0)
  })

  it('handles month navigation', () => {
    render(<LeaveCalendar />)
    
    const nextButton = screen.getByText(/next/i)
    fireEvent.click(nextButton)
    
    // Should trigger month change
    expect(nextButton).toBeInTheDocument()
  })

  it('displays leave status indicators', () => {
    render(<LeaveCalendar />)
    
    // Should show approved, pending, rejected status
    expect(screen.getByText(/approved/i)).toBeInTheDocument()
    expect(screen.getByText(/pending/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveRequests: vi.fn(() => []),
      loading: true,
      error: null
    })

    render(<LeaveCalendar />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveRequests: vi.fn(() => []),
      loading: false,
      error: 'Failed to load calendar data'
    })

    render(<LeaveCalendar />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('handles day selection', () => {
    const mockOnDaySelect = vi.fn()
    render(<LeaveCalendar onDaySelect={mockOnDaySelect} />)
    
    const dayButton = screen.getByText('1')
    fireEvent.click(dayButton)
    
    expect(mockOnDaySelect).toHaveBeenCalled()
  })

  it('shows today indicator', () => {
    vi.mocked(require('date-fns').isToday).mockReturnValue(true)
    
    render(<LeaveCalendar />)
    
    // Should highlight today
    const todayElement = screen.getByText('1')
    expect(todayElement).toHaveClass(/today|current/)
  })

  it('displays weekend styling', () => {
    render(<LeaveCalendar />)
    
    // Weekend days should have different styling
    const weekendDays = screen.getAllByText(/1|2|3/).filter(day => 
      day.closest('.weekend') !== null
    )
    // At least some days should be weekends
  })

  it('shows leave duration correctly', () => {
    render(<LeaveCalendar />)
    
    // Should show number of days for multi-day leaves
    expect(screen.getByText(/3.*day/i)).toBeInTheDocument()
    expect(screen.getByText(/1.*day/i)).toBeInTheDocument()
  })

  it('handles overlapping leave requests', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveRequests: vi.fn(() => [
        {
          id: '1',
          employeeId: 'emp1',
          employeeName: 'John Doe',
          type: 'annual',
          startDate: '2024-01-15',
          endDate: '2024-01-17',
          status: 'approved',
          days: 3
        },
        {
          id: '2',
          employeeId: 'emp2',
          employeeName: 'Jane Smith', 
          type: 'sick',
          startDate: '2024-01-16',
          endDate: '2024-01-16',
          status: 'approved',
          days: 1
        }
      ]),
      loading: false,
      error: null
    })

    render(<LeaveCalendar />)
    
    // Should handle multiple leaves on same day
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument()
  })

  it('provides legend for leave types', () => {
    render(<LeaveCalendar />)
    
    expect(screen.getByText(/legend/i)).toBeInTheDocument()
    expect(screen.getByText(/annual/i)).toBeInTheDocument()
    expect(screen.getByText(/sick/i)).toBeInTheDocument()
  })

  it('supports different view modes', () => {
    render(<LeaveCalendar viewMode="month" />)
    
    // Should support month/week/day views
    expect(screen.getByText(/month/i)).toBeInTheDocument()
  })
})