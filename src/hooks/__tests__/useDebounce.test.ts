import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    expect(result.current).toBe('initial')

    // Change value
    rerender({ value: 'updated', delay: 500 })
    
    // Value should still be initial (not yet debounced)
    expect(result.current).toBe('initial')

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    // First change
    rerender({ value: 'first', delay: 500 })
    
    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Second change before debounce completes
    rerender({ value: 'second', delay: 500 })
    
    // Advance time for original timeout
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    // Should still be initial (first timeout was cancelled)
    expect(result.current).toBe('initial')
    
    // Advance remaining time
    act(() => {
      vi.advanceTimersByTime(200)
    })
    
    // Now should be 'second'
    expect(result.current).toBe('second')
  })

  it('handles different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    )

    rerender({ value: 'updated', delay: 1000 })
    
    // Should not update after 500ms
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')
    
    // Should update after full 1000ms
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  it('handles zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 0 }
      }
    )

    rerender({ value: 'updated', delay: 0 })
    
    // With zero delay, should update on next tick
    act(() => {
      vi.advanceTimersByTime(0)
    })
    
    expect(result.current).toBe('updated')
  })

  it('works with non-string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 123, delay: 500 }
      }
    )

    expect(result.current).toBe(123)

    rerender({ value: 456, delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    expect(result.current).toBe(456)
  })

  it('works with object values', () => {
    const initialObj = { name: 'John', age: 30 }
    const updatedObj = { name: 'Jane', age: 25 }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: initialObj, delay: 500 }
      }
    )

    expect(result.current).toBe(initialObj)

    rerender({ value: updatedObj, delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    expect(result.current).toBe(updatedObj)
  })

  it('handles undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: undefined as string | undefined, delay: 500 }
      }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 'defined', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(500)
    })
    
    expect(result.current).toBe('defined')
  })

  it('cleans up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')
    
    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    rerender({ value: 'updated', delay: 500 })
    
    // Unmount before timeout completes
    unmount()
    
    expect(clearTimeoutSpy).toHaveBeenCalled()
    
    clearTimeoutSpy.mockRestore()
  })

  it('updates delay dynamically', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    rerender({ value: 'updated', delay: 1000 })
    
    // Should not update after original delay
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('initial')
    
    // Should update after new delay
    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  describe('common use cases', () => {
    it('works for search input debouncing', () => {
      const { result, rerender } = renderHook(
        ({ searchTerm }) => useDebounce(searchTerm, 300),
        {
          initialProps: { searchTerm: '' }
        }
      )

      // User types quickly
      rerender({ searchTerm: 'j' })
      rerender({ searchTerm: 'jo' })
      rerender({ searchTerm: 'joh' })
      rerender({ searchTerm: 'john' })
      
      // Should still show empty string
      expect(result.current).toBe('')
      
      // After debounce delay
      act(() => {
        vi.advanceTimersByTime(300)
      })
      
      // Should show final search term
      expect(result.current).toBe('john')
    })

    it('works for API call debouncing', () => {
      const mockApiCall = vi.fn()
      
      const { rerender } = renderHook(
        ({ query }) => {
          const debouncedQuery = useDebounce(query, 500)
          
          // Simulate API call when debounced value changes
          React.useEffect(() => {
            if (debouncedQuery) {
              mockApiCall(debouncedQuery)
            }
          }, [debouncedQuery])
          
          return debouncedQuery
        },
        {
          initialProps: { query: '' }
        }
      )

      // Rapid query changes
      rerender({ query: 'a' })
      rerender({ query: 'ap' })
      rerender({ query: 'app' })
      rerender({ query: 'apple' })
      
      // API should not be called yet
      expect(mockApiCall).not.toHaveBeenCalled()
      
      // After debounce
      act(() => {
        vi.advanceTimersByTime(500)
      })
      
      // API should be called once with final value
      expect(mockApiCall).toHaveBeenCalledTimes(1)
      expect(mockApiCall).toHaveBeenCalledWith('apple')
    })
  })
})