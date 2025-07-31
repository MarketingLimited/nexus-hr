import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { MemoryRouter } from 'react-router-dom'
import QuickActions from '../dashboard/QuickActions'

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('QuickActions', () => {
  describe('Rendering', () => {
    it('renders the component with title', () => {
      renderWithRouter(<QuickActions />)

      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    it('displays all action buttons', () => {
      renderWithRouter(<QuickActions />)

      expect(screen.getByText('Add Employee')).toBeInTheDocument()
      expect(screen.getByText('Request Leave')).toBeInTheDocument()
      expect(screen.getByText('Clock In/Out')).toBeInTheDocument()
      expect(screen.getByText('View Payroll')).toBeInTheDocument()
    })

    it('renders action descriptions', () => {
      renderWithRouter(<QuickActions />)

      expect(screen.getByText('Add a new employee to the system')).toBeInTheDocument()
      expect(screen.getByText('Submit a new leave request')).toBeInTheDocument()
      expect(screen.getByText('Mark attendance for today')).toBeInTheDocument()
      expect(screen.getByText('View current payroll information')).toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('creates correct navigation links', () => {
      renderWithRouter(<QuickActions />)

      const addEmployeeLink = screen.getByRole('link', { name: /add employee/i })
      const requestLeaveLink = screen.getByRole('link', { name: /request leave/i })
      const clockInOutLink = screen.getByRole('link', { name: /clock in\/out/i })
      const viewPayrollLink = screen.getByRole('link', { name: /view payroll/i })

      expect(addEmployeeLink).toHaveAttribute('href', '/employees')
      expect(requestLeaveLink).toHaveAttribute('href', '/leave')
      expect(clockInOutLink).toHaveAttribute('href', '/attendance')
      expect(viewPayrollLink).toHaveAttribute('href', '/payroll')
    })
  })

  describe('Icons', () => {
    it('displays icons for each action', () => {
      renderWithRouter(<QuickActions />)

      // Check that icons are rendered with correct classes
      const icons = screen.getAllByTestId(/lucide-/)
      expect(icons.length).toBe(4)

      // Verify icon styling
      icons.forEach(icon => {
        expect(icon).toHaveClass('h-5', 'w-5')
      })
    })
  })

  describe('Layout and Styling', () => {
    it('uses proper grid layout', () => {
      renderWithRouter(<QuickActions />)

      const gridContainer = screen.getByText('Add Employee').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'gap-4')
    })

    it('applies hover effects to action items', () => {
      renderWithRouter(<QuickActions />)

      const actionLinks = screen.getAllByRole('link')
      actionLinks.forEach(link => {
        expect(link).toHaveClass('hover:bg-muted/50')
      })
    })

    it('displays proper spacing and padding', () => {
      renderWithRouter(<QuickActions />)

      const actionItems = screen.getAllByRole('link')
      actionItems.forEach(item => {
        expect(item).toHaveClass('flex', 'items-center', 'gap-3', 'p-4')
      })
    })
  })

  describe('Accessibility', () => {
    it('provides accessible link text', () => {
      renderWithRouter(<QuickActions />)

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAccessibleName()
      })
    })

    it('has proper heading structure', () => {
      renderWithRouter(<QuickActions />)

      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading).toHaveTextContent('Quick Actions')
    })

    it('provides descriptive content for screen readers', () => {
      renderWithRouter(<QuickActions />)

      expect(screen.getByText('Add a new employee to the system')).toBeInTheDocument()
      expect(screen.getByText('Submit a new leave request')).toBeInTheDocument()
      expect(screen.getByText('Mark attendance for today')).toBeInTheDocument()
      expect(screen.getByText('View current payroll information')).toBeInTheDocument()
    })
  })

  describe('Action Categories', () => {
    it('covers all main HR functions', () => {
      renderWithRouter(<QuickActions />)

      // Employee management
      expect(screen.getByText('Add Employee')).toBeInTheDocument()
      
      // Leave management
      expect(screen.getByText('Request Leave')).toBeInTheDocument()
      
      // Attendance management
      expect(screen.getByText('Clock In/Out')).toBeInTheDocument()
      
      // Payroll management
      expect(screen.getByText('View Payroll')).toBeInTheDocument()
    })
  })

  describe('Visual Design', () => {
    it('uses consistent styling across action items', () => {
      renderWithRouter(<QuickActions />)

      const actionItems = screen.getAllByRole('link')
      
      actionItems.forEach(item => {
        expect(item).toHaveClass('rounded-lg', 'border', 'transition-colors')
      })
    })

    it('properly styles action titles and descriptions', () => {
      renderWithRouter(<QuickActions />)

      const title = screen.getByText('Add Employee')
      expect(title).toHaveClass('font-medium')

      const description = screen.getByText('Add a new employee to the system')
      expect(description).toHaveClass('text-sm', 'text-muted-foreground')
    })
  })
})