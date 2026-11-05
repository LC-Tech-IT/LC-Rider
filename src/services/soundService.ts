let audioCtx: AudioContext | null = null
let muted = false

function getContext(): AudioContext {
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export function setMuted(value: boolean): void {
  muted = value
}

export function isMuted(): boolean {
  return muted
}

/** Desbloquea el AudioContext dentro de un gesto del usuario (iOS/Android) para que los tonos programados
 *  después desde temporizadores suenen sin restricciones de autoplay. */
export function unlockAudio(): void {
  if (muted) return
  try {
    getContext()
  } catch {
    /* Web Audio no disponible: los tonos fallarán en silencio. */
  }
}

/** A short synthetic "blip" used for the ECG telemetry pulse in the landing hero. */
export function playTelemetryBlip(frequency = 880): void {
  if (muted) return
  const ctx = getContext()
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + 0.2)
}

/* ─────────────── Tonos de telemetría de la secuencia "Iniciar Convoy" (landing) ─────────────── */

/** Tono senoidal limpio: ataque corto, barrido opcional de frecuencia y caída exponencial. */
function scheduleTone(
  ctx: AudioContext,
  out: AudioNode,
  { at, from, to = from, duration, peak, type = 'sine' }: {
    at: number
    from: number
    to?: number
    duration: number
    peak: number
    type?: OscillatorType
  },
): void {
  const osc = ctx.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(from, at)
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, at + duration)
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(peak, at + Math.min(0.012, duration / 4))
  g.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  osc.connect(g).connect(out)
  osc.start(at)
  osc.stop(at + duration + 0.02)
}

/** Pulso de radar satelital: senoide de 950 Hz que cae a 800 Hz en 250 ms (ganancia 0,15) y un eco tenue. */
export function playRadarPing(): void {
  if (muted) return
  const ctx = getContext()
  const t = ctx.currentTime + 0.02
  scheduleTone(ctx, ctx.destination, { at: t, from: 950, to: 800, duration: 0.25, peak: 0.15 })
  scheduleTone(ctx, ctx.destination, { at: t + 0.32, from: 950, to: 800, duration: 0.22, peak: 0.04 })
}

/** Enlace de datos: dos micro-pulsos electrónicos (1.200 Hz y 1.600 Hz, 40 ms cada uno, separados 30 ms). */
export function playDataLinkChirp(): void {
  if (muted) return
  const ctx = getContext()
  const t = ctx.currentTime + 0.02
  scheduleTone(ctx, ctx.destination, { at: t, from: 1200, duration: 0.04, peak: 0.12, type: 'triangle' })
  scheduleTone(ctx, ctx.destination, { at: t + 0.07, from: 1600, duration: 0.04, peak: 0.12, type: 'triangle' })
}

/** Confirmación: arpegio ascendente Do-Mi-Sol (523 → 659 → 784 Hz) en 450 ms, suavizado con un pasabajos. */
export function playConvoyReadyChime(): void {
  if (muted) return
  const ctx = getContext()
  const t = ctx.currentTime + 0.02
  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 2400
  lowpass.connect(ctx.destination)
  ;[523.25, 659.25, 783.99].forEach((f, i) => {
    const start = t + i * 0.09
    scheduleTone(ctx, lowpass, { at: start, from: f, duration: 0.45 - i * 0.09, peak: 0.13 })
  })
}
