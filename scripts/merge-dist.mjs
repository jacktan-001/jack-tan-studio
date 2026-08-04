/**
 * 单 origin 合并部署 — 构建产物合并脚本
 *
 * 将四个应用的构建产物合并到一个输出目录 deploy/dist，
 * 使其部署到同一个 Cloudflare Pages 项目（jacktan-studio）的子路径下：
 *   studio → /                 (根)
 *   pose   → /projects/jack-pose/
 *   wave   → /projects/jack-wave/
 *   tan    → /projects/jack-tan/
 *
 * 同时把 jack-wave 的 Pages Functions 重组到 deploy/functions/projects/jack-wave/，
 * 使 API 路由映射为 /projects/jack-wave/api/*（Pages Functions 按文件系统路径路由）。
 *
 * 用法: node scripts/merge-dist.mjs
 */

import { cpSync, rmSync, mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deploy = resolve(root, 'deploy');
const dist = resolve(deploy, 'dist');
const functions = resolve(deploy, 'functions');

/**
 * 站点规范 origin —— robots.txt / sitemap.xml 的绝对 URL 基准。
 * 绑定自定义域名后，只需改这一处（同时同步各 app index.html 的 canonical）。
 */
const SITE_ORIGIN = 'https://jacktan-studio.pages.dev';

function copy(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[merge] 跳过不存在的目录: ${src}`);
    return;
  }
  cpSync(src, dest, { recursive: true });
  console.log(`[merge] ${src.replace(root, '')} -> ${dest.replace(root, '')}`);
}

/**
 * 从 apps/studio/src/data/projects.ts 解析项目清单。
 * 与 scripts/verify-routes.mjs 使用同一套解析逻辑，保证单一数据源。
 */
function parseProjects() {
  const source = readFileSync(resolve(root, 'apps/studio/src/data/projects.ts'), 'utf-8');
  const list = [];
  const objectRegex = /\{[\s\S]*?\n\s*\}/g;
  let match;
  while ((match = objectRegex.exec(source)) !== null) {
    const block = match[0];
    const id = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1];
    const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1];
    const url = block.match(/url:\s*['"]([^'"]+)['"]/)?.[1];
    if (id && status && url) list.push({ id, status, url });
  }
  if (list.length === 0) {
    throw new Error('[merge] 未能从 projects.ts 解析出任何项目，请检查数据格式');
  }
  return list;
}

const projects = parseProjects();
const liveProjects = projects.filter((p) => p.status === 'live');
const upcomingProjects = projects.filter((p) => p.status !== 'live');

// 1. 清理并重建输出目录
rmSync(deploy, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
mkdirSync(functions, { recursive: true });

// 2. 合并静态产物
// studio 在根，子应用统一放到 /projects/{id}/ 下
copy(resolve(root, 'apps/studio/dist'), resolve(dist, '.'));
copy(resolve(root, 'apps/jack-pose/dist'), resolve(dist, 'projects/jack-pose'));
copy(resolve(root, 'apps/jack-wave/dist'), resolve(dist, 'projects/jack-wave'));
copy(resolve(root, 'apps/jack-tan/dist'), resolve(dist, 'projects/jack-tan'));

// 3. 重组 wave Functions 到 /projects/jack-wave/api/* 路由
const waveFn = resolve(root, 'apps/jack-wave/functions');
copy(resolve(waveFn, 'api'), resolve(functions, 'projects/jack-wave/api'));
copy(resolve(waveFn, '_lib'), resolve(functions, 'projects/jack-wave/_lib'));

// 4. 生成统一的 _redirects
//
// 规则顺序至关重要 —— Cloudflare Pages 自上而下匹配，命中即停：
//   ① studio 的项目介绍页 /projects/{id}/intro 必须排在旧路径 301 之前，
//      否则 /projects/wave/intro 会被 `/projects/wave/*` 301 劫持到子应用（历史 bug）。
//   ② 旧 URL 301 永久重定向到新规范 URL，保留 SEO 权重与已分享的外链。
//   ③ 未上线项目的 Coming Soon 页由 studio SPA 承载。
//   ④ 子应用自身的 SPA 回退。
//   ⑤ 不设 `/* /index.html 200` 兜底 —— 未匹配路径交给 Pages 的 404.html，
//      返回真实 404 状态码，避免搜索引擎判定为软 404（无限重复内容）。
const redirects = [
  '# ① studio 项目介绍页（必须先于旧路径 301，否则会被劫持到子应用）',
  ...projects.map((p) => `/projects/${p.id}/intro /index.html 200`),
  '',
  '# ② 旧路径 301 到新规范 URL',
  '/jack-pose/* /projects/jack-pose/:splat 301',
  '/jack-wave/* /projects/jack-wave/:splat 301',
  '/jack-tan/* /projects/jack-tan/:splat 301',
  '/pose/* /projects/jack-pose/:splat 301',
  '/wave/* /projects/jack-wave/:splat 301',
  '/tan/* /projects/jack-tan/:splat 301',
  '# 此前线上版本曾部署在 /projects/{id}/，保留 301 避免已收藏/分享的旧链接失效',
  '/projects/pose/* /projects/jack-pose/:splat 301',
  '/projects/wave/* /projects/jack-wave/:splat 301',
  '/projects/tan/* /projects/jack-tan/:splat 301',
  '',
  '# ③ 已上线项目的短链直接 301 到子应用（比进 SPA 再客户端跳转快一个往返）',
  ...liveProjects.map((p) => `/projects/${p.id} ${p.url} 301`),
  '',
  '# ④ 未上线项目的 Coming Soon 页，由 studio SPA 渲染',
  ...upcomingProjects.map((p) => `/projects/${p.id} /index.html 200`),
  '',
  '# ⑤ 子应用 SPA 回退（Pages 仅对不存在静态文件的路径应用）',
  '/projects/jack-pose/* /projects/jack-pose/index.html 200',
  '/projects/jack-wave/* /projects/jack-wave/index.html 200',
  '/projects/jack-tan/* /projects/jack-tan/index.html 200',
  '',
  '# ⑥ 无兜底规则 —— 未匹配路径由 404.html 接管并返回 404 状态码',
].join('\n') + '\n';
writeFileSync(resolve(dist, '_redirects'), redirects);

// 5. 生成 _routes.json：限制 Functions 触发范围，避免静态资源请求被计费
const routesJson = {
  version: 1,
  include: ['/projects/jack-wave/api/*'],
  exclude: [
    '/*.css', '/*.js', '/*.map', '/*.svg', '/*.png', '/*.jpg', '/*.jpeg', '/*.webp',
    '/assets/*',
    '/projects/*/assets/*',
    '/projects/*/*.css',
    '/projects/*/*.js',
  ],
};
writeFileSync(resolve(dist, '_routes.json'), JSON.stringify(routesJson, null, 2));

// 6. 生成统一的 _headers（根级安全头 + 各子路径缓存规则）
//    全局使用宽松 CSP（jack-wave 需要 unsafe-inline），jack-pose 单独覆盖为严格 CSP
const headers = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://itunes.apple.com https://audio-ssl.itunes.apple.com https://cloudflareinsights.com; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/projects/jack-pose/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://cloudflareinsights.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/projects/jack-pose/assets/*
  Cache-Control: public, max-age=31536000, immutable

/projects/jack-wave/assets/*
  Cache-Control: public, max-age=31536000, immutable

/projects/jack-tan/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: no-cache, must-revalidate

/projects/jack-pose/*.html
  Cache-Control: no-cache, must-revalidate

/projects/jack-wave/*.html
  Cache-Control: no-cache, must-revalidate

/projects/jack-tan/*.html
  Cache-Control: no-cache, must-revalidate

/projects/jack-pose/sw.js
  Cache-Control: no-cache, must-revalidate

/projects/jack-wave/sw.js
  Cache-Control: no-cache, must-revalidate

/projects/jack-wave/api/*
  Cache-Control: no-store
`;
writeFileSync(resolve(dist, '_headers'), headers);

// 7. 生成根级 robots.txt
//    子应用各自 public/ 下的 robots.txt 在合并部署后是不可达的（会被根级覆盖或落到子路径），
//    且历史版本里的 Sitemap 指向已删除的独立 Pages 域名，属于死链，已一并移除。
const robots = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# 管理后台与接口无需索引
Disallow: /projects/jack-wave/api/
Disallow: /projects/jack-wave/admin

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
writeFileSync(resolve(dist, 'robots.txt'), robots);

// 8. 生成根级 sitemap.xml（数据源同为 projects.ts，新增项目自动纳入）
const today = new Date().toISOString().slice(0, 10);
const sitemapUrls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  // 已上线子应用
  ...liveProjects.map((p) => ({ loc: p.url, priority: '0.9', changefreq: 'weekly' })),
  // 项目介绍页（仅收录已上线项目，Coming Soon 页无实质内容不提交）
  ...liveProjects.map((p) => ({ loc: `/projects/${p.id}/intro`, priority: '0.7', changefreq: 'monthly' })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (u) => `  <url>
    <loc>${SITE_ORIGIN}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
writeFileSync(resolve(dist, 'sitemap.xml'), sitemap);

// 9. 校验 404.html 已随 studio 产物落到根目录（Pages 依赖它返回真实 404）
if (!existsSync(resolve(dist, '404.html'))) {
  throw new Error('[merge] 缺少 deploy/dist/404.html —— 请确认 apps/studio/public/404.html 存在');
}

// 10. (可选) 注入 Cloudflare Web Analytics beacon
//     通过 CI 环境变量 CLOUDFLARE_WEB_ANALYTICS_TOKEN 提供 token；未设置时跳过，
//     本地构建不受影响。也可在 Cloudflare Pages 控制台「Settings → Analytics」一键开启
//     原生 Web Analytics（Cloudflare 自动注入），二者二选一，避免重复注入。
const waToken = process.env.CLOUDFLARE_WEB_ANALYTICS_TOKEN;
if (waToken) {
  const beacon = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${waToken}"}'></script>`;
  const injectInto = (file) => {
    if (!existsSync(file)) return;
    let html = readFileSync(file, 'utf-8');
    if (html.includes('data-cf-beacon')) return; // 已注入则跳过
    if (html.includes('</head>')) {
      html = html.replace('</head>', `${beacon}\n</head>`);
    } else if (html.includes('</body>')) {
      html = html.replace('</body>', `${beacon}\n</body>`);
    } else {
      html += beacon;
    }
    writeFileSync(file, html);
  };
  const indexFiles = [
    resolve(dist, 'index.html'),
    ...['jack-pose', 'jack-wave', 'jack-tan'].map((id) => resolve(dist, 'projects', id, 'index.html')),
  ];
  indexFiles.forEach(injectInto);
  console.log(`[merge] 已注入 Cloudflare Web Analytics beacon（${indexFiles.length} 个入口）`);
} else {
  console.log('[merge] 未设置 CLOUDFLARE_WEB_ANALYTICS_TOKEN，跳过 Web Analytics 注入（可在 Pages 控制台开启原生 Web Analytics）');
}

console.log(`[merge] robots.txt / sitemap.xml 已生成（${sitemapUrls.length} 条 URL，origin=${SITE_ORIGIN}）`);
console.log('[merge] 完成。部署命令: cd deploy && npx wrangler pages deploy dist --project-name jacktan-studio');
