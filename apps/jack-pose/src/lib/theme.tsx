/**
 * 主题管理：暗色/亮色模式切换
 * 优先读取全局 jack-tan-theme，其次跟随系统偏好
 */

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'jack-tan-theme'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

function readSavedTheme(): Theme | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed === 'light' || parsed === 'dark' ? parsed : null
  } catch {
    return raw === 'light' || raw === 'dark' ? raw : null
  }
}

export function initTheme() {
  const saved = readSavedTheme()
  const theme = saved ?? getSystemTheme()
  applyTheme(theme)
}

export function getCurrentTheme(): Theme {
  return (document.documentElement.getAttribute('data-theme') as Theme) ?? getSystemTheme()
}

export function toggleTheme(): Theme {
  const current = getCurrentTheme()
  const next: Theme = current === 'dark' ? 'light' : 'dark'
  applyTheme(next)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

/** 主题切换按钮 SVG 图标 */
export function ThemeToggleIcon({ theme }: { theme: Theme }) {
  if (theme === 'dark') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
