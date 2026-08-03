/**
 * Layer 4: Theme — ThemeProvider
 * React Context Provider，管理局部主题状态
 * 支持暗/亮模式切换 + 项目级主题预设
 */

import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import './theme.css';
import {
  type ThemeMode,
  type ThemeModeSetting,
  type ThemePreset,
  themePresets,
  applyPreset,
  getSystemThemeMode,
  onSystemThemeChange,
} from './presets';
import { storageKeys } from '../storage/localStorage';
import * as storage from '../storage/localStorage';
import { consumePendingProject } from './bridge';

export interface ThemeContextValue {
  /** 当前模式（light/dark） */
  mode: ThemeMode;
  /** 设置值（light/dark/auto） */
  setting: ThemeModeSetting;
  /** 当前主题预设 */
  preset: ThemePreset;
  /** 当前项目 ID */
  projectId: string;
  /** 是否刚从 Studio 导航进入（一次性，消费后重置） */
  enteredFromStudio: boolean;
  /** 设置模式 */
  setMode: (mode: ThemeModeSetting) => void;
  /** 切换暗/亮模式 */
  toggleMode: () => void;
  /** 切换项目主题 */
  setProject: (projectId: string) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
  /** 项目 ID，决定使用哪套主题预设 */
  projectId?: string;
  /** 默认模式设置 */
  defaultMode?: ThemeModeSetting;
}

export function ThemeProvider({
  children,
  projectId = 'studio',
  defaultMode = 'dark',
}: ThemeProviderProps) {
  const [setting, setSetting] = useState<ThemeModeSetting>(() => {
    return storage.get(storageKeys.theme, defaultMode) as ThemeModeSetting;
  });
  const [currentProjectId, setCurrentProjectId] = useState(projectId);
  const [systemMode, setSystemMode] = useState<ThemeMode>(getSystemThemeMode());
  const [enteredFromStudio, setEnteredFromStudio] = useState(false);

  // 消费 Studio 导航留下的 project hint，用于主题/进入动画一致性
  useEffect(() => {
    const pending = consumePendingProject();
    if (pending && pending === projectId) {
      setEnteredFromStudio(true);
    }
  }, [projectId]);

  const mode: ThemeMode = setting === 'auto' ? systemMode : setting;

  const preset = useMemo<ThemePreset>(() => {
    return themePresets[currentProjectId] ?? themePresets.studio!;
  }, [currentProjectId]);

  // 监听系统主题变化
  useEffect(() => {
    return onSystemThemeChange(setSystemMode);
  }, []);

  // 应用主题属性（绘制前执行，避免闪色）
  useLayoutEffect(() => {
    applyPreset(preset, mode);
  }, [preset, mode]);

  // 持久化设置
  useEffect(() => {
    storage.set(storageKeys.theme, setting);
  }, [setting]);

  const handleSetMode = useCallback((newMode: ThemeModeSetting) => {
    setSetting(newMode);
  }, []);

  const handleToggleMode = useCallback(() => {
    setSetting((prev) => {
      const currentMode = prev === 'auto' ? systemMode : prev;
      return currentMode === 'dark' ? 'light' : 'dark';
    });
  }, [systemMode]);

  const handleSetProject = useCallback((id: string) => {
    setCurrentProjectId(id);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      setting,
      preset,
      projectId: currentProjectId,
      enteredFromStudio,
      setMode: handleSetMode,
      toggleMode: handleToggleMode,
      setProject: handleSetProject,
    }),
    [mode, setting, preset, currentProjectId, enteredFromStudio, handleSetMode, handleToggleMode, handleSetProject],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
