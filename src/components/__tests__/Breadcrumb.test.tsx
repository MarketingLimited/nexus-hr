import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb'

describe('Breadcrumb Components', () => {
  describe('Breadcrumb', () => {
    it('renders as nav element with correct aria-label', () => {
      render(<Breadcrumb data-testid="breadcrumb">Content</Breadcrumb>)
      const breadcrumb = screen.getByTestId('breadcrumb')
      expect(breadcrumb).toBeInTheDocument()
      expect(breadcrumb.tagName).toBe('NAV')
      expect(breadcrumb).toHaveAttribute('aria-label', 'breadcrumb')
    })
  })

  describe('BreadcrumbList', () => {
    it('renders as ordered list with correct styling', () => {
      render(<BreadcrumbList data-testid="list">Items</BreadcrumbList>)
      const list = screen.getByTestId('list')
      expect(list).toBeInTheDocument()
      expect(list.tagName).toBe('OL')
      expect(list).toHaveClass('flex', 'flex-wrap', 'items-center', 'gap-1.5')
    })

    it('applies custom className', () => {
      render(<BreadcrumbList className="custom-list">Items</BreadcrumbList>)
      expect(screen.getByText('Items')).toHaveClass('custom-list')
    })
  })

  describe('BreadcrumbItem', () => {
    it('renders as list item with correct styling', () => {
      render(<BreadcrumbItem data-testid="item">Item</BreadcrumbItem>)
      const item = screen.getByTestId('item')
      expect(item).toBeInTheDocument()
      expect(item.tagName).toBe('LI')
      expect(item).toHaveClass('inline-flex', 'items-center', 'gap-1.5')
    })

    it('applies custom className', () => {
      render(<BreadcrumbItem className="custom-item">Item</BreadcrumbItem>)
      expect(screen.getByText('Item')).toHaveClass('custom-item')
    })
  })

  describe('BreadcrumbLink', () => {
    it('renders as anchor element with hover styling', () => {
      render(<BreadcrumbLink href="/test">Home</BreadcrumbLink>)
      const link = screen.getByRole('link', { name: 'Home' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('transition-colors', 'hover:text-foreground')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <BreadcrumbLink asChild>
          <button>Custom Button</button>
        </BreadcrumbLink>
      )
      
      const button = screen.getByRole('button', { name: 'Custom Button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('transition-colors')
    })

    it('applies custom className', () => {
      render(<BreadcrumbLink className="custom-link" href="/test">Link</BreadcrumbLink>)
      expect(screen.getByRole('link')).toHaveClass('custom-link')
    })
  })

  describe('BreadcrumbPage', () => {
    it('renders with correct accessibility attributes', () => {
      render(<BreadcrumbPage>Current Page</BreadcrumbPage>)
      const page = screen.getByText('Current Page')
      expect(page).toBeInTheDocument()
      expect(page).toHaveAttribute('role', 'link')
      expect(page).toHaveAttribute('aria-disabled', 'true')
      expect(page).toHaveAttribute('aria-current', 'page')
      expect(page).toHaveClass('font-normal', 'text-foreground')
    })

    it('applies custom className', () => {
      render(<BreadcrumbPage className="custom-page">Page</BreadcrumbPage>)
      expect(screen.getByText('Page')).toHaveClass('custom-page')
    })
  })

  describe('BreadcrumbSeparator', () => {
    it('renders with default chevron icon', () => {
      render(<BreadcrumbSeparator data-testid="separator" />)
      const separator = screen.getByTestId('separator')
      expect(separator).toBeInTheDocument()
      expect(separator).toHaveAttribute('role', 'presentation')
      expect(separator).toHaveAttribute('aria-hidden', 'true')
    })

    it('renders with custom separator', () => {
      render(<BreadcrumbSeparator data-testid="separator">/</BreadcrumbSeparator>)
      const separator = screen.getByTestId('separator')
      expect(separator).toHaveTextContent('/')
    })

    it('applies custom className', () => {
      render(<BreadcrumbSeparator className="custom-separator" />)
      const separator = screen.getByRole('presentation')
      expect(separator).toHaveClass('custom-separator')
    })
  })

  describe('BreadcrumbEllipsis', () => {
    it('renders with correct styling and accessibility', () => {
      render(<BreadcrumbEllipsis data-testid="ellipsis" />)
      const ellipsis = screen.getByTestId('ellipsis')
      expect(ellipsis).toBeInTheDocument()
      expect(ellipsis).toHaveAttribute('role', 'presentation')
      expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
      expect(ellipsis).toHaveClass('flex', 'h-9', 'w-9', 'items-center', 'justify-center')
      expect(screen.getByText('More')).toHaveClass('sr-only')
    })

    it('applies custom className', () => {
      render(<BreadcrumbEllipsis className="custom-ellipsis" />)
      const ellipsis = screen.getByRole('presentation')
      expect(ellipsis).toHaveClass('custom-ellipsis')
    })
  })

  describe('Complete Breadcrumb Structure', () => {
    it('renders a complete breadcrumb navigation', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/docs">Documentation</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute('href', '/docs')
      expect(screen.getByText('Current Page')).toHaveAttribute('aria-current', 'page')
    })
  })
})