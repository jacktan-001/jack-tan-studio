import { lazy, Suspense } from 'react'
import { socialLinks } from '../data/projects'
import { socialIcons } from '../components/icons/SocialIcons'
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
    <footer className="studio-footer border-t border-border px-6 pt-16 pb-12 mt-12">
      <div className="max-w-[1000px] mx-auto flex flex-col items-center gap-8">
        <div className="flex gap-3 flex-wrap justify-center">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-hover
              className="w-11 h-11 rounded-xl bg-white/[0.04] border border-border flex items-center justify-center text-text-muted transition-all duration-300 hover:bg-accent/10 hover:border-accent/30 hover:text-accent hover:-translate-y-1"
              title={link.label}
            >
              {socialIcons[link.icon]}
            </a>
          ))}
        </div>

        <div className="text-center">
          <div className="font-display text-sm font-medium text-text-muted mb-2">
            Jack Tan Studio
          </div>
          <div className="text-xs text-text-dim font-mono">
            © 2026 · Built with React + Vite · Deployed on Cloudflare Pages
          </div>
        </div>
      </div>
    </footer>
  )
}
