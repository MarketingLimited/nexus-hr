import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu'

describe('NavigationMenu Components', () => {
  describe('NavigationMenu', () => {
    it('renders with correct styling', () => {
      render(
        <NavigationMenu data-testid="nav-menu">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink>Home</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const navMenu = screen.getByTestId('nav-menu')
      expect(navMenu).toBeInTheDocument()
      expect(navMenu).toHaveClass('relative', 'z-10', 'flex', 'max-w-max', 'flex-1', 'items-center', 'justify-center')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu className="custom-nav">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink>Home</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      expect(screen.getByRole('navigation')).toHaveClass('custom-nav')
    })
  })

  describe('NavigationMenuList', () => {
    it('renders with correct styling', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList data-testid="nav-list">
            <NavigationMenuItem>
              <NavigationMenuLink>Home</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const navList = screen.getByTestId('nav-list')
      expect(navList).toBeInTheDocument()
      expect(navList).toHaveClass('group', 'flex', 'flex-1', 'list-none', 'items-center', 'justify-center', 'space-x-1')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList className="custom-list">
            <NavigationMenuItem>
              <NavigationMenuLink>Home</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const list = screen.getByRole('list')
      expect(list).toHaveClass('custom-list')
    })
  })

  describe('NavigationMenuItem', () => {
    it('renders as list item', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem data-testid="nav-item">
              <NavigationMenuLink>Home</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const navItem = screen.getByTestId('nav-item')
      expect(navItem).toBeInTheDocument()
      expect(navItem.tagName).toBe('LI')
    })
  })

  describe('NavigationMenuTrigger', () => {
    it('renders with correct styling', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger data-testid="nav-trigger">
                Products
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByTestId('nav-trigger')
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveClass('group', 'inline-flex', 'h-10', 'w-max', 'items-center', 'justify-center', 'rounded-md')
    })

    it('handles interaction to show content', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Product Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByText('Products')
      fireEvent.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Product Content')).toBeInTheDocument()
      })
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="custom-trigger">
                Products
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      expect(screen.getByText('Products')).toHaveClass('custom-trigger')
    })
  })

  describe('NavigationMenuContent', () => {
    it('renders when triggered', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent data-testid="nav-content">
                <div>Product Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByText('Products')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByTestId('nav-content')
        expect(content).toBeInTheDocument()
        expect(content).toHaveClass('left-0', 'top-0', 'w-full')
      })
    })

    it('applies custom className', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent className="custom-content">
                <div>Product Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByText('Products')
      fireEvent.click(trigger)

      await waitFor(() => {
        const content = screen.getByText('Product Content').parentElement
        expect(content).toHaveClass('custom-content')
      })
    })
  })

  describe('NavigationMenuLink', () => {
    it('renders as anchor with correct styling', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/home">Home</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const link = screen.getByRole('link', { name: 'Home' })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/home')
      expect(link).toHaveClass('group', 'inline-flex', 'h-10', 'w-max', 'items-center', 'justify-center', 'rounded-md')
    })

    it('renders as child component when asChild is true', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <button>Custom Button</button>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const button = screen.getByRole('button', { name: 'Custom Button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('group', 'inline-flex')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink className="custom-link" href="/home">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      expect(screen.getByRole('link')).toHaveClass('custom-link')
    })
  })

  describe('NavigationMenuIndicator', () => {
    it('renders with correct styling', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuIndicator data-testid="nav-indicator" />
          </NavigationMenuList>
        </NavigationMenu>
      )

      const indicator = screen.getByTestId('nav-indicator')
      expect(indicator).toBeInTheDocument()
      expect(indicator).toHaveClass('top-full', 'z-[1]', 'flex', 'h-1.5', 'items-end', 'justify-center', 'overflow-hidden')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuIndicator className="custom-indicator" />
          </NavigationMenuList>
        </NavigationMenu>
      )

      const indicator = screen.getByRole('generic')
      expect(indicator).toHaveClass('custom-indicator')
    })
  })

  describe('NavigationMenuViewport', () => {
    it('renders with correct styling', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport data-testid="nav-viewport" />
        </NavigationMenu>
      )

      const viewport = screen.getByTestId('nav-viewport')
      expect(viewport).toBeInTheDocument()
      expect(viewport).toHaveClass('origin-top-center', 'relative', 'mt-1.5', 'h-[var(--radix-navigation-menu-viewport-height)]')
    })

    it('applies custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport className="custom-viewport" />
        </NavigationMenu>
      )

      const viewport = screen.getByRole('generic')
      expect(viewport).toHaveClass('custom-viewport')
    })
  })

  describe('Complete NavigationMenu Structure', () => {
    it('renders a complete navigation menu with multiple items', async () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">Home</NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a href="/products/featured">
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Featured Products
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Check out our latest and greatest products.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <a href="/services/consulting">
                        <div className="text-sm font-medium leading-none">Consulting</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Professional consulting services.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <a href="/services/support">
                        <div className="text-sm font-medium leading-none">Support</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          24/7 customer support.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/contact">Contact</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
      expect(screen.getByText('Products')).toBeInTheDocument()
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument()

      // Test Products dropdown
      fireEvent.click(screen.getByText('Products'))
      await waitFor(() => {
        expect(screen.getByText('Featured Products')).toBeInTheDocument()
        expect(screen.getByText('Check out our latest and greatest products.')).toBeInTheDocument()
      })

      // Test Services dropdown
      fireEvent.click(screen.getByText('Services'))
      await waitFor(() => {
        expect(screen.getByText('Consulting')).toBeInTheDocument()
        expect(screen.getByText('Professional consulting services.')).toBeInTheDocument()
        expect(screen.getByText('Support')).toBeInTheDocument()
        expect(screen.getByText('24/7 customer support.')).toBeInTheDocument()
      })
    })
  })
})