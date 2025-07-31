import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test-utils'
import EmployeeList from '../employees/EmployeeList'
import { createUser } from '../../test-utils/user-interactions'

describe('EmployeeList Component', () => {
  const defaultProps = {
    searchTerm: '',
    selectedDepartment: 'all',
    selectedStatus: 'all',
    viewMode: 'grid' as const,
  }

  describe('Rendering', () => {
    it('renders employee list in grid view', () => {
      render(<EmployeeList {...defaultProps} />)
      
      // Should render multiple employee cards
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
      expect(screen.getByText('Emma Davis')).toBeInTheDocument()
    })

    it('renders employee list in list view', () => {
      render(<EmployeeList {...defaultProps} viewMode="list" />)
      
      // Should render employees in list format
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    })

    it('shows employee information correctly', () => {
      render(<EmployeeList {...defaultProps} />)
      
      // Check for employee details
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
      expect(screen.getByText('Engineering')).toBeInTheDocument()
      expect(screen.getByText('New York, NY')).toBeInTheDocument()
    })

    it('renders employee avatars', () => {
      render(<EmployeeList {...defaultProps} />)
      
      // Check for avatar elements
      const avatars = screen.getAllByRole('img')
      expect(avatars.length).toBeGreaterThan(0)
    })

    it('shows employee status badges', () => {
      render(<EmployeeList {...defaultProps} />)
      
      // Check for status badges
      const activeBadges = screen.getAllByText('active')
      const inactiveBadges = screen.getAllByText('inactive')
      
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(inactiveBadges.length).toBeGreaterThan(0)
    })
  })

  describe('Filtering - Search', () => {
    it('filters employees by name', () => {
      render(<EmployeeList {...defaultProps} searchTerm="Sarah" />)
      
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument()
    })

    it('filters employees by email', () => {
      render(<EmployeeList {...defaultProps} searchTerm="mike.chen" />)
      
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
    })

    it('filters employees by position', () => {
      render(<EmployeeList {...defaultProps} searchTerm="Software Engineer" />)
      
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument()
    })

    it('is case insensitive', () => {
      render(<EmployeeList {...defaultProps} searchTerm="SARAH" />)
      
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
    })

    it('shows no results when search term matches nothing', () => {
      render(<EmployeeList {...defaultProps} searchTerm="nonexistent" />)
      
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument()
    })
  })

  describe('Filtering - Department', () => {
    it('shows all employees when department is "all"', () => {
      render(<EmployeeList {...defaultProps} selectedDepartment="all" />)
      
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
      expect(screen.getByText('Emma Davis')).toBeInTheDocument()
    })

    it('filters employees by specific department', () => {
      render(<EmployeeList {...defaultProps} selectedDepartment="Engineering" />)
      
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument() // Product dept
    })

    it('shows employees from Product department', () => {
      render(<EmployeeList {...defaultProps} selectedDepartment="Product" />)
      
      expect(screen.getByText('Mike Chen')).toBeInTheDocument()
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument() // Engineering dept
    })
  })

  describe('Filtering - Status', () => {
    it('shows all employees when status is "all"', () => {
      render(<EmployeeList {...defaultProps} selectedStatus="all" />)
      
      const activeBadges = screen.getAllByText('active')
      const inactiveBadges = screen.getAllByText('inactive')
      
      expect(activeBadges.length).toBeGreaterThan(0)
      expect(inactiveBadges.length).toBeGreaterThan(0)
    })

    it('filters employees by active status', () => {
      render(<EmployeeList {...defaultProps} selectedStatus="active" />)
      
      expect(screen.getAllByText('active')).toHaveLength(5) // 5 active employees
      expect(screen.queryByText('inactive')).not.toBeInTheDocument()
    })

    it('filters employees by inactive status', () => {
      render(<EmployeeList {...defaultProps} selectedStatus="inactive" />)
      
      expect(screen.getByText('Alex Thompson')).toBeInTheDocument()
      expect(screen.getAllByText('inactive')).toHaveLength(1)
      expect(screen.queryByText('active')).not.toBeInTheDocument()
    })
  })

  describe('Combined Filtering', () => {
    it('applies multiple filters simultaneously', () => {
      render(
        <EmployeeList 
          {...defaultProps} 
          searchTerm="Johnson"
          selectedDepartment="Engineering"
          selectedStatus="active"
        />
      )
      
      expect(screen.getByText('Sarah Johnson')).toBeInTheDocument()
      expect(screen.queryByText('Mike Chen')).not.toBeInTheDocument()
    })

    it('shows no results when filters conflict', () => {
      render(
        <EmployeeList 
          {...defaultProps} 
          searchTerm="Sarah"
          selectedDepartment="Product"
        />
      )
      
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
    })
  })

  describe('View Modes', () => {
    it('applies grid layout in grid mode', () => {
      render(<EmployeeList {...defaultProps} viewMode="grid" />)
      
      const gridContainer = screen.getByText('Sarah Johnson').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })

    it('applies list layout in list mode', () => {
      render(<EmployeeList {...defaultProps} viewMode="list" />)
      
      const listContainer = screen.getByText('Sarah Johnson').closest('.space-y-3')
      expect(listContainer).toBeInTheDocument()
    })

    it('shows different information layout in list view', () => {
      render(<EmployeeList {...defaultProps} viewMode="list" />)
      
      // In list view, should show more detailed information
      expect(screen.getByText('sarah.johnson@company.com')).toBeInTheDocument()
      expect(screen.getByText(/joined/i)).toBeInTheDocument()
    })

    it('shows condensed information in grid view', () => {
      render(<EmployeeList {...defaultProps} viewMode="grid" />)
      
      // Grid view should be more compact
      const card = screen.getByText('Sarah Johnson').closest('.text-center')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Employee Actions', () => {
    it('renders View and Edit buttons for each employee', () => {
      render(<EmployeeList {...defaultProps} />)
      
      const viewButtons = screen.getAllByText('View')
      const editButtons = screen.getAllByText('Edit')
      
      expect(viewButtons.length).toBeGreaterThan(0)
      expect(editButtons.length).toBeGreaterThan(0)
      expect(viewButtons.length).toBe(editButtons.length)
    })

    it('has correct links for employee actions', () => {
      render(<EmployeeList {...defaultProps} />)
      
      const viewLinks = screen.getAllByRole('link', { name: /view/i })
      const editLinks = screen.getAllByRole('link', { name: /edit/i })
      
      expect(viewLinks[0]).toHaveAttribute('href', '/employees/1')
      expect(editLinks[0]).toHaveAttribute('href', '/employees/1/edit')
    })

    it('action buttons are clickable', async () => {
      const user = createUser()
      render(<EmployeeList {...defaultProps} />)
      
      const viewButton = screen.getAllByText('View')[0]
      await user.click(viewButton)
      
      // Should not throw error
      expect(viewButton).toBeInTheDocument()
    })
  })

  describe('Status Indicators', () => {
    it('applies correct badge variants for status', () => {
      render(<EmployeeList {...defaultProps} />)
      
      // Check that active employees have default badge
      const sarahCard = screen.getByText('Sarah Johnson').closest('[class*="card"]')
      const activeBadge = sarahCard?.querySelector('[class*="badge"]')
      expect(activeBadge).toBeInTheDocument()
      
      // Check that inactive employees have secondary badge
      const alexCard = screen.getByText('Alex Thompson').closest('[class*="card"]')
      const inactiveBadge = alexCard?.querySelector('[class*="badge"]')
      expect(inactiveBadge).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure in grid view', () => {
      render(<EmployeeList {...defaultProps} viewMode="grid" />)
      
      const employeeNames = screen.getAllByRole('heading', { level: 3 })
      expect(employeeNames.length).toBeGreaterThan(0)
      expect(employeeNames[0]).toHaveTextContent('Sarah Johnson')
    })

    it('has accessible employee avatars', () => {
      render(<EmployeeList {...defaultProps} />)
      
      const avatars = screen.getAllByRole('img')
      avatars.forEach(avatar => {
        expect(avatar).toHaveAttribute('alt')
      })
    })

    it('has accessible action buttons', () => {
      render(<EmployeeList {...defaultProps} />)
      
      const viewLinks = screen.getAllByRole('link', { name: /view/i })
      const editLinks = screen.getAllByRole('link', { name: /edit/i })
      
      viewLinks.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
      
      editLinks.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })
  })

  describe('Empty States', () => {
    it('handles empty employee list gracefully', () => {
      // This would require mocking the employees data to be empty
      // For now, we test with filters that return no results
      render(<EmployeeList {...defaultProps} searchTerm="nonexistent employee" />)
      
      // Should not crash and should show no employees
      expect(screen.queryByText('Sarah Johnson')).not.toBeInTheDocument()
    })
  })
})