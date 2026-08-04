import { useEffect, useRef, useState } from 'react'

/**
 * N-2 配套 hook：用 IntersectionObserver 替代 Framer Motion 的 whileInView，
 * 在元素进入视口时给容器加上 .is-visible，触发 index.css 里的 .anim-rise 入场动画。
 * 这样入场动画不再需要把整个 motion 库塞进首屏关键路径。
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: '0px 0px -80px 0px' },
) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // 不支持 IO 的环境直接显示，避免内容永远隐藏
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(entry.target)
        }
      })
    }, options)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, inView }
}
