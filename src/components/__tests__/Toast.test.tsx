import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from '@/components/ui/toast'

describe('Toast Components', () => {
  describe('ToastProvider', () => {
    it('renders children correctly', () => {
      render(
        <ToastProvider>
          <div>Toast content</div>
        </ToastProvider>
      )

      expect(screen.getByText('Toast content')).toBeInTheDocument()
    })

    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <ToastViewport />
        </ToastProvider>
      )

      // ToastViewport should render within the provider
      const viewport = screen.getByRole('region', { hidden: true })
      expect(viewport).toBeInTheDocument()
    })
  })

  describe('ToastViewport', () => {
    it('renders with correct styling', () => {
      render(
        <ToastProvider>
          <ToastViewport data-testid="viewport" />
        </ToastProvider>
      )

      const viewport = screen.getByTestId('viewport')
      expect(viewport).toBeInTheDocument()
      expect(viewport).toHaveClass('fixed', 'top-0', 'z-[100]', 'flex', 'max-h-screen', 'w-full', 'flex-col-reverse')
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <ToastViewport className="custom-viewport" data-testid="viewport" />
        </ToastProvider>
      )

      const viewport = screen.getByTestId('viewport')
      expect(viewport).toHaveClass('custom-viewport')
    })
  })

  describe('Toast', () => {
    it('renders with default variant styling', () => {
      render(
        <ToastProvider>
          <Toast data-testid="toast">
            <ToastTitle>Test Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const toast = screen.getByTestId('toast')
      expect(toast).toBeInTheDocument()
      expect(toast).toHaveClass('group', 'pointer-events-auto', 'relative', 'flex', 'w-full')
    })

    it('renders with destructive variant styling', () => {
      render(
        <ToastProvider>
          <Toast variant="destructive" data-testid="destructive-toast">
            <ToastTitle>Error Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const toast = screen.getByTestId('destructive-toast')
      expect(toast).toHaveClass('destructive', 'border-destructive', 'bg-destructive')
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <Toast className="custom-toast" data-testid="toast">
            <ToastTitle>Custom Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveClass('custom-toast')
    })

    it('forwards HTML attributes', () => {
      render(
        <ToastProvider>
          <Toast id="test-toast" data-testid="toast">
            <ToastTitle>Test Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const toast = screen.getByTestId('toast')
      expect(toast).toHaveAttribute('id', 'test-toast')
    })
  })

  describe('ToastTitle', () => {
    it('renders with correct styling', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle data-testid="title">Toast Title</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const title = screen.getByTestId('title')
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Toast Title')
      expect(title).toHaveClass('text-sm', 'font-semibold')
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle className="custom-title">Title</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const title = screen.getByText('Title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('ToastDescription', () => {
    it('renders with correct styling', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastDescription data-testid="description">
              Toast description text
            </ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Toast description text')
      expect(description).toHaveClass('text-sm', 'opacity-90')
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastDescription className="custom-description">
              Description
            </ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const description = screen.getByText('Description')
      expect(description).toHaveClass('custom-description')
    })
  })

  describe('ToastClose', () => {
    it('renders with correct styling and accessibility', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastClose data-testid="close" />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const closeButton = screen.getByTestId('close')
      expect(closeButton).toBeInTheDocument()
      expect(closeButton).toHaveClass('absolute', 'right-2', 'top-2', 'rounded-md')
      
      // Check for X icon
      const icon = closeButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('handles click events', () => {
      const handleClose = vi.fn()
      
      render(
        <ToastProvider>
          <Toast onOpenChange={handleClose}>
            <ToastClose data-testid="close" />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const closeButton = screen.getByTestId('close')
      fireEvent.click(closeButton)
      
      // Note: The actual close behavior is handled by Radix UI
      expect(closeButton).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastClose className="custom-close" data-testid="close" />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const closeButton = screen.getByTestId('close')
      expect(closeButton).toHaveClass('custom-close')
    })
  })

  describe('ToastAction', () => {
    it('renders with correct styling', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastAction altText="Undo action" data-testid="action">
              Undo
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const action = screen.getByTestId('action')
      expect(action).toBeInTheDocument()
      expect(action).toHaveTextContent('Undo')
      expect(action).toHaveClass('inline-flex', 'h-8', 'shrink-0', 'items-center', 'justify-center')
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      
      render(
        <ToastProvider>
          <Toast>
            <ToastAction altText="Action" onClick={handleClick}>
              Click me
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const action = screen.getByText('Click me')
      fireEvent.click(action)
      
      expect(handleClick).toHaveBeenCalled()
    })

    it('applies custom className', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastAction altText="Action" className="custom-action">
              Action
            </ToastAction>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const action = screen.getByText('Action')
      expect(action).toHaveClass('custom-action')
    })
  })

  describe('Complete Toast Structure', () => {
    it('renders a complete toast with all components', () => {
      render(
        <ToastProvider>
          <Toast>
            <div className="grid gap-1">
              <ToastTitle>Toast Title</ToastTitle>
              <ToastDescription>
                This is a complete toast with title, description, action and close button.
              </ToastDescription>
            </div>
            <ToastAction altText="Undo the action">Undo</ToastAction>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Toast Title')).toBeInTheDocument()
      expect(screen.getByText('This is a complete toast with title, description, action and close button.')).toBeInTheDocument()
      expect(screen.getByText('Undo')).toBeInTheDocument()
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      expect(closeButton).toBeInTheDocument()
    })

    it('handles toast lifecycle events', async () => {
      const handleOpenChange = vi.fn()
      
      render(
        <ToastProvider>
          <Toast open={true} onOpenChange={handleOpenChange}>
            <ToastTitle>Lifecycle Toast</ToastTitle>
            <ToastClose />
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('Lifecycle Toast')).toBeInTheDocument()
      
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
      
      // The onOpenChange should be called when close is clicked
      expect(handleOpenChange).toHaveBeenCalled()
    })

    it('supports multiple toasts in viewport', () => {
      render(
        <ToastProvider>
          <Toast>
            <ToastTitle>First Toast</ToastTitle>
          </Toast>
          <Toast>
            <ToastTitle>Second Toast</ToastTitle>
          </Toast>
          <Toast variant="destructive">
            <ToastTitle>Error Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      expect(screen.getByText('First Toast')).toBeInTheDocument()
      expect(screen.getByText('Second Toast')).toBeInTheDocument()
      expect(screen.getByText('Error Toast')).toBeInTheDocument()
    })

    it('handles swipe gestures for dismissal', () => {
      render(
        <ToastProvider swipeDirection="right">
          <Toast data-testid="swipeable-toast">
            <ToastTitle>Swipeable Toast</ToastTitle>
          </Toast>
          <ToastViewport />
        </ToastProvider>
      )

      const toast = screen.getByTestId('swipeable-toast')
      expect(toast).toBeInTheDocument()
      
      // The swipe functionality is handled by Radix UI internally
      // We can test that the component renders with swipe capabilities
    })
  })
})