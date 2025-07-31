import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, useParams } from 'react-router-dom'
import EmployeeProfile from '@/pages/EmployeeProfile'

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useParams: vi.fn(() => ({ id: '1' }))
  }
})

// Mock hooks
vi.mock('@/hooks/useEmployees', () => ({
  useEmployees: () => ({
    getEmployee: vi.fn(() => ({
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      position: 'Software Developer',
      department: 'Engineering',
      startDate: '2023-01-15',
      phone: '+1 555-0123',
      address: '123 Main St, City, State',
      manager: 'Jane Smith',
      salary: 75000,
      status: 'active'
    })),
    updateEmployee: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null
  })
}))

vi.mock('@/hooks/usePerformance', () => ({
  usePerformance: () => ({
    getEmployeePerformance: vi.fn(() => ({
      overallRating: 4.2,
      goals: [
        { title: 'Complete React Training', progress: 85, status: 'in_progress' }
      ],
      reviews: [
        { period: 'Q1 2024', rating: 4.0, reviewer: 'Jane Smith' }
      ]
    })),
    loading: false,
    error: null
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Admin User', role: 'admin' },
    isAuthenticated: true
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('EmployeeProfile Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders employee profile page', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/employee profile/i)).toBeInTheDocument()
  })

  it('displays employee information', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@company.com')).toBeInTheDocument()
    expect(screen.getByText('Software Developer')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('shows contact information', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText('+1 555-0123')).toBeInTheDocument()
    expect(screen.getByText('123 Main St, City, State')).toBeInTheDocument()
  })

  it('displays employment details', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText('2023-01-15')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows performance information', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/overall rating/i)).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('Complete React Training')).toBeInTheDocument()
  })

  it('provides edit functionality for authorized users', () => {
    renderWithRouter(<EmployeeProfile />)
    
    const editButton = screen.getByText(/edit profile/i)
    expect(editButton).toBeInTheDocument()
  })

  it('handles profile updates', async () => {
    const mockUpdate = vi.fn().mockResolvedValue({ success: true })
    vi.mocked(require('@/hooks/useEmployees').useEmployees).mockReturnValue({
      getEmployee: vi.fn(() => ({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@company.com',
        position: 'Software Developer',
        department: 'Engineering'
      })),
      updateEmployee: mockUpdate,
      loading: false,
      error: null
    })

    renderWithRouter(<EmployeeProfile />)
    
    const editButton = screen.getByText(/edit profile/i)
    fireEvent.click(editButton)
    
    const saveButton = screen.getByText(/save changes/i)
    fireEvent.click(saveButton)
    
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled()
    })
  })

  it('displays tabs for different sections', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/personal info/i)).toBeInTheDocument()
    expect(screen.getByText(/performance/i)).toBeInTheDocument()
    expect(screen.getByText(/documents/i)).toBeInTheDocument()
    expect(screen.getByText(/history/i)).toBeInTheDocument()
  })

  it('handles tab navigation', () => {
    renderWithRouter(<EmployeeProfile />)
    
    const performanceTab = screen.getByText(/performance/i)
    fireEvent.click(performanceTab)
    
    expect(screen.getByText(/goals progress/i)).toBeInTheDocument()
  })

  it('shows loading state', () => {
    vi.mocked(require('@/hooks/useEmployees').useEmployees).mockReturnValue({
      getEmployee: vi.fn(() => null),
      updateEmployee: vi.fn(),
      loading: true,
      error: null
    })

    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state for invalid employee ID', () => {
    vi.mocked(require('@/hooks/useEmployees').useEmployees).mockReturnValue({
      getEmployee: vi.fn(() => null),
      updateEmployee: vi.fn(),
      loading: false,
      error: 'Employee not found'
    })

    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/employee not found/i)).toBeInTheDocument()
  })

  it('restricts edit access based on permissions', () => {
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { id: '2', name: 'Regular User', role: 'employee' },
      isAuthenticated: true
    })

    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.queryByText(/edit profile/i)).not.toBeInTheDocument()
  })

  it('displays employee photo', () => {
    renderWithRouter(<EmployeeProfile />)
    
    const avatar = screen.getByRole('img', { name: /john doe/i })
    expect(avatar).toBeInTheDocument()
  })

  it('shows employee status', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/active/i)).toBeInTheDocument()
  })

  it('handles photo upload', () => {
    renderWithRouter(<EmployeeProfile />)
    
    const uploadButton = screen.getByText(/upload photo/i)
    expect(uploadButton).toBeInTheDocument()
  })

  it('displays employment history', () => {
    renderWithRouter(<EmployeeProfile />)
    
    const historyTab = screen.getByText(/history/i)
    fireEvent.click(historyTab)
    
    expect(screen.getByText(/position changes/i)).toBeInTheDocument()
    expect(screen.getByText(/salary history/i)).toBeInTheDocument()
  })

  it('shows direct reports for managers', () => {
    vi.mocked(require('@/hooks/useEmployees').useEmployees).mockReturnValue({
      getEmployee: vi.fn(() => ({
        id: '1',
        name: 'Jane Smith',
        position: 'Engineering Manager',
        directReports: ['emp1', 'emp2']
      })),
      updateEmployee: vi.fn(),
      loading: false,
      error: null
    })

    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/direct reports/i)).toBeInTheDocument()
  })

  it('handles emergency contact information', () => {
    renderWithRouter(<EmployeeProfile />)
    
    expect(screen.getByText(/emergency contact/i)).toBeInTheDocument()
  })

  it('navigates back to employee list', () => {
    renderWithRouter(<EmployeeProfile />)
    
    const backButton = screen.getByText(/back to employees/i)
    expect(backButton).toBeInTheDocument()
    expect(backButton.closest('a')).toHaveAttribute('href', '/employees')
  })
})