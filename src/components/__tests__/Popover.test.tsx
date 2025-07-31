import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

describe('Popover Components', () => {
  describe('Popover', () => {
    it('renders trigger and opens popover on click', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open Popover')
      expect(trigger).toBeInTheDocument()

      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })
    })

    it('supports controlled open state', () => {
      const handleOpenChange = vi.fn()
      render(
        <Popover open={true} onOpenChange={handleOpenChange}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <p>Content</p>
          </PopoverContent>
        </Popover>
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('does not show content when closed', () => {
      render(
        <Popover open={false}>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent>
            <p>Content</p>
          </PopoverContent>
        </Popover>
      )

      expect(screen.queryByText('Content')).not.toBeInTheDocument()
    })
  })

  describe('PopoverTrigger', () => {
    it('renders as button by default', () => {
      render(
        <Popover>
          <PopoverTrigger data-testid="trigger">Click me</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      )

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger.tagName).toBe('BUTTON')
    })

    it('toggles popover on click', async () => {
      render(
        <Popover>
          <PopoverTrigger>Toggle</PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Toggle')
      
      // Open popover
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })

      // Close popover
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
      })
    })

    it('can render as child component', async () => {
      render(
        <Popover>
          <PopoverTrigger asChild>
            <button>Custom Trigger</button>
          </PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      )

      const trigger = screen.getByRole('button', { name: 'Custom Trigger' })
      expect(trigger).toBeInTheDocument()
      
      fireEvent.click(trigger)
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument()
      })
    })
  })

  describe('PopoverContent', () => {
    it('renders with correct styling when open', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent data-testid="content">
            <p>Content</p>
          </PopoverContent>
        </Popover>
      )

      await waitFor(() => {
        const content = screen.getByTestId('content')
        expect(content).toBeInTheDocument()
        expect(content).toHaveClass('z-50', 'w-72', 'rounded-md', 'border', 'bg-popover', 'p-4', 'shadow-md')
      })
    })

    it('applies custom className', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent className="custom-content">
            <p>Content</p>
          </PopoverContent>
        </Popover>
      )

      await waitFor(() => {
        const content = screen.getByText('Content').parentElement
        expect(content).toHaveClass('custom-content')
      })
    })

    it('supports different alignments', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent align="end">
            <p>End aligned content</p>
          </PopoverContent>
        </Popover>
      )

      await waitFor(() => {
        expect(screen.getByText('End aligned content')).toBeInTheDocument()
      })
    })

    it('supports custom side offset', async () => {
      render(
        <Popover defaultOpen>
          <PopoverTrigger>Trigger</PopoverTrigger>
          <PopoverContent sideOffset={10}>
            <p>Content with offset</p>
          </PopoverContent>
        </Popover>
      )

      await waitFor(() => {
        expect(screen.getByText('Content with offset')).toBeInTheDocument()
      })
    })

    it('closes when clicking outside', async () => {
      render(
        <div>
          <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>
              <p>Popover content</p>
            </PopoverContent>
          </Popover>
          <div data-testid="outside">Outside content</div>
        </div>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })

      const outside = screen.getByTestId('outside')
      fireEvent.click(outside)

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
      })
    })

    it('closes when pressing Escape key', async () => {
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>
            <p>Popover content</p>
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Open')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Popover content')).toBeInTheDocument()
      })

      fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByText('Popover content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Complete Popover Structure', () => {
    it('renders a complete popover with interactive content', async () => {
      const handleButtonClick = vi.fn()
      
      render(
        <Popover>
          <PopoverTrigger>Settings</PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Dimensions</h4>
                <p className="text-sm text-muted-foreground">
                  Set the dimensions for the layer.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="width">Width</label>
                  <input
                    id="width"
                    defaultValue="100%"
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <label htmlFor="height">Height</label>
                  <input
                    id="height"
                    defaultValue="25px"
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
              <button onClick={handleButtonClick}>Apply Changes</button>
            </div>
          </PopoverContent>
        </Popover>
      )

      const trigger = screen.getByText('Settings')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Dimensions')).toBeInTheDocument()
        expect(screen.getByText('Set the dimensions for the layer.')).toBeInTheDocument()
        expect(screen.getByLabelText('Width')).toBeInTheDocument()
        expect(screen.getByLabelText('Height')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Apply Changes' })).toBeInTheDocument()
      })

      // Test form interaction
      const widthInput = screen.getByLabelText('Width')
      fireEvent.change(widthInput, { target: { value: '50%' } })
      expect(widthInput).toHaveValue('50%')

      // Test button click
      const applyButton = screen.getByRole('button', { name: 'Apply Changes' })
      fireEvent.click(applyButton)
      expect(handleButtonClick).toHaveBeenCalled()
    })

    it('handles multiple popovers independently', async () => {
      render(
        <div>
          <Popover>
            <PopoverTrigger>First Popover</PopoverTrigger>
            <PopoverContent>
              <p>First content</p>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger>Second Popover</PopoverTrigger>
            <PopoverContent>
              <p>Second content</p>
            </PopoverContent>
          </Popover>
        </div>
      )

      // Open first popover
      fireEvent.click(screen.getByText('First Popover'))
      await waitFor(() => {
        expect(screen.getByText('First content')).toBeInTheDocument()
      })

      // Open second popover (should close first)
      fireEvent.click(screen.getByText('Second Popover'))
      await waitFor(() => {
        expect(screen.getByText('Second content')).toBeInTheDocument()
        expect(screen.queryByText('First content')).not.toBeInTheDocument()
      })
    })
  })
})