import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test-utils'
import { MemoryRouter } from 'react-router-dom'
import { Users, Clock } from 'lucide-react'
import ModuleCard from '../dashboard/ModuleCard'

const defaultProps = {
  title: 'Employee Management',
  description: 'Manage employee data and profiles',
  icon: Users,
  color: 'employees' as const,
  actions: [],
  stats: [
    { label: 'Total Employees', value: '247' },
    { label: 'Active Today', value: '231' }
  ]
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  )
}

describe('ModuleCard', () => {
  describe('Rendering', () => {
    it('renders with basic props', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      expect(screen.getByText('Employee Management')).toBeInTheDocument()
      expect(screen.getByText('Manage employee data and profiles')).toBeInTheDocument()
    })

    it('renders the icon correctly', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      const icon = screen.getByTestId('lucide-users')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('h-6', 'w-6')
    })

    it('displays all provided stats', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('247')).toBeInTheDocument()
      expect(screen.getByText('Active Today')).toBeInTheDocument()
      expect(screen.getByText('231')).toBeInTheDocument()
    })

    it('displays module title and description', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      expect(screen.getByText('Employee Management')).toBeInTheDocument()
      expect(screen.getByText('Manage employee data and profiles')).toBeInTheDocument()
    })
  })

  describe('Stats Display', () => {
    it('handles empty stats array', () => {
      const propsWithoutStats = { ...defaultProps, stats: [] }
      renderWithRouter(<ModuleCard {...propsWithoutStats} />)

      expect(screen.getByText('Employee Management')).toBeInTheDocument()
      expect(screen.queryByText('Total Employees')).not.toBeInTheDocument()
    })

    it('handles undefined stats', () => {
      const propsWithoutStats = { ...defaultProps, stats: undefined }
      renderWithRouter(<ModuleCard {...propsWithoutStats} />)

      expect(screen.getByText('Employee Management')).toBeInTheDocument()
    })

    it('renders multiple stats correctly', () => {
      const propsWithMultipleStats = {
        ...defaultProps,
        stats: [
          { label: 'Stat 1', value: '100' },
          { label: 'Stat 2', value: '200' },
          { label: 'Stat 3', value: '300' }
        ]
      }
      renderWithRouter(<ModuleCard {...propsWithMultipleStats} />)

      expect(screen.getByText('Stat 1')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('Stat 2')).toBeInTheDocument()
      expect(screen.getByText('200')).toBeInTheDocument()
      expect(screen.getByText('Stat 3')).toBeInTheDocument()
      expect(screen.getByText('300')).toBeInTheDocument()
    })
  })

  describe('Styling and Layout', () => {
    it('applies hover effects', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      const card = screen.getByRole('link')
      expect(card).toHaveClass('hover:shadow-lg')
    })

    it('has proper card structure', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      const card = screen.getByRole('link')
      expect(card).toHaveClass('block')
    })

    it('uses proper text colors for different elements', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      const title = screen.getByText('Employee Management')
      expect(title).toHaveClass('font-semibold')

      const description = screen.getByText('Manage employee data and profiles')
      expect(description).toHaveClass('text-muted-foreground')
    })
  })

  describe('Accessibility', () => {
    it('provides accessible link structure', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/employees')
    })

    it('has proper text hierarchy', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      const title = screen.getByText('Employee Management')
      const description = screen.getByText('Manage employee data and profiles')

      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })
  })

  describe('Icon Handling', () => {
    it('renders different icon types', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      // Test with Users icon
      expect(screen.getByTestId('lucide-users')).toBeInTheDocument()
    })

    it('renders with Clock icon', () => {
      const clockProps = { ...defaultProps, icon: Clock }
      renderWithRouter(<ModuleCard {...clockProps} />)

      expect(screen.getByTestId('lucide-clock')).toBeInTheDocument()
    })
  })

  describe('Actions', () => {
    it('renders action buttons', () => {
      const propsWithActions = {
        ...defaultProps,
        actions: [
          { label: 'View All', href: '/employees' },
          { label: 'Add New', href: '/employees/new' }
        ]
      }
      renderWithRouter(<ModuleCard {...propsWithActions} />)

      expect(screen.getByText('View All')).toBeInTheDocument()
      expect(screen.getByText('Add New')).toBeInTheDocument()
    })

    it('handles empty actions array', () => {
      renderWithRouter(<ModuleCard {...defaultProps} />)

      expect(screen.getByText('Employee Management')).toBeInTheDocument()
    })
  })
})