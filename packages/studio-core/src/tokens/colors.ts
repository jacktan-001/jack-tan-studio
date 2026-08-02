/**
 * Layer 1: Design Tokens — Colors
 * 统一调色板 + 四套项目主题预设
 * 所有子项目共享同一套基础 token，通过 theme preset 切换视觉个性
 */

/** 基础中性色 — 所有主题共享 */
export const neutral = {
  // Dark mode（Studio 默认暗色系）
  bg: '#06060a',
  bgSurface: '#0c0c14',
  bgElevated: '#12121e',
  bgGlass: 'rgba(18, 18, 30, 0.5)',
  text: '#f5f5f7',
  textMuted: '#8888a0',
  textDim: '#555568',
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.16)',
  // Light mode
  bgLight: '#f8f8fc',
  bgSurfaceLight: '#ffffff',
  bgElevatedLight: '#f0f0f5',
  bgGlassLight: 'rgba(255, 255, 255, 0.6)',
  textLight: '#1a1a2e',
  textMutedLight: '#646480',
  textDimLight: '#a0a0b8',
  borderLight: 'rgba(0, 0, 0, 0.08)',
  borderHoverLight: 'rgba(0, 0, 0, 0.16)',
} as const;

/** 主题预设 — 每个子项目一套个性色 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  /** 主强调色 */
  accent: string;
  /** 副强调色 */
  accent2: string;
  /** 第三强调色 */
  accent3: string;
  /** 第四强调色（用于 highlight） */
  accent4: string;
  /** RGB 值（用于 rgba() 拼接） */
  accentRgb: string;
  accent2Rgb: string;
  accent3Rgb: string;
  /** 发光阴影 */
  glow: string;
  /** 渐变方向 */
  gradient: string;
}

/** Studio 主题 — 紫粉霓虹（默认） */
export const studioTheme: ThemePreset = {
  id: 'studio',
  name: 'Studio',
  description: '紫粉霓虹 — 科技未来感',
  accent: '#7c3aed',
  accent2: '#ec4899',
  accent3: '#06b6d4',
  accent4: '#f59e0b',
  accentRgb: '124, 58, 237',
  accent2Rgb: '236, 72, 153',
  accent3Rgb: '6, 182, 212',
  glow: '0 0 40px rgba(124, 58, 237, 0.5)',
  gradient: 'linear-gradient(135deg, #7c3aed, #ec4899, #06b6d4)',
};

/** Jack Wave 主题 — 青蓝暖光 */
export const waveTheme: ThemePreset = {
  id: 'wave',
  name: 'Wave',
  description: '青蓝暖光 — 音乐律动感',
  accent: '#06b6d4',
  accent2: '#0ea5e9',
  accent3: '#14b8a6',
  accent4: '#f59e0b',
  accentRgb: '6, 182, 212',
  accent2Rgb: '14, 165, 233',
  accent3Rgb: '20, 184, 166',
  glow: '0 0 40px rgba(6, 182, 212, 0.5)',
  gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9, #14b8a6)',
};

/** Jack Pose 主题 — 粉紫活力 */
export const poseTheme: ThemePreset = {
  id: 'pose',
  name: 'Pose',
  description: '粉紫活力 — 创意设计感',
  accent: '#ec4899',
  accent2: '#f43f5e',
  accent3: '#8b5cf6',
  accent4: '#fbbf24',
  accentRgb: '236, 72, 153',
  accent2Rgb: '244, 63, 94',
  accent3Rgb: '139, 92, 246',
  glow: '0 0 40px rgba(236, 72, 153, 0.5)',
  gradient: 'linear-gradient(135deg, #ec4899, #f43f5e, #8b5cf6)',
};

/** Jack Tan 主题 — 紫蓝商务 */
export const tanTheme: ThemePreset = {
  id: 'tan',
  name: 'Tan',
  description: '紫蓝商务 — 专业沉稳感',
  accent: '#7c3aed',
  accent2: '#3b82f6',
  accent3: '#6366f1',
  accent4: '#8b5cf6',
  accentRgb: '124, 58, 237',
  accent2Rgb: '59, 130, 246',
  accent3Rgb: '99, 102, 241',
  glow: '0 0 40px rgba(124, 58, 237, 0.4)',
  gradient: 'linear-gradient(135deg, #7c3aed, #3b82f6, #6366f1)',
};

/** 所有主题预设映射 */
export const themePresets: Record<string, ThemePreset> = {
  studio: studioTheme,
  wave: waveTheme,
  pose: poseTheme,
  tan: tanTheme,
};

/** CSS 变量名常量 — 确保各处引用一致 */
export const cssVarNames = {
  // 基础
  bg: '--bg',
  bgSurface: '--bg-surface',
  bgElevated: '--bg-elevated',
  bgGlass: '--bg-glass',
  text: '--text',
  textMuted: '--text-muted',
  textDim: '--text-dim',
  border: '--border',
  borderHover: '--border-hover',
  // 主题
  accent: '--accent',
  accent2: '--accent-2',
  accent3: '--accent-3',
  accent4: '--accent-4',
  accentRgb: '--accent-rgb',
  accent2Rgb: '--accent-2-rgb',
  accent3Rgb: '--accent-3-rgb',
  glow: '--glow',
  gradient: '--gradient',
} as const;

/** 将 ThemePreset 转为 CSS 变量对象 */
export function presetToCssVars(preset: ThemePreset): Record<string, string> {
  return {
    [cssVarNames.accent]: preset.accent,
    [cssVarNames.accent2]: preset.accent2,
    [cssVarNames.accent3]: preset.accent3,
    [cssVarNames.accent4]: preset.accent4,
    [cssVarNames.accentRgb]: preset.accentRgb,
    [cssVarNames.accent2Rgb]: preset.accent2Rgb,
    [cssVarNames.accent3Rgb]: preset.accent3Rgb,
    [cssVarNames.glow]: preset.glow,
    [cssVarNames.gradient]: preset.gradient,
  };
}
