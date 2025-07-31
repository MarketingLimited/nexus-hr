import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card'

describe('Card Components', () => {
  describe('Card', () => {
    it('renders basic card with default styling', () => {
      render(<Card data-testid="card">Card Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('rounded-lg', 'border', 'bg-card', 'text-card-foreground', 'shadow-sm')
    })

    it('applies custom className', () => {
      render(<Card className="custom-class" data-testid="card">Content</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
    })

    it('forwards HTML attributes', () => {
      render(<Card id="test-card" role="region">Content</Card>)
      const card = screen.getByRole('region')
      expect(card).toHaveAttribute('id', 'test-card')
    })
  })

  describe('CardHeader', () => {
    it('renders with correct styling', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6')
    })

    it('applies custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
    })
  })

  describe('CardTitle', () => {
    it('renders as h3 element with correct styling', () => {
      render(<CardTitle>Test Title</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('Test Title')
      expect(title).toHaveClass('text-2xl', 'font-semibold', 'leading-none', 'tracking-tight')
    })

    it('applies custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription', () => {
    it('renders with correct styling', () => {
      render(<CardDescription data-testid="description">Test Description</CardDescription>)
      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveTextContent('Test Description')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })

    it('applies custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>)
      const description = screen.getByText('Description')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('CardContent', () => {
    it('renders with correct styling', () => {
      render(<CardContent data-testid="content">Content Area</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('p-6', 'pt-0')
    })

    it('applies custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
    })
  })

  describe('CardFooter', () => {
    it('renders with correct styling', () => {
      render(<CardFooter data-testid="footer">Footer Content</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0')
    })

    it('applies custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
    })
  })

  describe('Complete Card Structure', () => {
    it('renders full card structure correctly', () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content area</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      )

      const card = screen.getByTestId('full-card')
      const title = screen.getByRole('heading', { name: /card title/i })
      const description = screen.getByText(/card description text/i)
      const content = screen.getByText(/main content area/i)
      const button = screen.getByRole('button', { name: /action button/i })

      expect(card).toBeInTheDocument()
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
      expect(content).toBeInTheDocument()
      expect(button).toBeInTheDocument()
    })

    it('maintains proper component structure and hierarchy', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      )

      const title = screen.getByRole('heading')
      const description = screen.getByText('Description')

      expect(title.parentElement).toContainElement(description)
    })
  })

  describe('Forward Refs', () => {
    it('properly forwards refs for Card', () => {
      const ref = { current: null }
      render(<Card ref={ref} data-testid="card">Content</Card>)
      expect(ref.current).toBeTruthy()
    })

    it('properly forwards refs for CardHeader', () => {
      const ref = { current: null }
      render(<CardHeader ref={ref} data-testid="header">Header</CardHeader>)
      expect(ref.current).toBeTruthy()
    })

    it('properly forwards refs for CardTitle', () => {
      const ref = { current: null }
      render(<CardTitle ref={ref}>Title</CardTitle>)
      expect(ref.current).toBeTruthy()
    })

    it('properly forwards refs for CardDescription', () => {
      const ref = { current: null }
      render(<CardDescription ref={ref}>Description</CardDescription>)
      expect(ref.current).toBeTruthy()
    })

    it('properly forwards refs for CardContent', () => {
      const ref = { current: null }
      render(<CardContent ref={ref} data-testid="content">Content</CardContent>)
      expect(ref.current).toBeTruthy()
    })

    it('properly forwards refs for CardFooter', () => {
      const ref = { current: null }
      render(<CardFooter ref={ref} data-testid="footer">Footer</CardFooter>)
      expect(ref.current).toBeTruthy()
    })
  })
})