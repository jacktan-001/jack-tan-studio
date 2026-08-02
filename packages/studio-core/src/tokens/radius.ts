/**
 * Layer 1: Design Tokens — Radius
 * 统一圆角体系
 */

export const radius = {
  none: '0',
  sm: '6px',
  base: '8px',
  md: '10px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '999px',
} as const;

/** CSS 变量名 */
export const radiusVarNames = {
  default: '--radius',
  sm: '--radius-sm',
  lg: '--radius-lg',
  full: '--radius-full',
} as const;
