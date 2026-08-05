/**
 * Layer 4: Theme / Navigation — StudioBar 跨项目共享导航
 *
 * 单 origin 部署后，四个应用位于同一域名下的子路径：
 *   Studio /  ·  Pose /projects/jack-pose/  ·  Wave /projects/jack-wave/  ·  Tan /projects/jack-tan/
 * StudioBar 提供跨应用快速切换 + 全局主题开关。
 * 样式全部基于共享 CSS 变量（--bg/--text/--accent），自动跟随当前应用主题。
 *
 * 设计语言与 Studio Navbar 保持一致：
 *  - 毛玻璃半透明背景
 *  - 左侧 JT Logo + "Jack Tan Studio" 品牌标识（点击返回 Studio 首页）
 *  - 中间产品矩阵快速切换
 *  - 右侧主题切换按钮
 *  - 移动端自适应折叠
 */

import { useState, useEffect, type ReactNode } from 'react';
import { useTheme } from '../theme/useTheme';

export type StudioBarProject = 'studio' | 'pose' | 'wave' | 'tan';

interface StudioBarLink {
  id: StudioBarProject;
  label: string;
  href: string;
  color: string;
  colorRgb: string;
}

const LINKS: StudioBarLink[] = [
  { id: 'studio', label: 'Jack Tan Studio', href: '/', color: '#7c3aed', colorRgb: '124, 58, 237' },
  { id: 'wave', label: 'Jack Wave', href: '/projects/jack-wave/', color: '#06b6d4', colorRgb: '6, 182, 212' },
  { id: 'pose', label: 'Jack Pose', href: '/projects/jack-pose/', color: '#ec4899', colorRgb: '236, 72, 153' },
  { id: 'tan', label: 'Jack Tan', href: '/projects/jack-tan/', color: '#3b82f6', colorRgb: '59, 130, 246' },
];

/** 各子系统的全称品牌名（左侧品牌区使用） */
const BRAND_NAMES: Record<StudioBarProject, { main: string; sub: string }> = {
  studio: { main: 'Jack Tan', sub: 'Studio' },
  wave: { main: 'Jack', sub: 'Wave' },
  pose: { main: 'Jack', sub: 'Pose' },
  tan: { main: 'Jack', sub: 'Tan' },
};

/** 项目小图标 */
function NavIcon({ type, color, size = 16 }: { type: StudioBarProject; color: string; size?: number }) {
  const icons: Record<StudioBarProject, ReactNode> = {
    studio: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
    wave: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M2 12 Q6 6, 10 12 T18 12 T22 12" />
        <path d="M2 16 Q6 10, 10 16 T18 16 T22 16" opacity="0.5" />
      </svg>
    ),
    pose: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9 L21 9 M9 3 L9 21" opacity="0.5" />
        <circle cx="15" cy="15" r="2" />
      </svg>
    ),
    tan: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 Q4 14, 12 14 T20 21" />
      </svg>
    ),
  }
  return icons[type]
}

/** 子应用内部的快速跳转链接（如 jack-wave 的 本月推荐/心情歌单/推荐歌单） */
export interface StudioBarQuickLink {
  label: string;
  href: string;
}

export interface StudioBarProps {
  /** 当前应用标识，用于高亮 */
  current: StudioBarProject;
  /** 当前应用内部的锚点快速跳转按钮，展示在中间产品矩阵与主题按钮之间 */
  quickLinks?: StudioBarQuickLink[];
}

export function StudioBar({ current, quickLinks }: StudioBarProps) {
  const { mode, toggleMode } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredProject, setHoveredProject] = useState<StudioBarLink | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const activeProject = hoveredProject;
  const previewRgb = activeProject ? activeProject.colorRgb : '124, 58, 237';
  const currentLink = LINKS.find((l) => l.id === current) ?? LINKS[0]!;
  const brand = BRAND_NAMES[current];

  return (
    <nav
      aria-label="Studio 跨项目导航"
      className="studiobar-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scrolled
          ? 'calc(env(safe-area-inset-top, 0px) + 8px) calc(env(safe-area-inset-right, 0px) + 24px) calc(env(safe-area-inset-bottom, 0px) + 8px) calc(env(safe-area-inset-left, 0px) + 24px)'
          : 'calc(env(safe-area-inset-top, 0px) + 12px) calc(env(safe-area-inset-right, 0px) + 24px) calc(env(safe-area-inset-bottom, 0px) + 12px) calc(env(safe-area-inset-left, 0px) + 24px)',
        background: scrolled
          ? 'color-mix(in srgb, var(--bg, #06060a) 88%, transparent)'
          : 'color-mix(in srgb, var(--bg, #06060a) 40%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid var(--border, rgba(128,128,128,0.15))' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: activeProject
          ? `inset 0 -1px 0 0 rgba(${previewRgb}, 0.25), 0 8px 40px rgba(${previewRgb}, 0.08)`
          : 'none',
        fontFamily: "var(--font-body, 'Inter','Noto Sans SC',system-ui,-apple-system,sans-serif)",
      }}
    >
      {/* ===== 左侧：当前子系统小 Logo + 全称品牌名（与 Studio 首页同一设计语言） ===== */}
      <a
        href={currentLink.href}
        title={`${brand.main} ${brand.sub}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          textDecoration: 'none',
          flexShrink: 0,
        }}
      >
        <div
          className="studiobar-logo"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: activeProject
              ? `linear-gradient(135deg, ${activeProject.color}, var(--accent-2, #ec4899))`
              : `linear-gradient(135deg, ${currentLink.color}, var(--accent-2, #ec4899))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: activeProject
              ? `0 4px 16px rgba(${previewRgb}, 0.4)`
              : `0 4px 16px rgba(${currentLink.colorRgb}, 0.35)`,
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <NavIcon type={current} color="#fff" size={17} />
        </div>
        <span
          className="studiobar-brand"
          style={{
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '-0.02em',
            color: 'var(--text, #f5f5f7)',
            whiteSpace: 'nowrap',
          }}
        >
          {brand.main} <span style={{ color: 'var(--text-muted, #8888a0)', fontWeight: 400 }}>{brand.sub}</span>
        </span>
      </a>

      {/* ===== 中间：产品矩阵 ===== */}
      <div
        className="studiobar-links"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {LINKS.map((l) => {
          const active = l.id === current;
          const isHovered = hoveredProject?.id === l.id;
          return (
            <a
              key={l.id}
              href={l.href}
              aria-current={active ? 'page' : undefined}
              className="studiobar-link"
              onMouseEnter={() => setHoveredProject(l)}
              onMouseLeave={() => setHoveredProject(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: active ? 600 : 500,
                letterSpacing: '0.01em',
                textDecoration: 'none',
                color: active ? l.color : 'var(--text-muted, #8888a0)',
                background: active
                  ? `rgba(${l.colorRgb}, 0.1)`
                  : isHovered
                    ? `rgba(${l.colorRgb}, 0.06)`
                    : 'color-mix(in srgb, var(--text, #fff) 4%, transparent)',
                border: `1px solid ${active ? `rgba(${l.colorRgb}, 0.35)` : 'var(--border, rgba(128,128,128,0.15))'}`,
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                whiteSpace: 'nowrap',
              }}
            >
              <NavIcon type={l.id} color={active ? l.color : 'currentColor'} size={14} />
              <span>{l.label}</span>
            </a>
          );
        })}
      </div>

      {/* ===== 右侧：应用内快速跳转（可选） ===== */}
      {quickLinks && quickLinks.length > 0 && (
        <div
          className="studiobar-quicklinks"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {quickLinks.map((q) => (
            <a
              key={q.href}
              href={q.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: '100px',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.01em',
                textDecoration: 'none',
                color: 'var(--text-muted, #8888a0)',
                background: 'color-mix(in srgb, var(--text, #fff) 4%, transparent)',
                border: '1px solid var(--border, rgba(128,128,128,0.15))',
                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = currentLink.color;
                e.currentTarget.style.background = `rgba(${currentLink.colorRgb}, 0.1)`;
                e.currentTarget.style.borderColor = `rgba(${currentLink.colorRgb}, 0.35)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted, #8888a0)';
                e.currentTarget.style.background = 'color-mix(in srgb, var(--text, #fff) 4%, transparent)';
                e.currentTarget.style.borderColor = 'var(--border, rgba(128,128,128,0.15))';
              }}
            >
              {q.label}
            </a>
          ))}
        </div>
      )}

      {/* ===== 右侧：主题切换 ===== */}
      <button
        type="button"
        onClick={toggleMode}
        title={mode === 'dark' ? '切换到亮色' : '切换到暗色'}
        aria-label="切换主题"
        className="studiobar-theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          color: 'var(--text-muted, #8888a0)',
          background: 'color-mix(in srgb, var(--text, #fff) 6%, transparent)',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text, #f5f5f7)';
          e.currentTarget.style.background = 'color-mix(in srgb, var(--text, #fff) 12%, transparent)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted, #8888a0)';
          e.currentTarget.style.background = 'color-mix(in srgb, var(--text, #fff) 6%, transparent)';
        }}
      >
        {mode === 'dark' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      <style>{`
        @media (max-width: 1024px) {
          .studiobar-quicklinks { display: none !important; }
        }
        @media (max-width: 768px) {
          .studiobar-brand { display: none !important; }
          .studiobar-nav { padding-left: calc(env(safe-area-inset-left, 0px) + 12px) !important; padding-right: calc(env(safe-area-inset-right, 0px) + 12px) !important; }
          .studiobar-logo {
            width: 40px !important;
            height: 40px !important;
            border-radius: 10px !important;
          }
          .studiobar-logo svg { width: 22px !important; height: 22px !important; }
          .studiobar-links { gap: 8px !important; }
          .studiobar-link {
            padding: 12px 14px !important;
            border-radius: 12px !important;
          }
          .studiobar-link svg { width: 22px !important; height: 22px !important; }
          .studiobar-link span { display: none !important; }
          .studiobar-theme {
            width: 40px !important;
            height: 40px !important;
            border-radius: 10px !important;
          }
          .studiobar-theme svg { width: 22px !important; height: 22px !important; }
        }
      `}</style>
    </nav>
  );
}
