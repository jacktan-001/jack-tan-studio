/**
 * Layer 4: Theme — 主题预设配置
 * 对接 Layer 1 的 ThemePreset，定义每个项目的主题映射
 */

import type { ThemePreset } from '../tokens/colors';
import {
  studioTheme,
  waveTheme,
  poseTheme,
  tanTheme,
  themePresets,
  presetToCssVars,
} from '../tokens/colors';
import { neutral, cssVarNames } from '../tokens/colors';

export type { ThemePreset };
export { studioTheme, waveTheme, poseTheme, tanTheme, themePresets, presetToCssVars };

export type ThemeMode = 'light' | 'dark';
export type ThemeModeSetting = 'light' | 'dark' | 'auto';

/** 暗色模式 CSS 变量 */
export function getDarkVars(): Record<string, string> {
  return {
    [cssVarNames.bg]: neutral.bg,
    [cssVarNames.bgSurface]: neutral.bgSurface,
    [cssVarNames.bgElevated]: neutral.bgElevated,
    [cssVarNames.bgGlass]: neutral.bgGlass,
    [cssVarNames.text]: neutral.text,
    [cssVarNames.textMuted]: neutral.textMuted,
    [cssVarNames.textDim]: neutral.textDim,
    [cssVarNames.border]: neutral.border,
    [cssVarNames.borderHover]: neutral.borderHover,
  };
}

/** 亮色模式 CSS 变量 */
export function getLightVars(): Record<string, string> {
  return {
    [cssVarNames.bg]: neutral.bgLight,
    [cssVarNames.bgSurface]: neutral.bgSurfaceLight,
    [cssVarNames.bgElevated]: neutral.bgElevatedLight,
    [cssVarNames.bgGlass]: neutral.bgGlassLight,
    [cssVarNames.text]: neutral.textLight,
    [cssVarNames.textMuted]: neutral.textMutedLight,
    [cssVarNames.textDim]: neutral.textDimLight,
    [cssVarNames.border]: neutral.borderLight,
    [cssVarNames.borderHover]: neutral.borderHoverLight,
  };
}

/** 获取完整主题 CSS 变量（基础 + 主题色） */
export function getThemeVars(preset: ThemePreset, mode: ThemeMode): Record<string, string> {
  return {
    ...presetToCssVars(preset),
    ...(mode === 'dark' ? getDarkVars() : getLightVars()),
  };
}

/** 将 CSS 变量对象应用到 DOM 元素 */
export function applyThemeVars(
  element: HTMLElement,
  vars: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

/** 应用主题预设到根元素（属性驱动，不注入内联变量）
 *  theme.css 依据 data-theme / data-project 解析出具体变量值，
 *  各应用可在此基础上用同名属性选择器做个性化覆盖。 */
export function applyPreset(
  preset: ThemePreset,
  mode: ThemeMode,
  element: HTMLElement = document.documentElement,
): void {
  element.setAttribute('data-theme', mode);
  element.setAttribute('data-project', preset.id);
}

/** 检测系统暗色模式偏好 */
export function getSystemThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** 监听系统主题变化 */
export function onSystemThemeChange(callback: (mode: ThemeMode) => void): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };
  mq.addEventListener('change', handler);
  return () => mq.removeEventListener('change', handler);
}
