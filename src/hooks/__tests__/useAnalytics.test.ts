import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAnalytics } from '@/hooks/useAnalytics'

// Mock analytics service
vi.mock('@/services/analyticsService', () => ({
  getAnalytics: vi.fn(),
  getReports: vi.fn(),
  generateReport: vi.fn(),
  getMetrics: vi.fn()
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

describe('useAnalytics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAnalytics', () => {
    it('fetches analytics data successfully', async () => {
      const mockData = {
        totalEmployees: 150,
        activeProjects: 12,
        revenue: 1250000
      }

      vi.mocked(require('@/services/analyticsService').getAnalytics).mockResolvedValue(mockData)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData)
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('handles analytics fetch errors', async () => {
      const mockError = new Error('Failed to fetch analytics')
      vi.mocked(require('@/services/analyticsService').getAnalytics).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      expect(result.current.data).toBeUndefined()
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('getReports', () => {
    it('fetches reports data successfully', async () => {
      const mockReports = [
        { id: '1', name: 'Employee Report', type: 'employee' },
        { id: '2', name: 'Revenue Report', type: 'financial' }
      ]

      vi.mocked(require('@/services/analyticsService').getReports).mockResolvedValue(mockReports)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      const reports = result.current.getReports()

      await waitFor(() => {
        expect(reports.data).toEqual(mockReports)
      })
    })

    it('supports report filtering', async () => {
      const mockReports = [
        { id: '1', name: 'Employee Report', type: 'employee' }
      ]

      vi.mocked(require('@/services/analyticsService').getReports).mockResolvedValue(mockReports)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      const reports = result.current.getReports('employee')

      await waitFor(() => {
        expect(reports.data).toEqual(mockReports)
      })

      expect(require('@/services/analyticsService').getReports).toHaveBeenCalledWith('employee')
    })
  })

  describe('generateReport', () => {
    it('generates new report successfully', async () => {
      const mockReport = { id: 'new-123', status: 'generated' }
      vi.mocked(require('@/services/analyticsService').generateReport).mockResolvedValue(mockReport)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      const mutation = result.current.generateReport()

      mutation.mutate({ type: 'employee', period: 'monthly' })

      await waitFor(() => {
        expect(mutation.isSuccess).toBe(true)
      })

      expect(mutation.data).toEqual(mockReport)
    })

    it('handles report generation errors', async () => {
      const mockError = new Error('Generation failed')
      vi.mocked(require('@/services/analyticsService').generateReport).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      const mutation = result.current.generateReport()

      mutation.mutate({ type: 'employee', period: 'monthly' })

      await waitFor(() => {
        expect(mutation.isError).toBe(true)
      })

      expect(mutation.error).toEqual(mockError)
    })
  })

  describe('getMetrics', () => {
    it('fetches real-time metrics', async () => {
      const mockMetrics = {
        activeUsers: 45,
        systemLoad: 0.75,
        responseTime: 120
      }

      vi.mocked(require('@/services/analyticsService').getMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      const metrics = result.current.getMetrics('realtime')

      await waitFor(() => {
        expect(metrics.data).toEqual(mockMetrics)
      })
    })

    it('supports metrics caching', async () => {
      const mockMetrics = { activeUsers: 45 }
      vi.mocked(require('@/services/analyticsService').getMetrics).mockResolvedValue(mockMetrics)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      // First call
      const metrics1 = result.current.getMetrics('realtime')
      await waitFor(() => expect(metrics1.data).toEqual(mockMetrics))

      // Second call should use cache
      const metrics2 = result.current.getMetrics('realtime')
      expect(metrics2.data).toEqual(mockMetrics)

      // Should only call service once due to caching
      expect(require('@/services/analyticsService').getMetrics).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading states', () => {
    it('shows loading state during data fetch', async () => {
      vi.mocked(require('@/services/analyticsService').getAnalytics).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      )

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('refetch functionality', () => {
    it('allows manual data refetch', async () => {
      const mockData = { totalEmployees: 150 }
      vi.mocked(require('@/services/analyticsService').getAnalytics).mockResolvedValue(mockData)

      const { result } = renderHook(() => useAnalytics(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData)
      })

      // Trigger refetch
      result.current.refetch()

      expect(require('@/services/analyticsService').getAnalytics).toHaveBeenCalledTimes(2)
    })
  })
})