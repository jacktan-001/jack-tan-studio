/**
 * App — Jack Pose 主应用组件
 *
 * 单页壳层（studio）合并架构下的两种装配方式：
 * - `App`（默认导出）：独立部署入口。自托管 player + StudioBar + GlobalAudioPlayer，
 *   并注册自己的 Service Worker，由 main.tsx 包在 ThemeProvider 中渲染。
 * - `PoseAppEmbedded`：被 studio 外壳客户端挂载时使用的入口。不创建音频、
 *   不渲染 StudioBar / GlobalAudioPlayer（由外壳统一提供），也不注册 SW，
 *   从而让外壳唯一的 <audio> 在导航时持续播放，实现零间隙。
 *
 * 公共 UI 抽到 `PoseContent`，两种装配方式共用同一份结构。
 */

import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { StudioBar, GlobalAudioPlayer, useGlobalAudioPlayer } from '@jack-tan/studio-core'
import { ErrorBoundary } from './components/ErrorBoundary'
import CameraFlash from './components/CameraFlash'

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

/**
 * PoseContent — Jack Pose 的全部 UI 与路由。
 * 不涉及音频：全局播放器由外层（独立部署时的 App / 嵌入时的 studio 外壳）提供。
 */
function PoseContent() {
  return (
    <ErrorBoundary>
      {/* 背景视觉层 — 暖色手工质感 */}
      <BackgroundEffects />
      {/* 内容层（relative z-1，抬升至背景光斑之上，避免暖色气泡遮挡正文） */}
      <main style={{ position: 'relative', zIndex: 1 }}>
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
      </main>

      {/* 全局相机闪光特效 — 随机位置闪光灯，模拟四处拍照（fixed 覆盖层，不拦截交互） */}
      <CameraFlash />
    </ErrorBoundary>
  )
}

/**
 * App — 独立部署入口（默认导出）。
 * 自托管 player + StudioBar + GlobalAudioPlayer，并注册 Service Worker。
 */
function App() {
  useEffect(() => {
    // 注册 Service Worker（仅独立部署；嵌入外壳时由外壳负责）
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch((err) => {
        console.warn('[SW] 注册失败:', err)
      })
    }
  }, [])

  const player = useGlobalAudioPlayer()

  return (
    <>
      {/* StudioBar 跨项目共享导航栏（fixed 定位，下方内容由 styles.css 预留 64px 顶部间距） */}
      <StudioBar current="pose" />

      <PoseContent />

      {/* 跨应用全局底部播放器 */}
      <GlobalAudioPlayer player={player} />
    </>
  )
}

export default App

/**
 * PoseAppEmbedded — 被 studio 单页外壳客户端挂载时的入口。
 * 不创建音频、不渲染 StudioBar / GlobalAudioPlayer、不注册 SW（外壳统一负责）。
 */
export function PoseAppEmbedded() {
  return <PoseContent />
}
