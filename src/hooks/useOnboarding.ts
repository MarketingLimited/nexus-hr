import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  onboardingService, 
  type WorkflowFilters, 
  type TaskFilters, 
  type SessionFilters,
  type OnboardingAnalytics 
} from '../services/onboardingService'
import type { 
  OnboardingWorkflow, 
  OnboardingTask, 
  OnboardingSession,
  OnboardingTaskProgress,
  OnboardingFeedback
} from '../mocks/data/onboarding'

// Query Keys
export const onboardingKeys = {
  all: ['onboarding'] as const,
  workflows: () => [...onboardingKeys.all, 'workflows'] as const,
  workflow: (id: string) => [...onboardingKeys.workflows(), id] as const,
  tasks: () => [...onboardingKeys.all, 'tasks'] as const,
  task: (id: string) => [...onboardingKeys.tasks(), id] as const,
  sessions: () => [...onboardingKeys.all, 'sessions'] as const,
  session: (id: string) => [...onboardingKeys.sessions(), id] as const,
  analytics: (filters?: any) => [...onboardingKeys.all, 'analytics', filters] as const,
  employeeStatus: (employeeId: string) => 
    [...onboardingKeys.all, 'employee-status', employeeId] as const,
  checklist: (sessionId: string) => 
    [...onboardingKeys.session(sessionId), 'checklist'] as const,
  templates: () => [...onboardingKeys.all, 'templates'] as const,
}

// Workflow Management Hooks
export const useOnboardingWorkflows = (filters?: WorkflowFilters) => {
  return useQuery({
    queryKey: onboardingKeys.workflows(),
    queryFn: () => onboardingService.getOnboardingWorkflows(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useOnboardingWorkflow = (id: string) => {
  return useQuery({
    queryKey: onboardingKeys.workflow(id),
    queryFn: () => onboardingService.getOnboardingWorkflow(id),
    enabled: !!id,
  })
}

export const useCreateOnboardingWorkflow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: onboardingService.createOnboardingWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.workflows() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.analytics() })
    },
  })
}

export const useUpdateOnboardingWorkflow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OnboardingWorkflow> }) =>
      onboardingService.updateOnboardingWorkflow(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.workflow(variables.id) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.workflows() })
    },
  })
}

export const useDeleteOnboardingWorkflow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: onboardingService.deleteOnboardingWorkflow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.workflows() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.analytics() })
    },
  })
}

// Session Management Hooks
export const useOnboardingSessions = (filters?: SessionFilters) => {
  return useQuery({
    queryKey: onboardingKeys.sessions(),
    queryFn: () => onboardingService.getOnboardingSessions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useOnboardingSession = (id: string) => {
  return useQuery({
    queryKey: onboardingKeys.session(id),
    queryFn: () => onboardingService.getOnboardingSession(id),
    enabled: !!id,
  })
}

export const useCreateOnboardingSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: onboardingService.createOnboardingSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.analytics() })
    },
  })
}

export const useUpdateOnboardingSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OnboardingSession> }) =>
      onboardingService.updateOnboardingSession(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(variables.id) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.analytics() })
    },
  })
}

export const useCompleteOnboardingSession = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: onboardingService.completeOnboardingSession,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(id) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.analytics() })
    },
  })
}

// Analytics Hooks
export const useOnboardingAnalytics = (filters?: {
  departmentId?: string
  period?: string
}) => {
  return useQuery({
    queryKey: onboardingKeys.analytics(filters),
    queryFn: () => onboardingService.getOnboardingAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Note: Additional hooks for employee status, checklist, mentor assignment, etc.
// can be added later when the corresponding service methods are implemented