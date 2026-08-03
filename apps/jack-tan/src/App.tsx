import { StudioBar } from '@jack-tan/studio-core'
import Sidebar from './components/Sidebar'
import RevealObserver from './components/RevealObserver'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Works from './components/Works'
import Patents from './components/Patents'
import Skills from './components/Skills'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <StudioBar current="tan" />

      {/* 背景视觉层 — 色彩泡泡 / 斜线纹理 / 精密方格 / 顶部光带 / 噪点 */}
      <div className="tan-blue-blobs" aria-hidden="true">
        <div className="tan-blue-blob" />
        <div className="tan-blue-blob" />
        <div className="tan-blue-blob" />
        <div className="tan-blue-blob" />
      </div>
      <div className="tan-diagonal-texture" aria-hidden="true" />
      <div className="tan-geo-grid" aria-hidden="true" />
      <div className="tan-accent-line" aria-hidden="true" />
      <div className="tan-noise" aria-hidden="true" />

      <div
        className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[380px_1fr]"
        style={{ paddingTop: '64px' }}
      >
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
      </div>
    </>
  )
}
