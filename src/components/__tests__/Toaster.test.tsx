import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}))

describe('Toaster', () => {
  const mockToasts = [
    {
      id: '1',
      title: 'Success',
      description: 'Your action was successful',
    },
    {
      id: '2',
      title: 'Error',
      description: 'Something went wrong',
      variant: 'destructive' as const,
    },
    {
      id: '3',
      title: 'Info',
      description: 'This is an informational message',
      action: <button>Undo</button>,
    },
  ]

  beforeEach(() => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })
  })

  it('renders without toasts', () => {
    render(<Toaster />)
    
    // Should render ToastProvider and ToastViewport even without toasts
    const viewport = screen.getByRole('region', { hidden: true })
    expect(viewport).toBeInTheDocument()
  })

  it('renders toasts from useToast hook', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: mockToasts,
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Your action was successful')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()
    expect(screen.getByText('This is an informational message')).toBeInTheDocument()
  })

  it('renders toast titles when provided', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Toast Title',
          description: 'Toast description',
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Toast Title')).toBeInTheDocument()
  })

  it('renders toast descriptions when provided', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          description: 'Toast description only',
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Toast description only')).toBeInTheDocument()
  })

  it('renders toast actions when provided', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Toast with action',
          action: <button>Action Button</button>,
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Toast with action')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
  })

  it('renders close buttons for all toasts', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'First toast',
        },
        {
          id: '2',
          title: 'Second toast',
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    // Each toast should have a close button
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    expect(closeButtons).toHaveLength(2)
  })

  it('applies correct variant styles', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'Default toast',
        },
        {
          id: '2',
          title: 'Destructive toast',
          variant: 'destructive' as const,
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Default toast')).toBeInTheDocument()
    expect(screen.getByText('Destructive toast')).toBeInTheDocument()
  })

  it('handles toasts without titles or descriptions', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          // No title or description
          action: <button>Only Action</button>,
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByRole('button', { name: 'Only Action' })).toBeInTheDocument()
  })

  it('renders multiple toasts correctly', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: mockToasts,
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    // All three toasts should be rendered
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Info')).toBeInTheDocument()

    // Should have close buttons for each toast
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    expect(closeButtons).toHaveLength(3)
  })

  it('updates when toasts change', async () => {
    const { rerender } = render(<Toaster />)

    // Initially no toasts
    expect(screen.queryByText('New toast')).not.toBeInTheDocument()

    // Update with new toast
    vi.mocked(useToast).mockReturnValue({
      toasts: [
        {
          id: '1',
          title: 'New toast',
          description: 'This is a new toast',
        },
      ],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    rerender(<Toaster />)

    await waitFor(() => {
      expect(screen.getByText('New toast')).toBeInTheDocument()
      expect(screen.getByText('This is a new toast')).toBeInTheDocument()
    })
  })

  it('handles empty toast array', () => {
    vi.mocked(useToast).mockReturnValue({
      toasts: [],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    // Should render viewport but no toast content
    const viewport = screen.getByRole('region', { hidden: true })
    expect(viewport).toBeInTheDocument()
    
    // No toast titles should be present
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
  })

  it('preserves toast properties correctly', () => {
    const complexToast = {
      id: 'complex',
      title: 'Complex Toast',
      description: 'This toast has all properties',
      variant: 'destructive' as const,
      action: <button onClick={() => console.log('clicked')}>Complex Action</button>,
    }

    vi.mocked(useToast).mockReturnValue({
      toasts: [complexToast],
      toast: vi.fn(),
      dismiss: vi.fn(),
    })

    render(<Toaster />)

    expect(screen.getByText('Complex Toast')).toBeInTheDocument()
    expect(screen.getByText('This toast has all properties')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Complex Action' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
  })
})