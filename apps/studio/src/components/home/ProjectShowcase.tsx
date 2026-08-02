import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, ExternalLink } from 'lucide-react'
import { projects, type Project } from '../../data/projects'

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        transition: 'border-color 0.4s',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(${project.colorRgb}, 0.4)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      {/* Spotlight effect */}
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

      {/* Gradient bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, ${project.color}, transparent)`,
      }} />

      <div style={{ padding: '32px' }}>
        {/* Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: `rgba(${project.colorRgb}, 0.1)`,
          border: `1px solid rgba(${project.colorRgb}, 0.2)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <ProjectIcon type={project.icon} color={project.color} />
        </div>

        {/* Name & tagline */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
          }}>{project.name}</h3>
          <span style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
          }}>· {project.tagline}</span>
        </div>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          marginBottom: '24px',
        }}>{project.description}</p>

        {/* Tech badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
          {project.tech.map((t) => (
            <span key={t} style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '8px',
          marginBottom: '28px',
        }}>
          {project.features.map((f) => (
            <div key={f} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}>
              <div style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: project.color,
              }} />
              {f}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to={`/project/${project.id}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: `rgba(${project.colorRgb}, 0.1)`,
              color: project.color,
              fontSize: '13px',
              fontWeight: 600,
              border: `1px solid rgba(${project.colorRgb}, 0.2)`,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.2)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.1)`
            }}
          >
            进入 <ArrowUpRight size={14} />
          </Link>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.3s',
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
            访问 <ExternalLink size={14} />
          </a>
        </div>
      </div>

      <style>{`
        .card-spotlight:hover { opacity: 1 !important; }
      `}</style>
    </motion.div>
  )
}

function ProjectIcon({ type, color }: { type: string; color: string }) {
  const icons: Record<string, ReactNode> = {
    wave: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M2 12 Q6 6, 10 12 T18 12 T22 12" />
        <path d="M2 16 Q6 10, 10 16 T18 16 T22 16" opacity="0.5" />
      </svg>
    ),
    pose: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9 L21 9 M9 3 L9 21" opacity="0.5" />
        <circle cx="15" cy="15" r="2" />
      </svg>
    ),
    profile: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 Q4 14, 12 14 T20 21" />
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
      padding: '120px 24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: '60px' }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          marginBottom: '20px',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          03 · PROJECTS
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5vw, 56px)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          marginBottom: '16px',
        }}>
          三个作品，<span className="gradient-text">一个生态</span>
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-muted)',
          maxWidth: '560px',
          lineHeight: 1.7,
        }}>
          从音乐随记到社媒排版，再到个人作品集 —— 每一个作品都是独立的创意，也是 Jack Tan Studio 的一部分。
        </p>
      </motion.div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '24px',
      }}>
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
