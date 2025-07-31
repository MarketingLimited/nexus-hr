import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDocuments } from '@/hooks/useDocuments'

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

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches documents successfully', async () => {
    const { result } = renderHook(() => useDocuments(), {
      wrapper: createWrapper()
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
  })
})