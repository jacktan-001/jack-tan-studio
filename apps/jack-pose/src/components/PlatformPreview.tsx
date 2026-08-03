/**
 * 平台预览即编辑
 * - 朋友圈：真实朋友圈卡片，支持图片拖拽排序
 * - 小红书：真实小红书卡片，支持轮播滑动预览 + 缩略图拖拽排序
 */
import { useState, useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { getPhotoUrl, getThumbUrl } from '../lib/idb'
import { WeChatLogo, XiaohongshuLogo } from './Logos'
import type { Platform } from '../types'
import { WechatView } from './WechatView'
import { XiaohongshuView } from './XiaohongshuView'

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
