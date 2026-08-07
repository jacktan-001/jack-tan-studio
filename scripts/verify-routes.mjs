/**
 * 路由映射一致性检查
 *
 * 验证「projects 数据表 → merge-dist.mjs 拷贝目录 → SPA 回退 Function → _redirects
 * → _routes.json → App.tsx 路由 → vite base 路径」六者一致，防止 Navbar 注册了
 * 项目但 deploy 产物缺失 / 回退 Function 错位导致 404 或硬刷新丢外壳（音乐中断）。
 *
 * 模式感知：读取 CI 环境变量 SPA_MODE（默认 studio），校验回退 Function 的位置与
 * FALLBACK_PATH 是否与当前模式一致：
 *   studio    （默认）单页外壳模式：/projects/{id} 由 studio 外壳 catch-all Function
 *                        承载，回退到根 /index.html（硬刷新音乐不中断）。
 *   standalone          独立部署回退模式：/projects/{id} 301 到 /projects/jack-{id}/，
 *                        回退 Function 回退到子应用自身 index.html。
 *
 * 用法: node scripts/verify-routes.mjs            # 校验默认 studio 模式产物
 *       SPA_MODE=standalone node scripts/verify-routes.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SPA_MODE = process.env.SPA_MODE === 'standalone' ? 'standalone' : 'studio';

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
const routesJson = JSON.parse(read('deploy/dist/_routes.json'));

console.log(
  `\n[mode=${SPA_MODE}] 检测到 ${projects.length} 个项目，其中 ${liveProjects.length} 个已上线：${liveProjects
    .map((p) => p.id)
    .join(', ')}\n`,
);

for (const project of liveProjects) {
  const standaloneDir = `projects/jack-${project.id}`;
  const clientDir = `projects/${project.id}`;
  // 与 merge-dist.mjs 保持同一套模式推导
  const funcDir = SPA_MODE === 'standalone' ? standaloneDir : clientDir;
  const expectedFallback =
    SPA_MODE === 'standalone' ? `/${standaloneDir}/index.html` : '/index.html';

  // 1. merge-dist.mjs 必须拷贝该应用（独立产物始终保留在 /projects/jack-{id}/）
  const copyPattern = `copy(resolve(root, 'apps/jack-${project.id}/dist'), resolve(dist, '${standaloneDir}'))`;
  if (!mergeScript.includes(copyPattern)) {
    fail(`jack-${project.id}: merge-dist.mjs 缺少拷贝规则\n   期望包含: ${copyPattern}`);
  } else {
    ok(`jack-${project.id}: merge-dist.mjs 拷贝规则正确`);
  }

  // 2. SPA 回退必须由 Pages Function（[[path]].js）实现，且 _redirects 不得包含
  //    `/projects/jack-x/* ... 200` 重写 —— Pages 的 _redirects 无条件优先于静态资源，
  //    该写法会把子应用全部静态文件（头像/封面/JS bundle）吞成 HTML（2026-08-04 事故根因）。
  const swallowRule = `/${standaloneDir}/* /${standaloneDir}/ 200`;
  if (redirects.includes(swallowRule)) {
    fail(`jack-${project.id}: _redirects 含有会吞掉静态资源的 200 重写\n   禁止出现: ${swallowRule}\n   SPA 回退请使用 deploy/functions/${funcDir}/[[path]].js`);
  } else {
    ok(`jack-${project.id}: _redirects 无吞静态资源的 200 重写`);
  }

  // 2a. 单页模式专属：规范路由 /projects/{id}/ 不得被 301 劫持回独立产物。
  //     `/projects/{id}/* /projects/jack-{id}/:splat 301` 是为独立模式写的旧规则，
  //     在单页模式下会让硬刷新 /projects/pose/ 跳回独立版 —— 外壳卸载、音乐中断，
  //     且同一项目出现「独立版 / 外壳嵌入版」两套界面（本地与线上表现不一致的根因）。
  if (SPA_MODE === 'studio') {
    const hijackRule = `/${clientDir}/* /${standaloneDir}/:splat 301`;
    if (redirects.includes(hijackRule)) {
      fail(
        `jack-${project.id}: _redirects 含劫持单页规范路由的反向 301\n   禁止出现: ${hijackRule}\n   该规则仅适用于 SPA_MODE=standalone`,
      );
    } else {
      ok(`jack-${project.id}: 单页规范路由未被反向 301 劫持`);
    }

    // 旧独立产物页面入口必须 301 到规范单页路由，避免同项目双 URL 渲染两套界面
    const legacyEntryRule = `/${standaloneDir}/ /${clientDir}/ 301`;
    if (!redirects.includes(legacyEntryRule)) {
      fail(
        `jack-${project.id}: 缺少旧独立路径到规范单页路由的 301\n   期望包含: ${legacyEntryRule}`,
      );
    } else {
      ok(`jack-${project.id}: 旧独立路径已 301 到规范单页路由`);
    }

    // 但严禁用 /* 通配 —— 会连 assets/* 与 /projects/jack-wave/api/* 一起 301 掉
    const wildcardLegacyRule = `/${standaloneDir}/* /${clientDir}/:splat 301`;
    if (redirects.includes(wildcardLegacyRule)) {
      fail(
        `jack-${project.id}: 旧路径 301 使用了 /* 通配，会吞掉静态资源与 API\n   禁止出现: ${wildcardLegacyRule}\n   仅允许对页面入口做精确路径 301`,
      );
    } else {
      ok(`jack-${project.id}: 旧路径 301 未使用 /* 通配（静态资源与 API 安全）`);
    }
  }

  // 2b. 回退 Function 必须存在于当前模式对应的路径，且 FALLBACK_PATH 与模式一致
  const fallbackFn = resolve(root, `deploy/functions/${funcDir}/[[path]].js`);
  if (!existsSync(fallbackFn)) {
    fail(
      `jack-${project.id}: SPA 回退 Function 不存在 (mode=${SPA_MODE})\n   期望: deploy/functions/${funcDir}/[[path]].js`,
    );
  } else {
    const fnSrc = read(`deploy/functions/${funcDir}/[[path]].js`);
    if (!fnSrc.includes(`FALLBACK_PATH = '${expectedFallback}'`)) {
      fail(
        `jack-${project.id}: 回退 Function 的 FALLBACK_PATH 与模式不符\n   期望: FALLBACK_PATH = '${expectedFallback}' (mode=${SPA_MODE})\n   实际文件: deploy/functions/${funcDir}/[[path]].js`,
      );
    } else {
      ok(`jack-${project.id}: 回退 Function 存在且 FALLBACK_PATH 正确 (mode=${SPA_MODE})`);
    }
  }

  // 3. vite.config.ts 的 base 必须匹配独立产物路径
  const viteConfigPath = `apps/jack-${project.id}/vite.config.ts`;
  if (existsSync(resolve(root, viteConfigPath))) {
    const viteConfig = read(viteConfigPath);
    const baseMatch = viteConfig.match(/base:\s*['"]([^'"]+)['"]/);
    const expectedBase = `/${standaloneDir}/`;
    if (!baseMatch) {
      fail(`jack-${project.id}: ${viteConfigPath} 未配置 base`);
    } else if (baseMatch[1] !== expectedBase) {
      fail(
        `jack-${project.id}: ${viteConfigPath} base 不匹配\n   期望: ${expectedBase}\n   实际: ${baseMatch[1]}`,
      );
    } else {
      ok(`jack-${project.id}: ${viteConfigPath} base 正确 (${expectedBase})`);
    }
  }

  // 4. deploy/dist 独立产物目录必须存在（供旧链接 301 与回退开关使用）
  const distIndex = resolve(root, `deploy/dist/${standaloneDir}/index.html`);
  if (!existsSync(distIndex)) {
    fail(`jack-${project.id}: 独立部署产物不存在\n   期望: deploy/dist/${standaloneDir}/index.html`);
  } else {
    ok(`jack-${project.id}: 独立部署产物存在`);
  }
}

// 5. App.tsx 必须动态注册所有项目路由
//    - 项目挂载路由由 projects.map 生成 /projects/${p.id}
//    - 项目介绍页为单一动态段 /projects/:id/intro（保证 useParams().id 可取）
const appTsx = read('apps/studio/src/App.tsx');
const hasProjectRoutes =
  appTsx.includes('projects.map') &&
  appTsx.includes('/projects/${p.id}') &&
  appTsx.includes('/projects/:id/intro');
if (!hasProjectRoutes) {
  fail('App.tsx 未正确注册路由：需 projects.map 生成 /projects/:id，且存在 /projects/:id/intro 动态段');
} else {
  ok('App.tsx 路由注册正确（projects.map 生成 /projects/:id + /projects/:id/intro 动态段）');
}

// 6. _routes.json 的 include 必须与当前模式一致
const expectedIncludes =
  SPA_MODE === 'standalone'
    ? liveProjects.map((p) => `/projects/jack-${p.id}/*`)
    : liveProjects.map((p) => `/projects/${p.id}/*`);
// jack-wave 的 API 两种模式都挂在独立产物路径下
expectedIncludes.push('/projects/jack-wave/api/*');
for (const inc of expectedIncludes) {
  if (!routesJson.include?.includes(inc)) {
    fail(`_routes.json 缺少 include 项 (mode=${SPA_MODE}): ${inc}`);
  } else {
    ok(`_routes.json include 命中: ${inc}`);
  }
}

if (process.exitCode === 1) {
  console.error('\n路由一致性检查未通过，请先修复上述问题。');
} else {
  console.log('\n🎉 路由映射一致性检查通过');
}
