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

// Employee-specific Hooks
export const useEmployeeOnboardingStatus = (employeeId: string) => {
  return useQuery({
    queryKey: onboardingKeys.employeeStatus(employeeId),
    queryFn: () => onboardingService.getEmployeeOnboardingStatus?.(employeeId),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useOnboardingChecklist = (sessionId: string) => {
  return useQuery({
    queryKey: onboardingKeys.checklist(sessionId),
    queryFn: () => onboardingService.getOnboardingChecklist?.(sessionId),
    enabled: !!sessionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Specialized Operations Hooks
export const useAssignMentor = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, mentorId }: { sessionId: string; mentorId: string }) =>
      onboardingService.assignMentor?.(sessionId, mentorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(variables.sessionId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
    },
  })
}

export const useUpdateSessionProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, progress }: { sessionId: string; progress: number }) =>
      onboardingService.updateSessionProgress?.(sessionId, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(variables.sessionId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.analytics() })
    },
  })
}

export const useExtendOnboardingDeadline = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, newEndDate, reason }: {
      sessionId: string
      newEndDate: string
      reason: string
    }) => onboardingService.extendOnboardingDeadline?.(sessionId, newEndDate, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(variables.sessionId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
    },
  })
}

export const usePauseOnboarding = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason: string }) =>
      onboardingService.pauseOnboarding?.(sessionId, reason),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(variables.sessionId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
    },
  })
}

export const useResumeOnboarding = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: onboardingService.resumeOnboarding,
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.session(sessionId) })
      queryClient.invalidateQueries({ queryKey: onboardingKeys.sessions() })
    },
  })
}

// Workflow Templates Hooks
export const useOnboardingTemplates = () => {
  return useQuery({
    queryKey: onboardingKeys.templates(),
    queryFn: () => onboardingService.getOnboardingTemplates?.(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export const useCloneWorkflow = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ workflowId, newName, departmentId }: {
      workflowId: string
      newName: string
      departmentId?: string
    }) => onboardingService.cloneWorkflow?.(workflowId, newName, departmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.workflows() })
    },
  })
}

export const useCreateWorkflowFromTemplate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ templateId, workflowData }: {
      templateId: string
      workflowData: Partial<OnboardingWorkflow>
    }) => onboardingService.createWorkflowFromTemplate?.(templateId, workflowData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.workflows() })
    },
  })
}