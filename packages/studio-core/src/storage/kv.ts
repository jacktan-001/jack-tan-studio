/**
 * Layer 3: Storage — Cloudflare KV 适配器
 * 统一前端与 Cloudflare KV 的交互接口
 * 从 Jack Wave 的 loadDynamicData 模式提取并泛化
 */

export interface KVAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  list(prefix?: string): Promise<string[]>;
}

/** 通过 Pages Functions API 读取 KV */
export class CloudflareKV implements KVAdapter {
  constructor(private basePath: string = '/api') {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const res = await fetch(`${this.basePath}/kv/${key}`);
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const res = await fetch(`${this.basePath}/kv/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.basePath}/kv/${key}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async list(prefix?: string): Promise<string[]> {
    try {
      const url = `${this.basePath}/kv${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.keys ?? [];
    } catch {
      return [];
    }
  }
}

/** 加载公共数据 — Jack Wave 的 /api/public-data 模式 */
export async function loadPublicData<T>(endpoint: string = '/api/public-data'): Promise<T | null> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 提交数据到 API — Jack Wave 的表单提交模式 */
export async function submitData<T>(
  endpoint: string,
  data: T,
  token?: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return {
      success: res.ok,
      message: result.message ?? (res.ok ? '成功' : '失败'),
    };
  } catch (err) {
    return { success: false, message: '网络错误' };
  }
}

/** KV 批量读取 — 合并静态数据与动态数据的模式 */
export function mergeStaticAndDynamic<S extends Record<string, unknown>>(
  staticData: S,
  dynamicData: Partial<S>,
): S {
  return { ...staticData, ...dynamicData };
}
