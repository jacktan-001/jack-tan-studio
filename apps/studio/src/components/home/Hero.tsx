import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, Sparkles } from 'lucide-react'
import { setPendingProject, navigateWithTransition } from '@jack-tan/studio-core'

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <motion.section
      ref={ref}
      style={{ y, opacity, scale }}
      className="hero-section"
    >
      {/* Floating orbs */}
      <motion.div
        animate={{
          x: mousePos.x,
          y: mousePos.y,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{
          position: 'absolute',
          top: '15%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <motion.div
        animate={{
          x: -mousePos.x,
          y: -mousePos.y,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ textAlign: 'center', maxWidth: '900px', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '100px',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            marginBottom: '32px',
            fontSize: '13px',
            color: 'var(--accent)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <Sparkles size={14} />
          2026 · Creative Studio
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 10vw, 120px)',
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
            marginBottom: '24px',
          }}
        >
          <span className="gradient-text">Jack Tan</span>
          <br />
          <span style={{
            fontWeight: 200,
            color: 'var(--text-muted)',
            fontSize: 'clamp(32px, 6vw, 72px)',
          }}>Studio</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto 40px',
          }}
        >
          创意工作室 · 汇集音乐随记、社媒排版、个人作品集于一体。
          <br />
          以技术驱动创意，以动效诠释体验。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <a
            href="/projects/jack-wave/intro"
            data-cursor-hover
            onClick={(e) => {
              e.preventDefault()
              setPendingProject('wave')
              navigateWithTransition('/projects/jack-wave/intro')
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              color: 'white',
              fontWeight: 600,
              fontSize: '15px',
              boxShadow: '0 8px 30px rgba(124, 58, 237, 0.4)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 58, 237, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(124, 58, 237, 0.4)'
            }}
          >
            探索作品
          </a>
          <a
            href="https://github.com/jacktan-001"
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-hover
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 32px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontWeight: 500,
              fontSize: '15px',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.borderColor = 'var(--border-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            GitHub
          </a>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-dim)',
        }}
      >
        <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>SCROLL</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>

      <style>{`
        .hero-section {
          min-height: calc(100vh - 130px);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 120px 0 80px;
        }
      `}</style>
    </motion.section>
  )
}
