import { useRef, useCallback } from 'react'
import { flushSync } from 'react-dom'
import type { ReactNode } from 'react'

interface DragGridProps {
  ids: string[]
  onReorder: (ids: string[]) => void
  renderItem: (id: string, index: number, isDragging: boolean) => ReactNode
  className?: string
  horizontal?: boolean
  /** 拖拽触发阈值（px）。设置后允许容器原生滚动，移动超过阈值才开始拖拽 */
  dragThreshold?: number
}

/**
 * 拖拽排序 —— 克隆浮层方案（v3）
 *
 * - dragThreshold 未设置：按下即拖（pointer capture，touch-action:none）
 * - dragThreshold 设置后：移动超过阈值才开始拖（不 capture，touch-action 由外部控制）
 *   适合水平滚动容器（overflow-x-auto + touch-action:pan-x）
 */
export function DragGrid({ ids, onReorder, renderItem, className, horizontal, dragThreshold }: DragGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragIdRef = useRef<string | null>(null)
  const cloneRef = useRef<HTMLElement | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const pointerIdRef = useRef<number | null>(null)
  // 阈值阶段：pendingEl 记录待拖元素
  const pendingElRef = useRef<HTMLElement | null>(null)
  const startPtrRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)

  const cleanup = useCallback(() => {
    if (cloneRef.current) {
      cloneRef.current.remove()
      cloneRef.current = null
    }
    if (containerRef.current) {
      containerRef.current.querySelectorAll<HTMLElement>('[data-did]').forEach((tile) => {
        tile.style.opacity = ''
      })
    }
    if (pointerIdRef.current != null && pendingElRef.current) {
      try { pendingElRef.current.releasePointerCapture(pointerIdRef.current) } catch { /* noop */ }
    }
    pointerIdRef.current = null
    pendingElRef.current = null
    dragIdRef.current = null
    draggingRef.current = false
  }, [])

  const startDrag = useCallback((el: HTMLElement, id: string) => {
    const rect = el.getBoundingClientRect()
    offsetRef.current = { x: startPtrRef.current.x - rect.left, y: startPtrRef.current.y - rect.top }

    // 创建克隆浮层
    const clone = el.cloneNode(true) as HTMLElement
    clone.style.cssText = [
      'position:fixed',
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      'z-index:9999',
      'pointer-events:none',
      'opacity:0.88',
      'box-shadow:0 8px 25px rgba(0,0,0,0.18)',
      'border-radius:8px',
      'overflow:hidden',
      'will-change:left,top',
    ].join(';')
    document.body.appendChild(clone)
    cloneRef.current = clone

    dragIdRef.current = id
    draggingRef.current = true
    el.style.opacity = '0.3'
  }, [])

  const onPointerDown = useCallback((id: string) => (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    // 有阈值时不 preventDefault，允许原生滚动
    if (!dragThreshold) e.preventDefault()

    cleanup()

    const el = e.currentTarget as HTMLElement
    startPtrRef.current = { x: e.clientX, y: e.clientY }
    pendingElRef.current = el

    if (!dragThreshold) {
      // 无阈值：立即开始拖拽
      try { el.setPointerCapture(e.pointerId) } catch { /* noop */ }
      pointerIdRef.current = e.pointerId
      startDrag(el, id)
    }
    // 有阈值：等待移动超过阈值
  }, [cleanup, dragThreshold, startDrag])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // 阈值阶段：检查是否需要开始拖拽
    if (pendingElRef.current && !draggingRef.current) {
      const dx = e.clientX - startPtrRef.current.x
      const dy = e.clientY - startPtrRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dragThreshold && dist >= dragThreshold) {
        // 开始拖拽：获取 pointer capture
        try { pendingElRef.current.setPointerCapture(e.pointerId) } catch { /* noop */ }
        pointerIdRef.current = e.pointerId
        const id = pendingElRef.current.dataset.did
        if (id) startDrag(pendingElRef.current, id)
      }
      return
    }

    const id = dragIdRef.current
    if (!id || !cloneRef.current || !containerRef.current) return

    // 克隆体跟手
    const clone = cloneRef.current
    clone.style.left = `${e.clientX - offsetRef.current.x}px`
    clone.style.top = `${e.clientY - offsetRef.current.y}px`

    // 碰撞检测
    const cloneRect = clone.getBoundingClientRect()
    const cx = cloneRect.left + cloneRect.width / 2
    const cy = cloneRect.top + cloneRect.height / 2

    const tiles = containerRef.current.querySelectorAll<HTMLElement>('[data-did]')
    let targetId: string | null = null
    for (const tile of tiles) {
      const tid = tile.dataset.did
      if (!tid || tid === id) continue
      const r = tile.getBoundingClientRect()
      const th = horizontal ? r.width * 0.3 : r.height * 0.3
      if (cx > r.left - th && cx < r.right + th && cy > r.top - th && cy < r.bottom + th) {
        targetId = tid
        break
      }
    }

    if (!targetId) return

    // 同步更新数组
    const next = [...ids]
    const from = next.indexOf(id)
    const to = next.indexOf(targetId)
    if (from < 0 || to < 0) return
    next.splice(from, 1)
    next.splice(to, 0, id)
    flushSync(() => onReorder(next))
  }, [ids, onReorder, horizontal, dragThreshold, startDrag])

  const onPointerUp = useCallback(() => {
    if (!draggingRef.current) {
      // 未开始拖拽（只是点击或滚动），直接清理 pending 状态
      pendingElRef.current = null
      pointerIdRef.current = null
      return
    }
    cleanup()
  }, [cleanup])

  // touch-action：有阈值时允许水平原生滚动，无阈值时完全禁止
  const touchAction = dragThreshold ? 'pan-x' : 'none'

  return (
    <div ref={containerRef} className={className}>
      {ids.map((id, i) => (
        <div
          key={id}
          data-did={id}
          onPointerDown={onPointerDown(id)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction, userSelect: 'none', cursor: 'grab' }}
        >
          {renderItem(id, i, dragIdRef.current === id)}
        </div>
      ))}
    </div>
  )
}
