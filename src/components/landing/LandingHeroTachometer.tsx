import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useApp } from '../../context/AppContext'
import {
  isMuted,
  playConvoyReadyChime,
  playDataLinkChirp,
  playRadarPing,
  setMuted,
  unlockAudio,
} from '../../services/soundService'
import { cancelSpeech, speakWithVoice } from '../../services/voiceGuidanceService'
import { IconCheckCircle, IconPin, IconPlay, IconSignal, IconVolume, IconVolumeOff } from './LandingIcons'

const MAX_RPM_K = 14
const REDLINE_START_K = 10

const START_ANGLE = -220
const END_ANGLE = 40
const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 118

type ConvoyFlowState = 'idle' | 'locating' | 'connecting' | 'ready'
type ActivePhase = Exclude<ConvoyFlowState, 'idle'>

/** Régimen de la aguja en cada fase del flujo. */
const PHASE_RPM: Record<ConvoyFlowState, number> = { idle: 0, locating: 2800, connecting: 4500, ready: 5500 }
/** Duración del barrido de la aguja hacia el régimen de cada fase. */
const SWEEP_MS: Record<ActivePhase, number> = { locating: 1200, connecting: 900, ready: 700 }
/** Cada fase dura al menos esto (y avanza al terminar la voz); con sonido silenciado es el ritmo exacto. */
const MIN_PHASE_MS = 1400
/** Salvaguarda: si el navegador nunca dispara `onend` de la voz, la fase avanza igual. */
const MAX_PHASE_MS = 4500

const NEXT_PHASE: Record<ActivePhase, ActivePhase | null> = { locating: 'connecting', connecting: 'ready', ready: null }

const PHASE_TONE: Record<ActivePhase, () => void> = {
  locating: playRadarPing,
  connecting: playDataLinkChirp,
  ready: playConvoyReadyChime,
}

const PHASE_VOICE: Record<ActivePhase, { es: string; en: string }> = {
  locating: { es: 'Localizando pilotos...', en: 'Locating riders...' },
  connecting: { es: 'Conectando convoy...', en: 'Connecting convoy...' },
  ready: { es: 'Todos los pilotos encontrados. ¡Listos para rodar!', en: 'All riders connected. Ready to ride!' },
}

const STATUS_PILL: Record<ConvoyFlowState, { icon: ReactNode; label: string; className: string }> = {
  idle: {
    icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />,
    label: 'Sistema listo · Standby',
    className: 'border-white/10 bg-white/[0.03] text-slate-400',
  },
  locating: {
    icon: <IconPin className="h-3 w-3 animate-pulse" strokeWidth={2.25} />,
    label: 'Localizando pilotos...',
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  },
  connecting: {
    icon: <IconSignal className="h-3 w-3 animate-pulse" strokeWidth={2.25} />,
    label: 'Conectando convoy...',
    className: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  },
  ready: {
    icon: <IconCheckCircle className="h-3 w-3" strokeWidth={2.25} />,
    label: 'Todos los pilotos encontrados',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
}

/** Línea de enlace bajo la cifra digital (altura fija para que el clúster no salte entre fases). */
const LINK_STATUS: Record<ConvoyFlowState, { label: string; className: string }> = {
  idle: { label: 'GPS · Standby', className: 'border-white/10 text-slate-500' },
  locating: { label: 'GPS · Buscando pilotos', className: 'border-orange-500/30 text-orange-300' },
  connecting: { label: 'SAT · Enlazando telemetría', className: 'border-sky-500/30 text-sky-300' },
  ready: { label: '5/5 Convoy activo', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
}

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

const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

const TICKS = Array.from({ length: 8 }, (_, i) => i * 2)

export default function LandingHeroTachometer() {
  const { lang } = useApp()
  // En reposo el tacómetro es 100% estático en 0 RPM: no hay ningún timer corriendo hasta el clic.
  const [rpm, setRpm] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  const [flow, setFlow] = useState<ConvoyFlowState>('idle')
  const rpmRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const timersRef = useRef<number[]>([])
  /** Identifica la ejecución vigente: los callbacks de una secuencia cancelada (voz, timers) se ignoran. */
  const runIdRef = useRef(0)
  const activeRef = useRef(false)

  useEffect(() => () => cancelRun(), [])

  function cancelRun() {
    runIdRef.current += 1
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    if (activeRef.current) cancelSpeech()
    activeRef.current = false
  }

  function later(runId: number, fn: () => void, ms: number) {
    timersRef.current.push(window.setTimeout(() => runIdRef.current === runId && fn(), ms))
  }

  /** Barrido suave de la aguja desde su posición actual hasta `target` (un único bucle rAF a la vez). */
  function sweepTo(target: number, durationMs: number) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const from = rpmRef.current
    const startedAt = performance.now()
    const step = (now: number) => {
      // El timestamp del rAF puede ser levemente anterior a startedAt: se acota a [0, 1] (evita "-0 RPM").
      const progress = Math.min(1, Math.max(0, (now - startedAt) / durationMs))
      const value = Math.round(from + (target - from) * easeInOutCubic(progress))
      rpmRef.current = value
      setRpm(value)
      rafRef.current = progress < 1 ? requestAnimationFrame(step) : null
    }
    rafRef.current = requestAnimationFrame(step)
  }

  /** Ejecuta una fase: pastilla + aguja + tono + voz. Avanza a la siguiente cuando termina la voz (mínimo
   *  MIN_PHASE_MS, máximo MAX_PHASE_MS). Con sonido silenciado el flujo visual corre igual, sin audio. */
  function runPhase(phase: ActivePhase, runId: number) {
    setFlow(phase)
    sweepTo(PHASE_RPM[phase], SWEEP_MS[phase])
    PHASE_TONE[phase]()

    const next = NEXT_PHASE[phase]
    const startedAt = performance.now()
    let advanced = false
    const onVoiceDone = () => {
      if (advanced || runIdRef.current !== runId) return
      advanced = true
      if (!next) {
        activeRef.current = false
        return
      }
      later(runId, () => runPhase(next, runId), Math.max(0, MIN_PHASE_MS - (performance.now() - startedAt)))
    }

    if (isMuted()) {
      onVoiceDone()
      return
    }
    speakWithVoice(PHASE_VOICE[phase][lang], lang, onVoiceDone)
    later(runId, onVoiceDone, MAX_PHASE_MS)
  }

  function handleStart() {
    if (flow === 'locating' || flow === 'connecting') return
    cancelRun()
    const runId = runIdRef.current
    activeRef.current = true
    // Reinicio desde "Conectado": la aguja vuelve a 0 antes de volver a barrer.
    rpmRef.current = 0
    setRpm(0)
    // La primera voz y el primer tono nacen dentro del gesto del usuario: desbloquea audio y voz en iOS/Android.
    unlockAudio()
    runPhase('locating', runId)
  }

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
    // Al silenciar se corta la voz en curso; su `onend` hace avanzar la fase, así el flujo visual sigue.
    if (next) cancelSpeech()
  }

  const busy = flow === 'locating' || flow === 'connecting'
  const ready = flow === 'ready'
  const rpmK = rpm / 1000
  const needleAngle = rpmKToAngle(rpmK)
  // Aguja como segmento exterior (igual que Speedometer): el centro queda libre y no tacha la cifra digital.
  const needleBase = polarToCartesian(needleAngle, 74)
  const needleTip = polarToCartesian(needleAngle, RADIUS - 26)
  const trackPath = describeArc(START_ANGLE, END_ANGLE, RADIUS)
  const redlinePath = describeArc(rpmKToAngle(REDLINE_START_K), rpmKToAngle(MAX_RPM_K), RADIUS)
  const progressPath = rpm > 60 ? describeArc(START_ANGLE, needleAngle, RADIUS) : null
  const accent = ready ? '#10B981' : '#F97316'
  const gearLabel = flow === 'connecting' || ready ? '1' : 'N'
  const pill = STATUS_PILL[flow]
  const link = LINK_STATUS[flow]

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E17]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Convoy · Telemetría</span>
        <button
          onClick={toggleMute}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {muted ? <IconVolumeOff className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={`relative flex flex-1 flex-col items-center justify-center pb-3 pt-3 transition-[background] duration-700 ${
          ready
            ? 'bg-[radial-gradient(circle_at_50%_45%,_rgba(16,185,129,0.14),_transparent_62%)]'
            : 'bg-[radial-gradient(circle_at_50%_45%,_rgba(249,115,22,0.07),_transparent_60%)]'
        }`}
      >
        {/* Pastilla de estado del flujo "Iniciar Convoy" */}
        <div
          className={`mb-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-500 ${pill.className}`}
          role="status"
          aria-live="polite"
        >
          {pill.icon}
          {pill.label}
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
          {progressPath && (
            <path
              d={progressPath}
              fill="none"
              stroke={accent}
              strokeWidth={12}
              strokeLinecap="round"
              opacity={0.35}
              className="transition-[stroke] duration-700"
            />
          )}

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

          {/* En "ready" la aguja respira sutilmente alrededor de 5.500 RPM (solo CSS, sin re-render). */}
          <g
            className={ready ? 'motion-safe:animate-needleBreath' : undefined}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          >
            <line
              x1={needleBase.x}
              y1={needleBase.y}
              x2={needleTip.x}
              y2={needleTip.y}
              stroke={accent}
              strokeWidth={4}
              strokeLinecap="round"
              filter="url(#needleGlow)"
              className="transition-[stroke] duration-700"
            />
          </g>
        </svg>

        <div className="flex flex-col items-center" style={{ marginTop: -84 }}>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black tabular-nums text-white">
              {Math.round(rpm).toLocaleString('es-CO')}
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">RPM</span>
          </div>

          {/* Marcha sola y centrada: cabe entre las marcas "0" y "14" del dial sin tocarlas */}
          <span
            className={`mt-2 flex h-7 w-7 items-center justify-center rounded-md border font-display text-sm font-black transition-colors ${
              gearLabel === 'N'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-orange-500/30 bg-orange-500/10 text-orange-400'
            }`}
            aria-label={`Marcha ${gearLabel}`}
          >
            {gearLabel}
          </span>

          {/* Display de enlace: queda por debajo del arco, fuera de las etiquetas del dial */}
          <span
            className={`mt-3 inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-500 ${link.className}`}
          >
            {flow === 'connecting' && <IconSignal className="h-3 w-3 animate-pulse" strokeWidth={2.25} />}
            {ready && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
            {link.label}
          </span>
        </div>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={handleStart}
          disabled={busy}
          className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-left transition active:scale-[0.98] disabled:cursor-wait ${
            ready
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200'
              : busy
                ? 'animate-pulse border-orange-500/40 bg-orange-500/15 text-orange-200'
                : 'border-orange-500 bg-orange-600 text-white shadow-lg shadow-orange-900/30 hover:bg-orange-500'
          }`}
        >
          {ready ? (
            <IconCheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : busy ? (
            <IconSignal className="h-5 w-5 flex-shrink-0" />
          ) : (
            <IconPlay className="h-5 w-5 flex-shrink-0" />
          )}
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold">
              {ready ? 'Convoy Conectado (Reiniciar)' : busy ? 'Conectando Convoy...' : 'Iniciar Convoy'}
            </span>
            <span className={`text-[11px] font-medium ${ready ? 'text-emerald-300/70' : busy ? 'text-orange-200/70' : 'text-orange-100/85'}`}>
              {ready
                ? '5 pilotos en línea · Haz clic para repetir'
                : busy
                  ? 'Enlazando telemetría satelital'
                  : 'Prueba en vivo la telemetría y el enlace por voz'}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
