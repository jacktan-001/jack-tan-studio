/**
 * Navbar — 顶部导航栏
 * 包含 Logo、导航链接和主题切换按钮
 * 主题切换使用 studio-core 的 useTheme
 */

import { useTheme } from '../hooks/useTheme';

export function Navbar() {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <nav
      className="nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="nav-logo"
        style={{
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
        }}
      >
        Jack-<span style={{ color: 'var(--teal)' }}>Wave</span>
      </div>
      <div
        className="nav-right"
        style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
      >
        <div
          className="nav-links"
          style={{ display: 'flex', gap: '28px' }}
        >
          <a
            href="#home"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--gray-500)',
              transition: 'color .2s',
            }}
          >
            首页
          </a>
          <a
            href="#mood"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--gray-500)',
              transition: 'color .2s',
            }}
          >
            心情歌单
          </a>
          <a
            href="#recommend"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--gray-500)',
              transition: 'color .2s',
            }}
          >
            推荐歌单
          </a>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleMode}
          aria-label="切换暗色/亮色模式"
          title="切换主题"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text2)',
            transition: 'all .2s',
            background: 'var(--gray-100)',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {!isDark ? (
            /* Sun icon */
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
          ) : (
            /* Moon icon */
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
