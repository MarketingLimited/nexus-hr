import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { createUser } from '@/test-utils/user-interactions'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card'

describe('HoverCard Components', () => {
  const HoverCardExample = () => (
    <HoverCard>
      <HoverCardTrigger>Hover me</HoverCardTrigger>
      <HoverCardContent>
        <div>
          <h4>Hover Content</h4>
          <p>This is the hover card content</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )

  describe('HoverCard Root', () => {
    it('renders hover card system', () => {
      render(<HoverCardExample />)
      
      expect(screen.getByText('Hover me')).toBeInTheDocument()
    })
  })

  describe('HoverCardTrigger', () => {
    it('renders trigger element', () => {
      render(<HoverCardExample />)
      
      const trigger = screen.getByText('Hover me')
      expect(trigger).toBeInTheDocument()
    })

    it('supports custom trigger content', () => {
      render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <button>Custom Trigger</button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div>Content</div>
          </HoverCardContent>
        </HoverCard>
      )
      
      const trigger = screen.getByRole('button', { name: 'Custom Trigger' })
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('HoverCardContent', () => {
    it('renders content with default styling', async () => {
      const user = createUser()
      render(<HoverCardExample />)
      
      const trigger = screen.getByText('Hover me')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Hover Content')).toBeInTheDocument()
      })
      
      const content = screen.getByText('Hover Content').closest('[role="dialog"]')
      expect(content).toHaveClass(
        'z-50',
        'w-64',
        'rounded-md',
        'border',
        'bg-popover',
        'p-4',
        'text-popover-foreground',
        'shadow-md'
      )
    })

    it('applies custom className', async () => {
      const user = createUser()
      render(
        <HoverCard>
          <HoverCardTrigger>Hover</HoverCardTrigger>
          <HoverCardContent className="custom-content">
            <div>Custom styled content</div>
          </HoverCardContent>
        </HoverCard>
      )
      
      const trigger = screen.getByText('Hover')
      await user.hover(trigger)
      
      await waitFor(() => {
        const content = screen.getByText('Custom styled content').closest('[role="dialog"]')
        expect(content).toHaveClass('custom-content')
      })
    })

    it('supports different alignments', async () => {
      const user = createUser()
      render(
        <HoverCard>
          <HoverCardTrigger>Hover</HoverCardTrigger>
          <HoverCardContent align="start">
            <div>Aligned content</div>
          </HoverCardContent>
        </HoverCard>
      )
      
      const trigger = screen.getByText('Hover')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Aligned content')).toBeInTheDocument()
      })
    })

    it('supports custom side offset', async () => {
      const user = createUser()
      render(
        <HoverCard>
          <HoverCardTrigger>Hover</HoverCardTrigger>
          <HoverCardContent sideOffset={10}>
            <div>Offset content</div>
          </HoverCardContent>
        </HoverCard>
      )
      
      const trigger = screen.getByText('Hover')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Offset content')).toBeInTheDocument()
      })
    })
  })

  describe('Interaction Behavior', () => {
    it('shows content on hover', async () => {
      const user = createUser()
      render(<HoverCardExample />)
      
      const trigger = screen.getByText('Hover me')
      
      // Content should not be visible initially
      expect(screen.queryByText('Hover Content')).not.toBeInTheDocument()
      
      // Hover to show content
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('Hover Content')).toBeInTheDocument()
      })
    })

    it('hides content when hover ends', async () => {
      const user = createUser()
      render(
        <div>
          <HoverCardExample />
          <div data-testid="outside">Outside element</div>
        </div>
      )
      
      const trigger = screen.getByText('Hover me')
      const outside = screen.getByTestId('outside')
      
      // Show content
      await user.hover(trigger)
      await waitFor(() => {
        expect(screen.getByText('Hover Content')).toBeInTheDocument()
      })
      
      // Move away to hide content
      await user.hover(outside)
      await waitFor(() => {
        expect(screen.queryByText('Hover Content')).not.toBeInTheDocument()
      })
    })
  })

  describe('Content Structure', () => {
    it('renders complex content', async () => {
      const user = createUser()
      render(
        <HoverCard>
          <HoverCardTrigger>Profile</HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <img src="/avatar.jpg" alt="User avatar" className="w-12 h-12 rounded-full" />
              <div>
                <h4 className="font-semibold">John Doe</h4>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
                <p className="text-sm">Member since 2023</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )
      
      const trigger = screen.getByText('Profile')
      await user.hover(trigger)
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('Software Engineer')).toBeInTheDocument()
        expect(screen.getByText('Member since 2023')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'User avatar' })).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      const user = createUser()
      render(<HoverCardExample />)
      
      const trigger = screen.getByText('Hover me')
      await user.hover(trigger)
      
      await waitFor(() => {
        const content = screen.getByText('Hover Content').closest('[role="dialog"]')
        expect(content).toBeInTheDocument()
        expect(content).toHaveAttribute('role', 'dialog')
      })
    })

    it('supports keyboard navigation', async () => {
      const user = createUser()
      render(<HoverCardExample />)
      
      const trigger = screen.getByText('Hover me')
      trigger.focus()
      
      await waitFor(() => {
        expect(screen.getByText('Hover Content')).toBeInTheDocument()
      })
    })
  })

  describe('Animation Classes', () => {
    it('applies animation classes', async () => {
      const user = createUser()
      render(<HoverCardExample />)
      
      const trigger = screen.getByText('Hover me')
      await user.hover(trigger)
      
      await waitFor(() => {
        const content = screen.getByText('Hover Content').closest('[role="dialog"]')
        expect(content).toHaveClass(
          'data-[state=open]:animate-in',
          'data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0',
          'data-[state=open]:fade-in-0'
        )
      })
    })
  })
})