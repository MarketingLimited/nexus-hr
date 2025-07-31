import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDepartments } from '@/hooks/useDepartments'

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

describe('useDepartments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches departments successfully', async () => {
    const { result } = renderHook(() => useDepartments(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })
})