import { useEffect, useRef, useState } from 'react'
import { isMuted, playEngineRev, setMuted } from '../../services/soundService'
import { IconGauge, IconVolume, IconVolumeOff } from './LandingIcons'

const MAX_RPM_K = 14
const REDLINE_START_K = 10
const PEAK_MIN = 11500
const PEAK_MAX = 12000
const RISE_DURATION_MS = 600
const PEAK_HOLD_MS = 350
const FALL_DURATION_MS = 1900

const START_ANGLE = -220
const END_ANGLE = 40
const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 118

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

export default function LandingHeroTachometer() {
  // En reposo el tacómetro es 100% estático en 0 RPM: no hay ningún timer corriendo
  // hasta que el piloto pulsa "Acelerar Motor".
  const [rpm, setRpm] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  function handleAccelerate() {
    playEngineRev()
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const startRpm = rpm
    const peakTarget = PEAK_MIN + Math.random() * (PEAK_MAX - PEAK_MIN)
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      if (elapsed < RISE_DURATION_MS) {
        const progress = elapsed / RISE_DURATION_MS
        const eased = 1 - Math.pow(1 - progress, 3)
        setRpm(Math.round(startRpm + (peakTarget - startRpm) * eased))
      } else if (elapsed < RISE_DURATION_MS + PEAK_HOLD_MS) {
        const wobble = Math.sin(now / 55) * 90
        setRpm(Math.round(peakTarget + wobble))
      } else if (elapsed < RISE_DURATION_MS + PEAK_HOLD_MS + FALL_DURATION_MS) {
        const fallElapsed = elapsed - RISE_DURATION_MS - PEAK_HOLD_MS
        const progress = fallElapsed / FALL_DURATION_MS
        const eased = 1 - Math.pow(1 - progress, 2)
        setRpm(Math.round(peakTarget + (0 - peakTarget) * eased))
      } else {
        // Fin de la secuencia: aguja completamente quieta en 0, sin más frames programados.
        setRpm(0)
        rafRef.current = null
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  function toggleMute() {
    const next = !muted
    setMutedState(next)
    setMuted(next)
  }

  const rpmK = rpm / 1000
  const needleAngle = rpmKToAngle(rpmK)
  const needleTip = polarToCartesian(needleAngle, RADIUS - 22)
  const trackPath = describeArc(START_ANGLE, END_ANGLE, RADIUS)
  const redlinePath = describeArc(rpmKToAngle(REDLINE_START_K), rpmKToAngle(MAX_RPM_K), RADIUS)
  const inRedline = rpm >= REDLINE_START_K * 1000
  const gearLabel = rpm > 1600 ? '1' : 'N'

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

      <div className="relative flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_45%,_rgba(249,115,22,0.07),_transparent_60%)] pb-3 pt-4">
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
            x1={CENTER}
            y1={CENTER}
            x2={needleTip.x}
            y2={needleTip.y}
            stroke="#F97316"
            strokeWidth={3.5}
            strokeLinecap="round"
            filter="url(#needleGlow)"
          />
          <circle cx={CENTER} cy={CENTER} r={9} fill="#05070C" stroke="#334155" strokeWidth={1.5} />
          <circle cx={CENTER} cy={CENTER} r={3.5} fill="#F97316" />
        </svg>

        <div className="flex flex-col items-center" style={{ marginTop: -84 }}>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-black tabular-nums text-white sm:text-4xl">
              {Math.round(rpm).toLocaleString('en-US')}
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
          onClick={handleAccelerate}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 py-3 text-sm font-bold text-orange-300 transition hover:bg-orange-500/20 hover:text-orange-200 active:scale-[0.98]"
        >
          <IconGauge className="h-4 w-4" />
          Acelerar Motor
        </button>
      </div>
    </div>
  )
}
