/**
 * Layer 7: Effects — 视觉效果系统
 * 霓虹发光、玻璃态、噪点、渐变网格、粒子
 * 从 Studio index.css 提取并泛化为可编程效果
 */

/** CSS 类名常量 */
export const effectClasses = {
  noiseOverlay: 'noise-overlay',
  gradientMesh: 'gradient-mesh',
  gradientBlob: 'gradient-blob',
  gridBg: 'grid-bg',
  glass: 'glass',
  gradientText: 'gradient-text',
  shimmer: 'shimmer',
  glowPulse: 'glow-pulse',
  float: 'float',
  customCursor: 'custom-cursor',
  reveal: 'reveal',
  revealVisible: 'reveal visible',
} as const;

/** 玻璃态样式 */
export const glassStyle = {
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(20px)',
  webkitBackdropFilter: 'blur(20px)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
} as const;

/** 渐变文字样式 */
export const gradientTextStyle = {
  background: 'linear-gradient(135deg, var(--accent), var(--accent-2), var(--accent-3))',
  backgroundSize: '200% 200%',
  webkitBackgroundClip: 'text',
  backgroundClip: 'text',
  webkitTextFillColor: 'transparent',
} as const;

/** 噪点叠加层 SVG */
export const noiseOverlaySvg =
  `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E`;

/** 渐变网格的 blob 配置 */
export interface BlobConfig {
  width: string;
  height: string;
  color: string;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  delay?: string;
  duration?: string;
}

/** 生成渐变网格的 blob 列表 */
export function createGradientBlobs(accentRgb: string, accent2Rgb: string, accent3Rgb: string): BlobConfig[] {
  return [
    {
      width: '500px',
      height: '500px',
      color: `rgba(${accentRgb}, 0.4)`,
      top: '-10%',
      left: '-5%',
      delay: '0s',
    },
    {
      width: '400px',
      height: '400px',
      color: `rgba(${accent2Rgb}, 0.4)`,
      bottom: '-10%',
      right: '-5%',
      delay: '-7s',
    },
    {
      width: '350px',
      height: '350px',
      color: `rgba(${accent3Rgb}, 0.4)`,
      top: '40%',
      left: '50%',
      delay: '-14s',
    },
  ];
}

/** 将 BlobConfig 转为内联样式对象 */
export function blobToStyle(blob: BlobConfig): Record<string, string> {
  return {
    position: 'absolute',
    width: blob.width,
    height: blob.height,
    background: blob.color,
    borderRadius: '50%',
    filter: 'blur(120px)',
    opacity: '0.4',
    animation: `blob-drift ${blob.duration ?? '20s'} ease-in-out infinite`,
    animationDelay: blob.delay ?? '0s',
    ...(blob.top && { top: blob.top }),
    ...(blob.left && { left: blob.left }),
    ...(blob.bottom && { bottom: blob.bottom }),
    ...(blob.right && { right: blob.right }),
  };
}

/** 项目级视觉个性配置 */
export interface ProjectVisualEffect {
  /** 噪点叠加透明度 */
  noiseOpacity: number;
  /** 渐变 blob 数量 */
  blobCount: number;
  /** 网格背景是否显示 */
  showGrid: boolean;
  /** 玻璃态模糊强度 */
  glassBlur: string;
  /** 发光强度 */
  glowIntensity: number;
  /** 自定义光标 */
  customCursor: boolean;
  /** 霓虹边框 */
  neonBorder: boolean;
}

/** 各项目视觉个性预设 */
export const projectVisuals: Record<string, ProjectVisualEffect> = {
  studio: {
    noiseOpacity: 0.035,
    blobCount: 3,
    showGrid: true,
    glassBlur: '20px',
    glowIntensity: 0.5,
    customCursor: true,
    neonBorder: true,
  },
  wave: {
    noiseOpacity: 0.02,
    blobCount: 2,
    showGrid: false,
    glassBlur: '16px',
    glowIntensity: 0.4,
    customCursor: false,
    neonBorder: false,
  },
  pose: {
    noiseOpacity: 0.025,
    blobCount: 3,
    showGrid: true,
    glassBlur: '20px',
    glowIntensity: 0.5,
    customCursor: true,
    neonBorder: true,
  },
  tan: {
    noiseOpacity: 0.015,
    blobCount: 2,
    showGrid: false,
    glassBlur: '12px',
    glowIntensity: 0.3,
    customCursor: false,
    neonBorder: false,
  },
};

/** 霓虹发光 CSS（根据主题色生成） */
export function neonGlow(accentRgb: string, intensity: number = 0.5): string {
  return `0 0 20px rgba(${accentRgb}, ${intensity * 0.6}), 0 0 40px rgba(${accentRgb}, ${intensity * 0.4}), 0 0 80px rgba(${accentRgb}, ${intensity * 0.2})`;
}

/** 霓虹边框 CSS */
export function neonBorder(accentRgb: string, intensity: number = 0.5): string {
  return `0 0 1px rgba(${accentRgb}, ${intensity}), 0 0 3px rgba(${accentRgb}, ${intensity * 0.8}), 0 0 8px rgba(${accentRgb}, ${intensity * 0.5})`;
}

/** 滚动揭示工具 — IntersectionObserver */
export function createScrollReveal(
  selector: string = '.reveal',
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -80px 0px' },
): () => void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, options);

  document.querySelectorAll(selector).forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

/** 自定义光标控制器 */
export function initCustomCursor(cursorSelector: string = '.custom-cursor'): () => void {
  const cursor = document.querySelector<HTMLElement>(cursorSelector);
  if (!cursor || window.matchMedia('(max-width: 768px)').matches) {
    return () => {};
  }

  const onMove = (e: MouseEvent) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  };

  const onEnter = () => cursor.classList.add('hovering');
  const onLeave = () => cursor.classList.remove('hovering');

  document.addEventListener('mousemove', onMove);
  document.querySelectorAll('a, button, [role="button"], input, textarea').forEach((el) => {
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
  });

  return () => {
    document.removeEventListener('mousemove', onMove);
    document.querySelectorAll('a, button, [role="button"], input, textarea').forEach((el) => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    });
  };
}
