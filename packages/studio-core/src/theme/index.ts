/**
 * Layer 4: Theme — 统一出口
 */
export * from './presets';
export { ThemeProvider } from './ThemeProvider';
export type { ThemeContextValue, ThemeProviderProps } from './ThemeProvider';
export { useTheme } from './useTheme';
export { ThemeToggleIcon } from './ThemeToggleIcon';
export type { ThemeToggleIconProps } from './ThemeToggleIcon';
export { consumePendingProject, setPendingProject, wasEnteredFromStudio, navigateWithTransition } from './bridge';
