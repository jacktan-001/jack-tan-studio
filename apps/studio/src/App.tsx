import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { GlobalAudioPlayer, useGlobalAudioPlayer } from '@jack-tan/studio-core'
import Navbar from './components/layout/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import StarField from './components/effects/StarField'
import { projects } from './data/projects'

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

  return (
    <>
      <CustomCursor />
      <BackgroundEffects />
      <Navbar />
      <div className="page-wrap">
        {/* N-2：用 key + CSS .studio-page-fade 实现路由切换淡入，替代 AnimatePresence（去除首屏 Motion 依赖） */}
        <div key={location.pathname} className="studio-page-fade">
          <Suspense fallback={<div className="studio-page-fade" />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />

            {/* 项目介绍页：/projects/:id/intro */}
            {projects.map((p) => (
              <Route
                key={`intro-${p.id}`}
                path={`/projects/${p.id}/intro`}
                element={<ProjectIntro />}
              />
            ))}

            {/* 项目路由：已上线的直接跳转到子应用目录；未上线的渲染 Coming Soon */}
            {projects.map((p) => (
              <Route
                key={p.id}
                path={`/projects/${p.id}`}
                element={
                  p.status === 'live' ? (
                    <Navigate to={p.url} replace />
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
      </div>

      {/* 跨应用全局底部播放器 */}
      <GlobalAudioPlayer player={player} />
    </>
  )
}
