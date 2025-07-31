import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// Mock LeaveRequestForm component
const LeaveRequestForm = ({ onSuccess, onCancel }: any) => <div>Leave Request Form</div>

// Mock react-hook-form
vi.mock('react-hook-form', () => ({
  useForm: () => ({
    register: vi.fn(() => ({})),
    handleSubmit: vi.fn((fn) => (e) => {
      e.preventDefault()
      return fn({
        type: 'annual',
        startDate: '2024-02-15',
        endDate: '2024-02-17',
        reason: 'Family vacation',
        halfDay: false
      })
    }),
    formState: { errors: {}, isSubmitting: false },
    watch: vi.fn(() => 'annual'),
    setValue: vi.fn(),
    reset: vi.fn()
  })
}))

// Mock hooks
vi.mock('@/hooks/useLeave', () => ({
  useLeave: () => ({
    submitLeaveRequest: vi.fn().mockResolvedValue({ success: true }),
    getLeaveBalance: vi.fn(() => ({
      annual: { remaining: 15 },
      sick: { remaining: 8 },
      personal: { remaining: 3 }
    })),
    loading: false,
    error: null
  })
}))

describe('LeaveRequestForm', () => {
  const mockOnSuccess = vi.fn()
  const mockOnCancel = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders leave request form', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/leave request/i)).toBeInTheDocument()
  })

  it('displays all leave type options', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/annual leave/i)).toBeInTheDocument()
    expect(screen.getByText(/sick leave/i)).toBeInTheDocument()
    expect(screen.getByText(/personal leave/i)).toBeInTheDocument()
    expect(screen.getByText(/maternity leave/i)).toBeInTheDocument()
  })

  it('shows date range picker', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument()
  })

  it('includes reason text area', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const reasonField = screen.getByLabelText(/reason/i)
    expect(reasonField).toBeInTheDocument()
    expect(reasonField.tagName).toBe('TEXTAREA')
  })

  it('has half day option', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByLabelText(/half day/i)).toBeInTheDocument()
  })

  it('displays remaining balance for selected leave type', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/15.*remaining/i)).toBeInTheDocument()
  })

  it('calculates number of days selected', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Mock date selection that results in 3 days
    expect(screen.getByText(/3.*day/i)).toBeInTheDocument()
  })

  it('validates form fields', async () => {
    // Mock form with errors
    vi.mocked(require('react-hook-form').useForm).mockReturnValue({
      register: vi.fn(() => ({})),
      handleSubmit: vi.fn((fn) => (e) => {
        e.preventDefault()
        return fn({})
      }),
      formState: { 
        errors: {
          type: { message: 'Leave type is required' },
          startDate: { message: 'Start date is required' },
          reason: { message: 'Reason is required' }
        }, 
        isSubmitting: false 
      },
      watch: vi.fn(() => ''),
      setValue: vi.fn(),
      reset: vi.fn()
    })

    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/leave type is required/i)).toBeInTheDocument()
    expect(screen.getByText(/start date is required/i)).toBeInTheDocument()
    expect(screen.getByText(/reason is required/i)).toBeInTheDocument()
  })

  it('prevents submission when insufficient balance', () => {
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      submitLeaveRequest: vi.fn(),
      getLeaveBalance: vi.fn(() => ({
        annual: { remaining: 1 }, // Only 1 day remaining
        sick: { remaining: 8 },
        personal: { remaining: 3 }
      })),
      loading: false,
      error: null
    })

    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/insufficient balance/i)).toBeInTheDocument()
  })

  it('handles form submission', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      submitLeaveRequest: mockSubmit,
      getLeaveBalance: vi.fn(() => ({
        annual: { remaining: 15 },
        sick: { remaining: 8 },
        personal: { remaining: 3 }
      })),
      loading: false,
      error: null
    })

    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByText(/submit request/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        type: 'annual',
        startDate: '2024-02-15',
        endDate: '2024-02-17',
        reason: 'Family vacation',
        halfDay: false
      })
    })
  })

  it('calls onSuccess callback after successful submission', async () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByText(/submit request/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('handles cancel action', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByText(/cancel/i)
    fireEvent.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('shows loading state during submission', () => {
    vi.mocked(require('react-hook-form').useForm).mockReturnValue({
      register: vi.fn(() => ({})),
      handleSubmit: vi.fn((fn) => (e) => {
        e.preventDefault()
        return fn({})
      }),
      formState: { errors: {}, isSubmitting: true },
      watch: vi.fn(() => 'annual'),
      setValue: vi.fn(),
      reset: vi.fn()
    })

    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/submitting/i)).toBeInTheDocument()
  })

  it('handles submission errors', async () => {
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'))
    vi.mocked(require('@/hooks/useLeave').useLeave).mockReturnValue({
      submitLeaveRequest: mockSubmit,
      getLeaveBalance: vi.fn(() => ({
        annual: { remaining: 15 },
        sick: { remaining: 8 },
        personal: { remaining: 3 }
      })),
      loading: false,
      error: null
    })

    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByText(/submit request/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to submit/i)).toBeInTheDocument()
    })
  })

  it('excludes weekends from day calculation', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    // Should show business days only
    expect(screen.getByText(/business day/i)).toBeInTheDocument()
  })

  it('handles half day calculations', () => {
    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    const halfDayCheckbox = screen.getByLabelText(/half day/i)
    fireEvent.click(halfDayCheckbox)
    
    // Should show 0.5 days instead of full days
    expect(screen.getByText(/0\.5.*day/i)).toBeInTheDocument()
  })

  it('provides emergency contact option for sick leave', () => {
    vi.mocked(require('react-hook-form').useForm).mockReturnValue({
      register: vi.fn(() => ({})),
      handleSubmit: vi.fn((fn) => fn),
      formState: { errors: {}, isSubmitting: false },
      watch: vi.fn(() => 'sick'), // Sick leave selected
      setValue: vi.fn(),
      reset: vi.fn()
    })

    render(<LeaveRequestForm onSuccess={mockOnSuccess} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/emergency contact/i)).toBeInTheDocument()
  })
})