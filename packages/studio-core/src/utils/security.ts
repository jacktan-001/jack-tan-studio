/**
 * Layer 2: Utility — Security
 * XSS 防护与 URL 安全工具
 * 从 Jack Wave app.js 提取并泛化
 */

/** HTML 转义 — 防止 XSS 注入 */
export function esc(s: unknown): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** URL 安全验证 — 仅允许 http/https 协议 */
export function safeUrl(url: unknown): string {
  if (!url || typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return url;
  } catch {
    // not a valid URL
  }
  return '';
}

/** 清理 HTML 字符串 — 移除潜在危险标签 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/** 验证并清理用户输入文本 */
export function sanitizeText(input: unknown, maxLength: number = 1000): string {
  return esc(input).slice(0, maxLength);
}

/** 检查是否为有效的邮箱地址 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** 检查是否为有效的 URL */
export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
