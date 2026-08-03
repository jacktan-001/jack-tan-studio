/**
 * Layer 3: Storage — localStorage 抽象
 * 带 TTL 的 localStorage 封装
 * 从 Jack Wave 的 URL_CACHE 机制提取并泛化
 */

export interface StorageItem<T> {
  data: T;
  ts: number;
  ttl: number;
}

/** 安全读取 localStorage（带 JSON 解析） */
export function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** 安全写入 localStorage */
export function set<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** 安全删除 */
export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

/** 带 TTL 的读取 — 过期返回 fallback */
export function getWithTTL<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const item = JSON.parse(raw) as StorageItem<T>;
    if (Date.now() - item.ts > item.ttl) {
      localStorage.removeItem(key);
      return fallback;
    }
    return item.data;
  } catch {
    return fallback;
  }
}

/** 带 TTL 的写入 */
export function setWithTTL<T>(key: string, data: T, ttl: number): boolean {
  const item: StorageItem<T> = {
    data,
    ts: Date.now(),
    ttl,
  };
  return set(key, item);
}

/** 批量获取 */
export function getMany<T>(keys: string[], fallback: T): Record<string, T> {
  const result: Record<string, T> = {};
  for (const key of keys) {
    result[key] = get(key, fallback);
  }
  return result;
}

/** 批量设置 */
export function setMany(entries: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(entries)) {
    set(key, value);
  }
}

/** 清除匹配前缀的所有 key */
export function clearByPrefix(prefix: string): number {
  let count = 0;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    keys.forEach((k) => {
      localStorage.removeItem(k);
      count++;
    });
  } catch {
    // noop
  }
  return count;
}

/** 清除所有过期的 TTL 项 */
export function clearExpired(): number {
  let count = 0;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const item = JSON.parse(raw) as StorageItem<unknown>;
        if (item.ts && item.ttl && Date.now() - item.ts > item.ttl) {
          keysToRemove.push(key);
        }
      } catch {
        // not a TTL item, skip
      }
    }
    keysToRemove.forEach((k) => {
      localStorage.removeItem(k);
      count++;
    });
  } catch {
    // noop
  }
  return count;
}

/** 预定义 storage key 常量 */
export const storageKeys = {
  theme: 'jack-tan-theme',
  urlCache: 'jackwave_url_cache',
  pwaPrompt: 'jack-tan-pwa-prompt-dismissed',
  adminToken: 'jack-tan-admin-token',
  projectConfig: 'jack-tan-project-config',
  pendingProject: 'jack-tan-pending-project',
} as const;

/** 默认 TTL 常量 */
export const TTL = {
  MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  HOUR: 60 * 60 * 1000,
  SIX_HOURS: 6 * 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;
