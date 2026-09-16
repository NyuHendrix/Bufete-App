// Sonidos sintetizados con Web Audio API — cero archivos externos
let ctx = null
let muted = localStorage.getItem('lexcr-muted') === '1'

const ensureCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq = 600, dur = 0.08, type = 'sine', vol = 0.12, when = 0 }) {
  if (muted) return
  const ac = ensureCtx()
  const t = ac.currentTime + when
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export const sounds = {
  /** Clic suave en botones y enlaces */
  click: () => tone({ freq: 750, dur: 0.06, type: 'triangle', vol: 0.1 }),
  /** Arpegio ascendente: guardado exitoso */
  success: () => {
    tone({ freq: 523, dur: 0.09, vol: 0.1 })
    tone({ freq: 659, dur: 0.09, vol: 0.1, when: 0.08 })
    tone({ freq: 784, dur: 0.14, vol: 0.1, when: 0.16 })
  },
  /** Doble campana: alertas */
  alert: () => {
    tone({ freq: 880, dur: 0.12, type: 'sine', vol: 0.08 })
    tone({ freq: 880, dur: 0.12, type: 'sine', vol: 0.08, when: 0.16 })
  },
  /** Transición de página, muy sutil */
  page: () => tone({ freq: 420, dur: 0.05, type: 'sine', vol: 0.05 }),
  isMuted: () => muted,
  toggle: () => {
    muted = !muted
    localStorage.setItem('lexcr-muted', muted ? '1' : '0')
    if (!muted) sounds.click()
    return muted
  },
} 
