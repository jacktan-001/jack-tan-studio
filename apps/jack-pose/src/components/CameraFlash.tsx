import { useEffect, useRef, useState } from 'react'

interface Flash {
  id: number
  top: number // vh (%)
  left: number // vw (%)
  size: number // px
  duration: number // ms
  delay: number // ms
}

/**
 * 全局相机闪光特效 — 随机位置、随机时长地闪烁闪光灯，
 * 模拟「四处拍照」的氛围，与 Jack Pose「摆拍 / 摄影」主题契合。
 *
 * 设计要点：
 * - fixed 全屏覆盖，pointer-events:none，绝不拦截任何点击 / 滚动 / 表单交互
 * - z-index 9990：位于内容层(1)与导航栏(999)之上、纸张纹理(9998)与 Toast 之下，确保可见且不遮挡关键 UI
 * - 遵循 prefers-reduced-motion：用户偏好减少动效时不生成任何闪光
 * - 闪光元素在动画结束后自动移除，DOM 始终轻量，不影响性能
 */
export default function CameraFlash() {
  const [flashes, setFlashes] = useState<Flash[]>([])
  const idRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    // 尊重系统「减少动效」偏好：不生成闪光
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    let mounted = true

    const spawn = () => {
      if (!mounted) return
      idRef.current += 1
      const id = idRef.current
      const flash: Flash = {
        id,
        top: 4 + Math.random() * 92, // 4% ~ 96% 视口高度
        left: 4 + Math.random() * 92, // 4% ~ 96% 视口宽度
        size: 120 + Math.random() * 260, // 120px ~ 380px 直径
        duration: 480 + Math.random() * 520, // 480ms ~ 1000ms
        delay: Math.random() * 60, // 轻微错峰
      }
      // 限制并发数量（最多保留最近 8 个），防止意外堆积
      setFlashes((prev) => (prev.length > 8 ? prev.slice(prev.length - 7) : prev).concat(flash))

      // 随机间隔后触发下一次闪光：500ms ~ 1900ms，形成不规则拍照节奏
      const next = 500 + Math.random() * 1400
      timerRef.current = window.setTimeout(spawn, next)
    }

    timerRef.current = window.setTimeout(spawn, 400 + Math.random() * 600)

    return () => {
      mounted = false
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleEnd = (id: number) => {
    setFlashes((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="pose-flash-overlay" aria-hidden="true">
      {flashes.map((f) => (
        <span
          key={f.id}
          className="pose-flash"
          onAnimationEnd={() => handleEnd(f.id)}
          style={{
            top: `${f.top}%`,
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animationDuration: `${f.duration}ms`,
            animationDelay: `${f.delay}ms`,
          }}
        />
      ))}
    </div>
  )
}
