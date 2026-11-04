import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { IGNITION_TIMELINE, isMuted, playConvoyIgnitionSequence, setMuted } from '../../services/soundService'
import { cancelSpeech } from '../../services/voiceGuidanceService'
import { IconGauge, IconVolume, IconVolumeOff } from './LandingIcons'

const MAX_RPM_K = 14
const REDLINE_START_K = 10
/** Pico del golpe de gas de la secuencia de encendido. */
const PEAK_TARGET = 8000
/** Ralentí tras el golpe de gas: el motor queda encendido mientras el convoy está conectado. */
const IDLE_RPM = 1400

// Fases de la aguja, en segundos desde que arranca la ignición (callback onEngineRev, t = IGNITION_TIMELINE.rev).
// Coinciden con scheduleRev() en soundService: subida 0.55 s, sostenido hasta 0.8 s, caída a ralentí en 1.4 s.
const RISE_S = 0.55
const HOLD_UNTIL_S = 0.8
const FALL_UNTIL_S = IGNITION_TIMELINE.idle - IGNITION_TIMELINE.rev

const START_ANGLE = -220
const END_ANGLE = 40
const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 118

type ConnectionState = 'idle' | 'igniting' | 'connected'

function polarToCartesian(angleDeg: number, radius: number) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  }
}

function describeArc(startAngle: number, endAngle: number, radius: number) {
  const start = polarToCartesian(startAngle, radius)
  const end = polarToCartesian(endAngle, radius)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function rpmKToAngle(rpmK: number): number {
  const clamped = Math.min(Math.max(rpmK, 0), MAX_RPM_K)
  return START_ANGLE + (clamped / MAX_RPM_K) * (END_ANGLE - START_ANGLE)
}

const TICKS = Array.from({ length: 8 }, (_, i) => i * 2)

const STATUS_COPY: Record<ConnectionState, string> = {
  idle: 'Sistema listo · Standby',
  igniting: 'Arrancando motor...',
  connected: 'Convoy conectado · 5 pilotos activos',
}

export default function LandingHeroTachometer() {
  const { lang } = useApp()
  // En reposo el tacómetro es 100% estático en 0 RPM: no hay ningún timer corriendo hasta el clic.
  const [rpm, setRpm] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  const [connection, setConnection] = useState<ConnectionState>('idle')
  const [busy, setBusy] = useState(false)
  const rafRef = useRef<number | null>(null)
  const cancelSequenceRef = useRef<(() => void) | null>(null)
  const clickAtRef = useRef(0)
  const revAtRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      cancelSequenceRef.current?.()
    }
  }, [])

  /** Un solo bucle rAF dibuja toda la secuencia: aguja quieta (contacto), parpadeo del arranque y, desde que
   *  onEngineRev marca el inicio de la ignición, subida exacta a 8.000 RPM, sostenido y caída a ralentí. */
  function tick(now: number) {
    const sinceClick = (now - clickAtRef.current) / 1000
    const revAt = revAtRef.current

    if (revAt === null) {
      if (sinceClick < IGNITION_TIMELINE.crank) {
        setRpm(0)
      } else {
        // Motor de arranque: tres empujones de ~250–380 RPM al ritmo de los pulsos de audio (cada 0.22 s).
        const phase = ((sinceClick - IGNITION_TIMELINE.crank) % 0.22) / 0.22
        setRpm(Math.round(250 + 130 * Math.sin(phase * Math.PI)))
      }
      rafRef.current = requestAnimationFrame(tick)
      return
    }

    const t = (now - revAt) / 1000
    if (t < RISE_S) {
      const eased = 1 - Math.pow(1 - t / RISE_S, 3)
      setRpm(Math.round(300 + (PEAK_TARGET - 300) * eased))
    } else if (t < HOLD_UNTIL_S) {
      // Pico exacto de 8.000 RPM con un leve rebote del limitador por debajo.
      const wobble = Math.abs(Math.sin((t - RISE_S) * 38)) * 70
      setRpm(Math.round(PEAK_TARGET - wobble))
    } else if (t < FALL_UNTIL_S) {
      const progress = (t - HOLD_UNTIL_S) / (FALL_UNTIL_S - HOLD_UNTIL_S)
      const eased = 1 - Math.pow(1 - progress, 2)
      setRpm(Math.round(PEAK_TARGET + (IDLE_RPM - PEAK_TARGET) * eased))
    } else {
      // Ralentí estable: la aguja queda quieta y no se programan más frames.
      setRpm(IDLE_RPM)
      rafRef.current = null
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function handleIgnite() {
    if (busy) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    cancelSequenceRef.current?.()
    cancelSpeech()

    setBusy(true)
    setConnection('igniting')
    setRpm(0)
    revAtRef.current = null
    clickAtRef.current = performance.now()
    rafRef.current = requestAnimationFrame(tick)

    cancelSequenceRef.current = playConvoyIgnitionSequence(
      () => {
        // Golpe de gas: la aguja arranca exactamente con el audio de ignición.
        revAtRef.current = performance.now()
        setRpm((prev) => (prev === 0 ? 300 : prev))
        if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
      },
      () => setBusy(false),
      { lang, onRadio: () => setConnection('connected') },
    )
  }

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
    if (next) cancelSpeech()
  }

  const rpmK = rpm / 1000
  const needleAngle = rpmKToAngle(rpmK)
  // Aguja como segmento exterior (igual que Speedometer): el centro queda libre y no tacha la cifra digital.
  const needleBase = polarToCartesian(needleAngle, 74)
  const needleTip = polarToCartesian(needleAngle, RADIUS - 26)
  const trackPath = describeArc(START_ANGLE, END_ANGLE, RADIUS)
  const redlinePath = describeArc(rpmKToAngle(REDLINE_START_K), rpmKToAngle(MAX_RPM_K), RADIUS)
  const inRedline = rpm >= REDLINE_START_K * 1000
  const gearLabel = rpm > 1600 ? '1' : 'N'
  const connected = connection === 'connected'

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E17]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Engine · RPM</span>
        <button
          onClick={toggleMute}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {muted ? <IconVolumeOff className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />}
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_45%,_rgba(249,115,22,0.07),_transparent_60%)] pb-3 pt-3">
        {/* Pastilla de telemetría: estado del sistema y del enlace de convoy */}
        <div
          className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-500 ${
            connected
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : connection === 'igniting'
                ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                : 'border-white/10 bg-white/[0.03] text-slate-400'
          }`}
          role="status"
          aria-live="polite"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              connected ? 'animate-pulse bg-emerald-400' : connection === 'igniting' ? 'animate-pulse bg-orange-400' : 'bg-slate-500'
            }`}
          />
          {STATUS_COPY[connection]}
        </div>

        <svg width={SIZE} height={232} viewBox="0 0 280 232" className="max-w-full">
          <defs>
            <linearGradient id="redlineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            <filter id="needleGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={trackPath} fill="none" stroke="#1A2233" strokeWidth={12} strokeLinecap="round" />
          <path d={redlinePath} fill="none" stroke="url(#redlineGradient)" strokeWidth={12} strokeLinecap="round" opacity={0.9} />

          {TICKS.map((tickK) => {
            const angle = rpmKToAngle(tickK)
            const outer = polarToCartesian(angle, RADIUS + 12)
            const inner = polarToCartesian(angle, RADIUS + 2)
            const label = polarToCartesian(angle, RADIUS - 22)
            return (
              <g key={tickK}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={tickK >= REDLINE_START_K ? '#F97316' : '#475569'}
                  strokeWidth={2}
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill={tickK >= REDLINE_START_K ? '#FB923C' : '#94A3B8'}
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="Orbitron"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {tickK}
                </text>
              </g>
            )
          })}

          <text x={CENTER} y={62} fill="#64748B" fontSize={9} fontWeight={600} textAnchor="middle" letterSpacing={1.5}>
            x1000 RPM
          </text>

          <line
            x1={needleBase.x}
            y1={needleBase.y}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#F97316"
            strokeWidth={4}
            strokeLinecap="round"
            filter="url(#needleGlow)"
          />
        </svg>

        <div className="flex flex-col items-center" style={{ marginTop: -84 }}>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black tabular-nums text-white">
              {Math.round(rpm).toLocaleString('es-CO')}
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">RPM</span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-md border font-display text-sm font-black transition-colors ${
                gearLabel === 'N'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-orange-500/30 bg-orange-500/10 text-orange-400'
              }`}
            >
              {gearLabel}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full transition-all ${
                inRedline ? 'animate-pulse bg-red-500 shadow-[0_0_10px_3px_rgba(239,68,68,0.6)]' : 'bg-slate-700'
              }`}
              aria-hidden="true"
            />
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${inRedline ? 'text-red-400' : 'text-slate-600'}`}>
              Shift
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={handleIgnite}
          disabled={busy}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-2.5 text-left text-orange-300 transition hover:bg-orange-500/20 hover:text-orange-200 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          <IconGauge className="h-5 w-5 flex-shrink-0" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold">Encender y Conectar Convoy</span>
            <span className="text-[11px] font-medium text-orange-300/70">Simular arranque y enlace de voz</span>
          </span>
        </button>
      </div>
    </div>
  )
}
