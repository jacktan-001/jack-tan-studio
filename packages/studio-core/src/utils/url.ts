/**
 * Layer 2: Utility — URL
 * URL 操作工具
 * 从 Jack Wave app.js 的 fixAppleMusicUrl 提取并泛化
 */

/** 修复 Apple Music 链接 — 移除地区代码，自动重定向到用户本地商店 */
export function fixAppleMusicUrl(url: string): string {
  if (!url) return '';
  return url.replace('music.apple.com/us/', 'music.apple.com/');
}

/** URL 查询参数解析 */
export function parseQueryParams(url?: string): Record<string, string> {
  const search = url ? new URL(url).search : (typeof window !== 'undefined' ? window.location.search : '');
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/** 构建查询字符串 */
export function buildQuery(params: Record<string, string | number | boolean>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    search.set(key, String(value));
  });
  const str = search.toString();
  return str ? `?${str}` : '';
}

/** 拼接 URL（自动处理斜杠） */
export function joinUrl(...parts: string[]): string {
  return parts
    .map((p, i) => {
      if (i === 0) return p.replace(/\/+$/, '');
      return p.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
}

/** 判断是否为外部链接 */
export function isExternal(url: string): boolean {
  try {
    const parsed = new URL(url);
    const currentHost = typeof window !== 'undefined' ? window.location.host : '';
    return parsed.host !== currentHost;
  } catch {
    return false;
  }
}

/** 判断是否为同源 URL */
export function isSameOrigin(url: string): boolean {
  try {
    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : undefined);
    if (typeof window !== 'undefined') {
      return parsed.origin === window.location.origin;
    }
    return false;
  } catch {
    return false;
  }
}

/** 确保链接以指定协议开头 */
export function ensureProtocol(url: string, protocol: 'https' | 'http' = 'https'): string {
  if (!url) return '';
  if (url.startsWith('//')) return `${protocol}:${url}`;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `${protocol}://${url}`;
  }
  return url;
}
