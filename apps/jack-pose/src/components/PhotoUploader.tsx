/**
 * 照片上传 + 素材网格
 * - 多选上传，HEIC 自动转 JPEG
 * - 图片 Blob 存 IndexedDB，元数据入 store
 * - 点击图片 toggle 加入/移出当前平台
 */
import { useState, useRef, useEffect } from 'react'
import { useProjectStore } from '../stores/projectStore'
import { getThumbUrl, revokePhotoUrl } from '../lib/idb'
import { processUploadImage, formatFileSize } from '../lib/imageUtils'
import { WeChatLogo, XiaohongshuLogo } from './Logos'
import { genId, type Platform, type PhotoMeta } from '../types'
import { toast } from 'sonner'

interface Props {
  projectId: string
  platform: Platform
}

export function PhotoUploader({ projectId, platform }: Props) {
  const project = useProjectStore((s) => s.getProject(projectId))
  const photos = project?.photos ?? []
  const selectedIds = project?.platforms[platform].imageIds ?? []
  const addPhotos = useProjectStore((s) => s.addPhotos)
  const removePhoto = useProjectStore((s) => s.removePhoto)
  const togglePlatformImage = useProjectStore((s) => s.togglePlatformImage)

  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const [urls, setUrls] = useState<Record<string, string>>({})

  // 加载图片 objectURL
  // 始终持有最新的 urls 快照，供卸载/移除时的回收逻辑读取（P1-4）
  const urlsRef = useRef<Record<string, string>>(urls)
  urlsRef.current = urls

  useEffect(() => {
    let cancelled = false
    photos.forEach(async (ph) => {
      if (!urls[ph.id]) {
        const url = await getThumbUrl(ph.id)
        if (url && !cancelled) {
          setUrls((u) => ({ ...u, [ph.id]: url }))
        }
      }
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos])

  // 回收被移除照片对应的 objectURL，避免 Blob URL 泄漏（P1-4）
  useEffect(() => {
    const ids = new Set(photos.map((p) => p.id))
    const stale = Object.keys(urlsRef.current).filter((id) => !ids.has(id))
    if (stale.length === 0) return
    stale.forEach((id) => revokePhotoUrl(id))
    setUrls((u) => {
      const next = { ...u }
      stale.forEach((id) => delete next[id])
      return next
    })
  }, [photos])

  // 卸载时释放当前已加载的全部 objectURL
  useEffect(() => {
    return () => {
      Object.keys(urlsRef.current).forEach((id) => revokePhotoUrl(id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadProgress({ done: 0, total: files.length })
    try {
      const newPhotos: PhotoMeta[] = []
      const blobs = new Map<string, Blob>()
      const thumbs = new Map<string, Blob>()
      let done = 0
      for (const file of Array.from(files)) {
        try {
          const processed = await processUploadImage(file)
          const id = genId()
          newPhotos.push({
            id,
            name: processed.fileName,
            width: processed.width ?? 0,
            height: processed.height ?? 0,
            size: processed.blob.size,
            mimeType: processed.blob.type || 'image/jpeg',
          })
          blobs.set(id, processed.blob)
          thumbs.set(id, processed.thumb)
        } catch {
          toast.error(`${file.name} 处理失败`)
        }
        done++
        setUploadProgress({ done, total: files.length })
      }
      if (newPhotos.length > 0) {
        await addPhotos(projectId, newPhotos, blobs, thumbs)
        toast.success(`已添加 ${newPhotos.length} 张`)
      }
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
      setUploadProgress(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async (photoId: string) => {
    await removePhoto(projectId, photoId)
    revokePhotoUrl(photoId)
    setUrls((u) => {
      const next = { ...u }
      delete next[photoId]
      return next
    })
  }

  const selectedSet = new Set(selectedIds)
  const wechatIds = new Set(project?.platforms.wechat.imageIds ?? [])
  const xhsIds = new Set(project?.platforms.xiaohongshu.imageIds ?? [])

  const wechatCount = project?.platforms.wechat.imageIds.length ?? 0
  const xhsCount = project?.platforms.xiaohongshu.imageIds.length ?? 0
  const unselectedCount = photos.length - new Set([...wechatIds, ...xhsIds]).size

  return (
    <section className="bg-surface-2 rounded-2xl p-4 shadow-sm border border-outline-light">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 rounded-xl border border-dashed border-outline-strong text-primary text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50 transition bg-surface-2"
      >
        {uploading ? (uploadProgress ? `处理中… (${uploadProgress.done}/${uploadProgress.total})` : '处理中…') : '+ 添加照片'}
      </button>

      {photos.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          {photos.map((ph) => {
            const inWechat = wechatIds.has(ph.id)
            const inXhs = xhsIds.has(ph.id)
            const selected = selectedSet.has(ph.id)
            const currentColor =
              platform === 'wechat'
                ? 'ring-wechat'
                : 'ring-xhs'
            return (
              <div
                key={ph.id}
                className={`relative aspect-square rounded-xl overflow-hidden bg-hover group ${
                  selected ? `ring-2 ${currentColor}` : 'ring-1 ring-outline-light'
                }`}
              >
                {urls[ph.id] ? (
                  <button
                    type="button"
                    onClick={() => togglePlatformImage(projectId, platform, ph.id)}
                    aria-pressed={selected}
                    aria-label={`${selected ? '取消选择' : '选择'}图片 ${ph.name}`}
                    className="block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                  >
                    <img
                      src={urls[ph.id]}
                      alt={ph.name}
                      width={400}
                      height={400}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-secondary">
                    加载中
                  </div>
                )}

                {/* 双平台选中标记 */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  {inWechat && (
                    <span className="w-5 h-5 rounded-full bg-wechat text-white shadow-sm flex items-center justify-center">
                      <WeChatLogo className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {inXhs && (
                    <span className="w-5 h-5 rounded-full bg-xhs text-white shadow-sm flex items-center justify-center">
                      <XiaohongshuLogo className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(ph.id)}
                  aria-label="删除图片"
                  className="absolute top-1.5 right-1.5 grid place-items-center w-5 h-5 rounded-full bg-black/50 text-white text-xs transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  {/* 扩大可点击热区到 ≥44px（视觉仍保持小圆点），满足触摸目标尺寸（P3） */}
                  <span className="absolute inset-0 -m-3" aria-hidden="true" />
                  <span className="relative leading-none">×</span>
                </button>
              </div>
            )
          })}
        </div>
      )}

      {photos.length > 0 && (
        <p className="mt-3 text-[11px] text-secondary">
          共 {photos.length} 张 · 朋友圈 {wechatCount} 张 · 小红书 {xhsCount} 张
          {unselectedCount > 0 && ` · 未选 ${unselectedCount} 张`}
          {' · '}
          {formatFileSize(photos.reduce((s, p) => s + p.size, 0))}
        </p>
      )}
    </section>
  )
}
