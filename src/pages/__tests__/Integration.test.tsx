import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Integration from '../Integration'
import { useSyncStats, useMigrationJobs } from '@/hooks/useMigration'

// Mock the hooks
vi.mock('@/hooks/useMigration')
vi.mock('@/hooks/useSync')

const mockUseSyncStats = vi.mocked(useSyncStats)
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
  error: null
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
  error: null
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
    vi.mocked(useSyncStats).mockReturnValue(mockSyncStats)
    mockUseMigrationJobs.mockReturnValue(mockMigrationJobs)
  })

  it('renders integration page with navigation breadcrumb', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByText('Integration Hub')).toBeInTheDocument()
    expect(screen.getByText('Manage system integrations and data migration')).toBeInTheDocument()
  })

  it('displays integration overview cards', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByText('150')).toBeInTheDocument() // Total syncs
    expect(screen.getByText('145')).toBeInTheDocument() // Successful syncs
    expect(screen.getByText('5')).toBeInTheDocument() // Failed syncs
    expect(screen.getByText('97%')).toBeInTheDocument() // Success rate
  })

  it('renders integration tabs', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByRole('tab', { name: /sync dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /data migration/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /api connections/i })).toBeInTheDocument()
  })

  it('displays migration jobs', async () => {
    renderWithProviders(<Integration />)
    
    const migrationTab = screen.getByRole('tab', { name: /data migration/i })
    fireEvent.click(migrationTab)
    
    await waitFor(() => {
      expect(screen.getByText('Employee Data Migration')).toBeInTheDocument()
      expect(screen.getByText('Leave Records Migration')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Running')).toBeInTheDocument()
    })
  })

  it('handles action buttons', () => {
    renderWithProviders(<Integration />)
    
    expect(screen.getByText('Integration Settings')).toBeInTheDocument()
    expect(screen.getByText('New Migration')).toBeInTheDocument()
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
    vi.mocked(useSyncStats).mockReturnValue({
      ...mockSyncStats,
      isLoading: true
    })

    renderWithProviders(<Integration />)
    
    // Should show loading state
    expect(screen.queryByText('150')).not.toBeInTheDocument()
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