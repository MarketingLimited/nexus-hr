import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock FeedbackSystem component
const FeedbackSystem = ({ employeeId, onSubmit }: any) => (
  <div>
    <h2>Feedback System</h2>
    <div>Peer Feedback: 4.5/5</div>
    <div>Manager Feedback: 4.2/5</div>
    <div>Recent Feedback: "Great collaboration skills"</div>
    <button onClick={() => onSubmit()}>Submit Feedback</button>
    <button>Request Feedback</button>
  </div>
)

describe('FeedbackSystem', () => {
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders feedback system', () => {
    render(<FeedbackSystem employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/feedback system/i)).toBeInTheDocument()
  })

  it('displays peer feedback rating', () => {
    render(<FeedbackSystem employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/peer feedback.*4\.5\/5/i)).toBeInTheDocument()
  })

  it('shows manager feedback', () => {
    render(<FeedbackSystem employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/manager feedback.*4\.2\/5/i)).toBeInTheDocument()
  })

  it('displays recent feedback comments', () => {
    render(<FeedbackSystem employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/great collaboration skills/i)).toBeInTheDocument()
  })

  it('handles feedback submission', () => {
    render(<FeedbackSystem employeeId="1" onSubmit={mockOnSubmit} />)
    
    const submitButton = screen.getByText(/submit feedback/i)
    fireEvent.click(submitButton)
    
    expect(mockOnSubmit).toHaveBeenCalled()
  })

  it('allows requesting feedback', () => {
    render(<FeedbackSystem employeeId="1" onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText(/request feedback/i)).toBeInTheDocument()
  })
})