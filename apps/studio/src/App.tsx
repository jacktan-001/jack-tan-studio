import { lazy, Suspense, useCallback, useEffect, useRef } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { GlobalAudioPlayer, useGlobalAudioPlayer } from '@jack-tan/studio-core'
import Navbar from './components/layout/Navbar'
import ProjectHost from './components/ProjectHost'
import CustomCursor from './components/ui/CustomCursor'
import StarField from './components/effects/StarField'
import { projects } from './data/projects'

/**
 * P3: 路由切换焦点管理 + aria-live 播报。
 * View Transitions 完成后将焦点移至 <main> 内第一个标题，并播报页面变更。
 */
function RouteAnnouncer() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement | null>(null)
  const announcerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // 延迟聚焦：View Transitions 动画完成后（~400ms），
    // 将焦点移至 <main> 内第一个 <h1>（若无可聚焦元素则跳过）
    const timer = setTimeout(() => {
      const main = document.querySelector('main')
      if (main) {
        mainRef.current = main
        const h1 = main.querySelector('h1')
        if (h1) {
          h1.setAttribute('tabindex', '-1')
          h1.focus({ preventScroll: true })
        }
      }
    }, 400)

    // aria-live 播报路由变更（给读屏软件）
    if (announcerRef.current) {
      // 先清空再赋值，确保重复路由也能触发播报
      announcerRef.current.textContent = ''
      requestAnimationFrame(() => {
        if (announcerRef.current) {
          const pageLabel = pathname === '/' ? '首页' : pathname.replace(/^\/projects\//, '').replace(/\/.*/, '')
          announcerRef.current.textContent = `已进入${pageLabel}页面`
        }
      })
    }

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      ref={announcerRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  )
}

// 路由级懒加载：首屏只加载外壳，页面组件（及其携带的 gsap / motion 等依赖）
// 按需切分为独立 chunk，缩短首屏 JS 体积（P2-3）
const Home = lazy(() => import('./pages/Home'))
const ComingSoon = lazy(() => import('./pages/ComingSoon'))
const ProjectIntro = lazy(() => import('./pages/ProjectIntro'))

function BackgroundEffects() {
  return (
    <>
      {/* Canvas 星粒子 + 扫描线 — 科幻未来数字展厅核心视觉 */}
      <StarField />
      <div className="gradient-mesh">
        <div className="gradient-blob" />
        <div className="gradient-blob" />
        <div className="gradient-blob" />
      </div>
      <div className="grid-bg" />
      <div className="studio-scanline-overlay" />
      <div className="noise-overlay" />
    </>
  )
}

export default function App() {
  const location = useLocation()
  const player = useGlobalAudioPlayer()

  // 播放错误的兜底处理（嵌入子应用复用外壳的 player，错误也汇集到这里）
  const handlePlayerError = useCallback((message: string) => {
    console.warn('[player]', message)
  }, [])

  return (
    <>
      <CustomCursor />
      {/* 项目页（/projects/*）由子应用自带背景与装饰，外壳环境背景常驻会透出
          紫/青模糊光斑 → 顶部紫色条 + 左上青绿色块。故项目路由下隐藏 BackgroundEffects。 */}
      {!location.pathname.startsWith('/projects') && <BackgroundEffects />}
      <Navbar />
      <main className="page-wrap">
        <RouteAnnouncer />
        {/* N-2：用 key + CSS .studio-page-fade 实现路由切换淡入，替代 AnimatePresence（去除首屏 Motion 依赖） */}
        <div key={location.pathname} className="studio-page-fade">
          <Suspense fallback={<div className="studio-page-fade" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />

            {/* 项目介绍页：/projects/:id/intro
                必须用动态段声明，否则 ProjectIntro 里的 useParams().id 取不到值 */}
            <Route path="/projects/:id/intro" element={<ProjectIntro />} />

            {/* 项目路由：已上线的直接在单页壳层内客户端挂载子应用（音乐不中断）；
                未上线的渲染 Coming Soon */}
            {projects.map((p) => (
              <Route
                key={p.id}
                path={`/projects/${p.id}`}
                element={
                  p.status === 'live' ? (
                    <ProjectHost id={p.id} player={player} onError={handlePlayerError} />
                  ) : (
                    <ComingSoon project={p} />
                  )
                }
              />
            ))}

            {/* 兜底 404 回首页 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </div>
      </main>

      {/* 跨应用全局底部播放器 */}
      <GlobalAudioPlayer player={player} />
    </>
  )
}
