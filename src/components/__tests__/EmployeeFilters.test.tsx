import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import EmployeeFilters from '@/components/employees/EmployeeFilters'

const mockProps = {
  searchTerm: '',
  onSearchChange: vi.fn(),
  selectedDepartment: 'all',
  onDepartmentChange: vi.fn(),
  selectedStatus: 'all', 
  onStatusChange: vi.fn(),
  viewMode: 'grid' as const,
  onViewModeChange: vi.fn()
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('EmployeeFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the header section correctly', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    expect(screen.getByText('Employee Directory')).toBeInTheDocument()
    expect(screen.getByText('Manage your team members')).toBeInTheDocument()
  })

  it('displays the Add Employee button with correct link', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const addButton = screen.getByText('Add Employee')
    expect(addButton).toBeInTheDocument()
    expect(addButton.closest('a')).toHaveAttribute('href', '/employees/new')
  })

  it('renders search input with correct placeholder', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search employees by name, email, or position...')
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
  })

  it('calls onSearchChange when search input changes', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search employees by name, email, or position...')
    fireEvent.change(searchInput, { target: { value: 'John Doe' } })
    
    expect(mockProps.onSearchChange).toHaveBeenCalledWith('John Doe')
  })

  it('displays current search term in input', () => {
    const propsWithSearch = { ...mockProps, searchTerm: 'Jane Smith' }
    renderWithRouter(<EmployeeFilters {...propsWithSearch} />)
    
    const searchInput = screen.getByDisplayValue('Jane Smith')
    expect(searchInput).toBeInTheDocument()
  })

  it('renders department filter with all options', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    // Click to open department dropdown
    const departmentTrigger = screen.getByText('Department')
    fireEvent.click(departmentTrigger)
    
    expect(screen.getByText('All Departments')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Design')).toBeInTheDocument()
    expect(screen.getByText('Human Resources')).toBeInTheDocument()
    expect(screen.getByText('Sales')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
    expect(screen.getByText('Marketing')).toBeInTheDocument()
  })

  it('renders status filter with options', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    // Click to open status dropdown
    const statusTrigger = screen.getByText('Status')
    fireEvent.click(statusTrigger)
    
    expect(screen.getByText('All Status')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('renders view mode toggle buttons', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const viewModeContainer = screen.getByRole('button', { name: '' }).closest('.flex.border')
    expect(viewModeContainer).toBeInTheDocument()
    
    const buttons = screen.getAllByRole('button')
    const gridButton = buttons.find(btn => btn.querySelector('.lucide-grid'))
    const listButton = buttons.find(btn => btn.querySelector('.lucide-list'))
    
    expect(gridButton).toBeInTheDocument()
    expect(listButton).toBeInTheDocument()
  })

  it('applies active styling to current view mode', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    const gridButton = buttons.find(btn => btn.querySelector('.lucide-grid'))
    
    // Grid mode is active, so button should not have ghost variant
    expect(gridButton).not.toHaveClass('bg-transparent')
  })

  it('calls onViewModeChange when view mode is toggled', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    const listButton = buttons.find(btn => btn.querySelector('.lucide-list'))
    
    fireEvent.click(listButton!)
    expect(mockProps.onViewModeChange).toHaveBeenCalledWith('list')
  })

  it('renders export button', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const exportButton = screen.getByText('Export')
    expect(exportButton).toBeInTheDocument()
    expect(exportButton.closest('button')).toHaveClass('gap-2')
  })

  it('includes search icon in search input', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const searchContainer = screen.getByPlaceholderText('Search employees by name, email, or position...').closest('.relative')
    const searchIcon = searchContainer?.querySelector('.lucide-search')
    expect(searchIcon).toBeInTheDocument()
  })

  it('includes download icon in export button', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const exportButton = screen.getByText('Export').closest('button')
    const downloadIcon = exportButton?.querySelector('.lucide-download')
    expect(downloadIcon).toBeInTheDocument()
  })

  it('includes plus icon in add employee button', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const addButton = screen.getByText('Add Employee').closest('a')
    const plusIcon = addButton?.querySelector('.lucide-plus')
    expect(plusIcon).toBeInTheDocument()
  })

  it('uses responsive layout classes', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const filtersRow = screen.getByPlaceholderText('Search employees by name, email, or position...').closest('.flex')
    expect(filtersRow).toHaveClass('flex-col', 'lg:flex-row', 'gap-4')
  })

  it('applies correct select widths on different screen sizes', () => {
    renderWithRouter(<EmployeeFilters {...mockProps} />)
    
    const departmentSelect = screen.getByText('Department').closest('button')
    const statusSelect = screen.getByText('Status').closest('button')
    
    expect(departmentSelect).toHaveClass('w-full', 'lg:w-48')
    expect(statusSelect).toHaveClass('w-full', 'lg:w-32')
  })

  it('maintains filter state correctly', () => {
    const propsWithFilters = {
      ...mockProps,
      searchTerm: 'test search',
      selectedDepartment: 'Engineering',
      selectedStatus: 'active',
      viewMode: 'list' as const
    }
    
    renderWithRouter(<EmployeeFilters {...propsWithFilters} />)
    
    expect(screen.getByDisplayValue('test search')).toBeInTheDocument()
    
    // List view should be active
    const buttons = screen.getAllByRole('button')
    const listButton = buttons.find(btn => btn.querySelector('.lucide-list'))
    expect(listButton).not.toHaveClass('bg-transparent')
  })
})