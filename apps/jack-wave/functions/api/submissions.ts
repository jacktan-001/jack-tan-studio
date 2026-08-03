// ============================================================
// 提交列表管理接口 - 并行查询 + 分页 + 状态过滤
// ============================================================

// 默认分页参数
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
// 单页最大条数限制
const MAX_LIMIT = 100;

/**
 * 使用恒定时间比较来验证密码，防止时序攻击
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const arrA = new Uint8Array(hashA);
  const arrB = new Uint8Array(hashB);
  if (arrA.length !== arrB.length) return false;
  let result = 0;
  for (let i = 0; i < arrA.length; i++) {
    result |= arrA[i] ^ arrB[i];
  }
  return result === 0;
}

/**
 * 安全解析整数参数，失败时返回默认值
 */
function parseIntParam(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
}

// ---- GET: 获取提交列表（支持分页和状态过滤）----
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const password =
    url.searchParams.get('password') || context.request.headers.get('x-admin-password');

  if (!password || !(await timingSafeEqual(password, context.env.ADMIN_PASSWORD))) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const kv = context.env.JACK_WAVE_KV;

    // 解析分页参数
    const page = Math.max(1, parseIntParam(url.searchParams.get('page'), DEFAULT_PAGE));
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseIntParam(url.searchParams.get('limit'), DEFAULT_LIMIT)),
    );
    // 状态过滤参数：pending / approved / rejected
    const statusFilter = url.searchParams.get('status');

    // 使用 KV list() API 获取所有提交记录的 key
    // KV list 每次最多返回 1000 个 key，通过 cursor 翻页获取全部
    const allKeys: string[] = [];
    let cursor: string | undefined;
    do {
      const result = await kv.list({ prefix: 'submission:', cursor });
      // 排除 submission:list 这个索引 key，只保留实际提交记录
      allKeys.push(...result.keys.filter((k) => k.name !== 'submission:list').map((k) => k.name));
      cursor = result.list_complete ? undefined : result.cursor;
    } while (cursor);

    if (allKeys.length === 0) {
      return Response.json({
        submissions: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      });
    }

    // 并行获取所有提交记录（用 Promise.all 替代串行循环，解决 N+1 问题）
    const results = await Promise.all(
      allKeys.map((key) =>
        kv
          .get(key)
          .then((raw) => (raw ? JSON.parse(raw) : null))
          .catch(() => null),
      ),
    );

    // 过滤掉 null（可能已被删除或解析失败）
    let submissions = results.filter((s) => s !== null);

    // 状态过滤
    if (statusFilter) {
      submissions = submissions.filter((s) => s.status === statusFilter);
    }

    // 按创建时间倒序排序（最新的在前）
    submissions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    // 分页截取
    const total = submissions.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedSubmissions = submissions.slice(startIndex, startIndex + limit);

    return Response.json({
      submissions: paginatedSubmissions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};

// ---- DELETE: 删除指定提交记录 ----
export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const password =
    url.searchParams.get('password') || context.request.headers.get('x-admin-password');
  const id = url.searchParams.get('id');

  if (!password || !(await timingSafeEqual(password, context.env.ADMIN_PASSWORD))) {
    return Response.json({ error: '未授权' }, { status: 401 });
  }
  if (!id) return Response.json({ error: '缺少 id 参数' }, { status: 400 });

  try {
    const kv = context.env.JACK_WAVE_KV;
    await kv.delete(`submission:${id}`);

    // 无需维护 submission:list 索引 key
    // 列表读取通过 kv.list({ prefix: 'submission:' }) 枚举，避免竞态条件

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 500 });
  }
};
