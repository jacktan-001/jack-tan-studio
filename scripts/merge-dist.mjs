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

/**
 * 部署模式开关（回退用）。通过 CI 环境变量 SPA_MODE 传入，本地默认 studio。
 *   SPA_MODE=studio    （默认）单页外壳模式：
 *     /projects/{id} 由 studio 外壳的 catch-all Function 承载，回退到根 /index.html，
 *     从而硬刷新 / 直链也能进入单页，全局 <audio> 不卸载（音乐零间隙）。
 *     子应用独立产物仍保留在 /projects/jack-{id}/ 供旧链接 301 与回退开关使用。
 *   SPA_MODE=standalone        独立部署回退模式（旧行为）：
 *     /projects/{id} 经 _redirects 301 到独立产物 /projects/jack-{id}/，由子应用自身
 *     index.html 承载。单页化出问题时一键回退到独立部署。
 */
const SPA_MODE = process.env.SPA_MODE === 'standalone' ? 'standalone' : 'studio';

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

// 3.5 为每个已上线子应用生成 SPA 回退 catch-all Function
//
// 为什么不用 _redirects 的 `/projects/jack-x/* /projects/jack-x/ 200`？
// Pages 官方语义：_redirects 无条件优先于静态资源（"Redirects are always
// followed, regardless of whether or not an asset matches the incoming
// request"），会把子路径下的 avatar.jpg / manifest.json / assets/*.js 等
// 真实文件也重写成 HTML —— 这正是 2026-08-04 线上子应用封面/头像/JS 全灭的根因。
// 改为 Function 先回源 env.ASSETS，404 时才回退到子应用 index.html。
const spaFallbackTemplate = readFileSync(
  resolve(root, 'scripts/templates/spa-fallback.js'),
  'utf-8',
);
for (const p of liveProjects) {
  const standaloneDir = `projects/jack-${p.id}`;
  const clientDir = `projects/${p.id}`;
  // 单页模式：Function 挂在客户端路由 /projects/{id}/，回退到 studio 根入口；
  // 独立模式：Function 挂在 /projects/jack-{id}/，回退到子应用自身入口。
  const funcDir = SPA_MODE === 'standalone' ? standaloneDir : clientDir;
  const fallbackPath =
    SPA_MODE === 'standalone' ? `/${standaloneDir}/index.html` : '/index.html';
  const targetDir = resolve(functions, funcDir);
  mkdirSync(targetDir, { recursive: true });
  writeFileSync(
    resolve(targetDir, '[[path]].js'),
    spaFallbackTemplate
      .replaceAll('__APP_BASE__', `/${standaloneDir}`)
      .replaceAll('__FALLBACK_PATH__', fallbackPath),
  );
  console.log(
    `[merge] SPA 回退 Function -> /${funcDir}/[[path]].js (mode=${SPA_MODE}, fallback=${fallbackPath})`,
  );
}

// 4. 生成统一的 _redirects
//
// 规则顺序至关重要 —— Cloudflare Pages 自上而下匹配，命中即停：
//   ① studio 的项目介绍页 /projects/{id}/intro 必须排在旧路径 301 之前，
//      否则 /projects/wave/intro 会被 `/projects/wave/*` 301 劫持到子应用（历史 bug）。
//   ② 旧 URL 301 永久重定向到新规范 URL，保留 SEO 权重与已分享的外链。
//   ③ 未上线项目的 Coming Soon 页由 studio SPA 承载。
//   ④ 子应用 SPA 回退由 Pages Functions（[[path]].js）实现，严禁在 _redirects
//      里写 `/projects/jack-x/* ... 200` —— _redirects 无条件优先于静态资源，
//      会把子应用所有真实文件（头像/封面/JS bundle）吞成 HTML。
//   ⑤ 不设 `/* /index.html 200` 兜底 —— 未匹配路径交给 Pages 的 404.html，
//      返回真实 404 状态码，避免搜索引擎判定为软 404（无限重复内容）。
const redirects = [
  '# ① studio 项目介绍页（必须先于旧路径 301，否则会被劫持到子应用）',
  ...projects.map((p) => `/projects/${p.id}/intro / 200`),
  '',
  '# ② 旧路径 301 到新规范 URL',
  '/jack-pose/* /projects/jack-pose/:splat 301',
  '/jack-wave/* /projects/jack-wave/:splat 301',
  '/jack-tan/* /projects/jack-tan/:splat 301',
  '/pose/* /projects/jack-pose/:splat 301',
  '/wave/* /projects/jack-wave/:splat 301',
  '/tan/* /projects/jack-tan/:splat 301',
  ...(SPA_MODE === 'standalone'
    ? [
        '# 独立模式：/projects/{id}/ 301 到独立产物路径（旧行为）',
        ...liveProjects.map(
          (p) => `/projects/${p.id}/* /projects/jack-${p.id}/:splat 301`,
        ),
      ]
    : [
        '# 单页模式：/projects/jack-{id}/ 是独立产物路径（仅供回退开关与旧链接使用），',
        '# 其页面入口 301 到规范单页路由 /projects/{id}/，避免同一项目两个 URL 渲染出',
        '# 两套界面（独立版 vs 外壳嵌入版）。',
        '# 严禁在此用 /* 通配 —— 会把 /projects/jack-{id}/assets/* 与',
        '# /projects/jack-wave/api/* 一并 301 掉（2026-08-04 静态资源全灭事故根因）。',
        '# 反向规则 `/projects/{id}/* -> /projects/jack-{id}/:splat` 更是严禁出现：',
        '# 它会劫持单页规范路由，使硬刷新 /projects/pose/ 跳回独立版、播放中断。',
        ...liveProjects.flatMap((p) => [
          `/projects/jack-${p.id}/ /projects/${p.id}/ 301`,
          `/projects/jack-${p.id} /projects/${p.id}/ 301`,
        ]),
      ]),
  '',
  '# ③ 单页模式：/projects/{id} 由 studio 外壳 catch-all Function 承载（回退根入口），',
  '#    不再 301 到独立产物，确保硬刷新/直链也进入单页、播放不中断；',
  '#    独立模式（回退开关）：/projects/{id} 301 到独立产物路径（旧行为）。',
  ...(SPA_MODE === 'standalone'
    ? liveProjects.map((p) => `/projects/${p.id} ${p.url} 301`)
    : liveProjects.map((p) => `/projects/${p.id} /projects/${p.id}/ 301`)),
  '',
  '# ④ 未上线项目的 Coming Soon 页，由 studio SPA 渲染',
  ...upcomingProjects.map((p) => `/projects/${p.id} / 200`),
  '',
  '# ⑤ 子应用 SPA 回退由 deploy/functions/projects/jack-*/[[path]].js 实现',
  '#    （_redirects 无条件优先于静态资源，写 200 重写会吞掉子应用全部静态文件）',
  '',
  '# ⑥ 无兜底规则 —— 未匹配路径由 404.html 接管并返回 404 状态码',
].join('\n') + '\n';
writeFileSync(resolve(dist, '_redirects'), redirects);

// 5. 生成 _routes.json：限定 Functions 触发范围
//    注意：_routes.json 的通配符只在路径末尾可靠（官方示例均为 trailing `*`，
//    `/projects/*/*.js` 这类中段通配实测不生效），因此 exclude 只列 assets 目录。
//    子应用根级的少量静态文件（avatar.jpg / manifest.json / sw.js 等）会经过
//    catch-all Function 回源 ASSETS，行为正确，仅多一次 Function 调用
//    （免费额度 10 万次/天，对本站点足够）。
const routesJson = {
  version: 1,
  include: [
    // 单页模式：客户端路由 /projects/{id}/* 由 catch-all Function 承载（回退 studio 根入口）；
    // 独立模式：/projects/jack-{id}/* 由子应用 catch-all 承载（旧行为）。
    ...(SPA_MODE === 'standalone'
      ? liveProjects.map((p) => `/projects/jack-${p.id}/*`)
      : liveProjects.map((p) => `/projects/${p.id}/*`)),
    // jack-wave 的 API 始终挂在独立产物路径下，两种模式都需要。
    '/projects/jack-wave/api/*',
  ],
  exclude: [
    '/assets/*',
    '/projects/jack-pose/assets/*',
    '/projects/jack-wave/assets/*',
    '/projects/jack-tan/assets/*',
  ],
};
writeFileSync(resolve(dist, '_routes.json'), JSON.stringify(routesJson, null, 2));

// 6. 生成统一的 _headers（根级安全头 + 各子路径缓存规则）
//    全局 CSP 已含 'unsafe-inline'（index.html 内联 importmap 必需）。jack-pose 的覆盖规则
//    必须与全局 script-src 对齐，否则浏览器取交集后会拦截内联 importmap 导致白屏。
const headers = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.cn https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.cn https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://itunes.apple.com https://audio-ssl.itunes.apple.com https://cloudflareinsights.com; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/projects/jack-pose/*
  # 注意：script-src 必须保留 'unsafe-inline'，因为 index.html 内的 <script type="importmap">
  # 是内联脚本；缺 'unsafe-inline' 会被浏览器拦截 importmap 注册，导致 React 无法解析白屏。
  # 该规则会覆盖上方全局 /* 规则（_headers 后匹配者生效），故此处需与全局 script-src 对齐。
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.cn https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.cn https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://itunes.apple.com https://audio-ssl.itunes.apple.com https://cloudflareinsights.com; media-src 'self' blob: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

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
  ...liveProjects.map((p) => ({
    loc: SPA_MODE === 'standalone' ? p.url : `/projects/${p.id}`,
    priority: '0.9',
    changefreq: 'weekly',
  })),
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
