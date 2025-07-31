import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboard } from '@/hooks/useDashboard'

// Mock services
vi.mock('@/services/dataService', () => ({
  getDashboardData: vi.fn(),
  getQuickStats: vi.fn(),
  getRecentActivity: vi.fn()
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

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardData', () => {
    it('fetches dashboard data successfully', async () => {
      const mockDashboardData = {
        stats: {
          totalEmployees: 150,
          pendingLeaves: 5,
          upcomingReviews: 8
        },
        recentActivity: [],
        notifications: []
      }

      vi.mocked(require('@/services/dataService').getDashboardData).mockResolvedValue(mockDashboardData)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(mockDashboardData)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles dashboard data fetch errors', async () => {
      const mockError = new Error('Failed to fetch dashboard data')
      vi.mocked(require('@/services/dataService').getDashboardData).mockRejectedValue(mockError)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.dashboardData).toBeUndefined()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('getQuickStats', () => {
    it('fetches quick stats successfully', async () => {
      const mockStats = {
        totalEmployees: 150,
        activeProjects: 12,
        pendingTasks: 23,
        completedGoals: 89
      }

      vi.mocked(require('@/services/dataService').getQuickStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.quickStats).toEqual(mockStats)
      })
    })

    it('supports date range filtering for stats', async () => {
      const mockStats = { totalEmployees: 150 }
      const dateRange = { from: '2024-01-01', to: '2024-01-31' }

      vi.mocked(require('@/services/dataService').getQuickStats).mockResolvedValue(mockStats)

      const { result } = renderHook(() => useDashboard(dateRange), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.quickStats).toEqual(mockStats)
      })

      expect(require('@/services/dataService').getQuickStats).toHaveBeenCalledWith(dateRange)
    })
  })

  describe('getRecentActivity', () => {
    it('fetches recent activity successfully', async () => {
      const mockActivity = [
        { id: '1', type: 'leave_request', user: 'John Doe', timestamp: '2024-02-20T10:00:00Z' },
        { id: '2', type: 'employee_joined', user: 'Jane Smith', timestamp: '2024-02-20T09:30:00Z' }
      ]

      vi.mocked(require('@/services/dataService').getRecentActivity).mockResolvedValue(mockActivity)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.recentActivity).toEqual(mockActivity)
      })
    })

    it('supports activity filtering by type', async () => {
      const mockActivity = [
        { id: '1', type: 'leave_request', user: 'John Doe', timestamp: '2024-02-20T10:00:00Z' }
      ]

      vi.mocked(require('@/services/dataService').getRecentActivity).mockResolvedValue(mockActivity)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      const filteredActivity = result.current.getActivityByType('leave_request')

      await waitFor(() => {
        expect(filteredActivity).toEqual(mockActivity)
      })
    })

    it('limits recent activity results', async () => {
      const mockActivity = Array(20).fill(null).map((_, i) => ({
        id: String(i + 1),
        type: 'activity',
        user: `User ${i + 1}`,
        timestamp: '2024-02-20T10:00:00Z'
      }))

      vi.mocked(require('@/services/dataService').getRecentActivity).mockResolvedValue(mockActivity)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      const limitedActivity = result.current.getRecentActivity(10)

      await waitFor(() => {
        expect(limitedActivity.length).toBe(10)
      })
    })
  })

  describe('dashboard refresh', () => {
    it('refreshes all dashboard data', async () => {
      const mockData = { stats: { totalEmployees: 150 } }
      vi.mocked(require('@/services/dataService').getDashboardData).mockResolvedValue(mockData)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(mockData)
      })

      // Trigger refresh
      result.current.refreshDashboard()

      expect(require('@/services/dataService').getDashboardData).toHaveBeenCalledTimes(2)
    })

    it('handles refresh errors gracefully', async () => {
      vi.mocked(require('@/services/dataService').getDashboardData)
        .mockResolvedValueOnce({ stats: {} })
        .mockRejectedValueOnce(new Error('Refresh failed'))

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toBeDefined()
      })

      // Trigger refresh that fails
      result.current.refreshDashboard()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
    })
  })

  describe('real-time updates', () => {
    it('supports real-time dashboard updates', async () => {
      const initialData = { stats: { totalEmployees: 150 } }
      const updatedData = { stats: { totalEmployees: 151 } }

      vi.mocked(require('@/services/dataService').getDashboardData)
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData)

      const { result } = renderHook(() => useDashboard({ realtime: true }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(initialData)
      })

      // Simulate real-time update
      result.current.updateRealtime(updatedData)

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(updatedData)
      })
    })
  })

  describe('dashboard customization', () => {
    it('supports custom widget configuration', async () => {
      const customWidgets = ['stats', 'activity', 'notifications']
      const mockData = { stats: {}, activity: [], notifications: [] }

      vi.mocked(require('@/services/dataService').getDashboardData).mockResolvedValue(mockData)

      const { result } = renderHook(() => useDashboard({ widgets: customWidgets }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(mockData)
      })

      expect(require('@/services/dataService').getDashboardData).toHaveBeenCalledWith({ widgets: customWidgets })
    })

    it('saves dashboard layout preferences', async () => {
      const newLayout = { widgets: ['stats', 'activity'], columns: 2 }

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      result.current.updateLayout(newLayout)

      expect(result.current.layout).toEqual(newLayout)
    })
  })

  describe('caching and performance', () => {
    it('caches dashboard data appropriately', async () => {
      const mockData = { stats: { totalEmployees: 150 } }
      vi.mocked(require('@/services/dataService').getDashboardData).mockResolvedValue(mockData)

      const { result: result1 } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result1.current.dashboardData).toEqual(mockData)
      })

      // Second hook instance should use cached data
      const { result: result2 } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result2.current.dashboardData).toEqual(mockData)
      })

      // Should only call service once due to caching
      expect(require('@/services/dataService').getDashboardData).toHaveBeenCalledTimes(1)
    })

    it('invalidates cache when needed', async () => {
      const initialData = { stats: { totalEmployees: 150 } }
      const updatedData = { stats: { totalEmployees: 151 } }

      vi.mocked(require('@/services/dataService').getDashboardData)
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData)

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(initialData)
      })

      // Invalidate cache and refetch
      result.current.invalidateCache()

      await waitFor(() => {
        expect(result.current.dashboardData).toEqual(updatedData)
      })

      expect(require('@/services/dataService').getDashboardData).toHaveBeenCalledTimes(2)
    })
  })
})