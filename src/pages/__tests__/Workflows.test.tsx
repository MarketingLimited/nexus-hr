
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Workflows } from '../Workflows'
import { useWorkflows, useWorkflowTemplates, useWorkflowAnalytics } from '@/hooks/useWorkflow'

// Mock the hooks
vi.mock('@/hooks/useWorkflow')

const mockUseWorkflows = vi.mocked(useWorkflows)
const mockUseWorkflowTemplates = vi.mocked(useWorkflowTemplates)
const mockUseWorkflowAnalytics = vi.mocked(useWorkflowAnalytics)

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

const mockWorkflows = createMockQueryResult({
  data: [
    {
      id: 'wf-1',
      name: 'Employee Onboarding',
      status: 'active',
      progress: 75,
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 'wf-2',
      name: 'Leave Approval',
      status: 'paused',
      progress: 50,
      createdAt: '2024-01-14T09:00:00Z'
    }
  ],
  total: 2
})

const mockWorkflowTemplates = createMockQueryResult({
  data: [
    {
      id: 'tpl-1',
      name: 'Employee Onboarding Template',
      description: 'Standard onboarding process',
      category: 'HR',
      isPublic: true
    },
    {
      id: 'tpl-2',
      name: 'Performance Review Template',
      description: 'Quarterly performance review',
      category: 'Performance',
      isPublic: true
    }
  ]
})

const mockWorkflowAnalytics = createMockQueryResult({
  data: {
    activeWorkflows: 15,
    pendingTasks: 42,
    completedToday: 8,
    automationRate: 85
  }
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

describe('Workflows Page', () => {
  beforeEach(() => {
    mockUseWorkflows.mockReturnValue(mockWorkflows)
    mockUseWorkflowTemplates.mockReturnValue(mockWorkflowTemplates)
    mockUseWorkflowAnalytics.mockReturnValue(mockWorkflowAnalytics)
  })

  it('renders workflows page with navigation breadcrumb', () => {
    renderWithProviders(<Workflows />)
    
    expect(screen.getByText('Workflow Management')).toBeInTheDocument()
    expect(screen.getByText('Design, automate, and monitor business processes across your organization')).toBeInTheDocument()
  })

  it('displays workflow analytics cards', () => {
    renderWithProviders(<Workflows />)
    
    expect(screen.getByText('8')).toBeInTheDocument() // Active workflows
    expect(screen.getByText('23')).toBeInTheDocument() // Pending tasks
    expect(screen.getByText('45')).toBeInTheDocument() // Completed today
    expect(screen.getByText('87%')).toBeInTheDocument() // Automation rate
  })

  it('renders workflow tabs', () => {
    renderWithProviders(<Workflows />)
    
    expect(screen.getByRole('tab', { name: /workflow builder/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /active workflows/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /templates/i })).toBeInTheDocument()
  })

  it('displays workflow templates', async () => {
    renderWithProviders(<Workflows />)
    
    const templatesTab = screen.getByRole('tab', { name: /templates/i })
    fireEvent.click(templatesTab)
    
    await waitFor(() => {
      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument()
      expect(screen.getByText('Leave Approval')).toBeInTheDocument()
      expect(screen.getByText('Performance Review')).toBeInTheDocument()
      expect(screen.getByText('Document Approval')).toBeInTheDocument()
    })
  })

  it('shows active workflows with status', async () => {
    renderWithProviders(<Workflows />)
    
    const activeTab = screen.getByRole('tab', { name: /active workflows/i })
    fireEvent.click(activeTab)
    
    await waitFor(() => {
      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument()
      expect(screen.getByText('Leave Approval')).toBeInTheDocument()
      expect(screen.getByText('active')).toBeInTheDocument()
      expect(screen.getByText('paused')).toBeInTheDocument()
    })
  })

  it('handles action buttons', () => {
    renderWithProviders(<Workflows />)
    
    expect(screen.getByText('Workflow Settings')).toBeInTheDocument()
    expect(screen.getByText('New Workflow')).toBeInTheDocument()
  })

  it('switches between tabs correctly', async () => {
    renderWithProviders(<Workflows />)
    
    const builderTab = screen.getByRole('tab', { name: /workflow builder/i })
    fireEvent.click(builderTab)
    
    await waitFor(() => {
      expect(builderTab).toHaveAttribute('data-state', 'active')
    })
  })

  it('handles loading state', () => {
    mockUseWorkflowAnalytics.mockReturnValue(createMockQueryResult(null, {
      isLoading: true,
      isSuccess: false,
      status: 'pending'
    }))

    renderWithProviders(<Workflows />)
    
    // Should show loading state
    expect(screen.queryByText('8')).not.toBeInTheDocument()
  })

  it('handles template use action', async () => {
    renderWithProviders(<Workflows />)
    
    const templatesTab = screen.getByRole('tab', { name: /templates/i })
    fireEvent.click(templatesTab)
    
    await waitFor(() => {
      const useTemplateButtons = screen.getAllByText('Use Template')
      expect(useTemplateButtons).toHaveLength(6)
      
      fireEvent.click(useTemplateButtons[0])
      // Should trigger template usage (would need to mock the mutation)
    })
  })

  it('meets accessibility requirements', () => {
    renderWithProviders(<Workflows />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Workflow Management')
    
    // Check for proper tab accessibility
    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveAttribute('aria-selected')
    })
    
    // Check for proper button labeling
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAccessibleName()
    })
  })

  it('supports keyboard navigation', () => {
    renderWithProviders(<Workflows />)
    
    const firstTab = screen.getByRole('tab', { name: /workflow builder/i })
    const secondTab = screen.getByRole('tab', { name: /active workflows/i })
    
    firstTab.focus()
    expect(document.activeElement).toBe(firstTab)
    
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(secondTab)
  })
})
