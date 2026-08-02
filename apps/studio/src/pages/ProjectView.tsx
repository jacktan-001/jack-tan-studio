import { useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ExternalLink, Code2 } from 'lucide-react'
import { useState } from 'react'
import { projects } from '../data/projects'

export default function ProjectView() {
  const { id } = useParams()
  const project = projects.find((p) => p.id === id)
  const [loaded, setLoaded] = useState(false)

  if (!project) {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>项目未找到</p>
        <Link to="/" style={{ color: 'var(--accent)', marginTop: '16px', display: 'inline-block' }}>
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      style={{ minHeight: '100vh' }}
    >
      {/* Header bar */}
      <div style={{
        position: 'sticky',
        top: '70px',
        zIndex: 100,
        padding: '16px 24px',
        background: 'rgba(6, 6, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <ArrowLeft size={14} /> 返回
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: project.color,
              boxShadow: `0 0 12px ${project.color}`,
            }} />
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 600,
            }}>{project.name}</span>
            <span style={{
              fontSize: '13px',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
            }}>· {project.tagline}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <a
            href={`https://github.com/${project.repo}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            <Code2 size={14} /> Code
          </a>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: `rgba(${project.colorRgb}, 0.1)`,
              border: `1px solid rgba(${project.colorRgb}, 0.2)`,
              fontSize: '13px',
              fontWeight: 500,
              color: project.color,
            }}
          >
            <ExternalLink size={14} /> 新窗口打开
          </a>
        </div>
      </div>

      {/* iframe container */}
      <div style={{
        position: 'relative',
        height: 'calc(100vh - 120px)',
        width: '100%',
      }}>
        {!loaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            background: 'var(--bg)',
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--border)',
                borderTopColor: project.color,
                borderRadius: '50%',
              }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
              Loading {project.name}...
            </p>
          </div>
        )}
        <iframe
          src={project.url}
          title={project.name}
          onLoad={() => setLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s',
            background: 'white',
          }}
        />
      </div>
    </motion.div>
  )
}
