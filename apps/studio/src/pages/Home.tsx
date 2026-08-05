import { lazy, Suspense } from 'react'
import ProjectShowcase from '../components/home/ProjectShowcase'

// N-2：Hero 是站内唯一仍需 Framer Motion（滚动视差 + 弹簧光球）的组件，
// 懒加载后 motion-vendor chunk 不再进入首屏关键路径，首屏 JS 体积显著下降。
const Hero = lazy(() => import('../components/home/Hero'))

export default function Home() {
  return (
    <div>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: 'calc(100dvh - 130px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        }
      >
        <Hero />
      </Suspense>
      <ProjectShowcase />
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer
      className="studio-footer"
      style={{
        borderTop: '1px solid var(--border)',
        padding: '56px 24px calc(48px + env(safe-area-inset-bottom, 0px))',
        marginTop: '48px',
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-muted)',
          }}
        >
          Jack Tan Studio
        </div>
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
          }}
        >
          © 2026 · Built with React + Vite · Deployed on Cloudflare Pages
        </div>
      </div>
    </footer>
  )
}
