/**
 * 朋友圈预览视图
 * 真实朋友圈卡片，支持图片拖拽排序
 */
import { useState } from 'react'
import { DragGrid } from './DragGrid'
import { AvatarBear } from './Logos'

export interface ViewProps {
  caption: string
  imageIds: string[]
  urls: Record<string, string>
  onCaption: (v: string) => void
  onReorder: (ids: string[]) => void
  onRemove: (id: string) => void
}

export function WechatView({ caption, imageIds, urls, onCaption, onReorder, onRemove }: ViewProps) {
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
                <img src={urls[id]} alt="" width={400} height={400} loading="lazy" className="w-full h-full object-cover" draggable={false} />
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
