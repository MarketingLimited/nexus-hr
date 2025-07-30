interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface MemoryOptimizationOptions {
  maxCacheSize?: number;
  ttl?: number; // Time to live in milliseconds
  compressionThreshold?: number; // Size in bytes to trigger compression
}

class MemoryOptimizer {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private compressionCache: Map<string, string> = new Map();
  private options: Required<MemoryOptimizationOptions>;

  constructor(options: MemoryOptimizationOptions = {}) {
    this.options = {
      maxCacheSize: options.maxCacheSize || 100,
      ttl: options.ttl || 30 * 60 * 1000, // 30 minutes
      compressionThreshold: options.compressionThreshold || 1024 * 10, // 10KB
    };

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // Cache data with automatic compression for large objects
  set<T>(key: string, data: T): void {
    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;

    // Use compression for large data
    if (size > this.options.compressionThreshold) {
      this.compressionCache.set(key, this.compress(serialized));
    } else {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        accessCount: 0,
        lastAccessed: Date.now(),
      };
      this.cache.set(key, entry);
    }

    // Evict old entries if cache is full
    if (this.cache.size > this.options.maxCacheSize) {
      this.evictLeastUsed();
    }
  }

  // Get cached data
  get<T>(key: string): T | null {
    // Check compressed cache first
    if (this.compressionCache.has(key)) {
      const compressed = this.compressionCache.get(key)!;
      const decompressed = this.decompress(compressed);
      return JSON.parse(decompressed);
    }

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  // Check if key exists in cache
  has(key: string): boolean {
    return this.cache.has(key) || this.compressionCache.has(key);
  }

  // Remove specific cache entry
  delete(key: string): boolean {
    const deletedFromCache = this.cache.delete(key);
    const deletedFromCompression = this.compressionCache.delete(key);
    return deletedFromCache || deletedFromCompression;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.compressionCache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      compressedCacheSize: this.compressionCache.size,
      totalEntries: this.cache.size + this.compressionCache.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.options.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  // Evict least recently used entries
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let leastUsedScore = Infinity;

    this.cache.forEach((entry, key) => {
      // Score based on access count and recency
      const score = entry.accessCount / (Date.now() - entry.lastAccessed + 1);
      if (score < leastUsedScore) {
        leastUsedScore = score;
        leastUsedKey = key;
      }
    });

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }

  // Simple compression using basic string compression
  private compress(data: string): string {
    // Simple run-length encoding for demonstration
    // In production, consider using libraries like lz-string or pako
    return data.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }

  // Simple decompression
  private decompress(compressed: string): string {
    // Reverse the simple compression
    return compressed.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }

  // Estimate memory usage
  private estimateMemoryUsage(): number {
    let totalSize = 0;

    this.cache.forEach(entry => {
      totalSize += JSON.stringify(entry).length * 2; // Rough estimate
    });

    this.compressionCache.forEach(data => {
      totalSize += data.length * 2;
    });

    return totalSize;
  }
}

// Memory optimization utilities
export const memoryOptimizer = new MemoryOptimizer();

// Memoization decorator for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    
    // Limit cache size
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  }) as T;
}

// Debounced function for reducing API calls
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttled function for limiting execution frequency
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}