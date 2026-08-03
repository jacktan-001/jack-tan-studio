// ============================================================
// CORS 共享工具模块
// 为所有 API 端点提供统一的 CORS 头和 OPTIONS 预检处理
// ============================================================

/**
 * CORS 允许的来源
 * 生产环境使用同源策略（null = 仅允许同源）
 * 如需跨域访问，可在环境变量中配置 ALLOWED_ORIGINS（逗号分隔）
 */
function getAllowedOrigin(request: Request, env?: Env): string | null {
  // 同源请求不需要 CORS 头
  const origin = request.headers.get('Origin');
  if (!origin) return null;

  // 如果配置了允许的来源列表，则进行匹配
  if (env?.ALLOWED_ORIGINS) {
    const allowed = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim());
    if (allowed.includes(origin) || allowed.includes('*')) {
      return origin;
    }
    return null;
  }

  // 默认：同源请求（Origin 与请求的 Host 一致时）
  // Cloudflare Pages 同域部署时，前端和 API 同源，无需跨域
  return null;
}

/**
 * 构建 CORS 响应头
 * 返回一个 HeadersInit 对象，可合并到任意 Response 中
 */
export function corsHeaders(request: Request, env?: Env): Record<string, string> {
  const origin = getAllowedOrigin(request, env);
  if (!origin) return {};

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

/**
 * 处理 OPTIONS 预检请求
 * 如果是预检请求则返回 204 + CORS 头，否则返回 null
 */
export function handlePreflight(request: Request, env?: Env): Response | null {
  if (request.method !== 'OPTIONS') return null;

  return new Response(null, {
    status: 204,
    headers: corsHeaders(request, env),
  });
}

/**
 * 为已有 Response 添加 CORS 头
 * 用于在非预检响应中附加 CORS 头
 */
export function withCors(response: Response, request: Request, env?: Env): Response {
  const headers = corsHeaders(request, env);
  if (Object.keys(headers).length === 0) return response;

  const newResponse = new Response(response.body, response);
  for (const [key, value] of Object.entries(headers)) {
    newResponse.headers.set(key, value);
  }
  return newResponse;
}
