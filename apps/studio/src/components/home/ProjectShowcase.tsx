import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Lock } from 'lucide-react'
import { projects, type Project } from '../../data/projects'
import { Rise } from '../Rise'

/** 每个项目的独特视觉风格预览 — 用 CSS 微缩呈现 */
function VisualPreview({ project }: { project: Project }) {
  const isComingSoon = project.status === 'coming-soon'

  const previews: Record<string, ReactNode> = {
    wave: (
      <div className="preview-wave" style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '10px',
        background: 'linear-gradient(180deg, rgba(6,182,212,0.06) 0%, rgba(20,184,166,0.03) 100%)',
      }}>
        {/* SVG 水波纹理 */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isComingSoon ? 0.15 : 0.4 }} viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M0,100 Q100,70 200,100 T400,100" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
          <path d="M0,110 Q100,85 200,110 T400,110" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.3" />
          <path d="M0,120 Q100,100 200,120 T400,120" fill="none" stroke="#0ea5e9" strokeWidth="0.8" opacity="0.2" />
        </svg>
        {/* 底部音频频条 */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '32px' }}>
          {[40, 65, 30, 80, 50, 70, 35, 60, 45, 55, 75, 40, 85, 30, 50, 65, 40, 60, 45, 70].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              background: 'linear-gradient(to top, #06b6d4, transparent)',
              borderRadius: '2px 2px 0 0',
              opacity: isComingSoon ? 0.2 : 0.6,
              animation: `preview-eq 1.2s ease-in-out ${i * 0.08}s infinite`,
            }} />
          ))}
        </div>
      </div>
    ),
    pose: (
      <div className="preview-pose" style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(245,166,35,0.03) 100%)',
      }}>
        {/* 圆点网格 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(236,72,153,0.12) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: isComingSoon ? 0.2 : 0.5,
        }} />
        {/* 有机气泡 */}
        <div style={{
          position: 'absolute', top: '20%', left: '60%',
          width: '60px', height: '60px',
          borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%',
          background: 'rgba(236,72,153,0.1)',
          filter: 'blur(20px)',
          opacity: isComingSoon ? 0.1 : 0.4,
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '20%',
          width: '50px', height: '50px',
          borderRadius: '63% 37% 41% 59% / 44% 56% 44% 56%',
          background: 'rgba(245,166,35,0.1)',
          filter: 'blur(15px)',
          opacity: isComingSoon ? 0.1 : 0.3,
        }} />
      </div>
    ),
    profile: (
      <div className="preview-tan" style={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '10px',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.04) 0%, rgba(91,123,213,0.02) 100%)',
      }}>
        {/* 135 度斜线 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(124,58,237,0.1) 0, rgba(124,58,237,0.1) 1px, transparent 1px, transparent 12px)',
          opacity: isComingSoon ? 0.15 : 0.35,
        }} />
        {/* 几何方格 */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: isComingSoon ? 0.1 : 0.25,
        }} />
      </div>
    ),
    lens: (
      <div style={{
        position: 'relative', height: '100%', width: '100%',
        overflow: 'hidden', borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(99,102,241,0.03) 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: isComingSoon ? 0.1 : 0.3,
        }} />
      </div>
    ),
    cast: (
      <div style={{
        position: 'relative', height: '100%', width: '100%',
        overflow: 'hidden', borderRadius: '10px',
        background: 'linear-gradient(180deg, rgba(245,158,11,0.06) 0%, rgba(217,70,239,0.03) 100%)',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: isComingSoon ? 0.12 : 0.3 }} viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M0,100 Q50,60 100,100 T200,100 T300,100 T400,100" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M0,100 Q50,140 100,100 T200,100 T300,100 T400,100" fill="none" stroke="#d946ef" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    ),
    craft: (
      <div style={{
        position: 'relative', height: '100%', width: '100%',
        overflow: 'hidden', borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(34,211,238,0.03) 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: isComingSoon ? 0.1 : 0.3,
        }} />
      </div>
    ),
  }

  return previews[project.id] || null
}

/** 风格标签 */
function StyleBadge({ project }: { project: Project }) {
  const styles: Record<string, string> = {
    wave: '流动 · 律动',
    pose: '温暖 · 手工感',
    profile: '沉稳 · 精致',
    lens: '数据 · 洞察',
    cast: '声音 · 叙事',
    craft: '创意 · 实验',
  }
  const label = styles[project.id] || ''
  if (!label) return null

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 8px',
      borderRadius: '4px',
      background: `rgba(${project.colorRgb}, 0.08)`,
      border: `1px solid rgba(${project.colorRgb}, 0.15)`,
      fontSize: '10px',
      fontFamily: 'var(--font-mono)',
      color: project.color,
      fontWeight: 500,
      letterSpacing: '0.02em',
    }}>
      {label}
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const isComingSoon = project.status === 'coming-soon'

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || isComingSoon) return
    const rect = ref.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <Rise delay={index * 0.1}>
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        style={{
          position: 'relative',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          transition: 'border-color 0.4s, transform 0.4s',
          cursor: isComingSoon ? 'default' : 'pointer',
          ...(isComingSoon
            ? { opacity: 0.5, filter: 'grayscale(0.6)' }
            : {}),
        }}
      onMouseEnter={(e) => {
        if (isComingSoon) return
        e.currentTarget.style.borderColor = `rgba(${project.colorRgb}, 0.4)`
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={(e) => {
        if (isComingSoon) return
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Spotlight effect */}
      {!isComingSoon && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle 200px at ${mousePos.x}px ${mousePos.y}px, rgba(${project.colorRgb}, 0.12), transparent 70%)`,
            opacity: 0,
            transition: 'opacity 0.4s',
            pointerEvents: 'none',
          }}
          className="card-spotlight"
        />
      )}

      {/* Gradient bar */}
      <div style={{
        height: '3px',
        background: isComingSoon
          ? 'linear-gradient(90deg, var(--text-dim), transparent)'
          : `linear-gradient(90deg, ${project.color}, transparent)`,
      }} />

      {/* Coming soon badge */}
      {isComingSoon && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '6px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid var(--border)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-dim)',
          zIndex: 2,
          backdropFilter: 'blur(8px)',
        }}>
          <Lock size={10} />
          即将上线
        </div>
      )}

      <div style={{ padding: '28px' }}>
        {/* Icon + Style Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `rgba(${project.colorRgb}, ${isComingSoon ? 0.05 : 0.1})`,
            border: `1px solid rgba(${project.colorRgb}, ${isComingSoon ? 0.1 : 0.2})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ProjectIcon type={project.icon} color={project.color} />
          </div>
          <StyleBadge project={project} />
        </div>

        {/* Name & tagline */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '10px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}>{project.name}</h3>
          <span style={{
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
          }}>· {project.tagline}</span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '13px',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: '16px',
        }}>{project.description}</p>

        {/* Visual Preview — 展示每个项目的独特视觉风格 */}
        <div style={{
          height: '80px',
          marginBottom: '20px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          <VisualPreview project={project} />
        </div>

        {/* Tech badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '20px' }}>
          {project.tech.slice(0, 4).map((t) => (
            <span key={t} style={{
              padding: '3px 8px',
              borderRadius: '5px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isComingSoon ? (
            <>
              {/* 查看介绍页 */}
              <Link
                to={`/projects/${project.id}/intro`}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: `rgba(${project.colorRgb}, 0.1)`,
                  color: project.color,
                  fontSize: '13px',
                  fontWeight: 600,
                  border: `1px solid rgba(${project.colorRgb}, 0.2)`,
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.2)`
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.1)`
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                查看介绍 <ArrowUpRight size={14} />
              </Link>
              {/* 直接跳转到外部站点 */}
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                title="直接访问子应用"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                访问
              </a>
              {project.repo && (
                <a
                  href={`https://github.com/${project.repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.3s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.color = 'var(--text)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }}
                >
                  Code
                </a>
              )}
            </>
          ) : (
            <Link
              to={`/projects/${project.id}/intro`}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px dashed var(--border)',
                color: 'var(--text-dim)',
                fontSize: '13px',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.color = 'var(--text-dim)'
              }}
            >
              <Lock size={14} />
              敬请期待
            </Link>
          )}
        </div>
      </div>

      <style>{`
        .card-spotlight:hover { opacity: 1 !important; }
        @keyframes preview-eq {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      </div>
    </Rise>
  )
}

function ProjectIcon({ type, color }: { type: string; color: string }) {
  const icons: Record<string, ReactNode> = {
    wave: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M2 12 Q6 6, 10 12 T18 12 T22 12" />
        <path d="M2 16 Q6 10, 10 16 T18 16 T22 16" opacity="0.5" />
      </svg>
    ),
    pose: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9 L21 9 M9 3 L9 21" opacity="0.5" />
        <circle cx="15" cy="15" r="2" />
      </svg>
    ),
    profile: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 Q4 14, 12 14 T20 21" />
      </svg>
    ),
    lens: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M11 8 A3 3 0 0 1 14 11" opacity="0.6" />
        <path d="M21 21 L16 16" />
      </svg>
    ),
    cast: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11 Q5 18, 12 18 Q19 18, 19 11" opacity="0.6" />
        <path d="M12 18 L12 21" />
      </svg>
    ),
    craft: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        <path d="M12 6 L18 12 L12 18 L6 12 Z" opacity="0.5" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  }
  return icons[type] || null
}

export default function ProjectShowcase() {
  return (
    <section style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '80px 24px',
    }}>
      <Rise style={{ marginBottom: '48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          marginBottom: '16px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          06 · PROJECTS
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          marginBottom: '12px',
        }}>
          三个已上线，<span className="gradient-text">三个在路上</span>
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          maxWidth: '560px',
          lineHeight: 1.7,
        }}>
          从音乐随记到社媒排版，再到个人作品集 —— 每一个作品都是独立的创意。Jack Lens、Jack Cast、JackCraft 正在路上。
        </p>
      </Rise>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
