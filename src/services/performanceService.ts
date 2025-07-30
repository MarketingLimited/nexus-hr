import { api, ApiResponse } from './api'
import type { Goal, PerformanceReview, Feedback, PerformanceMetric } from '../mocks/data/performance'

export interface GoalFilters {
  employeeId?: string
  status?: string
  category?: string
  priority?: string
}

export interface ReviewFilters {
  employeeId?: string
  reviewerId?: string
  status?: string
  period?: string
  type?: string
}

export interface FeedbackFilters {
  fromEmployeeId?: string
  toEmployeeId?: string
  type?: string
  category?: string
  status?: string
}

export interface MetricFilters {
  employeeId?: string
  period?: string
}

export interface PerformanceAnalytics {
  goals: {
    total: number
    completed: number
    inProgress: number
    overdue: number
    averageProgress: number
  }
  reviews: {
    total: number
    completed: number
    pending: number
    inProgress: number
    averageRating: number
  }
  feedback: {
    total: number
    submitted: number
    acknowledged: number
    averageRating: number
  }
  trends: {
    goalCompletionRate: number
    reviewCompletionRate: number
    feedbackResponseRate: number
  }
}

export const performanceService = {
  // Goals Management
  getGoals: (filters: GoalFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<Goal[]>>(`/performance/goals?${params}`)
  },

  getGoal: (id: string) => 
    api.get<ApiResponse<Goal>>(`/performance/goals/${id}`),

  createGoal: (goalData: Partial<Goal>) => 
    api.post<ApiResponse<Goal>>('/performance/goals', goalData),

  updateGoal: (id: string, goalData: Partial<Goal>) => 
    api.put<ApiResponse<Goal>>(`/performance/goals/${id}`, goalData),

  deleteGoal: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/performance/goals/${id}`),

  // Performance Reviews
  getPerformanceReviews: (filters: ReviewFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<PerformanceReview[]>>(`/performance/reviews?${params}`)
  },

  getPerformanceReview: (id: string) => 
    api.get<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}`),

  createPerformanceReview: (reviewData: Partial<PerformanceReview>) => 
    api.post<ApiResponse<PerformanceReview>>('/performance/reviews', reviewData),

  updatePerformanceReview: (id: string, reviewData: Partial<PerformanceReview>) => 
    api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}`, reviewData),

  submitPerformanceReview: (id: string) => 
    api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}/submit`),

  deletePerformanceReview: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/performance/reviews/${id}`),

  // Feedback Management
  getFeedback: (filters: FeedbackFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<Feedback[]>>(`/performance/feedback?${params}`)
  },

  getFeedbackItem: (id: string) => 
    api.get<ApiResponse<Feedback>>(`/performance/feedback/${id}`),

  createFeedback: (feedbackData: Partial<Feedback>) => 
    api.post<ApiResponse<Feedback>>('/performance/feedback', feedbackData),

  updateFeedback: (id: string, feedbackData: Partial<Feedback>) => 
    api.put<ApiResponse<Feedback>>(`/performance/feedback/${id}`, feedbackData),

  submitFeedback: (id: string) => 
    api.put<ApiResponse<Feedback>>(`/performance/feedback/${id}/submit`),

  deleteFeedback: (id: string) => 
    api.delete<ApiResponse<{ message: string }>>(`/performance/feedback/${id}`),

  // Performance Metrics
  getPerformanceMetrics: (filters: MetricFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<PerformanceMetric[]>>(`/performance/metrics?${params}`)
  },

  getPerformanceMetric: (id: string) => 
    api.get<ApiResponse<PerformanceMetric>>(`/performance/metrics/${id}`),

  // Performance Analytics
  getPerformanceAnalytics: (filters: {
    employeeId?: string
    departmentId?: string
    period?: string
  } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    
    return api.get<ApiResponse<PerformanceAnalytics>>(`/performance/analytics?${params}`)
  },

  // Specialized Operations
  acknowledgeReview: (id: string) => 
    api.put<ApiResponse<PerformanceReview>>(`/performance/reviews/${id}`, {
      status: 'completed'
    }),

  requestFeedback: (fromEmployeeId: string, toEmployeeId: string, type: string, category: string) => {
    const feedbackRequest = {
      fromEmployeeId,
      toEmployeeId,
      type,
      category,
      status: 'draft'
    }
    
    return api.post<ApiResponse<Feedback>>('/performance/feedback', feedbackRequest)
  },

  updateGoalProgress: (id: string, progress: number) => 
    api.put<ApiResponse<Goal>>(`/performance/goals/${id}`, {
      progress,
      status: progress >= 100 ? 'completed' : 'in_progress'
    })
}