import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toggle } from '@/components/ui/toggle'

describe('Toggle', () => {
  it('renders with default styling', () => {
    render(<Toggle data-testid="toggle">Toggle me</Toggle>)
    const toggle = screen.getByTestId('toggle')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveClass('inline-flex', 'items-center', 'justify-center', 'rounded-md', 'text-sm', 'font-medium')
  })

  it('handles pressed state correctly', () => {
    render(<Toggle pressed={true} data-testid="pressed-toggle">Pressed</Toggle>)
    const toggle = screen.getByTestId('pressed-toggle')
    expect(toggle).toHaveAttribute('data-state', 'on')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('handles unpressed state correctly', () => {
    render(<Toggle pressed={false} data-testid="unpressed-toggle">Unpressed</Toggle>)
    const toggle = screen.getByTestId('unpressed-toggle')
    expect(toggle).toHaveAttribute('data-state', 'off')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles state on click', () => {
    const handlePressedChange = vi.fn()
    render(
      <Toggle onPressedChange={handlePressedChange} data-testid="clickable-toggle">
        Click me
      </Toggle>
    )

    const toggle = screen.getByTestId('clickable-toggle')
    fireEvent.click(toggle)

    expect(handlePressedChange).toHaveBeenCalledWith(true)
  })

  it('applies default variant styling', () => {
    render(<Toggle variant="default">Default Toggle</Toggle>)
    const toggle = screen.getByText('Default Toggle')
    expect(toggle).toHaveClass('bg-transparent')
  })

  it('applies outline variant styling', () => {
    render(<Toggle variant="outline">Outline Toggle</Toggle>)
    const toggle = screen.getByText('Outline Toggle')
    expect(toggle).toHaveClass('border', 'border-input', 'bg-transparent')
  })

  it('applies different sizes correctly', () => {
    render(
      <div>
        <Toggle size="default" data-testid="default-size">Default</Toggle>
        <Toggle size="sm" data-testid="small-size">Small</Toggle>
        <Toggle size="lg" data-testid="large-size">Large</Toggle>
      </div>
    )

    expect(screen.getByTestId('default-size')).toHaveClass('h-10', 'px-3')
    expect(screen.getByTestId('small-size')).toHaveClass('h-9', 'px-2.5')
    expect(screen.getByTestId('large-size')).toHaveClass('h-11', 'px-5')
  })

  it('can be disabled', () => {
    const handlePressedChange = vi.fn()
    render(
      <Toggle disabled onPressedChange={handlePressedChange} data-testid="disabled-toggle">
        Disabled
      </Toggle>
    )

    const toggle = screen.getByTestId('disabled-toggle')
    expect(toggle).toBeDisabled()
    expect(toggle).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')

    fireEvent.click(toggle)
    expect(handlePressedChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Toggle className="custom-toggle">Custom</Toggle>)
    const toggle = screen.getByText('Custom')
    expect(toggle).toHaveClass('custom-toggle')
  })

  it('forwards HTML attributes', () => {
    render(<Toggle id="test-toggle" data-testid="toggle">Toggle</Toggle>)
    const toggle = screen.getByTestId('toggle')
    expect(toggle).toHaveAttribute('id', 'test-toggle')
  })

  it('supports controlled state', () => {
    const handlePressedChange = vi.fn()
    const { rerender } = render(
      <Toggle pressed={false} onPressedChange={handlePressedChange}>
        Controlled
      </Toggle>
    )

    const toggle = screen.getByText('Controlled')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    rerender(
      <Toggle pressed={true} onPressedChange={handlePressedChange}>
        Controlled
      </Toggle>
    )

    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('supports uncontrolled state with defaultPressed', () => {
    render(<Toggle defaultPressed={true} data-testid="uncontrolled">Uncontrolled</Toggle>)
    const toggle = screen.getByTestId('uncontrolled')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows pressed state styling', () => {
    render(<Toggle pressed={true} data-testid="pressed">Pressed Toggle</Toggle>)
    const toggle = screen.getByTestId('pressed')
    expect(toggle).toHaveClass('data-[state=on]:bg-accent', 'data-[state=on]:text-accent-foreground')
  })

  it('shows hover state styling', () => {
    render(<Toggle data-testid="hoverable">Hover me</Toggle>)
    const toggle = screen.getByTestId('hoverable')
    expect(toggle).toHaveClass('hover:bg-muted', 'hover:text-muted-foreground')
  })

  it('supports focus states', () => {
    render(<Toggle data-testid="focusable">Focus me</Toggle>)
    const toggle = screen.getByTestId('focusable')
    
    toggle.focus()
    expect(toggle).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-ring')
  })

  it('works as a toggle button', () => {
    const handlePressedChange = vi.fn()
    render(
      <Toggle onPressedChange={handlePressedChange} data-testid="toggle-button">
        Toggle me
      </Toggle>
    )

    const toggle = screen.getByTestId('toggle-button')
    
    // Initial state should be unpressed
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    
    // Click to toggle on
    fireEvent.click(toggle)
    expect(handlePressedChange).toHaveBeenCalledWith(true)
    
    // Simulate state change
    fireEvent.click(toggle)
    expect(handlePressedChange).toHaveBeenCalledWith(true)
  })

  it('renders with icon content', () => {
    render(
      <Toggle data-testid="icon-toggle" aria-label="Bold text">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4 2h4.5c1.5 0 2.5 1 2.5 2.5S10 7 8.5 7H4V2zM4 9h5c1.5 0 2.5 1 2.5 2.5S10.5 14 9 14H4V9z"/>
        </svg>
      </Toggle>
    )

    const toggle = screen.getByTestId('icon-toggle')
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute('aria-label', 'Bold text')
    
    const icon = toggle.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('combines multiple variants and sizes correctly', () => {
    render(
      <Toggle variant="outline" size="lg" data-testid="combined">
        Large Outline
      </Toggle>
    )

    const toggle = screen.getByTestId('combined')
    expect(toggle).toHaveClass('border', 'border-input', 'h-11', 'px-5')
  })

  describe('Toggle accessibility', () => {
    it('has correct role and attributes', () => {
      render(<Toggle>Accessible Toggle</Toggle>)
      const toggle = screen.getByRole('button')
      expect(toggle).toHaveAttribute('type', 'button')
      expect(toggle).toHaveAttribute('aria-pressed')
    })

    it('supports custom aria-label', () => {
      render(<Toggle aria-label="Toggle bold formatting">B</Toggle>)
      const toggle = screen.getByRole('button', { name: 'Toggle bold formatting' })
      expect(toggle).toBeInTheDocument()
    })

    it('maintains accessibility during state changes', () => {
      const handlePressedChange = vi.fn()
      render(
        <Toggle onPressedChange={handlePressedChange} aria-label="Toggle feature">
          Toggle
        </Toggle>
      )

      const toggle = screen.getByRole('button', { name: 'Toggle feature' })
      expect(toggle).toHaveAttribute('aria-pressed', 'false')

      fireEvent.click(toggle)
      
      // The component would update aria-pressed based on the new state
      expect(handlePressedChange).toHaveBeenCalledWith(true)
    })
  })
})