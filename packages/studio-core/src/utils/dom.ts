/**
 * Layer 2: Utility — DOM & Device
 * DOM 操作与设备检测工具
 */

/** 安全 querySelector */
export function qs<T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T | null {
  return parent.querySelector<T>(selector);
}

/** 安全 querySelectorAll */
export function qsa<T extends Element = HTMLElement>(selector: string, parent: ParentNode = document): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/** 等待 DOM 元素出现 */
export function waitForElement<T extends Element>(selector: string, timeout: number = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const el = document.querySelector<T>(selector);
    if (el) {
      resolve(el);
      return;
    }
    const observer = new MutationObserver(() => {
      const el = document.querySelector<T>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
    }, timeout);
  });
}

/** 设备检测 */
export const device = {
  get isMobile() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  },
  get isTablet() {
    return /iPad|Tablet/i.test(navigator.userAgent);
  },
  get isDesktop() {
    return !this.isMobile && !this.isTablet;
  },
  get isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  get isAndroid() {
    return /Android/.test(navigator.userAgent);
  },
  get isSafari() {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },
  get isChrome() {
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  },
  get isPWA() {
    return typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true);
  },
  get supportsTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  get supportsWebP() {
    return typeof document !== 'undefined' &&
      document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  },
};

/** 视口尺寸 */
export function getViewport(): { width: number; height: number } {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  };
}

/** 滚动到指定位置 */
export function scrollTo(target: number | string | Element, options: ScrollToOptions = {}): void {
  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth', ...options });
  } else if (typeof target === 'string') {
    const el = document.querySelector(target);
    if (el) el.scrollIntoView({ behavior: 'smooth', ...options });
  } else {
    target.scrollIntoView({ behavior: 'smooth', ...options });
  }
}

/** 复制文本到剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/** 下载文件 */
export function downloadFile(content: string | Blob, filename: string, mime: string = 'text/plain'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
