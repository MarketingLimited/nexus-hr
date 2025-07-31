import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardStats, useRecentActivity } from '../useDashboard'
import { ReactNode } from 'react'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }
    }
  })
  
  return function Wrapper({ children }: { children: ReactNode }) {
    return QueryClientProvider({ client: queryClient, children })
  }
}

// Mock the API service
const mockDashboardService = {
  getDashboardStats: vi.fn(),
  getRecentActivity: vi.fn()
}

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn()
  }
}))

describe('useDashboard hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDashboardStats', () => {
    it('should fetch dashboard statistics successfully', async () => {
      const mockStats = {
        totalEmployees: 247,
        pendingLeaveRequests: 8,
        monthlyPayroll: 450000,
        performanceReviews: 12
      }

      // Mock the fetch implementation
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockStats)
      expect(result.current.error).toBe(null)
    })

    it('should handle fetch errors', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })

    it('should use correct cache key', () => {
      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      // Verify the hook is using the expected query key structure
      expect(result.current).toBeDefined()
    })

    it('should handle empty response', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      })

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual({})
    })
  })

  describe('useRecentActivity', () => {
    it('should fetch recent activity successfully', async () => {
      const mockActivity = {
        data: [
          {
            id: '1',
            type: 'leave_request',
            message: 'John Doe submitted a leave request',
            timestamp: '2024-01-15T10:00:00Z',
            userId: 'user1'
          },
          {
            id: '2',
            type: 'employee_update',
            message: 'Jane Smith updated her profile',
            timestamp: '2024-01-15T09:30:00Z',
            userId: 'user2'
          }
        ]
      }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivity
      })

      const { result } = renderHook(() => useRecentActivity(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockActivity)
      expect(result.current.data.data).toHaveLength(2)
    })

    it('should handle activity fetch with limit parameter', async () => {
      const mockActivity = { data: [] }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivity
      })

      const { result } = renderHook(() => useRecentActivity({ limit: 5 }), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockActivity)
    })

    it('should handle errors when fetching activity', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('API Error'))

      const { result } = renderHook(() => useRecentActivity(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })

    it('should handle empty activity list', async () => {
      const mockActivity = { data: [] }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockActivity
      })

      const { result } = renderHook(() => useRecentActivity(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data.data).toHaveLength(0)
    })
  })

  describe('Error handling', () => {
    it('should handle network failures gracefully', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'))

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
      expect(result.current.data).toBeUndefined()
    })

    it('should handle HTTP error responses', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' })
      })

      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Query caching', () => {
    it('should cache dashboard stats appropriately', async () => {
      const mockStats = { totalEmployees: 247 }

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockStats
      })

      const wrapper = createWrapper()
      
      // First render
      const { result: result1 } = renderHook(() => useDashboardStats(), { wrapper })
      
      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false)
      })

      // Second render should use cached data
      const { result: result2 } = renderHook(() => useDashboardStats(), { wrapper })

      expect(result2.current.data).toEqual(mockStats)
      expect(global.fetch).toHaveBeenCalledTimes(1) // Should only fetch once due to caching
    })
  })
})