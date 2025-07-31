import { render, screen, fireEvent } from '@/test-utils'
import { vi, describe, it, expect } from 'vitest'
import { Switch } from '@/components/ui/switch'

describe('Switch', () => {
  it('renders switch component', () => {
    render(<Switch />)
    
    const switchButton = screen.getByRole('switch')
    expect(switchButton).toBeInTheDocument()
  })

  it('handles checked state', () => {
    render(<Switch checked />)
    
    const switchButton = screen.getByRole('switch')
    expect(switchButton).toHaveAttribute('aria-checked', 'true')
  })

  it('handles unchecked state', () => {
    render(<Switch checked={false} />)
    
    const switchButton = screen.getByRole('switch')
    expect(switchButton).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onCheckedChange when clicked', () => {
    const onCheckedChange = vi.fn()
    
    render(<Switch onCheckedChange={onCheckedChange} />)
    
    const switchButton = screen.getByRole('switch')
    fireEvent.click(switchButton)
    
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('handles disabled state', () => {
    render(<Switch disabled />)
    
    const switchButton = screen.getByRole('switch')
    expect(switchButton).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Switch className="custom-switch" />)
    
    const switchButton = screen.getByRole('switch')
    expect(switchButton).toHaveClass('custom-switch')
  })

  it('has proper accessibility attributes', () => {
    render(<Switch aria-label="Toggle setting" />)
    
    const switchButton = screen.getByRole('switch')
    expect(switchButton).toHaveAttribute('aria-label', 'Toggle setting')
  })

  it('supports controlled state', () => {
    const onCheckedChange = vi.fn()
    const { rerender } = render(
      <Switch checked={false} onCheckedChange={onCheckedChange} />
    )
    
    let switchButton = screen.getByRole('switch')
    expect(switchButton).toHaveAttribute('aria-checked', 'false')
    
    rerender(<Switch checked={true} onCheckedChange={onCheckedChange} />)
    
    switchButton = screen.getByRole('switch')
    expect(switchButton).toHaveAttribute('aria-checked', 'true')
  })
})