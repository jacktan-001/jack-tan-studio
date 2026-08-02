// ============================================================
// 管理接口认证与限流 - 共享工具模块
// 供 data.ts / submissions.ts 等管理接口复用
// 说明：Cloudflare Pages 文件路由会忽略以 _ 前缀的目录，
//       因此 _lib 不会被当作路由，仅作为可导入的共享模块。
// ============================================================

// 管理接口速率限制：每个 IP 在窗口期内最多认证失败次数
const ADMIN_RATE_LIMIT_MAX = 20;
// 速率限制窗口期（秒），10 分钟
export const ADMIN_RATE_LIMIT_WINDOW = 600;

/**
 * 获取客户端真实 IP 地址
 * Cloudflare 会通过 CF-Connecting-IP 头注入客户端 IP
 */
function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

/**
 * 使用恒定时间比较来验证密码，防止时序攻击
 * 先对两个密码分别进行 SHA-256 哈希（使长度一致，避免长度泄露），
 * 再逐字节异或比较，确保比较耗时与内容无关
 */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
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
 * 检查管理接口认证失败次数是否已达上限（暴力破解防护）
 * 每个 IP 在窗口期内最多允许 ADMIN_RATE_LIMIT_MAX 次失败
 * 返回是否允许继续尝试认证
 */
async function checkAdminRateLimit(kv: KVNamespace | undefined, ip: string): Promise<boolean> {
  // 未配置独立的限流 KV 时不阻断请求（容错处理）
  if (!kv) return true;

  const key = `admin-ratelimit:${ip}`;
  try {
    const raw = await kv.get(key);
    if (raw) {
      const data = JSON.parse(raw) as { count: number; windowStart: number };
      const elapsed = (Date.now() - data.windowStart) / 1000;
      if (elapsed < ADMIN_RATE_LIMIT_WINDOW) {
        // 仍在窗口期内，已达上限则拒绝
        return data.count < ADMIN_RATE_LIMIT_MAX;
      }
    }
    // 窗口已过期或首次访问，允许
    return true;
  } catch {
    // KV 读取失败时不阻断请求（容错处理）
    return true;
  }
}

/**
 * 记录一次认证失败（增加计数）
 * 在窗口期内累加，窗口过期则重新开始计数
 */
async function recordAdminAuthFailure(
  kv: KVNamespace | undefined,
  ip: string,
): Promise<void> {
  if (!kv) return;

  const key = `admin-ratelimit:${ip}`;
  const now = Date.now();
  try {
    const raw = await kv.get(key);
    if (raw) {
      const data = JSON.parse(raw) as { count: number; windowStart: number };
      const elapsed = (now - data.windowStart) / 1000;
      if (elapsed < ADMIN_RATE_LIMIT_WINDOW) {
        // 仍在窗口期内，累加计数并保留原始窗口起始时间
        const newCount = data.count + 1;
        const remainingTtl = Math.ceil(ADMIN_RATE_LIMIT_WINDOW - elapsed);
        await kv.put(
          key,
          JSON.stringify({ count: newCount, windowStart: data.windowStart }),
          { expirationTtl: remainingTtl },
        );
        return;
      }
    }
    // 新窗口或首次失败，初始化计数
    await kv.put(
      key,
      JSON.stringify({ count: 1, windowStart: now }),
      { expirationTtl: ADMIN_RATE_LIMIT_WINDOW },
    );
  } catch {
    // 静默失败，不阻断主流程
  }
}

/**
 * 认证成功后清除该 IP 的失败计数
 */
async function resetAdminRateLimit(
  kv: KVNamespace | undefined,
  ip: string,
): Promise<void> {
  if (!kv) return;
  const key = `admin-ratelimit:${ip}`;
  try {
    await kv.delete(key);
  } catch {
    // 静默失败，不阻断主流程
  }
}

// 认证结果：authorized 为 true 表示通过，否则 response 为需要返回的拒绝响应
type AuthResult =
  | { authorized: true }
  | { authorized: false; response: Response };

/**
 * 管理接口统一认证：时序安全密码校验 + 暴力破解限流
 *
 * 认证流程：
 *   1. 先检查该 IP 是否已达认证失败上限（每 10 分钟最多 20 次），达上限返回 429
 *   2. 仅从请求头 x-admin-password 读取密码（不再支持 URL 查询参数，避免日志泄露）
 *   3. 使用 timingSafeEqual 时序安全比较密码
 *   4. 认证失败时记录失败次数；认证成功时清除失败计数
 *
 * @returns 认证通过返回 { authorized: true }，否则返回 { authorized: false, response }
 */
export async function authenticateAdmin(
  request: Request,
  env: Env,
): Promise<AuthResult> {
  const ip = getClientIP(request);
  // 优先使用独立的限流 KV（如已配置），否则回退到主 KV
  const rateLimitKv = env.ADMIN_RATE_LIMIT || env.JACK_WAVE_KV;

  // 1. 检查是否已被限流（暴力破解防护）
  const allowed = await checkAdminRateLimit(rateLimitKv, ip);
  if (!allowed) {
    return {
      authorized: false,
      response: Response.json(
        { error: '认证失败次数过多，请稍后再试' },
        {
          status: 429,
          headers: { 'Retry-After': String(ADMIN_RATE_LIMIT_WINDOW) },
        },
      ),
    };
  }

  // 2. 仅支持请求头传递密码（移除 URL 查询参数支持，避免被 CDN/浏览器日志记录）
  const password = request.headers.get('x-admin-password');
  if (!password) {
    await recordAdminAuthFailure(rateLimitKv, ip);
    return {
      authorized: false,
      response: Response.json({ error: '未授权' }, { status: 401 }),
    };
  }

  // 3. 时序安全密码比较
  const valid = await timingSafeEqual(password, env.ADMIN_PASSWORD);
  if (!valid) {
    await recordAdminAuthFailure(rateLimitKv, ip);
    return {
      authorized: false,
      response: Response.json({ error: '未授权' }, { status: 401 }),
    };
  }

  // 4. 认证成功，清除该 IP 的失败计数
  await resetAdminRateLimit(rateLimitKv, ip);
  return { authorized: true };
}
