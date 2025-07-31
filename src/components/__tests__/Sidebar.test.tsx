import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import Sidebar from '../layout/Sidebar'
import { BrowserRouter } from 'react-router-dom'

// Wrapper component for routing
const SidebarWithRouter = ({ initialPath = '/' }) => (
  <BrowserRouter>
    <div style={{ height: '100vh' }}>
      <Sidebar />
    </div>
  </BrowserRouter>
)

describe('Sidebar Component', () => {
  describe('Rendering', () => {
    it('renders the HRM System logo and title', () => {
      render(<SidebarWithRouter />)
      
      expect(screen.getByText('HRM System')).toBeInTheDocument()
      expect(screen.getByText('Enterprise Edition')).toBeInTheDocument()
    })

    it('renders all main navigation items', () => {
      render(<SidebarWithRouter />)
      
      const expectedNavItems = [
        'Dashboard',
        'Employees', 
        'Leave Management',
        'Payroll',
        'Performance',
        'Onboarding',
        'Attendance',
        'Reports',
        'Assets'
      ]
      
      expectedNavItems.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument()
      })
    })

    it('renders bottom navigation items', () => {
      render(<SidebarWithRouter />)
      
      expect(screen.getByText('Documents')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('renders all navigation items as links', () => {
      render(<SidebarWithRouter />)
      
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      // Check that main navigation items are links
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees')
      expect(screen.getByRole('link', { name: /leave management/i })).toHaveAttribute('href', '/leaves')
    })
  })

  describe('Navigation Structure', () => {
    it('has proper navigation landmark', () => {
      render(<SidebarWithRouter />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('has proper list structure', () => {
      render(<SidebarWithRouter />)
      
      const lists = screen.getAllByRole('list')
      expect(lists.length).toBeGreaterThanOrEqual(2) // Main nav and bottom nav
      
      const listItems = screen.getAllByRole('listitem')
      expect(listItems.length).toBeGreaterThanOrEqual(11) // 9 main + 2 bottom items
    })

    it('groups navigation items properly', () => {
      render(<SidebarWithRouter />)
      
      // Main navigation should be in first list
      const mainNavList = screen.getAllByRole('list')[0]
      expect(mainNavList).toContainElement(screen.getByText('Dashboard').closest('li'))
      expect(mainNavList).toContainElement(screen.getByText('Employees').closest('li'))
    })
  })

  describe('Active State Handling', () => {
    it('applies active styles to current route', () => {
      // Mock the current location
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true
      })
      
      render(<SidebarWithRouter />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies inactive styles to non-current routes', () => {
      Object.defineProperty(window, 'location', {
        value: { pathname: '/' },
        writable: true
      })
      
      render(<SidebarWithRouter />)
      
      const employeesLink = screen.getByRole('link', { name: /employees/i })
      expect(employeesLink).toHaveClass('text-muted-foreground')
      expect(employeesLink).not.toHaveClass('bg-primary')
    })
  })

  describe('Logo and Branding', () => {
    it('renders logo icon', () => {
      render(<SidebarWithRouter />)
      
      const logoContainer = document.querySelector('.bg-gradient-primary')
      expect(logoContainer).toBeInTheDocument()
      expect(logoContainer).toHaveClass('h-8', 'w-8', 'rounded-lg')
    })

    it('has proper branding text hierarchy', () => {
      render(<SidebarWithRouter />)
      
      const title = screen.getByText('HRM System')
      const subtitle = screen.getByText('Enterprise Edition')
      
      expect(title).toHaveClass('text-lg', 'font-semibold')
      expect(subtitle).toHaveClass('text-xs', 'text-muted-foreground')
    })
  })

  describe('Styling and Layout', () => {
    it('applies proper sidebar container styles', () => {
      render(<SidebarWithRouter />)
      
      const sidebar = screen.getByText('HRM System').closest('.flex.h-full')
      expect(sidebar).toHaveClass(
        'flex',
        'h-full',
        'w-64',
        'flex-col',
        'bg-card',
        'border-r',
        'border-border'
      )
    })

    it('applies proper header section styles', () => {
      render(<SidebarWithRouter />)
      
      const header = screen.getByText('HRM System').closest('.flex.h-16')
      expect(header).toHaveClass('flex', 'h-16', 'shrink-0', 'items-center', 'px-6')
    })

    it('applies proper navigation styles', () => {
      render(<SidebarWithRouter />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveClass('flex', 'flex-1', 'flex-col', 'px-4', 'pb-4')
    })

    it('applies hover effects to navigation links', () => {
      render(<SidebarWithRouter />)
      
      const employeesLink = screen.getByRole('link', { name: /employees/i })
      expect(employeesLink).toHaveClass('hover:text-foreground', 'hover:bg-muted')
    })
  })

  describe('Icons', () => {
    it('renders icons for all navigation items', () => {
      render(<SidebarWithRouter />)
      
      // Check that icons are present (they should have the icon classes)
      const navLinks = screen.getAllByRole('link')
      navLinks.forEach(link => {
        const icon = link.querySelector('.h-5.w-5')
        expect(icon).toBeInTheDocument()
      })
    })

    it('applies proper icon styles', () => {
      render(<SidebarWithRouter />)
      
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      const icon = dashboardLink.querySelector('.h-5.w-5')
      
      expect(icon).toHaveClass('h-5', 'w-5', 'shrink-0')
    })
  })

  describe('Responsive Behavior', () => {
    it('has fixed width on larger screens', () => {
      render(<SidebarWithRouter />)
      
      const sidebar = screen.getByText('HRM System').closest('.w-64')
      expect(sidebar).toHaveClass('w-64')
    })

    it('maintains proper spacing and layout', () => {
      render(<SidebarWithRouter />)
      
      const navList = screen.getAllByRole('list')[0]
      expect(navList).toHaveClass('space-y-1')
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveClass('gap-x-3', 'rounded-md', 'p-2')
      })
    })
  })

  describe('Bottom Navigation', () => {
    it('positions bottom navigation at bottom', () => {
      render(<SidebarWithRouter />)
      
      const bottomNavContainer = screen.getByText('Documents').closest('.mt-auto')
      expect(bottomNavContainer).toBeInTheDocument()
      expect(bottomNavContainer).toHaveClass('mt-auto')
    })

    it('applies same styling to bottom navigation items', () => {
      render(<SidebarWithRouter />)
      
      const documentsLink = screen.getByRole('link', { name: /documents/i })
      const settingsLink = screen.getByRole('link', { name: /settings/i })
      
      expect(documentsLink).toHaveClass('group', 'flex', 'gap-x-3', 'rounded-md', 'p-2')
      expect(settingsLink).toHaveClass('group', 'flex', 'gap-x-3', 'rounded-md', 'p-2')
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<SidebarWithRouter />)
      
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getAllByRole('list')).toHaveLength(2)
      expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(11)
    })

    it('provides accessible link text', () => {
      render(<SidebarWithRouter />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveTextContent(/\w+/) // Should have text content
      })
    })

    it('maintains keyboard navigation', () => {
      render(<SidebarWithRouter />)
      
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })
})