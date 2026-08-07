/**
 * App — Jack Tan 主应用组件
 *
 * 单页壳层（studio）合并架构下的两种装配方式：
 * - `App`（默认导出）：独立部署入口。自托管 player + StudioBar + GlobalAudioPlayer，
 *   由 main.tsx 包在 ThemeProvider 中渲染。
 * - `TanAppEmbedded`：被 studio 外壳客户端挂载时使用的入口。不创建音频、
 *   不渲染 StudioBar / GlobalAudioPlayer（由外壳统一提供），让外壳唯一的 <audio>
 *   在导航时持续播放，实现零间隙。
 *
 * 公共 UI 抽到 `TanContent`，两种装配方式共用同一份结构；
 * 顶部留白仅在独立部署时生效（嵌入时由外壳 .page-wrap 统一预留）。
 */

import { StudioBar, GlobalAudioPlayer, useGlobalAudioPlayer } from '@jack-tan/studio-core'
import Sidebar from './components/Sidebar'
import RevealObserver from './components/RevealObserver'
import Spotlight from './components/Spotlight'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Works from './components/Works'
import Patents from './components/Patents'
import Skills from './components/Skills'
import Footer from './components/Footer'

/**
 * TanContent — Jack Tan 的全部 UI。
 * @param embedded 嵌入 studio 外壳时为 true：顶部不再为 StudioBar 预留 64px
 *                 （外壳的 .page-wrap 已统一预留），避免出现双倍留白。
 */
function TanContent({ embedded = false }: { embedded?: boolean }) {
  return (
    <>
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

      {/* 聚光灯跟随鼠标 — 径向渐变提亮光标区域 */}
      <Spotlight />

      <div
        className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] grid-cols-1 lg:grid-cols-[400px_1fr] lg:gap-10"
        style={{
          paddingTop: embedded
            ? 'calc(24px + env(safe-area-inset-top, 0px))'
            : 'calc(64px + env(safe-area-inset-top, 0px))',
        }}
      >
        <Sidebar />
        <RevealObserver>
          <main className="px-4 pt-12 pb-32 sm:px-8 lg:px-16 lg:pt-16 lg:pb-36 xl:px-20">
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

/**
 * App — 独立部署入口（默认导出）。
 * 自托管 player + StudioBar + GlobalAudioPlayer。
 */
export default function App() {
  const player = useGlobalAudioPlayer()

  return (
    <>
      <StudioBar current="tan" />

      <TanContent />

      {/* 跨应用全局底部播放器 */}
      <GlobalAudioPlayer player={player} />
    </>
  )
}

/**
 * TanAppEmbedded — 被 studio 单页外壳客户端挂载时的入口。
 * 不创建音频、不渲染 StudioBar / GlobalAudioPlayer（外壳统一提供）。
 */
export function TanAppEmbedded() {
  return <TanContent embedded />
}
