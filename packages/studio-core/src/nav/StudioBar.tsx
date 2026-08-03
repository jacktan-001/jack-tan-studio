/**
 * Layer 4: Theme / Navigation — StudioBar 跨项目共享导航
 *
 * 单 origin 部署后，四个应用位于同一域名下的子路径：
 *   Studio /  ·  Pose /pose/  ·  Wave /wave/  ·  Tan /tan/
 * StudioBar 提供跨应用快速切换 + 全局主题开关。
 * 样式全部基于共享 CSS 变量（--bg/--text/--accent），自动跟随当前应用主题。
 */

import { useTheme } from '../theme/useTheme';

export type StudioBarProject = 'studio' | 'pose' | 'wave' | 'tan';

const LINKS: { id: StudioBarProject; label: string; href: string }[] = [
  { id: 'studio', label: 'Studio', href: '/' },
  { id: 'pose', label: 'Pose', href: '/jack-pose/' },
  { id: 'wave', label: 'Wave', href: '/jack-wave/' },
  { id: 'tan', label: 'Tan', href: '/jack-tan/' },
];

export interface StudioBarProps {
  /** 当前应用标识，用于高亮 */
  current: StudioBarProject;
}

export function StudioBar({ current }: StudioBarProps) {
  const { mode, toggleMode } = useTheme();

  return (
    <nav
      aria-label="Studio 跨项目导航"
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '6px 12px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: 'var(--bg-glass, color-mix(in srgb, var(--bg, #06060a) 72%, transparent))',
        borderBottom: '1px solid var(--border, rgba(128,128,128,0.2))',
        fontFamily:
          "'Space Grotesk','Noto Sans SC',system-ui,-apple-system,sans-serif",
      }}
    >
      {LINKS.map((l) => {
        const active = l.id === current;
        return (
          <a
            key={l.id}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            style={{
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: active ? 700 : 500,
              letterSpacing: '0.02em',
              textDecoration: 'none',
              color: active ? '#fff' : 'var(--text, #fafafa)',
              background: active ? 'var(--accent, #7c3aed)' : 'transparent',
              border: active
                ? '1px solid transparent'
                : '1px solid var(--border, rgba(128,128,128,0.25))',
              transition: 'all 0.2s ease',
            }}
          >
            {l.label}
          </a>
        );
      })}

      <button
        type="button"
        onClick={toggleMode}
        title={mode === 'dark' ? '切换到亮色' : '切换到暗色'}
        aria-label="切换主题"
        style={{
          marginLeft: '8px',
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '12px',
          cursor: 'pointer',
          color: 'var(--text, #fafafa)',
          background: 'transparent',
          border: '1px solid var(--border, rgba(128,128,128,0.25))',
        }}
      >
        {mode === 'dark' ? '☀' : '☾'}
      </button>
    </nav>
  );
}
