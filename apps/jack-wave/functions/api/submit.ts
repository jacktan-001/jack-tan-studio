// ============================================================
// 提交接口 - 带限流和输入校验
// ============================================================

// 允许的提交类型白名单
const ALLOWED_TYPES = ['link', 'manual', 'screenshot'] as const;

// 字段长度限制配置
const LIMITS = {
  playlistName: 100,
  authorName: 50,
  description: 500,
  songList: 2000,
  linkUrl: 2048,
  tagCount: 5,
  tagLength: 20,
} as const;

// 速率限制：每个 IP 每小时最多提交次数
const RATE_LIMIT_MAX = 5;
// 速率限制窗口期（秒），1 小时
const RATE_LIMIT_WINDOW = 3600;

/**
 * 获取客户端真实 IP 地址
 * Cloudflare 会通过 CF-Connecting-IP 头注入客户端 IP
 */
function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

/**
 * 检查并更新速率限制计数
 * 使用 KV 存储每个 IP 在当前时间窗口内的提交次数
 * 返回是否允许提交及剩余次数
 */
async function checkRateLimit(
  kv: KVNamespace,
  ip: string,
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `ratelimit:${ip}`;
  const now = Date.now();

  try {
    const raw = await kv.get(key);
    if (raw) {
      const data = JSON.parse(raw) as { count: number; windowStart: number };
      const elapsed = (now - data.windowStart) / 1000;

      if (elapsed < RATE_LIMIT_WINDOW) {
        // 当前仍在窗口期内
        if (data.count >= RATE_LIMIT_MAX) {
          return { allowed: false, remaining: 0 };
        }
        // 增加计数，保留原始窗口起始时间，更新 TTL
        const newCount = data.count + 1;
        const remainingTtl = Math.ceil(RATE_LIMIT_WINDOW - elapsed);
        await kv.put(
          key,
          JSON.stringify({ count: newCount, windowStart: data.windowStart }),
          { expirationTtl: remainingTtl },
        );
        return { allowed: true, remaining: RATE_LIMIT_MAX - newCount };
      }
    }

    // 新窗口或首次提交，初始化计数
    await kv.put(
      key,
      JSON.stringify({ count: 1, windowStart: now }),
      { expirationTtl: RATE_LIMIT_WINDOW },
    );
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  } catch {
    // KV 读取/写入失败时不阻断请求（容错处理）
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
}

/**
 * 校验 URL 协议白名单（只允许 http/https）
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    // 优先使用独立的限流 KV（如已配置），否则回退到主 KV
    const rateLimitKv = context.env.SUBMISSION_RATE_LIMIT || context.env.JACK_WAVE_KV;
    const kv = context.env.JACK_WAVE_KV;

    // ---- 1. 基于 IP 的速率限制 ----
    const ip = getClientIP(context.request);
    const rateLimit = await checkRateLimit(rateLimitKv, ip);
    if (!rateLimit.allowed) {
      return Response.json(
        { error: '提交过于频繁，请稍后再试' },
        {
          status: 429,
          headers: { 'Retry-After': String(RATE_LIMIT_WINDOW) },
        },
      );
    }

    // ---- 2. 解析请求体 ----
    const body = await context.request.json();
    const { type, linkUrl, songList, playlistName, authorName, description, tags } = body;

    // ---- 3. 必填字段校验 ----
    if (!playlistName || !authorName) {
      return Response.json({ error: '歌单名称和名字为必填项' }, { status: 400 });
    }

    // ---- 4. type 白名单校验 ----
    const submissionType = type || 'link';
    if (!ALLOWED_TYPES.includes(submissionType as (typeof ALLOWED_TYPES)[number])) {
      return Response.json(
        { error: `无效的提交类型，只允许: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    // ---- 5. 字符串字段长度校验 ----
    const strPlaylistName = String(playlistName);
    const strAuthorName = String(authorName);
    const strDescription = description ? String(description) : '';
    const strSongList = songList ? String(songList) : '';
    const strLinkUrl = linkUrl ? String(linkUrl) : '';

    if (strPlaylistName.length > LIMITS.playlistName) {
      return Response.json(
        { error: `歌单名称不能超过 ${LIMITS.playlistName} 个字符` },
        { status: 400 },
      );
    }
    if (strAuthorName.length > LIMITS.authorName) {
      return Response.json(
        { error: `名字不能超过 ${LIMITS.authorName} 个字符` },
        { status: 400 },
      );
    }
    if (strDescription.length > LIMITS.description) {
      return Response.json(
        { error: `描述不能超过 ${LIMITS.description} 个字符` },
        { status: 400 },
      );
    }
    if (strSongList.length > LIMITS.songList) {
      return Response.json(
        { error: `歌单内容不能超过 ${LIMITS.songList} 个字符` },
        { status: 400 },
      );
    }
    if (strLinkUrl.length > LIMITS.linkUrl) {
      return Response.json(
        { error: `链接不能超过 ${LIMITS.linkUrl} 个字符` },
        { status: 400 },
      );
    }

    // ---- 6. URL 协议白名单校验（linkUrl 非空时）----
    if (strLinkUrl && !isValidUrl(strLinkUrl)) {
      return Response.json(
        { error: '链接格式无效，只支持 http/https 协议' },
        { status: 400 },
      );
    }

    // ---- 7. tags 数组校验（最多 5 个，每个 ≤ 20 字符）----
    const processedTags: string[] = [];
    if (Array.isArray(tags)) {
      if (tags.length > LIMITS.tagCount) {
        return Response.json(
          { error: `标签数量不能超过 ${LIMITS.tagCount} 个` },
          { status: 400 },
        );
      }
      for (const tag of tags) {
        const strTag = String(tag);
        if (strTag.length > LIMITS.tagLength) {
          return Response.json(
            { error: `每个标签不能超过 ${LIMITS.tagLength} 个字符` },
            { status: 400 },
          );
        }
        processedTags.push(strTag);
      }
    }

    // ---- 8. 构建提交记录 ----
    const submission = {
      id: crypto.randomUUID(),
      type: submissionType,
      linkUrl: strLinkUrl,
      songList: strSongList,
      playlistName: strPlaylistName,
      authorName: strAuthorName,
      description: strDescription,
      tags: processedTags,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // ---- 9. 存储提交记录到 KV ----
    // 使用独立 key 存储每条提交，避免 read-modify-write 竞态条件
    // 列表读取通过 kv.list({ prefix: 'submission:' }) 枚举，无需维护索引 key
    await kv.put(`submission:${submission.id}`, JSON.stringify(submission));

    return Response.json({
      success: true,
      id: submission.id,
      remaining: rateLimit.remaining,
    });
  } catch (e: any) {
    return Response.json({ error: '提交失败: ' + e.message }, { status: 500 });
  }
};
