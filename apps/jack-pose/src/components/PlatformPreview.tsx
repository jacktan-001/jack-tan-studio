/**
 * 平台预览即编辑
 * - 朋友圈：真实朋友圈卡片，支持图片拖拽排序
 * - 小红书：真实小红书卡片，支持轮播滑动预览 + 缩略图拖拽排序
 */
import { useState, useEffect, useRef } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { getPhotoUrl, getThumbUrl } from '../lib/idb'
import { DragGrid } from './DragGrid'
import { WeChatLogo, XiaohongshuLogo } from './Logos'
import { AvatarBear } from './Logos'
import type { Platform } from '../types'

interface Props {
  projectId: string
  platform: Platform
}

export function PlatformPreview({ projectId, platform }: Props) {
  const project = useProjectStore((s) => s.getProject(projectId))
  const content = project?.platforms[platform]
  const setPlatformContent = useProjectStore((s) => s.setPlatformContent)
  const reorderPlatformImages = useProjectStore((s) => s.reorderPlatformImages)
  const togglePlatformImage = useProjectStore((s) => s.togglePlatformImage)
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [fullUrls, setFullUrls] = useState<Record<string, string>>({})

  const imageIds = content?.imageIds ?? []

  useEffect(() => {
    let cancelled = false
    imageIds.forEach(async (id) => {
      if (!urls[id]) {
        const url = await getThumbUrl(id)
        if (url && !cancelled) setUrls((u) => ({ ...u, [id]: url }))
      }
      if (!fullUrls[id]) {
        const fullUrl = await getPhotoUrl(id)
        if (fullUrl && !cancelled) setFullUrls((u) => ({ ...u, [id]: fullUrl }))
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageIds])

  if (!project || !content) return null

  const handleReorder = (ids: string[]) => {
    reorderPlatformImages(projectId, platform, ids)
  }

  const removeImage = (id: string) => togglePlatformImage(projectId, platform, id)

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        {platform === 'wechat' ? (
          <WeChatLogo className="w-5 h-5" />
        ) : (
          <XiaohongshuLogo className="w-5 h-5" />
        )}
        <span className="text-sm font-semibold text-primary">
          {platform === 'wechat' ? '朋友圈预览' : '小红书预览'}
        </span>
      </div>

      <div className="bg-surface-2 rounded-2xl p-4 text-primary shadow-sm border border-outline-light">
        {platform === 'wechat' ? (
          <WechatView
            caption={content.caption}
            imageIds={imageIds}
            urls={urls}
            onCaption={(v) => setPlatformContent(projectId, platform, { caption: v })}
            onReorder={handleReorder}
            onRemove={removeImage}
          />
        ) : (
          <XiaohongshuView
            title={content.title}
            caption={content.caption}
            imageIds={imageIds}
            urls={urls}
            fullUrls={fullUrls}
            onTitle={(v) => setPlatformContent(projectId, platform, { title: v })}
            onCaption={(v) => setPlatformContent(projectId, platform, { caption: v })}
            onReorder={handleReorder}
            onRemove={removeImage}
          />
        )}
      </div>
    </section>
  )
}

// ==================== 朋友圈 ====================

interface ViewProps {
  caption: string
  imageIds: string[]
  urls: Record<string, string>
  onCaption: (v: string) => void
  onReorder: (ids: string[]) => void
  onRemove: (id: string) => void
}

function WechatView({ caption, imageIds, urls, onCaption, onReorder, onRemove }: ViewProps) {
  const gridCols =
    imageIds.length === 1 ? 'grid-cols-1' : imageIds.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
  const colClass = gridCols
  const nowText = new Date().toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const [showActions, setShowActions] = useState(false)

  return (
    <div className="space-y-3">
      {/* 头像 + 昵称 */}
      <div className="flex items-start gap-3">
        <AvatarBear size={40} className="rounded-lg flex-shrink-0" />
        <div className="pt-0.5">
          <div className="text-[15px] font-semibold text-[#576b95]">Jack-Pose</div>
        </div>
      </div>

      {/* 文案 */}
      <textarea
        value={caption}
        onChange={(e) => onCaption(e.target.value)}
        placeholder="这一刻的想法…"
        rows={2}
        className="w-full text-[15px] leading-relaxed text-primary bg-transparent resize-none outline-none placeholder:text-placeholder"
      />

      {/* 九宫格 + 拖拽排序 */}
      {imageIds.length > 0 && (
        <DragGrid
          ids={imageIds}
          onReorder={onReorder}
          className={`grid ${colClass} gap-1`}
          renderItem={(id) => (
            <div className="relative aspect-square rounded overflow-hidden bg-hover group">
              {urls[id] && (
                <img src={urls[id]} alt="" className="w-full h-full object-cover" draggable={false} />
              )}
              <button
                onClick={() => onRemove(id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 text-white text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}
        />
      )}

      {/* 时间（无定位） */}
      <div className="text-xs text-secondary">
        {nowText}
      </div>

      {/* 点赞 / 评论栏 —— 仿微信"..."按钮 */}
      <div className="relative flex items-center justify-end pt-1 border-t border-divider">
        <button
          onClick={() => setShowActions((v) => !v)}
          className="w-9 h-7 rounded bg-hover flex items-center justify-center text-[#576b95] text-lg tracking-tighter"
        >
          ···
        </button>
        {showActions && (
          <div className="absolute right-0 top-9 z-10 flex items-center gap-0 rounded-lg overflow-hidden shadow-lg text-sm">
            <button
              onClick={() => setShowActions(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4c4c4c] text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              赞
            </button>
            <div className="w-px h-5 bg-white/20" />
            <button
              onClick={() => setShowActions(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#4c4c4c] text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
              </svg>
              评论
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== 小红书 ====================

interface XhsProps extends ViewProps {
  title: string
  onTitle: (v: string) => void
  fullUrls: Record<string, string>
}

function XiaohongshuView({
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
    const center = container.scrollLeft + container.clientWidth / 2
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
                    <img src={fullUrls[id]} alt="" className="w-full h-full object-cover" />
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
        className="w-full font-bold text-lg text-primary bg-transparent outline-none placeholder:text-placeholder placeholder:font-normal"
      />

      {/* 正文 */}
      <textarea
        value={caption}
        onChange={(e) => onCaption(e.target.value)}
        placeholder="正文内容…"
        rows={4}
        className="w-full text-sm leading-relaxed text-primary bg-transparent resize-none outline-none placeholder:text-placeholder"
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
            renderItem={(id, idx, isDragging) => (
              <div
                className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-hover ring-1 ${
                  idx === activeIndex ? 'ring-xhs' : 'ring-outline-light'
                }`}
              >
                {urls[id] && (
                  <img
                    src={urls[id]}
                    alt=""
                    className="w-full h-full object-cover"
                    onClick={() => scrollTo(idx)}
                  />
                )}
                <button
                  onClick={() => onRemove(id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute top-0 right-0 w-4 h-4 bg-black/50 text-white text-[10px] flex items-center justify-center"
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
