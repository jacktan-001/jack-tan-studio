/**
 * useMagnetic — 磁性吸引交互
 *
 * Studio 科幻未来数字展厅的核心交互：
 * - 监听 mousemove 坐标，计算光标与元素中心的距离
 * - 距离越近，磁吸引力越强，元素向光标方向轻微位移
 * - 最大位移 ~20px，使用 lerp 平滑过渡
 * - 移动端自动降级（不启用磁吸）
 * - 尊重 prefers-reduced-motion
 *
 * 用法：
 * const ref = useRef<HTMLAnchorElement>(null)
 * useMagnetic(ref)
 * <a ref={ref} className="studio-magnetic">按钮</a>
 */
import { useEffect, type RefObject } from 'react'

const MAX_PULL = 20 // 最大磁吸位移像素
const ACTIVE_RADIUS = 120 // 磁吸生效半径（px）
const LERP_FACTOR = 0.15 // 平滑系数

export function useMagnetic(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 移动端不启用磁吸
    const isMobile = window.matchMedia('(hover: none)').matches
    if (isMobile) return

    // 尊重 prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let rafId = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const animate = () => {
      currentX += (targetX - currentX) * LERP_FACTOR
      currentY += (targetY - currentY) * LERP_FACTOR

      if (Math.abs(currentX) > 0.01 || Math.abs(currentY) > 0.01) {
        el.style.transform = `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)`
      } else if (el.style.transform) {
        el.style.transform = ''
      }

      rafId = requestAnimationFrame(animate)
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < ACTIVE_RADIUS) {
        // 距离越近，拉力越强（线性插值）
        const pull = 1 - distance / ACTIVE_RADIUS
        targetX = (dx / ACTIVE_RADIUS) * MAX_PULL * pull
        targetY = (dy / ACTIVE_RADIUS) * MAX_PULL * pull
      } else {
        targetX = 0
        targetY = 0
      }
    }

    const onMouseLeave = () => {
      targetX = 0
      targetY = 0
    }

    // 监听整个 document 的 mousemove（这样才能在光标靠近但未进入元素时就产生磁吸）
    document.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    rafId = requestAnimationFrame(animate)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(rafId)
      if (el.style.transform) el.style.transform = ''
    }
  }, [ref])
}
