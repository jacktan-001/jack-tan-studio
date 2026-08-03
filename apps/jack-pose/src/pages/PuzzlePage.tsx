/**
 * 拼长图页面：裁切 + 预览一体化
 * - 上传照片后立即看到拼接预览
 * - 点击预览中的图片可裁切
 * - 支持拖拽排序、删除、继续添加
 * - 方向切换后立即更新预览
 */
import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { exportLongImage } from '../lib/importExport'
import { CropModal } from '../components/LongImageSelector'
import { DragGrid } from '../components/DragGrid'
import { genId, emptyContent, type PhotoMeta } from '../types'
import { getPhoto, putPhoto, putThumb, deletePhoto } from '../lib/idb'
import { processUploadImage } from '../lib/imageUtils'
import type { CropSettings } from '../lib/importExport'
import { toast } from 'sonner'

const STORAGE_KEY = 'puzzle-session'

export function PuzzlePage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<PhotoMeta[]>([])
  const [urls, setUrls] = useState<Record<string, string>>({})
  // 用 ref 追踪最新的 urls，以便卸载时统一释放 Object URL
  const urlsRef = useRef<Record<string, string>>({})
  urlsRef.current = urls
  const [order, setOrder] = useState<string[]>([])
  const [direction, setDirection] = useState<'vertical' | 'horizontal'>('vertical')
  const [crops, setCrops] = useState<Record<string, CropSettings>>({})
  const [cropId, setCropId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // 从 sessionStorage 恢复状态
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.photos) setPhotos(s.photos)
        if (s.order) setOrder(s.order)
        if (s.direction) setDirection(s.direction)
        if (s.crops) setCrops(s.crops)
      }
    } catch { /* ignore */ }
  }, [])

  // 为没有 URL 的照片从 IndexedDB 加载并生成 Object URL
  useEffect(() => {
    let cancelled = false
    photos.forEach(async (p) => {
      if (urls[p.id]) return
      const blob = await getPhoto(p.id)
      if (blob && !cancelled) {
        setUrls((prev) => ({ ...prev, [p.id]: URL.createObjectURL(blob) }))
      }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos])

  // 状态变化时保存到 sessionStorage
  useEffect(() => {
    if (photos.length === 0 && order.length === 0) {
      sessionStorage.removeItem(STORAGE_KEY)
      return
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ photos, order, direction, crops }))
    } catch { /* ignore */ }
  }, [photos, order, direction, crops])

  // 卸载时清理所有 Object URL（通过 ref 读取最新的 urls）
  useEffect(() => {
    return () => {
      Object.values(urlsRef.current).forEach((url) => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
      })
    }
  }, [])

  const reorderPhotos = (newIds: string[]) => setOrder(newIds)

  const addPhotos = async (files: FileList | null) => {
    if (!files) return
    const newPhotos: PhotoMeta[] = []
    const newUrls: Record<string, string> = {}

    for (const file of Array.from(files)) {
      try {
        const processed = await processUploadImage(file)
        if (!processed) continue
        const id = genId()
        const blob = processed.blob
        await putPhoto(id, blob)
        await putThumb(id, processed.thumb)
        newPhotos.push({
          id,
          name: file.name,
          width: processed.width ?? 0,
          height: processed.height ?? 0,
          size: blob.size,
          mimeType: blob.type,
        })
        newUrls[id] = URL.createObjectURL(blob)
      } catch (e) {
        toast.error(`「${file.name}」处理失败`)
      }
    }

    if (newPhotos.length === 0) return
    setPhotos((prev) => [...prev, ...newPhotos])
    setOrder((prev) => [...prev, ...newPhotos.map((p) => p.id)])
    setUrls((prev) => ({ ...prev, ...newUrls }))
    if (inputRef.current) inputRef.current.value = ''
  }

  const remove = async (id: string) => {
    // 释放 Object URL
    if (urls[id] && urls[id].startsWith('blob:')) {
      URL.revokeObjectURL(urls[id])
    }
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setOrder((prev) => prev.filter((x) => x !== id))
    setUrls((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setCrops((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await deletePhoto(id)
  }

  const handleExport = useCallback(async () => {
    if (order.length === 0) {
      toast.error('请先添加照片')
      return
    }
    setBusy(true)
    try {
      const fakeProject = {
        id: genId(),
        title: '拼长图',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        photos,
        platforms: { wechat: emptyContent(), xiaohongshu: emptyContent() },
      }
      await exportLongImage(fakeProject, 'wechat', {
        imageIds: order,
        direction,
        crops,
        fileName: `拼长图_${order.length}张_${direction === 'vertical' ? '纵向' : '横向'}.png`,
      })
      toast.success('长图已保存')
    } catch (e) {
      toast.error((e as Error).message || '生成失败')
    } finally {
      setBusy(false)
    }
  }, [order, photos, direction, crops])

  return (
    <div className="min-h-screen bg-hover text-primary">
      <header className="sticky top-0 z-10 bg-surface-2/80 backdrop-blur-xl border-b border-outline-strong">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-accent text-sm font-medium"
          >
            ← 返回
          </button>
          <h1 className="text-lg font-semibold">拼长图</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* 方向切换（紧凑） */}
        <div className="flex rounded-xl bg-surface-2 border border-outline-light p-1">
          <button
            onClick={() => setDirection('vertical')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              direction === 'vertical'
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:bg-hover'
            }`}
          >
            ↕ 纵向
          </button>
          <button
            onClick={() => setDirection('horizontal')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
              direction === 'horizontal'
                ? 'bg-accent text-white shadow-sm'
                : 'text-secondary hover:bg-hover'
            }`}
          >
            ↔ 横向
          </button>
        </div>

        {/* 上传 / 添加 */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          multiple
          className="hidden outline-none"
          onChange={(e) => addPhotos(e.target.files)}
        />

        {/* 照片缩略图（顶部，拖拽排序，朋友圈九宫格风格） */}
        {photos.length > 0 && (() => {
          const cols = photos.length === 1 ? 'grid-cols-1' : photos.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'
          return (
            <section className="space-y-2">
              <p className="text-xs text-secondary px-1">
                {photos.length} 张照片 · 拖拽排序
              </p>
              <DragGrid
                ids={order}
                onReorder={reorderPhotos}
                className={`grid ${cols} gap-1`}
                renderItem={(id, idx) => (
                  <div className="relative aspect-square rounded overflow-hidden bg-hover group">
                    {urls[id] && (
                      <img src={urls[id]} alt="" width={400} height={400} loading="lazy" className="w-full h-full object-cover" draggable={false} />
                    )}
                    <span className="absolute top-1.5 left-1.5 text-[10px] text-white bg-black/40 px-1 rounded z-10">
                      {idx + 1}
                    </span>
                    {crops[id] && (
                      <span className="absolute top-1.5 right-6 text-[9px] text-white bg-accent/80 px-1 rounded z-10">
                        ✂
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); remove(id) }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 text-white text-xs flex items-center justify-center z-10"
                    >
                      ×
                    </button>
                  </div>
                )}
              />
            </section>
          )
        })()}

        {/* 实时拼接预览（点击可裁切） */}
        {photos.length > 0 && (
          <section className="bg-surface-2 rounded-2xl overflow-hidden border border-outline-light shadow-sm">
            <div className="px-4 py-2.5 border-b border-divider flex items-center justify-between">
              <span className="text-xs text-secondary font-medium">
                拼接预览 · {order.length} 张
              </span>
              <span className="text-[11px] text-secondary">
                点击图片可裁切
              </span>
            </div>
            <div className={direction === 'vertical' ? 'flex flex-col' : 'flex flex-row overflow-x-auto hide-scrollbar'}>
              {order.map((id, idx) => (
                <button
                  key={id}
                  onClick={() => setCropId(id)}
                  className={`relative group overflow-hidden bg-hover transition flex-shrink-0 ${
                    direction === 'vertical'
                      ? 'w-full border-b border-divider last:border-b-0'
                      : 'border-r border-divider last:border-r-0'
                  }`}
                  style={direction === 'horizontal' ? { width: `${Math.max(120, 320 / order.length)}px` } : undefined}
                >
                  {urls[id] && (
                    <img
                      src={urls[id]}
                      alt=""
                      width={400}
                      height={300}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className={`w-full object-cover transition-transform ${
                        direction === 'vertical' ? 'max-h-[300px]' : ''
                      }`}
                      style={direction === 'horizontal' ? { height: '200px' } : undefined}
                      draggable={false}
                    />
                  )}
                  {/* 裁切标记 */}
                  {crops[id] && (
                    <span className="absolute top-2 left-2 text-[10px] text-white bg-accent/80 px-1.5 py-0.5 rounded-full">
                      已裁切
                    </span>
                  )}
                  {/* 序号 */}
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/40 text-white text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  {/* 悬停裁切提示 */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
                      裁切
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 添加更多 / 空状态 */}
        {photos.length > 0 ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-3 rounded-xl border-2 border-dashed border-outline-strong text-secondary text-sm font-medium hover:border-accent hover:text-accent transition"
          >
            + 继续添加
          </button>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full py-8 rounded-2xl border-2 border-dashed border-outline-strong text-secondary text-sm font-medium hover:border-accent hover:text-accent transition"
          >
            <div className="text-center">
              <p className="text-xl mb-1">📷</p>
              <p>点击添加照片（支持 HEIC）</p>
              <p className="text-xs mt-1 text-placeholder">上传后立即预览拼接效果</p>
            </div>
          </button>
        )}

        {/* 导出按钮 */}
        {photos.length > 0 && (
          <button
            onClick={handleExport}
            disabled={busy || order.length === 0}
            className="w-full py-4 rounded-xl bg-accent text-white text-base font-medium disabled:opacity-40 transition shadow-sm hover:bg-accent-hover active:scale-[0.98]"
          >
            {busy ? '生成中…' : `保存长图（${order.length} 张）`}
          </button>
        )}
      </main>

      {/* 裁切弹窗 */}
      {cropId && urls[cropId] && (
        <CropModal
          url={urls[cropId]}
          photo={photos.find((p) => p.id === cropId)!}
          initial={crops[cropId]}
          onChange={(crop: CropSettings) => setCrops((prev) => ({ ...prev, [cropId]: crop }))}
          onClose={() => setCropId(null)}
        />
      )}
    </div>
  )
}
