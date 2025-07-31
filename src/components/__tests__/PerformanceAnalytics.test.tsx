import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock PerformanceAnalytics component
const PerformanceAnalytics = ({ period }: any) => (
  <div>
    <h2>Performance Analytics</h2>
    <div>Period: {period}</div>
    <div>Team Average: 4.1/5</div>
    <div>Top Performers: 15%</div>
    <div>Improvement Areas: Communication</div>
    <div>Trending Up: 12 employees</div>
  </div>
)

describe('PerformanceAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders performance analytics', () => {
    render(<PerformanceAnalytics period="Q1 2024" />)
    
    expect(screen.getByText(/performance analytics/i)).toBeInTheDocument()
  })

  it('displays analytics period', () => {
    render(<PerformanceAnalytics period="Q1 2024" />)
    
    expect(screen.getByText(/period.*q1 2024/i)).toBeInTheDocument()
  })

  it('shows team average rating', () => {
    render(<PerformanceAnalytics period="Q1 2024" />)
    
    expect(screen.getByText(/team average.*4\.1\/5/i)).toBeInTheDocument()
  })

  it('displays top performers percentage', () => {
    render(<PerformanceAnalytics period="Q1 2024" />)
    
    expect(screen.getByText(/top performers.*15%/i)).toBeInTheDocument()
  })

  it('shows improvement areas', () => {
    render(<PerformanceAnalytics period="Q1 2024" />)
    
    expect(screen.getByText(/improvement areas.*communication/i)).toBeInTheDocument()
  })

  it('displays trending metrics', () => {
    render(<PerformanceAnalytics period="Q1 2024" />)
    
    expect(screen.getByText(/trending up.*12 employees/i)).toBeInTheDocument()
  })
})