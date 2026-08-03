import React, { useState, useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Sun, Moon, Lock, ArrowUpRight } from 'lucide-react'
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
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: scrolled ? '10px 32px' : '14px 32px',
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
                    background: 'color-mix(in srgb, var(--text) 4%, transparent)',
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
          .nav-product-row { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
      `}</style>
    </motion.nav>
  )
}
