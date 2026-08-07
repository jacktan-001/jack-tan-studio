/**
 * 小红书预览视图
 * 真实小红书卡片，支持轮播滑动预览 + 缩略图拖拽排序
 */
import { useState, useEffect, useRef } from 'react'
import { DragGrid } from './DragGrid'
import type { ViewProps } from './WechatView'

interface XhsProps extends ViewProps {
  title: string
  onTitle: (v: string) => void
  fullUrls: Record<string, string>
}

export function XiaohongshuView({
  title,
  caption,
  imageIds,
  urls,
  fullUrls,
  onTitle,
  onCaption,
  onReorder,
  onRemove,
}: XhsProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 图片数量变化时重置索引
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(0, imageIds.length - 1)))
  }, [imageIds.length])

  const scrollTo = (idx: number) => {
    const container = scrollRef.current
    if (!container) return
    const child = container.children[idx] as HTMLElement | undefined
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }

  const onScroll = () => {
    const container = scrollRef.current
    if (!container || imageIds.length === 0) return
    let nearest = 0
    let minDist = Infinity
    Array.from(container.children).forEach((child, i) => {
      const r = (child as HTMLElement).getBoundingClientRect()
      const childCenter = r.left + r.width / 2
      const containerRect = container.getBoundingClientRect()
      const dist = Math.abs(childCenter - (containerRect.left + containerRect.width / 2))
      if (dist < minDist) {
        minDist = dist
        nearest = i
      }
    })
    setActiveIndex(nearest)
  }

  return (
    <div className="space-y-3">
      {/* 轮播大图 */}
      {imageIds.length > 0 ? (
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4"
          >
            {imageIds.map((id) => (
              <div
                key={id}
                className="w-full flex-shrink-0 snap-center mr-2 last:mr-0"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-hover">
                  {fullUrls[id] && (
                    <img src={fullUrls[id]} alt="照片" width={300} height={400} loading={imageIds.indexOf(id) === 0 ? 'eager' : 'lazy'} className="w-full h-full object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 左右切换按钮（桌面） */}
          {imageIds.length > 1 && (
            <>
              <button
                onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 shadow text-primary flex items-center justify-center text-xs"
              >
                ‹
              </button>
              <button
                onClick={() => scrollTo(Math.min(imageIds.length - 1, activeIndex + 1))}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 shadow text-primary flex items-center justify-center text-xs"
              >
                ›
              </button>
            </>
          )}

          {/* 指示点 */}
          {imageIds.length > 1 && (
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
              {imageIds.map((id, i) => (
                <span
                  key={id}
                  className={`w-1.5 h-1.5 rounded-full transition ${
                    i === activeIndex ? 'bg-xhs' : 'bg-outline-strong'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-[3/4] rounded-xl bg-hover flex items-center justify-center text-sm text-secondary">
          添加照片开始创作
        </div>
      )}

      {/* 标题 */}
      <input
        value={title}
        onChange={(e) => onTitle(e.target.value)}
        maxLength={20}
        placeholder="标题（≤20字）"
        className="w-full font-bold text-lg text-primary bg-transparent outline-none rounded focus-visible:ring-2 focus-visible:ring-xhs placeholder:text-placeholder placeholder:font-normal"
      />

      {/* 正文 */}
      <textarea
        value={caption}
        onChange={(e) => onCaption(e.target.value)}
        placeholder="正文内容…"
        rows={4}
        className="w-full text-sm leading-relaxed text-primary bg-transparent resize-none outline-none rounded focus-visible:ring-2 focus-visible:ring-xhs placeholder:text-placeholder"
      />

      {/* 缩略图条 + 拖拽排序 */}
      {imageIds.length > 1 && (
        <div className="pt-1">
          <p className="text-[11px] text-secondary mb-1.5">拖拽缩略图排序</p>
          <DragGrid
            ids={imageIds}
            onReorder={onReorder}
            horizontal
            dragThreshold={8}
            className="flex gap-2 overflow-x-auto hide-scrollbar pb-1"
            renderItem={(id, idx) => (
              <div
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-hover ring-1 ${
                  idx === activeIndex ? 'ring-xhs' : 'ring-outline-light'
                }`}
              >
                {urls[id] && (
                  <button
                    type="button"
                    onClick={() => scrollTo(idx)}
                    aria-label={`查看第 ${idx + 1} 张图片`}
                    className="block w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xhs"
                  >
                    <img
                      src={urls[id]}
                      alt=""
                      width={64}
                      height={64}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                )}
                <button
                  onClick={() => onRemove(id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  aria-label={`移除第 ${idx + 1} 张图片`}
                  className="absolute top-0 right-0 w-6 h-6 bg-black/50 text-white text-[10px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
                >
                  ×
                </button>
              </div>
            )}
          />
        </div>
      )}
    </div>
  )
}
