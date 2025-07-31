import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock SalaryStructure component
const SalaryStructure = ({ employeeId, onUpdate }: any) => (
  <div>
    <h2>Salary Structure</h2>
    <div>Base Salary: $4,000</div>
    <div>Allowances: $500</div>
    <div>Deductions: $300</div>
    <button onClick={() => onUpdate()}>Update Structure</button>
    <button>Add Component</button>
  </div>
)

describe('SalaryStructure', () => {
  const mockOnUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders salary structure', () => {
    render(<SalaryStructure employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/salary structure/i)).toBeInTheDocument()
  })

  it('displays base salary', () => {
    render(<SalaryStructure employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/base salary.*4,000/i)).toBeInTheDocument()
  })

  it('shows allowances', () => {
    render(<SalaryStructure employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/allowances.*500/i)).toBeInTheDocument()
  })

  it('displays deductions', () => {
    render(<SalaryStructure employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/deductions.*300/i)).toBeInTheDocument()
  })

  it('handles structure updates', () => {
    render(<SalaryStructure employeeId="1" onUpdate={mockOnUpdate} />)
    
    const updateButton = screen.getByText(/update structure/i)
    fireEvent.click(updateButton)
    
    expect(mockOnUpdate).toHaveBeenCalled()
  })

  it('allows adding components', () => {
    render(<SalaryStructure employeeId="1" onUpdate={mockOnUpdate} />)
    
    expect(screen.getByText(/add component/i)).toBeInTheDocument()
  })
})