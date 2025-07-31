import { api, ApiResponse } from './api'

export interface WorkflowStep {
  id: string
  name: string
  type: 'manual' | 'automated' | 'approval'
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped'
  assignedTo?: string
  dueDate?: string
  dependencies?: string[]
  metadata?: Record<string, any>
}

export interface Workflow {
  id: string
  name: string
  type: 'employee_onboarding' | 'leave_approval' | 'payroll_cycle' | 'performance_review' | 'offboarding' | 'custom'
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  steps: WorkflowStep[]
  currentStep?: string
  initiatedBy: string
  assignedTo?: string
  entityId?: string // Employee ID, Leave Request ID, etc.
  entityType?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  metadata?: Record<string, any>
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  type: string
  steps: Omit<WorkflowStep, 'id' | 'status'>[]
  isActive: boolean
  createdBy: string
  createdAt: string
}

export interface WorkflowFilters {
  status?: string[]
  type?: string[]
  assignedTo?: string
  dateRange?: {
    start: string
    end: string
  }
}

export interface WorkflowAnalytics {
  totalWorkflows: number
  completedWorkflows: number
  averageCompletionTime: number
  bottlenecks: {
    stepName: string
    averageTime: number
    count: number
  }[]
  completionRates: {
    type: string
    rate: number
  }[]
}

export const workflowService = {
  // Workflow Management
  getWorkflows: (filters: WorkflowFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value))
        } else {
          params.append(key, value)
        }
      }
    })
    
    return api.get<ApiResponse<Workflow[]>>(`/workflows?${params}`)
  },

  getWorkflow: (id: string) => 
    api.get<ApiResponse<Workflow>>(`/workflows/${id}`),

  createWorkflow: (workflowData: Partial<Workflow>) => 
    api.post<ApiResponse<Workflow>>('/workflows', workflowData),

  updateWorkflow: (id: string, workflowData: Partial<Workflow>) => 
    api.put<ApiResponse<Workflow>>(`/workflows/${id}`, workflowData),

  deleteWorkflow: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/workflows/${id}`),

  // Workflow Execution
  startWorkflow: (templateId: string, entityId: string, entityType: string, metadata?: Record<string, any>) => 
    api.post<ApiResponse<Workflow>>('/workflows/start', {
      templateId,
      entityId,
      entityType,
      metadata
    }),

  completeStep: (workflowId: string, stepId: string, data?: Record<string, any>) => 
    api.put<ApiResponse<Workflow>>(`/workflows/${workflowId}/steps/${stepId}/complete`, data),

  skipStep: (workflowId: string, stepId: string, reason: string) => 
    api.put<ApiResponse<Workflow>>(`/workflows/${workflowId}/steps/${stepId}/skip`, { reason }),

  pauseWorkflow: (id: string, reason?: string) => 
    api.put<ApiResponse<Workflow>>(`/workflows/${id}/pause`, { reason }),

  resumeWorkflow: (id: string) => 
    api.put<ApiResponse<Workflow>>(`/workflows/${id}/resume`),

  cancelWorkflow: (id: string, reason: string) => 
    api.put<ApiResponse<Workflow>>(`/workflows/${id}/cancel`, { reason }),

  // Workflow Templates
  getWorkflowTemplates: () => 
    api.get<ApiResponse<WorkflowTemplate[]>>('/workflows/templates'),

  getWorkflowTemplate: (id: string) => 
    api.get<ApiResponse<WorkflowTemplate>>(`/workflows/templates/${id}`),

  createWorkflowTemplate: (templateData: Partial<WorkflowTemplate>) => 
    api.post<ApiResponse<WorkflowTemplate>>('/workflows/templates', templateData),

  updateWorkflowTemplate: (id: string, templateData: Partial<WorkflowTemplate>) => 
    api.put<ApiResponse<WorkflowTemplate>>(`/workflows/templates/${id}`, templateData),

  deleteWorkflowTemplate: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/workflows/templates/${id}`),

  // Analytics
  getWorkflowAnalytics: (filters: {
    dateRange?: { start: string; end: string }
    type?: string[]
  } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v))
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value))
        } else {
          params.append(key, value)
        }
      }
    })
    
    return api.get<ApiResponse<WorkflowAnalytics>>(`/workflows/analytics?${params}`)
  },

  // Bulk Operations
  bulkUpdateWorkflows: (workflowIds: string[], updates: Partial<Workflow>) => 
    api.put<ApiResponse<{ updated: number; failed: string[] }>>('/workflows/bulk-update', {
      workflowIds,
      updates
    }),

  bulkAssignWorkflows: (workflowIds: string[], assignedTo: string) => 
    api.put<ApiResponse<{ assigned: number; failed: string[] }>>('/workflows/bulk-assign', {
      workflowIds,
      assignedTo
    })
}