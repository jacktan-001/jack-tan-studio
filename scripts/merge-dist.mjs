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

import { cpSync, rmSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deploy = resolve(root, 'deploy');
const dist = resolve(deploy, 'dist');
const functions = resolve(deploy, 'functions');

function copy(src, dest) {
  if (!existsSync(src)) {
    console.warn(`[merge] 跳过不存在的目录: ${src}`);
    return;
  }
  cpSync(src, dest, { recursive: true });
  console.log(`[merge] ${src.replace(root, '')} -> ${dest.replace(root, '')}`);
}

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

// 4. 生成统一的 _redirects：
//    ① 旧 URL（/jack-xxx/ 和 /xxx/）301 永久重定向到新规范 URL，保留 SEO 和外链
//    ② 子应用 SPA 回退：动态路由指向对应 index.html
//    ③ 兜底：studio 的 SPA 回退
const redirects = [
  // 旧路径 301 到新规范
  '/jack-pose/* /projects/jack-pose/:splat 301',
  '/jack-wave/* /projects/jack-wave/:splat 301',
  '/jack-tan/* /projects/jack-tan/:splat 301',
  '/pose/* /projects/jack-pose/:splat 301',
  '/wave/* /projects/jack-wave/:splat 301',
  '/tan/* /projects/jack-tan/:splat 301',
  // 此前线上版本曾部署在 /projects/{id}/，保留 301 避免已收藏/分享的旧链接失效
  '/projects/pose/* /projects/jack-pose/:splat 301',
  '/projects/wave/* /projects/jack-wave/:splat 301',
  '/projects/tan/* /projects/jack-tan/:splat 301',
  // SPA 回退（Pages 只对不存在静态文件的路径应用）
  '/projects/jack-pose/* /projects/jack-pose/index.html 200',
  '/projects/jack-wave/* /projects/jack-wave/index.html 200',
  '/projects/jack-tan/* /projects/jack-tan/index.html 200',
  '/* /index.html 200',
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
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://itunes.apple.com https://audio-ssl.itunes.apple.com; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin

/projects/jack-pose/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'

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

console.log('[merge] 完成。部署命令: cd deploy && npx wrangler pages deploy dist --project-name jacktan-studio');
