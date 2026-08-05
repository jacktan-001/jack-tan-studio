import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@jack-tan/studio-core'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider projectId="studio" defaultMode="dark">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)

// 注册 PWA Service Worker（仅在生产构建）
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .catch(() => {
      // SW 注册失败静默处理
    })
}
