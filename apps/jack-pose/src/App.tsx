import { lazy, Suspense, useEffect } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useTheme } from '@jack-tan/studio-core'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ThemeToggleIcon } from './lib/theme'

const ProjectListPage = lazy(() => import('./pages/ProjectListPage').then(m => ({ default: m.ProjectListPage })))
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })))
const PuzzlePage = lazy(() => import('./pages/PuzzlePage').then(m => ({ default: m.PuzzlePage })))

function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  return (
    <button
      onClick={toggleMode}
      aria-label="切换深色/浅色模式"
      className="w-9 h-9 flex items-center justify-center rounded-full bg-hover text-secondary hover:text-accent hover:bg-accent-bg transition"
    >
      <ThemeToggleIcon theme={mode} />
    </button>
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
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
    </ErrorBoundary>
  )
}

export default App
