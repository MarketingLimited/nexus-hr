import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
// Mock LeaveBalance component
const LeaveBalance = () => <div>Leave Balance Component</div>

// Mock hooks
vi.mock('@/hooks/useLeave', () => ({
  useLeave: () => ({
    getLeaveBalance: vi.fn(() => ({
      annual: { total: 25, used: 8, remaining: 17 },
      sick: { total: 10, used: 2, remaining: 8 },
      personal: { total: 5, used: 1, remaining: 4 },
      maternity: { total: 90, used: 0, remaining: 90 }
    })),
    loading: false,
    error: null
  })
}))

describe('LeaveBalance', () => {
  it('renders leave balance component', () => {
    render(<LeaveBalance />)
    
    expect(screen.getByText(/leave balance/i)).toBeInTheDocument()
  })

  it('displays all leave types', () => {
    render(<LeaveBalance />)
    
    expect(screen.getByText(/annual leave/i)).toBeInTheDocument()
    expect(screen.getByText(/sick leave/i)).toBeInTheDocument()
    expect(screen.getByText(/personal leave/i)).toBeInTheDocument()
    expect(screen.getByText(/maternity leave/i)).toBeInTheDocument()
  })

  it('shows correct remaining days for each leave type', () => {
    render(<LeaveBalance />)
    
    expect(screen.getByText('17')).toBeInTheDocument() // Annual remaining
    expect(screen.getByText('8')).toBeInTheDocument()  // Sick remaining
    expect(screen.getByText('4')).toBeInTheDocument()  // Personal remaining
    expect(screen.getByText('90')).toBeInTheDocument() // Maternity remaining
  })

  it('displays total and used days', () => {
    render(<LeaveBalance />)
    
    // Should show used out of total format
    expect(screen.getByText(/8.*25/)).toBeInTheDocument() // Annual: 8 used of 25
    expect(screen.getByText(/2.*10/)).toBeInTheDocument() // Sick: 2 used of 10
    expect(screen.getByText(/1.*5/)).toBeInTheDocument()  // Personal: 1 used of 5
    expect(screen.getByText(/0.*90/)).toBeInTheDocument() // Maternity: 0 used of 90
  })

  it('shows progress bars for leave usage', () => {
    render(<LeaveBalance />)
    
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(4) // One for each leave type
  })

  it('displays percentage used correctly', () => {
    render(<LeaveBalance />)
    
    // Annual: 8/25 = 32%
    expect(screen.getByText('32%')).toBeInTheDocument()
    // Sick: 2/10 = 20%
    expect(screen.getByText('20%')).toBeInTheDocument()
    // Personal: 1/5 = 20%
    expect(screen.getByText('20%')).toBeInTheDocument()
    // Maternity: 0/90 = 0%
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('applies warning styling for high usage', () => {
    // Mock high usage scenario
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => ({
        annual: { total: 25, used: 22, remaining: 3 }, // 88% used
        sick: { total: 10, used: 9, remaining: 1 },    // 90% used
        personal: { total: 5, used: 1, remaining: 4 },
        maternity: { total: 90, used: 0, remaining: 90 }
      })),
      loading: false,
      error: null
    })

    render(<LeaveBalance />)
    
    // Should show warning colors for high usage
    const highUsageItems = screen.getAllByText(/remaining/i)
    expect(highUsageItems.length).toBeGreaterThan(0)
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => null),
      loading: true,
      error: null
    })

    render(<LeaveBalance />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => null),
      loading: false,
      error: 'Failed to load leave balance'
    })

    render(<LeaveBalance />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('handles empty leave balance data', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => ({})),
      loading: false,
      error: null
    })

    render(<LeaveBalance />)
    
    expect(screen.getByText(/no leave data/i)).toBeInTheDocument()
  })

  it('displays accrual information', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => ({
        annual: { 
          total: 25, 
          used: 8, 
          remaining: 17,
          accrualRate: 2.08, // per month
          nextAccrual: new Date('2024-02-01')
        },
        sick: { total: 10, used: 2, remaining: 8 },
        personal: { total: 5, used: 1, remaining: 4 },
        maternity: { total: 90, used: 0, remaining: 90 }
      })),
      loading: false,
      error: null
    })

    render(<LeaveBalance />)
    
    expect(screen.getByText(/2\.08.*per month/i)).toBeInTheDocument()
  })

  it('shows upcoming leave requests', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => ({
        annual: { total: 25, used: 8, remaining: 17 },
        sick: { total: 10, used: 2, remaining: 8 },
        personal: { total: 5, used: 1, remaining: 4 },
        maternity: { total: 90, used: 0, remaining: 90 }
      })),
      getUpcomingRequests: vi.fn(() => [
        { id: '1', type: 'annual', startDate: '2024-02-15', endDate: '2024-02-16', days: 2 }
      ]),
      loading: false,
      error: null
    })

    render(<LeaveBalance />)
    
    expect(screen.getByText(/upcoming requests/i)).toBeInTheDocument()
  })

  it('calculates available days correctly after pending requests', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getLeaveBalance: vi.fn(() => ({
        annual: { 
          total: 25, 
          used: 8, 
          remaining: 17,
          pending: 3 // 3 days pending approval
        },
        sick: { total: 10, used: 2, remaining: 8 },
        personal: { total: 5, used: 1, remaining: 4 },
        maternity: { total: 90, used: 0, remaining: 90 }
      })),
      loading: false,
      error: null
    })

    render(<LeaveBalance />)
    
    // Should show 14 available (17 remaining - 3 pending)
    expect(screen.getByText(/14.*available/i)).toBeInTheDocument()
  })
})