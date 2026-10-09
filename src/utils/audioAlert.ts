let audioCtx: AudioContext | null = null
let sirenOscillators: OscillatorNode[] = []
let sirenGain: GainNode | null = null
let sirenInterval: number | null = null

function getContext(): AudioContext {
  if (!audioCtx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctor()
  }
  return audioCtx
}

export function startSiren(): void {
  const ctx = getContext()
  stopSiren()

  const gain = ctx.createGain()
  gain.gain.value = 0.15
  gain.connect(ctx.destination)
  sirenGain = gain

  const osc = ctx.createOscillator()
  osc.type = 'sawtooth'
  osc.frequency.value = 500
  osc.connect(gain)
  osc.start()
  sirenOscillators = [osc]

  let rising = true
  sirenInterval = window.setInterval(() => {
    if (!osc.frequency) return
    const now = ctx.currentTime
    const target = rising ? 900 : 500
    osc.frequency.linearRampToValueAtTime(target, now + 0.4)
    rising = !rising
  }, 420)
}

export function stopSiren(): void {
  if (sirenInterval !== null) {
    clearInterval(sirenInterval)
    sirenInterval = null
  }
  sirenOscillators.forEach((osc) => {
    try {
      osc.stop()
      osc.disconnect()
    } catch {
      /* already stopped */
    }
  })
  sirenOscillators = []
  if (sirenGain) {
    sirenGain.disconnect()
    sirenGain = null
  }
}

export function playConfirmBeep(): void {
  const ctx = getContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = 880
  gain.gain.value = 0.2
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
  osc.stop(ctx.currentTime + 0.3)
}

export function vibrateAlert(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate([200, 100, 200, 100, 400])
  }
}

export function vibrateStop(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0)
  }
}
