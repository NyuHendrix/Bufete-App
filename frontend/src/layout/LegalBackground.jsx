import { useEffect, useRef } from 'react'

const GLYPHS = ['¶', '§', '&']

/* ---------- Símbolos vectoriales (dibujados a mano, sin emojis) ---------- */

function drawScales(c, s) {
  // Balanza de la justicia
  c.beginPath(); c.moveTo(0, -s); c.lineTo(0, s * 0.7); c.stroke()
  c.beginPath(); c.moveTo(-s * 0.9, -s * 0.55); c.lineTo(s * 0.9, -s * 0.55); c.stroke()
  c.beginPath(); c.arc(0, -s, s * 0.18, 0, Math.PI * 2); c.stroke()
  ;[-1, 1].forEach((dir) => {
    const x = dir * s * 0.9, y = -s * 0.55
    c.beginPath()
    c.moveTo(x, y); c.lineTo(x - s * 0.3, y + s * 0.55); c.lineTo(x + s * 0.3, y + s * 0.55)
    c.closePath(); c.stroke()
    c.beginPath(); c.arc(x, y + s * 0.62, s * 0.34, 0, Math.PI); c.stroke()
  })
  c.beginPath(); c.moveTo(-s * 0.5, s * 0.85); c.lineTo(s * 0.5, s * 0.85); c.stroke()
}

function drawGavel(c, s) {
  // Mazo de juez
  c.save(); c.rotate(-Math.PI / 4)
  c.strokeRect(-s * 0.15, -s * 0.15, s * 0.3, s * 1.1)
  c.strokeRect(-s * 0.55, -s * 0.55, s * 1.1, s * 0.45)
  c.beginPath(); c.moveTo(-s * 0.8, s * 0.75); c.lineTo(s * 0.8, s * 0.75); c.stroke()
  c.restore()
}

function drawColumn(c, s) {
  // Columna de tribunal
  c.strokeRect(-s * 0.45, -s * 0.9, s * 0.9, s * 0.18)
  c.strokeRect(-s * 0.32, -s * 0.72, s * 0.64, s * 1.3)
  for (let i = -1; i <= 1; i++) {
    c.beginPath(); c.moveTo(i * s * 0.18, -s * 0.68); c.lineTo(i * s * 0.18, s * 0.52); c.stroke()
  }
  c.strokeRect(-s * 0.5, s * 0.58, s, s * 0.18)
}

function drawCoin(c, s) {
  // Moneda ₡ (temática contable)
  c.beginPath(); c.arc(0, 0, s * 0.85, 0, Math.PI * 2); c.stroke()
  c.beginPath(); c.arc(0, 0, s * 0.62, 0, Math.PI * 2); c.stroke()
  c.font = `bold ${s}px Georgia, serif`
  c.textAlign = 'center'; c.textBaseline = 'middle'
  c.fillText('₡', 0, s * 0.04)
}

function drawBook(c, s) {
  // Código legal / libro de cuentas
  c.strokeRect(-s * 0.8, -s * 0.6, s * 1.6, s * 1.2)
  c.beginPath(); c.moveTo(0, -s * 0.6); c.lineTo(0, s * 0.6); c.stroke()
  c.beginPath(); c.moveTo(-s * 0.65, -s * 0.35); c.lineTo(-s * 0.15, -s * 0.35); c.stroke()
}

const SHAPES = [
  { fn: drawScales, w: 3 }, { fn: drawGavel, w: 2 }, { fn: drawColumn, w: 2 },
  { fn: drawCoin, w: 2 }, { fn: drawBook, w: 2 }, { glyph: true, w: 3 },
]
const COLORS = ['#3b5bdb', '#64748b', '#8a6d1d', '#334155']

/** Fondo legal interactivo: símbolos flotantes + parallax con el mouse */
export default function LegalBackground() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const c = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 }

    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    const onMove = (e) => { mouse.tx = e.clientX / w - 0.5; mouse.ty = e.clientY / h - 0.5 }
    window.addEventListener('mousemove', onMove)

    const rand = (a, b) => a + Math.random() * (b - a)
    const elegir = () => {
      const bolsa = SHAPES.flatMap((s, i) => Array(s.w).fill(i))
      return SHAPES[bolsa[Math.floor(Math.random() * bolsa.length)]]
    }
    const parts = Array.from({ length: 26 }, () => ({
      shape: elegir(),
      x: Math.random(), y: Math.random(),
      s: rand(22, 60),                          // ← MÁS GRANDES
      a: rand(0, Math.PI * 2), va: rand(-0.002, 0.002),
      vx: rand(-0.015, 0.015), vy: rand(-0.01, 0.01),
      depth: rand(0.35, 1),
      alpha: rand(0.13, 0.24),                  // ← MÁS VISIBLES
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    }))

    const draw = () => {
      c.clearRect(0, 0, w, h)
      // Resplandores más marcados
      const g1 = c.createRadialGradient(w * 0.85, h * 0.15, 0, w * 0.85, h * 0.15, w * 0.5)
      g1.addColorStop(0, 'rgba(61,106,240,0.12)'); g1.addColorStop(1, 'rgba(61,106,240,0)')
      c.fillStyle = g1; c.fillRect(0, 0, w, h)
      const g2 = c.createRadialGradient(w * 0.1, h * 0.9, 0, w * 0.1, h * 0.9, w * 0.45)
      g2.addColorStop(0, 'rgba(184,134,11,0.09)'); g2.addColorStop(1, 'rgba(184,134,11,0)')
      c.fillStyle = g2; c.fillRect(0, 0, w, h)

      for (const p of parts) {
        c.save()
        c.translate(p.x * w + mouse.x * 70 * p.depth, p.y * h + mouse.y * 70 * p.depth)
        c.rotate(p.a)
        c.globalAlpha = p.alpha
        c.strokeStyle = p.color; c.fillStyle = p.color; c.lineWidth = 2.2  // ← TRAZO MÁS GRUESO
        if (p.shape.glyph) {
          c.font = `${p.s * 1.6}px Georgia, 'Times New Roman', serif`
          c.textAlign = 'center'; c.textBaseline = 'middle'
          c.fillText(p.glyph, 0, 0)
        } else {
          p.shape.fn(c, p.s)
        }
        c.restore()
      }
    }

    const tick = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      for (const p of parts) {
        p.a += p.va
        p.x += (p.vx / w) * 8; p.y += (p.vy / h) * 8
        if (p.x < -0.1) p.x = 1.1; if (p.x > 1.1) p.x = -0.1
        if (p.y < -0.1) p.y = 1.1; if (p.y > 1.1) p.y = -0.1
      }
      draw()
      raf = requestAnimationFrame(tick)
    }

    if (reduced) draw() // accesibilidad: sin animación
    else tick()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return <canvas ref={ref} className="legal-bg" aria-hidden="true" />
}
