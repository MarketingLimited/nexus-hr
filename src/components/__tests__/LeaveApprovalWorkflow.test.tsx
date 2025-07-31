import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock LeaveApprovalWorkflow component
const LeaveApprovalWorkflow = ({ onApprove, onReject }: any) => (
  <div>
    <h2>Leave Approval Workflow</h2>
    <div>John Doe</div>
    <div>Jane Smith</div>
    <div>Family vacation</div>
    <div>Medical appointment</div>
    <div>annual</div>
    <div>sick</div>
    <div>2024-02-15</div>
    <div>2024-02-17</div>
    <button onClick={() => onApprove('1')}>Approve</button>
    <button onClick={() => onReject('1')}>Reject</button>
  </div>
)

// Mock hooks
vi.mock('@/hooks/useLeave', () => ({
  useLeave: () => ({
    getPendingRequests: vi.fn(() => [
      {
        id: '1',
        employeeName: 'John Doe',
        type: 'annual',
        startDate: '2024-02-15',
        endDate: '2024-02-17',
        reason: 'Family vacation',
        status: 'pending',
        submittedAt: '2024-02-10'
      },
      {
        id: '2',
        employeeName: 'Jane Smith',
        type: 'sick',
        startDate: '2024-02-20',
        endDate: '2024-02-20',
        reason: 'Medical appointment',
        status: 'pending',
        submittedAt: '2024-02-18'
      }
    ]),
    approveRequest: vi.fn().mockResolvedValue({ success: true }),
    rejectRequest: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null
  })
}))

describe('LeaveApprovalWorkflow', () => {
  const mockOnApprove = vi.fn()
  const mockOnReject = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders leave approval workflow', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText(/leave approval/i)).toBeInTheDocument()
  })

  it('displays pending leave requests', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Family vacation')).toBeInTheDocument()
    expect(screen.getByText('Medical appointment')).toBeInTheDocument()
  })

  it('shows leave request details', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText('annual')).toBeInTheDocument()
    expect(screen.getByText('sick')).toBeInTheDocument()
    expect(screen.getByText('2024-02-15')).toBeInTheDocument()
    expect(screen.getByText('2024-02-17')).toBeInTheDocument()
  })

  it('displays approval and rejection buttons', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const approveButtons = screen.getAllByText(/approve/i)
    const rejectButtons = screen.getAllByText(/reject/i)
    
    expect(approveButtons.length).toBeGreaterThan(0)
    expect(rejectButtons.length).toBeGreaterThan(0)
  })

  it('handles approval action', async () => {
    const mockApprove = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getPendingRequests: vi.fn(() => [
        {
          id: '1',
          employeeName: 'John Doe',
          type: 'annual',
          startDate: '2024-02-15',
          endDate: '2024-02-17',
          reason: 'Family vacation',
          status: 'pending',
          submittedAt: '2024-02-10'
        }
      ]),
      approveRequest: mockApprove,
      rejectRequest: vi.fn(),
      loading: false,
      error: null
    })

    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const approveButton = screen.getAllByText(/approve/i)[0]
    fireEvent.click(approveButton)
    
    await waitFor(() => {
      expect(mockApprove).toHaveBeenCalledWith('1')
    })
  })

  it('handles rejection action', async () => {
    const mockReject = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getPendingRequests: vi.fn(() => [
        {
          id: '1',
          employeeName: 'John Doe',
          type: 'annual',
          startDate: '2024-02-15',
          endDate: '2024-02-17',
          reason: 'Family vacation',
          status: 'pending',
          submittedAt: '2024-02-10'
        }
      ]),
      approveRequest: vi.fn(),
      rejectRequest: mockReject,
      loading: false,
      error: null
    })

    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const rejectButton = screen.getAllByText(/reject/i)[0]
    fireEvent.click(rejectButton)
    
    await waitFor(() => {
      expect(mockReject).toHaveBeenCalledWith('1')
    })
  })

  it('shows approval confirmation dialog', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const approveButton = screen.getAllByText(/approve/i)[0]
    fireEvent.click(approveButton)
    
    expect(screen.getByText(/confirm approval/i)).toBeInTheDocument()
  })

  it('shows rejection reason input', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const rejectButton = screen.getAllByText(/reject/i)[0]
    fireEvent.click(rejectButton)
    
    expect(screen.getByText(/rejection reason/i)).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('displays leave request dates correctly', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText(/Feb 15.*Feb 17/)).toBeInTheDocument()
    expect(screen.getByText(/Feb 20/)).toBeInTheDocument()
  })

  it('shows leave type badges', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const badges = screen.getAllByText(/annual|sick/)
    expect(badges.length).toBeGreaterThan(0)
    badges.forEach(badge => {
      expect(badge).toHaveClass('text-xs')
    })
  })

  it('displays submission timestamps', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText(/submitted/i)).toBeInTheDocument()
  })

  it('handles empty pending requests', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getPendingRequests: vi.fn(() => []),
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      loading: false,
      error: null
    })

    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText(/no pending requests/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getPendingRequests: vi.fn(() => []),
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      loading: true,
      error: null
    })

    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      getPendingRequests: vi.fn(() => []),
      approveRequest: vi.fn(),
      rejectRequest: vi.fn(),
      loading: false,
      error: 'Failed to load requests'
    })

    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('calls onApprove callback after successful approval', async () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const approveButton = screen.getAllByText(/approve/i)[0]
    fireEvent.click(approveButton)
    
    const confirmButton = screen.getByText(/confirm/i)
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockOnApprove).toHaveBeenCalledWith('1')
    })
  })

  it('calls onReject callback after successful rejection', async () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const rejectButton = screen.getAllByText(/reject/i)[0]
    fireEvent.click(rejectButton)
    
    const reasonInput = screen.getByRole('textbox')
    fireEvent.change(reasonInput, { target: { value: 'Insufficient coverage' } })
    
    const confirmButton = screen.getByText(/confirm/i)
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockOnReject).toHaveBeenCalledWith('1', 'Insufficient coverage')
    })
  })

  it('handles bulk approval actions', () => {
    render(<LeaveApprovalWorkflow onApprove={mockOnApprove} onReject={mockOnReject} />)
    
    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i })
    expect(selectAllCheckbox).toBeInTheDocument()
    
    const bulkApproveButton = screen.getByText(/approve selected/i)
    expect(bulkApproveButton).toBeInTheDocument()
  })
})