/**
 * 共享 vendor 构建 —— 跨应用复用同一份 React / ReactDOM / ReactRouter
 *
 * 背景：之前每个 app 各自把 react/react-dom 打进自己的 react-vendor chunk，
 * 文件名带 hash 互不相同，跨应用访问时浏览器无法复用缓存，造成 ~197KB 重复下载。
 *
 * 方案：用 esbuild 把这几份库打成少量 ESM，放到 studio 的 public/vendor/
 * （经 merge-dist 落到部署根 /vendor/），所有 app 通过 <script type="importmap">
 * 把裸模块名映射到 /vendor/*.js，从而全局共享「同一份 React 实例」。
 *
 * 关键设计（避免踩坑）：
 * - esbuild 一旦把 'react' 标为 external，会自动把其所有子路径（react/jsx-runtime、
 *   react/jsx-dev-runtime）也判为 external。因此 react.js 必须「自包含」地同时 bundle
 *   react 与 react/jsx-runtime；并把 importmap 的 "react/jsx-runtime" 也指向 react.js。
 * - 同理 react-dom.js 自包含 bundle react-dom 与 react-dom/client，importmap 的
 *   "react-dom/client" 也指向 react-dom.js。
 * - 只有 react-dom / react-router 才 external 'react'，使其内部 `import 'react'`
 *   经 importmap 回指到唯一的 react.js，保证全局唯一 React 实例（否则 "Invalid hook call"）。
 *
 * 用法: node scripts/build-vendor.mjs  （已由根 build 脚本在 turbo build 前自动调用）
 */

import { build } from 'esbuild';
import { mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'apps/studio/public/vendor');
// 先清空旧产物（含历史遗留的 stub 文件），避免 vendor 目录里混入未被 importmap 引用的过期文件。
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// react / react-dom / react-router-dom 由 apps/studio 依赖（pnpm 隔离 node_modules，
// 它们并不在仓库根 node_modules）。esbuild 从 apps/studio 解析裸模块名，确保能找到全部库。
const resolveDir = resolve(root, 'apps/studio');
const define = { 'process.env.NODE_ENV': '"production"' };

/**
 * @type {Array<{file: string, imports: Array<{spec: string, hasDefault: boolean}>, external: string[]}>}
 * imports 里的每个模块会被 `export *` + 必要时 `export {default}` 重新导出并打包进目标文件。
 *
 * 注意 default 导出必须显式声明（hasDefault）：
 *  - react / react-dom 有 default 导出（React 对象 / ReactDOM 对象）；
 *  - react/jsx-runtime、react-dom/client、react-router-dom 都是「纯具名导出」，
 *    没有 default —— 强行 `export { default }` 会直接报错（No matching export）。
 */
const targets = [
  {
    file: 'react.js',
    imports: [
      { spec: 'react', hasDefault: true },
      { spec: 'react/jsx-runtime', hasDefault: false },
    ],
    external: [],
  },
  {
    file: 'react-dom.js',
    imports: [
      { spec: 'react-dom', hasDefault: true },
      { spec: 'react-dom/client', hasDefault: false },
    ],
    external: ['react'],
  },
  {
    file: 'react-router.js',
    imports: [
      { spec: 'react-router-dom', hasDefault: false },
    ],
    external: ['react', 'react-dom'],
  },
];

for (const t of targets) {
  const body = t.imports.flatMap(({ spec, hasDefault }) => {
    const lines = [`export * from '${spec}';`];
    if (hasDefault) lines.push(`export { default } from '${spec}';`);
    return lines;
  });

  await build({
    stdin: { contents: body.join('\n'), resolveDir, loader: 'js' },
    bundle: true,
    format: 'esm',
    minify: true,
    target: 'es2020',
    external: t.external,
    define,
    outfile: resolve(outDir, t.file),
    logLevel: 'info',
  });
  console.log(`[vendor] built ${t.file}`);
}

console.log(`[vendor] 完成 -> ${outDir}`);
