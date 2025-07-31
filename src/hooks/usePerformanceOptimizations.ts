import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient, QueryKey } from '@tanstack/react-query';

// Advanced caching hook with TTL and invalidation strategies
export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  strategy?: 'lru' | 'fifo' | 'ttl'; // Cache eviction strategy
}

export function useAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig = {}
) {
  const { ttl = 5 * 60 * 1000, maxSize = 100, strategy = 'lru' } = config;
  const cache = useRef(new Map<string, { data: T; timestamp: number; accessCount: number }>());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getCachedData = useCallback((cacheKey: string): T | null => {
    const cached = cache.current.get(cacheKey);
    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > ttl) {
      cache.current.delete(cacheKey);
      return null;
    }

    // Update access count for LRU
    if (strategy === 'lru') {
      cached.accessCount = Date.now();
      cache.current.set(cacheKey, cached);
    }

    return cached.data;
  }, [ttl, strategy]);

  const setCachedData = useCallback((cacheKey: string, data: T) => {
    // Evict old entries if cache is full
    if (cache.current.size >= maxSize) {
      const entries = Array.from(cache.current.entries());
      
      let keyToEvict: string;
      if (strategy === 'lru') {
        keyToEvict = entries.reduce((oldest, [key, value]) => 
          value.accessCount < entries.find(([k]) => k === oldest)?.[1].accessCount || 0 ? key : oldest
        , entries[0][0]);
      } else if (strategy === 'fifo') {
        keyToEvict = entries.reduce((oldest, [key, value]) => 
          value.timestamp < entries.find(([k]) => k === oldest)?.[1].timestamp || 0 ? key : oldest
        , entries[0][0]);
      } else {
        // TTL strategy - evict expired entries first
        const expired = entries.find(([, value]) => Date.now() - value.timestamp > ttl);
        keyToEvict = expired ? expired[0] : entries[0][0];
      }
      
      cache.current.delete(keyToEvict);
    }

    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      accessCount: Date.now()
    });
  }, [maxSize, strategy, ttl]);

  const fetchData = useCallback(async (forceRefresh = false): Promise<T> => {
    if (!forceRefresh) {
      const cached = getCachedData(key);
      if (cached) return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetcher();
      setCachedData(key, data);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, getCachedData, setCachedData]);

  const invalidate = useCallback(() => {
    cache.current.delete(key);
  }, [key]);

  const invalidateAll = useCallback(() => {
    cache.current.clear();
  }, []);

  return {
    fetchData,
    invalidate,
    invalidateAll,
    isLoading,
    error,
    cacheSize: cache.current.size
  };
}

// Data prefetching hook
export function useDataPrefetching<T>(
  queries: Array<{
    key: QueryKey;
    fetcher: () => Promise<T>;
    condition?: () => boolean;
    priority?: number;
  }>
) {
  const queryClient = useQueryClient();
  const [prefetchStats, setPrefetchStats] = useState({
    completed: 0,
    failed: 0,
    inProgress: 0
  });

  const prefetchData = useCallback(async () => {
    const sortedQueries = queries
      .filter(query => !query.condition || query.condition())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));

    setPrefetchStats(prev => ({ ...prev, inProgress: sortedQueries.length }));

    const results = await Promise.allSettled(
      sortedQueries.map(async (query) => {
        try {
          await queryClient.prefetchQuery({
            queryKey: query.key,
            queryFn: query.fetcher,
            staleTime: 2 * 60 * 1000, // 2 minutes
          });
          return { success: true };
        } catch (error) {
          return { success: false, error };
        }
      })
    );

    const completed = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - completed;

    setPrefetchStats({
      completed,
      failed,
      inProgress: 0
    });
  }, [queries, queryClient]);

  useEffect(() => {
    const timer = setTimeout(prefetchData, 100); // Slight delay to avoid blocking initial render
    return () => clearTimeout(timer);
  }, [prefetchData]);

  return { prefetchStats, prefetchData };
}

// Query optimization hook
export function useOptimizedQueries() {
  const queryClient = useQueryClient();
  const [stats, setStats] = useState({
    totalQueries: 0,
    cachedQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0
  });

  const optimizeQueries = useCallback(() => {
    const queries = queryClient.getQueryCache().getAll();
    
    // Remove stale queries
    queries.forEach(query => {
      if (query.state.dataUpdatedAt < Date.now() - 10 * 60 * 1000) { // 10 minutes
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });

    // Update stats
    const activeQueries = queryClient.getQueryCache().getAll();
    const cachedQueries = activeQueries.filter(q => q.state.data !== undefined);
    const failedQueries = activeQueries.filter(q => q.state.error !== null);

    setStats({
      totalQueries: activeQueries.length,
      cachedQueries: cachedQueries.length,
      failedQueries: failedQueries.length,
      averageResponseTime: 0 // Could be calculated from query metrics
    });
  }, [queryClient]);

  useEffect(() => {
    const interval = setInterval(optimizeQueries, 60000); // Every minute
    return () => clearInterval(interval);
  }, [optimizeQueries]);

  const clearCache = useCallback(() => {
    queryClient.clear();
    setStats({ totalQueries: 0, cachedQueries: 0, failedQueries: 0, averageResponseTime: 0 });
  }, [queryClient]);

  return { stats, optimizeQueries, clearCache };
}

// Virtual scrolling hook for large datasets
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll<T>(
  items: T[],
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, startIndex + visibleCount + 2 * overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}

// Infinite scroll hook
export function useInfiniteScroll<T>(
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  options: {
    initialPage?: number;
    threshold?: number;
  } = {}
) {
  const { initialPage = 1, threshold = 100 } = options;
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchMore(page);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMore, page, isLoading, hasMore]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMore();
    }
  }, [loadMore, threshold]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  // Load initial data
  useEffect(() => {
    if (data.length === 0 && hasMore) {
      loadMore();
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    hasMore,
    loadMore,
    handleScroll,
    reset
  };
}