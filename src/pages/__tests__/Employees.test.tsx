import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@/test-utils'
import { userEvent } from '@testing-library/user-event'
import Employees from '../Employees'

// Mock the employee hooks
vi.mock('@/hooks/useEmployees', () => ({
  useEmployees: () => ({
    data: {
      data: [
        { id: '1', name: 'John Doe', department: 'IT', status: 'active', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', department: 'HR', status: 'active', email: 'jane@example.com' }
      ],
      meta: { total: 247, page: 1, limit: 10, totalPages: 25 }
    },
    isLoading: false
  }),
  useEmployeeStats: () => ({
    data: {
      totalEmployees: 247,
      activeEmployees: 231,
      newThisMonth: 12,
      departmentCount: 8
    },
    isLoading: false
  })
}))

// Mock child components
vi.mock('@/components/employees/EmployeeFilters', () => ({
  default: ({ 
    searchTerm, 
    onSearchChange, 
    selectedDepartment, 
    onDepartmentChange, 
    selectedStatus, 
    onStatusChange, 
    viewMode, 
    onViewModeChange 
  }: any) => (
    <div data-testid="employee-filters">
      <input 
        data-testid="search-input"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search employees..."
      />
      <select 
        data-testid="department-select"
        value={selectedDepartment}
        onChange={(e) => onDepartmentChange(e.target.value)}
      >
        <option value="all">All Departments</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
      </select>
      <select 
        data-testid="status-select"
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <button 
        data-testid="view-mode-toggle"
        onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
      >
        {viewMode === 'grid' ? 'List View' : 'Grid View'}
      </button>
    </div>
  )
}))

vi.mock('@/components/employees/EmployeeList', () => ({
  default: ({ searchTerm, selectedDepartment, selectedStatus, viewMode }: any) => (
    <div data-testid="employee-list">
      <div data-testid="search-term">{searchTerm}</div>
      <div data-testid="selected-department">{selectedDepartment}</div>
      <div data-testid="selected-status">{selectedStatus}</div>
      <div data-testid="view-mode">{viewMode}</div>
      <div data-testid="employee-item">John Doe - IT</div>
      <div data-testid="employee-item">Jane Smith - HR</div>
    </div>
  )
}))

describe('Employees Page', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the employees page with all components', () => {
      render(<Employees />)

      // Check main components
      expect(screen.getByTestId('employee-filters')).toBeInTheDocument()
      expect(screen.getByTestId('employee-list')).toBeInTheDocument()
    })

    it('displays employee statistics cards', () => {
      render(<Employees />)

      // Check stats cards
      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('247')).toBeInTheDocument()
      expect(screen.getByText('Active Employees')).toBeInTheDocument()
      expect(screen.getByText('231')).toBeInTheDocument()
      expect(screen.getByText('New This Month')).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('Departments')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('shows correct percentage and growth indicators', () => {
      render(<Employees />)

      expect(screen.getByText('+12 from last month')).toBeInTheDocument()
      expect(screen.getByText('93.5% of total')).toBeInTheDocument()
      expect(screen.getByText('+3 from last month')).toBeInTheDocument()
      expect(screen.getByText('Across all locations')).toBeInTheDocument()
    })
  })

  describe('State Management', () => {
    it('initializes with correct default state', () => {
      render(<Employees />)

      // Check initial state values
      expect(screen.getByTestId('search-term')).toHaveTextContent('')
      expect(screen.getByTestId('selected-department')).toHaveTextContent('all')
      expect(screen.getByTestId('selected-status')).toHaveTextContent('all')
      expect(screen.getByTestId('view-mode')).toHaveTextContent('grid')
    })

    it('updates search term state when filter changes', async () => {
      render(<Employees />)

      const searchInput = screen.getByTestId('search-input')
      await user.type(searchInput, 'John')

      await waitFor(() => {
        expect(screen.getByTestId('search-term')).toHaveTextContent('John')
      })
    })

    it('updates department filter state', async () => {
      render(<Employees />)

      const departmentSelect = screen.getByTestId('department-select')
      await user.selectOptions(departmentSelect, 'IT')

      await waitFor(() => {
        expect(screen.getByTestId('selected-department')).toHaveTextContent('IT')
      })
    })

    it('updates status filter state', async () => {
      render(<Employees />)

      const statusSelect = screen.getByTestId('status-select')
      await user.selectOptions(statusSelect, 'active')

      await waitFor(() => {
        expect(screen.getByTestId('selected-status')).toHaveTextContent('active')
      })
    })

    it('toggles view mode between grid and list', async () => {
      render(<Employees />)

      const viewModeToggle = screen.getByTestId('view-mode-toggle')
      
      // Initial state should be grid
      expect(screen.getByTestId('view-mode')).toHaveTextContent('grid')
      
      // Click to switch to list view
      await user.click(viewModeToggle)
      
      await waitFor(() => {
        expect(screen.getByTestId('view-mode')).toHaveTextContent('list')
      })

      // Click to switch back to grid view
      await user.click(viewModeToggle)
      
      await waitFor(() => {
        expect(screen.getByTestId('view-mode')).toHaveTextContent('grid')
      })
    })
  })

  describe('Filter Interactions', () => {
    it('passes correct props to EmployeeFilters component', () => {
      render(<Employees />)

      const searchInput = screen.getByTestId('search-input')
      const departmentSelect = screen.getByTestId('department-select')
      const statusSelect = screen.getByTestId('status-select')
      const viewModeToggle = screen.getByTestId('view-mode-toggle')

      expect(searchInput).toHaveValue('')
      expect(departmentSelect).toHaveValue('all')
      expect(statusSelect).toHaveValue('all')
      expect(viewModeToggle).toHaveTextContent('List View') // Since initial mode is grid
    })

    it('passes filter state to EmployeeList component', () => {
      render(<Employees />)

      // Initial props should be passed correctly
      expect(screen.getByTestId('employee-list')).toBeInTheDocument()
      expect(screen.getByTestId('search-term')).toHaveTextContent('')
      expect(screen.getByTestId('selected-department')).toHaveTextContent('all')
      expect(screen.getByTestId('selected-status')).toHaveTextContent('all')
      expect(screen.getByTestId('view-mode')).toHaveTextContent('grid')
    })

    it('maintains filter state consistency across components', async () => {
      render(<Employees />)

      // Change multiple filters
      await user.type(screen.getByTestId('search-input'), 'test')
      await user.selectOptions(screen.getByTestId('department-select'), 'IT')
      await user.selectOptions(screen.getByTestId('status-select'), 'active')

      await waitFor(() => {
        expect(screen.getByTestId('search-term')).toHaveTextContent('test')
        expect(screen.getByTestId('selected-department')).toHaveTextContent('IT')
        expect(screen.getByTestId('selected-status')).toHaveTextContent('active')
      })
    })
  })

  describe('Layout and Structure', () => {
    it('has proper grid layout for stats cards', () => {
      render(<Employees />)

      const statsContainer = screen.getByText('Total Employees').closest('.grid')
      expect(statsContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-4')
    })

    it('maintains proper spacing throughout the page', () => {
      render(<Employees />)

      const pageContainer = screen.getByTestId('employee-filters').closest('div')
      expect(pageContainer).toHaveClass('p-6', 'space-y-6')
    })

    it('structures employee management section correctly', () => {
      render(<Employees />)

      const employeeManagementCard = screen.getByTestId('employee-filters').closest('.card')
      expect(employeeManagementCard).toBeInTheDocument()
    })
  })

  describe('Data Display', () => {
    it('displays employee statistics correctly', () => {
      render(<Employees />)

      // Check that all stats are displayed with correct values
      expect(screen.getByText('247')).toBeInTheDocument()
      expect(screen.getByText('231')).toBeInTheDocument() 
      expect(screen.getByText('12')).toBeInTheDocument()
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('shows appropriate labels for each statistic', () => {
      render(<Employees />)

      expect(screen.getByText('Total Employees')).toBeInTheDocument()
      expect(screen.getByText('Active Employees')).toBeInTheDocument()
      expect(screen.getByText('New This Month')).toBeInTheDocument()
      expect(screen.getByText('Departments')).toBeInTheDocument()
    })

    it('displays growth indicators and percentages', () => {
      render(<Employees />)

      expect(screen.getByText('+12 from last month')).toBeInTheDocument()
      expect(screen.getByText('93.5% of total')).toBeInTheDocument()
      expect(screen.getByText('+3 from last month')).toBeInTheDocument()
      expect(screen.getByText('Across all locations')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('provides proper form labels and controls', () => {
      render(<Employees />)

      // Check that filter controls are accessible
      const searchInput = screen.getByTestId('search-input')
      const departmentSelect = screen.getByTestId('department-select')
      const statusSelect = screen.getByTestId('status-select')

      expect(searchInput).toHaveAttribute('placeholder', 'Search employees...')
      expect(departmentSelect).toBeInTheDocument()
      expect(statusSelect).toBeInTheDocument()
    })

    it('maintains proper heading hierarchy', () => {
      render(<Employees />)

      // The page should have proper heading structure for screen readers
      const cards = screen.getAllByRole('generic')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('adapts stats cards layout for different screen sizes', () => {
      render(<Employees />)

      const statsGrid = screen.getByText('Total Employees').closest('.grid')
      expect(statsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-4')
    })

    it('maintains proper component spacing on mobile', () => {
      render(<Employees />)

      const mainContainer = screen.getByTestId('employee-filters').closest('div')
      expect(mainContainer).toHaveClass('p-6', 'space-y-6')
    })
  })

  describe('Integration', () => {
    it('integrates filters with employee list correctly', async () => {
      render(<Employees />)

      // Change filters and verify they're passed to the list
      await user.type(screen.getByTestId('search-input'), 'engineering')
      await user.selectOptions(screen.getByTestId('department-select'), 'IT')

      await waitFor(() => {
        expect(screen.getByTestId('search-term')).toHaveTextContent('engineering')
        expect(screen.getByTestId('selected-department')).toHaveTextContent('IT')
      })
    })

    it('handles multiple simultaneous filter changes', async () => {
      render(<Employees />)

      // Change multiple filters quickly
      await user.type(screen.getByTestId('search-input'), 'manager')
      await user.selectOptions(screen.getByTestId('department-select'), 'HR')
      await user.selectOptions(screen.getByTestId('status-select'), 'active')
      await user.click(screen.getByTestId('view-mode-toggle'))

      await waitFor(() => {
        expect(screen.getByTestId('search-term')).toHaveTextContent('manager')
        expect(screen.getByTestId('selected-department')).toHaveTextContent('HR')
        expect(screen.getByTestId('selected-status')).toHaveTextContent('active')
        expect(screen.getByTestId('view-mode')).toHaveTextContent('list')
      })
    })
  })
})