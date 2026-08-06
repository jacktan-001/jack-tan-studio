import { useState, useRef, useCallback, useEffect } from 'react'
import type { PhotoMeta } from '../types'
import type { CropSettings } from '../lib/importExport'

const ASPECTS: { key: CropSettings['aspect']; label: string }[] = [
  { key: 'original', label: '原始' },
  { key: '1:1', label: '1:1' },
  { key: '3:4', label: '3:4' },
  { key: '4:3', label: '4:3' },
  { key: '16:9', label: '16:9' },
]

/** 裁剪弹窗：可拖拽图片 + 缩放 + 比例 */
export function CropModal({
  url,
  photo,
  initial,
  onChange,
  onClose,
}: {
  url: string
  photo: PhotoMeta
  initial?: CropSettings
  onChange: (c: CropSettings) => void
  onClose: () => void
}) {
  const [aspect, setAspect] = useState<CropSettings['aspect']>(initial?.aspect ?? 'original')
  const [scale, setScale] = useState(initial?.scale ?? 1)
  const [translate, setTranslate] = useState({
    x: initial?.translateX ?? 0,
    y: initial?.translateY ?? 0,
  })
  const dragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // 无障碍：打开时聚焦弹窗、Esc 关闭、Tab 键在弹窗内循环（焦点陷阱）（P3）
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      )
    // 初始焦点：优先第一个可聚焦元素，否则聚焦弹窗本身
    ;(getFocusable()[0] ?? dialog).focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab') return
      const items = getFocusable()
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', onKeyDown)
    return () => dialog.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const imgR = photo.width / photo.height
  const boxSize = 280
  const rMap: Record<CropSettings['aspect'], number> = {
    original: imgR,
    '1:1': 1,
    '3:4': 3 / 4,
    '4:3': 4 / 3,
    '16:9': 16 / 9,
  }
  const r = rMap[aspect]
  let boxW = boxSize
  let boxH = boxSize / r
  if (boxH > boxSize * 1.3) {
    boxH = boxSize * 1.3
    boxW = boxH * r
  }

  const apply = useCallback(() => {
    onChange({ scale, translateX: translate.x, translateY: translate.y, aspect })
  }, [aspect, scale, translate, onChange])

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTranslate((prev) => ({ x: prev.x + dx * 0.01, y: prev.y + dy * 0.01 }))
  }

  const handlePointerUp = () => {
    dragging.current = false
    apply()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="裁剪图片"
        tabIndex={-1}
        className="relative bg-surface-2 rounded-3xl w-full max-w-sm p-5 shadow-2xl mx-4"
      >
        <h4 className="font-semibold text-primary mb-4">裁剪图片</h4>

        <div className="flex justify-center mb-4">
          <div
            ref={containerRef}
            className="relative bg-hover overflow-hidden"
            style={{ width: boxW, height: boxH }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img
              src={url}
              alt=""
              draggable={false}
              className="absolute top-0 left-0 w-full h-full object-contain touch-none"
              style={{
                transform: `translate(calc(-50% + ${50 + translate.x * 50}%), calc(-50% + ${50 + translate.y * 50}%)) scale(${scale})`,
                transformOrigin: 'center center',
              }}
            />
            <div className="absolute inset-0 border-2 border-accent/50 pointer-events-none" />
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/40" />
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-secondary text-center mb-3">拖拽移动 · 缩放调整裁剪范围</p>

        <div className="mb-4">
          <label className="text-xs text-secondary block mb-1.5">缩放</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            onMouseUp={apply}
            onTouchEnd={apply}
            className="w-full accent-accent"
          />
        </div>

        <div className="mb-5">
          <label className="text-xs text-secondary block mb-1.5">比例</label>
          <div className="flex gap-2 flex-wrap">
            {ASPECTS.map((a) => (
              <button
                key={a.key}
                onClick={() => {
                  setAspect(a.key)
                  setTranslate({ x: 0, y: 0 })
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  aspect === a.key
                    ? 'bg-accent text-white'
                    : 'bg-hover text-primary'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              apply()
              onClose()
            }}
            className="flex-1 py-3 rounded-xl bg-accent text-white text-sm font-medium"
          >
            确认
          </button>
          <button
            onClick={() => {
              setScale(1)
              setTranslate({ x: 0, y: 0 })
              setAspect('original')
              onChange({ scale: 1, translateX: 0, translateY: 0, aspect: 'original' })
            }}
            className="flex-1 py-3 rounded-xl bg-hover text-secondary text-sm font-medium"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  )
}
