/**
 * Layer 1: Design Tokens — Motion
 * 统一动画时长与缓动函数
 */

export const duration = {
  instant: '0.1s',
  fast: '0.15s',
  base: '0.3s',
  normal: '0.4s',
  slow: '0.6s',
  slower: '0.8s',
  slowest: '1.2s',
} as const;

/** 数值（秒，用于 JS 动画库） */
export const durationNum = {
  instant: 0.1,
  fast: 0.15,
  base: 0.3,
  normal: 0.4,
  slow: 0.6,
  slower: 0.8,
  slowest: 1.2,
} as const;

export const easing = {
  // 标准 ease
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  // 自定义贝塞尔曲线
  smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
  overshoot: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  // 线性
  linear: 'linear',
} as const;

/** CSS transition 快捷预设 */
export const transition = {
  base: `0.4s ${easing.smooth}`,
  fast: `0.15s ${easing.smooth}`,
  slow: `0.6s ${easing.smooth}`,
  transform: `0.3s ${easing.smooth}`,
  opacity: `0.3s ease`,
  color: `0.2s ease`,
  all: `0.4s ${easing.smooth}`,
} as const;

/** Motion 库用（秒） */
export const motionConfig = {
  duration: durationNum,
  ease: {
    smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
    bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    spring: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
};

/** 关键帧动画名 */
export const keyframes = {
  blobDrift: 'blob-drift',
  gradientShift: 'gradient-shift',
  shimmer: 'shimmer',
  glowPulse: 'glow-pulse',
  float: 'float',
  fadeIn: 'fade-in',
  fadeInUp: 'fade-in-up',
  scaleIn: 'scale-in',
  slideInRight: 'slide-in-right',
  slideInLeft: 'slide-in-left',
} as const;
