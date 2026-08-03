/**
 * Layer 1: Design Tokens — Typography
 * 统一字体系统
 */

export const fontFamily = {
  display: "'Inter', 'Noto Sans SC', system-ui, sans-serif",
  body: "'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
} as const;

export const fontSize = {
  xs: '12px',
  sm: '13px',
  base: '14px',
  md: '15px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '28px',
  '5xl': '32px',
  '6xl': '40px',
  '7xl': '48px',
  '8xl': '56px',
  '9xl': '72px',
} as const;

export const fontWeight = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

export const lineHeight = {
  none: '1',
  tight: '1.1',
  snug: '1.3',
  normal: '1.5',
  relaxed: '1.7',
  loose: '2',
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.02em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

/** 响应式标题尺寸（clamp） */
export const headingSize = {
  h1: 'clamp(40px, 8vw, 72px)',
  h2: 'clamp(28px, 5vw, 42px)',
  h3: 'clamp(22px, 4vw, 32px)',
  h4: 'clamp(18px, 3vw, 24px)',
  h5: 'clamp(16px, 2.5vw, 20px)',
  h6: 'clamp(14px, 2vw, 16px)',
} as const;
