import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMobile } from '@/hooks/use-mobile'

// Mock window.matchMedia
const mockMatchMedia = vi.fn()

describe('use-mobile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Reset matchMedia mock
    mockMatchMedia.mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia
    })
  })

  describe('default breakpoint', () => {
    it('returns false for desktop screens', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })

      const { result } = renderHook(() => useMobile())
      
      expect(result.current).toBe(false)
    })

    it('returns true for mobile screens', () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      })

      const { result } = renderHook(() => useMobile())
      
      expect(result.current).toBe(true)
    })

    it('uses correct default query', () => {
      renderHook(() => useMobile())
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 768px)')
    })
  })

  describe('custom breakpoint', () => {
    it('accepts custom breakpoint value', () => {
      const customBreakpoint = 1024
      
      renderHook(() => useMobile(customBreakpoint))
      
      expect(mockMatchMedia).toHaveBeenCalledWith(`(max-width: ${customBreakpoint}px)`)
    })

    it('works with different breakpoint values', () => {
      const breakpoints = [640, 768, 1024, 1280]
      
      breakpoints.forEach(breakpoint => {
        mockMatchMedia.mockClear()
        renderHook(() => useMobile(breakpoint))
        expect(mockMatchMedia).toHaveBeenCalledWith(`(max-width: ${breakpoint}px)`)
      })
    })
  })

  describe('responsive updates', () => {
    it('updates when screen size changes', () => {
      let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null
      
      const mockMediaQuery = {
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            mediaQueryHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { result } = renderHook(() => useMobile())
      
      expect(result.current).toBe(false)
      
      // Simulate screen size change to mobile
      act(() => {
        if (mediaQueryHandler) {
          mediaQueryHandler({ matches: true } as MediaQueryListEvent)
        }
      })
      
      expect(result.current).toBe(true)
    })

    it('handles multiple breakpoint changes', () => {
      let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null
      
      const mockMediaQuery = {
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            mediaQueryHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { result } = renderHook(() => useMobile())
      
      // Initial state: desktop
      expect(result.current).toBe(false)
      
      // Change to mobile
      act(() => {
        if (mediaQueryHandler) {
          mediaQueryHandler({ matches: true } as MediaQueryListEvent)
        }
      })
      expect(result.current).toBe(true)
      
      // Change back to desktop
      act(() => {
        if (mediaQueryHandler) {
          mediaQueryHandler({ matches: false } as MediaQueryListEvent)
        }
      })
      expect(result.current).toBe(false)
    })
  })

  describe('event listener management', () => {
    it('adds event listener on mount', () => {
      const mockMediaQuery = {
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      renderHook(() => useMobile())
      
      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('removes event listener on unmount', () => {
      const mockMediaQuery = {
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { unmount } = renderHook(() => useMobile())
      
      unmount()
      
      expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    })

    it('handles missing matchMedia gracefully', () => {
      // Mock environment without matchMedia (older browsers)
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: undefined
      })

      const { result } = renderHook(() => useMobile())
      
      // Should default to false when matchMedia is not available
      expect(result.current).toBe(false)
    })
  })

  describe('common mobile breakpoints', () => {
    const commonBreakpoints = [
      { name: 'small mobile', width: 480 },
      { name: 'mobile', width: 768 },
      { name: 'tablet', width: 1024 },
      { name: 'desktop', width: 1280 }
    ]

    commonBreakpoints.forEach(({ name, width }) => {
      it(`works with ${name} breakpoint (${width}px)`, () => {
        mockMatchMedia.mockReturnValue({
          matches: true,
          media: `(max-width: ${width}px)`,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        })

        const { result } = renderHook(() => useMobile(width))
        
        expect(result.current).toBe(true)
        expect(mockMatchMedia).toHaveBeenCalledWith(`(max-width: ${width}px)`)
      })
    })
  })

  describe('edge cases', () => {
    it('handles zero breakpoint', () => {
      renderHook(() => useMobile(0))
      
      expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 0px)')
    })

    it('handles very large breakpoint', () => {
      const largeBreakpoint = 9999
      
      renderHook(() => useMobile(largeBreakpoint))
      
      expect(mockMatchMedia).toHaveBeenCalledWith(`(max-width: ${largeBreakpoint}px)`)
    })

    it('handles floating point breakpoint', () => {
      const floatBreakpoint = 768.5
      
      renderHook(() => useMobile(floatBreakpoint))
      
      expect(mockMatchMedia).toHaveBeenCalledWith(`(max-width: ${floatBreakpoint}px)`)
    })
  })

  describe('SSR compatibility', () => {
    it('works in server-side rendering environment', () => {
      // Mock SSR environment (no window.matchMedia)
      const originalMatchMedia = window.matchMedia
      delete (window as any).matchMedia

      const { result } = renderHook(() => useMobile())
      
      // Should not crash and default to false
      expect(result.current).toBe(false)
      
      // Restore
      window.matchMedia = originalMatchMedia
    })
  })

  describe('performance considerations', () => {
    it('only creates one media query listener per breakpoint', () => {
      const { rerender } = renderHook(() => useMobile())
      
      expect(mockMatchMedia).toHaveBeenCalledTimes(1)
      
      // Re-render should not create new media query
      rerender()
      
      expect(mockMatchMedia).toHaveBeenCalledTimes(1)
    })

    it('handles rapid breakpoint changes efficiently', () => {
      let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null
      
      const mockMediaQuery = {
        matches: false,
        media: '(max-width: 768px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, handler) => {
          if (event === 'change') {
            mediaQueryHandler = handler
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }
      
      mockMatchMedia.mockReturnValue(mockMediaQuery)

      const { result } = renderHook(() => useMobile())
      
      // Simulate rapid changes
      act(() => {
        for (let i = 0; i < 10; i++) {
          if (mediaQueryHandler) {
            mediaQueryHandler({ matches: i % 2 === 0 } as MediaQueryListEvent)
          }
        }
      })
      
      // Should handle all changes without issues
      expect(result.current).toBe(false) // Last change was even (false)
    })
  })
})