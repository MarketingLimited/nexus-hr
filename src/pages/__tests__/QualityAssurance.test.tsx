import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import QualityAssurance from '@/pages/QualityAssurance'

// Mock hooks
vi.mock('@/hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    getQualityMetrics: vi.fn(() => ({
      testCoverage: 92,
      codeQuality: 8.5,
      bugReports: 3,
      performanceScore: 95
    })),
    getBugReports: vi.fn(() => [
      { id: '1', title: 'Login issue', severity: 'high', status: 'open' },
      { id: '2', title: 'UI glitch', severity: 'low', status: 'resolved' }
    ]),
    getTestResults: vi.fn(() => ({
      total: 150,
      passed: 145,
      failed: 3,
      skipped: 2
    })),
    loading: false,
    error: null
  })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1', name: 'QA Manager', role: 'admin' },
    isAuthenticated: true
  })
}))

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('QualityAssurance Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders quality assurance page', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/quality assurance/i)).toBeInTheDocument()
  })

  it('displays quality metrics dashboard', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/test coverage/i)).toBeInTheDocument()
    expect(screen.getByText('92%')).toBeInTheDocument()
    expect(screen.getByText(/code quality/i)).toBeInTheDocument()
    expect(screen.getByText('8.5')).toBeInTheDocument()
  })

  it('shows bug report statistics', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/bug reports/i)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('displays performance score', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/performance score/i)).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()
  })

  it('lists recent bug reports', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText('Login issue')).toBeInTheDocument()
    expect(screen.getByText('UI glitch')).toBeInTheDocument()
  })

  it('shows bug severity levels', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/high/i)).toBeInTheDocument()
    expect(screen.getByText(/low/i)).toBeInTheDocument()
  })

  it('displays test results summary', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/test results/i)).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument() // total
    expect(screen.getByText('145')).toBeInTheDocument() // passed
    expect(screen.getByText('3')).toBeInTheDocument() // failed
  })

  it('provides test execution controls', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/run tests/i)).toBeInTheDocument()
    expect(screen.getByText(/view logs/i)).toBeInTheDocument()
  })

  it('shows code quality trends', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/quality trends/i)).toBeInTheDocument()
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument()
  })

  it('displays accessibility audit results', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/accessibility/i)).toBeInTheDocument()
    expect(screen.getByText(/wcag compliance/i)).toBeInTheDocument()
  })

  it('handles test execution', () => {
    renderWithRouter(<QualityAssurance />)
    
    const runTestsButton = screen.getByText(/run tests/i)
    fireEvent.click(runTestsButton)
    
    expect(screen.getByText(/tests running/i)).toBeInTheDocument()
  })

  it('filters bug reports by status', () => {
    renderWithRouter(<QualityAssurance />)
    
    const statusFilter = screen.getByText(/all status/i)
    fireEvent.click(statusFilter)
    
    expect(screen.getByText(/open/i)).toBeInTheDocument()
    expect(screen.getByText(/resolved/i)).toBeInTheDocument()
  })

  it('shows code coverage details', () => {
    renderWithRouter(<QualityAssurance />)
    
    const coverageButton = screen.getByText(/view coverage/i)
    fireEvent.click(coverageButton)
    
    expect(screen.getByText(/coverage report/i)).toBeInTheDocument()
  })

  it('displays performance benchmarks', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/performance benchmarks/i)).toBeInTheDocument()
    expect(screen.getByText(/load time/i)).toBeInTheDocument()
  })

  it('shows security scan results', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/security scan/i)).toBeInTheDocument()
    expect(screen.getByText(/vulnerabilities/i)).toBeInTheDocument()
  })

  it('provides bug reporting functionality', () => {
    renderWithRouter(<QualityAssurance />)
    
    const reportBugButton = screen.getByText(/report bug/i)
    expect(reportBugButton).toBeInTheDocument()
  })

  it('displays test automation status', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/automation/i)).toBeInTheDocument()
    expect(screen.getByText(/ci\/cd pipeline/i)).toBeInTheDocument()
  })

  it('shows quality gates', () => {
    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/quality gates/i)).toBeInTheDocument()
    expect(screen.getByText(/deployment ready/i)).toBeInTheDocument()
  })

  it('handles loading state', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getQualityMetrics: vi.fn(() => null),
      getBugReports: vi.fn(() => []),
      getTestResults: vi.fn(() => null),
      loading: true,
      error: null
    })

    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('displays error state', () => {
    vi.mocked(require('@/hooks/useAnalytics').useAnalytics).mockReturnValue({
      getQualityMetrics: vi.fn(() => null),
      getBugReports: vi.fn(() => []),
      getTestResults: vi.fn(() => null),
      loading: false,
      error: 'Failed to load QA data'
    })

    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })

  it('requires appropriate permissions', () => {
    vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
      user: { id: '1', name: 'Regular User', role: 'employee' },
      isAuthenticated: true
    })

    renderWithRouter(<QualityAssurance />)
    
    expect(screen.getByText(/access denied/i)).toBeInTheDocument()
  })
})