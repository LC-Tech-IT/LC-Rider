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
import { CONVOY_RADAR_LINES, cancelSpeech, speakWithVoice } from '../../services/voiceGuidanceService'
import { IconCheckCircle, IconCrown, IconPin, IconPlay, IconShield, IconSignal, IconVolume, IconVolumeOff } from './LandingIcons'

/* ───────────────────────── Geometría del radar (viewBox 280 × 280) ───────────────────────── */

const SIZE = 280
const C = SIZE / 2
const OUTER_R = 120

/** Anillos de alcance. La escala es por tramos para que cada piloto quede dentro del anillo que le corresponde. */
const RINGS = [
  { r: 40, meters: 100, label: '100 m' },
  { r: 80, meters: 250, label: '250 m' },
  { r: 120, meters: 500, label: '500 m' },
]

function metersToRadius(meters: number): number {
  let prevR = 0
  let prevM = 0
  for (const ring of RINGS) {
    if (meters <= ring.meters) return prevR + ((meters - prevM) / (ring.meters - prevM)) * (ring.r - prevR)
    prevR = ring.r
    prevM = ring.meters
  }
  return OUTER_R
}

/** Rumbo en grados (0 = adelante/arriba, sentido horario) → coordenadas del SVG. */
function polar(bearingDeg: number, radius: number) {
  const a = (bearingDeg * Math.PI) / 180
  return { x: C + radius * Math.sin(a), y: C - radius * Math.cos(a) }
}

interface Pilot {
  name: string
  bike: string
  /** Distancia con signo respecto al líder: + adelante, − detrás. */
  offset: string
  role: string
  meters: number
  bearing: number
  /** Posición de la tarjeta respecto al punto del piloto. */
  card: { dx: number; dy: number }
  guardian?: boolean
}

const PILOTS: Pilot[] = [
  { name: 'Mateo', bike: 'MT-09', offset: '+120 m', role: 'Vanguardia', meters: 120, bearing: 20, card: { dx: 8, dy: -24 } },
  { name: 'Sebastián', bike: 'Duke 390', offset: '−85 m', role: 'Ala izquierda', meters: 85, bearing: 240, card: { dx: -92, dy: -6 } },
  { name: 'Camilo', bike: 'Versys 650', offset: '−190 m', role: 'Ala derecha', meters: 190, bearing: 135, card: { dx: 7, dy: 2 } },
  { name: 'Guardián', bike: 'R 1250 GS', offset: '−310 m', role: 'Retaguardia', meters: 310, bearing: 185, card: { dx: 10, dy: 2 }, guardian: true },
]

const PILOT_POS = PILOTS.map((p) => polar(p.bearing, metersToRadius(p.meters)))
const CARD_W = 84
const CARD_H = 24

/** Marcas angulares cada 15° en el anillo exterior (más largas cada 45°). */
const ANGLE_TICKS = Array.from({ length: 24 }, (_, i) => i * 15)
/** Estela del haz: cuñas de 4° con opacidad decreciente detrás del borde de ataque (simula un gradiente cónico). */
const SWEEP_TRAIL = Array.from({ length: 12 }, (_, i) => i)

function wedgePath(fromDeg: number, toDeg: number, r: number) {
  const a = polar(fromDeg, r)
  const b = polar(toDeg, r)
  return `M ${C} ${C} L ${a.x} ${a.y} A ${r} ${r} 0 0 1 ${b.x} ${b.y} Z`
}

/* ───────────────────────── Flujo "Iniciar Convoy" ───────────────────────── */

type ConvoyFlowState = 'idle' | 'locating' | 'connecting' | 'ready'
type ActivePhase = Exclude<ConvoyFlowState, 'idle'>

/** Velocidad del haz (grados/s): crucero 6 s por vuelta, rastreo 1,5 s por vuelta. */
const SWEEP_SPEED: Record<ConvoyFlowState, number> = { idle: 60, locating: 240, connecting: 150, ready: 90 }
/** Cada fase dura al menos esto y avanza al terminar la voz. Rastreo pide algo más para completar un barrido. */
const MIN_PHASE_MS: Record<ActivePhase, number> = { locating: 1600, connecting: 1100, ready: 0 }
/** Salvaguarda: si el navegador nunca dispara `onend` de la voz, la fase avanza igual. */
const MAX_PHASE_MS = 4500

const NEXT_PHASE: Record<ActivePhase, ActivePhase | null> = { locating: 'connecting', connecting: 'ready', ready: null }

const PHASE_TONE: Record<ActivePhase, () => void> = {
  locating: playRadarPing,
  connecting: playDataLinkChirp,
  ready: playConvoyReadyChime,
}

const STATUS_PILL: Record<ConvoyFlowState, { icon: ReactNode; label: string; className: string }> = {
  idle: {
    icon: <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />,
    label: 'Sistema listo · Standby',
    className: 'border-white/10 bg-white/[0.03] text-slate-400',
  },
  locating: {
    icon: <IconPin className="h-3 w-3 animate-pulse" strokeWidth={2.25} />,
    label: 'Rastreando pilotos...',
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
  },
  connecting: {
    icon: <IconSignal className="h-3 w-3 animate-pulse" strokeWidth={2.25} />,
    label: 'Enlazando telemetría...',
    className: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
  },
  ready: {
    icon: <IconCheckCircle className="h-3 w-3" strokeWidth={2.25} />,
    label: 'Todos los pilotos encontrados',
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  },
}

export default function LandingConvoyRadar() {
  const { lang } = useApp()
  const [muted, setMutedState] = useState(isMuted())
  const [flow, setFlow] = useState<ConvoyFlowState>('idle')
  const [detected, setDetected] = useState<boolean[]>(() => PILOTS.map(() => false))

  const rootRef = useRef<HTMLDivElement>(null)
  const sweepRef = useRef<SVGGElement>(null)
  const flowRef = useRef<ConvoyFlowState>('idle')
  const detectedRef = useRef<boolean[]>(PILOTS.map(() => false))
  const timersRef = useRef<number[]>([])
  /** Identifica la ejecución vigente: los callbacks de una secuencia cancelada (voz, timers) se ignoran. */
  const runIdRef = useRef(0)
  const activeRef = useRef(false)

  /* Haz de barrido a 60 FPS: un bucle rAF mueve el haz escribiendo el atributo `transform` directamente (sin
   * re-render de React). La velocidad se acerca suavemente a la de cada fase (el radar "acelera"). Durante el
   * rastreo, un piloto queda detectado cuando el borde del haz pasa por su rumbo. El bucle se detiene cuando el
   * radar sale de pantalla. */
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let raf = 0
    let running = false
    let last = 0
    let angle = 0
    let speed = SWEEP_SPEED.idle

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      speed += (SWEEP_SPEED[flowRef.current] - speed) * Math.min(1, dt * 3)
      const prev = angle
      angle += speed * dt
      sweepRef.current?.setAttribute('transform', `rotate(${(angle % 360).toFixed(2)} ${C} ${C})`)

      if (flowRef.current === 'locating') {
        let changed = false
        PILOTS.forEach((p, i) => {
          if (!detectedRef.current[i] && Math.floor((angle - p.bearing) / 360) > Math.floor((prev - p.bearing) / 360)) {
            detectedRef.current[i] = true
            changed = true
          }
        })
        if (changed) setDetected([...detectedRef.current])
      }
      raf = requestAnimationFrame(frame)
    }
    const start = () => {
      if (running) return
      running = true
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    observer.observe(root)
    return () => {
      stop()
      observer.disconnect()
    }
  }, [])

  useEffect(() => () => cancelRun(), [])

  function setPhase(next: ConvoyFlowState) {
    flowRef.current = next
    setFlow(next)
  }

  function markDetected(all: boolean) {
    detectedRef.current = PILOTS.map(() => all)
    setDetected([...detectedRef.current])
  }

  function cancelRun() {
    runIdRef.current += 1
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
    if (activeRef.current) cancelSpeech()
    activeRef.current = false
  }

  function later(runId: number, fn: () => void, ms: number) {
    timersRef.current.push(window.setTimeout(() => runIdRef.current === runId && fn(), ms))
  }

  /** Ejecuta una fase: estado visual + tono + voz. Avanza a la siguiente cuando termina la voz (con mínimo y
   *  máximo por fase). Con sonido silenciado el flujo visual corre igual, sin audio. */
  function runPhase(phase: ActivePhase, runId: number) {
    setPhase(phase)
    // Al enlazar ya no puede quedar ningún piloto sin detectar (p. ej. si la voz fue muy corta o está en mute).
    if (phase !== 'locating') markDetected(true)
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
      later(runId, () => runPhase(next, runId), Math.max(0, MIN_PHASE_MS[phase] - (performance.now() - startedAt)))
    }

    if (isMuted()) {
      onVoiceDone()
      return
    }
    speakWithVoice(CONVOY_RADAR_LINES[phase][lang], lang, onVoiceDone)
    later(runId, onVoiceDone, MAX_PHASE_MS)
  }

  function handleStart() {
    if (flow === 'locating' || flow === 'connecting') return
    // Reinicio instantáneo: se cancela todo lo pendiente y el radar vuelve a rastrear desde cero.
    cancelRun()
    const runId = runIdRef.current
    activeRef.current = true
    markDetected(false)
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
  const linked = flow === 'connecting' || ready
  const detectedCount = detected.filter(Boolean).length
  const sweepColor = ready ? '#10B981' : '#38BDF8'
  const ringStroke = ready ? 'rgba(52,211,153,0.28)' : 'rgba(255,255,255,0.1)'
  const blipColor = ready ? '#10B981' : '#7DD3FC'
  const leaderStroke = ready ? '#34D399' : '#F97316'
  const pill = STATUS_PILL[flow]

  const telemetry: { label: string; className: string } = ready
    ? { label: '5/5 Convoy activo · Perímetro seguro', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' }
    : flow === 'connecting'
      ? { label: 'Latencia: 14 ms · Señal 100%', className: 'border-cyan-500/30 text-cyan-300' }
      : flow === 'locating'
        ? { label: `Detectados ${detectedCount}/4 · Barrido 360°`, className: 'border-orange-500/30 text-orange-300' }
        : { label: 'GPS · Standby · 0/4 pilotos', className: 'border-white/10 text-slate-500' }

  return (
    <div ref={rootRef} className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0E17]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Radar de convoy · 500 m</span>
        <button
          onClick={toggleMute}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
        >
          {muted ? <IconVolumeOff className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={`relative flex flex-1 flex-col items-center justify-center gap-2 px-3 pb-3 pt-3 transition-[background] duration-700 ${
          ready
            ? 'bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.14),_transparent_62%)]'
            : 'bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.06),_transparent_60%)]'
        }`}
      >
        {/* Pastilla de estado del flujo "Iniciar Convoy" */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-500 ${pill.className}`}
          role="status"
          aria-live="polite"
        >
          {pill.icon}
          {pill.label}
        </div>

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="aspect-square w-full max-w-[300px]"
          role="img"
          aria-label={`Radar de convoy: ${detectedCount} de 4 pilotos detectados alrededor del líder`}
        >
          <defs>
            <filter id="radarGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Anillos de alcance */}
          {RINGS.map((ring) => (
            <circle
              key={ring.r}
              cx={C}
              cy={C}
              r={ring.r}
              fill="none"
              stroke={ringStroke}
              strokeWidth={ring.r === OUTER_R ? 1.25 : 1}
              className="transition-[stroke] duration-700"
            />
          ))}

          {/* Retícula en cruz */}
          <g stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="2 4">
            <line x1={C - OUTER_R} y1={C} x2={C + OUTER_R} y2={C} />
            <line x1={C} y1={C - OUTER_R} x2={C} y2={C + OUTER_R} />
          </g>

          {/* Marcas angulares */}
          {ANGLE_TICKS.map((deg) => {
            const major = deg % 45 === 0
            const a = polar(deg, OUTER_R)
            const b = polar(deg, OUTER_R + (major ? 7 : 4))
            return (
              <line key={deg} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={major ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.14)'} strokeWidth={1} />
            )
          })}

          {/* Etiquetas de alcance sobre el eje derecho */}
          {RINGS.map((ring) => (
            <text key={ring.label} x={C + ring.r - 3} y={C - 4} fill="#64748B" fontSize={7} fontWeight={600} textAnchor="end">
              {ring.label}
            </text>
          ))}

          {/* Haz de barrido 360° (lo rota el bucle rAF) */}
          <g ref={sweepRef} opacity={flow === 'idle' ? 0.55 : 1} className="transition-opacity duration-500">
            {SWEEP_TRAIL.map((i) => (
              <path key={i} d={wedgePath(-(i + 1) * 4, -i * 4, OUTER_R)} fill={sweepColor} opacity={0.2 * (1 - i / SWEEP_TRAIL.length)} />
            ))}
            <line x1={C} y1={C} x2={C} y2={C - OUTER_R} stroke={sweepColor} strokeWidth={1.5} strokeLinecap="round" filter="url(#radarGlow)" />
          </g>

          {/* Vectores de telemetría líder → piloto, con flujo de datos animado */}
          {PILOTS.map((p, i) => (
            <line
              key={`link-${p.name}`}
              x1={C}
              y1={C}
              x2={PILOT_POS[i].x}
              y2={PILOT_POS[i].y}
              stroke={ready ? '#34D399' : '#22D3EE'}
              strokeWidth={1.5}
              strokeDasharray="3 5"
              strokeLinecap="round"
              opacity={linked ? 0.9 : 0}
              className="animate-dataFlow transition-[opacity,stroke] duration-500"
            />
          ))}

          {/* Pilotos detectados */}
          {PILOTS.map((p, i) => {
            const { x, y } = PILOT_POS[i]
            const visible = detected[i]
            const cardX = x + p.card.dx
            const cardY = y + p.card.dy
            return (
              <g key={p.name} opacity={visible ? 1 : 0} className="transition-opacity duration-500">
                <title>{`${p.name} · ${p.bike} · ${p.offset} · ${p.role}`}</title>
                {/* Onda al ser detectado (se re-monta en cada detección) y halo continuo cuando el convoy está listo */}
                {visible && (
                  <circle
                    key={ready ? 'halo' : 'ping'}
                    cx={x}
                    cy={y}
                    r={p.guardian ? 8 : 5}
                    fill="none"
                    stroke={blipColor}
                    strokeWidth={1.5}
                    className={ready ? 'animate-radarHalo' : 'animate-radarPing'}
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  />
                )}
                {p.guardian ? (
                  <g>
                    <circle cx={x} cy={y} r={8} fill="#0B0F18" stroke={blipColor} strokeWidth={1.5} className="transition-[stroke] duration-700" />
                    <IconShield x={x - 5} y={y - 5} width={10} height={10} color={blipColor} strokeWidth={2.25} />
                  </g>
                ) : (
                  <circle cx={x} cy={y} r={4.5} fill={blipColor} filter="url(#radarGlow)" className="transition-[fill] duration-700" />
                )}

                {/* Tarjeta compacta: nombre + moto y distancia */}
                <g>
                  <rect
                    x={cardX}
                    y={cardY}
                    width={CARD_W}
                    height={CARD_H}
                    rx={4}
                    fill="#0B0F18"
                    fillOpacity={0.92}
                    stroke={ready ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.14)'}
                    className="transition-[stroke] duration-700"
                  />
                  <text x={cardX + 6} y={cardY + 10} fill="#F8FAFC" fontSize={8.5} fontWeight={800}>
                    {p.name}
                  </text>
                  <text x={cardX + 6} y={cardY + 19.5} fill={ready ? '#6EE7B7' : '#94A3B8'} fontSize={7} fontWeight={600}>
                    {`${p.bike} · ${p.offset}`}
                  </text>
                </g>
              </g>
            )
          })}

          {/* Líder (Tú) en el centro */}
          <g>
            <circle cx={C} cy={C} r={13} fill="none" stroke={leaderStroke} strokeWidth={1} opacity={0.5} className="animate-radarHalo" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
            <circle cx={C} cy={C} r={13} fill="#0B0F18" stroke={leaderStroke} strokeWidth={2} className="transition-[stroke] duration-700" />
            <IconCrown x={C - 7} y={C - 7} width={14} height={14} color="#FBBF24" strokeWidth={2} />
            <rect x={C - 24} y={C - 29} width={48} height={11} rx={5.5} fill="#0B0F18" stroke={leaderStroke} strokeOpacity={0.6} />
            <text x={C} y={C - 21.2} fill={ready ? '#6EE7B7' : '#FDBA74'} fontSize={6.5} fontWeight={800} textAnchor="middle" letterSpacing={0.6}>
              TÚ (LÍDER)
            </text>
          </g>
        </svg>

        {/* Display de telemetría (altura fija para que el clúster no salte entre fases) */}
        <span
          className={`inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-colors duration-500 ${telemetry.className}`}
        >
          {flow === 'connecting' && <IconSignal className="h-3 w-3 animate-pulse" strokeWidth={2.25} />}
          {ready && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />}
          {telemetry.label}
        </span>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={handleStart}
          disabled={busy}
          className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-left transition active:scale-[0.98] disabled:cursor-wait ${
            ready
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15 hover:text-emerald-200'
              : busy
                ? 'animate-pulse border-amber-500/50 bg-amber-500/15 text-amber-200'
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
            <span className={`text-[11px] font-medium ${ready ? 'text-emerald-300/70' : busy ? 'text-amber-200/70' : 'text-orange-100/85'}`}>
              {ready
                ? '5 pilotos en formación · Clic para repetir prueba'
                : busy
                  ? 'Sincronizando telemetría GPS satelital'
                  : 'Escanear pilotos cercanos y enlazar telemetría'}
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
