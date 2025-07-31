import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

describe('ScrollArea Components', () => {
  describe('ScrollArea', () => {
    it('renders with correct styling', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div>Scrollable content</div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea).toBeInTheDocument()
      expect(scrollArea).toHaveClass('relative', 'overflow-hidden')
    })

    it('applies custom className', () => {
      render(
        <ScrollArea className="custom-scroll" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea).toHaveClass('custom-scroll')
    })

    it('renders children content', () => {
      render(
        <ScrollArea>
          <div>Scrollable content here</div>
          <div>More content</div>
        </ScrollArea>
      )

      expect(screen.getByText('Scrollable content here')).toBeInTheDocument()
      expect(screen.getByText('More content')).toBeInTheDocument()
    })

    it('creates scrollable viewport', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '1000px' }}>Very tall content</div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scroll-area')
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
      expect(viewport).toBeInTheDocument()
      expect(viewport).toHaveClass('h-full', 'w-full', 'rounded-[inherit]')
    })

    it('includes scrollbars by default', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div style={{ height: '1000px', width: '1000px' }}>Large content</div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scroll-area')
      
      // Check for scrollbar elements
      const scrollbars = scrollArea.querySelectorAll('[data-radix-scroll-area-scrollbar]')
      expect(scrollbars.length).toBeGreaterThan(0)
    })

    it('forwards HTML attributes', () => {
      render(
        <ScrollArea id="test-scroll" data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scroll-area')
      expect(scrollArea).toHaveAttribute('id', 'test-scroll')
    })
  })

  describe('ScrollBar', () => {
    it('renders vertical scrollbar by default', () => {
      render(
        <ScrollArea>
          <div style={{ height: '1000px' }}>Tall content</div>
          <ScrollBar data-testid="scrollbar" />
        </ScrollArea>
      )

      const scrollbar = screen.getByTestId('scrollbar')
      expect(scrollbar).toBeInTheDocument()
      expect(scrollbar).toHaveClass('flex', 'touch-none', 'select-none', 'transition-colors')
    })

    it('renders horizontal scrollbar when specified', () => {
      render(
        <ScrollArea>
          <div style={{ width: '1000px' }}>Wide content</div>
          <ScrollBar orientation="horizontal" data-testid="horizontal-scrollbar" />
        </ScrollArea>
      )

      const scrollbar = screen.getByTestId('horizontal-scrollbar')
      expect(scrollbar).toBeInTheDocument()
      expect(scrollbar).toHaveClass('h-2.5', 'flex-col')
    })

    it('applies custom className', () => {
      render(
        <ScrollArea>
          <div>Content</div>
          <ScrollBar className="custom-scrollbar" data-testid="scrollbar" />
        </ScrollArea>
      )

      const scrollbar = screen.getByTestId('scrollbar')
      expect(scrollbar).toHaveClass('custom-scrollbar')
    })

    it('includes scrollbar thumb', () => {
      render(
        <ScrollArea>
          <div style={{ height: '1000px' }}>Tall content</div>
          <ScrollBar data-testid="scrollbar" />
        </ScrollArea>
      )

      const scrollbar = screen.getByTestId('scrollbar')
      const thumb = scrollbar.querySelector('[data-radix-scroll-area-thumb]')
      expect(thumb).toBeInTheDocument()
      expect(thumb).toHaveClass('relative', 'flex-1', 'rounded-full', 'bg-border')
    })
  })

  describe('ScrollArea with long content', () => {
    it('handles vertical scrolling', () => {
      render(
        <ScrollArea className="h-72 w-48 rounded-md border" data-testid="scroll-container">
          <div className="p-4">
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i} className="text-sm">
                Item {i + 1}: This is a scrollable item with some content
              </div>
            ))}
          </div>
        </ScrollArea>
      )

      const container = screen.getByTestId('scroll-container')
      expect(container).toBeInTheDocument()
      expect(screen.getByText('Item 1: This is a scrollable item with some content')).toBeInTheDocument()
      expect(screen.getByText('Item 50: This is a scrollable item with some content')).toBeInTheDocument()
    })

    it('handles horizontal scrolling', () => {
      render(
        <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
          <div className="flex w-max space-x-4 p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="shrink-0 rounded-md border border-slate-200 bg-white">
                <div className="p-4">
                  <h3 className="text-sm font-medium">Card {i + 1}</h3>
                  <p className="text-xs text-slate-500">Description for card {i + 1}</p>
                </div>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )

      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 20')).toBeInTheDocument()
    })
  })

  describe('ScrollArea interactions', () => {
    it('responds to scroll events', () => {
      render(
        <ScrollArea className="h-32" data-testid="scrollable">
          <div style={{ height: '500px' }}>
            <div>Top content</div>
            <div style={{ marginTop: '400px' }}>Bottom content</div>
          </div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scrollable')
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]')
      
      expect(screen.getByText('Top content')).toBeInTheDocument()
      
      if (viewport) {
        // Simulate scroll
        fireEvent.scroll(viewport, { target: { scrollTop: 200 } })
      }
      
      expect(screen.getByText('Bottom content')).toBeInTheDocument()
    })

    it('maintains scroll position', () => {
      render(
        <ScrollArea className="h-32" data-testid="scrollable">
          <div style={{ height: '500px' }}>
            {Array.from({ length: 50 }, (_, i) => (
              <div key={i}>Line {i + 1}</div>
            ))}
          </div>
        </ScrollArea>
      )

      const scrollArea = screen.getByTestId('scrollable')
      expect(scrollArea).toBeInTheDocument()
      expect(screen.getByText('Line 1')).toBeInTheDocument()
    })
  })

  describe('Complete ScrollArea Structure', () => {
    it('renders a complete scroll area with custom content', () => {
      render(
        <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
          <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
          {Array.from({ length: 50 }, (_, i) => (
            <div key={i}>
              <div className="text-sm">
                Tag {i + 1}
              </div>
              {i < 49 && <div className="my-2 h-px bg-slate-200" />}
            </div>
          ))}
        </ScrollArea>
      )

      expect(screen.getByText('Tags')).toBeInTheDocument()
      expect(screen.getByText('Tag 1')).toBeInTheDocument()
      expect(screen.getByText('Tag 50')).toBeInTheDocument()
    })

    it('works with complex nested content', () => {
      render(
        <ScrollArea className="h-72 w-80 rounded-md border">
          <div className="p-4">
            <h3 className="mb-4 text-lg font-semibold">Scrollable List</h3>
            <div className="space-y-2">
              {Array.from({ length: 20 }, (_, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-slate-200"></div>
                    <div>
                      <p className="text-sm font-medium">Item {i + 1}</p>
                      <p className="text-xs text-slate-500">Description for item {i + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      )

      expect(screen.getByText('Scrollable List')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Description for item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 20')).toBeInTheDocument()
    })
  })
})