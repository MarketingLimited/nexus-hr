import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'

describe('DropdownMenu Components', () => {
  describe('DropdownMenu', () => {
    it('renders trigger and opens menu on click', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText('Open Menu')
      expect(trigger).toBeInTheDocument()

      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument()
      })
    })

    it('supports controlled open state', () => {
      const handleOpenChange = vi.fn()
      render(
        <DropdownMenu open={true} onOpenChange={handleOpenChange}>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      expect(screen.getByText('Item')).toBeInTheDocument()
    })
  })

  describe('DropdownMenuContent', () => {
    it('renders with correct styling', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent data-testid="content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const content = screen.getByTestId('content')
        expect(content).toHaveClass('z-50', 'min-w-[8rem]', 'overflow-hidden', 'rounded-md', 'border')
      })
    })

    it('applies custom className', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent className="custom-content">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        expect(screen.getByRole('menu')).toHaveClass('custom-content')
      })
    })

    it('supports different alignments', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        expect(screen.getByRole('menu')).toBeInTheDocument()
      })
    })
  })

  describe('DropdownMenuItem', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleClick}>Clickable Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const item = screen.getByText('Clickable Item')
        fireEvent.click(item)
        expect(handleClick).toHaveBeenCalled()
      })
    })

    it('can be disabled', async () => {
      const handleClick = vi.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled onClick={handleClick}>
              Disabled Item
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const item = screen.getByText('Disabled Item')
        expect(item).toHaveClass('data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
        fireEvent.click(item)
        expect(handleClick).not.toHaveBeenCalled()
      })
    })

    it('supports inset styling', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem inset>Inset Item</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        expect(screen.getByText('Inset Item')).toHaveClass('pl-8')
      })
    })
  })

  describe('DropdownMenuLabel', () => {
    it('renders with correct styling', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Menu Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const label = screen.getByText('Menu Label')
        expect(label).toBeInTheDocument()
        expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold')
      })
    })

    it('supports inset styling', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        expect(screen.getByText('Inset Label')).toHaveClass('pl-8')
      })
    })
  })

  describe('DropdownMenuSeparator', () => {
    it('renders with correct styling', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Item 2</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const separator = screen.getByRole('separator')
        expect(separator).toBeInTheDocument()
        expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted')
      })
    })
  })

  describe('DropdownMenuCheckboxItem', () => {
    it('handles checked state', async () => {
      const handleCheckedChange = vi.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem 
              checked={false} 
              onCheckedChange={handleCheckedChange}
            >
              Checkbox Item
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const item = screen.getByText('Checkbox Item')
        fireEvent.click(item)
        expect(handleCheckedChange).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('DropdownMenuRadioGroup and DropdownMenuRadioItem', () => {
    it('handles radio selection', async () => {
      const handleValueChange = vi.fn()
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuRadioGroup value="option1" onValueChange={handleValueChange}>
              <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const option2 = screen.getByText('Option 2')
        fireEvent.click(option2)
        expect(handleValueChange).toHaveBeenCalledWith('option2')
      })
    })
  })

  describe('DropdownMenuShortcut', () => {
    it('renders with correct styling', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              Action
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        const shortcut = screen.getByText('⌘K')
        expect(shortcut).toBeInTheDocument()
        expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'opacity-60')
      })
    })
  })

  describe('DropdownMenuSub', () => {
    it('renders submenu correctly', async () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>More options</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
                <DropdownMenuItem>Sub Item 2</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      await waitFor(() => {
        expect(screen.getByText('More options')).toBeInTheDocument()
      })
    })
  })

  describe('Complete DropdownMenu Structure', () => {
    it('renders a complete dropdown menu with all components', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked>
              Show notifications
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value="light">
              <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      const trigger = screen.getByText('Open Menu')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('My Account')).toBeInTheDocument()
        expect(screen.getByText('Profile')).toBeInTheDocument()
        expect(screen.getByText('⇧⌘P')).toBeInTheDocument()
        expect(screen.getByText('Show notifications')).toBeInTheDocument()
        expect(screen.getByText('Light')).toBeInTheDocument()
        expect(screen.getByText('Dark')).toBeInTheDocument()
      })
    })
  })
})