import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import Navbar from './components/layout/Navbar'
import CustomCursor from './components/ui/CustomCursor'
import Home from './pages/Home'
import ComingSoon from './pages/ComingSoon'
import { projects } from './data/projects'

function BackgroundEffects() {
  return (
    <>
      <div className="gradient-mesh">
        <div className="gradient-blob" />
        <div className="gradient-blob" />
        <div className="gradient-blob" />
      </div>
      <div className="grid-bg" />
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
