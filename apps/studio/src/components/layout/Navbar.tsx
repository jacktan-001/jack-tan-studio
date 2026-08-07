import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Sun, Moon, Lock } from 'lucide-react'
import { useTheme, ProjectGlyph } from '@jack-tan/studio-core'
import { projects, type Project } from '../../data/projects'

function ProductChip({
  project,
  isActive,
  onHover,
  onLeave,
}: {
  project: Project
  isActive: boolean
  onHover: (project: Project | null) => void
  onLeave: () => void
}) {
  const navigate = useNavigate()
  const isLive = project.status === 'live'
  // 单页壳层：所有项目一律走外壳路由 /projects/{id}
  // （project.url 是独立部署路径 /projects/jack-xxx/，与外壳路由不匹配，
  //  客户端 navigate 过去会被 * 兜底跳回首页）
  const href = `/projects/${project.id}`

  const handleClick = (e: React.MouseEvent) => {
    // 所有项目链接走客户端路由，避免整页刷新打断全局播放
    e.preventDefault()
    const go = () => navigate(href)
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(go)
    } else {
      go()
    }
  }

  return (
    <a
      key={project.id}
      href={href}
      onClick={handleClick}
      onMouseEnter={() => onHover(project)}
      onMouseLeave={onLeave}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 14px',
        borderRadius: '100px',
        fontSize: '13px',
        fontWeight: 500,
        color: isActive ? project.color : 'var(--text-muted)',
        background: isActive ? `rgba(${project.colorRgb}, 0.1)` : 'color-mix(in srgb, var(--text) 4%, transparent)',
        border: `1px solid ${isActive ? `rgba(${project.colorRgb}, 0.35)` : 'var(--border)'}`,
        opacity: isLive ? 1 : 0.55,
        cursor: isLive ? 'pointer' : 'default',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        whiteSpace: 'nowrap',
      }}
      onMouseMove={(e) => {
        if (!isActive) return
        e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.14)`
        e.currentTarget.style.boxShadow = `0 4px 20px rgba(${project.colorRgb}, 0.15)`
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = isActive ? `rgba(${project.colorRgb}, 0.1)` : 'color-mix(in srgb, var(--text) 4%, transparent)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <ProjectGlyph id={project.icon} color={isActive ? project.color : 'currentColor'} size={16} />
      <span>{project.name}</span>
      {!isLive && <Lock size={12} style={{ opacity: 0.7 }} />}
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleMode } = useTheme()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const activeProject = hoveredProject
  const previewRgb = activeProject ? activeProject.colorRgb : '124, 58, 237'

  return (
    <nav
      className="studio-navbar studio-nav-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scrolled
          ? 'calc(env(safe-area-inset-top, 0px) + 10px) calc(env(safe-area-inset-right, 0px) + 32px) calc(env(safe-area-inset-bottom, 0px) + 10px) calc(env(safe-area-inset-left, 0px) + 32px)'
          : 'calc(env(safe-area-inset-top, 0px) + 14px) calc(env(safe-area-inset-right, 0px) + 32px) calc(env(safe-area-inset-bottom, 0px) + 14px) calc(env(safe-area-inset-left, 0px) + 32px)',
        background: scrolled ? 'color-mix(in srgb, var(--bg) 88%, transparent)' : 'color-mix(in srgb, var(--bg) 40%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        boxShadow: activeProject
          ? `inset 0 -1px 0 0 rgba(${previewRgb}, 0.25), 0 8px 40px rgba(${previewRgb}, 0.08)`
          : 'none',
      }}
    >
      {/* ===== 左侧：Logo ===== */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <img
          src="/logo-192.png"
          alt=""
          width={36}
          height={36}
          className="nav-brand-mark"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            objectFit: 'cover',
            boxShadow: activeProject
              ? `0 4px 20px rgba(${previewRgb}, 0.4)`
              : '0 4px 20px rgba(124, 58, 237, 0.4)',
            transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: '18px',
            letterSpacing: '-0.02em',
          }}
        >
          Jack Tan <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Studio</span>
        </span>
      </Link>

      {/* ===== 中间：产品矩阵 ===== */}
      <div
        className="nav-product-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        {projects.map((p) => (
          <ProductChip
            key={p.id}
            project={p}
            isActive={hoveredProject?.id === p.id}
            onHover={setHoveredProject}
            onLeave={() => setHoveredProject(null)}
          />
        ))}
      </div>

      {/* ===== 右侧：主题切换 + 移动端菜单 ===== */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={toggleMode}
          aria-label="切换主题"
          title="切换主题"
          className="nav-theme-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            color: 'var(--text-muted)',
            background: 'color-mix(in srgb, var(--text) 6%, transparent)',
            transition: 'all 0.3s',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text)'
            e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 12%, transparent)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 6%, transparent)'
          }}
        >
          {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: '8px',
            background: 'color-mix(in srgb, var(--text) 6%, transparent)',
            color: 'var(--text)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ===== 移动端菜单 ===== */}
      {menuOpen && (
        <div
          className="nav-mobile-menu studio-menu-in"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'color-mix(in srgb, var(--bg) 95%, transparent)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
            <div style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              PROJECTS
            </div>
            {projects.map((p) => {
              const isLive = p.status === 'live'
              return (
                <a
                  key={p.id}
                  href={`/projects/${p.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const go = () => navigate(`/projects/${p.id}`)
                    if (typeof document !== 'undefined' && document.startViewTransition) {
                      document.startViewTransition(go)
                    } else {
                      go()
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'color-mix(in srgb, var(--text) 4%, transparent)',
                    fontSize: '15px',
                    color: 'var(--text)',
                    opacity: isLive ? 1 : 0.6,
                    textDecoration: 'none',
                  }}
                >
                  <ProjectGlyph id={p.icon} color={p.color} size={20} />
                  <span>{p.name}</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: 'auto', fontSize: '12px' }}>{p.tagline}</span>
                  {!isLive && <Lock size={14} style={{ color: 'var(--text-dim)' }} />}
                </a>
              )
            })}
          </div>
        )}

      <style>{`
        .studio-navbar {
          view-transition-name: studio-navbar;
        }
        @media (max-width: 768px) {
          .nav-product-row { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
        `}</style>
    </nav>
  )
}
