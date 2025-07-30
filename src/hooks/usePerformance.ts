import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  performanceService, 
  type GoalFilters, 
  type ReviewFilters, 
  type FeedbackFilters, 
  type MetricFilters,
  type PerformanceAnalytics 
} from '../services/performanceService'
import type { Goal, PerformanceReview, Feedback, PerformanceMetric } from '../mocks/data/performance'

// Query Keys
export const performanceKeys = {
  all: ['performance'] as const,
  goals: () => [...performanceKeys.all, 'goals'] as const,
  goal: (id: string) => [...performanceKeys.goals(), id] as const,
  reviews: () => [...performanceKeys.all, 'reviews'] as const,
  review: (id: string) => [...performanceKeys.reviews(), id] as const,
  feedback: () => [...performanceKeys.all, 'feedback'] as const,
  feedbackItem: (id: string) => [...performanceKeys.feedback(), id] as const,
  metrics: () => [...performanceKeys.all, 'metrics'] as const,
  metric: (id: string) => [...performanceKeys.metrics(), id] as const,
  analytics: (filters?: any) => [...performanceKeys.all, 'analytics', filters] as const,
}

// Goals Hooks
export const useGoals = (filters?: GoalFilters) => {
  return useQuery({
    queryKey: performanceKeys.goals(),
    queryFn: () => performanceService.getGoals(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useGoal = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.goal(id),
    queryFn: () => performanceService.getGoal(id),
    enabled: !!id,
  })
}

export const useCreateGoal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useUpdateGoal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Goal> }) =>
      performanceService.updateGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goal(variables.id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useDeleteGoal = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.deleteGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      performanceService.updateGoalProgress(id, progress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goal(variables.id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

// Performance Reviews Hooks
export const usePerformanceReviews = (filters?: ReviewFilters) => {
  return useQuery({
    queryKey: performanceKeys.reviews(),
    queryFn: () => performanceService.getPerformanceReviews(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const usePerformanceReview = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.review(id),
    queryFn: () => performanceService.getPerformanceReview(id),
    enabled: !!id,
  })
}

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.createPerformanceReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PerformanceReview> }) =>
      performanceService.updatePerformanceReview(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(variables.id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useSubmitPerformanceReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.submitPerformanceReview,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useAcknowledgeReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.acknowledgeReview,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
    },
  })
}

export const useDeletePerformanceReview = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.deletePerformanceReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

// Feedback Hooks
export const useFeedback = (filters?: FeedbackFilters) => {
  return useQuery({
    queryKey: performanceKeys.feedback(),
    queryFn: () => performanceService.getFeedback(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useFeedbackItem = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.feedbackItem(id),
    queryFn: () => performanceService.getFeedbackItem(id),
    enabled: !!id,
  })
}

export const useCreateFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Feedback> }) =>
      performanceService.updateFeedback(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedbackItem(variables.id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.submitFeedback,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedbackItem(id) })
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

export const useRequestFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ fromEmployeeId, toEmployeeId, type, category }: {
      fromEmployeeId: string
      toEmployeeId: string
      type: string
      category: string
    }) => performanceService.requestFeedback(fromEmployeeId, toEmployeeId, type, category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() })
    },
  })
}

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: performanceService.deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() })
      queryClient.invalidateQueries({ queryKey: performanceKeys.analytics() })
    },
  })
}

// Performance Metrics Hooks
export const usePerformanceMetrics = (filters?: MetricFilters) => {
  return useQuery({
    queryKey: performanceKeys.metrics(),
    queryFn: () => performanceService.getPerformanceMetrics(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const usePerformanceMetric = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.metric(id),
    queryFn: () => performanceService.getPerformanceMetric(id),
    enabled: !!id,
  })
}

// Performance Analytics Hooks
export const usePerformanceAnalytics = (filters?: {
  employeeId?: string
  departmentId?: string
  period?: string
}) => {
  return useQuery({
    queryKey: performanceKeys.analytics(filters),
    queryFn: () => performanceService.getPerformanceAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}