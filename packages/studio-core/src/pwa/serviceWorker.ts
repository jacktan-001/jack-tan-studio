/**
 * Layer 5: PWA — Service Worker 管理
 * 注册、更新、通信
 * 从 Jack Wave sw.js 的四种缓存策略提取并泛化
 */

export type SWCacheStrategy = 'stale-while-revalidate' | 'cache-first' | 'network-first';

export interface SWConfig {
  /** SW 文件路径 */
  swUrl: string;
  /** 注册 scope */
  scope?: string;
  /** 是否在注册后立即激活 */
  immediate?: boolean;
}

/** 注册 Service Worker */
export async function registerSW(config: SWConfig): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register(config.swUrl, {
      scope: config.scope ?? '/',
      type: 'classic',
    });
    if (config.immediate) {
      await navigator.serviceWorker.ready;
    }
    return reg;
  } catch {
    return null;
  }
}

/** 注销 Service Worker */
export async function unregisterSW(scope?: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => !scope || r.scope === scope)
        .map((r) => r.unregister()),
    );
    return true;
  } catch {
    return false;
  }
}

/** 触发 SW 跳过等待 */
export function skipWaiting(): void {
  if (typeof navigator === 'undefined' || !navigator.serviceWorker.controller) return;
  navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
}

/** 监听 SW 更新 */
export function onSWUpdate(callback: (registration: ServiceWorkerRegistration) => void): () => void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }
  let reg: ServiceWorkerRegistration | null = null;
  navigator.serviceWorker.ready.then((r) => {
    reg = r;
    r.addEventListener('updatefound', () => {
      if (reg?.installing) {
        callback(reg);
      }
    });
  });
  return () => {
    // cleanup not strictly needed for updatefound
  };
}

/** 监听 SW 控制器变化（新 SW 已激活） */
export function onControllerChange(callback: () => void): () => void {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return () => {};
  }
  const handler = () => callback();
  navigator.serviceWorker.addEventListener('controllerchange', handler);
  return () => navigator.serviceWorker.removeEventListener('controllerchange', handler);
}

/** 检查 SW 是否已安装 */
export function isSWInstalled(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.serviceWorker.controller;
}

/** 预缓存核心资源列表 */
export function getPrecacheAssets(projectId: string): string[] {
  const common = ['/', '/index.html', '/manifest.json'];
  const projectAssets: Record<string, string[]> = {
    studio: ['/assets/studio.css', '/assets/studio.js'],
    wave: ['/common.css', '/data.js', '/app.js', '/avatar.jpg'],
    pose: ['/assets/pose.css', '/assets/pose.js'],
    tan: ['/assets/tan.css', '/assets/tan.js'],
  };
  return [...common, ...(projectAssets[projectId] ?? [])];
}
