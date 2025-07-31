import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Workflows from '../Workflows'
import { useWorkflows, useWorkflowTemplates, useWorkflowAnalytics } from '@/hooks/useWorkflow'

// Mock the hooks
vi.mock('@/hooks/useWorkflow')

const mockUseWorkflows = vi.mocked(useWorkflows)
const mockUseWorkflowTemplates = vi.mocked(useWorkflowTemplates)
const mockUseWorkflowAnalytics = vi.mocked(useWorkflowAnalytics)

const mockWorkflows = {
  data: {
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
  },
  isLoading: false,
  error: null
}

const mockWorkflowTemplates = {
  data: {
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
  },
  isLoading: false,
  error: null
}

const mockWorkflowAnalytics = {
  data: {
    data: {
      activeWorkflows: 15,
      pendingTasks: 42,
      completedToday: 8,
      automationRate: 85
    }
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

describe('Workflows Page', () => {
  beforeEach(() => {
    mockUseWorkflows.mockReturnValue(mockWorkflows)
    mockUseWorkflowTemplates.mockReturnValue(mockWorkflowTemplates)
    mockUseWorkflowAnalytics.mockReturnValue(mockWorkflowAnalytics)
  })

  it('renders workflows page with navigation breadcrumb', () => {
    renderWithProviders(<Workflows />)
    
    expect(screen.getByText('Workflow Management')).toBeInTheDocument()
    expect(screen.getByText('Design and manage automated workflows')).toBeInTheDocument()
  })

  it('displays workflow analytics cards', () => {
    renderWithProviders(<Workflows />)
    
    expect(screen.getByText('15')).toBeInTheDocument() // Active workflows
    expect(screen.getByText('42')).toBeInTheDocument() // Pending tasks
    expect(screen.getByText('8')).toBeInTheDocument() // Completed today
    expect(screen.getByText('85%')).toBeInTheDocument() // Automation rate
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
      expect(screen.getByText('Employee Onboarding Template')).toBeInTheDocument()
      expect(screen.getByText('Performance Review Template')).toBeInTheDocument()
    })
  })

  it('shows active workflows with status', async () => {
    renderWithProviders(<Workflows />)
    
    const activeTab = screen.getByRole('tab', { name: /active workflows/i })
    fireEvent.click(activeTab)
    
    await waitFor(() => {
      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument()
      expect(screen.getByText('Leave Approval')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Paused')).toBeInTheDocument()
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
    mockUseWorkflowAnalytics.mockReturnValue({
      ...mockWorkflowAnalytics,
      isLoading: true
    })

    renderWithProviders(<Workflows />)
    
    // Should show loading state
    expect(screen.queryByText('15')).not.toBeInTheDocument()
  })

  it('handles template use action', async () => {
    renderWithProviders(<Workflows />)
    
    const templatesTab = screen.getByRole('tab', { name: /templates/i })
    fireEvent.click(templatesTab)
    
    await waitFor(() => {
      const useTemplateButtons = screen.getAllByText('Use Template')
      expect(useTemplateButtons).toHaveLength(2)
      
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