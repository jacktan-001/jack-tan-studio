// ============================================================
// 公开数据接口 - 带 ETag 支持和改进的错误处理
// 前端加载时调用此接口，KV 有数据则返回，否则回退到静态 __DATA__
// ============================================================

import { handlePreflight, withCors } from '../_lib/cors';

// OPTIONS 预检处理
export const onRequestOptions: PagesFunction<Env> = (context) => {
  return handlePreflight(context.request, context.env);
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const response = await handleGet(context);
  return withCors(response, context.request, context.env);
};

async function handleGet(context: PagesFunctionContext<Env>): Promise<Response> {
  try {
    const kv = context.env.JACK_WAVE_KV;
    const raw = await kv.get('data:playlists');

    if (raw) {
      // 基于内容生成 ETag（SHA-256 哈希），用于条件请求
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
      const etag =
        '"' +
        Array.from(new Uint8Array(hashBuffer))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('') +
        '"';

      // 检查客户端的 If-None-Match 头，如果 ETag 匹配则返回 304
      const ifNoneMatch = context.request.headers.get('If-None-Match');
      if (ifNoneMatch === etag) {
        return new Response(null, {
          status: 304,
          headers: {
            ETag: etag,
            'Cache-Control': 'public, max-age=60',
          },
        });
      }

      return new Response(raw, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
          ETag: etag,
        },
      });
    }

    // KV 中暂无数据，返回空标记供前端回退
    return Response.json(
      { cached: false },
      {
        headers: { 'Cache-Control': 'public, max-age=60' },
      },
    );
  } catch (e: any) {
    // KV 读取失败时返回 502（网关错误），而非 200
    // 让前端明确知道后端不可用，而非误以为数据为空
    return Response.json(
      { error: '数据读取失败', message: e.message },
      {
        status: 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
