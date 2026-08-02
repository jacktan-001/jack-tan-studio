/**
 * Layer 6: Deploy Config — 重定向规则
 * Cloudflare Pages _redirects 文件生成
 */

export interface RedirectRule {
  from: string;
  to: string;
  status?: 301 | 302 | 200;
}

/** 默认 SPA 重定向规则 */
export const spaRedirect: RedirectRule = {
  from: '/*',
  to: '/index.html',
  status: 200,
};

/** 项目级重定向规则 */
export const projectRedirects: Record<string, RedirectRule[]> = {
  studio: [
    // Studio 作为入口，旧路径重定向
    { from: '/home', to: '/', status: 301 },
    { from: '/about', to: '/', status: 301 },
    // SPA fallback
    spaRedirect,
  ],
  wave: [
    // Jack Wave 旧路径
    { from: '/music', to: '/', status: 301 },
    { from: '/journal', to: '/', status: 301 },
    { from: '/admin', to: '/admin.html', status: 301 },
    // SPA fallback
    spaRedirect,
  ],
  pose: [
    // Jack Pose 旧路径
    { from: '/editor', to: '/', status: 301 },
    { from: '/export', to: '/', status: 301 },
    // SPA fallback
    spaRedirect,
  ],
  tan: [
    // Jack Tan 旧路径
    { from: '/portfolio', to: '/', status: 301 },
    { from: '/resume', to: '/', status: 301 },
    // SPA fallback
    spaRedirect,
  ],
};

/** 生成 _redirects 文件内容 */
export function generateRedirectsFile(projectId: string, extraRules: RedirectRule[] = []): string {
  const rules = [...(projectRedirects[projectId] ?? [spaRedirect]), ...extraRules];
  return rules
    .map((r) => `${r.from}\t${r.to}\t${r.status ?? 301}`)
    .join('\n');
}
