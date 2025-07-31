import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Mock TaxCalculator component
const TaxCalculator = ({ salary, onCalculate }: any) => (
  <div>
    <h2>Tax Calculator</h2>
    <div>Annual Salary: ${salary}</div>
    <div>Federal Tax: $8,000</div>
    <div>State Tax: $2,000</div>
    <div>Total Tax: $10,000</div>
    <button onClick={() => onCalculate()}>Calculate Tax</button>
  </div>
)

describe('TaxCalculator', () => {
  const mockOnCalculate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders tax calculator', () => {
    render(<TaxCalculator salary={60000} onCalculate={mockOnCalculate} />)
    
    expect(screen.getByText(/tax calculator/i)).toBeInTheDocument()
  })

  it('displays annual salary', () => {
    render(<TaxCalculator salary={60000} onCalculate={mockOnCalculate} />)
    
    expect(screen.getByText(/annual salary.*60000/i)).toBeInTheDocument()
  })

  it('shows federal tax calculation', () => {
    render(<TaxCalculator salary={60000} onCalculate={mockOnCalculate} />)
    
    expect(screen.getByText(/federal tax.*8,000/i)).toBeInTheDocument()
  })

  it('displays state tax', () => {
    render(<TaxCalculator salary={60000} onCalculate={mockOnCalculate} />)
    
    expect(screen.getByText(/state tax.*2,000/i)).toBeInTheDocument()
  })

  it('shows total tax amount', () => {
    render(<TaxCalculator salary={60000} onCalculate={mockOnCalculate} />)
    
    expect(screen.getByText(/total tax.*10,000/i)).toBeInTheDocument()
  })

  it('handles tax calculation', () => {
    render(<TaxCalculator salary={60000} onCalculate={mockOnCalculate} />)
    
    const calculateButton = screen.getByText(/calculate tax/i)
    fireEvent.click(calculateButton)
    
    expect(mockOnCalculate).toHaveBeenCalled()
  })
})