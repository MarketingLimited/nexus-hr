import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { Label } from '../ui/label'

describe('Label Component', () => {
  describe('Rendering', () => {
    it('renders label with text content', () => {
      render(<Label>Username</Label>)
      
      const label = screen.getByText('Username')
      expect(label).toBeInTheDocument()
    })

    it('renders as label element', () => {
      render(<Label>Email Address</Label>)
      
      const label = screen.getByText('Email Address')
      expect(label.tagName).toBe('LABEL')
    })
  })

  describe('Styling', () => {
    it('applies default styling classes', () => {
      render(<Label>Styled Label</Label>)
      
      const label = screen.getByText('Styled Label')
      expect(label).toHaveClass(
        'text-sm',
        'font-medium',
        'leading-none',
        'peer-disabled:cursor-not-allowed',
        'peer-disabled:opacity-70'
      )
    })

    it('applies custom className', () => {
      render(<Label className="custom-label">Custom</Label>)
      
      const label = screen.getByText('Custom')
      expect(label).toHaveClass('custom-label')
    })

    it('merges custom classes with default classes', () => {
      render(<Label className="text-red-500">Red Label</Label>)
      
      const label = screen.getByText('Red Label')
      expect(label).toHaveClass('text-red-500', 'font-medium', 'leading-none')
    })
  })

  describe('HTML Attributes', () => {
    it('supports htmlFor attribute', () => {
      render(<Label htmlFor="username-input">Username</Label>)
      
      const label = screen.getByText('Username')
      expect(label).toHaveAttribute('for', 'username-input')
    })

    it('forwards HTML label attributes', () => {
      render(
        <Label
          id="label-id"
          data-testid="test-label"
          title="Tooltip text"
        >
          Attributed Label
        </Label>
      )
      
      const label = screen.getByTestId('test-label')
      expect(label).toHaveAttribute('id', 'label-id')
      expect(label).toHaveAttribute('title', 'Tooltip text')
    })
  })

  describe('Form Integration', () => {
    it('associates with form controls via htmlFor', () => {
      render(
        <div>
          <Label htmlFor="email">Email</Label>
          <input id="email" type="email" />
        </div>
      )
      
      const label = screen.getByText('Email')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'email')
      expect(input).toHaveAttribute('id', 'email')
    })

    it('works with nested form controls', () => {
      render(
        <Label>
          <span>Nested Input</span>
          <input type="text" />
        </Label>
      )
      
      const label = screen.getByText('Nested Input').parentElement
      const input = screen.getByRole('textbox')
      
      expect(label?.tagName).toBe('LABEL')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides accessible labeling', () => {
      render(
        <div>
          <Label htmlFor="accessible-input">Accessible Field</Label>
          <input 
            id="accessible-input" 
            type="text"
            aria-required="true"
          />
        </div>
      )
      
      const input = screen.getByLabelText('Accessible Field')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('aria-required', 'true')
    })

    it('supports ARIA attributes', () => {
      render(
        <Label 
          aria-hidden="true"
          role="presentation"
        >
          ARIA Label
        </Label>
      )
      
      const label = screen.getByText('ARIA Label')
      expect(label).toHaveAttribute('aria-hidden', 'true')
      expect(label).toHaveAttribute('role', 'presentation')
    })
  })

  describe('Content Types', () => {
    it('renders text content', () => {
      render(<Label>Simple Text</Label>)
      
      expect(screen.getByText('Simple Text')).toBeInTheDocument()
    })

    it('renders with nested elements', () => {
      render(
        <Label>
          <span className="required">*</span>
          Required Field
        </Label>
      )
      
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('Required Field')).toBeInTheDocument()
    })

    it('handles empty content', () => {
      render(<Label data-testid="empty-label"></Label>)
      
      const label = screen.getByTestId('empty-label')
      expect(label).toBeInTheDocument()
      expect(label).toBeEmptyDOMElement()
    })
  })

  describe('Ref Forwarding', () => {
    it('forwards ref to label element', () => {
      let labelRef: HTMLLabelElement | null = null
      
      render(
        <Label 
          ref={(el) => { labelRef = el }}
          data-testid="ref-label"
        >
          Ref Label
        </Label>
      )
      
      const label = screen.getByTestId('ref-label')
      expect(labelRef).toBe(label)
      expect(labelRef?.tagName).toBe('LABEL')
    })
  })
})