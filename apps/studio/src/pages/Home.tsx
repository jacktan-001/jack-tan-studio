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
    <footer className="studio-footer border-t border-border px-6 pt-14 pb-12 mt-12 text-center">
      <div className="mx-auto max-w-[1000px]">
        <div className="font-display text-sm font-medium text-text-muted">
          Jack Tan Studio
        </div>
        <div className="mt-3 text-xs text-text-dim font-mono">
          © 2026 · Built with React + Vite · Deployed on Cloudflare Pages
        </div>
      </div>
    </footer>
  )
}
