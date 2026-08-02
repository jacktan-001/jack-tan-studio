/**
 * Layer 3: Storage — 内存缓存
 * 带 TTL 与 LRU 淘汰策略的内存缓存
 */

interface CacheEntry<T> {
  data: T;
  ts: number;
  ttl: number;
  hits: number;
}

export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    entry.hits++;
    return entry.data;
  }

  set(key: string, data: T, ttl: number = 60 * 1000): void {
    // LRU 淘汰：超过最大容量时移除最久未使用的
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    this.cache.set(key, { data, ts: Date.now(), ttl, hits: 0 });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /** 清除所有过期项 */
  prune(): number {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.ts > entry.ttl) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTs = Infinity;
    let oldestHits = Infinity;
    for (const [key, entry] of this.cache) {
      if (entry.ts < oldestTs || (entry.ts === oldestTs && entry.hits < oldestHits)) {
        oldestTs = entry.ts;
        oldestHits = entry.hits;
        oldestKey = key;
      }
    }
    if (oldestKey) this.cache.delete(oldestKey);
  }
}

/** 全局单例缓存实例 */
export const globalCache = new MemoryCache(200);
