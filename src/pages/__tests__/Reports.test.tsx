import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Reports from '@/pages/Reports'

// Mock hooks
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    getReports: vi.fn(() => [
      { id: '1', name: 'Employee Report', type: 'employee', lastGenerated: '2024-02-01' },
      { id: '2', name: 'Payroll Summary', type: 'payroll', lastGenerated: '2024-02-15' },
      { id: '3', name: 'Attendance Report', type: 'attendance', lastGenerated: '2024-02-10' }
    ]),
    generateReport: vi.fn().mockResolvedValue({ success: true, reportId: 'new-123' }),
    downloadReport: vi.fn(),
    getReportData: vi.fn(() => ({
      totalEmployees: 150,
      avgSalary: 65000,
      attendanceRate: 96.5
    })),
    loading: false,
    error: null
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'Manager', role: 'manager' },
    isAuthenticated: true
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('Reports Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders reports page', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/reports & analytics/i)).toBeInTheDocument()
  })

  it('displays available reports', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText('Employee Report')).toBeInTheDocument()
    expect(screen.getByText('Payroll Summary')).toBeInTheDocument()
    expect(screen.getByText('Attendance Report')).toBeInTheDocument()
  })

  it('shows report types', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/employee/i)).toBeInTheDocument()
    expect(screen.getByText(/payroll/i)).toBeInTheDocument()
    expect(screen.getByText(/attendance/i)).toBeInTheDocument()
  })

  it('displays last generated dates', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText('2024-02-01')).toBeInTheDocument()
    expect(screen.getByText('2024-02-15')).toBeInTheDocument()
    expect(screen.getByText('2024-02-10')).toBeInTheDocument()
  })

  it('provides report generation functionality', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/generate new report/i)).toBeInTheDocument()
  })

  it('handles report generation', async () => {
    const mockGenerate = vi.fn().mockResolvedValue({ success: true, reportId: 'new-123' })
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getReports: vi.fn(() => []),
      generateReport: mockGenerate,
      downloadReport: vi.fn(),
      getReportData: vi.fn(() => ({})),
      loading: false,
      error: null
    })

    renderWithRouter(<Reports />)
    
    const generateButton = screen.getByText(/generate new report/i)
    fireEvent.click(generateButton)
    
    // Select report type
    const employeeOption = screen.getByText(/employee report/i)
    fireEvent.click(employeeOption)
    
    const confirmButton = screen.getByText(/generate/i)
    fireEvent.click(confirmButton)
    
    await waitFor(() => {
      expect(mockGenerate).toHaveBeenCalledWith('employee')
    })
  })

  it('provides download functionality', () => {
    const mockDownload = vi.fn()
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getReports: vi.fn(() => [
        { id: '1', name: 'Employee Report', type: 'employee', lastGenerated: '2024-02-01' }
      ]),
      generateReport: vi.fn(),
      downloadReport: mockDownload,
      getReportData: vi.fn(() => ({})),
      loading: false,
      error: null
    })

    renderWithRouter(<Reports />)
    
    const downloadButton = screen.getByText(/download/i)
    fireEvent.click(downloadButton)
    
    expect(mockDownload).toHaveBeenCalledWith('1')
  })

  it('displays report filters', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/filter by type/i)).toBeInTheDocument()
    expect(screen.getByText(/date range/i)).toBeInTheDocument()
    expect(screen.getByText(/department/i)).toBeInTheDocument()
  })

  it('shows quick stats dashboard', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/total employees/i)).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByText(/average salary/i)).toBeInTheDocument()
    expect(screen.getByText('65,000')).toBeInTheDocument()
  })

  it('displays attendance metrics', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/attendance rate/i)).toBeInTheDocument()
    expect(screen.getByText('96.5%')).toBeInTheDocument()
  })

  it('provides scheduled reports option', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/schedule report/i)).toBeInTheDocument()
  })

  it('shows report history', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/report history/i)).toBeInTheDocument()
    expect(screen.getByText(/recent generations/i)).toBeInTheDocument()
  })

  it('handles custom date ranges', () => {
    renderWithRouter(<Reports />)
    
    const dateRangeButton = screen.getByText(/custom range/i)
    fireEvent.click(dateRangeButton)
    
    expect(screen.getByText(/start date/i)).toBeInTheDocument()
    expect(screen.getByText(/end date/i)).toBeInTheDocument()
  })

  it('displays export options', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/export as pdf/i)).toBeInTheDocument()
    expect(screen.getByText(/export as excel/i)).toBeInTheDocument()
    expect(screen.getByText(/export as csv/i)).toBeInTheDocument()
  })

  it('shows loading state during generation', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getReports: vi.fn(() => []),
      generateReport: vi.fn(),
      downloadReport: vi.fn(),
      getReportData: vi.fn(() => ({})),
      loading: true,
      error: null
    })

    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/generating report/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getReports: vi.fn(() => []),
      generateReport: vi.fn(),
      downloadReport: vi.fn(),
      getReportData: vi.fn(() => ({})),
      loading: false,
      error: 'Failed to load reports'
    })

    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/error loading reports/i)).toBeInTheDocument()
  })

  it('requires manager permissions', () => {
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { id: '1', name: 'Employee', role: 'employee' },
      isAuthenticated: true
    })

    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/access restricted/i)).toBeInTheDocument()
  })

  it('shows empty state when no reports', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getReports: vi.fn(() => []),
      generateReport: vi.fn(),
      downloadReport: vi.fn(),
      getReportData: vi.fn(() => ({})),
      loading: false,
      error: null
    })

    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/no reports available/i)).toBeInTheDocument()
  })

  it('handles report sharing', () => {
    renderWithRouter(<Reports />)
    
    const shareButton = screen.getByText(/share/i)
    fireEvent.click(shareButton)
    
    expect(screen.getByText(/share report/i)).toBeInTheDocument()
  })

  it('displays report templates', () => {
    renderWithRouter(<Reports />)
    
    expect(screen.getByText(/report templates/i)).toBeInTheDocument()
    expect(screen.getByText(/monthly summary/i)).toBeInTheDocument()
    expect(screen.getByText(/quarterly review/i)).toBeInTheDocument()
  })
})