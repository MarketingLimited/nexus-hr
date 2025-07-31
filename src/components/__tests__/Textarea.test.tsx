import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea', () => {
  it('renders with default styling', () => {
    render(<Textarea data-testid="textarea" />)
    const textarea = screen.getByTestId('textarea')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border')
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Textarea onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Hello world' } })
    
    expect(handleChange).toHaveBeenCalled()
    expect(textarea).toHaveValue('Hello world')
  })

  it('supports placeholder text', () => {
    render(<Textarea placeholder="Enter your message..." />)
    expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Textarea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('applies custom className', () => {
    render(<Textarea className="custom-textarea" />)
    expect(screen.getByRole('textbox')).toHaveClass('custom-textarea')
  })

  it('forwards HTML attributes', () => {
    render(<Textarea id="message" rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('id', 'message')
    expect(textarea).toHaveAttribute('rows', '5')
  })

  it('supports controlled value', () => {
    const handleChange = vi.fn()
    render(<Textarea value="Controlled value" onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('Controlled value')
  })
})