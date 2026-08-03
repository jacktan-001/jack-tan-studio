/**
 * useTilt — 3D 透视倾斜跟随光标
 *
 * Jack Pose 温暖手工风格的核心交互：
 * - 鼠标 hover 时，卡片根据光标坐标做 ±6° 轻微俯仰翻转
 * - 光标移出时平缓归位
 * - 移动端自动降级（不启用倾斜）
 * - 尊重 prefers-reduced-motion
 *
 * 用法：
 * const ref = useRef<HTMLDivElement>(null)
 * useTilt(ref)
 * <div ref={ref} className="pose-tilt-card">...</div>
 */

import { useEffect, type RefObject } from 'react'

const MAX_TILT = 6 // ±6° 最大倾斜角度

export function useTilt(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    // 移动端不启用 3D 倾斜
    const isMobile = window.matchMedia('(hover: none)').matches
    if (isMobile) return

    // 尊重 prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    let rafId = 0
    let targetRx = 0
    let targetRy = 0
    let currentRx = 0
    let currentRy = 0
    let isHovering = false

    const animate = () => {
      // Lerp 平滑过渡
      currentRx += (targetRx - currentRx) * 0.15
      currentRy += (targetRy - currentRy) * 0.15

      if (isHovering) {
        el.style.transform = `perspective(800px) rotateX(${currentRx.toFixed(2)}deg) rotateY(${currentRy.toFixed(2)}deg) translateY(-4px)`
      } else if (Math.abs(currentRx) > 0.01 || Math.abs(currentRy) > 0.01) {
        // 归位动画
        el.style.transform = `perspective(800px) rotateX(${currentRx.toFixed(2)}deg) rotateY(${currentRy.toFixed(2)}deg)`
      } else {
        el.style.transform = ''
      }

      rafId = requestAnimationFrame(animate)
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // 计算光标相对于卡片中心的偏移比例 (-1 ~ 1)
      const deltaX = (e.clientX - centerX) / (rect.width / 2)
      const deltaY = (e.clientY - centerY) / (rect.height / 2)

      // 转换为旋转角度 (±6°)
      // 光标在右 → Y轴正旋转向右倾斜；光标在下 → X轴负旋转向下俯视
      targetRy = deltaX * MAX_TILT
      targetRx = -deltaY * MAX_TILT
    }

    const onMouseEnter = () => {
      isHovering = true
      el.style.willChange = 'transform'
      rafId = requestAnimationFrame(animate)
    }

    const onMouseLeave = () => {
      isHovering = false
      targetRx = 0
      targetRy = 0
      // 继续动画直到归位
      setTimeout(() => {
        if (!isHovering) {
          cancelAnimationFrame(rafId)
          el.style.transform = ''
          el.style.willChange = 'auto'
        }
      }, 400)
    }

    el.addEventListener('mouseenter', onMouseEnter)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    return () => {
      el.removeEventListener('mouseenter', onMouseEnter)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('mouseleave', onMouseLeave)
      cancelAnimationFrame(rafId)
      el.style.transform = ''
      el.style.willChange = 'auto'
    }
  }, [ref])
}
