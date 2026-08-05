import type { ReactNode } from 'react'
import { Lock, ArrowUpRight, Github } from 'lucide-react'
import { projects, type Project } from '../../data/projects'
import { Rise } from '../Rise'

/* ============================================================
 * 每个项目一个「独特动态效果」—— 全部用纯 CSS 关键帧或 SVG SMIL
 * 实现，不引入 JS 动画库，保持首屏轻量（站点已做 Motion 懒加载）。
 * wave=音频均衡器律动 · pose=照片墙双向往返 · tan=技能条填充+扫描
 * cast=平滑声波(SMIL 形变) · craft=漂浮生成粒子
 * ========================================================== */

function WavePreview() {
  const bars = [0.5, 0.8, 0.4, 0.95, 0.62, 1, 0.46, 0.78, 0.56, 0.88, 0.42, 0.72, 0.52, 0.9, 0.6, 0.82, 0.48, 0.7]
  return (
    <div className="pv pv-wave">
      {bars.map((h, i) => (
        <span
          key={i}
          className="pv-eq-bar"
          style={{
            height: `${h * 100}%`,
            animationDuration: `${0.85 + (i % 5) * 0.12}s`,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  )
}

function PosePreview() {
  const tones = [
    'linear-gradient(135deg,rgba(236,72,153,.55),rgba(245,166,35,.35))',
    'linear-gradient(135deg,rgba(236,72,153,.35),rgba(244,114,182,.4))',
    'linear-gradient(135deg,rgba(245,166,35,.45),rgba(236,72,153,.3))',
    'linear-gradient(135deg,rgba(219,39,119,.5),rgba(251,146,60,.3))',
  ]
  const tiles = Array.from({ length: 6 }, (_, i) => tones[i % tones.length])
  return (
    <div className="pv pv-pose">
      <div className="pv-marquee">
        <div className="pv-track">
          {tiles.concat(tiles).map((t, i) => (
            <span key={i} className="pv-tile" style={{ background: t }} />
          ))}
        </div>
      </div>
      <div className="pv-marquee pv-reverse">
        <div className="pv-track">
          {tiles.concat(tiles).map((t, i) => (
            <span key={i} className="pv-tile" style={{ background: t }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function TanPreview() {
  const bars = ['88%', '72%', '95%', '60%']
  return (
    <div className="pv pv-tan">
      {bars.map((w, i) => (
        <div key={i} className="pv-bar-row">
          <div className="pv-bar-fill" style={{ width: w, animationDelay: `${i * 0.2}s` }} />
        </div>
      ))}
      <div className="pv-scan" />
    </div>
  )
}

function CastPreview() {
  return (
    <div className="pv pv-cast">
      <svg viewBox="0 0 400 120" preserveAspectRatio="none" className="pv-cast-svg">
        <path fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
          <animate
            attributeName="d"
            dur="2.2s"
            repeatCount="indefinite"
            values="
              M0,60 Q50,12 100,60 T200,60 T300,60 T400,60;
              M0,60 Q50,108 100,60 T200,60 T300,60 T400,60;
              M0,60 Q50,12 100,60 T200,60 T300,60 T400,60
            "
          />
        </path>
        <path fill="none" stroke="#d946ef" strokeWidth="1.4" strokeLinecap="round" opacity="0.5">
          <animate
            attributeName="d"
            dur="2.2s"
            repeatCount="indefinite"
            values="
              M0,60 Q50,108 100,60 T200,60 T300,60 T400,60;
              M0,60 Q50,12 100,60 T200,60 T300,60 T400,60;
              M0,60 Q50,108 100,60 T200,60 T300,60 T400,60
            "
          />
        </path>
      </svg>
    </div>
  )
}

function CraftPreview() {
  const dots = [
    { x: '12%', y: '32%', s: 8, d: 6, delay: 0 },
    { x: '30%', y: '62%', s: 5, d: 8, delay: 0.6 },
    { x: '50%', y: '26%', s: 6, d: 7, delay: 1.1 },
    { x: '68%', y: '56%', s: 4, d: 9, delay: 0.3 },
    { x: '84%', y: '34%', s: 7, d: 6.5, delay: 0.9 },
    { x: '44%', y: '70%', s: 4, d: 8.5, delay: 1.4 },
    { x: '22%', y: '48%', s: 5, d: 7.5, delay: 0.2 },
  ]
  return (
    <div className="pv pv-craft">
      <div className="pv-craft-grid" />
      {dots.map((p, i) => (
        <span
          key={i}
          className="pv-dot"
          style={{
            left: p.x,
            top: p.y,
            width: `${p.s}px`,
            height: `${p.s}px`,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

function VisualPreview({ project }: { project: Project }) {
  switch (project.id) {
    case 'wave': return <WavePreview />
    case 'pose': return <PosePreview />
    case 'tan': return <TanPreview />
    case 'cast': return <CastPreview />
    case 'craft': return <CraftPreview />
    default: return null
  }
}

function ProjectIcon({ type, color, size = 26 }: { type: string; color: string; size?: number }) {
  const icons: Record<string, ReactNode> = {
    wave: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M2 12 Q6 6, 10 12 T18 12 T22 12" />
        <path d="M2 16 Q6 10, 10 16 T18 16 T22 16" opacity="0.5" />
      </svg>
    ),
    pose: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9 L21 9 M9 3 L9 21" opacity="0.5" />
        <circle cx="15" cy="15" r="2" />
      </svg>
    ),
    profile: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21 Q4 14, 12 14 T20 21" />
      </svg>
    ),
    cast: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11 Q5 18, 12 18 Q19 18, 19 11" opacity="0.6" />
        <path d="M12 18 L12 21" />
      </svg>
    ),
    craft: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
        <path d="M12 2 L22 12 L12 22 L2 12 Z" />
        <path d="M12 6 L18 12 L12 18 L6 12 Z" opacity="0.5" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  }
  return icons[type] || null
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontFamily: 'var(--font-mono)',
      color: 'var(--text-dim)',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      marginBottom: '10px',
    }}>
      {children}
    </div>
  )
}

function StatusBadge({ project }: { project: Project }) {
  const isLive = project.status === 'live'
  return (
    <div style={{
      position: 'absolute',
      top: '18px',
      right: '18px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 12px',
      borderRadius: '100px',
      background: isLive ? 'rgba(34,197,94,0.1)' : `rgba(${project.colorRgb}, 0.1)`,
      border: `1px solid ${isLive ? 'rgba(34,197,94,0.35)' : `rgba(${project.colorRgb}, 0.3)`}`,
      fontSize: '11px',
      fontFamily: 'var(--font-mono)',
      color: isLive ? '#22c55e' : project.color,
      fontWeight: 600,
      zIndex: 2,
      backdropFilter: 'blur(8px)',
    }}>
      {isLive ? <span className="pv-live-dot" /> : <Lock size={11} />}
      {isLive ? '已上线' : '即将上线'}
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isLive = project.status === 'live'

  return (
    <Rise delay={index * 0.09} style={{ height: '100%' }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        transition: 'border-color 0.4s, transform 0.4s, box-shadow 0.4s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `rgba(${project.colorRgb}, 0.45)`
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = `0 18px 50px -18px rgba(${project.colorRgb}, 0.35)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Gradient bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${project.color}, transparent)` }} />

      <StatusBadge project={project} />

      <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Icon + Name + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <div style={{
            width: '54px', height: '54px', flexShrink: 0, borderRadius: '14px',
            background: `rgba(${project.colorRgb}, 0.1)`,
            border: `1px solid rgba(${project.colorRgb}, 0.25)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ProjectIcon type={project.icon} color={project.color} />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: '25px', fontWeight: 600,
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}>{project.name}</h3>
            <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', marginTop: '4px' }}>
              {project.tagline}
            </div>
          </div>
        </div>

        {/* 功能定位 */}
        {project.positioning && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', alignSelf: 'flex-start', gap: '6px',
            padding: '4px 12px', borderRadius: '6px',
            background: `rgba(${project.colorRgb}, 0.08)`,
            border: `1px solid rgba(${project.colorRgb}, 0.18)`,
            fontSize: '12px', color: project.color, fontWeight: 500, marginBottom: '18px',
          }}>
            {project.positioning}
          </div>
        )}

        {/* 简要描述 */}
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '20px' }}>
          {project.description}
        </p>

        {/* 独特动态预览 */}
        <div style={{
          height: '104px', marginBottom: '22px', borderRadius: '10px',
          overflow: 'hidden', border: '1px solid var(--border)',
        }}>
          <VisualPreview project={project} />
        </div>

        {/* 特色亮点 — 双列布局，缩短卡片高度 */}
        <div style={{ marginBottom: '22px' }}>
          <FieldLabel>特色亮点</FieldLabel>
          <div className="showcase-features">
            {project.features.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%', background: project.color,
                  marginTop: '7px', flexShrink: 0, boxShadow: `0 0 8px rgba(${project.colorRgb}, 0.6)`,
                }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 技术栈 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '22px' }}>
          {project.tech.map((t) => (
            <span key={t} style={{
              padding: '4px 10px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
            }}>{t}</span>
          ))}
        </div>

        {/* Actions */}
        {isLive ? (
          <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '11px 16px', borderRadius: '10px',
                background: `rgba(${project.colorRgb}, 0.14)`, color: project.color,
                fontSize: '13px', fontWeight: 600, border: `1px solid rgba(${project.colorRgb}, 0.3)`,
                textDecoration: 'none', transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.24)` }}
              onMouseLeave={(e) => { e.currentTarget.style.background = `rgba(${project.colorRgb}, 0.14)` }}
            >
              访问 <ArrowUpRight size={14} />
            </a>
            {project.repo && (
              <a
                href={`https://github.com/${project.repo}`}
                target="_blank"
                rel="noopener noreferrer"
                title="查看源码"
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  padding: '11px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <Github size={15} />
              </a>
            )}
          </div>
        ) : (
          <div style={{
            marginTop: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '11px 16px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)',
            color: 'var(--text-dim)', fontSize: '13px', fontWeight: 500,
          }}>
            <Lock size={14} />
            正在开发中 · 敬请期待
          </div>
        )}
      </div>
      </div>
    </Rise>
  )
}

function GroupLabel({ zh, en, count }: { zh: string; en: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '40px 0 20px' }}>
      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{zh}</span>
      <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
        {String(count).padStart(2, '0')} · {en}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

export default function ProjectShowcase() {
  const live = projects.filter((p) => p.status === 'live')
  const upcoming = projects.filter((p) => p.status === 'coming-soon')

  return (
    <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 24px' }}>
      <Rise style={{ textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px',
          borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
          marginBottom: '16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)',
        }}>
          {String(projects.length).padStart(2, '0')} · PROJECTS
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 600,
          letterSpacing: '-0.03em', marginBottom: '12px',
        }}>
          三个已上线，<span className="gradient-text">两个在路上</span>
        </h2>
        <p style={{
          fontSize: '15px', color: 'var(--text-muted)', maxWidth: '620px', margin: '0 auto', lineHeight: 1.75,
        }}>
          从音乐随记到社媒排版、再到个人作品集，每一个作品都是独立的创意；
          Jack Cast 与 Jack Craft 正在路上。
        </p>
      </Rise>

      <GroupLabel zh="已上线" en="LIVE" count={live.length} />
      <div className="showcase-grid">
        {live.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
      </div>

      <GroupLabel zh="即将上线" en="COMING SOON" count={upcoming.length} />
      <div className="showcase-grid">
        {upcoming.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
      </div>

      <style>{`
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 22px;
        }

        /* ===== 特色亮点：双列布局（窄屏回退单列），缩短卡片高度 ===== */
        .showcase-features {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px 14px;
        }
        @media (min-width: 520px) {
          .showcase-features { grid-template-columns: 1fr 1fr; }
        }

        /* ===== 预览容器通用 ===== */
        .pv { position: relative; height: 100%; width: 100%; overflow: hidden; border-radius: 10px; }

        /* ===== Jack Wave：音频均衡器律动 ===== */
        .pv-wave { display: flex; align-items: flex-end; gap: 4px; padding: 14px 16px; box-sizing: border-box; background: linear-gradient(180deg, rgba(6,182,212,0.08), rgba(20,184,166,0.03)); }
        .pv-eq-bar { flex: 1; background: linear-gradient(to top, #06b6d4, #22d3ee); border-radius: 2px 2px 0 0; transform-origin: bottom; animation: pvEq 0.9s ease-in-out infinite; }
        @keyframes pvEq { 0%, 100% { transform: scaleY(0.25); } 50% { transform: scaleY(1); } }

        /* ===== Jack Pose：照片墙双向往返滚动 ===== */
        .pv-pose { display: flex; flex-direction: column; justify-content: center; gap: 12px; padding: 12px 0; box-sizing: border-box; background: linear-gradient(135deg, rgba(236,72,153,0.07), rgba(245,166,35,0.03)); }
        .pv-marquee { overflow: hidden; }
        .pv-track { display: flex; gap: 10px; width: max-content; animation: pvMar 12s linear infinite; }
        .pv-reverse .pv-track { animation-direction: reverse; animation-duration: 15s; }
        .pv-tile { width: 56px; height: 34px; border-radius: 6px; flex-shrink: 0; }
        @keyframes pvMar { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        /* ===== Jack Tan：技能条填充 + 扫描光 ===== */
        .pv-tan { display: flex; flex-direction: column; justify-content: center; gap: 11px; padding: 16px; box-sizing: border-box; background: linear-gradient(180deg, rgba(124,58,237,0.06), rgba(91,123,213,0.03)); }
        .pv-bar-row { height: 10px; border-radius: 6px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .pv-bar-fill { height: 100%; border-radius: 6px; background: linear-gradient(90deg, #7c3aed, #a78bfa); transform-origin: left; animation: pvFill 2.4s ease-in-out infinite; }
        @keyframes pvFill { 0% { transform: scaleX(0); } 55%, 100% { transform: scaleX(1); } }
        .pv-scan { position: absolute; top: 0; bottom: 0; width: 60px; background: linear-gradient(90deg, transparent, rgba(167,139,250,0.16), transparent); animation: pvScan 3.2s linear infinite; }
        @keyframes pvScan { from { left: -60px; } to { left: 100%; } }

        /* ===== Jack Cast：平滑声波（SMIL 形变，区别于 Wave 方块均衡器） ===== */
        .pv-cast { display: flex; align-items: center; background: linear-gradient(180deg, rgba(245,158,11,0.08), rgba(217,70,239,0.03)); }
        .pv-cast-svg { width: 100%; height: 100%; }

        /* ===== Jack Craft：漂浮生成粒子 ===== */
        .pv-craft { background: linear-gradient(135deg, rgba(16,185,129,0.07), rgba(34,211,238,0.03)); }
        .pv-craft-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(16,185,129,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.07) 1px, transparent 1px); background-size: 22px 22px; }
        .pv-dot { position: absolute; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.7); animation: pvFloat ease-in-out infinite; }
        @keyframes pvFloat { 0%, 100% { transform: translate(0,0); opacity: 0.9; } 25% { transform: translate(10px,-12px); opacity: 0.5; } 50% { transform: translate(-8px,8px); opacity: 0.9; } 75% { transform: translate(8px,10px); opacity: 0.6; } }

        /* ===== 已上线 LIVE 呼吸点 ===== */
        .pv-live-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; animation: pvLiveDot 1.8s ease-out infinite; }
        @keyframes pvLiveDot { 0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.55); } 70% { box-shadow: 0 0 0 7px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }

        /* ===== 减少动态偏好 ===== */
        @media (prefers-reduced-motion: reduce) {
          .pv-eq-bar, .pv-track, .pv-bar-fill, .pv-scan, .pv-dot, .pv-live-dot { animation: none !important; }
        }
      `}</style>
    </section>
  )
}
