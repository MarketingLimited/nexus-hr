import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePagination } from '@/hooks/usePagination'

describe('usePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => usePagination())
      
      expect(result.current.currentPage).toBe(1)
      expect(result.current.pageSize).toBe(10)
      expect(result.current.totalItems).toBe(0)
      expect(result.current.totalPages).toBe(0)
    })

    it('initializes with custom values', () => {
      const initialConfig = {
        page: 3,
        pageSize: 25,
        totalItems: 100
      }
      
      const { result } = renderHook(() => usePagination(initialConfig))
      
      expect(result.current.currentPage).toBe(3)
      expect(result.current.pageSize).toBe(25)
      expect(result.current.totalItems).toBe(100)
      expect(result.current.totalPages).toBe(4)
    })
  })

  describe('pagination calculations', () => {
    it('calculates total pages correctly', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 23, pageSize: 10 }))
      
      expect(result.current.totalPages).toBe(3) // 23 items / 10 per page = 3 pages
    })

    it('handles exact division', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 20, pageSize: 10 }))
      
      expect(result.current.totalPages).toBe(2) // 20 items / 10 per page = 2 pages
    })

    it('handles zero items', () => {
      const { result } = renderHook(() => usePagination({ totalItems: 0, pageSize: 10 }))
      
      expect(result.current.totalPages).toBe(0)
    })

    it('calculates current range correctly', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 2, 
        pageSize: 10, 
        totalItems: 25 
      }))
      
      const range = result.current.getCurrentRange()
      
      expect(range).toEqual({
        start: 11, // (2-1) * 10 + 1
        end: 20,   // 2 * 10
        total: 25
      })
    })

    it('handles last page range correctly', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 3, 
        pageSize: 10, 
        totalItems: 25 
      }))
      
      const range = result.current.getCurrentRange()
      
      expect(range).toEqual({
        start: 21, // (3-1) * 10 + 1
        end: 25,   // Min of (3 * 10, 25)
        total: 25
      })
    })
  })

  describe('navigation methods', () => {
    it('goes to next page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      act(() => {
        result.current.goToNextPage()
      })
      
      expect(result.current.currentPage).toBe(2)
    })

    it('does not exceed total pages', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 3, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      act(() => {
        result.current.goToNextPage()
      })
      
      expect(result.current.currentPage).toBe(3) // Should remain at last page
    })

    it('goes to previous page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 2, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      act(() => {
        result.current.goToPreviousPage()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('does not go below page 1', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      act(() => {
        result.current.goToPreviousPage()
      })
      
      expect(result.current.currentPage).toBe(1) // Should remain at first page
    })

    it('goes to specific page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 50 
      }))
      
      act(() => {
        result.current.goToPage(3)
      })
      
      expect(result.current.currentPage).toBe(3)
    })

    it('validates page bounds when going to specific page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      // Try to go to page beyond total pages
      act(() => {
        result.current.goToPage(5)
      })
      
      expect(result.current.currentPage).toBe(3) // Should clamp to max page
      
      // Try to go to page below 1
      act(() => {
        result.current.goToPage(-1)
      })
      
      expect(result.current.currentPage).toBe(1) // Should clamp to min page
    })

    it('goes to first page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 5, 
        pageSize: 10, 
        totalItems: 100 
      }))
      
      act(() => {
        result.current.goToFirstPage()
      })
      
      expect(result.current.currentPage).toBe(1)
    })

    it('goes to last page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 47 
      }))
      
      act(() => {
        result.current.goToLastPage()
      })
      
      expect(result.current.currentPage).toBe(5) // 47 items / 10 per page = 5 pages
    })
  })

  describe('page size changes', () => {
    it('changes page size and adjusts current page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 3, 
        pageSize: 10, 
        totalItems: 50 
      }))
      
      // Currently showing items 21-30
      
      act(() => {
        result.current.setPageSize(25)
      })
      
      expect(result.current.pageSize).toBe(25)
      expect(result.current.totalPages).toBe(2) // 50 items / 25 per page = 2 pages
      expect(result.current.currentPage).toBe(1) // Adjust to valid page
    })

    it('maintains position when changing page size', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 2, 
        pageSize: 10, 
        totalItems: 50 
      }))
      
      // Currently showing items 11-20
      
      act(() => {
        result.current.setPageSize(5)
      })
      
      // Should try to maintain approximate position
      // Items 11-20 would now be on pages 3-4 (with 5 items per page)
      expect(result.current.pageSize).toBe(5)
      expect(result.current.currentPage).toBe(3) // Adjusted to show similar items
    })
  })

  describe('state updates', () => {
    it('updates total items and recalculates pages', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 3, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      expect(result.current.totalPages).toBe(3)
      
      act(() => {
        result.current.setTotalItems(15)
      })
      
      expect(result.current.totalItems).toBe(15)
      expect(result.current.totalPages).toBe(2) // 15 items / 10 per page = 2 pages
      expect(result.current.currentPage).toBe(2) // Adjusted to valid page
    })

    it('resets to first page when total items decreases significantly', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 5, 
        pageSize: 10, 
        totalItems: 100 
      }))
      
      act(() => {
        result.current.setTotalItems(8)
      })
      
      expect(result.current.totalPages).toBe(1) // 8 items / 10 per page = 1 page
      expect(result.current.currentPage).toBe(1) // Reset to first page
    })
  })

  describe('pagination info', () => {
    it('provides pagination metadata', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 2, 
        pageSize: 10, 
        totalItems: 45 
      }))
      
      const info = result.current.getPaginationInfo()
      
      expect(info).toEqual({
        currentPage: 2,
        totalPages: 5,
        pageSize: 10,
        totalItems: 45,
        hasNextPage: true,
        hasPreviousPage: true,
        isFirstPage: false,
        isLastPage: false
      })
    })

    it('correctly identifies first page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      const info = result.current.getPaginationInfo()
      
      expect(info.isFirstPage).toBe(true)
      expect(info.hasPreviousPage).toBe(false)
    })

    it('correctly identifies last page', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 3, 
        pageSize: 10, 
        totalItems: 30 
      }))
      
      const info = result.current.getPaginationInfo()
      
      expect(info.isLastPage).toBe(true)
      expect(info.hasNextPage).toBe(false)
    })
  })

  describe('callback support', () => {
    it('calls callback when page changes', () => {
      const onPageChange = vi.fn()
      
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 30,
        onPageChange 
      }))
      
      act(() => {
        result.current.goToNextPage()
      })
      
      expect(onPageChange).toHaveBeenCalledWith(2, 10)
    })

    it('calls callback when page size changes', () => {
      const onPageChange = vi.fn()
      
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 10, 
        totalItems: 30,
        onPageChange 
      }))
      
      act(() => {
        result.current.setPageSize(25)
      })
      
      expect(onPageChange).toHaveBeenCalledWith(1, 25)
    })
  })

  describe('edge cases', () => {
    it('handles zero page size gracefully', () => {
      const { result } = renderHook(() => usePagination({ 
        page: 1, 
        pageSize: 0, 
        totalItems: 30 
      }))
      
      expect(result.current.totalPages).toBe(0)
      expect(result.current.getCurrentRange()).toEqual({
        start: 1,
        end: 0,
        total: 30
      })
    })

    it('handles negative values gracefully', () => {
      const { result } = renderHook(() => usePagination({ 
        page: -1, 
        pageSize: -5, 
        totalItems: -10 
      }))
      
      expect(result.current.currentPage).toBe(1)
      expect(result.current.pageSize).toBe(10) // Default value
      expect(result.current.totalItems).toBe(0)
    })
  })
})