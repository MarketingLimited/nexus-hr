import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from '@/components/ui/command'

describe('Command Components', () => {
  describe('Command', () => {
    it('renders with correct styling', () => {
      render(<Command data-testid="command">Content</Command>)
      const command = screen.getByTestId('command')
      expect(command).toBeInTheDocument()
      expect(command).toHaveClass('flex', 'h-full', 'w-full', 'flex-col', 'overflow-hidden')
    })

    it('applies custom className', () => {
      render(<Command className="custom-command">Content</Command>)
      expect(screen.getByText('Content')).toHaveClass('custom-command')
    })
  })

  describe('CommandDialog', () => {
    it('renders when open', () => {
      render(
        <CommandDialog open={true}>
          <div>Dialog Content</div>
        </CommandDialog>
      )
      expect(screen.getByText('Dialog Content')).toBeInTheDocument()
    })

    it('does not render when closed', () => {
      render(
        <CommandDialog open={false}>
          <div>Dialog Content</div>
        </CommandDialog>
      )
      expect(screen.queryByText('Dialog Content')).not.toBeInTheDocument()
    })
  })

  describe('CommandInput', () => {
    it('renders with search icon and correct styling', () => {
      render(<CommandInput placeholder="Search..." />)
      const input = screen.getByPlaceholderText('Search...')
      expect(input).toBeInTheDocument()
      expect(input).toHaveClass('flex', 'h-11', 'w-full', 'rounded-md', 'bg-transparent')
    })

    it('handles value changes', () => {
      const handleChange = vi.fn()
      render(<CommandInput value="" onValueChange={handleChange} />)
      const input = screen.getByRole('combobox')
      
      fireEvent.change(input, { target: { value: 'test' } })
      expect(handleChange).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(<CommandInput className="custom-input" />)
      const input = screen.getByRole('combobox')
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('CommandList', () => {
    it('renders with correct styling', () => {
      render(<CommandList data-testid="list">List content</CommandList>)
      const list = screen.getByTestId('list')
      expect(list).toBeInTheDocument()
      expect(list).toHaveClass('max-h-[300px]', 'overflow-y-auto', 'overflow-x-hidden')
    })

    it('applies custom className', () => {
      render(<CommandList className="custom-list">Content</CommandList>)
      expect(screen.getByText('Content')).toHaveClass('custom-list')
    })
  })

  describe('CommandEmpty', () => {
    it('renders with correct styling', () => {
      render(<CommandEmpty>No results found</CommandEmpty>)
      const empty = screen.getByText('No results found')
      expect(empty).toBeInTheDocument()
      expect(empty).toHaveClass('py-6', 'text-center', 'text-sm')
    })
  })

  describe('CommandGroup', () => {
    it('renders with correct styling', () => {
      render(<CommandGroup data-testid="group">Group content</CommandGroup>)
      const group = screen.getByTestId('group')
      expect(group).toBeInTheDocument()
      expect(group).toHaveClass('overflow-hidden', 'p-1', 'text-foreground')
    })

    it('applies custom className', () => {
      render(<CommandGroup className="custom-group">Content</CommandGroup>)
      expect(screen.getByText('Content')).toHaveClass('custom-group')
    })
  })

  describe('CommandSeparator', () => {
    it('renders with correct styling', () => {
      render(<CommandSeparator data-testid="separator" />)
      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveClass('-mx-1', 'h-px', 'bg-border')
    })

    it('applies custom className', () => {
      render(<CommandSeparator className="custom-separator" />)
      const separator = screen.getByRole('separator')
      expect(separator).toHaveClass('custom-separator')
    })
  })

  describe('CommandItem', () => {
    it('renders with correct styling', () => {
      render(<CommandItem data-testid="item">Item content</CommandItem>)
      const item = screen.getByTestId('item')
      expect(item).toBeInTheDocument()
      expect(item).toHaveClass('relative', 'flex', 'cursor-default', 'select-none', 'items-center')
    })

    it('handles selection', () => {
      const handleSelect = vi.fn()
      render(<CommandItem onSelect={handleSelect}>Selectable Item</CommandItem>)
      
      fireEvent.click(screen.getByText('Selectable Item'))
      expect(handleSelect).toHaveBeenCalled()
    })

    it('can be disabled', () => {
      render(<CommandItem disabled>Disabled Item</CommandItem>)
      const item = screen.getByText('Disabled Item')
      expect(item).toHaveClass('data-[disabled=true]:pointer-events-none', 'data-[disabled=true]:opacity-50')
    })

    it('applies custom className', () => {
      render(<CommandItem className="custom-item">Item</CommandItem>)
      expect(screen.getByText('Item')).toHaveClass('custom-item')
    })
  })

  describe('CommandShortcut', () => {
    it('renders with correct styling', () => {
      render(<CommandShortcut>⌘K</CommandShortcut>)
      const shortcut = screen.getByText('⌘K')
      expect(shortcut).toBeInTheDocument()
      expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'text-muted-foreground')
    })

    it('applies custom className', () => {
      render(<CommandShortcut className="custom-shortcut">⌘K</CommandShortcut>)
      expect(screen.getByText('⌘K')).toHaveClass('custom-shortcut')
    })
  })

  describe('Complete Command Structure', () => {
    it('renders a complete command palette', () => {
      render(
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>
                <span>Calendar</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <span>Search Emoji</span>
                <CommandShortcut>⌘J</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Profile</CommandItem>
              <CommandItem>Billing</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      )

      expect(screen.getByPlaceholderText('Type a command or search...')).toBeInTheDocument()
      expect(screen.getByText('Calendar')).toBeInTheDocument()
      expect(screen.getByText('⌘K')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })
  })
})