/**
 * Reusable API caching utility for frontend components
 * Provides configurable caching with TTL and cache invalidation
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  enableLogging?: boolean;
}

class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = { ttl: 5 * 60 * 1000 }) { // Default 5 minutes
    this.config = {
      maxSize: 100,
      enableLogging: false,
      ...config
    };
  }

  /**
   * Get cached data if valid, otherwise return null
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.log(`Cache miss for key: ${key}`);
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      this.cache.delete(key);
      this.log(`Cache expired for key: ${key}`);
      return null;
    }

    this.log(`Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Set data in cache with TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const effectiveTtl = ttl ?? this.config.ttl;

    // Check cache size limit
    if (this.config.maxSize && this.cache.size >= this.config.maxSize) {
      // Remove oldest entry (simple LRU approximation)
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.log(`Cache size limit reached, removed oldest entry: ${firstKey}`);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: effectiveTtl
    });

    this.log(`Cached data for key: ${key}, TTL: ${effectiveTtl}ms`);
  }

  /**
   * Get data from cache or fetch from API and cache it
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
      return data;
    } catch (error) {
      this.log(`Failed to fetch and cache data for key: ${key}`, error);
      throw error;
    }
  }

  /**
   * Remove specific key from cache
   */
  invalidate(key: string): void {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.log(`Invalidated cache for key: ${key}`);
    }
  }

  /**
   * Remove all keys matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.log(`Invalidated cache for pattern match: ${key}`);
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.log(`Cleared all cache entries (${size} items)`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expiresIn: entry.timestamp + entry.ttl - Date.now()
      }))
    };
  }

  private log(message: string, error?: any): void {
    if (this.config.enableLogging) {
      if (error) {
        console.log(`[ApiCache] ${message}`, error);
      } else {
        console.log(`[ApiCache] ${message}`);
      }
    }
  }
}

// Pre-configured cache instances for different data types
export const platformCache = new ApiCache({
  ttl: 5 * 60 * 1000, // 5 minutes for platform data
  enableLogging: process.env.NODE_ENV === 'development'
});

export const playlistCache = new ApiCache({
  ttl: 5 * 60 * 1000, // 2 minutes for playlist data
  enableLogging: process.env.NODE_ENV === 'development'
});

export const trackCache = new ApiCache({
  ttl: 10 * 60 * 1000, // 10 minutes for track data
  enableLogging: process.env.NODE_ENV === 'development'
});

export const syncCache = new ApiCache({
  ttl: 2 * 60 * 1000, // 2 minutes for sync data
  enableLogging: process.env.NODE_ENV === 'development'
});

// Utility functions for common cache operations
export const cacheKeys = {
  platforms: (userId?: string) => `platforms_connected${userId ? `_${userId}` : ''}`,
  playlists: (platform: string, userId?: string) => `playlists_${platform}${userId ? `_${userId}` : ''}`,
  playlistTracks: (platform: string, playlistId: string) => `tracks_${platform}_${playlistId}`,
  conversionStatus: (jobId: string) => `conversion_${jobId}`,
  conversionHistory: (userId?: string) => `conversion_history${userId ? `_${userId}` : ''}`
};

export default ApiCache;
