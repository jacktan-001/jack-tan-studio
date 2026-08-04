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
 * ⚠️ 历史致命坑（曾导致线上全站白屏）：用 `export * from 'react'` 做 wrapper。React / ReactDOM 是
 * CommonJS 包，esbuild 的 `export *` 只会透传「ESM 具名导出」，而 CJS 的
 * `module.exports.useMemo` 这类属性**不会被提升为具名导出**，结果产物只剩 `export { default }`。
 * 应用 chunk 按 importmap 以具名方式 `import { useMemo } from 'react'`、
 * `import { jsxs } from 'react/jsx-runtime'`，运行时找不到具名导出 → 整站 React 挂载失败。
 *
 * ✅ 修复：构建期在 Node 里 `require()` 解析出各 CJS 包的真实导出键名，生成
 *   `import __v from 'pkg'; export const useMemo = __v.useMemo; ...` 形式的 wrapper，
 *   既保留 default，又显式创建全部具名导出。每个 target 仅由一个 hasDefault 的 spec
 *   提供 default 导出，避免多个 default 冲突。
 *
 * 用法: node scripts/build-vendor.mjs  （已由根 build 脚本在 turbo build 前自动调用）
 */

import { build } from 'esbuild';
import { mkdirSync, rmSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'apps/studio/public/vendor');
// 先清空旧产物（含历史遗留的 stub 文件），避免 vendor 目录里混入未被 importmap 引用的过期文件。
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// react / react-dom / react-router-dom 由 apps/studio 依赖（pnpm 隔离 node_modules，
// 它们并不在仓库根 node_modules）。esbuild 与下面的 introspect 都从 apps/studio 解析裸模块名。
const resolveDir = resolve(root, 'apps/studio');
const requireFromStudio = createRequire(resolve(resolveDir, 'package.json'));
const define = { 'process.env.NODE_ENV': '"production"' };

const VALID_IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * react-dom 是 CJS 包，其内部 `require('react')` 被 esbuild 判定为非静态 require，
 * 会生成 `Dynamic require of "react" is not supported` 的 __require 垫片并在运行时抛错，
 * 导致 React 挂载失败（白屏）。
 *
 * esbuild 的 __require 垫片写法为 `typeof require < 'u' ? require : ...`，即「只要作用域内
 * 存在 require 就优先使用它」。因此这里用 banner 在 react-dom.js 顶部 `import` 共享的
 * react（经 importmap 回指唯一的 /vendor/react.js，保证全局唯一 React 实例），并以 `require`
 * 之名暴露给 shim —— 既消除动态 require 报错，又维持 react / react-dom 共用同一份 React
 * 实例（否则会 "Invalid hook call"）。
 */
const REACT_DOM_REQUIRE_BANNER = [
  "import * as __vendor_react_ns from 'react';",
  "const require = (id) => {",
  "  if (id === 'react') return __vendor_react_ns;",
  "  throw new Error('Dynamic require of \"' + id + '\" is not supported');",
  "};",
].join("\n");

/**
 * 在 Node 构建期解析某个包的真实导出键名。
 * - 若为 CommonJS：返回 Object.keys(module.exports) 中合法标识符集合
 *   （排除 default / __esModule，它们是 CJS 互操作产物而非真实 API）。
 * - 若无法以 CJS 解析（例如纯 ESM 包）：返回 null，调用方改用 `export * from` 透传。
 * @param {string} spec 裸模块名（如 'react'、'react/jsx-runtime'）
 * @returns {string[] | null}
 */
function cjsExportKeys(spec) {
  try {
    const mod = requireFromStudio(spec);
    return Object.keys(mod).filter(
      (k) => k !== 'default' && k !== '__esModule' && VALID_IDENT.test(k),
    );
  } catch {
    return null;
  }
}

/**
 * 为一组 specifier 生成 ESM wrapper 源码。
 * - CJS 包（format: 'cjs'）：构建期在 Node 里 require() 解析出真实导出键名，
 *   import 默认导入后逐项显式 re-export 属性（保证具名导出存在）。
 * - ESM 包（format: 'esm'）：直接用 `export * from`，由 esbuild 透传其具名导出。
 * 每个 target 仅由 hasDefault=true 的 spec 提供一个 default 导出，避免冲突。
 *
 * ⚠️ 为什么不能统一用 require 判断：Node 的 require 对 react-router-dom v7 这类包会解析到
 * 其 CJS 构建，而 esbuild 在浏览器 target 下解析到 .mjs（ESM，无 default 导出）。两者不一致，
 * 因此必须显式声明 format，不能靠运行时探测。
 * @param {Array<{spec: string, format: 'cjs'|'esm', hasDefault: boolean}>} specs
 * @returns {string}
 */
function generateWrapper(specs) {
  const seen = new Set();
  const lines = [];
  for (const { spec, format, hasDefault } of specs) {
    if (format === 'esm') {
      // ESM 包：具名透传即可（esbuild 会把 `export *` 展开为具名导出）。
      lines.push(`export * from '${spec}';`);
      continue;
    }
    const ident = `__v_${spec.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const keys = cjsExportKeys(spec);
    lines.push(`import ${ident} from '${spec}';`);
    for (const k of keys || []) {
      if (seen.has(k)) continue; // 多个 spec 导出的同名项（如 Fragment）只声明一次
      seen.add(k);
      lines.push(`export const ${k} = ${ident}.${k};`);
    }
    // default 导出透传（CJS 互操作：default === module.exports）。每个 target 仅一次。
    if (hasDefault) lines.push(`export { default } from '${spec}';`);
  }
  return lines.join('\n');
}

const targets = [
  {
    file: 'react.js',
    specs: [
      { spec: 'react', format: 'cjs', hasDefault: true },
      { spec: 'react/jsx-runtime', format: 'cjs', hasDefault: false },
    ],
    external: [],
  },
  {
    file: 'react-dom.js',
    // ⚠️ default 导出必须来自 react-dom/client：jack-pose / jack-tan 使用
    // `import ReactDOM from 'react-dom/client'`（默认导入）后调用 ReactDOM.createRoot。
    // 若 default 来自 react-dom 主包，则默认导入为 undefined → "createRoot is not a function"。
    // react-dom 主包的具名导出（flushSync 等）仍由下方第一个 spec 透传，互不影响。
    specs: [
      { spec: 'react-dom', format: 'cjs', hasDefault: false },
      { spec: 'react-dom/client', format: 'cjs', hasDefault: true },
    ],
    external: ['react'],
    banner: REACT_DOM_REQUIRE_BANNER,
  },
  {
    file: 'react-router.js',
    specs: [{ spec: 'react-router-dom', format: 'esm', hasDefault: false }],
    external: ['react', 'react-dom'],
  },
];

for (const t of targets) {
  const contents = generateWrapper(t.specs);
  await build({
    stdin: { contents, resolveDir, loader: 'js' },
    bundle: true,
    format: 'esm',
    minify: true,
    target: 'es2020',
    external: t.external,
    banner: t.banner ? { js: t.banner } : undefined,
    define,
    outfile: resolve(outDir, t.file),
    logLevel: 'info',
  });
  console.log(`[vendor] built ${t.file} (${t.specs.map((s) => s.spec).join(' + ')})`);
}

// 自检：确认产物确实导出了关键具名导出，避免「又能构建、线上又白屏」的回归。
const check = (file, names) => {
  const code = readFileSync(resolve(outDir, file), 'utf-8');
  const missing = names.filter(
    (n) => !new RegExp(`\\bexport\\s+(?:const\\s+)?${n}\\b|export\\{[^}]*\\b${n}\\b`).test(code),
  );
  if (missing.length) {
    throw new Error(`[vendor] ${file} 缺少关键具名导出: ${missing.join(', ')}`);
  }
};
check('react.js', ['useState', 'useMemo', 'useLayoutEffect', 'Fragment', 'jsxs']);
check('react-dom.js', ['createRoot']);
check('react-router.js', ['Link', 'useNavigate']);
console.log('[vendor] 具名导出自检通过');

console.log(`[vendor] 完成 -> ${outDir}`);
