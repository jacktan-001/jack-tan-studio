import { useEffect, useCallback, useState } from 'react'

interface Ripple {
  id: number
  x: number
  y: number
}

/**
 * RippleField — 全局点击水波纹扩散
 * 页面任意点击触发 ripple 水波纹同心圆扩散动画，
 * 波纹使用硬件加速绘制，从点击坐标向外扩散淡出。
 */
export default function RippleField() {
  const [ripples, setRipples] = useState<Ripple[]>([])

  const handleClick = useCallback((e: MouseEvent) => {
    // 忽略点击在交互元素上的波纹（避免干扰按钮等）
    const target = e.target as HTMLElement
    if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a, input, textarea')) {
      return
    }

    const id = Date.now() + Math.random()
    setRipples((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])

    // 动画结束后移除
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 800)
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [handleClick])

  return (
    <div className="wave-ripple-field" aria-hidden="true">
      {ripples.map((r) => (
        <span
          key={r.id}
          className="wave-ripple-circle"
          style={{
            left: `${r.x}px`,
            top: `${r.y}px`,
            width: '20px',
            height: '20px',
          }}
        />
      ))}
    </div>
  )
}
