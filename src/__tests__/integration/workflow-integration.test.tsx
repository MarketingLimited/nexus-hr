import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import Workflows from '@/pages/Workflows'
import { workflowService } from '@/services/workflowService'

// Mock the workflow service
vi.mock('@/services/workflowService', () => ({
  workflowService: {
    getWorkflows: vi.fn(),
    getWorkflowTemplates: vi.fn(),
    getWorkflowAnalytics: vi.fn(),
    createWorkflow: vi.fn(),
    updateWorkflow: vi.fn(),
    deleteWorkflow: vi.fn(),
    startWorkflow: vi.fn(),
    completeStep: vi.fn()
  }
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle complete workflow lifecycle', async () => {
    // Mock data
    const mockWorkflows = {
      data: [
        {
          id: 'wf-1',
          name: 'Employee Onboarding',
          status: 'active',
          steps: [
            { id: 'step-1', name: 'Create Account', status: 'completed' },
            { id: 'step-2', name: 'Setup Workspace', status: 'pending' }
          ]
        }
      ],
      total: 1
    }

    const mockTemplates = {
      data: [
        {
          id: 'template-1',
          name: 'Standard Onboarding',
          category: 'hr'
        }
      ]
    }

    const mockAnalytics = {
      totalWorkflows: 50,
      activeWorkflows: 15,
      completedWorkflows: 30,
      averageCompletionTime: 5.2
    }

    vi.mocked(workflowService.getWorkflows).mockResolvedValue(mockWorkflows)
    vi.mocked(workflowService.getWorkflowTemplates).mockResolvedValue(mockTemplates)
    vi.mocked(workflowService.getWorkflowAnalytics).mockResolvedValue(mockAnalytics)

    render(<Workflows />, { wrapper: createWrapper() })

    // Verify workflow data loads
    await waitFor(() => {
      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument()
    })

    // Verify templates load
    await waitFor(() => {
      expect(screen.getByText('Standard Onboarding')).toBeInTheDocument()
    })

    // Verify analytics load
    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument() // Total workflows
    })
  })

  it('should handle workflow step completion', async () => {
    const mockWorkflows = {
      data: [
        {
          id: 'wf-1',
          name: 'Employee Onboarding',
          status: 'active',
          steps: [
            { id: 'step-1', name: 'Create Account', status: 'completed' },
            { id: 'step-2', name: 'Setup Workspace', status: 'pending' }
          ]
        }
      ]
    }

    vi.mocked(workflowService.getWorkflows).mockResolvedValue(mockWorkflows)
    vi.mocked(workflowService.completeStep).mockResolvedValue({ success: true })

    render(<Workflows />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Employee Onboarding')).toBeInTheDocument()
    })

    // Find and click complete button for pending step
    const completeButton = screen.getByRole('button', { name: /complete/i })
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(workflowService.completeStep).toHaveBeenCalled()
    })
  })

  it('should handle workflow creation from template', async () => {
    const mockTemplates = {
      data: [
        {
          id: 'template-1',
          name: 'Standard Onboarding',
          category: 'hr',
          steps: [
            { name: 'Create Account', estimatedDuration: 1 },
            { name: 'Setup Workspace', estimatedDuration: 2 }
          ]
        }
      ]
    }

    vi.mocked(workflowService.getWorkflowTemplates).mockResolvedValue(mockTemplates)
    vi.mocked(workflowService.createWorkflow).mockResolvedValue({
      id: 'new-wf-1',
      name: 'New Employee Onboarding',
      status: 'active'
    })

    render(<Workflows />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Standard Onboarding')).toBeInTheDocument()
    })

    // Click create workflow from template
    const createButton = screen.getByRole('button', { name: /create workflow/i })
    fireEvent.click(createButton)

    await waitFor(() => {
      expect(workflowService.createWorkflow).toHaveBeenCalled()
    })
  })

  it('should handle error states gracefully', async () => {
    vi.mocked(workflowService.getWorkflows).mockRejectedValue(new Error('Network error'))

    render(<Workflows />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('should handle loading states', async () => {
    // Mock delayed response
    vi.mocked(workflowService.getWorkflows).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<Workflows />, { wrapper: createWrapper() })

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should filter workflows by status', async () => {
    const mockWorkflows = {
      data: [
        { id: 'wf-1', name: 'Active Workflow', status: 'active' },
        { id: 'wf-2', name: 'Completed Workflow', status: 'completed' },
        { id: 'wf-3', name: 'Paused Workflow', status: 'paused' }
      ]
    }

    vi.mocked(workflowService.getWorkflows).mockResolvedValue(mockWorkflows)

    render(<Workflows />, { wrapper: createWrapper() })

    await waitFor(() => {
      expect(screen.getByText('Active Workflow')).toBeInTheDocument()
    })

    // Filter by status
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    fireEvent.click(statusFilter)
    
    const activeOption = screen.getByRole('option', { name: /active/i })
    fireEvent.click(activeOption)

    // Verify filtering works
    expect(workflowService.getWorkflows).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'active' })
    )
  })
})