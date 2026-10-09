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
