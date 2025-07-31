import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { createUser } from '@/test-utils/user-interactions'
import { Checkbox } from '../ui/checkbox'

describe('Checkbox Component', () => {
  describe('Rendering', () => {
    it('renders checkbox with default state', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox).not.toBeChecked()
    })

    it('renders with checked state', () => {
      render(<Checkbox checked />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeChecked()
    })

    it('renders with disabled state', () => {
      render(<Checkbox disabled />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toBeDisabled()
    })
  })

  describe('Styling', () => {
    it('applies default styling classes', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass(
        'peer',
        'h-4',
        'w-4',
        'shrink-0',
        'rounded-sm',
        'border',
        'border-primary',
        'ring-offset-background'
      )
    })

    it('applies focus styling', () => {
      render(<Checkbox />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      )
    })

    it('applies disabled styling', () => {
      render(<Checkbox disabled />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('applies custom className', () => {
      render(<Checkbox className="custom-checkbox" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveClass('custom-checkbox')
    })
  })

  describe('Interactions', () => {
    it('handles click events', async () => {
      const handleCheckedChange = vi.fn()
      const user = createUser()
      
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })

    it('does not trigger events when disabled', async () => {
      const handleCheckedChange = vi.fn()
      const user = createUser()
      
      render(<Checkbox disabled onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)
      
      expect(handleCheckedChange).not.toHaveBeenCalled()
    })

    it('supports keyboard navigation', async () => {
      const handleCheckedChange = vi.fn()
      const user = createUser()
      
      render(<Checkbox onCheckedChange={handleCheckedChange} />)
      
      const checkbox = screen.getByRole('checkbox')
      checkbox.focus()
      await user.keyboard(' ')
      
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
    })
  })

  describe('Check Indicator', () => {
    it('shows check icon when checked', () => {
      render(<Checkbox checked />)
      
      // Check for the lucide Check icon
      const checkIcon = screen.getByTestId('lucide-check')
      expect(checkIcon).toBeInTheDocument()
      expect(checkIcon).toHaveClass('h-4', 'w-4')
    })

    it('hides check icon when unchecked', () => {
      render(<Checkbox checked={false} />)
      
      const checkIcon = screen.queryByTestId('lucide-check')
      expect(checkIcon).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper checkbox role', () => {
      render(<Checkbox />)
      
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('supports ARIA attributes', () => {
      render(
        <Checkbox
          aria-label="Accept terms"
          aria-describedby="terms-description"
        />
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('aria-label', 'Accept terms')
      expect(checkbox).toHaveAttribute('aria-describedby', 'terms-description')
    })

    it('supports form integration', () => {
      render(<Checkbox name="agreement" value="accepted" />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).toHaveAttribute('name', 'agreement')
      expect(checkbox).toHaveAttribute('value', 'accepted')
    })
  })

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const handleCheckedChange = vi.fn()
      const user = createUser()
      
      const { rerender } = render(
        <Checkbox checked={false} onCheckedChange={handleCheckedChange} />
      )
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
      
      await user.click(checkbox)
      expect(handleCheckedChange).toHaveBeenCalledWith(true)
      
      // Simulate parent component updating the checked state
      rerender(<Checkbox checked={true} onCheckedChange={handleCheckedChange} />)
      expect(checkbox).toBeChecked()
    })

    it('works as uncontrolled component', async () => {
      const user = createUser()
      
      render(<Checkbox defaultChecked={false} />)
      
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
      
      await user.click(checkbox)
      expect(checkbox).toBeChecked()
    })
  })
})