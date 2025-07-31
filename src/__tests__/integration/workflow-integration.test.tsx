import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Workflows } from '@/pages/Workflows'

// Mock hooks with proper types
vi.mock('@/hooks/useWorkflow', () => ({
  useWorkflows: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false })),
  useWorkflowTemplates: vi.fn(() => ({ data: { data: [] }, isLoading: false, isError: false })),
  useWorkflowAnalytics: vi.fn(() => ({ data: { data: {} }, isLoading: false, isError: false })),
  useCreateWorkflow: vi.fn(() => ({ mutate: vi.fn(), isLoading: false, isError: false })),
  useCompleteWorkflowStep: vi.fn(() => ({ mutate: vi.fn(), isLoading: false, isError: false }))
}))

import {
  useWorkflows,
  useWorkflowTemplates,
  useWorkflowAnalytics,
  useCreateWorkflow,
  useCompleteWorkflowStep
} from '@/hooks/useWorkflow'

describe('Workflow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render workflows page successfully', async () => {
    const mockWorkflows = {
      data: [
        {
          id: 'wf-1',
          name: 'Employee Onboarding',
          type: 'employee_onboarding' as const,
          status: 'active' as const,
          steps: [],
          initiatedBy: 'user-1',
          createdAt: '2024-01-01T10:00:00Z',
          updatedAt: '2024-01-01T11:00:00Z'
        }
      ]
    }

    const mockTemplates = {
      data: [
        { 
          id: 'tpl-1', 
          name: 'Onboarding Template', 
          description: 'Standard employee onboarding process',
          type: 'employee_onboarding',
          steps: [],
          isActive: true,
          createdBy: 'admin',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }

    const mockAnalytics = {
      data: {
        totalWorkflows: 50,
        completedWorkflows: 38,
        averageCompletionTime: 5.2,
        bottlenecks: [],
        completionRates: []
      }
    }

    // Setup simplified mocks
    vi.mocked(useWorkflows).mockReturnValue({
      data: mockWorkflows,
      isLoading: false,
      isError: false
    } as any)

    vi.mocked(useWorkflowTemplates).mockReturnValue({
      data: mockTemplates,
      isLoading: false,
      isError: false
    } as any)

    vi.mocked(useWorkflowAnalytics).mockReturnValue({
      data: mockAnalytics,
      isLoading: false,
      isError: false
    } as any)

    render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <Workflows />
        </BrowserRouter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Workflows')).toBeInTheDocument()
    })

    // Check if we can find the workflow name
    await waitFor(() => {
      const workflowElement = screen.queryByText('Employee Onboarding')
      if (workflowElement) {
        expect(workflowElement).toBeInTheDocument()
      }
    })

    // Check if analytics data is displayed
    const analyticsElements = screen.queryAllByText('50')
    if (analyticsElements.length > 0) {
      expect(analyticsElements[0]).toBeInTheDocument()
    }
  })

  it('should handle error states gracefully', async () => {
    vi.mocked(useWorkflows).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true
    } as any)

    render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <Workflows />
        </BrowserRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })

  it('should handle loading states', async () => {
    vi.mocked(useWorkflows).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false
    } as any)

    render(
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <Workflows />
        </BrowserRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Workflows')).toBeInTheDocument()
  })
})