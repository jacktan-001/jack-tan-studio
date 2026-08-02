// ============================================================
// 数据管理接口 - 带结构校验和时序安全密码比较
// ============================================================

// 最大数据大小限制：5MB
const MAX_DATA_SIZE = 5 * 1024 * 1024;

/**
 * 使用恒定时间比较来验证密码，防止时序攻击
 * 先对两个密码分别进行 SHA-256 哈希（使长度一致，避免长度泄露），
 * 再逐字节异或比较，确保比较耗时与内容无关
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  // 并行计算两个哈希
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const arrA = new Uint8Array(hashA);
  const arrB = new Uint8Array(hashB);

  // 哈希长度理论上总是相同（32 字节），但安全起见仍做检查
  if (arrA.length !== arrB.length) return false;

  // 逐字节异或，累积差异（恒定时间比较）
  let result = 0;
  for (let i = 0; i < arrA.length; i++) {
    result |= arrA[i] ^ arrB[i];
  }
  return result === 0;
}

/**
 * 从请求中提取密码并进行时序安全验证
 */
async function verifyPassword(
  context: { request: Request; url: URL },
  env: Env,
): Promise<boolean> {
  const password =
    context.url.searchParams.get('password') ||
    context.request.headers.get('x-admin-password');
  if (!password) return false;
  return timingSafeEqual(password, env.ADMIN_PASSWORD);
}

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
  const url = new URL(context.request.url);

  // 时序安全密码验证
  const authorized = await verifyPassword({ request: context.request, url }, context.env);
  if (!authorized) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const kv = context.env.JACK_WAVE_KV;
    const raw = await kv.get('data:playlists');
    if (raw) {
      return Response.json({ source: 'kv', data: JSON.parse(raw) });
    }
    return Response.json({ source: 'seed', data: null });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

// ---- PUT: 保存更新后的歌单数据到 KV ----
export const onRequestPut: PagesFunction<Env> = async (context) => {
  // 时序安全密码验证
  const password = context.request.headers.get('x-admin-password');
  if (!password) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }
  const authorized = await timingSafeEqual(password, context.env.ADMIN_PASSWORD);
  if (!authorized) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

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
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

// ---- DELETE: 清除 KV 数据（重置为静态种子数据）----
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  // 时序安全密码验证
  const authorized = await verifyPassword({ request: context.request, url }, context.env);
  if (!authorized) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const kv = context.env.JACK_WAVE_KV;
    await kv.delete('data:playlists');
    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
