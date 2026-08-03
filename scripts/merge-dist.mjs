/**
 * 单 origin 合并部署 — 构建产物合并脚本
 *
 * 将四个应用的构建产物合并到一个输出目录 deploy/dist，
 * 使其部署到同一个 Cloudflare Pages 项目（jack-tan-studio）的子路径下：
 *   studio → /        (根)
 *   pose   → /pose/
 *   wave   → /wave/
 *   tan    → /tan/
 *
 * 同时把 jack-wave 的 Pages Functions 重组到 deploy/functions/wave/，
 * 使 API 路由映射为 /wave/api/*（Pages Functions 按文件系统路径路由）。
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
copy(resolve(root, 'apps/studio/dist'), resolve(dist, '.')); // studio 在根
copy(resolve(root, 'apps/jack-pose/dist'), resolve(dist, 'pose'));
copy(resolve(root, 'apps/jack-wave/dist'), resolve(dist, 'wave'));
copy(resolve(root, 'apps/jack-tan/dist'), resolve(dist, 'tan'));

// 3. 重组 wave Functions 到 /wave/api/* 路由
const waveFn = resolve(root, 'apps/jack-wave/functions');
copy(resolve(waveFn, 'api'), resolve(functions, 'wave/api'));
copy(resolve(waveFn, '_lib'), resolve(functions, 'wave/_lib'));

// 4. 生成统一的 _redirects（子应用 SPA 回退在前，兜底在后）
//    Pages 只对"不存在静态文件"的路径应用回退，已存在的静态资源正常直出。
const redirects = [
  '/pose/* /pose/index.html 200',
  '/wave/* /wave/index.html 200',
  '/tan/* /tan/index.html 200',
  '/* /index.html 200',
].join('\n') + '\n';
writeFileSync(resolve(dist, '_redirects'), redirects);

// 5. 生成统一的 _headers（根级安全头 + 各子路径缓存规则）
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

/pose/assets/*
  Cache-Control: public, max-age=31536000, immutable

/wave/assets/*
  Cache-Control: public, max-age=31536000, immutable

/tan/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.html
  Cache-Control: no-cache, must-revalidate

/pose/*.html
  Cache-Control: no-cache, must-revalidate

/wave/*.html
  Cache-Control: no-cache, must-revalidate

/tan/*.html
  Cache-Control: no-cache, must-revalidate

/wave/sw.js
  Cache-Control: no-cache, must-revalidate

/pose/sw.js
  Cache-Control: no-cache, must-revalidate

/wave/api/*
  Cache-Control: no-store
`;
writeFileSync(resolve(dist, '_headers'), headers);

console.log('[merge] 完成。部署命令: cd deploy && npx wrangler pages deploy dist --project-name jack-tan-studio');
