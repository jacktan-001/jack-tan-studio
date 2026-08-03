import React, { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Sun, Moon, Home, User, Github, Lock, ArrowUpRight } from 'lucide-react'
import { useTheme, setPendingProject, navigateWithTransition } from '@jack-tan/studio-core'
import { projects, type Project } from '../../data/projects'

/** 项目小图标 */
function ProjectIcon({ type, color, size = 18 }: { type: string; color: string; size?: number }) {
  const icons: Record<string, ReactNode> = {
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
    profile: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 Q4 14, 12 14 T20 21" />
      </svg>
    ),
    lens: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M11 8 A3 3 0 0 1 14 11" opacity="0.6" />
        <path d="M21 21 L16 16" />
      </svg>
    ),
    cast: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11 Q5 18, 12 18 Q19 18, 19 11" opacity="0.6" />
        <path d="M12 18 L12 21" />
      </svg>
    ),
    craft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        <path d="M12 6 L18 12 L12 18 L6 12 Z" opacity="0.5" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  }
  return icons[type] || null
}

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
  const isLive = project.status === 'live'
  const href = isLive ? project.url : `/projects/${project.id}`
  const isExternal = href.startsWith('http') || href.startsWith('/projects/jack-')

  const handleClick = (e: React.MouseEvent) => {
    if (isExternal) {
      e.preventDefault()
      setPendingProject(project.id)
      navigateWithTransition(href)
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
        background: isActive ? `rgba(${project.colorRgb}, 0.1)` : 'rgba(255,255,255,0.03)',
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
        e.currentTarget.style.background = isActive ? `rgba(${project.colorRgb}, 0.1)` : 'rgba(255,255,255,0.03)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <ProjectIcon type={project.icon} color={isActive ? project.color : 'currentColor'} size={16} />
      <span>{project.name}</span>
      {!isLive && <Lock size={12} style={{ opacity: 0.7 }} />}
      {isLive && isExternal && <ArrowUpRight size={12} style={{ opacity: 0.7 }} />}
    </a>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null)
  const location = useLocation()
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
  const previewColor = activeProject ? activeProject.color : 'var(--accent)'

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="studio-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        padding: scrolled ? '10px 0 8px' : '14px 0 12px',
        background: scrolled ? 'rgba(6, 6, 10, 0.85)' : 'rgba(6, 6, 10, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        // 主题色预览：悬停项目时，Navbar 边框和背景微染目标项目色
        boxShadow: activeProject
          ? `inset 0 -1px 0 0 rgba(${previewRgb}, 0.25), 0 8px 40px rgba(${previewRgb}, 0.08)`
          : 'none',
      }}
    >
      {/* ===== 上层：全局导航 ===== */}
      <div
        className="nav-top-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          marginBottom: '10px',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            className="nav-brand-mark"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: activeProject
                ? `linear-gradient(135deg, ${previewColor}, var(--accent-2))`
                : 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '18px',
              color: 'white',
              boxShadow: activeProject
                ? `0 4px 20px rgba(${previewRgb}, 0.4)`
                : '0 4px 20px rgba(124, 58, 237, 0.4)',
              transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            JT
          </div>
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="nav-global-links">
          <GlobalLink to="/" icon={<Home size={16} />} label="首页" />
          <GlobalLink to="/#about" icon={<User size={16} />} label="关于" />
          <GlobalLink href="https://github.com/jacktan-001" icon={<Github size={16} />} label="GitHub" external />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={toggleMode}
            aria-label="切换主题"
            title="切换主题"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.06)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
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
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text)',
            }}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ===== 下层：产品矩阵 ===== */}
      <div
        className="nav-product-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '0 32px',
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

      {/* ===== 移动端菜单 ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="nav-mobile-menu"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'rgba(6, 6, 10, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              GLOBAL
            </div>
            <MobileLink to="/" label="首页" />
            <MobileLink to="/#about" label="关于" />
            <MobileLink href="https://github.com/jacktan-001" label="GitHub" external />

            <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />

            <div style={{ color: 'var(--text-dim)', fontSize: '11px', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
              PROJECTS
            </div>
            {projects.map((p) => {
              const isLive = p.status === 'live'
              return (
                <a
                  key={p.id}
                  href={isLive ? p.url : `/projects/${p.id}`}
                  onClick={(e) => {
                    if (isLive) {
                      e.preventDefault()
                      setPendingProject(p.id)
                      navigateWithTransition(p.url)
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    fontSize: '15px',
                    color: 'var(--text)',
                    opacity: isLive ? 1 : 0.6,
                    textDecoration: 'none',
                  }}
                >
                  <ProjectIcon type={p.icon} color={p.color} size={20} />
                  <span>{p.name}</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: 'auto', fontSize: '12px' }}>{p.tagline}</span>
                  {!isLive && <Lock size={14} style={{ color: 'var(--text-dim)' }} />}
                </a>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .studio-navbar {
          view-transition-name: studio-navbar;
        }
        @media (max-width: 768px) {
          .nav-global-links { display: none !important; }
          .nav-product-row { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
          .nav-top-row { margin-bottom: 0 !important; }
        }
      `}</style>
    </motion.nav>
  )
}

function GlobalLink({
  to,
  href,
  icon,
  label,
  external,
}: {
  to?: string
  href?: string
  icon: ReactNode
  label: string
  external?: boolean
}) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'all 0.3s',
  }

  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  )

  if (external && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={baseStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.background = 'transparent'
        }}
      >
        {content}
      </a>
    )
  }

  return (
    <Link
      to={to || href || '/'}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text)'
        e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)'
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {content}
    </Link>
  )
}

function MobileLink({ to, href, label, external }: { to?: string; href?: string; label: string; external?: boolean }) {
  if (external && href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          color: 'var(--text)',
          textDecoration: 'none',
        }}
      >
        {label}
      </a>
    )
  }
  return (
    <Link
      to={to || href || '/'}
      style={{
        padding: '12px 16px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--text)',
        textDecoration: 'none',
      }}
    >
      {label}
    </Link>
  )
}
