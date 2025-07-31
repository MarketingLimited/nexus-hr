
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Security } from '../Security'
import { useSecurityEvents, useSecurityMetrics, useActiveSessions } from '@/hooks/useSecurity'

// Mock the hooks
vi.mock('@/hooks/useSecurity')

const mockUseSecurityEvents = vi.mocked(useSecurityEvents)
const mockUseSecurityMetrics = vi.mocked(useSecurityMetrics)
const mockUseActiveSessions = vi.mocked(useActiveSessions)

const createMockQueryResult = (data: any) => ({
  data,
  isLoading: false,
  error: null,
  isError: false,
  isPending: false,
  isSuccess: true,
  status: 'success' as const,
  dataUpdatedAt: Date.now(),
  errorUpdatedAt: 0,
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
  refetch: vi.fn(),
  remove: vi.fn()
})

const mockSecurityEvents = createMockQueryResult({
  data: [
    {
      id: 'event-1',
      type: 'login',
      severity: 'low',
      userId: 'user-1',
      timestamp: '2024-01-15T10:00:00Z',
      description: 'Successful login',
      ipAddress: '192.168.1.1'
    },
    {
      id: 'event-2',
      type: 'failed_login',
      severity: 'medium',
      userId: 'user-2',
      timestamp: '2024-01-15T11:00:00Z',
      description: 'Failed login attempt',
      ipAddress: '192.168.1.2'
    }
  ],
  total: 2
})

const mockSecurityMetrics = createMockQueryResult({
  data: {
    totalEvents: 150,
    activeThreats: 2,
    failedLogins: 8,
    auditEvents: 45,
    activeDevices: 12
  }
})

const mockActiveSessions = createMockQueryResult({
  data: [
    {
      id: 'session-1',
      userId: 'user-1',
      device: 'Chrome/Desktop',
      location: 'New York, NY',
      lastActivity: '2024-01-15T12:00:00Z',
      isActive: true
    }
  ]
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

describe('Security Page', () => {
  beforeEach(() => {
    mockUseSecurityEvents.mockReturnValue(mockSecurityEvents)
    mockUseSecurityMetrics.mockReturnValue(mockSecurityMetrics)
    mockUseActiveSessions.mockReturnValue(mockActiveSessions)
  })

  it('renders security page with navigation breadcrumb', () => {
    renderWithProviders(<Security />)
    
    expect(screen.getByText('Security Management')).toBeInTheDocument()
    expect(screen.getByText('Monitor security threats, manage user access, and track system activities')).toBeInTheDocument()
  })

  it('displays security metrics cards', () => {
    renderWithProviders(<Security />)
    
    expect(screen.getByText('3')).toBeInTheDocument() // Active threats
    expect(screen.getByText('12')).toBeInTheDocument() // Failed logins
    expect(screen.getByText('1,234')).toBeInTheDocument() // Audit events
    expect(screen.getByText('156')).toBeInTheDocument() // Active devices
  })

  it('shows security level badge', () => {
    renderWithProviders(<Security />)
    
    expect(screen.getByText('Security Level: High')).toBeInTheDocument()
  })

  it('renders security tabs', () => {
    renderWithProviders(<Security />)
    
    expect(screen.getByRole('tab', { name: /security overview/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /audit trail/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /device management/i })).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    renderWithProviders(<Security />)
    
    const auditTab = screen.getByRole('tab', { name: /audit trail/i })
    fireEvent.click(auditTab)
    
    await waitFor(() => {
      expect(auditTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('handles loading state', () => {
    mockUseSecurityMetrics.mockReturnValue({
      ...mockSecurityMetrics,
      isLoading: true,
      data: null
    })

    renderWithProviders(<Security />)
    
    // Should show loading state or skeleton
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('handles error state', () => {
    mockUseSecurityMetrics.mockReturnValue({
      ...mockSecurityMetrics,
      error: new Error('Failed to fetch'),
      data: null,
      isError: true,
      isSuccess: false
    })

    renderWithProviders(<Security />)
    
    // Should handle error gracefully
    expect(screen.getByText('Security Management')).toBeInTheDocument()
  })

  it('meets accessibility requirements', () => {
    renderWithProviders(<Security />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Security Management')
    
    // Check for proper tab accessibility
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
    })
    
    // Check for proper labeling
    expect(screen.getByText('Security Level: High')).toBeInTheDocument()
  })

  it('supports keyboard navigation', () => {
    renderWithProviders(<Security />)
    
    const firstTab = screen.getByRole('tab', { name: /security overview/i })
    const secondTab = screen.getByRole('tab', { name: /audit trail/i })
    
    firstTab.focus()
    expect(document.activeElement).toBe(firstTab)
    
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(secondTab)
  })
})
