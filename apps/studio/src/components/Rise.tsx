import { type CSSProperties, type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

/**
 * 通用入场动画包装：进入视口时上浮淡入。
 *
 * 2026 P1 重构：优先使用 CSS Scroll-driven Animation（`animation-timeline: view()`），
 * 在 Chrome/Safari 上零 JS 开销、不走主线程。Firefox 等不支持的环境自动回退到
 * IntersectionObserver + `.anim-rise` 注入（原有方案）。
 */
const supportsScrollDriven =
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()')

export function Rise({
  children,
  className = '',
  delay,
  style,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  style?: CSSProperties
  as?: 'div' | 'section' | 'span'
}) {
  // 浏览器支持 scroll-driven → 纯 CSS 方案，不需要 JS observer
  if (supportsScrollDriven) {
    return (
      <Tag
        className={`reveal-scroll ${className}`}
        style={{ ...style, animationDelay: delay ? `${delay}s` : undefined }}
      >
        {children}
      </Tag>
    )
  }

  // Fallback: IntersectionObserver + .anim-rise（Firefox 等）
  const { ref, inView } = useInView<HTMLDivElement>()
  return (
    <Tag
      ref={ref}
      className={`anim-rise ${inView ? 'is-visible' : ''} ${className}`}
      style={{ ...style, animationDelay: delay ? `${delay}s` : undefined }}
    >
      {children}
    </Tag>
  )
}
