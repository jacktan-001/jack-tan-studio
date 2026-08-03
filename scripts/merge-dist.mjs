/**
 * 单 origin 合并部署 — 构建产物合并脚本
 *
 * 将四个应用的构建产物合并到一个输出目录 deploy/dist，
 * 使其部署到同一个 Cloudflare Pages 项目（jack-tan-studio）的子路径下：
 *   studio → /                 (根)
 *   pose   → /projects/pose/
 *   wave   → /projects/wave/
 *   tan    → /projects/tan/
 *
 * 同时把 jack-wave 的 Pages Functions 重组到 deploy/functions/projects/wave/，
 * 使 API 路由映射为 /projects/wave/api/*（Pages Functions 按文件系统路径路由）。
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
copy(resolve(root, 'apps/jack-pose/dist'), resolve(dist, 'projects/pose'));
copy(resolve(root, 'apps/jack-wave/dist'), resolve(dist, 'projects/wave'));
copy(resolve(root, 'apps/jack-tan/dist'), resolve(dist, 'projects/tan'));

// 3. 重组 wave Functions 到 /projects/wave/api/* 路由
const waveFn = resolve(root, 'apps/jack-wave/functions');
copy(resolve(waveFn, 'api'), resolve(functions, 'projects/wave/api'));
copy(resolve(waveFn, '_lib'), resolve(functions, 'projects/wave/_lib'));

// 4. 生成统一的 _redirects：
//    ① 旧 URL（/jack-xxx/ 和 /xxx/）301 永久重定向到新规范 URL，保留 SEO 和外链
//    ② 子应用 SPA 回退：动态路由指向对应 index.html
//    ③ 兜底：studio 的 SPA 回退
const redirects = [
  // 旧路径 301 到新规范
  '/jack-pose/* /projects/pose/:splat 301',
  '/jack-wave/* /projects/wave/:splat 301',
  '/jack-tan/* /projects/tan/:splat 301',
  '/pose/* /projects/pose/:splat 301',
  '/wave/* /projects/wave/:splat 301',
  '/tan/* /projects/tan/:splat 301',
  // SPA 回退（Pages 只对不存在静态文件的路径应用）
  '/projects/pose/* /projects/pose/index.html 200',
  '/projects/wave/* /projects/wave/index.html 200',
  '/projects/tan/* /projects/tan/index.html 200',
  '/* /index.html 200',
].join('\n') + '\n';
writeFileSync(resolve(dist, '_redirects'), redirects);

// 5. 生成 _routes.json：限制 Functions 触发范围，避免静态资源请求被计费
const routesJson = {
  version: 1,
  include: ['/projects/wave/api/*'],
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
const headers = `/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; connect-src 'self' https://itunes.apple.com https://audio-ssl.itunes.apple.com; frame-ancestors 'none'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
  X-XSS-Protection: 1; mode=block

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/projects/pose/assets/*
  Cache-Control: public, max-age=31536000, immutable

/projects/wave/assets/*
  Cache-Control: public, max-age=31536000, immutable

/projects/tan/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: no-cache, must-revalidate

/projects/pose/*.html
  Cache-Control: no-cache, must-revalidate

/projects/wave/*.html
  Cache-Control: no-cache, must-revalidate

/projects/tan/*.html
  Cache-Control: no-cache, must-revalidate

/projects/pose/sw.js
  Cache-Control: no-cache, must-revalidate

/projects/wave/sw.js
  Cache-Control: no-cache, must-revalidate

/projects/wave/api/*
  Cache-Control: no-store
`;
writeFileSync(resolve(dist, '_headers'), headers);

console.log('[merge] 完成。部署命令: cd deploy && npx wrangler pages deploy dist --project-name jack-tan-studio');
