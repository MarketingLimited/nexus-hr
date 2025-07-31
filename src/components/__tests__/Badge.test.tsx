import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { Badge } from '../ui/badge'

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders with default variant', () => {
      render(<Badge>Default Badge</Badge>)
      
      const badge = screen.getByText('Default Badge')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('renders children correctly', () => {
      render(<Badge>Test Content</Badge>)
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    it('applies default variant styles', () => {
      render(<Badge variant="default">Default</Badge>)
      
      const badge = screen.getByText('Default')
      expect(badge).toHaveClass('border-transparent', 'bg-primary', 'text-primary-foreground')
    })

    it('applies secondary variant styles', () => {
      render(<Badge variant="secondary">Secondary</Badge>)
      
      const badge = screen.getByText('Secondary')
      expect(badge).toHaveClass('border-transparent', 'bg-secondary', 'text-secondary-foreground')
    })

    it('applies destructive variant styles', () => {
      render(<Badge variant="destructive">Destructive</Badge>)
      
      const badge = screen.getByText('Destructive')
      expect(badge).toHaveClass('border-transparent', 'bg-destructive', 'text-destructive-foreground')
    })

    it('applies outline variant styles', () => {
      render(<Badge variant="outline">Outline</Badge>)
      
      const badge = screen.getByText('Outline')
      expect(badge).toHaveClass('text-foreground')
      expect(badge).not.toHaveClass('border-transparent')
    })
  })

  describe('Styling', () => {
    it('applies base styling classes', () => {
      render(<Badge>Styled Badge</Badge>)
      
      const badge = screen.getByText('Styled Badge')
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold',
        'transition-colors'
      )
    })

    it('applies focus styles', () => {
      render(<Badge>Focus Badge</Badge>)
      
      const badge = screen.getByText('Focus Badge')
      expect(badge).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-ring', 'focus:ring-offset-2')
    })

    it('applies custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>)
      
      const badge = screen.getByText('Custom')
      expect(badge).toHaveClass('custom-badge')
    })
  })

  describe('HTML Attributes', () => {
    it('forwards HTML div attributes', () => {
      render(
        <Badge data-testid="test-badge" id="badge-id">
          Attributed Badge
        </Badge>
      )
      
      const badge = screen.getByTestId('test-badge')
      expect(badge).toHaveAttribute('id', 'badge-id')
    })

    it('supports onClick handler', () => {
      const handleClick = vi.fn()
      render(
        <Badge onClick={handleClick}>
          Clickable Badge
        </Badge>
      )
      
      const badge = screen.getByText('Clickable Badge')
      badge.click()
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('Content Types', () => {
    it('renders with text content', () => {
      render(<Badge>Text Badge</Badge>)
      
      expect(screen.getByText('Text Badge')).toBeInTheDocument()
    })

    it('renders with number content', () => {
      render(<Badge>{42}</Badge>)
      
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('renders with mixed content', () => {
      render(
        <Badge>
          <span>Icon</span>
          Text
        </Badge>
      )
      
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })
  })
})