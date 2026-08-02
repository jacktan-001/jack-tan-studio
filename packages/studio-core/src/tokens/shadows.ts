/**
 * Layer 1: Design Tokens — Shadows
 * 统一阴影体系（含发光效果）
 */

export const shadow = {
  none: 'none',
  sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
  base: '0 4px 16px rgba(0, 0, 0, 0.12)',
  md: '0 6px 24px rgba(0, 0, 0, 0.15)',
  lg: '0 12px 48px rgba(0, 0, 0, 0.2)',
  xl: '0 20px 60px rgba(0, 0, 0, 0.25)',
  // 带主题色的发光
  glowSm: '0 0 20px rgba(var(--accent-rgb), 0.3)',
  glowMd: '0 0 40px rgba(var(--accent-rgb), 0.5)',
  glowLg: '0 0 60px rgba(var(--accent-rgb), 0.7)',
  // 内阴影
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
} as const;

/** 主题发光阴影（动态根据 accent 生成） */
export function createGlow(accentRgb: string, intensity: number = 0.5): string {
  return `0 0 ${20 + intensity * 40}px rgba(${accentRgb}, ${intensity})`;
}
