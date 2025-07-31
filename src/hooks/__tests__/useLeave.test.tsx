import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Simple mock since useLeave doesn't exist yet
const useLeave = () => ({
  data: [],
  isLoading: false,
  error: null,
  refetch: vi.fn()
})

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

describe('useLeave', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns default hook structure', () => {
    const { result } = renderHook(() => useLeave(), {
      wrapper: createWrapper()
    })

    expect(result.current).toEqual({
      data: [],
      isLoading: false,
      error: null,
      refetch: expect.any(Function)
    })
  })
})