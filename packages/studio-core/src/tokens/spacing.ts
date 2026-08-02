/**
 * Layer 1: Design Tokens — Spacing
 * 统一间距体系，基于 4px 基准线
 */

export const spacing = {
  /** 4px */
  xs: '4px',
  /** 8px */
  sm: '8px',
  /** 12px */
  md: '12px',
  /** 16px */
  base: '16px',
  /** 20px */
  lg: '20px',
  /** 24px */
  xl: '24px',
  /** 32px */
  '2xl': '32px',
  /** 40px */
  '3xl': '40px',
  /** 48px */
  '4xl': '48px',
  /** 64px */
  '5xl': '64px',
  /** 80px */
  '6xl': '80px',
} as const;

/** 数值间距（用于计算） */
export const spacingNum = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

/** 容器最大宽度 */
export const containerMaxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1100px',
  '2xl': '1280px',
  full: '100%',
} as const;

/** 页面内边距 */
export const pagePadding = {
  mobile: '16px',
  tablet: '24px',
  desktop: '32px',
} as const;
