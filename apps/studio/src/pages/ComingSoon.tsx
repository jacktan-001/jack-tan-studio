import { Link } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { ProjectBadge } from '@jack-tan/studio-core'
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
        {/* 项目标识（统一徽标） */}
        <Rise delay={0.1} style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 28px' }}>
          <ProjectBadge id={project.icon} color={project.color} colorRgb={project.colorRgb} size={80} radius={22} />
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
