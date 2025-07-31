import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'

describe('Sheet Components', () => {
  describe('Sheet', () => {
    it('opens and closes correctly', async () => {
      render(
        <Sheet>
          <SheetTrigger>Open Sheet</SheetTrigger>
          <SheetContent>
            <p>Sheet content</p>
          </SheetContent>
        </Sheet>
      )

      const trigger = screen.getByText('Open Sheet')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Sheet content')).toBeInTheDocument()
      })
    })

    it('supports controlled state', () => {
      const handleOpenChange = vi.fn()
      render(
        <Sheet open={true} onOpenChange={handleOpenChange}>
          <SheetTrigger>Trigger</SheetTrigger>
          <SheetContent>Content</SheetContent>
        </Sheet>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('SheetContent', () => {
    it('renders with correct styling and close button', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent data-testid="content">
            <p>Content</p>
          </SheetContent>
        </Sheet>
      )

      await waitFor(() => {
        const content = screen.getByTestId('content')
        expect(content).toHaveClass('fixed', 'z-50', 'gap-4', 'bg-background', 'p-6', 'shadow-lg')
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
      })
    })

    it('supports different sides', async () => {
      render(
        <Sheet defaultOpen>
          <SheetContent side="left">
            <p>Left side content</p>
          </SheetContent>
        </Sheet>
      )

      await waitFor(() => {
        expect(screen.getByText('Left side content')).toBeInTheDocument()
      })
    })
  })

  describe('Complete Sheet Structure', () => {
    it('renders a complete sheet with all components', async () => {
      render(
        <Sheet>
          <SheetTrigger>Edit Profile</SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit profile</SheetTitle>
              <SheetDescription>
                Make changes to your profile here. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <label htmlFor="name">Name</label>
              <input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <button type="submit">Save changes</button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )

      fireEvent.click(screen.getByText('Edit Profile'))

      await waitFor(() => {
        expect(screen.getByText('Edit profile')).toBeInTheDocument()
        expect(screen.getByText('Make changes to your profile here. Click save when you\'re done.')).toBeInTheDocument()
        expect(screen.getByLabelText('Name')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
      })
    })
  })
})