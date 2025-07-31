import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardOverview, useEmployeeAnalytics } from '@/hooks/useAnalytics'

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

  describe('useDashboardOverview', () => {
    it('fetches dashboard overview successfully', async () => {
      const { result } = renderHook(() => useDashboardOverview(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  describe('useEmployeeAnalytics', () => {
    it('fetches employee analytics successfully', async () => {
      const { result } = renderHook(() => useEmployeeAnalytics(), {
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