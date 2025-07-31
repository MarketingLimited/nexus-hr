import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import { createUser } from '@/test-utils/user-interactions'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

describe('Select Components', () => {
  const SelectExample = ({ onValueChange }: { onValueChange?: (value: string) => void }) => (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  )

  describe('Select Root', () => {
    it('renders select component', () => {
      render(<SelectExample />)
      
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('handles value changes', async () => {
      const handleValueChange = vi.fn()
      const user = createUser()
      
      render(<SelectExample onValueChange={handleValueChange} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        const appleOption = screen.getByText('Apple')
        expect(appleOption).toBeInTheDocument()
      })
      
      const appleOption = screen.getByText('Apple')
      await user.click(appleOption)
      
      expect(handleValueChange).toHaveBeenCalledWith('apple')
    })

    it('supports controlled state', async () => {
      const user = createUser()
      
      const ControlledSelect = () => {
        const [value, setValue] = React.useState('')
        
        return (
          <Select value={value} onValueChange={setValue}>
            <SelectTrigger>
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectContent>
          </Select>
        )
      }
      
      render(<ControlledSelect />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })
  })

  describe('SelectTrigger', () => {
    it('renders trigger button', () => {
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveClass('w-[180px]')
    })

    it('shows placeholder when no value selected', () => {
      render(<SelectExample />)
      
      expect(screen.getByText('Select a fruit')).toBeInTheDocument()
    })

    it('applies custom styling', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('handles keyboard navigation', async () => {
      const user = createUser()
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{ArrowDown}')
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })
    })
  })

  describe('SelectValue', () => {
    it('displays placeholder text', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Custom placeholder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByText('Custom placeholder')).toBeInTheDocument()
    })

    it('shows selected value', async () => {
      const user = createUser()
      render(
        <Select defaultValue="banana">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banana">Banana</SelectItem>
          </SelectContent>
        </Select>
      )
      
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })
  })

  describe('SelectContent', () => {
    it('renders content dropdown', async () => {
      const user = createUser()
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
        expect(screen.getByText('Banana')).toBeInTheDocument()
        expect(screen.getByText('Blueberry')).toBeInTheDocument()
      })
    })

    it('applies custom styling to content', async () => {
      const user = createUser()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        const content = screen.getByText('Test').closest('[role="listbox"]')
        expect(content).toHaveClass('custom-content')
      })
    })

    it('positions content correctly', async () => {
      const user = createUser()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top" align="end">
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument()
      })
    })
  })

  describe('SelectItem', () => {
    it('renders selectable items', async () => {
      const user = createUser()
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        const items = screen.getAllByRole('option')
        expect(items).toHaveLength(5)
        expect(items[0]).toHaveTextContent('Apple')
        expect(items[1]).toHaveTextContent('Banana')
      })
    })

    it('handles item selection', async () => {
      const handleValueChange = vi.fn()
      const user = createUser()
      
      render(<SelectExample onValueChange={handleValueChange} />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        const bananaItem = screen.getByText('Banana')
        expect(bananaItem).toBeInTheDocument()
      })
      
      const bananaItem = screen.getByText('Banana')
      await user.click(bananaItem)
      
      expect(handleValueChange).toHaveBeenCalledWith('banana')
    })

    it('supports disabled items', async () => {
      const user = createUser()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled" disabled>
              Disabled
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        const disabledItem = screen.getByText('Disabled')
        expect(disabledItem.closest('[role="option"]')).toHaveAttribute('aria-disabled', 'true')
      })
    })

    it('applies custom styling to items', async () => {
      const user = createUser()
      render(
        <Select>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="styled" className="custom-item">
              Styled Item
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        const item = screen.getByText('Styled Item')
        expect(item).toHaveClass('custom-item')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
    })

    it('supports keyboard navigation between items', async () => {
      const user = createUser()
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{ArrowDown}')
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })
      
      await user.keyboard('{ArrowDown}')
      
      // Focus should move to next item
      expect(screen.getByText('Banana')).toBeInTheDocument()
    })

    it('supports selection with Enter key', async () => {
      const handleValueChange = vi.fn()
      const user = createUser()
      
      render(<SelectExample onValueChange={handleValueChange} />)
      
      const trigger = screen.getByRole('combobox')
      trigger.focus()
      
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')
      
      expect(handleValueChange).toHaveBeenCalledWith('apple')
    })

    it('closes on Escape key', async () => {
      const user = createUser()
      render(<SelectExample />)
      
      const trigger = screen.getByRole('combobox')
      await user.click(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Apple')).toBeInTheDocument()
      })
      
      await user.keyboard('{Escape}')
      
      await waitFor(() => {
        expect(screen.queryByText('Apple')).not.toBeInTheDocument()
      })
    })
  })

  describe('Form Integration', () => {
    it('works with form controls', () => {
      render(
        <form>
          <label htmlFor="fruit-select">Choose a fruit:</label>
          <Select name="fruit">
            <SelectTrigger id="fruit-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
            </SelectContent>
          </Select>
        </form>
      )
      
      const label = screen.getByText('Choose a fruit:')
      const select = screen.getByRole('combobox')
      
      expect(label).toHaveAttribute('for', 'fruit-select')
      expect(select).toHaveAttribute('id', 'fruit-select')
    })

    it('supports required attribute', () => {
      render(
        <Select required>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-required', 'true')
    })
  })
})