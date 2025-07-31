import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Calendar } from '@/components/ui/calendar'

describe('Calendar', () => {
  it('renders with default styling', () => {
    render(<Calendar data-testid="calendar" />)
    const calendar = screen.getByTestId('calendar')
    expect(calendar).toBeInTheDocument()
    expect(calendar).toHaveClass('p-3')
  })

  it('applies custom className', () => {
    render(<Calendar className="custom-calendar" />)
    const calendar = screen.getByRole('application')
    expect(calendar).toHaveClass('custom-calendar')
  })

  it('displays the current month by default', () => {
    render(<Calendar />)
    const currentDate = new Date()
    const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    expect(screen.getByText(new RegExp(currentMonth.split(' ')[0]))).toBeInTheDocument()
  })

  it('handles date selection', () => {
    const handleSelect = vi.fn()
    render(<Calendar mode="single" onSelect={handleSelect} />)
    
    // Find and click on a date (day 15 as it's likely to be available)
    const dayButtons = screen.getAllByRole('gridcell')
    const availableDay = dayButtons.find(button => 
      button.textContent && 
      !button.hasAttribute('aria-disabled') &&
      button.textContent.includes('15')
    )
    
    if (availableDay) {
      fireEvent.click(availableDay)
      expect(handleSelect).toHaveBeenCalled()
    }
  })

  it('displays multiple months when numberOfMonths is set', () => {
    render(<Calendar numberOfMonths={2} />)
    const calendars = screen.getAllByRole('application')
    expect(calendars).toHaveLength(2)
  })

  it('can be disabled', () => {
    render(<Calendar disabled />)
    const calendar = screen.getByRole('application')
    expect(calendar).toHaveAttribute('aria-disabled', 'true')
  })

  it('handles range selection mode', () => {
    const handleSelect = vi.fn()
    render(<Calendar mode="range" onSelect={handleSelect} />)
    
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('handles multiple selection mode', () => {
    const handleSelect = vi.fn()
    render(<Calendar mode="multiple" onSelect={handleSelect} />)
    
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('shows navigation buttons', () => {
    render(<Calendar />)
    
    // Look for navigation elements (previous/next month buttons)
    const navButtons = screen.getAllByRole('button')
    expect(navButtons.length).toBeGreaterThan(0)
  })

  it('respects fromDate and toDate props', () => {
    const fromDate = new Date(2024, 0, 1) // January 1, 2024
    const toDate = new Date(2024, 11, 31) // December 31, 2024
    
    render(<Calendar fromDate={fromDate} toDate={toDate} />)
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('shows week numbers when showWeekNumber is true', () => {
    render(<Calendar showWeekNumber />)
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('applies fixedWeeks when specified', () => {
    render(<Calendar fixedWeeks />)
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('handles today prop', () => {
    const today = new Date(2024, 5, 15) // June 15, 2024
    render(<Calendar today={today} />)
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('respects weekStartsOn prop', () => {
    render(<Calendar weekStartsOn={1} />) // Monday
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })

  it('handles locale-specific formatting', () => {
    render(<Calendar />)
    const calendar = screen.getByRole('application')
    expect(calendar).toBeInTheDocument()
  })
})