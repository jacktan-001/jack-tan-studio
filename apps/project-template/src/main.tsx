import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@jack-tan/studio-core'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* TODO: 复制模板后，将 projectId 替换为实际项目 ID，例如 'lens' / 'cast' / 'craft' */}
    <ThemeProvider projectId="template" defaultMode="dark">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
