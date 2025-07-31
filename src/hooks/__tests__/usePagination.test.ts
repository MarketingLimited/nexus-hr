import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@/hooks/usePagination'

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with default values', () => {
    const { result } = renderHook(() => usePagination())
    
    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(10)
  })

  it('provides pagination functionality', () => {
    const { result } = renderHook(() => usePagination())
    
    expect(result.current.page).toBeDefined()
    expect(result.current.pageSize).toBeDefined()
    expect(typeof result.current.goToPage).toBe('function')
    expect(typeof result.current.goToNextPage).toBe('function')
    expect(typeof result.current.goToPreviousPage).toBe('function')
  })
})