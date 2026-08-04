import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Clock } from 'lucide-react'
import type { Project } from '../data/projects'
import { Rise } from '../components/Rise'

interface ComingSoonProps {
  project: Project
}

export default function ComingSoon({ project }: ComingSoonProps) {
  return (
    <Rise
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 24px 80px',
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: '720px',
          width: '100%',
          padding: '56px',
          borderRadius: '24px',
          textAlign: 'center',
          border: '1px solid var(--border)',
          background: 'var(--bg-glass)',
        }}
      >
        {/* 项目标识 */}
        <Rise delay={0.1} style={{
          width: '80px',
          height: '80px',
          borderRadius: '22px',
          background: `linear-gradient(135deg, ${project.color}, ${project.color}66)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: `0 8px 40px rgba(${project.colorRgb}, 0.25)`,
        }}>
          <ProjectIcon name={project.icon} color="#fff" />
        </Rise>

        {/* 状态标签 */}
        <Rise delay={0.2} style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '100px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          marginBottom: '24px',
        }}>
          <Clock size={12} />
          COMING SOON
        </Rise>

        {/* 标题 */}
        <Rise delay={0.25}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            marginBottom: '12px',
            lineHeight: 1.1,
          }}>
            {project.name}
          </h1>
        </Rise>

        <Rise delay={0.3} style={{
          fontSize: '18px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
        }}>
          {project.tagline}
        </Rise>

        <Rise delay={0.35} style={{
          fontSize: '15px',
          color: 'var(--text-dim)',
          lineHeight: 1.7,
          maxWidth: '520px',
          margin: '0 auto 40px',
        }}>
          {project.description}
        </Rise>

        {/* 特性预览 */}
        {project.features.length > 0 && (
          <Rise delay={0.4} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '48px',
          }}>
            {project.features.map((feature) => (
              <span
                key={feature}
                style={{
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                }}
              >
                {feature}
              </span>
            ))}
          </Rise>
        )}

        {/* 返回首页 */}
        <Rise delay={0.45}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 58, 237, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.3)'
            }}
          >
            <ArrowLeft size={18} />
            返回 Studio 首页
          </Link>
        </Rise>
      </div>
    </Rise>
  )
}

function ProjectIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, React.ReactNode> = {
    wave: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10v3" /><path d="M6 6v11" /><path d="M10 3v18" /><path d="M14 8v7" /><path d="M18 5v13" /><path d="M22 10v3" />
      </svg>
    ),
    pose: <Sparkles size={36} color={color} />,
    profile: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    lens: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
      </svg>
    ),
    cast: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" /><path d="M2 12a9 9 0 0 1 8 8" /><path d="M2 16a5 5 0 0 1 4 4" /><line x1="2" y1="20" x2="2.01" y2="20" />
      </svg>
    ),
    craft: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    ),
  }

  return icons[name] || <Sparkles size={36} color={color} />
}
