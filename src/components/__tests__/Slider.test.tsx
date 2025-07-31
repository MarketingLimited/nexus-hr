import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Slider } from '@/components/ui/slider'

describe('Slider', () => {
  it('renders with default styling', () => {
    render(<Slider data-testid="slider" defaultValue={[50]} />)
    const slider = screen.getByTestId('slider')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveClass('relative', 'flex', 'w-full', 'touch-none', 'select-none', 'items-center')
  })

  it('handles value changes', () => {
    const handleValueChange = vi.fn()
    render(<Slider defaultValue={[25]} onValueChange={handleValueChange} />)
    
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })

  it('supports multiple values', () => {
    render(<Slider defaultValue={[25, 75]} data-testid="range-slider" />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(2)
  })

  it('applies custom className', () => {
    render(<Slider className="custom-slider" defaultValue={[50]} />)
    const slider = screen.getByRole('slider').closest('[class*="custom-slider"]')
    expect(slider).toHaveClass('custom-slider')
  })

  it('can be disabled', () => {
    render(<Slider disabled defaultValue={[50]} />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeDisabled()
  })

  it('respects min and max values', () => {
    render(<Slider min={0} max={100} step={10} defaultValue={[50]} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
  })

  it('supports different orientations', () => {
    render(<Slider orientation="vertical" defaultValue={[50]} data-testid="vertical-slider" />)
    const slider = screen.getByTestId('vertical-slider')
    expect(slider).toBeInTheDocument()
  })
})