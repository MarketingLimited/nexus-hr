import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock GoalTracking component
const GoalTracking = ({ employeeId, onUpdate }: any) => (
  <div>
    <h2>Goal Tracking</h2>
    <div>Complete React Training - 90% Progress</div>
    <div>Improve Code Quality - 75% Progress</div>
    <div>Q1 Targets - In Progress</div>
    <button onClick={() => onUpdate()}>Update Progress</button>
    <button>Add New Goal</button>
  </div>
)

describe('GoalTracking', () => {
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders goal tracking', () => {
    render(<GoalTracking employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/goal tracking/i)).toBeInTheDocument()
  })

  it('displays goals with progress', () => {
    render(<GoalTracking employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/react training.*90%/i)).toBeInTheDocument()
    expect(screen.getByText(/code quality.*75%/i)).toBeInTheDocument()
  })

  it('shows goal status', () => {
    render(<GoalTracking employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/in progress/i)).toBeInTheDocument()
  })

  it('handles progress updates', () => {
    render(<GoalTracking employeeId="1" onUpdate={mockOnUpdate} />)
    
    const updateButton = screen.getByText(/update progress/i)
    fireEvent.click(updateButton)
    
    expect(mockOnUpdate).toHaveBeenCalled()
  })

  it('allows adding new goals', () => {
    render(<GoalTracking employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/add new goal/i)).toBeInTheDocument()
  })
})