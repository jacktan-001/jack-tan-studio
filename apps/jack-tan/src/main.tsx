import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, StudioBar } from '@jack-tan/studio-core'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider projectId="tan" defaultMode="light">
      <StudioBar current="tan" />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
