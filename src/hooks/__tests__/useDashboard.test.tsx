import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardStats, useQuickStats } from '@/hooks/useDashboard'

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

  describe('useDashboardStats', () => {
    it('fetches dashboard stats successfully', async () => {
      const { result } = renderHook(() => useDashboardStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  describe('useQuickStats', () => {
    it('fetches quick stats successfully', async () => {
      const { result } = renderHook(() => useQuickStats(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })
})