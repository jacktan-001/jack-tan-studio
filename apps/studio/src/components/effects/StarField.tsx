/**
 * StarField — Canvas 星粒子 + 扫描线背景特效
 *
 * Studio 科幻未来视觉个性的核心：
 * - 星粒子：随机分布的微小光点，闪烁 + 缓慢漂移
 * - 扫描线：从上向下移动的半透明水平线，营造 CRT 显示器质感
 * - 连线网络：相近粒子之间绘制半透明连线，形成星座网络
 *
 * 性能优化：
 * - 粒子数量根据屏幕尺寸和设备性能自适应
 * - 移动端减少粒子数量并关闭连线网络
 * - 尊重 prefers-reduced-motion
 * - 使用 requestAnimationFrame + delta time 确保帧率独立
 */

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const context = canvasEl.getContext('2d', { alpha: true })
    if (!context) return

    // 尊重 prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const isMobile = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // 显式非空类型引用 — 确保 TypeScript 在闭包中不放宽类型
    const cv: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = context

    let width = 0
    let height = 0
    let particles: Particle[] = []
    let scanLineY = 0
    let animationId = 0
    let lastTime = 0

    // 从 CSS 变量读取主题色
    const getAccentRgb = (): string => {
      const style = getComputedStyle(document.documentElement)
      return style.getPropertyValue('--accent-rgb').trim() || '124, 58, 237'
    }

    const getAccent2Rgb = (): string => {
      const style = getComputedStyle(document.documentElement)
      return style.getPropertyValue('--accent-2-rgb').trim() || '236, 72, 153'
    }

    const getAccent3Rgb = (): string => {
      const style = getComputedStyle(document.documentElement)
      return style.getPropertyValue('--accent-3-rgb').trim() || '6, 182, 212'
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      cv.width = width * dpr
      cv.height = height * dpr
      cv.style.width = width + 'px'
      cv.style.height = height + 'px'
      ctx.scale(dpr, dpr)

      // 粒子密度：桌面 ~0.06/千像素²，移动 ~0.03
      const density = isMobile ? 0.03 : 0.06
      const count = Math.min(Math.floor((width * height) / 10000 * density), isMobile ? 60 : 140)
      particles = Array.from({ length: count }, () => createParticle())
    }

    function createParticle(): Particle {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.5 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      }
    }

    function draw(deltaTime: number) {
      ctx.clearRect(0, 0, width, height)

      const accentRgb = getAccentRgb()
      const accent2Rgb = getAccent2Rgb()
      const accent3Rgb = getAccent3Rgb()

      // 绘制粒子
      for (const p of particles) {
        // 漂移
        p.x += p.vx * deltaTime * 0.06
        p.y += p.vy * deltaTime * 0.06

        // 边界环绕
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // 闪烁
        p.twinklePhase += p.twinkleSpeed * deltaTime * 0.06
        const twinkle = (Math.sin(p.twinklePhase) + 1) / 2
        const alpha = p.opacity * (0.4 + twinkle * 0.6)

        // 随机选择三色之一
        const colorIdx = Math.floor(p.twinklePhase) % 3
        const rgb = colorIdx === 0 ? accentRgb : colorIdx === 1 ? accent2Rgb : accent3Rgb

        // 绘制光点 — 带光晕
        const glowSize = p.size * 3
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize)
        gradient.addColorStop(0, `rgba(${rgb}, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(${rgb}, ${alpha * 0.3})`)
        gradient.addColorStop(1, `rgba(${rgb}, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // 核心亮点
        ctx.fillStyle = `rgba(${rgb}, ${Math.min(alpha * 1.5, 1)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // 连线网络 — 仅桌面端
      if (!isMobile) {
        const maxDist = 120
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i]!.x - particles[j]!.x
            const dy = particles[i]!.y - particles[j]!.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.08
              ctx.strokeStyle = `rgba(${accentRgb}, ${alpha})`
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(particles[i]!.x, particles[i]!.y)
              ctx.lineTo(particles[j]!.x, particles[j]!.y)
              ctx.stroke()
            }
          }
        }
      }

      // 扫描线 — 从上向下移动
      scanLineY += deltaTime * 0.04
      if (scanLineY > height + 100) scanLineY = -100

      const scanGradient = ctx.createLinearGradient(0, scanLineY - 80, 0, scanLineY + 80)
      scanGradient.addColorStop(0, `rgba(${accentRgb}, 0)`)
      scanGradient.addColorStop(0.5, `rgba(${accentRgb}, 0.03)`)
      scanGradient.addColorStop(1, `rgba(${accentRgb}, 0)`)
      ctx.fillStyle = scanGradient
      ctx.fillRect(0, scanLineY - 80, width, 160)

      // 扫描线核心 — 细亮线
      ctx.strokeStyle = `rgba(${accent3Rgb}, 0.06)`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, scanLineY)
      ctx.lineTo(width, scanLineY)
      ctx.stroke()

      animationId = requestAnimationFrame((time) => {
        const dt = lastTime ? time - lastTime : 16
        lastTime = time
        draw(Math.min(dt, 33)) // 限制 delta 防止跳帧
      })
    }

    resize()
    window.addEventListener('resize', resize)
    animationId = requestAnimationFrame((time) => {
      lastTime = time
      draw(16)
    })

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
