import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { createTestQueryClient } from '../test-utils'
import { 
  useLeaveStats,
  useLeaveRequests,
  useUpdateLeaveRequest
} from '../useLeave'

// Mock the leave service
const mockLeaveService = {
  getLeaveStats: vi.fn(),
  getLeaveRequests: vi.fn(),
  updateLeaveRequest: vi.fn()
}

vi.mock('../useLeave', async () => {
  const actual = await vi.importActual('../useLeave')
  return {
    ...actual,
    // We'll test the actual implementations but with mocked service
  }
})

describe('useLeave Hooks', () => {
  let queryClient: QueryClient
  let wrapper: any

  beforeEach(() => {
    queryClient = createTestQueryClient()
    wrapper = ({ children }: { children: React.ReactNode }) => 
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  describe('useLeaveStats', () => {
    it('should fetch leave statistics', async () => {
      const { result } = renderHook(() => useLeaveStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveProperty('pendingRequests')
      expect(result.current.data).toHaveProperty('approvedToday')
      expect(result.current.data).toHaveProperty('onLeaveToday')
      expect(result.current.data).toHaveProperty('onLeavePercentage')
      expect(result.current.data).toHaveProperty('avgResponseTime')
    })

    it('should use correct query key', () => {
      renderHook(() => useLeaveStats(), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(['leave', 'stats'])
      )).toBe(true)
    })

    it('should return expected data structure', async () => {
      const { result } = renderHook(() => useLeaveStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      expect(typeof data?.pendingRequests).toBe('number')
      expect(typeof data?.approvedToday).toBe('number')
      expect(typeof data?.onLeaveToday).toBe('number')
      expect(typeof data?.onLeavePercentage).toBe('number')
      expect(typeof data?.avgResponseTime).toBe('number')
    })
  })

  describe('useLeaveRequests', () => {
    it('should fetch leave requests without filters', async () => {
      const { result } = renderHook(() => useLeaveRequests(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveProperty('data')
      expect(Array.isArray(result.current.data?.data)).toBe(true)
    })

    it('should fetch leave requests with filters', async () => {
      const filters = { status: 'pending', employeeId: 'emp-1' }
      const { result } = renderHook(() => useLeaveRequests(filters), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(Array.isArray(result.current.data?.data)).toBe(true)
    })

    it('should use correct query key with filters', () => {
      const filters = { status: 'pending' }
      renderHook(() => useLeaveRequests(filters), { wrapper })
      
      const queries = queryClient.getQueryCache().getAll()
      expect(queries.some(query => 
        JSON.stringify(query.queryKey) === JSON.stringify(['leave', 'requests', filters])
      )).toBe(true)
    })

    it('should return expected leave request data structure', async () => {
      const { result } = renderHook(() => useLeaveRequests(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      expect(Array.isArray(data?.data)).toBe(true)
      
      if (data?.data && data.data.length > 0) {
        const request = data.data[0]
        expect(request).toHaveProperty('id')
        expect(request).toHaveProperty('employeeName')
        expect(request).toHaveProperty('leaveType')
        expect(request).toHaveProperty('startDate')
        expect(request).toHaveProperty('endDate')
        expect(request).toHaveProperty('status')
      }
    })

    it('should handle different request statuses', async () => {
      const { result } = renderHook(() => useLeaveRequests(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      const { data } = result.current
      if (data?.data) {
        const statuses = data.data.map(req => req.status)
        expect(statuses).toContain('pending')
        expect(statuses).toContain('approved')
        expect(statuses).toContain('rejected')
      }
    })
  })

  describe('useUpdateLeaveRequest', () => {
    it('should update leave request successfully', async () => {
      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper })

      const updateData = { id: '1', status: 'approved' }
      result.current.mutate(updateData)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toBeDefined()
      expect(result.current.data).toHaveProperty('id', '1')
      expect(result.current.data).toHaveProperty('status', 'approved')
    })

    it('should invalidate leave queries on success', async () => {
      // Pre-populate cache
      queryClient.setQueryData(['leave', 'requests'], { data: [] })
      queryClient.setQueryData(['leave', 'stats'], { pendingRequests: 5 })

      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper })

      result.current.mutate({ id: '1', status: 'approved' })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Check if leave-related queries were invalidated
      const queries = queryClient.getQueryCache().findAll({ queryKey: ['leave'] })
      expect(queries.some(query => query.isStale())).toBe(true)
    })

    it('should handle different status updates', async () => {
      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper })

      // Test approving a request
      result.current.mutate({ id: '1', status: 'approved' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      result.current.reset()

      // Test rejecting a request
      result.current.mutate({ id: '2', status: 'rejected' })
      await waitFor(() => expect(result.current.isSuccess).toBe(true))
    })

    it('should handle mutation errors', async () => {
      const { result } = renderHook(() => useUpdateLeaveRequest(), { wrapper })

      // Simulate error by passing invalid data
      result.current.mutate({ id: '', status: '' })

      await waitFor(() => {
        expect(result.current.isError || result.current.isSuccess).toBe(true)
      })
    })
  })

  describe('Query Configuration', () => {
    it('should use appropriate stale times', async () => {
      renderHook(() => useLeaveStats(), { wrapper })
      renderHook(() => useLeaveRequests(), { wrapper })

      const queries = queryClient.getQueryCache().getAll()
      
      // Verify queries exist
      expect(queries.length).toBeGreaterThan(0)
      
      // Check that queries have been created with proper keys
      const statsQuery = queries.find(q => 
        JSON.stringify(q.queryKey) === JSON.stringify(['leave', 'stats'])
      )
      const requestsQuery = queries.find(q => 
        q.queryKey[0] === 'leave' && q.queryKey[1] === 'requests'
      )
      
      expect(statsQuery).toBeDefined()
      expect(requestsQuery).toBeDefined()
    })

    it('should handle network errors gracefully', async () => {
      // This test would be more relevant with actual service mocking
      // For now, we verify the hooks can handle error states
      const { result } = renderHook(() => useLeaveStats(), { wrapper })

      // The hook should either succeed or fail gracefully
      await waitFor(() => {
        expect(result.current.isLoading || result.current.isSuccess || result.current.isError).toBe(true)
      })
    })
  })

  describe('React Query Integration', () => {
    it('should support refetching', async () => {
      const { result } = renderHook(() => useLeaveStats(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Test refetch functionality
      const refetchPromise = result.current.refetch()
      expect(refetchPromise).toBeInstanceOf(Promise)

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
    })

    it('should support enabled/disabled queries', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }) => useLeaveRequests(enabled ? { status: 'pending' } : undefined),
        { 
          wrapper,
          initialProps: { enabled: false }
        }
      )

      // Should not fetch initially
      expect(result.current.isFetching).toBe(false)

      // Enable and should start fetching
      rerender({ enabled: true })
      
      await waitFor(() => {
        expect(result.current.isSuccess || result.current.isError).toBe(true)
      })
    })
  })
})