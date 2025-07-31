import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarShortcut,
} from '@/components/ui/menubar'

describe('Menubar Components', () => {
  describe('Menubar', () => {
    it('renders with correct styling', () => {
      render(
        <Menubar data-testid="menubar">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )

      const menubar = screen.getByTestId('menubar')
      expect(menubar).toBeInTheDocument()
      expect(menubar).toHaveClass('flex', 'h-10', 'items-center', 'space-x-1', 'rounded-md', 'border')
    })

    it('applies custom className', () => {
      render(
        <Menubar className="custom-menubar">
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByRole('menubar')).toHaveClass('custom-menubar')
    })
  })

  describe('MenubarTrigger', () => {
    it('renders with correct styling', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger data-testid="trigger">File</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveClass('flex', 'cursor-default', 'select-none', 'items-center', 'rounded-sm')
    })

    it('opens menu on click', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('New File')).toBeInTheDocument()
      })
    })

    it('applies custom className', () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger className="custom-trigger">File</MenubarTrigger>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByText('File')).toHaveClass('custom-trigger')
    })
  })

  describe('MenubarContent', () => {
    it('renders with correct styling when open', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent data-testid="content">
              <MenubarItem>New File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('content')
        expect(content).toHaveClass('z-50', 'min-w-[12rem]', 'overflow-hidden', 'rounded-md', 'border')
      })
    })

    it('applies custom className', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent className="custom-content">
              <MenubarItem>New File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByRole('menu')).toHaveClass('custom-content')
      })
    })
  })

  describe('MenubarItem', () => {
    it('handles click events', async () => {
      const handleClick = vi.fn()
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem onClick={handleClick}>New File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        const item = screen.getByText('New File')
        fireEvent.click(item)
        expect(handleClick).toHaveBeenCalled()
      })
    })

    it('can be disabled', async () => {
      const handleClick = vi.fn()
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem disabled onClick={handleClick}>
                Disabled Item
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        const item = screen.getByText('Disabled Item')
        expect(item).toHaveClass('data-[disabled]:pointer-events-none', 'data-[disabled]:opacity-50')
        fireEvent.click(item)
        expect(handleClick).not.toHaveBeenCalled()
      })
    })

    it('supports inset styling', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem inset>Inset Item</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Inset Item')).toHaveClass('pl-8')
      })
    })
  })

  describe('MenubarLabel', () => {
    it('renders with correct styling', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel>Recent Files</MenubarLabel>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        const label = screen.getByText('Recent Files')
        expect(label).toBeInTheDocument()
        expect(label).toHaveClass('px-2', 'py-1.5', 'text-sm', 'font-semibold')
      })
    })

    it('supports inset styling', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarLabel inset>Inset Label</MenubarLabel>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Inset Label')).toHaveClass('pl-8')
      })
    })
  })

  describe('MenubarSeparator', () => {
    it('renders with correct styling', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New File</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Open File</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        const separator = screen.getByRole('separator')
        expect(separator).toBeInTheDocument()
        expect(separator).toHaveClass('-mx-1', 'my-1', 'h-px', 'bg-muted')
      })
    })
  })

  describe('MenubarCheckboxItem', () => {
    it('handles checked state', async () => {
      const handleCheckedChange = vi.fn()
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem 
                checked={false} 
                onCheckedChange={handleCheckedChange}
              >
                Show Sidebar
              </MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('View')
      fireEvent.click(trigger)

      await waitFor(() => {
        const item = screen.getByText('Show Sidebar')
        fireEvent.click(item)
        expect(handleCheckedChange).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('MenubarRadioGroup and MenubarRadioItem', () => {
    it('handles radio selection', async () => {
      const handleValueChange = vi.fn()
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Theme</MenubarTrigger>
            <MenubarContent>
              <MenubarRadioGroup value="light" onValueChange={handleValueChange}>
                <MenubarRadioItem value="light">Light</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('Theme')
      fireEvent.click(trigger)

      await waitFor(() => {
        const darkOption = screen.getByText('Dark')
        fireEvent.click(darkOption)
        expect(handleValueChange).toHaveBeenCalledWith('dark')
      })
    })
  })

  describe('MenubarShortcut', () => {
    it('renders with correct styling', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New File
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        const shortcut = screen.getByText('⌘N')
        expect(shortcut).toBeInTheDocument()
        expect(shortcut).toHaveClass('ml-auto', 'text-xs', 'tracking-widest', 'text-muted-foreground')
      })
    })
  })

  describe('MenubarSub', () => {
    it('renders submenu correctly', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Export</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>PDF</MenubarItem>
                  <MenubarItem>CSV</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      const trigger = screen.getByText('File')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument()
      })
    })
  })

  describe('Complete Menubar Structure', () => {
    it('renders a complete menubar with multiple menus', async () => {
      render(
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                New File
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Open File
                <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Export</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>PDF</MenubarItem>
                  <MenubarItem>CSV</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Edit</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                Undo
                <MenubarShortcut>⌘Z</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                Redo
                <MenubarShortcut>⇧⌘Z</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>View</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem checked>
                Show Sidebar
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarRadioGroup value="light">
                <MenubarRadioItem value="light">Light Theme</MenubarRadioItem>
                <MenubarRadioItem value="dark">Dark Theme</MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      )

      expect(screen.getByText('File')).toBeInTheDocument()
      expect(screen.getByText('Edit')).toBeInTheDocument()
      expect(screen.getByText('View')).toBeInTheDocument()

      // Test File menu
      fireEvent.click(screen.getByText('File'))
      await waitFor(() => {
        expect(screen.getByText('New File')).toBeInTheDocument()
        expect(screen.getByText('⌘N')).toBeInTheDocument()
        expect(screen.getByText('Export')).toBeInTheDocument()
      })
    })
  })
})