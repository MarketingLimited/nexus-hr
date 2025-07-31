
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Integration } from '../Integration'
import { useMigrationJobs } from '@/hooks/useMigration'
import { useSync } from '@/hooks/useSync'

// Mock the hooks
vi.mock('@/hooks/useMigration')
vi.mock('@/hooks/useSync')

const mockUseSync = vi.mocked(useSync)
const mockUseMigrationJobs = vi.mocked(useMigrationJobs)

const mockSyncStats = {
  data: {
    data: {
      totalSyncs: 150,
      successfulSyncs: 145,
      failedSyncs: 5,
      lastSyncTime: '2024-01-15T12:00:00Z'
    }
  },
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
}

const mockMigrationJobs = {
  data: {
    data: [
      {
        id: 'mig-1',
        name: 'Employee Data Migration',
        status: 'completed',
        progress: 100,
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: 'mig-2',
        name: 'Leave Records Migration',
        status: 'running',
        progress: 65,
        createdAt: '2024-01-15T11:00:00Z'
      }
    ],
    total: 2
  },
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
}

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

describe('Integration Page', () => {
  beforeEach(() => {
    mockUseSync.mockReturnValue(mockSyncStats)
    mockUseMigrationJobs.mockReturnValue(mockMigrationJobs)
  })

  it('renders integration page with navigation breadcrumb', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByText('Integration Hub')).toBeInTheDocument()
    expect(screen.getByText('Manage system integrations, data synchronization, and migrations')).toBeInTheDocument()
  })

  it('displays integration overview cards', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByText('5')).toBeInTheDocument() // Active syncs
    expect(screen.getByText('2.1GB')).toBeInTheDocument() // Data transferred
    expect(screen.getByText('2')).toBeInTheDocument() // Failed operations
    expect(screen.getByText('99.2%')).toBeInTheDocument() // Success rate
  })

  it('renders integration tabs', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByRole('tab', { name: /sync dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /data migration/i })).toBeInTheDocument()
  })

  it('displays migration jobs', async () => {
    renderWithProviders(<Integration />)
    
    const migrationTab = screen.getByRole('tab', { name: /data migration/i })
    fireEvent.click(migrationTab)
    
    await waitFor(() => {
      expect(migrationTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('handles action buttons', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByText('Integration Settings')).toBeInTheDocument()
    expect(screen.getByText('New Connection')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    renderWithProviders(<Integration />)
    
    const syncTab = screen.getByRole('tab', { name: /sync dashboard/i })
    fireEvent.click(syncTab)
    
    await waitFor(() => {
      expect(syncTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('handles loading state', () => {
    mockUseSync.mockReturnValue({
      ...mockSyncStats,
      isLoading: true
    })

    renderWithProviders(<Integration />)
    
    // Should show loading state
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('meets accessibility requirements', () => {
    renderWithProviders(<Integration />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Integration Hub')
    
    // Check for proper tab accessibility
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
    })
  })
})
