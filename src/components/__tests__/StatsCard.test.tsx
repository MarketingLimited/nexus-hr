import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import StatsCard from '../dashboard/StatsCard'
import { Users } from 'lucide-react'

describe('StatsCard Component', () => {
  const defaultProps = {
    title: 'Total Employees',
    value: 150,
    icon: Users,
  }

  describe('Rendering', () => {
    it('renders with required props', () => {
      render(<StatsCard {...defaultProps} />)
      
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('renders with string value', () => {
      render(
        <StatsCard
          {...defaultProps}
          value="42.5%"
        />
      )
      expect(screen.getByText('42.5%')).toBeInTheDocument()
    })

    it('renders with number value formatted with locale', () => {
      render(
        <StatsCard
          {...defaultProps}
          value={1234567}
        />
      )
      expect(screen.getByText('1,234,567')).toBeInTheDocument()
    })

    it('renders icon component', () => {
      render(<StatsCard {...defaultProps} />)
      
      // Check if the icon is rendered by looking for the SVG element
      const iconContainer = screen.getByRole('generic').querySelector('.h-6.w-6')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Change Indicator', () => {
    it('renders positive change correctly', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="+12%"
          changeType="positive"
        />
      )
      
      expect(screen.getByText('+12%')).toBeInTheDocument()
      expect(screen.getByText('from last month')).toBeInTheDocument()
      
      const changeElement = screen.getByText('+12%')
      expect(changeElement).toHaveClass('text-success')
    })

    it('renders negative change correctly', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="-5%"
          changeType="negative"
        />
      )
      
      const changeElement = screen.getByText('-5%')
      expect(changeElement).toHaveClass('text-destructive')
    })

    it('renders neutral change correctly', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="0%"
          changeType="neutral"
        />
      )
      
      const changeElement = screen.getByText('0%')
      expect(changeElement).toHaveClass('text-muted-foreground')
    })

    it('defaults to neutral when changeType is not provided', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="+3%"
        />
      )
      
      const changeElement = screen.getByText('+3%')
      expect(changeElement).toHaveClass('text-muted-foreground')
    })

    it('does not render change section when change is not provided', () => {
      render(<StatsCard {...defaultProps} />)
      
      expect(screen.queryByText('from last month')).not.toBeInTheDocument()
    })
  })

  describe('Color Variants', () => {
    it('applies employees color variant', () => {
      render(
        <StatsCard
          {...defaultProps}
          color="employees"
        />
      )
      
      const iconContainer = document.querySelector('.bg-employees\\/10.text-employees')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies leaves color variant', () => {
      render(
        <StatsCard
          {...defaultProps}
          color="leaves"
        />
      )
      
      const iconContainer = document.querySelector('.bg-leaves\\/10.text-leaves')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies payroll color variant', () => {
      render(
        <StatsCard
          {...defaultProps}
          color="payroll"
        />
      )
      
      const iconContainer = document.querySelector('.bg-payroll\\/10.text-payroll')
      expect(iconContainer).toBeInTheDocument()
    })

    it('applies performance color variant', () => {
      render(
        <StatsCard
          {...defaultProps}
          color="performance"
        />
      )
      
      const iconContainer = document.querySelector('.bg-performance\\/10.text-performance')
      expect(iconContainer).toBeInTheDocument()
    })

    it('defaults to primary color when color is not specified', () => {
      render(<StatsCard {...defaultProps} />)
      
      const iconContainer = document.querySelector('.bg-primary\\/10.text-primary')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('renders skeleton when isLoading is true', () => {
      render(
        <StatsCard
          {...defaultProps}
          isLoading={true}
        />
      )
      
      // Should render skeleton elements instead of actual content
      expect(screen.queryByText('Total Employees')).not.toBeInTheDocument()
      expect(screen.queryByText('150')).not.toBeInTheDocument()
      
      // Check for skeleton classes
      const skeletons = document.querySelectorAll('.h-4, .h-8, .h-3, .h-12')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('renders normal content when isLoading is false', () => {
      render(
        <StatsCard
          {...defaultProps}
          isLoading={false}
        />
      )
      
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })

    it('defaults to not loading when isLoading is not specified', () => {
      render(<StatsCard {...defaultProps} />)
      
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
    })
  })

  describe('Styling and Animation', () => {
    it('applies hover effects', () => {
      render(<StatsCard {...defaultProps} />)
      
      const card = screen.getByText('Total Employees').closest('.relative')
      expect(card).toHaveClass('hover:shadow-shadow-lg', 'transition-all', 'duration-300')
    })

    it('applies gradient background', () => {
      render(<StatsCard {...defaultProps} />)
      
      const card = screen.getByText('Total Employees').closest('.relative')
      expect(card).toHaveClass('bg-gradient-card')
    })

    it('applies shadow styles', () => {
      render(<StatsCard {...defaultProps} />)
      
      const card = screen.getByText('Total Employees').closest('.relative')
      expect(card).toHaveClass('shadow-shadow-md')
    })
  })

  describe('Content Structure', () => {
    it('has proper content hierarchy', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="+12%"
          changeType="positive"
        />
      )
      
      const title = screen.getByText('Total Employees')
      const value = screen.getByText('150')
      const change = screen.getByText('+12%')
      
      expect(title).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground')
      expect(value).toHaveClass('text-3xl', 'font-bold', 'text-foreground')
      expect(change).toHaveClass('text-xs', 'font-medium')
    })

    it('maintains proper spacing between elements', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="+12%"
        />
      )
      
      const contentArea = screen.getByText('Total Employees').closest('.space-y-2')
      expect(contentArea).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      render(<StatsCard {...defaultProps} />)
      
      // The card should be contained within a proper landmark
      const card = screen.getByText('Total Employees').closest('[role]') || 
                   screen.getByText('Total Employees').closest('article') ||
                   screen.getByText('Total Employees').closest('.relative')
      
      expect(card).toBeInTheDocument()
    })

    it('provides meaningful text content', () => {
      render(
        <StatsCard
          {...defaultProps}
          change="+12%"
          changeType="positive"
        />
      )
      
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('150')).toBeInTheDocument()
      expect(screen.getByText('+12%')).toBeInTheDocument()
      expect(screen.getByText('from last month')).toBeInTheDocument()
    })
  })
})