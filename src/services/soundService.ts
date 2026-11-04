import { announceIntercomThen, primeSpeechFromGesture } from './voiceGuidanceService'

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

function whiteNoiseBuffer(ctx: AudioContext, durationSeconds: number): AudioBuffer {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds))
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

/** Synthesizes a high-displacement 4-cylinder engine rev — throttle blip up, hold, and release — with no external audio files. */
export function playEngineRev(durationMs = 2600): void {
  if (muted) return
  const ctx = getContext()
  const now = ctx.currentTime
  const duration = durationMs / 1000

  const masterGain = ctx.createGain()
  masterGain.gain.value = 0.5
  masterGain.connect(ctx.destination)

  // Cuerpo grave del motor: dos osciladores en sawtooth ligeramente desafinados (efecto "V-twin/4 cilindros").
  const engineGain = ctx.createGain()
  engineGain.gain.setValueAtTime(0.0001, now)
  engineGain.gain.exponentialRampToValueAtTime(0.9, now + 0.12)
  engineGain.gain.exponentialRampToValueAtTime(0.55, now + duration * 0.65)
  engineGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  engineGain.connect(masterGain)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(500, now)
  lowpass.frequency.linearRampToValueAtTime(2200, now + duration * 0.55)
  lowpass.frequency.linearRampToValueAtTime(900, now + duration)
  lowpass.connect(engineGain)

  ;[1, 1.01].forEach((detune) => {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(75 * detune, now)
    osc.frequency.linearRampToValueAtTime(260 * detune, now + duration * 0.55)
    osc.frequency.linearRampToValueAtTime(150 * detune, now + duration)
    osc.connect(lowpass)
    osc.start(now)
    osc.stop(now + duration)
  })

  // Textura de escape: ruido filtrado en banda para el "rugido" áspero.
  const noise = ctx.createBufferSource()
  noise.buffer = whiteNoiseBuffer(ctx, duration)
  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.setValueAtTime(600, now)
  noiseFilter.frequency.linearRampToValueAtTime(1800, now + duration * 0.55)
  noiseFilter.Q.value = 0.8
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.0001, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.35, now + 0.15)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(masterGain)
  noise.start(now)
  noise.stop(now + duration)
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

/* ───────────────────────── Secuencia "Encendido de Convoy" (landing) ───────────────────────── */

/** Instantes (segundos desde el clic) de cada fase de la secuencia de encendido. */
export const IGNITION_TIMELINE = {
  /** Contacto ON: doble clic de relé y cebado de la bomba de gasolina. */
  contact: 0,
  /** Motor de arranque: tres pulsos ch-ch-ch. */
  crank: 0.5,
  /** Ignición y golpe de gas hasta 8.000 RPM (la aguja arranca aquí). */
  rev: 1.2,
  /** Fin del golpe de gas: el motor cae a ralentí. */
  idle: 2.6,
  /** Ráfaga de squelch y "roger beep" del intercomunicador. */
  radio: 2.6,
  /** Locución de voz del intercomunicador. */
  voice: 3.2,
} as const

/** Envolvente corta de ganancia: ataque casi instantáneo y caída exponencial. */
function envelope(ctx: AudioContext, start: number, peak: number, attack: number, release: number): GainNode {
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, start)
  g.gain.exponentialRampToValueAtTime(peak, start + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + release)
  return g
}

function scheduleRelayClick(ctx: AudioContext, out: AudioNode, at: number, frequency: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'square'
  osc.frequency.value = frequency
  const g = envelope(ctx, at, 0.12, 0.003, 0.027)
  osc.connect(g).connect(out)
  osc.start(at)
  osc.stop(at + 0.035)
}

function scheduleFuelPump(ctx: AudioContext, out: AudioNode, at: number): void {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, at)
  osc.frequency.linearRampToValueAtTime(600, at + 0.4)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 900
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.0001, at)
  g.gain.exponentialRampToValueAtTime(0.07, at + 0.06)
  g.gain.setValueAtTime(0.07, at + 0.32)
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.4)
  osc.connect(lp).connect(g).connect(out)
  osc.start(at)
  osc.stop(at + 0.42)
}

/** Un pulso del motor de arranque: golpe grave a 60 Hz + ruido filtrado del piñón. */
function scheduleCrankPulse(ctx: AudioContext, out: AudioNode, at: number): void {
  const thump = ctx.createOscillator()
  thump.type = 'triangle'
  thump.frequency.setValueAtTime(60, at)
  thump.frequency.exponentialRampToValueAtTime(42, at + 0.16)
  const thumpGain = envelope(ctx, at, 0.6, 0.01, 0.16)
  thump.connect(thumpGain).connect(out)
  thump.start(at)
  thump.stop(at + 0.2)

  const noise = ctx.createBufferSource()
  noise.buffer = whiteNoiseBuffer(ctx, 0.2)
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 450
  const noiseGain = envelope(ctx, at, 0.35, 0.01, 0.14)
  noise.connect(lp).connect(noiseGain).connect(out)
  noise.start(at)
  noise.stop(at + 0.2)
}

/** Ignición + golpe de gas: sawtooth de 80 Hz a 320 Hz (≈8.000 RPM en un tetracilíndrico) y caída a ralentí. */
function scheduleRev(ctx: AudioContext, out: AudioNode, at: number, end: number): void {
  const peakAt = at + 0.55
  const holdUntil = at + 0.8
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.setValueAtTime(600, at)
  lp.frequency.linearRampToValueAtTime(2400, peakAt)
  lp.frequency.linearRampToValueAtTime(900, end)

  const engineGain = ctx.createGain()
  engineGain.gain.setValueAtTime(0.0001, at)
  engineGain.gain.exponentialRampToValueAtTime(0.8, at + 0.08)
  engineGain.gain.setValueAtTime(0.8, holdUntil)
  engineGain.gain.exponentialRampToValueAtTime(0.3, end - 0.2)
  engineGain.gain.exponentialRampToValueAtTime(0.0001, end + 0.35)
  lp.connect(engineGain).connect(out)

  ;[1, 1.012].forEach((detune) => {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80 * detune, at)
    osc.frequency.exponentialRampToValueAtTime(320 * detune, peakAt)
    osc.frequency.setValueAtTime(320 * detune, holdUntil)
    osc.frequency.exponentialRampToValueAtTime(95 * detune, end)
    osc.connect(lp)
    osc.start(at)
    osc.stop(end + 0.4)
  })

  const noise = ctx.createBufferSource()
  noise.buffer = whiteNoiseBuffer(ctx, end - at + 0.4)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 0.8
  bp.frequency.setValueAtTime(500, at)
  bp.frequency.linearRampToValueAtTime(1900, peakAt)
  bp.frequency.linearRampToValueAtTime(700, end)
  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.0001, at)
  noiseGain.gain.exponentialRampToValueAtTime(0.3, at + 0.1)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, end + 0.35)
  noise.connect(bp).connect(noiseGain).connect(out)
  noise.start(at)
  noise.stop(end + 0.4)
}

/** Squelch de radio (ráfaga de ruido de 60 ms) + "roger beep" a dos tonos (1200 Hz → 1600 Hz, 80 ms cada uno). */
function scheduleRadioChirp(ctx: AudioContext, out: AudioNode, at: number): void {
  const noise = ctx.createBufferSource()
  noise.buffer = whiteNoiseBuffer(ctx, 0.07)
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 2200
  bp.Q.value = 1.2
  const squelch = envelope(ctx, at, 0.25, 0.005, 0.055)
  noise.connect(bp).connect(squelch).connect(out)
  noise.start(at)
  noise.stop(at + 0.07)

  ;[
    { f: 1200, t: at + 0.1 },
    { f: 1600, t: at + 0.19 },
  ].forEach(({ f, t }) => {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = f
    const radioBand = ctx.createBiquadFilter()
    radioBand.type = 'bandpass'
    radioBand.frequency.value = f
    radioBand.Q.value = 2
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.005)
    g.gain.setValueAtTime(0.16, t + 0.075)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08)
    osc.connect(radioBand).connect(g).connect(out)
    osc.start(t)
    osc.stop(t + 0.09)
  })
}

interface IgnitionOptions {
  /** Idioma de la locución del intercomunicador. */
  lang?: 'es' | 'en'
  /** Se llama al sonar la radio (inicio del enlace de convoy). */
  onRadio?: () => void
}

/** Secuencia completa de "Encendido de Convoy": contacto ON → arranque → golpe de gas a 8.000 RPM → radio →
 *  voz "Convoy conectado. 5 pilotos activos.". Todo sintetizado (Web Audio + speechSynthesis), sin archivos.
 *
 *  Los callbacks se disparan con temporizadores aunque el sonido esté silenciado, para que la animación visual
 *  siga sincronizada; con `muted` no suena ni el sintetizador ni la voz. Devuelve una función que cancela los
 *  temporizadores pendientes (desmontaje del componente o reinicio de la secuencia). */
export function playConvoyIgnitionSequence(
  onEngineRev?: () => void,
  onComplete?: () => void,
  options: IgnitionOptions = {},
): () => void {
  const timers: number[] = []
  let cancelled = false
  const at = (seconds: number, fn: () => void) => {
    timers.push(window.setTimeout(() => !cancelled && fn(), seconds * 1000))
  }
  const lang = options.lang ?? 'es'

  if (!muted) {
    // Todo el audio se programa ya, dentro del gesto del usuario (requisito de autoplay en iOS/Android).
    const ctx = getContext()
    const t0 = ctx.currentTime + 0.05
    const master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)

    scheduleRelayClick(ctx, master, t0 + IGNITION_TIMELINE.contact + 0.02, 1200)
    scheduleRelayClick(ctx, master, t0 + IGNITION_TIMELINE.contact + 0.09, 800)
    scheduleFuelPump(ctx, master, t0 + IGNITION_TIMELINE.contact + 0.1)
    ;[0, 0.22, 0.44].forEach((offset) => scheduleCrankPulse(ctx, master, t0 + IGNITION_TIMELINE.crank + offset))
    scheduleRev(ctx, master, t0 + IGNITION_TIMELINE.rev, t0 + IGNITION_TIMELINE.idle)
    scheduleRadioChirp(ctx, master, t0 + IGNITION_TIMELINE.radio + 0.05)
    primeSpeechFromGesture()
  }

  at(IGNITION_TIMELINE.rev, () => onEngineRev?.())
  at(IGNITION_TIMELINE.radio, () => options.onRadio?.())
  at(IGNITION_TIMELINE.voice, () => {
    if (muted) {
      onComplete?.()
      return
    }
    // Salvaguarda: algunos navegadores no disparan `onend`; se completa igual tras 4 s.
    let done = false
    const finish = () => {
      if (done || cancelled) return
      done = true
      onComplete?.()
    }
    timers.push(window.setTimeout(finish, 4000))
    announceIntercomThen(lang === 'en' ? 'Convoy connected. 5 active riders.' : 'Convoy conectado. 5 pilotos activos.', lang, finish)
  })

  return () => {
    cancelled = true
    timers.forEach((id) => window.clearTimeout(id))
  }
}
