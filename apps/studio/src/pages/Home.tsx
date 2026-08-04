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
    <section className="max-w-[1000px] mx-auto px-6 py-10">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass p-7 text-center"
          >
            <div className="font-display text-5xl font-bold tracking-tight leading-none bg-clip-text text-transparent bg-[linear-gradient(135deg,var(--text),var(--text-muted))]">
              {s.value}
            </div>
            <div className="text-sm text-text-muted mt-2">{s.label}</div>
            <div className="text-[11px] font-mono text-text-dim mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function AboutSection() {
  return (
    <section className="max-w-[900px] mx-auto px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-border mb-5 text-xs font-mono text-text-muted">
          ABOUT
        </div>
        <h2 className="font-display text-[clamp(28px,4vw,44px)] font-semibold tracking-tight mb-6 leading-tight">
          以技术为基，以<span className="gradient-text">创意</span>为翼
        </h2>
        <p className="text-base text-text-muted leading-relaxed max-w-[640px] mx-auto">
          Jack Tan Studio 是一个个人创意集合平台，整合了音乐随记、社媒排版工具和个人职业展示。
          底层采用 React + TypeScript + Vite + Framer Motion + Three.js 技术栈，
          部署于 Cloudflare Pages 全球边缘网络。未来将持续集成更多创意工具和实验性项目。
        </p>

        <div className="flex flex-wrap gap-2.5 justify-center mt-10">
          {['React 19', 'TypeScript', 'Vite', 'Framer Motion', 'Three.js', 'GSAP', 'Cloudflare Pages', 'PWA'].map((tech) => (
            <span key={tech} className="px-4 py-2 rounded-lg bg-white/[0.04] border border-border text-[13px] font-mono text-text-muted">
              {tech}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
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
