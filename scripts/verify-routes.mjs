/**
 * 路由映射一致性检查
 *
 * 验证「projects 数据表 → merge-dist.mjs 拷贝目录 → _redirects SPA 回退 → vite base 路径」
 * 四者一致，防止 Navbar 注册了项目但 deploy 产物缺失导致 404。
 *
 * 用法: node scripts/verify-routes.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function read(file) {
  return readFileSync(resolve(root, file), 'utf-8');
}

/** 从 projects.ts 中提取 live 项目元数据 */
function parseProjects() {
  const source = read('apps/studio/src/data/projects.ts');
  const projects = [];

  // 匹配每个项目对象字面量（最外层花括号），允许嵌套数组
  const objectRegex = /\{[\s\S]*?\n\s*\}/g;
  let match;
  while ((match = objectRegex.exec(source)) !== null) {
    const block = match[0];
    const id = block.match(/id:\s*['"]([^'"]+)['"]/)?.[1];
    const status = block.match(/status:\s*['"]([^'"]+)['"]/)?.[1];
    const url = block.match(/url:\s*['"]([^'"]+)['"]/)?.[1];
    if (id && status && url) {
      projects.push({ id, status, url });
    }
  }

  return projects;
}

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

const projects = parseProjects();
const liveProjects = projects.filter((p) => p.status === 'live');
const mergeScript = read('scripts/merge-dist.mjs');
const redirects = read('deploy/dist/_redirects');

console.log(`\n检测到 ${projects.length} 个项目，其中 ${liveProjects.length} 个已上线：${liveProjects.map((p) => p.id).join(', ')}\n`);

for (const project of liveProjects) {
  const expectedDir = `projects/jack-${project.id}`;
  const expectedBase = `/projects/jack-${project.id}/`;

  // 1. merge-dist.mjs 必须拷贝该应用
  const copyPattern = `copy(resolve(root, 'apps/jack-${project.id}/dist'), resolve(dist, '${expectedDir}'))`;
  if (!mergeScript.includes(copyPattern)) {
    fail(`jack-${project.id}: merge-dist.mjs 缺少拷贝规则\n   期望包含: ${copyPattern}`);
  } else {
    ok(`jack-${project.id}: merge-dist.mjs 拷贝规则正确`);
  }

  // 2. SPA 回退必须由 Pages Function（[[path]].js）实现，且 _redirects 不得包含
  //    `/projects/jack-x/* ... 200` 重写 —— Pages 的 _redirects 无条件优先于静态资源，
  //    该写法会把子应用全部静态文件（头像/封面/JS bundle）吞成 HTML（2026-08-04 事故根因）。
  const swallowRule = `/${expectedDir}/* /${expectedDir}/ 200`;
  if (redirects.includes(swallowRule)) {
    fail(`jack-${project.id}: _redirects 含有会吞掉静态资源的 200 重写\n   禁止出现: ${swallowRule}\n   SPA 回退请使用 deploy/functions/${expectedDir}/[[path]].js`);
  } else {
    ok(`jack-${project.id}: _redirects 无吞静态资源的 200 重写`);
  }
  const fallbackFn = resolve(root, `deploy/functions/${expectedDir}/[[path]].js`);
  if (!existsSync(fallbackFn)) {
    fail(`jack-${project.id}: SPA 回退 Function 不存在\n   期望: deploy/functions/${expectedDir}/[[path]].js`);
  } else {
    ok(`jack-${project.id}: SPA 回退 Function 存在`);
  }

  // 3. vite.config.ts 的 base 必须匹配
  const viteConfigPath = `apps/jack-${project.id}/vite.config.ts`;
  if (existsSync(resolve(root, viteConfigPath))) {
    const viteConfig = read(viteConfigPath);
    const baseMatch = viteConfig.match(/base:\s*['"]([^'"]+)['"]/);
    if (!baseMatch) {
      fail(`jack-${project.id}: ${viteConfigPath} 未配置 base`);
    } else if (baseMatch[1] !== expectedBase) {
      fail(`jack-${project.id}: ${viteConfigPath} base 不匹配\n   期望: ${expectedBase}\n   实际: ${baseMatch[1]}`);
    } else {
      ok(`jack-${project.id}: ${viteConfigPath} base 正确 (${expectedBase})`);
    }
  }

  // 4. deploy/dist 产物目录必须存在
  const distIndex = resolve(root, `deploy/dist/${expectedDir}/index.html`);
  if (!existsSync(distIndex)) {
    fail(`jack-${project.id}: 部署产物不存在\n   期望: deploy/dist/${expectedDir}/index.html`);
  } else {
    ok(`jack-${project.id}: 部署产物存在`);
  }
}

// 5. App.tsx 必须动态注册所有项目路由
const appTsx = read('apps/studio/src/App.tsx');
const hasProjectRoutes =
  appTsx.includes('projects.map') &&
  appTsx.includes('/projects/${p.id}') &&
  appTsx.includes('/projects/${p.id}/intro');
if (!hasProjectRoutes) {
  fail('App.tsx 未使用 projects.map 动态注册 /projects/:id 与 /projects/:id/intro 路由');
} else {
  ok('App.tsx 使用 projects.map 动态注册了所有项目路由');
}

if (process.exitCode === 1) {
  console.error('\n路由一致性检查未通过，请先修复上述问题。');
} else {
  console.log('\n🎉 路由映射一致性检查通过');
}
