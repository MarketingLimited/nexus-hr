import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePerformance } from '@/hooks/usePerformance'

// Mock performance service
vi.mock('@/services/performanceService', () => ({
  getPerformanceData: vi.fn(),
  createReview: vi.fn(),
  updateGoal: vi.fn(),
  submitFeedback: vi.fn(),
  getPerformanceMetrics: vi.fn(),
  getTeamPerformance: vi.fn()
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('usePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPerformanceData', () => {
    it('fetches performance data successfully', async () => {
      const mockPerformanceData = {
        employee: {
          id: 'emp1',
          name: 'John Doe',
          overallRating: 4.2,
          goals: [
            { id: 'goal1', title: 'Complete React Training', progress: 85, status: 'in_progress' }
          ],
          reviews: [
            { id: 'review1', period: 'Q1 2024', rating: 4.0, reviewer: 'Jane Smith' }
          ]
        }
      }

      vi.mocked(require('@/services/performanceService').getPerformanceData).mockResolvedValue(mockPerformanceData)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.performanceData).toEqual(mockPerformanceData)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles performance data fetch errors', async () => {
      const mockError = new Error('Failed to fetch performance data')
      vi.mocked(require('@/services/performanceService').getPerformanceData).mockRejectedValue(mockError)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.performanceData).toBeUndefined()
      expect(result.current.loading).toBe(false)
    })

    it('supports date range filtering', async () => {
      const mockData = { employee: { id: 'emp1', reviews: [] } }
      const dateRange = { from: '2024-01-01', to: '2024-03-31' }

      vi.mocked(require('@/services/performanceService').getPerformanceData).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePerformance('emp1', { dateRange }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.performanceData).toEqual(mockData)
      })

      expect(require('@/services/performanceService').getPerformanceData).toHaveBeenCalledWith('emp1', { dateRange })
    })
  })

  describe('createReview', () => {
    it('creates performance review successfully', async () => {
      const reviewData = {
        employeeId: 'emp1',
        period: 'Q1 2024',
        rating: 4.5,
        feedback: 'Excellent performance',
        goals: ['goal1', 'goal2']
      }
      const createdReview = { id: 'review2', ...reviewData, createdAt: '2024-02-20' }

      vi.mocked(require('@/services/performanceService').createReview).mockResolvedValue(createdReview)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await result.current.createReview(reviewData)

      expect(require('@/services/performanceService').createReview).toHaveBeenCalledWith(reviewData)
    })

    it('handles review creation errors', async () => {
      const reviewData = { employeeId: 'emp1', period: 'Q1 2024' }
      const mockError = new Error('Rating is required')

      vi.mocked(require('@/services/performanceService').createReview).mockRejectedValue(mockError)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await expect(result.current.createReview(reviewData)).rejects.toThrow('Rating is required')
    })
  })

  describe('updateGoal', () => {
    it('updates goal successfully', async () => {
      const goalId = 'goal1'
      const updates = { progress: 90, status: 'completed' }
      const updatedGoal = { id: 'goal1', title: 'Complete React Training', ...updates }

      vi.mocked(require('@/services/performanceService').updateGoal).mockResolvedValue(updatedGoal)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await result.current.updateGoal(goalId, updates)

      expect(require('@/services/performanceService').updateGoal).toHaveBeenCalledWith(goalId, updates)
    })

    it('validates goal progress values', async () => {
      const goalId = 'goal1'
      const invalidUpdates = { progress: 150 } // Over 100%

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await expect(result.current.updateGoal(goalId, invalidUpdates)).rejects.toThrow('Invalid progress value')
    })
  })

  describe('submitFeedback', () => {
    it('submits feedback successfully', async () => {
      const feedbackData = {
        targetEmployeeId: 'emp1',
        type: 'peer',
        rating: 4,
        comments: 'Great teamwork and collaboration'
      }
      const submittedFeedback = { id: 'feedback1', ...feedbackData, submittedAt: '2024-02-20' }

      vi.mocked(require('@/services/performanceService').submitFeedback).mockResolvedValue(submittedFeedback)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await result.current.submitFeedback(feedbackData)

      expect(require('@/services/performanceService').submitFeedback).toHaveBeenCalledWith(feedbackData)
    })

    it('handles different feedback types', async () => {
      const feedbackTypes = ['peer', 'manager', 'self', '360']
      
      vi.mocked(require('@/services/performanceService').submitFeedback).mockResolvedValue({ id: 'feedback1' })

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      for (const type of feedbackTypes) {
        await result.current.submitFeedback({
          targetEmployeeId: 'emp1',
          type,
          rating: 4,
          comments: `${type} feedback`
        })
      }

      expect(require('@/services/performanceService').submitFeedback).toHaveBeenCalledTimes(4)
    })
  })

  describe('getPerformanceMetrics', () => {
    it('fetches performance metrics successfully', async () => {
      const mockMetrics = {
        averageRating: 4.2,
        goalCompletionRate: 85,
        feedbackCount: 12,
        improvementAreas: ['communication', 'leadership']
      }

      vi.mocked(require('@/services/performanceService').getPerformanceMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      const metrics = await result.current.getPerformanceMetrics()

      expect(metrics).toEqual(mockMetrics)
      expect(require('@/services/performanceService').getPerformanceMetrics).toHaveBeenCalledWith('emp1')
    })

    it('supports metrics aggregation by period', async () => {
      const mockMetrics = { averageRating: 4.0 }
      const period = 'quarterly'

      vi.mocked(require('@/services/performanceService').getPerformanceMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      const metrics = await result.current.getPerformanceMetrics(period)

      expect(require('@/services/performanceService').getPerformanceMetrics).toHaveBeenCalledWith('emp1', period)
    })
  })

  describe('getTeamPerformance', () => {
    it('fetches team performance data', async () => {
      const teamId = 'team1'
      const mockTeamData = {
        teamId,
        averageRating: 4.1,
        topPerformers: ['emp1', 'emp2'],
        goalCompletionRate: 78,
        members: [
          { id: 'emp1', name: 'John Doe', rating: 4.5 },
          { id: 'emp2', name: 'Jane Smith', rating: 4.2 }
        ]
      }

      vi.mocked(require('@/services/performanceService').getTeamPerformance).mockResolvedValue(mockTeamData)

      const { result } = renderHook(() => usePerformance(), {
        wrapper: createWrapper()
      })

      const teamData = await result.current.getTeamPerformance(teamId)

      expect(teamData).toEqual(mockTeamData)
      expect(require('@/services/performanceService').getTeamPerformance).toHaveBeenCalledWith(teamId)
    })
  })

  describe('goal management', () => {
    it('creates new goal successfully', async () => {
      const goalData = {
        employeeId: 'emp1',
        title: 'Learn TypeScript',
        description: 'Complete TypeScript course and apply to project',
        targetDate: '2024-06-30',
        category: 'skill_development'
      }
      const createdGoal = { id: 'goal2', ...goalData, progress: 0, status: 'not_started' }

      vi.mocked(require('@/services/performanceService').createGoal).mockResolvedValue(createdGoal)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      const goal = await result.current.createGoal(goalData)

      expect(goal).toEqual(createdGoal)
    })

    it('tracks goal progress over time', async () => {
      const goalId = 'goal1'
      const progressHistory = [
        { date: '2024-01-01', progress: 0 },
        { date: '2024-01-15', progress: 25 },
        { date: '2024-02-01', progress: 50 },
        { date: '2024-02-15', progress: 75 }
      ]

      vi.mocked(require('@/services/performanceService').getGoalProgress).mockResolvedValue(progressHistory)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      const history = await result.current.getGoalProgress(goalId)

      expect(history).toEqual(progressHistory)
    })
  })

  describe('performance analytics', () => {
    it('calculates performance trends', async () => {
      const mockData = {
        employee: {
          reviews: [
            { period: 'Q1 2023', rating: 3.8 },
            { period: 'Q2 2023', rating: 4.0 },
            { period: 'Q3 2023', rating: 4.2 },
            { period: 'Q4 2023', rating: 4.5 }
          ]
        }
      }

      vi.mocked(require('@/services/performanceService').getPerformanceData).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.performanceData).toEqual(mockData)
      })

      const trend = result.current.getPerformanceTrend()

      expect(trend).toEqual({
        direction: 'upward',
        change: 0.7, // 4.5 - 3.8
        percentage: 18.42 // ((4.5 - 3.8) / 3.8) * 100
      })
    })

    it('identifies strengths and improvement areas', async () => {
      const mockData = {
        employee: {
          feedback: [
            { category: 'technical_skills', rating: 4.8 },
            { category: 'communication', rating: 3.2 },
            { category: 'teamwork', rating: 4.5 },
            { category: 'leadership', rating: 3.0 }
          ]
        }
      }

      vi.mocked(require('@/services/performanceService').getPerformanceData).mockResolvedValue(mockData)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.performanceData).toEqual(mockData)
      })

      const analysis = result.current.getPerformanceAnalysis()

      expect(analysis.strengths).toContain('technical_skills')
      expect(analysis.strengths).toContain('teamwork')
      expect(analysis.improvementAreas).toContain('communication')
      expect(analysis.improvementAreas).toContain('leadership')
    })
  })

  describe('caching and optimization', () => {
    it('caches performance data appropriately', async () => {
      const mockData = { employee: { id: 'emp1', rating: 4.0 } }
      vi.mocked(require('@/services/performanceService').getPerformanceData).mockResolvedValue(mockData)

      const { result: result1 } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result1.current.performanceData).toEqual(mockData)
      })

      // Second hook instance should use cached data
      const { result: result2 } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result2.current.performanceData).toEqual(mockData)
      })

      // Should only call service once due to caching
      expect(require('@/services/performanceService').getPerformanceData).toHaveBeenCalledTimes(1)
    })

    it('invalidates cache on data updates', async () => {
      const initialData = { employee: { id: 'emp1', rating: 4.0 } }
      const updatedData = { employee: { id: 'emp1', rating: 4.5 } }

      vi.mocked(require('@/services/performanceService').getPerformanceData)
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData)

      const { result } = renderHook(() => usePerformance('emp1'), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.performanceData).toEqual(initialData)
      })

      // Update goal (should invalidate cache)
      await result.current.updateGoal('goal1', { progress: 100 })

      // Should refetch with updated data
      await waitFor(() => {
        expect(result.current.performanceData).toEqual(updatedData)
      })
    })
  })
})