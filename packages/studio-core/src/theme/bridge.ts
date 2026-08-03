/**
 * Theme Bridge — 跨应用主题协调
 *
 * Studio 导航栏在跳转子应用前，会将目标项目 ID 写入 localStorage。
 * 子应用加载时可读取该 hint，用于：
 *  1. 确认是从 Studio 导航进入（可做欢迎动画/埋点）
 *  2. 在 ThemeProvider 生效前做一致性校验，避免闪色
 *  3. 清除 hint，防止直接刷新子应用时误判
 */

import { get, set, remove } from '../storage/localStorage';
import { storageKeys } from '../storage/localStorage';

/** 读取并消费 pending project hint */
export function consumePendingProject(): string | null {
  if (typeof window === 'undefined') return null;
  const id = get<string | null>(storageKeys.pendingProject, null);
  remove(storageKeys.pendingProject);
  return id;
}

/** 设置 pending project hint（Navbar 跳转前调用） */
export function setPendingProject(projectId: string): void {
  set(storageKeys.pendingProject, projectId);
}

/** 检查当前子应用是否刚从 Studio 导航进入 */
export function wasEnteredFromStudio(expectedProjectId: string): boolean {
  const pending = consumePendingProject();
  return pending === expectedProjectId;
}

/** 包装跨应用跳转，优先使用 View Transitions API 实现伪 SPA 体验 */
export function navigateWithTransition(href: string): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => ViewTransition };
  if (doc.startViewTransition) {
    doc.startViewTransition(() => {
      window.location.href = href;
    });
  } else {
    window.location.href = href;
  }
}
