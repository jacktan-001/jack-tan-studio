/**
 * Layer 5: PWA — 安装提示管理
 * 处理 beforeinstallprompt 事件
 */

import { storageKeys, get, set } from '../storage/localStorage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

/** 监听 beforeinstallprompt 事件 */
export function initInstallPrompt(onAvailable?: () => void): () => void {
  const handler = (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    onAvailable?.();
  };
  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}

/** 触发安装提示 */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable';
  await deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
  if (result.outcome === 'accepted') {
    set(storageKeys.pwaPrompt, true);
  }
  return result.outcome;
}

/** 检查是否可以安装 */
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

/** 检查是否已经安装（PWA 模式运行） */
export function isInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** 检查用户是否已永久拒绝安装 */
export function isInstallDismissed(): boolean {
  return get(storageKeys.pwaPrompt, false);
}

/** 检查是否是 iOS（不支持 beforeinstallprompt，需要手动引导） */
export function isIOSInstall(): boolean {
  if (typeof navigator === 'undefined') return false;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isNotSafari = /CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);
  return isIOS && !isNotSafari;
}
