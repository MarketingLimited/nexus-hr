import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AttendanceTracker from '@/components/attendance/AttendanceTracker'

// Mock hooks
vi.mock('@/hooks/useAttendance', () => ({
  useAttendance: () => ({
    clockIn: vi.fn(),
    clockOut: vi.fn(),
    getCurrentSession: vi.fn(() => null),
    getTodayAttendance: vi.fn(() => ({
      clockInTime: null,
      clockOutTime: null,
      totalHours: 0,
      status: 'not_clocked_in'
    })),
    loading: false,
    error: null
  })
}))

describe('AttendanceTracker', () => {
  it('renders the attendance tracker component', () => {
    render(<AttendanceTracker />)
    
    expect(screen.getByText(/attendance tracker/i)).toBeInTheDocument()
  })

  it('shows clock in button when user is not clocked in', () => {
    render(<AttendanceTracker />)
    
    expect(screen.getByText(/clock in/i)).toBeInTheDocument()
  })

  it('displays current time', () => {
    render(<AttendanceTracker />)
    
    // Should display some time format
    const timeDisplay = screen.getByText(/\d{1,2}:\d{2}/)
    expect(timeDisplay).toBeInTheDocument()
  })

  it('shows status as not clocked in initially', () => {
    render(<AttendanceTracker />)
    
    expect(screen.getByText(/not clocked in/i)).toBeInTheDocument()
  })

  it('handles clock in action', () => {
    const mockClockIn = vi.fn()
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: mockClockIn,
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => null),
      getTodayAttendance: vi.fn(() => ({
        clockInTime: null,
        clockOutTime: null,
        totalHours: 0,
        status: 'not_clocked_in'
      })),
      loading: false,
      error: null
    })

    render(<AttendanceTracker />)
    
    const clockInButton = screen.getByText(/clock in/i)
    fireEvent.click(clockInButton)
    
    expect(mockClockIn).toHaveBeenCalled()
  })

  it('shows clock out button when user is clocked in', () => {
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => ({
        id: '1',
        clockInTime: new Date(),
        clockOutTime: null
      })),
      getTodayAttendance: vi.fn(() => ({
        clockInTime: new Date(),
        clockOutTime: null,
        totalHours: 0,
        status: 'clocked_in'
      })),
      loading: false,
      error: null
    })

    render(<AttendanceTracker />)
    
    expect(screen.getByText(/clock out/i)).toBeInTheDocument()
  })

  it('displays clock in time when available', () => {
    const clockInTime = new Date('2024-01-01T09:00:00')
    
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => ({
        id: '1',
        clockInTime,
        clockOutTime: null
      })),
      getTodayAttendance: vi.fn(() => ({
        clockInTime,
        clockOutTime: null,
        totalHours: 0,
        status: 'clocked_in'
      })),
      loading: false,
      error: null
    })

    render(<AttendanceTracker />)
    
    expect(screen.getByText(/9:00/)).toBeInTheDocument()
  })

  it('shows total hours worked', () => {
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => null),
      getTodayAttendance: vi.fn(() => ({
        clockInTime: new Date('2024-01-01T09:00:00'),
        clockOutTime: new Date('2024-01-01T17:00:00'),
        totalHours: 8,
        status: 'completed'
      })),
      loading: false,
      error: null
    })

    render(<AttendanceTracker />)
    
    expect(screen.getByText(/8.*hours/i)).toBeInTheDocument()
  })

  it('displays loading state', () => {
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => null),
      getTodayAttendance: vi.fn(() => null),
      loading: true,
      error: null
    })

    render(<AttendanceTracker />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => null),
      getTodayAttendance: vi.fn(() => null),
      loading: false,
      error: 'Failed to load attendance data'
    })

    render(<AttendanceTracker />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('shows break time information', () => {
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      getCurrentSession: vi.fn(() => ({
        id: '1',
        clockInTime: new Date(),
        clockOutTime: null,
        breaks: [
          { startTime: new Date(), endTime: new Date(), duration: 30 }
        ]
      })),
      getTodayAttendance: vi.fn(() => ({
        clockInTime: new Date(),
        clockOutTime: null,
        totalHours: 0,
        status: 'clocked_in',
        totalBreakTime: 30
      })),
      loading: false,
      error: null
    })

    render(<AttendanceTracker />)
    
    expect(screen.getByText(/break/i)).toBeInTheDocument()
  })

  it('handles break start and end actions', () => {
    const mockStartBreak = vi.fn()
    const mockEndBreak = vi.fn()
    
    vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
      clockIn: vi.fn(),
      clockOut: vi.fn(),
      startBreak: mockStartBreak,
      endBreak: mockEndBreak,
      getCurrentSession: vi.fn(() => ({
        id: '1',
        clockInTime: new Date(),
        clockOutTime: null,
        onBreak: false
      })),
      getTodayAttendance: vi.fn(() => ({
        clockInTime: new Date(),
        clockOutTime: null,
        totalHours: 0,
        status: 'clocked_in'
      })),
      loading: false,
      error: null
    })

    render(<AttendanceTracker />)
    
    const startBreakButton = screen.getByText(/start break/i)
    fireEvent.click(startBreakButton)
    
    expect(mockStartBreak).toHaveBeenCalled()
  })

  it('displays different status indicators', () => {
    const statuses = ['clocked_in', 'on_break', 'completed', 'not_clocked_in']
    
    statuses.forEach(status => {
      vi.mocked(require('@/hooks/useAttendance').useAttendance).mockReturnValue({
        clockIn: vi.fn(),
        clockOut: vi.fn(),
        getCurrentSession: vi.fn(() => null),
        getTodayAttendance: vi.fn(() => ({
          clockInTime: status !== 'not_clocked_in' ? new Date() : null,
          clockOutTime: status === 'completed' ? new Date() : null,
          totalHours: status === 'completed' ? 8 : 0,
          status
        })),
        loading: false,
        error: null
      })

      const { unmount } = render(<AttendanceTracker />)
      
      // Should display appropriate status
      if (status !== 'not_clocked_in') {
        expect(screen.getByText(new RegExp(status.replace('_', ' '), 'i'))).toBeInTheDocument()
      }
      
      unmount()
    })
  })
})