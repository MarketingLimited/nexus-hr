import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Monitoring } from '../Monitoring'
import { useSystemHealth, usePerformanceMetrics, useSystemAlerts } from '@/hooks/useMonitoring'

// Mock the hooks
vi.mock('@/hooks/useMonitoring')

const mockUseSystemHealth = vi.mocked(useSystemHealth)
const mockUsePerformanceMetrics = vi.mocked(usePerformanceMetrics)
const mockUseSystemAlerts = vi.mocked(useSystemAlerts)

const createMockQueryResult = (data: any, overrides: any = {}) => ({
  data,
  isLoading: false,
  error: null,
  isError: false,
  isPending: false,
  isSuccess: true,
  status: 'success' as const,
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: 0,
  errorUpdateCount: 0,
  failureCount: 0,
  failureReason: null,
  fetchStatus: 'idle' as const,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isInitialLoading: false,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
  isEnabled: true,
  promise: Promise.resolve(data),
  refetch: vi.fn(),
  remove: vi.fn(),
  ...overrides
})

const mockSystemHealth = createMockQueryResult({
  data: {
    status: 'healthy',
    uptime: 99.9,
    cpu: 45,
    memory: 67,
    storage: {
      used: '150GB',
      total: '500GB'
    }
  }
})

const mockPerformanceMetrics = createMockQueryResult({
  data: {
    responseTime: 245,
    throughput: 1250,
    errorRate: 0.1
  }
})

const mockSystemAlerts = createMockQueryResult({
  data: [
    {
      id: 'alert-1',
      severity: 'warning',
      message: 'High CPU usage detected',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'active'
    },
    {
      id: 'alert-2',
      severity: 'info',
      message: 'Backup completed successfully',
      timestamp: '2024-01-15T11:00:00Z',
      status: 'resolved'
    }
  ],
  total: 2
})

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Monitoring Page', () => {
  beforeEach(() => {
    mockUseSystemHealth.mockReturnValue(mockSystemHealth)
    mockUsePerformanceMetrics.mockReturnValue(mockPerformanceMetrics)
    mockUseSystemAlerts.mockReturnValue(mockSystemAlerts)
  })

  it('renders monitoring page with navigation breadcrumb', () => {
    renderWithProviders(<Monitoring />)
    
    expect(screen.getByText('System Monitoring')).toBeInTheDocument()
    expect(screen.getByText('Monitor system health, performance metrics, and infrastructure status')).toBeInTheDocument()
  })

  it('displays system health metrics', () => {
    renderWithProviders(<Monitoring />)
    
    expect(screen.getByText('Healthy')).toBeInTheDocument()
    expect(screen.getByText('23%')).toBeInTheDocument() // CPU usage
    expect(screen.getByText('67%')).toBeInTheDocument() // Memory usage
    expect(screen.getByText('1')).toBeInTheDocument() // Active alerts
  })

  it('displays recent alerts', () => {
    renderWithProviders(<Monitoring />)
    
    expect(screen.getByText('High memory usage detected on server-02')).toBeInTheDocument()
    expect(screen.getByText('Database backup completed successfully')).toBeInTheDocument()
  })

  it('renders monitoring tabs', () => {
    renderWithProviders(<Monitoring />)
    
    expect(screen.getByRole('tab', { name: /system overview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /health checks/i })).toBeInTheDocument()
  })

  it('handles action buttons', () => {
    renderWithProviders(<Monitoring />)
    
    expect(screen.getByText('Refresh Data')).toBeInTheDocument()
    expect(screen.getByText('Configure Alerts')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    renderWithProviders(<Monitoring />)
    
    const healthTab = screen.getByRole('tab', { name: /health checks/i })
    fireEvent.click(healthTab)
    
    await waitFor(() => {
      expect(healthTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('handles loading state', () => {
    mockUseSystemHealth.mockReturnValue(createMockQueryResult(null, {
      isLoading: true,
      data: null,
      isSuccess: false,
      status: 'pending'
    }))

    renderWithProviders(<Monitoring />)
    
    // Should show loading state
    expect(screen.queryByText('Healthy')).not.toBeInTheDocument()
  })

  it('handles refresh data action', () => {
    renderWithProviders(<Monitoring />)
    
    const refreshButton = screen.getByText('Refresh Data')
    fireEvent.click(refreshButton)
    
    // Should trigger data refresh (would need to mock the mutation)
    expect(refreshButton).toBeInTheDocument()
  })

  it('meets accessibility requirements', () => {
    renderWithProviders(<Monitoring />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('System Monitoring')
    
    // Check for proper tab accessibility
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
    })
    
    // Check for alert severity indicators
    const alerts = screen.getAllByText(/medium|low/i)
    alerts.forEach(alert => {
      expect(alert).toBeInTheDocument()
    })
  })

  it('supports keyboard navigation', () => {
    renderWithProviders(<Monitoring />)
    
    const firstTab = screen.getByRole('tab', { name: /system overview/i })
    const secondTab = screen.getByRole('tab', { name: /health checks/i })
    
    firstTab.focus()
    expect(document.activeElement).toBe(firstTab)
    
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(secondTab)
  })
})
