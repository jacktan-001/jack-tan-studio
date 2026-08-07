/**
 * Jack Tan — 单页壳层挂载入口
 *
 * studio 外壳在客户端路由进入本项目时，通过动态 import 本模块，
 * 调用 mount(container, props) 把应用渲染进外壳容器，卸载时调用 unmount()。
 * 应用不会创建自己的 <audio>（全局播放器由外壳提供），因此导航切换时播放不中断。
 */

import { createRoot, type Root } from 'react-dom/client'
import { TanAppEmbedded } from './App'
import { EMBED_ASSET_BASE, setAssetBase } from './assetBase'
import type { GlobalAudioPlayerReturn } from '@jack-tan/studio-core'

let root: Root | null = null

export interface EmbedProps {
  player: GlobalAudioPlayerReturn
  onError?: (message: string) => void
  /** 覆盖资源基址（默认为本应用在合并部署中的路径） */
  assetBase?: string
}

export function mount(container: HTMLElement, props: EmbedProps): void {
  // 被外壳打包时 import.meta.env.BASE_URL 会退化为 '/'，
  // 这里显式指回本应用的静态资源路径，避免 avatar.jpg 等 404。
  setAssetBase(props.assetBase ?? EMBED_ASSET_BASE)
  root = createRoot(container)
  root.render(<TanAppEmbedded />)
}

export function unmount(): void {
  root?.unmount()
  root = null
}
