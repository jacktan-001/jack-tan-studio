import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@jack-tan/studio-core'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider projectId="wave" defaultMode="light">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
