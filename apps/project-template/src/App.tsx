import { useTheme } from '@jack-tan/studio-core'
import { Sun, Moon } from 'lucide-react'

function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  return (
    <button
      onClick={toggleMode}
      aria-label="切换主题"
      className="theme-toggle"
    >
      {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}

export default function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Project Template</h1>
        <p>子应用脚手架 —— 从此开始构建你的新项目。</p>
        <ThemeToggle />
      </header>
      <main className="app-main">
        <section className="card">
          <h2>开始</h2>
          <ol>
            <li>复制 <code>apps/project-template</code> 为新目录，例如 <code>apps/jack-lens</code></li>
            <li>替换 <code>vite.config.ts</code> 中的 <code>base</code> 为实际子路径</li>
            <li>替换 <code>src/main.tsx</code> 中的 <code>projectId</code></li>
            <li>更新 <code>package.json</code> 中的 name、description 和 title/meta</li>
            <li>在 <code>apps/studio/src/data/projects.ts</code> 中注册新项目</li>
          </ol>
        </section>
      </main>
    </div>
  )
}
