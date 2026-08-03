import { useEffect, useRef } from 'react'

/**
 * Spotlight — 聚光灯跟随鼠标
 * 鼠标移动时，径向渐变聚光灯跟随光标实时移动，
 * 光标所在区域局部亮度轻微提亮，引导视线跟随阅读。
 */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const el = ref.current
    if (!el) return

    const isMobile = window.matchMedia('(hover: none)').matches

    let rafId = 0
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0

    const update = () => {
      // Smooth lerp
      currentX += (targetX - currentX) * 0.12
      currentY += (targetY - currentY) * 0.12

      el.style.background = `radial-gradient(circle 400px at ${currentX}px ${currentY}px, rgba(255,255,255,0.06), transparent 70%)`

      rafId = requestAnimationFrame(update)
    }

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        targetX = e.touches[0].clientX
        targetY = e.touches[0].clientY
      }
    }

    if (isMobile) {
      window.addEventListener('touchmove', onTouchMove, { passive: true })
    } else {
      window.addEventListener('mousemove', onMouseMove, { passive: true })
    }

    // Initialize to center
    targetX = window.innerWidth / 2
    targetY = window.innerHeight / 2
    currentX = targetX
    currentY = targetY
    rafId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return <div ref={ref} className="tan-spotlight" aria-hidden="true" />
}
