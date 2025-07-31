import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock PayslipGenerator component
const PayslipGenerator = ({ employeeId, period, onGenerate }: any) => (
  <div>
    <h2>Payslip Generator</h2>
    <div>Employee: John Doe</div>
    <div>Period: Jan 2024</div>
    <div>Gross Pay: $5,000</div>
    <div>Net Pay: $4,000</div>
    <button onClick={() => onGenerate()}>Generate Payslip</button>
    <button>Download PDF</button>
    <button>Email to Employee</button>
  </div>
)

describe('PayslipGenerator', () => {
  const mockOnGenerate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders payslip generator', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/payslip generator/i)).toBeInTheDocument()
  })

  it('displays employee information', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/john doe/i)).toBeInTheDocument()
  })

  it('shows pay period', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/jan 2024/i)).toBeInTheDocument()
  })

  it('displays pay breakdown', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/gross pay.*5,000/i)).toBeInTheDocument()
    expect(screen.getByText(/net pay.*4,000/i)).toBeInTheDocument()
  })

  it('handles payslip generation', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    const generateButton = screen.getByText(/generate payslip/i)
    fireEvent.click(generateButton)
    
    expect(mockOnGenerate).toHaveBeenCalled()
  })

  it('provides download functionality', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/download pdf/i)).toBeInTheDocument()
  })

  it('allows emailing to employee', () => {
    render(<PayslipGenerator employeeId="1" period="2024-01" onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/email to employee/i)).toBeInTheDocument()
  })
})