import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, Sparkles } from 'lucide-react'
import { socialLinks } from '../../data/projects'
import { socialIcons } from '../icons/SocialIcons'

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [gridOrigin, setGridOrigin] = useState({ x: 50, y: 50 })

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5
      const y = e.clientY / window.innerHeight - 0.5
      setMousePos({ x: x * 30, y: y * 30 })
      setGridOrigin({
        x: 50 + x * 35,
        y: 50 + y * 35,
      })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.style.setProperty('--mouse-x', `${gridOrigin.x}%`)
      gridRef.current.style.setProperty('--mouse-y', `${gridOrigin.y}%`)
    }
  }, [gridOrigin])

  return (
    <motion.section
      ref={ref}
      style={{ y, opacity, scale }}
      className="hero-section"
    >
      {/* 呼吸网格背景：随鼠标位置微变透明度与径向中心 */}
      <div
        ref={gridRef}
        className="hero-breath-grid"
        aria-hidden="true"
        style={{
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties}
      />

      {/* 标题后方科技扫描光带 */}
      <div className="hero-scan-beam" aria-hidden="true" />

      {/* Floating orbs */}
      <motion.div
        animate={{ x: mousePos.x, y: mousePos.y }}
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
        animate={{ x: -mousePos.x, y: -mousePos.y }}
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

      <div style={{ textAlign: 'center', maxWidth: '900px', padding: '0 24px', position: 'relative', zIndex: 1 }}>
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
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="hero-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(42px, 9vw, 108px)',
            fontWeight: 100,
            lineHeight: 1.05,
            letterSpacing: '-0.04em',
            marginBottom: '28px',
          }}
        >
          <span style={{ color: 'var(--text)', fontWeight: 100 }}>Jack Tan </span>
          <span className="gradient-text studio-neon-text hero-studio-accent" style={{ fontWeight: 100 }}>
            Studio
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="hero-poetic-text"
          style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'var(--text-muted)',
            lineHeight: 1.85,
            maxWidth: '620px',
            margin: '0 auto 44px',
            fontWeight: 400,
          }}
        >
          耳听为
          <span className="poetic-keyword" data-keyword="律">
            律
            <span className="poetic-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </span>
          </span>
          ，眼见为
          <span className="poetic-keyword" data-keyword="序">
            序
            <span className="poetic-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="2.5" />
                <path d="M13.5 13.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5 4.5-2 4.5-4.5-2-4.5-4.5-4.5z" />
                <path d="M4.5 4.5h4v4h-4z" />
                <path d="M4.5 15.5h4v4h-4z" />
              </svg>
            </span>
          </span>
          。在这座由代码、音符与像素编织的花园里，种着音乐的碎片，养着设计的灵光。欢迎你，
          <span className="hero-farewell">慢慢逛</span>。
        </motion.p>

        {/* 社交媒体链接 — 首屏（简洁版：去标签、幽灵图标，减少视觉噪音） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          {socialLinks.map((link, i) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              title={link.label}
              data-cursor-hover
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78 + i * 0.07, duration: 0.5 }}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                transition: 'color 0.3s, transform 0.3s, background 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-dim)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {socialIcons[link.icon]}
            </motion.a>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '36px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--text-dim)',
          display: 'flex',
          justifyContent: 'center',
        }}
        aria-hidden
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} />
        </motion.div>
      </motion.div>

      <style>{`
        .hero-section {
          min-height: calc(100vh - 130px);
          min-height: calc(100dvh - 130px);
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
