/**
 * 本地预览合并产物（仅测试用，非部署）
 *
 * 以 deploy/dist 为根启动静态服务器，对「无扩展名的客户端路由」回退到 studio 根
 * index.html，模拟 Pages Functions 在 studio 模式下的 SPA 回退行为，便于本地验证：
 *   - 外壳常驻，导航进入 jack-pose / jack-tan / jack-wave 时全局 <audio> 不卸载
 *     （音乐零间隙）；
 *   - 硬刷新 /projects/{id} 也回到 studio 外壳（而非独立子应用）。
 *
 * 注意：本服务不运行 Pages Functions，因此 jack-wave 的 api/* 接口（api/public-data
 * 等）在本地会 404 —— 不影响「播放连续性」这一核心验证；线上由 deploy/functions 承载。
 *
 * 用法: node scripts/preview-merged.mjs [port]    默认端口 4321
 *      浏览器打开 http://localhost:4321/ ，点导航进入各项目测试音乐连续性。
 */

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'deploy/dist');
const port = Number(process.argv[2] || 4321);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

if (!existsSync(dist)) {
  console.error(`❌ deploy/dist 不存在，请先运行: node scripts/merge-dist.mjs`);
  process.exit(1);
}

function send(res, status, body, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  let pathname = decodeURIComponent(url.pathname);

  // 规范化尾斜杠
  if (pathname.endsWith('/')) pathname += 'index.html';
  if (pathname === '') pathname = '/index.html';

  const filePath = join(dist, pathname);

  // 1. 真实静态资源
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    const ext = extname(filePath).toLowerCase();
    send(res, 200, readFileSync(filePath), MIME[ext] || 'application/octet-stream');
    return;
  }

  // 2. 接口类路径（api/*）本地无 Functions，直接 404（不打回 SPA，避免返回 HTML 误导 fetch）
  if (pathname.includes('/api/')) {
    send(res, 404, 'Not found (local preview has no Pages Functions)');
    return;
  }

  // 3. 无扩展名的客户端路由 → SPA 回退到 studio 根入口
  const lastSeg = pathname.split('/').pop();
  if (!lastSeg.includes('.')) {
    const indexHtml = join(dist, 'index.html');
    if (existsSync(indexHtml)) {
      send(res, 200, readFileSync(indexHtml), MIME['.html']);
      return;
    }
  }

  send(res, 404, 'Not found');
});

server.listen(port, () => {
  console.log(`\n🚀 本地预览已启动: http://localhost:${port}/`);
  console.log(`   根目录: ${dist}`);
  console.log(`   测试要点: 进入 jack-pose / jack-tan / jack-wave 并来回导航，确认底部播放器不中断；`);
  console.log(`   硬刷新 /projects/pose 等应回到 studio 外壳（而非独立子应用）。\n`);
});
