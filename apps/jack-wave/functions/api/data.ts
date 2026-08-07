// ============================================================
// 数据管理接口 - 带结构校验和时序安全密码比较
// ============================================================

import { authenticateAdmin } from '../_lib/adminAuth';
import { handlePreflight, withCors } from '../_lib/cors';

// OPTIONS 预检处理
export const onRequestOptions: PagesFunction<Env> = (context) => {
  return handlePreflight(context.request, context.env);
};

// 最大数据大小限制：5MB
const MAX_DATA_SIZE = 5 * 1024 * 1024;

/**
 * 校验数据结构合法性
 * 确保 body 包含必需的顶层字段，且每个歌单对象具有必需属性
 */
function validateDataStructure(body: any): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: '数据必须是一个对象' };
  }

  // 检查必需的顶层字段（必须是数组）
  if (!Array.isArray(body.moodPlaylists)) {
    return { valid: false, error: 'moodPlaylists 必须是数组' };
  }
  if (!Array.isArray(body.monthlyShares)) {
    return { valid: false, error: 'monthlyShares 必须是数组' };
  }
  if (!Array.isArray(body.allTags)) {
    return { valid: false, error: 'allTags 必须是数组' };
  }

  // 检查每个 playlist 对象必需的字段
  for (const playlist of body.moodPlaylists) {
    if (!playlist || typeof playlist !== 'object') {
      return { valid: false, error: 'moodPlaylists 中的每一项必须是对象' };
    }
    if (!playlist.id) {
      return { valid: false, error: '每个歌单必须有 id 字段' };
    }
    if (!playlist.title) {
      return { valid: false, error: '每个歌单必须有 title 字段' };
    }
    if (!playlist.songList) {
      return { valid: false, error: '每个歌单必须有 songList 字段' };
    }
  }

  return { valid: true };
}

// ---- GET: 从 KV 读取当前歌单数据（或返回 null 表示使用静态种子数据）----
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const response = await handleGet(context);
  return withCors(response, context.request, context.env);
};

async function handleGet(context: PagesFunctionContext<Env>): Promise<Response> {
  // 统一鉴权：时序安全比较 + IP 限流（仅接受 x-admin-password 请求头）
  const auth = await authenticateAdmin(context.request, context.env);
  if (!auth.authorized) return auth.response;

  try {
    const kv = context.env.JACK_WAVE_KV;
    const raw = await kv.get('data:playlists');
    if (raw) {
      return Response.json({ source: 'kv', data: JSON.parse(raw) });
    }
    return Response.json({ source: 'seed', data: null });
  } catch (e) {
    console.error('[data:GET] KV 读取失败:', e);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// ---- PUT: 保存更新后的歌单数据到 KV ----
export const onRequestPut: PagesFunction<Env> = async (context) => {
  const response = await handlePut(context);
  return withCors(response, context.request, context.env);
};

async function handlePut(context: PagesFunctionContext<Env>): Promise<Response> {
  // 统一鉴权：时序安全比较 + IP 限流（仅接受 x-admin-password 请求头）
  const auth = await authenticateAdmin(context.request, context.env);
  if (!auth.authorized) return auth.response;

  try {
    const kv = context.env.JACK_WAVE_KV;
    const body = await context.request.json();

    // ---- 数据结构校验 ----
    const validation = validateDataStructure(body);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    // ---- 总数据大小限制（JSON 序列化后 ≤ 5MB）----
    const serialized = JSON.stringify(body);
    if (serialized.length > MAX_DATA_SIZE) {
      return Response.json(
        { error: `数据大小超过限制（最大 ${MAX_DATA_SIZE / 1024 / 1024}MB）` },
        { status: 413 },
      );
    }

    await kv.put('data:playlists', serialized);
    return Response.json({ success: true });
  } catch (e) {
    console.error('[data:PUT] KV 写入失败:', e);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// ---- DELETE: 清除 KV 数据（重置为静态种子数据）----
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const response = await handleDelete(context);
  return withCors(response, context.request, context.env);
};

async function handleDelete(context: PagesFunctionContext<Env>): Promise<Response> {
  // 统一鉴权：时序安全比较 + IP 限流（仅接受 x-admin-password 请求头）
  const auth = await authenticateAdmin(context.request, context.env);
  if (!auth.authorized) return auth.response;

  try {
    const kv = context.env.JACK_WAVE_KV;
    await kv.delete('data:playlists');
    return Response.json({ success: true });
  } catch (e) {
    console.error('[data:DELETE] KV 删除失败:', e);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
