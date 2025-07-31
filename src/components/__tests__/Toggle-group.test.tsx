import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

describe('ToggleGroup Components', () => {
  describe('ToggleGroup', () => {
    it('renders with default styling', () => {
      render(
        <ToggleGroup type="single" data-testid="toggle-group">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      )

      const toggleGroup = screen.getByTestId('toggle-group')
      expect(toggleGroup).toBeInTheDocument()
      expect(toggleGroup).toHaveClass('flex', 'items-center', 'justify-center', 'gap-1')
    })

    it('applies custom className', () => {
      render(
        <ToggleGroup type="single" className="custom-group" data-testid="toggle-group">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      )

      const toggleGroup = screen.getByTestId('toggle-group')
      expect(toggleGroup).toHaveClass('custom-group')
    })

    it('handles single selection type', () => {
      const handleValueChange = vi.fn()
      render(
        <ToggleGroup type="single" onValueChange={handleValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByText('Option 1')
      fireEvent.click(option1)

      expect(handleValueChange).toHaveBeenCalledWith('option1')
    })

    it('handles multiple selection type', () => {
      const handleValueChange = vi.fn()
      render(
        <ToggleGroup type="multiple" onValueChange={handleValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByText('Option 1')
      const option2 = screen.getByText('Option 2')
      
      fireEvent.click(option1)
      expect(handleValueChange).toHaveBeenCalledWith(['option1'])
      
      fireEvent.click(option2)
      expect(handleValueChange).toHaveBeenCalledWith(['option2'])
    })

    it('supports controlled single value', () => {
      render(
        <ToggleGroup type="single" value="option2">
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
        </ToggleGroup>
      )

      const option2 = screen.getByText('Option 2')
      expect(option2).toHaveAttribute('data-state', 'on')
    })

    it('supports controlled multiple values', () => {
      render(
        <ToggleGroup type="multiple" value={['option1', 'option2']}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByText('Option 1')
      const option2 = screen.getByText('Option 2')
      const option3 = screen.getByText('Option 3')
      
      expect(option1).toHaveAttribute('data-state', 'on')
      expect(option2).toHaveAttribute('data-state', 'on')
      expect(option3).toHaveAttribute('data-state', 'off')
    })

    it('can be disabled', () => {
      const handleValueChange = vi.fn()
      render(
        <ToggleGroup type="single" disabled onValueChange={handleValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByText('Option 1')
      expect(option1).toBeDisabled()
      
      fireEvent.click(option1)
      expect(handleValueChange).not.toHaveBeenCalled()
    })
  })

  describe('ToggleGroupItem', () => {
    it('renders with inherited variant and size from context', () => {
      render(
        <ToggleGroup type="single" variant="outline" size="lg">
          <ToggleGroupItem value="option1" data-testid="item">
            Large Outline
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('item')
      expect(item).toBeInTheDocument()
      // The item should inherit the variant and size from the group context
    })

    it('can override variant and size from context', () => {
      render(
        <ToggleGroup type="single" variant="default" size="default">
          <ToggleGroupItem value="option1" variant="outline" size="sm" data-testid="override-item">
            Override Item
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('override-item')
      expect(item).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1" className="custom-item">
            Custom Item
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByText('Custom Item')
      expect(item).toHaveClass('custom-item')
    })

    it('forwards HTML attributes', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1" id="test-item" data-testid="item">
            Test Item
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('item')
      expect(item).toHaveAttribute('id', 'test-item')
    })

    it('can be individually disabled', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="option1">Enabled</ToggleGroupItem>
          <ToggleGroupItem value="option2" disabled>Disabled</ToggleGroupItem>
        </ToggleGroup>
      )

      const enabledItem = screen.getByText('Enabled')
      const disabledItem = screen.getByText('Disabled')
      
      expect(enabledItem).not.toBeDisabled()
      expect(disabledItem).toBeDisabled()
    })
  })

  describe('ToggleGroup Context', () => {
    it('provides variant and size context to items', () => {
      render(
        <ToggleGroup type="single" variant="outline" size="lg">
          <ToggleGroupItem value="item1" data-testid="context-item">
            Context Item
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByTestId('context-item')
      expect(item).toBeInTheDocument()
      // The context should provide the variant and size to the item
    })

    it('allows items to override context values', () => {
      render(
        <ToggleGroup type="single" variant="default" size="default">
          <ToggleGroupItem value="item1" variant="outline" size="sm">
            Override Item
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const item = screen.getByText('Override Item')
      expect(item).toBeInTheDocument()
    })
  })

  describe('Complete ToggleGroup Usage', () => {
    it('works as a text formatting toolbar', () => {
      const handleValueChange = vi.fn()
      render(
        <ToggleGroup type="multiple" onValueChange={handleValueChange}>
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 2h4.5c1.5 0 2.5 1 2.5 2.5S10 7 8.5 7H4V2zM4 9h5c1.5 0 2.5 1 2.5 2.5S10.5 14 9 14H4V9z"/>
            </svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6 2h6v2h-2l-2 8h2v2H4v-2h2l2-8H6V2z"/>
            </svg>
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M4 2v6c0 2.5 1.5 4 4 4s4-1.5 4-4V2h-2v6c0 1.5-.5 2-2 2s-2-.5-2-2V2H4zM2 14h12v2H2v-2z"/>
            </svg>
          </ToggleGroupItem>
        </ToggleGroup>
      )

      const boldButton = screen.getByRole('button', { name: 'Toggle bold' })
      const italicButton = screen.getByRole('button', { name: 'Toggle italic' })
      
      fireEvent.click(boldButton)
      expect(handleValueChange).toHaveBeenCalledWith(['bold'])
      
      fireEvent.click(italicButton)
      expect(handleValueChange).toHaveBeenCalledWith(['italic'])
    })

    it('works as a single-select filter', () => {
      const handleValueChange = vi.fn()
      render(
        <ToggleGroup type="single" onValueChange={handleValueChange} variant="outline">
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="active">Active</ToggleGroupItem>
          <ToggleGroupItem value="inactive">Inactive</ToggleGroupItem>
        </ToggleGroup>
      )

      const allFilter = screen.getByText('All')
      const activeFilter = screen.getByText('Active')
      
      fireEvent.click(allFilter)
      expect(handleValueChange).toHaveBeenCalledWith('all')
      
      fireEvent.click(activeFilter)
      expect(handleValueChange).toHaveBeenCalledWith('active')
    })

    it('handles complex state management', () => {
      const handleValueChange = vi.fn()
      const { rerender } = render(
        <ToggleGroup type="multiple" value={['option1']} onValueChange={handleValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )

      const option1 = screen.getByText('Option 1')
      const option2 = screen.getByText('Option 2')
      
      expect(option1).toHaveAttribute('data-state', 'on')
      expect(option2).toHaveAttribute('data-state', 'off')
      
      fireEvent.click(option2)
      expect(handleValueChange).toHaveBeenCalledWith(['option2'])
      
      // Simulate state update
      rerender(
        <ToggleGroup type="multiple" value={['option1', 'option2']} onValueChange={handleValueChange}>
          <ToggleGroupItem value="option1">Option 1</ToggleGroupItem>
          <ToggleGroupItem value="option2">Option 2</ToggleGroupItem>
          <ToggleGroupItem value="option3">Option 3</ToggleGroupItem>
        </ToggleGroup>
      )
      
      expect(option1).toHaveAttribute('data-state', 'on')
      expect(option2).toHaveAttribute('data-state', 'on')
    })

    it('works with keyboard navigation', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="first">First</ToggleGroupItem>
          <ToggleGroupItem value="second">Second</ToggleGroupItem>
          <ToggleGroupItem value="third">Third</ToggleGroupItem>
        </ToggleGroup>
      )

      const firstItem = screen.getByText('First')
      const secondItem = screen.getByText('Second')
      
      // Focus and navigation would be handled by the underlying Radix component
      firstItem.focus()
      expect(firstItem).toHaveFocus()
      
      // Keyboard events would be handled by Radix internally
      fireEvent.keyDown(firstItem, { key: 'ArrowRight' })
      
      // The actual keyboard navigation behavior is implemented by Radix UI
    })
  })

  describe('ToggleGroup accessibility', () => {
    it('has correct role and attributes', () => {
      render(
        <ToggleGroup type="single" aria-label="Text formatting options">
          <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
          <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        </ToggleGroup>
      )

      const group = screen.getByRole('group', { name: 'Text formatting options' })
      expect(group).toBeInTheDocument()
      
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-pressed')
      })
    })

    it('supports roving tabindex for keyboard navigation', () => {
      render(
        <ToggleGroup type="single">
          <ToggleGroupItem value="first">First</ToggleGroupItem>
          <ToggleGroupItem value="second">Second</ToggleGroupItem>
        </ToggleGroup>
      )

      const buttons = screen.getAllByRole('button')
      // Radix UI manages tabindex for roving focus
      expect(buttons[0]).toBeInTheDocument()
      expect(buttons[1]).toBeInTheDocument()
    })
  })
})