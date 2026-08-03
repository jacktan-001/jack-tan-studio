import { useTheme } from '@jack-tan/studio-core'
import Sidebar from './components/Sidebar'
import RevealObserver from './components/RevealObserver'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Works from './components/Works'
import Patents from './components/Patents'
import Skills from './components/Skills'
import Footer from './components/Footer'

function ThemeToggle() {
  const { mode, toggleMode } = useTheme()
  return (
    <button
      onClick={toggleMode}
      aria-label="切换深色/浅色模式"
      className="fixed bottom-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
    >
      {mode === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </button>
  )
}

export default function App() {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[380px_1fr]">
      <Sidebar />
      <RevealObserver>
        <main className="px-4 py-12 sm:px-7 lg:px-14 lg:py-12">
          <About />
          <Experience />
          <Projects />
          <Works />
          <Patents />
          <Skills />
          <Footer />
        </main>
      </RevealObserver>
      <ThemeToggle />
    </div>
  )
}
