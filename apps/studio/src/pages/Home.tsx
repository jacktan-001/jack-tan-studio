import { motion } from 'motion/react'
import { socialLinks } from '../data/projects'
import { socialIcons } from '../components/icons/SocialIcons'
import Hero from '../components/home/Hero'
import ProjectShowcase from '../components/home/ProjectShowcase'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Hero />
      <StatsSection />
      <ProjectShowcase />
      <AboutSection />
      <Footer />
    </motion.div>
  )
}

function StatsSection() {
  const stats = [
    { value: '03', label: '上线项目', sub: 'All Live' },
    { value: '09+', label: '行业经验', sub: 'Years' },
    { value: '08', label: '上线系统', sub: 'Systems' },
    { value: '02', label: '国家专利', sub: 'Patents' },
  ]

  return (
    <section style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 24px',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass"
            style={{
              padding: '28px',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '48px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, var(--text), var(--text-muted))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>{s.value}</div>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}>{s.label}</div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-dim)',
              marginTop: '4px',
            }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section style={{
      maxWidth: '900px',
      margin: '0 auto',
      padding: '120px 24px',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
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
          ABOUT
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 600,
          letterSpacing: '-0.03em',
          marginBottom: '24px',
          lineHeight: 1.2,
        }}>
          以技术为基，以<span className="gradient-text">创意</span>为翼
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'var(--text-muted)',
          lineHeight: 1.8,
          maxWidth: '640px',
          margin: '0 auto',
        }}>
          Jack Tan Studio 是一个个人创意集合平台，整合了音乐随记、社媒排版工具和个人职业展示。
          底层采用 React + TypeScript + Vite + Framer Motion + Three.js 技术栈，
          部署于 Cloudflare Pages 全球边缘网络。未来将持续集成更多创意工具和实验性项目。
        </p>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center',
          marginTop: '40px',
        }}>
          {['React 19', 'TypeScript', 'Vite', 'Framer Motion', 'Three.js', 'GSAP', 'Cloudflare Pages', 'PWA'].map((tech) => (
            <span key={tech} style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              fontSize: '13px',
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
            }}>{tech}</span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '60px 24px 40px',
      marginTop: '40px',
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
      }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)'
                e.currentTarget.style.color = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              title={link.label}
            >
              {socialIcons[link.icon]}
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-muted)',
            marginBottom: '8px',
          }}>
            Jack Tan Studio
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)',
          }}>
            © 2026 · Built with React + Vite · Deployed on Cloudflare Pages
          </div>
        </div>
      </div>
    </footer>
  )
}
