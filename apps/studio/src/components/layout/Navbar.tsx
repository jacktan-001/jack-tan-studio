import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { projects } from '../../data/projects'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: scrolled ? '12px 32px' : '20px 32px',
        background: scrolled ? 'rgba(6, 6, 10, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: '18px',
          color: 'white',
          boxShadow: '0 4px 20px rgba(124, 58, 237, 0.4)',
        }}>
          JT
        </div>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: '18px',
          letterSpacing: '-0.02em',
        }}>
          Jack Tan <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Studio</span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="nav-links-desktop">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/project/${p.id}`}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-muted)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {p.name}
          </Link>
        ))}
        <a
          href="https://github.com/jacktan-001"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-muted)',
          }}
        >
          GitHub
        </a>
      </div>

      <button
        className="nav-mobile-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: 'none',
          padding: '8px',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.06)',
        }}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="nav-mobile-menu"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'rgba(6, 6, 10, 0.95)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/project/${p.id}`}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: '15px',
                }}
              >
                {p.name} <span style={{ color: 'var(--text-dim)', marginLeft: '8px' }}>{p.tagline}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }
      `}</style>
    </motion.nav>
  )
}
