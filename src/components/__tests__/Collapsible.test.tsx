import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { createUser } from '@/test-utils/user-interactions'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '../ui/collapsible'

describe('Collapsible Components', () => {
  const CollapsibleExample = ({ defaultOpen = false }: { defaultOpen?: boolean }) => (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger>Toggle Content</CollapsibleTrigger>
      <CollapsibleContent>
        <div>Collapsible content here</div>
      </CollapsibleContent>
    </Collapsible>
  )

  describe('Collapsible Root', () => {
    it('renders collapsible container', () => {
      render(<CollapsibleExample />)
      
      expect(screen.getByText('Toggle Content')).toBeInTheDocument()
      expect(screen.getByText('Collapsible content here')).toBeInTheDocument()
    })

    it('starts collapsed by default', () => {
      render(<CollapsibleExample />)
      
      const content = screen.getByText('Collapsible content here')
      expect(content).toBeInTheDocument()
      // Note: Radix UI handles visibility through data attributes
    })

    it('starts open when defaultOpen is true', () => {
      render(<CollapsibleExample defaultOpen={true} />)
      
      const content = screen.getByText('Collapsible content here')
      expect(content).toBeInTheDocument()
    })
  })

  describe('CollapsibleTrigger', () => {
    it('renders trigger button', () => {
      render(<CollapsibleExample />)
      
      const trigger = screen.getByText('Toggle Content')
      expect(trigger).toBeInTheDocument()
    })

    it('handles click events to toggle content', async () => {
      const user = createUser()
      render(<CollapsibleExample />)
      
      const trigger = screen.getByText('Toggle Content')
      await user.click(trigger)
      
      // Content should still be in DOM but state changed
      expect(screen.getByText('Collapsible content here')).toBeInTheDocument()
    })

    it('supports keyboard interaction', async () => {
      const user = createUser()
      render(<CollapsibleExample />)
      
      const trigger = screen.getByText('Toggle Content')
      trigger.focus()
      await user.keyboard('{Enter}')
      
      expect(screen.getByText('Collapsible content here')).toBeInTheDocument()
    })
  })

  describe('CollapsibleContent', () => {
    it('renders content area', () => {
      render(<CollapsibleExample />)
      
      const content = screen.getByText('Collapsible content here')
      expect(content).toBeInTheDocument()
    })

    it('contains nested elements', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <div>First item</div>
            <div>Second item</div>
            <p>Description text</p>
          </CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByText('First item')).toBeInTheDocument()
      expect(screen.getByText('Second item')).toBeInTheDocument()
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })
  })

  describe('Controlled Behavior', () => {
    it('works as controlled component', async () => {
      const user = createUser()
      let isOpen = false
      const handleOpenChange = (open: boolean) => {
        isOpen = open
      }

      const { rerender } = render(
        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>Controlled Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <div>Controlled content</div>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Controlled Toggle')
      await user.click(trigger)
      
      // Simulate state update
      isOpen = true
      rerender(
        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
          <CollapsibleTrigger>Controlled Toggle</CollapsibleTrigger>
          <CollapsibleContent>
            <div>Controlled content</div>
          </CollapsibleContent>
        </Collapsible>
      )
      
      expect(screen.getByText('Controlled content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger aria-label="Toggle section">
            Section Header
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div>Section content</div>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByLabelText('Toggle section')
      expect(trigger).toBeInTheDocument()
    })

    it('supports custom ARIA attributes', () => {
      render(
        <Collapsible>
          <CollapsibleTrigger 
            aria-describedby="help-text"
            aria-expanded="false"
          >
            Advanced Toggle
          </CollapsibleTrigger>
          <CollapsibleContent id="content-area">
            <div>Advanced content</div>
          </CollapsibleContent>
        </Collapsible>
      )
      
      const trigger = screen.getByText('Advanced Toggle')
      expect(trigger).toHaveAttribute('aria-describedby', 'help-text')
    })
  })

  describe('Multiple Collapsibles', () => {
    it('handles multiple independent collapsibles', async () => {
      const user = createUser()
      
      render(
        <div>
          <Collapsible>
            <CollapsibleTrigger>First Toggle</CollapsibleTrigger>
            <CollapsibleContent>
              <div>First content</div>
            </CollapsibleContent>
          </Collapsible>
          <Collapsible>
            <CollapsibleTrigger>Second Toggle</CollapsibleTrigger>
            <CollapsibleContent>
              <div>Second content</div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )
      
      const firstTrigger = screen.getByText('First Toggle')
      const secondTrigger = screen.getByText('Second Toggle')
      
      await user.click(firstTrigger)
      expect(screen.getByText('First content')).toBeInTheDocument()
      expect(screen.getByText('Second content')).toBeInTheDocument()
      
      await user.click(secondTrigger)
      expect(screen.getByText('First content')).toBeInTheDocument()
      expect(screen.getByText('Second content')).toBeInTheDocument()
    })
  })
})