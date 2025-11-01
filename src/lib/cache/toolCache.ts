import crypto from 'crypto';

interface CacheEntry {
  result: any;
  timestamp: number;
  toolName: string;
  args: Record<string, any>;
}

/**
 * Simple in-memory LRU cache for tool results
 * Prevents redundant tool calls even if the model ignores context
 */
class ToolCache {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize: number = 50, ttlMinutes: number = 30) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  /**
   * Generate a cache key from tool name and arguments
   */
  private generateKey(toolName: string, args: Record<string, any>): string {
    const argsString = JSON.stringify(args, Object.keys(args).sort());
    const hash = crypto.createHash('sha256').update(`${toolName}:${argsString}`).digest('hex');
    return hash.substring(0, 16); // Use first 16 chars for brevity
  }

  /**
   * Get cached result if available and not expired
   */
  get(toolName: string, args: Record<string, any>): any | null {
    const key = this.generateKey(toolName, args);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    console.log(`[Cache] HIT for ${toolName}`, { age: `${Math.round(age / 1000)}s ago` });
    return entry.result;
  }

  /**
   * Store result in cache
   */
  set(toolName: string, args: Record<string, any>, result: any): void {
    const key = this.generateKey(toolName, args);

    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        this.cache.delete(firstKey);
        console.log('[Cache] Evicted oldest entry');
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      toolName,
      args,
    });

    console.log(`[Cache] STORED ${toolName}`, { cacheSize: this.cache.size });
  }

  /**
   * Check if a tool call is cached
   */
  has(toolName: string, args: Record<string, any>): boolean {
    return this.get(toolName, args) !== null;
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] CLEARED');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        toolName: entry.toolName,
        age: Math.round((Date.now() - entry.timestamp) / 1000),
      })),
    };
  }

  /**
   * Remove expired entries
   */
  cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.ttlMs) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.cache.delete(key));

    if (expiredKeys.length > 0) {
      console.log(`[Cache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }
}

// Singleton instance
let cacheInstance: ToolCache | null = null;

/**
 * Get the global tool cache instance
 */
export function getToolCache(): ToolCache {
  if (!cacheInstance) {
    cacheInstance = new ToolCache(50, 30); // 50 entries, 30 min TTL

    // Run cleanup every 5 minutes
    setInterval(() => {
      cacheInstance?.cleanup();
    }, 5 * 60 * 1000);
  }

  return cacheInstance;
}

/**
 * Helper to wrap tool execution with caching
 */
export async function executeWithCache<T>(
  toolName: string,
  args: Record<string, any>,
  executor: () => Promise<T>
): Promise<T> {
  const cache = getToolCache();

  // Check cache first
  const cached = cache.get(toolName, args);
  if (cached !== null) {
    return cached;
  }

  // Execute and cache result
  console.log(`[Cache] MISS for ${toolName}, executing...`);
  const result = await executor();
  cache.set(toolName, args, result);

  return result;
}
