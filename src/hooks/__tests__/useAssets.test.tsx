import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAssets, useAssetStats } from '@/hooks/useAssets'

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

describe('useAssets', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useAssets', () => {
    it('fetches assets successfully', async () => {
      const { result } = renderHook(() => useAssets(), {
        wrapper: createWrapper()
      })

      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  describe('useAssetStats', () => {
    it('fetches asset stats successfully', async () => {
      const { result } = renderHook(() => useAssetStats(), {
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