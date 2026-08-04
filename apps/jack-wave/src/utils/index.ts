/**
 * Jack Wave — 工具函数
 * 从原 app.js 的安全工具提取，XSS 防护由 React 内建转义处理
 */

import { safeUrl as coreSafeUrl } from '@jack-tan/studio-core';

/** URL 安全验证 — 仅允许 http/https 协议（重新导出 studio-core） */
export const safeUrl = coreSafeUrl;

/** 兼容 data:image/ 的 URL 验证（用于截图预览等） */
export function safeImgSrc(src: unknown): string {
  if (!src || typeof src !== 'string') return '';
  if (src.startsWith('data:image/')) return src;
  return safeUrl(src);
}

/** Apple 图床域名（封面/插画的唯一外部来源） */
const APPLE_IMG_HOST = /^https:\/\/[a-z0-9-]*\.(mzstatic\.com|itunes\.apple\.com|apple\.com)(\/|$)/i;

/**
 * 封面图片地址 — Apple 图床（mzstatic 等）在国内网络不可达，
 * 统一改走同源图片代理 /api/img（Cloudflare 边缘回源 + 缓存）。
 * 非 Apple 域名的 http(s) 地址原样返回；非法地址返回空串。
 */
export function artworkSrc(src: unknown): string {
  const url = safeUrl(src);
  if (!url) return '';
  if (APPLE_IMG_HOST.test(url)) {
    return `${import.meta.env.BASE_URL}api/img?u=${encodeURIComponent(url)}`;
  }
  return url;
}
