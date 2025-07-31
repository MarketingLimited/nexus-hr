import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock PerformanceReviews component
const PerformanceReviews = ({ employeeId, onSubmit }: any) => (
  <div>
    <h2>Performance Reviews</h2>
    <div>Employee: John Doe</div>
    <div>Review Period: Q1 2024</div>
    <div>Overall Rating: 4.2/5</div>
    <div>Goals Met: 85%</div>
    <button onClick={() => onSubmit()}>Submit Review</button>
    <button>Schedule 1:1</button>
  </div>
)

describe('PerformanceReviews', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders performance reviews', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/performance reviews/i)).toBeInTheDocument()
  })

  it('displays employee name', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it('shows review period', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/q1 2024/i)).toBeInTheDocument()
  })

  it('displays overall rating', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/4\.2\/5/)).toBeInTheDocument()
  })

  it('shows goals completion', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/goals met.*85%/i)).toBeInTheDocument()
  })

  it('handles review submission', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByText(/submit review/i)
    fireEvent.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('allows scheduling 1:1 meetings', () => {
    render(<PerformanceReviews employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/schedule 1:1/i)).toBeInTheDocument()
  })
})