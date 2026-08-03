import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, StudioBar } from '@jack-tan/studio-core'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider projectId="wave" defaultMode="light">
      <StudioBar current="wave" />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
