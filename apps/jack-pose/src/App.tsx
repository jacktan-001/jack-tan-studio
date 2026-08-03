import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { StudioBar } from '@jack-tan/studio-core'
import { ErrorBoundary } from './components/ErrorBoundary'

const ProjectListPage = lazy(() => import('./pages/ProjectListPage').then(m => ({ default: m.ProjectListPage })))
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })))
const PuzzlePage = lazy(() => import('./pages/PuzzlePage').then(m => ({ default: m.PuzzlePage })))

/** 背景视觉层 — 暖色手工质感 */
function BackgroundEffects() {
  return (
    <>
      {/* 有机暖色气泡 */}
      <div className="pose-warm-blobs" aria-hidden="true">
        <div className="pose-warm-blob" />
        <div className="pose-warm-blob" />
        <div className="pose-warm-blob" />
        <div className="pose-warm-blob" />
      </div>
      {/* 圆点网格 */}
      <div className="pose-dot-grid" aria-hidden="true" />
      {/* 纸张纹理 — 暖色噪点 */}
      <div className="pose-paper-texture" aria-hidden="true" />
    </>
  )
}

function App() {
  useEffect(() => {
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch((err) => {
        console.warn('[SW] 注册失败:', err)
      })
    }
  }, [])

  return (
    <ErrorBoundary>
      {/* 背景视觉层 — 暖色手工质感 */}
      <BackgroundEffects />
      {/* StudioBar 跨项目共享导航栏（fixed 定位，下方内容由 index.css 预留 64px 顶部间距） */}
      <StudioBar current="pose" />
      <HashRouter>
        <Suspense
          fallback={
            <div className="min-h-screen bg-bg flex items-center justify-center text-secondary text-sm">
              加载中…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<ProjectListPage />} />
            <Route path="/p/:id" element={<EditorPage />} />
            <Route path="/puzzle" element={<PuzzlePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" toastOptions={{ className: 'rounded-xl' }} />
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
