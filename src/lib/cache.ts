/**
 * Ultra-Fast In-Memory RAM Cache Engine
 * Bypasses network round-trips to the Singapore database for read-heavy operations.
 * Delivers sub-millisecond (0.01ms - 1ms) response times.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Global in-memory cache store
const memoryStore = new Map<string, CacheEntry<any>>();

/**
 * Fetch from in-memory RAM if valid; otherwise run the database fetcher,
 * cache the result, and return it.
 * 
 * @param key Unique cache key
 * @param ttlSeconds Time-to-live in seconds
 * @param fetcher Async function to fetch fresh data from database
 */
export async function getCachedData<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const existing = memoryStore.get(key);

  if (existing && existing.expiresAt > now) {
    return existing.data as T;
  }

  // Cache miss or expired: fetch fresh data from database
  const freshData = await fetcher();
  memoryStore.set(key, {
    data: freshData,
    expiresAt: now + ttlSeconds * 1000,
  });

  return freshData;
}

/**
 * Invalidate cached entries.
 * If prefix is provided, only keys starting with that prefix are deleted.
 * If no prefix is provided, the entire cache is cleared.
 */
export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    memoryStore.clear();
    return;
  }
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
}
