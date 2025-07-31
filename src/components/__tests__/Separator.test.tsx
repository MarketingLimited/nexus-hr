import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Separator } from '@/components/ui/separator'

describe('Separator', () => {
  it('renders with default horizontal orientation', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('shrink-0', 'bg-border', 'h-[1px]', 'w-full')
  })

  it('renders with vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="vertical-separator" />)
    const separator = screen.getByTestId('vertical-separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveClass('h-full', 'w-[1px]')
  })

  it('has proper role and accessibility', () => {
    render(<Separator />)
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal')
  })

  it('sets correct aria-orientation for vertical', () => {
    render(<Separator orientation="vertical" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('is decorative by default', () => {
    render(<Separator data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('can be non-decorative', () => {
    render(<Separator decorative={false} data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Separator className="custom-separator" />)
    const separator = screen.getByRole('separator')
    expect(separator).toHaveClass('custom-separator')
  })

  it('forwards HTML attributes', () => {
    render(<Separator id="test-separator" data-testid="separator" />)
    const separator = screen.getByTestId('separator')
    expect(separator).toHaveAttribute('id', 'test-separator')
  })

  describe('Separator in different contexts', () => {
    it('works as a menu separator', () => {
      render(
        <div>
          <div>Menu Item 1</div>
          <Separator className="my-2" />
          <div>Menu Item 2</div>
        </div>
      )

      expect(screen.getByText('Menu Item 1')).toBeInTheDocument()
      expect(screen.getByText('Menu Item 2')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('works as a content divider', () => {
      render(
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium leading-none">Section 1</h4>
            <p className="text-sm text-muted-foreground">
              Content for the first section.
            </p>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium leading-none">Section 2</h4>
            <p className="text-sm text-muted-foreground">
              Content for the second section.
            </p>
          </div>
        </div>
      )

      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Section 2')).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })

    it('works in sidebar layouts', () => {
      render(
        <div className="flex h-5 items-center space-x-4 text-sm">
          <div>Blog</div>
          <Separator orientation="vertical" />
          <div>Docs</div>
          <Separator orientation="vertical" />
          <div>Source</div>
        </div>
      )

      expect(screen.getByText('Blog')).toBeInTheDocument()
      expect(screen.getByText('Docs')).toBeInTheDocument()
      expect(screen.getByText('Source')).toBeInTheDocument()
      
      const separators = screen.getAllByRole('separator')
      expect(separators).toHaveLength(2)
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('aria-orientation', 'vertical')
      })
    })

    it('works in card components', () => {
      render(
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-2xl font-semibold leading-none tracking-tight">
              Card Title
            </h3>
            <p className="text-sm text-muted-foreground">
              Card description
            </p>
          </div>
          <div className="p-6 pt-0">
            <p>Card content goes here</p>
          </div>
          <Separator />
          <div className="flex items-center p-6 pt-0">
            <button>Action</button>
          </div>
        </div>
      )

      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
      expect(screen.getByRole('separator')).toBeInTheDocument()
    })
  })

  describe('Separator styling variations', () => {
    it('can have custom spacing', () => {
      render(
        <div>
          <div>Content above</div>
          <Separator className="my-4" data-testid="spaced-separator" />
          <div>Content below</div>
        </div>
      )

      const separator = screen.getByTestId('spaced-separator')
      expect(separator).toHaveClass('my-4')
    })

    it('can have custom colors', () => {
      render(
        <Separator className="bg-red-500" data-testid="colored-separator" />
      )

      const separator = screen.getByTestId('colored-separator')
      expect(separator).toHaveClass('bg-red-500')
    })

    it('can have custom thickness', () => {
      render(
        <div>
          <Separator className="h-[2px]" data-testid="thick-horizontal" />
          <Separator orientation="vertical" className="w-[2px]" data-testid="thick-vertical" />
        </div>
      )

      const horizontalSeparator = screen.getByTestId('thick-horizontal')
      const verticalSeparator = screen.getByTestId('thick-vertical')
      
      expect(horizontalSeparator).toHaveClass('h-[2px]')
      expect(verticalSeparator).toHaveClass('w-[2px]')
    })
  })

  describe('Separator accessibility', () => {
    it('provides proper semantic separation', () => {
      render(
        <div>
          <section aria-labelledby="section1">
            <h2 id="section1">First Section</h2>
            <p>First section content</p>
          </section>
          <Separator />
          <section aria-labelledby="section2">
            <h2 id="section2">Second Section</h2>
            <p>Second section content</p>
          </section>
        </div>
      )

      const separator = screen.getByRole('separator')
      expect(separator).toBeInTheDocument()
      expect(screen.getByText('First Section')).toBeInTheDocument()
      expect(screen.getByText('Second Section')).toBeInTheDocument()
    })

    it('works with screen readers', () => {
      render(
        <div>
          <div>Item 1</div>
          <Separator role="separator" aria-label="Divider between items" />
          <div>Item 2</div>
        </div>
      )

      const separator = screen.getByRole('separator')
      expect(separator).toHaveAttribute('aria-label', 'Divider between items')
    })
  })
})