import { type CSSProperties, type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

/**
 * N-2 通用入场动画包装：进入视口时上浮淡入，替代 Framer Motion 的 whileInView / initial+animate。
 * 配合 index.css 的 .anim-rise / .is-visible 使用，不引入任何 JS 动画库。
 */
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
