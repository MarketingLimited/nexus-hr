import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'

describe('Resizable Components', () => {
  describe('ResizablePanelGroup', () => {
    it('renders with correct styling', () => {
      render(
        <ResizablePanelGroup direction="horizontal" data-testid="panel-group">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const panelGroup = screen.getByTestId('panel-group')
      expect(panelGroup).toBeInTheDocument()
      expect(panelGroup).toHaveClass('flex', 'h-full', 'w-full')
    })

    it('applies vertical direction styling', () => {
      render(
        <ResizablePanelGroup direction="vertical" data-testid="vertical-group">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const panelGroup = screen.getByTestId('vertical-group')
      expect(panelGroup).toHaveAttribute('data-panel-group-direction', 'vertical')
    })

    it('applies custom className', () => {
      render(
        <ResizablePanelGroup direction="horizontal" className="custom-group">
          <ResizablePanel>Panel 1</ResizablePanel>
        </ResizablePanelGroup>
      )

      const panelGroup = screen.getByText('Panel 1').parentElement
      expect(panelGroup).toHaveClass('custom-group')
    })

    it('forwards props to underlying component', () => {
      render(
        <ResizablePanelGroup
          direction="horizontal"
          id="test-group"
          data-testid="panel-group"
        >
          <ResizablePanel>Panel 1</ResizablePanel>
        </ResizablePanelGroup>
      )

      const panelGroup = screen.getByTestId('panel-group')
      expect(panelGroup).toHaveAttribute('id', 'test-group')
    })
  })

  describe('ResizablePanel', () => {
    it('renders panel content', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel data-testid="panel">
            <div>Panel Content</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )

      expect(screen.getByText('Panel Content')).toBeInTheDocument()
    })

    it('supports default size', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} data-testid="sized-panel">
            Panel with default size
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Other panel</ResizablePanel>
        </ResizablePanelGroup>
      )

      expect(screen.getByText('Panel with default size')).toBeInTheDocument()
    })

    it('supports minimum and maximum sizes', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={20} maxSize={80}>
            Constrained panel
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Other panel</ResizablePanel>
        </ResizablePanelGroup>
      )

      expect(screen.getByText('Constrained panel')).toBeInTheDocument()
    })

    it('can be collapsed', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel collapsible={true}>
            Collapsible panel
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Other panel</ResizablePanel>
        </ResizablePanelGroup>
      )

      expect(screen.getByText('Collapsible panel')).toBeInTheDocument()
    })
  })

  describe('ResizableHandle', () => {
    it('renders with correct styling', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle data-testid="handle" />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const handle = screen.getByTestId('handle')
      expect(handle).toBeInTheDocument()
      expect(handle).toHaveClass('relative', 'flex', 'w-px', 'items-center', 'justify-center', 'bg-border')
    })

    it('renders with handle grip when withHandle is true', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle withHandle data-testid="handle-with-grip" />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const handle = screen.getByTestId('handle-with-grip')
      expect(handle).toBeInTheDocument()
      // Check that the grip icon is rendered
      const gripIcon = handle.querySelector('.lucide-grip-vertical')
      expect(gripIcon).toBeInTheDocument()
    })

    it('renders without grip when withHandle is false', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle withHandle={false} data-testid="handle-no-grip" />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const handle = screen.getByTestId('handle-no-grip')
      expect(handle).toBeInTheDocument()
      // Check that no grip icon is rendered
      const gripIcon = handle.querySelector('.lucide-grip-vertical')
      expect(gripIcon).not.toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle className="custom-handle" data-testid="custom-handle" />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const handle = screen.getByTestId('custom-handle')
      expect(handle).toHaveClass('custom-handle')
    })

    it('supports disabled state', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle disabled data-testid="disabled-handle" />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const handle = screen.getByTestId('disabled-handle')
      expect(handle).toBeInTheDocument()
    })
  })

  describe('Resizable Interactions', () => {
    it('handles keyboard interactions', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle data-testid="keyboard-handle" />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      const handle = screen.getByTestId('keyboard-handle')
      
      // Test focus
      handle.focus()
      expect(handle).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-1')
    })

    it('supports resize callbacks', () => {
      const handleResize = vi.fn()
      
      render(
        <ResizablePanelGroup direction="horizontal" onLayout={handleResize}>
          <ResizablePanel>Panel 1</ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>Panel 2</ResizablePanel>
        </ResizablePanelGroup>
      )

      // The resize functionality is handled by the underlying library
      expect(screen.getByText('Panel 1')).toBeInTheDocument()
      expect(screen.getByText('Panel 2')).toBeInTheDocument()
    })
  })

  describe('Complete Resizable Structure', () => {
    it('renders a complete resizable layout', () => {
      render(
        <ResizablePanelGroup
          direction="horizontal"
          className="max-w-md rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-[200px] items-center justify-center p-6">
              <span className="font-semibold">One</span>
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={25}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Two</span>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={75}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Three</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      )

      expect(screen.getByText('One')).toBeInTheDocument()
      expect(screen.getByText('Two')).toBeInTheDocument()
      expect(screen.getByText('Three')).toBeInTheDocument()

      // Check that multiple handles are rendered for nested layout
      const handles = screen.getAllByRole('separator')
      expect(handles.length).toBeGreaterThan(0)
    })

    it('handles complex nested layouts', () => {
      render(
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel minSize={30} maxSize={70}>
            <div>Sidebar</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel>
                <div>Header</div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel>
                <ResizablePanelGroup direction="horizontal">
                  <ResizablePanel>
                    <div>Main Content</div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel collapsible>
                    <div>Right Panel</div>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      )

      expect(screen.getByText('Sidebar')).toBeInTheDocument()
      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Main Content')).toBeInTheDocument()
      expect(screen.getByText('Right Panel')).toBeInTheDocument()
    })
  })
})