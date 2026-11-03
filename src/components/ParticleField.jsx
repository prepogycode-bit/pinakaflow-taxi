import { useEffect, useRef } from 'react'

// A slow field of drifting dots behind the hero. Canvas rather than DOM nodes
// so a few hundred of them cost nothing, and it stops entirely when it is
// scrolled out of view or the visitor asks for reduced motion.

const DENSITY = 1 / 12000 // dots per CSS pixel of area
const MAX_DOTS = 190

const PALETTE = {
  // dark dots for the white sections
  light: [
    [37, 99, 235], // brand blue
    [79, 70, 229], // indigo
    [100, 116, 139], // slate
  ],
  // pale dots for the midnight sections: indigo light, a few taxi-yellow
  // sparks, and white
  dark: [
    [139, 133, 255],
    [255, 194, 26],
    [226, 232, 240],
  ],
}

export default function ParticleField({ className = '', tone = 'light' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = canvas.getContext('2d')
    const colors = PALETTE[tone] || PALETTE.light
    let dots = []
    let w = 0
    let h = 0
    let raf = 0
    let running = false

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(MAX_DOTS, Math.round(w * h * DENSITY))
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.7 + Math.random() * 1.7,
        // slow drift, mostly upward
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.05 - Math.random() * 0.22,
        a: 0.1 + Math.random() * 0.3,
        // each dot breathes at its own rate
        phase: Math.random() * Math.PI * 2,
        speed: 0.006 + Math.random() * 0.012,
        color: colors[Math.floor(Math.random() * colors.length)],
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const d of dots) {
        d.x += d.vx
        d.y += d.vy
        d.phase += d.speed

        // wrap around the edges so the field never thins out
        if (d.y < -4) {
          d.y = h + 4
          d.x = Math.random() * w
        }
        if (d.x < -4) d.x = w + 4
        if (d.x > w + 4) d.x = -4

        const alpha = d.a * (0.55 + 0.45 * Math.sin(d.phase))
        const [r, g, b] = d.color
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const start = () => {
      if (running || reduced) return
      running = true
      raf = requestAnimationFrame(draw)
    }

    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    build()
    if (reduced) {
      draw() // one static frame
      cancelAnimationFrame(raf)
    } else {
      start()
    }

    const onResize = () => {
      build()
      if (reduced) {
        draw()
        cancelAnimationFrame(raf)
      }
    }
    window.addEventListener('resize', onResize)

    // don't burn frames on a section nobody is looking at
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0 }
    )
    io.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      stop()
      io.disconnect()
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [tone])

  return <canvas className={`particles ${className}`.trim()} ref={canvasRef} aria-hidden="true" />
}
