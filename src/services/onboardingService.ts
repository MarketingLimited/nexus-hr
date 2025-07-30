import { api, ApiResponse } from './api'
import type { 
  OnboardingWorkflow, 
  OnboardingTask, 
  OnboardingSession,
  OnboardingTaskProgress,
  OnboardingFeedback
} from '../mocks/data/onboarding'

export interface WorkflowFilters {
  departmentId?: string
  isActive?: boolean
}

export interface TaskFilters {
  workflowId?: string
  category?: string
  type?: string
}

export interface SessionFilters {
  employeeId?: string
  workflowId?: string
  status?: string
  assignedMentor?: string
}

export interface OnboardingAnalytics {
  sessions: {
    total: number
    completed: number
    inProgress: number
    notStarted: number
    onHold: number
    cancelled: number
    averageProgress: number
  }
  workflows: {
    total: number
    active: number
    inactive: number
    averageDuration: number
  }
  tasks: {
    total: number
    required: number
    optional: number
    averageHours: number
  }
  completion: {
    rate: number
    averageTime: number
  }
}

export const onboardingService = {
  // Workflow Management
  getOnboardingWorkflows: (filters: WorkflowFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
    
    return api.get<ApiResponse<OnboardingWorkflow[]>>(`/onboarding/workflows?${params}`)
  },

  getOnboardingWorkflow: (id: string) => 
    api.get<ApiResponse<OnboardingWorkflow>>(`/onboarding/workflows/${id}`),

  createOnboardingWorkflow: (workflowData: Partial<OnboardingWorkflow>) => 
    api.post<ApiResponse<OnboardingWorkflow>>('/onboarding/workflows', workflowData),

  updateOnboardingWorkflow: (id: string, workflowData: Partial<OnboardingWorkflow>) => 
    api.put<ApiResponse<OnboardingWorkflow>>(`/onboarding/workflows/${id}`, workflowData),

  deleteOnboardingWorkflow: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/onboarding/workflows/${id}`),

  // Session Management
  getOnboardingSessions: (filters: SessionFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<OnboardingSession[]>>(`/onboarding/sessions?${params}`)
  },

  getOnboardingSession: (id: string) => 
    api.get<ApiResponse<OnboardingSession>>(`/onboarding/sessions/${id}`),

  createOnboardingSession: (sessionData: Partial<OnboardingSession>) => 
    api.post<ApiResponse<OnboardingSession>>('/onboarding/sessions', sessionData),

  updateOnboardingSession: (id: string, sessionData: Partial<OnboardingSession>) => 
    api.put<ApiResponse<OnboardingSession>>(`/onboarding/sessions/${id}`, sessionData),

  completeOnboardingSession: (id: string) => 
    api.put<ApiResponse<OnboardingSession>>(`/onboarding/sessions/${id}/complete`),

  // Analytics
  getOnboardingAnalytics: (filters: {
    departmentId?: string
    period?: string
  } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<OnboardingAnalytics>>(`/onboarding/analytics?${params}`)
  }
}