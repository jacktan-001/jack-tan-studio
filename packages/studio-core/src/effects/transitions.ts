/**
 * Layer 7: Effects — 页面转场
 * Motion 驱动的路由级转场
 */

import type { Variants } from 'motion/react';
import { easeSmooth } from './motion';

/** 页面转场变体 */
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeSmooth } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: easeSmooth } },
};

/** 淡入淡出转场 */
export const fadeTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** 缩放转场 */
export const scaleTransition: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeSmooth } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3, ease: easeSmooth } },
};

/** 滑动转场 */
export const slideTransition: Variants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easeSmooth } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.3, ease: easeSmooth } },
};

/** 模糊转场 */
export const blurTransition: Variants = {
  initial: { opacity: 0, filter: 'blur(10px)' },
  animate: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: easeSmooth } },
  exit: { opacity: 0, filter: 'blur(10px)', transition: { duration: 0.3, ease: easeSmooth } },
};

/** 项目级转场预设 */
export const projectTransitions: Record<string, Variants> = {
  studio: pageTransition,
  wave: blurTransition,
  pose: scaleTransition,
  tan: fadeTransition,
};

/** 获取项目转场 */
export function getTransition(projectId: string): Variants {
  return projectTransitions[projectId] ?? pageTransition;
}
