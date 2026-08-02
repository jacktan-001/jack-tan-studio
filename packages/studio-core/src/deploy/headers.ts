/**
 * Layer 6: Deploy Config — 安全 HTTP 头
 * 统一安全头配置
 * 从 Jack Wave _headers 文件提取并泛化
 */

export interface SecurityHeader {
  name: string;
  value: string;
}

/** 默认安全头 */
export const securityHeaders: SecurityHeader[] = [
  { name: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { name: 'X-Content-Type-Options', value: 'nosniff' },
  { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { name: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    name: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    name: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "media-src 'self' https: blob:",
      "connect-src 'self' https://itunes.apple.com https://*.mzstatic.com",
      "manifest-src 'self'",
      "worker-src 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

/** 生成 _headers 文件内容（Cloudflare Pages 格式） */
export function generateHeadersFile(extraHeaders: SecurityHeader[] = []): string {
  const allHeaders = [...securityHeaders, ...extraHeaders];
  const lines: string[] = ['/*'];
  for (const h of allHeaders) {
    lines.push(`  ${h.name}: ${h.value}`);
  }
  return lines.join('\n');
}

/** API 路由安全头（更宽松的 CORS） */
export function generateApiHeaders(origin?: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'X-Content-Type-Options': 'nosniff',
    'Content-Type': 'application/json',
  };
}
