import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { projects, type Project } from '../../data/projects'
import { Rise } from '../Rise'

/** 每个项目的独特视觉风格预览 — 用 CSS 微缩呈现 */
function VisualPreview({ project }: { project: Project }) {
  const previews: Record<string, ReactNode> = {
    cast: (
      <div style={{
        position: 'relative', height: '100%', width: '100%',
        overflow: 'hidden', borderRadius: '10px',
        background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, rgba(217,70,239,0.04) 100%)',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }} viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M0,100 Q50,60 100,100 T200,100 T300,100 T400,100" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
          <path d="M0,100 Q50,140 100,100 T200,100 T300,100 T400,100" fill="none" stroke="#d946ef" strokeWidth="1" opacity="0.5" />
        </svg>
        {/* 底部音频频条 */}
        <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px', display: 'flex', gap: '4px', alignItems: 'flex-end', height: '34px' }}>
          {[40, 65, 30, 80, 50, 70, 35, 60, 45, 55, 75, 40, 85, 30, 50, 65, 40, 60].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              background: 'linear-gradient(to top, #f59e0b, transparent)',
              borderRadius: '2px 2px 0 0',
              opacity: 0.55,
              animation: `preview-eq 1.2s ease-in-out ${i * 0.07}s infinite`,
            }} />
          ))}
        </div>
      </div>
    ),
    craft: (
      <div style={{
        position: 'relative', height: '100%', width: '100%',
        overflow: 'hidden', borderRadius: '10px',
        background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(34,211,238,0.04) 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(16,185,129,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.09) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: 0.4,
        }} />
        <div style={{
          position: 'absolute', top: '18%', left: '58%',
          width: '64px', height: '64px',
          borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%',
          background: 'rgba(16,185,129,0.14)',
          filter: 'blur(18px)',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute', bottom: '16%', left: '18%',
          width: '46px', height: '46px',
          borderRadius: '63% 37% 41% 59% / 44% 56% 44% 56%',
          background: 'rgba(34,211,238,0.14)',
          filter: 'blur(14px)',
          opacity: 0.4,
        }} />
      </div>
    ),
  }
  return previews[project.id] || null
}

function ProjectIcon({ type, color, size = 26 }: { type: string; color: string; size?: number }) {
  const icons: Record<string, ReactNode> = {
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

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-dim)',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function ComingSoonCard({ project, index }: { project: Project; index: number }) {
  return (
    <Rise delay={index * 0.12} style={{ height: '100%' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        transition: 'border-color 0.4s, transform 0.4s, box-shadow 0.4s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(${project.colorRgb}, 0.45)`
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 18px 50px -18px rgba(${project.colorRgb}, 0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Gradient bar */}
      <div style={{
        height: '3px',
        background: `linear-gradient(90deg, ${project.color}, transparent)`,
      }} />

      {/* 即将上线 badge */}
      <div style={{
        position: 'absolute',
        top: '18px',
        right: '18px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        borderRadius: '100px',
        background: `rgba(${project.colorRgb}, 0.1)`,
        border: `1px solid rgba(${project.colorRgb}, 0.3)`,
        fontSize: '11px',
        fontFamily: 'var(--font-mono)',
        color: project.color,
        fontWeight: 600,
        zIndex: 2,
        backdropFilter: 'blur(8px)',
      }}>
        <Lock size={11} />
        即将上线
      </div>

      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Icon + Name + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            flexShrink: 0,
            borderRadius: '14px',
            background: `rgba(${project.colorRgb}, 0.1)`,
            border: `1px solid rgba(${project.colorRgb}, 0.25)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ProjectIcon type={project.icon} color={project.color} />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '26px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>{project.name}</h3>
            <div style={{
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              marginTop: '4px',
            }}>{project.tagline}</div>
          </div>
        </div>

        {/* 功能定位 */}
        {project.positioning && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '6px',
            background: `rgba(${project.colorRgb}, 0.08)`,
            border: `1px solid rgba(${project.colorRgb}, 0.18)`,
            fontSize: '12px',
            color: project.color,
            fontWeight: 500,
            marginBottom: '18px',
          }}>
            {project.positioning}
          </div>
        )}

        {/* 简要描述 */}
        <p style={{
          fontSize: '14px',
          color: 'var(--text-muted)',
          lineHeight: 1.75,
          marginBottom: '22px',
        }}>{project.description}</p>

        {/* Visual preview */}
        <div style={{
          height: '96px',
          marginBottom: '24px',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          <VisualPreview project={project} />
        </div>

        {/* 特色亮点 */}
        <div style={{ marginBottom: '26px' }}>
          <FieldLabel>特色亮点</FieldLabel>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px 16px',
          }}>
            {project.features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: project.color,
                  marginTop: '7px',
                  flexShrink: 0,
                  boxShadow: `0 0 8px rgba(${project.colorRgb}, 0.6)`,
                }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 技术栈 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
          {project.tech.map((t) => (
            <span key={t} style={{
              padding: '4px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 'auto',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed var(--border)',
          color: 'var(--text-dim)',
          fontSize: '13px',
          fontWeight: 500,
        }}>
          <Lock size={14} />
          正在开发中 · 敬请期待
        </div>
      </div>

      <style>{`
        @keyframes preview-eq {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
      </div>
    </Rise>
  )
}

export default function ProjectShowcase() {
  const upcoming = projects.filter((p) => p.status === 'coming-soon')

  return (
    <section style={{
      maxWidth: '1080px',
      margin: '0 auto',
      padding: '80px 24px',
    }}>
      <Rise style={{ marginBottom: '48px', textAlign: 'center' }}>
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
          {String(upcoming.length).padStart(2, '0')} · COMING SOON
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          marginBottom: '12px',
        }}>
          两件新作品，<span className="gradient-text">正在路上</span>
        </h2>
        <p style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.75,
        }}>
          在已上线的 Jack Wave、Jack Pose、Jack Tan 之外，Jack Tan Studio 正在孵化两个新创意项目 ——
          用声音讲故事的 Jack Cast，与探索生成式美学的 Jack Craft。
        </p>
      </Rise>

      <div className="upcoming-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {upcoming.map((p, i) => (
          <ComingSoonCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
