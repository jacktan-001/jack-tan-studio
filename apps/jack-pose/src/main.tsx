import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@jack-tan/studio-core'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider projectId="pose" defaultMode="light">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
