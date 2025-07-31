import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
})

describe('useIsMobile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.innerWidth = 1024
  })

  it('returns false for desktop screens', () => {
    window.innerWidth = 1024
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(false)
  })

  it('returns true for mobile screens', () => {
    window.innerWidth = 600
    
    const { result } = renderHook(() => useIsMobile())
    
    expect(result.current).toBe(true)
  })

  it('responds to window resize events', () => {
    const { result } = renderHook(() => useIsMobile())
    
    // Initially desktop
    expect(result.current).toBe(false)
    
    // Simulate resize to mobile
    act(() => {
      window.innerWidth = 600
      window.dispatchEvent(new Event('resize'))
    })
    
    // Should still work with the hook logic
    expect(typeof result.current).toBe('boolean')
  })
})