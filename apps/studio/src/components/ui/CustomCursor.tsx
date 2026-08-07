import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches
    if (prefersReduced || isTouchDevice) return

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      const target = e.target as HTMLElement
      setHovering(
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('[data-cursor-hover]') !== null
      )
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      className={`custom-cursor ${hovering ? 'hovering' : ''}`}
      style={{ left: pos.x, top: pos.y }}
    />
  )
}
