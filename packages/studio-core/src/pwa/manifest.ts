/**
 * Layer 5: PWA — Manifest 管理
 * 动态生成与注入 Web App Manifest
 */

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'any maskable';
}

export interface AppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'portrait' | 'landscape' | 'any';
  background_color: string;
  theme_color: string;
  icons: ManifestIcon[];
}

/** 生成项目级 Manifest */
export function createManifest(
  projectId: string,
  overrides: Partial<AppManifest> = {},
): AppManifest {
  const defaults: Record<string, AppManifest> = {
    studio: {
      name: 'Jack Tan Studio',
      short_name: 'Studio',
      description: 'Jack Tan 个人项目集合',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#06060a',
      theme_color: '#7c3aed',
      icons: [
        { src: '/icons/studio-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icons/studio-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    wave: {
      name: 'Jack Wave',
      short_name: 'Wave',
      description: '好友乐享・音乐随记',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0d9488',
      theme_color: '#06b6d4',
      icons: [
        { src: '/avatar.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any maskable' },
        { src: '/avatar.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any maskable' },
      ],
    },
    pose: {
      name: 'Jack Pose',
      short_name: 'Pose',
      description: '社媒排版・长图导出工具',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ec4899',
      theme_color: '#ec4899',
      icons: [
        { src: '/icons/pose-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icons/pose-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    tan: {
      name: 'Jack Tan',
      short_name: 'Tan',
      description: '个人职业展示页',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#7c3aed',
      theme_color: '#7c3aed',
      icons: [
        { src: '/icons/tan-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/icons/tan-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
  };
  return { ...defaults[projectId] ?? defaults.studio!, ...overrides };
}

/** 注入 manifest 到 document head */
export function injectManifest(manifest: AppManifest): void {
  if (typeof document === 'undefined') return;
  let link = document.querySelector('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'manifest');
    document.head.appendChild(link);
  }
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  link.setAttribute('href', URL.createObjectURL(blob));
}

/** 设置 theme-color meta */
export function setThemeColor(color: string, media?: string): void {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector(`meta[name="theme-color"]${media ? `[media="${media}"]` : ''}`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    if (media) meta.setAttribute('media', media);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', color);
}
