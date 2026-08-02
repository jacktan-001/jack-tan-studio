/**
 * Layer 7: Effects — Motion 动画变体
 * Motion 12 (formerly Framer Motion) 动画预设
 * 项目共享动画语言，通过 preset 切换视觉个性
 */

import type { Variants, Transition } from 'motion/react';

/** 缓动曲线 */
export const easeSmooth: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeBounce: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
export const easeSpring: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** 基础入场动画 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: easeSmooth } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeSmooth } },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeSmooth } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: easeBounce } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeSmooth } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeSmooth } },
};

/** 交错容器与子项 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeSmooth } },
};

/** 悬停效果 */
export const hoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: easeSmooth } },
  whileTap: { y: 0, scale: 0.98 },
};

export const hoverScale = {
  whileHover: { scale: 1.05, transition: { duration: 0.2, ease: easeSmooth } },
  whileTap: { scale: 0.95 },
};

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 40px rgba(var(--accent-rgb), 0.5)',
    transition: { duration: 0.3, ease: easeSmooth },
  },
};

/** 持续动画 */
export const float: Variants = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const pulse: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['-200% 0', '200% 0'],
    transition: { duration: 3, repeat: Infinity, ease: 'linear' },
  },
};

/** 视口动画配置 — 元素进入视口时触发 */
export const viewportConfig = {
  once: true,
  margin: '0px 0px -80px 0px',
} as const;

/** Spring 配置 */
export const springConfig: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

/** 悬停效果类型 */
type HoverEffect = {
  whileHover?: Record<string, unknown>;
  whileTap?: Record<string, unknown>;
};

/** 持续动画预设 — 每个项目不同的入场风格 */
export interface ProjectMotion {
  /** 入场变体 */
  enter: Variants;
  /** 交错容器 */
  container: Variants;
  /** 子项 */
  item: Variants;
  /** 悬停 */
  hover: HoverEffect;
  /** 持续 */
  ambient: Variants;
}

export const projectMotions: Record<string, ProjectMotion> = {
  studio: {
    enter: fadeInUp,
    container: staggerContainer,
    item: staggerItem,
    hover: hoverLift,
    ambient: float,
  },
  wave: {
    enter: {
      hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: easeSmooth } },
    },
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } },
    item: { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeSmooth } } },
    hover: hoverScale,
    ambient: pulse,
  },
  pose: {
    enter: {
      hidden: { opacity: 0, scale: 0.9, rotateX: 15 },
      visible: { opacity: 1, scale: 1, rotateX: 0, transition: { duration: 0.5, ease: easeBounce } },
    },
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } },
    item: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: easeBounce } } },
    hover: hoverScale,
    ambient: float,
  },
  tan: {
    enter: fadeIn,
    container: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } },
    item: { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeSpring } } },
    hover: hoverLift,
    ambient: pulse,
  },
};
