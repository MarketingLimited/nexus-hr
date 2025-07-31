import React from 'react'
import { QueryClient } from '@tanstack/react-query'

// Performance optimization utilities for large datasets
export class PerformanceOptimizer {
  private static queryClient: QueryClient

  static setQueryClient(client: QueryClient) {
    this.queryClient = client
  }

  // Virtualization helper for large lists
  static createVirtualizedList<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    buffer: number = 5
  ) {
    return {
      getVisibleRange: (scrollTop: number) => {
        const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
        const visibleCount = Math.ceil(containerHeight / itemHeight) + buffer * 2
        const visibleEnd = Math.min(items.length, visibleStart + visibleCount)
        
        return {
          start: visibleStart,
          end: visibleEnd,
          items: items.slice(visibleStart, visibleEnd),
          totalHeight: items.length * itemHeight,
          offsetY: visibleStart * itemHeight
        }
      }
    }
  }

  // Debounced search for better performance
  static createDebouncedSearch(
    searchFn: (query: string) => void,
    delay: number = 300
  ) {
    let timeoutId: NodeJS.Timeout

    return (query: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => searchFn(query), delay)
    }
  }

  // Efficient data filtering and sorting
  static optimizeDataOperations<T>(
    data: T[],
    operations: {
      filter?: (item: T) => boolean
      sort?: (a: T, b: T) => number
      paginate?: { page: number; pageSize: number }
    }
  ) {
    let result = data

    // Apply filter first (most selective)
    if (operations.filter) {
      result = result.filter(operations.filter)
    }

    // Then sort
    if (operations.sort) {
      result = [...result].sort(operations.sort)
    }

    // Finally paginate
    if (operations.paginate) {
      const { page, pageSize } = operations.paginate
      const start = (page - 1) * pageSize
      const end = start + pageSize
      result = result.slice(start, end)
    }

    return {
      data: result,
      total: operations.paginate ? data.length : result.length,
      hasMore: operations.paginate 
        ? (operations.paginate.page * operations.paginate.pageSize) < data.length 
        : false
    }
  }

  // Memory-efficient query caching
  static optimizeQueryCache(maxCacheSize: number = 1000) {
    if (!this.queryClient) return

    const cache = this.queryClient.getQueryCache()
    const queries = cache.getAll()

    if (queries.length > maxCacheSize) {
      // Remove oldest, least used queries
      const sortedQueries = queries.sort((a, b) => {
        const aLastAccess = a.state.dataUpdatedAt
        const bLastAccess = b.state.dataUpdatedAt
        return aLastAccess - bLastAccess
      })

      const queriesToRemove = sortedQueries.slice(0, queries.length - maxCacheSize)
      queriesToRemove.forEach(query => {
        cache.remove(query)
      })
    }
  }

  // Batch API requests to reduce network overhead
  static createRequestBatcher<T>(
    requestFn: (ids: string[]) => Promise<T[]>,
    batchSize: number = 10,
    delay: number = 50
  ) {
    const batchQueue: string[] = []
    const resolvers: Array<(value: T) => void> = []
    let timeoutId: NodeJS.Timeout

    const processBatch = async () => {
      if (batchQueue.length === 0) return

      const currentBatch = batchQueue.splice(0, batchSize)
      const currentResolvers = resolvers.splice(0, batchSize)

      try {
        const results = await requestFn(currentBatch)
        results.forEach((result, index) => {
          currentResolvers[index]?.(result)
        })
      } catch (error) {
        currentResolvers.forEach(resolver => {
          // Handle error appropriately
          resolver(null as any)
        })
      }

      // Process remaining items
      if (batchQueue.length > 0) {
        timeoutId = setTimeout(processBatch, delay)
      }
    }

    return (id: string): Promise<T> => {
      return new Promise((resolve) => {
        batchQueue.push(id)
        resolvers.push(resolve)

        clearTimeout(timeoutId)
        timeoutId = setTimeout(processBatch, delay)
      })
    }
  }

  // Optimize component re-renders
  static createMemoizedSelector<T, R>(
    selector: (data: T) => R,
    equalityFn?: (a: R, b: R) => boolean
  ) {
    let lastInput: T
    let lastResult: R

    const defaultEqualityFn = (a: R, b: R) => a === b

    return (input: T): R => {
      const isEqual = equalityFn || defaultEqualityFn
      
      if (lastInput !== input) {
        const newResult = selector(input)
        
        if (!lastResult || !isEqual(lastResult, newResult)) {
          lastResult = newResult
        }
        
        lastInput = input
      }

      return lastResult
    }
  }

  // Preload critical data
  static async preloadCriticalData() {
    if (!this.queryClient) return

    const criticalQueries = [
      { queryKey: ['employees', 'summary'], staleTime: 5 * 60 * 1000 },
      { queryKey: ['system-health'], staleTime: 30 * 1000 },
      { queryKey: ['user-permissions'], staleTime: 10 * 60 * 1000 },
    ]

    await Promise.allSettled(
      criticalQueries.map(query =>
        this.queryClient.prefetchQuery(query)
      )
    )
  }

  // Monitor and report performance metrics
  static createPerformanceMonitor() {
    const metrics = {
      renderTimes: [] as number[],
      queryTimes: [] as number[],
      memoryUsage: [] as number[]
    }

    return {
      measureRender: (fn: () => void) => {
        const start = performance.now()
        fn()
        const end = performance.now()
        const renderTime = end - start
        
        metrics.renderTimes.push(renderTime)
        
        // Keep only last 100 measurements
        if (metrics.renderTimes.length > 100) {
          metrics.renderTimes.shift()
        }

        return renderTime
      },

      measureQuery: async <T>(queryFn: () => Promise<T>): Promise<T> => {
        const start = performance.now()
        const result = await queryFn()
        const end = performance.now()
        const queryTime = end - start
        
        metrics.queryTimes.push(queryTime)
        
        if (metrics.queryTimes.length > 100) {
          metrics.queryTimes.shift()
        }

        return result
      },

      recordMemoryUsage: () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory.usedJSHeapSize
          metrics.memoryUsage.push(memory)
          
          if (metrics.memoryUsage.length > 100) {
            metrics.memoryUsage.shift()
          }
        }
      },

      getMetrics: () => ({
        averageRenderTime: metrics.renderTimes.reduce((a, b) => a + b, 0) / metrics.renderTimes.length || 0,
        averageQueryTime: metrics.queryTimes.reduce((a, b) => a + b, 0) / metrics.queryTimes.length || 0,
        averageMemoryUsage: metrics.memoryUsage.reduce((a, b) => a + b, 0) / metrics.memoryUsage.length || 0,
        slowRenders: metrics.renderTimes.filter(time => time > 16.67).length, // > 60fps
        slowQueries: metrics.queryTimes.filter(time => time > 1000).length, // > 1 second
      }),

      reset: () => {
        metrics.renderTimes.length = 0
        metrics.queryTimes.length = 0
        metrics.memoryUsage.length = 0
      }
    }
  }
}

// Hook for using performance optimization in components
export const usePerformanceOptimization = () => {
  const performanceMonitor = React.useMemo(() => 
    PerformanceOptimizer.createPerformanceMonitor(), []
  )

  React.useEffect(() => {
    const interval = setInterval(() => {
      performanceMonitor.recordMemoryUsage()
      PerformanceOptimizer.optimizeQueryCache()
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [performanceMonitor])

  return {
    measureRender: performanceMonitor.measureRender,
    measureQuery: performanceMonitor.measureQuery,
    getMetrics: performanceMonitor.getMetrics,
    createVirtualizedList: PerformanceOptimizer.createVirtualizedList,
    createDebouncedSearch: PerformanceOptimizer.createDebouncedSearch,
    optimizeDataOperations: PerformanceOptimizer.optimizeDataOperations,
  }
}
