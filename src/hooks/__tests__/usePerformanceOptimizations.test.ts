import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations'

// Mock performance API
const mockPerformanceAPI = {
  now: vi.fn(() => 1000),
  getEntriesByType: vi.fn(() => []),
  mark: vi.fn(),
  measure: vi.fn()
}

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})

global.performance = mockPerformanceAPI as any
global.IntersectionObserver = mockIntersectionObserver as any

describe('usePerformanceOptimizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('component lazy loading', () => {
    it('provides lazy loading utilities', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      expect(result.current.lazyLoad).toBeDefined()
      expect(typeof result.current.lazyLoad).toBe('function')
    })

    it('tracks component loading performance', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const componentName = 'EmployeeList'
      
      act(() => {
        result.current.trackComponentLoad(componentName)
      })
      
      expect(mockPerformanceAPI.mark).toHaveBeenCalledWith(`${componentName}-start`)
    })

    it('measures component loading time', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const componentName = 'EmployeeList'
      
      act(() => {
        result.current.trackComponentLoad(componentName)
        result.current.finishComponentLoad(componentName)
      })
      
      expect(mockPerformanceAPI.mark).toHaveBeenCalledWith(`${componentName}-start`)
      expect(mockPerformanceAPI.mark).toHaveBeenCalledWith(`${componentName}-end`)
      expect(mockPerformanceAPI.measure).toHaveBeenCalledWith(
        `${componentName}-load-time`,
        `${componentName}-start`,
        `${componentName}-end`
      )
    })
  })

  describe('image optimization', () => {
    it('provides image optimization utilities', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      expect(result.current.optimizeImage).toBeDefined()
      expect(typeof result.current.optimizeImage).toBe('function')
    })

    it('generates optimized image URLs', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const originalUrl = 'https://example.com/image.jpg'
      const options = { width: 300, quality: 80 }
      
      const optimizedUrl = result.current.optimizeImage(originalUrl, options)
      
      expect(optimizedUrl).toContain('w=300')
      expect(optimizedUrl).toContain('q=80')
    })

    it('provides WebP fallback support', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const originalUrl = 'https://example.com/image.jpg'
      
      const sources = result.current.getImageSources(originalUrl)
      
      expect(sources).toHaveProperty('webp')
      expect(sources).toHaveProperty('fallback')
      expect(sources.webp).toContain('.webp')
      expect(sources.fallback).toBe(originalUrl)
    })
  })

  describe('viewport lazy loading', () => {
    it('creates intersection observer for lazy loading', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const callback = vi.fn()
      const element = document.createElement('div')
      
      act(() => {
        result.current.observeElement(element, callback)
      })
      
      expect(mockIntersectionObserver).toHaveBeenCalled()
    })

    it('handles element visibility changes', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const callback = vi.fn()
      const element = document.createElement('div')
      
      // Mock intersection observer callback
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
      
      mockIntersectionObserver.mockImplementation((cb) => {
        // Simulate element becoming visible
        setTimeout(() => {
          cb([{ target: element, isIntersecting: true }], mockObserver)
        }, 0)
        return mockObserver
      })
      
      act(() => {
        result.current.observeElement(element, callback)
      })
      
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(element, true)
      }, 10)
    })

    it('unobserves elements when component unmounts', () => {
      const { result, unmount } = renderHook(() => usePerformanceOptimizations())
      
      const element = document.createElement('div')
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
      
      mockIntersectionObserver.mockReturnValue(mockObserver)
      
      act(() => {
        result.current.observeElement(element, vi.fn())
      })
      
      unmount()
      
      expect(mockObserver.disconnect).toHaveBeenCalled()
    })
  })

  describe('bundle optimization', () => {
    it('provides code splitting utilities', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      expect(result.current.loadModule).toBeDefined()
      expect(typeof result.current.loadModule).toBe('function')
    })

    it('caches dynamically loaded modules', async () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const mockModule = { default: 'MockComponent' }
      const moduleLoader = vi.fn().mockResolvedValue(mockModule)
      
      // First load
      const module1 = await result.current.loadModule('test-module', moduleLoader)
      expect(module1).toBe(mockModule)
      expect(moduleLoader).toHaveBeenCalledTimes(1)
      
      // Second load should use cache
      const module2 = await result.current.loadModule('test-module', moduleLoader)
      expect(module2).toBe(mockModule)
      expect(moduleLoader).toHaveBeenCalledTimes(1) // Still only called once
    })

    it('handles module loading errors', async () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const moduleLoader = vi.fn().mockRejectedValue(new Error('Failed to load'))
      
      await expect(
        result.current.loadModule('failing-module', moduleLoader)
      ).rejects.toThrow('Failed to load')
    })
  })

  describe('performance monitoring', () => {
    it('tracks render performance', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      act(() => {
        result.current.startRenderMeasurement('component-render')
      })
      
      expect(mockPerformanceAPI.mark).toHaveBeenCalledWith('component-render-start')
      
      act(() => {
        result.current.endRenderMeasurement('component-render')
      })
      
      expect(mockPerformanceAPI.mark).toHaveBeenCalledWith('component-render-end')
      expect(mockPerformanceAPI.measure).toHaveBeenCalledWith(
        'component-render',
        'component-render-start',
        'component-render-end'
      )
    })

    it('collects performance metrics', () => {
      // Mock navigation timing
      mockPerformanceAPI.getEntriesByType.mockReturnValue([
        {
          name: 'navigation',
          loadEventEnd: 2000,
          navigationStart: 0,
          domContentLoadedEventEnd: 1500
        }
      ])
      
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const metrics = result.current.getPerformanceMetrics()
      
      expect(metrics).toHaveProperty('loadTime')
      expect(metrics).toHaveProperty('domContentLoaded')
      expect(metrics.loadTime).toBe(2000)
      expect(metrics.domContentLoaded).toBe(1500)
    })

    it('reports performance issues', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      act(() => {
        result.current.reportPerformanceIssue('slow-component', {
          renderTime: 500,
          threshold: 100
        })
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Performance issue detected:',
        'slow-component',
        expect.any(Object)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('memory optimization', () => {
    it('provides memory management utilities', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      expect(result.current.cleanupMemory).toBeDefined()
      expect(typeof result.current.cleanupMemory).toBe('function')
    })

    it('tracks memory usage', () => {
      // Mock memory API
      global.performance.memory = {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 100000000
      } as any
      
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const memoryInfo = result.current.getMemoryUsage()
      
      expect(memoryInfo).toEqual({
        used: 10000000,
        total: 20000000,
        limit: 100000000,
        percentage: 50
      })
    })

    it('warns about high memory usage', () => {
      // Mock high memory usage
      global.performance.memory = {
        usedJSHeapSize: 90000000,
        totalJSHeapSize: 100000000,
        jsHeapSizeLimit: 100000000
      } as any
      
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      act(() => {
        result.current.checkMemoryUsage()
      })
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'High memory usage detected:',
        expect.any(Object)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('network optimization', () => {
    it('provides network optimization utilities', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      expect(result.current.preloadResource).toBeDefined()
      expect(typeof result.current.preloadResource).toBe('function')
    })

    it('creates preload links for resources', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const url = 'https://example.com/script.js'
      const type = 'script'
      
      act(() => {
        result.current.preloadResource(url, type)
      })
      
      const preloadLink = document.querySelector(`link[href="${url}"]`)
      expect(preloadLink).toBeInTheDocument()
      expect(preloadLink?.getAttribute('rel')).toBe('preload')
      expect(preloadLink?.getAttribute('as')).toBe(type)
    })

    it('handles duplicate preload requests', () => {
      const { result } = renderHook(() => usePerformanceOptimizations())
      
      const url = 'https://example.com/style.css'
      
      act(() => {
        result.current.preloadResource(url, 'style')
        result.current.preloadResource(url, 'style') // Duplicate
      })
      
      const preloadLinks = document.querySelectorAll(`link[href="${url}"]`)
      expect(preloadLinks).toHaveLength(1) // Should not create duplicates
    })
  })

  describe('cleanup and lifecycle', () => {
    it('cleans up observers on unmount', () => {
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
      
      mockIntersectionObserver.mockReturnValue(mockObserver)
      
      const { result, unmount } = renderHook(() => usePerformanceOptimizations())
      
      const element = document.createElement('div')
      
      act(() => {
        result.current.observeElement(element, vi.fn())
      })
      
      unmount()
      
      expect(mockObserver.disconnect).toHaveBeenCalled()
    })

    it('removes preload links on cleanup', () => {
      const { result, unmount } = renderHook(() => usePerformanceOptimizations())
      
      const url = 'https://example.com/cleanup-test.js'
      
      act(() => {
        result.current.preloadResource(url, 'script')
      })
      
      expect(document.querySelector(`link[href="${url}"]`)).toBeInTheDocument()
      
      unmount()
      
      expect(document.querySelector(`link[href="${url}"]`)).not.toBeInTheDocument()
    })
  })
})