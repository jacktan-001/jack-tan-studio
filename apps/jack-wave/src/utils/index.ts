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
