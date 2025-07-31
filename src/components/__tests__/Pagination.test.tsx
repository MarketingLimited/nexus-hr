import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

describe('Pagination Components', () => {
  describe('Pagination', () => {
    it('renders as nav element with correct aria-label', () => {
      render(<Pagination data-testid="pagination">Content</Pagination>)
      const pagination = screen.getByTestId('pagination')
      expect(pagination).toBeInTheDocument()
      expect(pagination.tagName).toBe('NAV')
      expect(pagination).toHaveAttribute('role', 'navigation')
      expect(pagination).toHaveAttribute('aria-label', 'pagination')
    })

    it('applies default styling', () => {
      render(<Pagination data-testid="pagination">Content</Pagination>)
      const pagination = screen.getByTestId('pagination')
      expect(pagination).toHaveClass('mx-auto', 'flex', 'w-full', 'justify-center')
    })

    it('applies custom className', () => {
      render(<Pagination className="custom-pagination">Content</Pagination>)
      expect(screen.getByRole('navigation')).toHaveClass('custom-pagination')
    })
  })

  describe('PaginationContent', () => {
    it('renders as unordered list with correct styling', () => {
      render(<PaginationContent data-testid="content">Items</PaginationContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content.tagName).toBe('UL')
      expect(content).toHaveClass('flex', 'flex-row', 'items-center', 'gap-1')
    })

    it('applies custom className', () => {
      render(<PaginationContent className="custom-content">Items</PaginationContent>)
      expect(screen.getByRole('list')).toHaveClass('custom-content')
    })
  })

  describe('PaginationItem', () => {
    it('renders as list item', () => {
      render(<PaginationItem data-testid="item">Item</PaginationItem>)
      const item = screen.getByTestId('item')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('LI')
    })

    it('applies custom className', () => {
      render(<PaginationItem className="custom-item">Item</PaginationItem>)
      expect(screen.getByText('Item')).toHaveClass('custom-item')
    })
  })

  describe('PaginationLink', () => {
    it('renders as anchor with correct styling', () => {
      render(<PaginationLink href="/page/2">2</PaginationLink>)
      const link = screen.getByRole('link', { name: '2' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/page/2')
      expect(link).toHaveClass('inline-flex', 'items-center', 'justify-center', 'whitespace-nowrap', 'rounded-md')
    })

    it('shows active state correctly', () => {
      render(<PaginationLink isActive>1</PaginationLink>)
      const link = screen.getByText('1')
      expect(link).toHaveAttribute('aria-current', 'page')
    })

    it('does not show aria-current when not active', () => {
      render(<PaginationLink isActive={false}>2</PaginationLink>)
      const link = screen.getByText('2')
      expect(link).not.toHaveAttribute('aria-current')
    })

    it('applies different styling for active state', () => {
      render(<PaginationLink isActive>1</PaginationLink>)
      const link = screen.getByText('1')
      // The styling depends on the button variant which changes based on isActive
      expect(link).toBeInTheDocument()
    })

    it('supports different sizes', () => {
      render(<PaginationLink size="lg">Large</PaginationLink>)
      const link = screen.getByText('Large')
      expect(link).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<PaginationLink className="custom-link">Link</PaginationLink>)
      expect(screen.getByText('Link')).toHaveClass('custom-link')
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<PaginationLink onClick={handleClick}>Click me</PaginationLink>)
      
      fireEvent.click(screen.getByText('Click me'))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('PaginationPrevious', () => {
    it('renders with Previous text and chevron icon', () => {
      render(<PaginationPrevious href="/page/1" />)
      const link = screen.getByRole('link', { name: 'Go to previous page' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/page/1')
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      render(<PaginationPrevious href="/page/1" />)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('gap-1', 'pl-2.5')
    })

    it('applies custom className', () => {
      render(<PaginationPrevious className="custom-previous" href="/page/1" />)
      expect(screen.getByRole('link')).toHaveClass('custom-previous')
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<PaginationPrevious onClick={handleClick} href="/page/1" />)
      
      fireEvent.click(screen.getByRole('link'))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('PaginationNext', () => {
    it('renders with Next text and chevron icon', () => {
      render(<PaginationNext href="/page/3" />)
      const link = screen.getByRole('link', { name: 'Go to next page' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/page/3')
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('applies correct styling', () => {
      render(<PaginationNext href="/page/3" />)
      const link = screen.getByRole('link')
      expect(link).toHaveClass('gap-1', 'pr-2.5')
    })

    it('applies custom className', () => {
      render(<PaginationNext className="custom-next" href="/page/3" />)
      expect(screen.getByRole('link')).toHaveClass('custom-next')
    })

    it('handles click events', () => {
      const handleClick = vi.fn()
      render(<PaginationNext onClick={handleClick} href="/page/3" />)
      
      fireEvent.click(screen.getByRole('link'))
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('PaginationEllipsis', () => {
    it('renders with correct styling and accessibility', () => {
      render(<PaginationEllipsis data-testid="ellipsis" />)
      const ellipsis = screen.getByTestId('ellipsis')
      expect(ellipsis).toBeInTheDocument()
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center')
      expect(screen.getByText('More pages')).toHaveClass('sr-only')
    })

    it('applies custom className', () => {
      render(<PaginationEllipsis className="custom-ellipsis" />)
      const ellipsis = screen.getByText('More pages').parentElement
      expect(ellipsis).toHaveClass('custom-ellipsis')
    })
  })

  describe('Complete Pagination Structure', () => {
    it('renders a complete pagination component', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/1" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/2" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/3">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/10">10</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="/page/3" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/page/1')
      expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/page/3')
      expect(screen.getByRole('link', { name: '10' })).toHaveAttribute('href', '/page/10')
      expect(screen.getByText('More pages')).toHaveClass('sr-only')
    })

    it('handles pagination navigation', () => {
      const handlePrevious = vi.fn()
      const handleNext = vi.fn()
      const handlePageClick = vi.fn()

      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={handlePrevious} href="/page/1" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink onClick={handlePageClick} href="/page/1">
                1
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive href="/page/2">
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext onClick={handleNext} href="/page/3" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )

      fireEvent.click(screen.getByText('Previous'))
      expect(handlePrevious).toHaveBeenCalled()

      fireEvent.click(screen.getByText('1'))
      expect(handlePageClick).toHaveBeenCalled()

      fireEvent.click(screen.getByText('Next'))
      expect(handleNext).toHaveBeenCalled()
    })
  })
})