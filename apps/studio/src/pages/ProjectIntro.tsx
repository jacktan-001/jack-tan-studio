import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Lock, Send } from 'lucide-react'
import { ProjectBadge } from '@jack-tan/studio-core'
import { projects, type Project } from '../data/projects'
import { Rise } from '../components/Rise'

function ScreenshotCarousel({ project }: { project: Project }) {
  // 目前用风格化占位图，后续可替换为真实截图
  const slides = useMemo(
    () => [
      { label: '主界面', tone: 1 },
      { label: '核心功能', tone: 0.7 },
      { label: '细节体验', tone: 0.4 },
    ],
    [],
  )

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginTop: '40px',
      }}
    >
      {slides.map((slide, i) => (
        <Rise
          key={slide.label}
          delay={0.5 + i * 0.1}
          style={{
            aspectRatio: '16/10',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            background: `linear-gradient(135deg, rgba(${project.colorRgb}, ${0.04 * slide.tone}) 0%, rgba(${project.colorRgb}, ${0.08 * slide.tone}) 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(rgba(${project.colorRgb}, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(${project.colorRgb}, 0.06) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
              opacity: slide.tone,
            }}
          />
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              padding: '6px 12px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
            }}
          >
            {slide.label}
          </span>
        </Rise>
      ))}
    </div>
  )
}

export default function ProjectIntro() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>
          项目不存在，返回首页
        </Link>
      </div>
    )
  }

  const isLive = project.status === 'live'

  return (
    <main>
    <Rise
      style={{
        minHeight: 'calc(100vh - 130px)',
        padding: '60px 24px 120px',
        maxWidth: '980px',
        margin: '0 auto',
      }}
    >
      {/* 返回链接 */}
      <Rise delay={0.1} style={{ marginBottom: '40px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'color 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft size={16} />
          返回 Studio
        </Link>
      </Rise>

      {/* 项目头图 */}
      <Rise delay={0.15} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
        marginBottom: '48px',
        flexWrap: 'wrap',
      }}>
        <ProjectBadge id={project.icon} color={project.color} colorRgb={project.colorRgb} size={96} radius={26} />
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '100px',
              background: `rgba(${project.colorRgb}, 0.08)`,
              border: `1px solid rgba(${project.colorRgb}, 0.2)`,
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              color: project.color,
              marginBottom: '12px',
            }}
          >
            {isLive ? 'LIVE' : 'COMING SOON'}
            {!isLive && <Lock size={11} />}
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 6vw, 56px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: '10px',
            }}
          >
            {project.name}
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-muted)',
            }}
          >
            {project.tagline}
          </p>
        </div>
      </Rise>

      {/* 描述 */}
      <Rise delay={0.25} style={{
        fontSize: '17px',
        lineHeight: 1.8,
        color: 'var(--text)',
        maxWidth: '760px',
        marginBottom: '40px',
      }}>
        {project.description}
      </Rise>

      {/* 功能特性 */}
      <Rise delay={0.3}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
          }}
        >
          功能特性
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          {project.features.map((feature, i) => (
            <Rise
              key={feature}
              delay={0.35 + i * 0.05}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                color: 'var(--text-muted)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: project.color,
                  boxShadow: `0 0 12px rgba(${project.colorRgb}, 0.5)`,
                }}
              />
              {feature}
            </Rise>
          ))}
        </div>
      </Rise>

      {/* 技术栈 */}
      <Rise delay={0.4} style={{ marginBottom: '48px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '16px',
          }}
        >
          技术栈
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {project.tech.map((t) => (
            <span
              key={t}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </Rise>

      {/* 截图轮播占位 */}
      <Rise delay={0.45}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '8px',
          }}
        >
          界面预览
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
          真实截图将在后续版本替换这些风格化占位图。
        </p>
        <ScreenshotCarousel project={project} />
      </Rise>

      {/* CTA */}
      <Rise delay={0.6} style={{
        marginTop: '60px',
        padding: '36px',
        borderRadius: '20px',
        background: `linear-gradient(135deg, rgba(${project.colorRgb}, 0.08) 0%, rgba(${project.colorRgb}, 0.03) 100%)`,
        border: `1px solid rgba(${project.colorRgb}, 0.2)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            {isLive ? `准备好探索 ${project.name} 了吗？` : '第一时间获取上线通知'}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {isLive
              ? '点击进入子应用，体验完整功能。'
              : '留下邮箱，项目上线时我们会通知你。'}
          </p>
        </div>
        {isLive ? (
          <a
            href={`/projects/${project.id}`}
            onClick={(e) => {
              // 单页壳层：客户端路由进入子应用，不整页跳转、不打断全局播放
              e.preventDefault()
              const go = () => navigate(`/projects/${project.id}`)
              if (typeof document !== 'undefined' && document.startViewTransition) {
                document.startViewTransition(go)
              } else {
                go()
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              borderRadius: '12px',
              background: project.color,
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: `0 8px 32px rgba(${project.colorRgb}, 0.3)`,
              transition: 'all 0.3s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 12px 40px rgba(${project.colorRgb}, 0.4)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 8px 32px rgba(${project.colorRgb}, 0.3)`
            }}
          >
            进入应用 <ArrowRight size={18} />
          </a>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('订阅功能即将上线，敬请期待！')
            }}
            style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
          >
            <label htmlFor="subscribe-email" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>邮箱地址</label>
            <input
              id="subscribe-email"
              type="email"
              placeholder="your@email.com"
              required
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text)',
                fontSize: '14px',
                minWidth: '220px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '10px',
                background: project.color,
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 8px 32px rgba(${project.colorRgb}, 0.3)`,
              }}
            >
              <Send size={16} />
              订阅
            </button>
          </form>
        )}
      </Rise>
    </Rise>
    </main>
  )
}
