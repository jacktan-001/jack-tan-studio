/**
 * 子应用 SPA 回退 —— Cloudflare Pages Functions 通配路由（[[path]].js）
 *
 * 为什么不用 _redirects 的 `/projects/jack-x/* /projects/jack-x/ 200`？
 * Pages 官方语义：_redirects 规则「无条件执行，无论静态资源是否存在」
 * （"Redirects are always followed, regardless of whether or not an asset
 * matches the incoming request"），会把 avatar.jpg、manifest.json、
 * assets/*.js 等真实文件也重写成 HTML，导致子应用所有静态资源全部被吞。
 *
 * 因此改为 Function：先回源静态资源（env.ASSETS），仅当 404 时才回退到
 * 子应用的 index.html（SPA 客户端路由深链）。
 *
 * 本文件由 scripts/merge-dist.mjs 拷贝到 deploy/functions/projects/{app}/
 * 并替换 __APP_BASE__ 占位符，请勿直接编辑 deploy/ 下的产物。
 */

const APP_BASE = '__APP_BASE__'; // 例如 /projects/jack-wave

export const onRequest = async (context) => {
  const { request, env } = context;

  // 1. 优先返回真实静态资源（JS/CSS/图片/manifest 等）
  const asset = await env.ASSETS.fetch(request);
  if (asset.status !== 404) return asset;

  // 2. 静态资源不存在 → SPA 回退到子应用入口（目录形式命中其 index.html）
  const url = new URL(request.url);
  url.pathname = APP_BASE + '/';
  url.search = '';
  const fallback = await env.ASSETS.fetch(new Request(url.toString(), request));
  return new Response(fallback.body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
};
