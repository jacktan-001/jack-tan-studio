import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Navbar from './components/layout/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import StarField from './components/effects/StarField'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'
import ProjectIntro from './pages/ProjectIntro'
import { projects } from './data/projects'

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

  return (
    <>
      <CustomCursor />
      <BackgroundEffects />
      <Navbar />
      <div className="page-wrap">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
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
        </AnimatePresence>
      </div>
    </>
  )
}
