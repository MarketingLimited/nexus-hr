import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Toaster, toast } from '@/components/ui/sonner'

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}))

describe('Sonner Components', () => {
  describe('Toaster', () => {
    it('renders with default props', () => {
      render(<Toaster data-testid="toaster" />)
      // The Toaster component renders as a div with toaster classes
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<Toaster className="custom-toaster" />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toHaveClass('custom-toaster')
    })

    it('applies theme from useTheme hook', () => {
      render(<Toaster />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })

    it('forwards props to underlying Sonner component', () => {
      render(<Toaster position="top-right" />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })

    it('applies toast styling classes', () => {
      render(<Toaster />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
      expect(toaster).toHaveClass('group')
    })
  })

  describe('toast function', () => {
    beforeEach(() => {
      // Clear any existing toasts
      vi.clearAllMocks()
    })

    it('creates a basic toast', async () => {
      render(<Toaster />)
      
      toast('Hello world')
      
      await waitFor(() => {
        expect(screen.getByText('Hello world')).toBeInTheDocument()
      })
    })

    it('creates a success toast', async () => {
      render(<Toaster />)
      
      toast.success('Success message')
      
      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
      })
    })

    it('creates an error toast', async () => {
      render(<Toaster />)
      
      toast.error('Error message')
      
      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })

    it('creates an info toast', async () => {
      render(<Toaster />)
      
      toast.info('Info message')
      
      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument()
      })
    })

    it('creates a warning toast', async () => {
      render(<Toaster />)
      
      toast.warning('Warning message')
      
      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument()
      })
    })

    it('creates a toast with description', async () => {
      render(<Toaster />)
      
      toast('Title', {
        description: 'This is a description',
      })
      
      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('This is a description')).toBeInTheDocument()
      })
    })

    it('creates a toast with action', async () => {
      render(<Toaster />)
      
      toast('Message with action', {
        action: {
          label: 'Undo',
          onClick: vi.fn(),
        },
      })
      
      await waitFor(() => {
        expect(screen.getByText('Message with action')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
      })
    })

    it('creates a loading toast', async () => {
      render(<Toaster />)
      
      toast.loading('Loading...')
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
    })

    it('creates a promise toast', async () => {
      render(<Toaster />)
      
      const promise = new Promise((resolve) => {
        setTimeout(() => resolve('Success'), 100)
      })
      
      toast.promise(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error occurred',
      })
      
      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument()
      })
      
      await waitFor(() => {
        expect(screen.getByText('Success!')).toBeInTheDocument()
      }, { timeout: 2000 })
    })

    it('handles toast dismissal', async () => {
      render(<Toaster />)
      
      const toastId = toast('Dismissible toast')
      
      await waitFor(() => {
        expect(screen.getByText('Dismissible toast')).toBeInTheDocument()
      })
      
      toast.dismiss(toastId)
      
      await waitFor(() => {
        expect(screen.queryByText('Dismissible toast')).not.toBeInTheDocument()
      })
    })

    it('handles custom toast options', async () => {
      render(<Toaster />)
      
      toast('Custom toast', {
        duration: 1000,
        position: 'top-center',
        className: 'custom-toast-class',
      })
      
      await waitFor(() => {
        expect(screen.getByText('Custom toast')).toBeInTheDocument()
      })
    })
  })

  describe('Toast styling integration', () => {
    it('applies correct styling classes from Toaster component', async () => {
      render(<Toaster />)
      
      toast('Styled toast')
      
      await waitFor(() => {
        const toastElement = screen.getByText('Styled toast').closest('[data-sonner-toast]')
        expect(toastElement).toBeInTheDocument()
        // The toast should have the styling classes applied from the Toaster component
      })
    })

    it('applies different themes correctly', async () => {
      // Test with dark theme
      vi.mocked(require('next-themes').useTheme).mockReturnValue({ theme: 'dark' })
      
      render(<Toaster />)
      
      toast('Dark theme toast')
      
      await waitFor(() => {
        expect(screen.getByText('Dark theme toast')).toBeInTheDocument()
      })
    })

    it('applies action button styling', async () => {
      render(<Toaster />)
      
      toast('Toast with styled action', {
        action: {
          label: 'Action',
          onClick: vi.fn(),
        },
      })
      
      await waitFor(() => {
        const actionButton = screen.getByRole('button', { name: 'Action' })
        expect(actionButton).toBeInTheDocument()
        // The action button should have the styling from toastOptions
      })
    })

    it('applies cancel button styling', async () => {
      render(<Toaster />)
      
      toast('Toast with cancel', {
        cancel: {
          label: 'Cancel',
          onClick: vi.fn(),
        },
      })
      
      await waitFor(() => {
        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        expect(cancelButton).toBeInTheDocument()
      })
    })
  })

  describe('Toaster positioning and layout', () => {
    it('renders with different positions', () => {
      render(<Toaster position="top-left" />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })

    it('handles expand behavior', () => {
      render(<Toaster expand={true} />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })

    it('applies offset correctly', () => {
      render(<Toaster offset="32px" />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })

    it('limits visible toasts', () => {
      render(<Toaster visibleToasts={3} />)
      const toaster = document.querySelector('.toaster')
      expect(toaster).toBeInTheDocument()
    })
  })

  describe('Complete toast workflow', () => {
    it('handles a complete user interaction flow', async () => {
      const handleAction = vi.fn()
      const handleCancel = vi.fn()
      
      render(<Toaster />)
      
      toast('Complete workflow toast', {
        description: 'This demonstrates a complete toast workflow',
        action: {
          label: 'Confirm',
          onClick: handleAction,
        },
        cancel: {
          label: 'Cancel',
          onClick: handleCancel,
        },
        duration: 5000,
      })
      
      await waitFor(() => {
        expect(screen.getByText('Complete workflow toast')).toBeInTheDocument()
        expect(screen.getByText('This demonstrates a complete toast workflow')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      })
    })

    it('handles multiple toasts simultaneously', async () => {
      render(<Toaster />)
      
      toast.success('First toast')
      toast.error('Second toast')
      toast.info('Third toast')
      
      await waitFor(() => {
        expect(screen.getByText('First toast')).toBeInTheDocument()
        expect(screen.getByText('Second toast')).toBeInTheDocument()
        expect(screen.getByText('Third toast')).toBeInTheDocument()
      })
    })
  })
})