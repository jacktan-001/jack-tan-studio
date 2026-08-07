/**
 * Layer 4.6: Brand — 统一品牌标识（单一事实来源）
 *
 * 全站项目图标 / 徽标此前在 Navbar、StudioBar、ComingSoon、ProjectIntro
 * 四处各自手写了一套 SVG（同一项目出现不同图标，例如 Jack Pose 在
 * ComingSoon 是 Sparkles、ProjectIntro 是 Layers、导航是九宫格）。
 *
 * 本模块把「项目字形（ProjectGlyph）」与「项目徽标（ProjectBadge）」
 * 收敛为唯一来源，所有页面/导航统一引用，确保四个模块 logo 与图标一致。
 *
 * 字形 key 与 apps/studio/src/data/projects.ts 的 `icon` 字段对齐：
 *   studio | wave | pose | profile(=Jack Tan) | cast(=Jack Talk) | craft
 */
import type { CSSProperties, ReactNode } from 'react';

export type ProjectGlyphId =
  | 'studio'
  | 'wave'
  | 'pose'
  | 'profile'
  | 'cast'
  | 'craft';

/** 各项目字形的内部 SVG 内容（统一描边风格，stroke 由外层 currentColor 控制） */
const GLYPH_PATHS: Record<ProjectGlyphId, ReactNode> = {
  // Studio：四宫格
  studio: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </>
  ),
  // Wave：声波折线
  wave: (
    <>
      <path d="M2 12 Q6 6, 10 12 T18 12 T22 12" />
      <path d="M2 16 Q6 10, 10 16 T18 16 T22 16" opacity="0.5" />
    </>
  ),
  // Pose：九宫格 + 焦点圆
  pose: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M3 9 L21 9 M9 3 L9 21" opacity="0.5" />
      <circle cx="15" cy="15" r="2" />
    </>
  ),
  // Jack Tan：人像
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 Q4 14, 12 14 T20 21" />
    </>
  ),
  // Jack Talk：广播/麦克风
  cast: (
    <>
      <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
      <path d="M2 12a9 9 0 0 1 8 8" />
      <path d="M2 16a5 5 0 0 1 4 4" />
      <line x1="2" y1="20" x2="2.01" y2="20" />
    </>
  ),
  // Jack Craft：菱形/生成
  craft: (
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  ),
};

export interface ProjectGlyphProps {
  id: ProjectGlyphId;
  size?: number;
  /** 描边色；默认 currentColor，由父级 color 决定 */
  color?: string;
  strokeWidth?: number;
  className?: string;
}

/** 统一项目字形：一根 SVG，描边跟随 currentColor */
export function ProjectGlyph({
  id,
  size = 18,
  color = 'currentColor',
  strokeWidth = 2,
  className,
}: ProjectGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {GLYPH_PATHS[id]}
    </svg>
  );
}

export interface ProjectBadgeProps {
  id: ProjectGlyphId;
  /** 主色（来自 projects.ts 的 color） */
  color: string;
  /** 主色 RGB（来自 projects.ts 的 colorRgb），用于阴影/渐变透明度 */
  colorRgb: string;
  size?: number;
  /** 圆角，默认 28% 边长，接近现有设计语言 */
  radius?: number;
  style?: CSSProperties;
  className?: string;
}

/**
 * 统一项目徽标：渐变圆角方块 + 白色字形。
 * 用于 Coming Soon / Project Intro / Navbar 品牌区等所有「项目 logo」位置，
 * 保证四模块视觉一致。
 */
export function ProjectBadge({
  id,
  color,
  colorRgb,
  size = 72,
  radius,
  style,
  className,
}: ProjectBadgeProps) {
  const r = radius ?? Math.round(size * 0.28);
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: `linear-gradient(135deg, ${color}, ${color}66)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 40px rgba(${colorRgb}, 0.25)`,
        flexShrink: 0,
        ...style,
      }}
    >
      <ProjectGlyph id={id} size={Math.round(size * 0.5)} color="#fff" />
    </div>
  );
}
