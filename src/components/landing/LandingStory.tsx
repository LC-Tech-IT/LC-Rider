import type { ReactNode } from 'react'
import { useScrollReveal, scrollRevealClass } from '../../hooks/useScrollReveal'

function RevealBlock({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`${scrollRevealClass(visible)} ${className ?? ''}`}>
      {children}
    </div>
  )
}

const ACTS = [
  {
    badge: '🤝 Hermandad en la Ruta',
    badgeClass: 'bg-orange-50 text-bike-orange',
    title: 'La Hermandad de la Carretera',
    text: 'Lo mejor de la ruta no es solo llegar, sino con quién la compartes. Cada parada, cada café y cada curva se disfrutan el doble cuando sabes que tu grupo está completo y a tiempo.',
    image: '/images/friends-viewpoint.jpg',
  },
  {
    badge: '🏍️ Enfoque y Libertad',
    badgeClass: 'bg-sky-50 text-bike-blue',
    title: 'Cero Preocupaciones al Manillar',
    text: 'Tus ojos deben estar en la carretera. Bike Tracker te avisa si alguien se rezaga o necesita asistencia con alertas visuales de gran formato y avisos por intercomunicador.',
    image: '/images/cockpit-view.jpg',
  },
]

interface SafetyChip {
  id: string
  position: string
  iconBg: string
  icon: string
  title: string
  subtitle: string
  dotColor: string
  dotGlow: string
  /** Coordenadas en porcentaje (0-100) sobre la fotografía: anchor = esquina del chip, dot = punto conectado en la escena. */
  anchor: { x: number; y: number }
  dot: { x: number; y: number }
}

const SAFETY_CHIPS: SafetyChip[] = [
  {
    id: 'telemetry',
    position: 'top-2 left-2 sm:top-3 sm:left-3',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: '📡',
    title: 'Telemetría',
    subtitle: 'en vivo',
    dotColor: 'bg-emerald-400',
    dotGlow: 'shadow-[0_0_8px_2px_rgba(52,211,153,0.85)]',
    anchor: { x: 15, y: 9 },
    dot: { x: 44, y: 29 },
  },
  {
    id: 'sos',
    position: 'top-2 right-2 sm:top-3 sm:right-3',
    iconBg: 'bg-red-100 text-red-600',
    icon: '🆘',
    title: 'Alerta SOS',
    subtitle: 'de un toque',
    dotColor: 'bg-red-500',
    dotGlow: 'shadow-[0_0_8px_2px_rgba(239,68,68,0.85)]',
    anchor: { x: 85, y: 9 },
    dot: { x: 50, y: 38 },
  },
  {
    id: 'gasoline',
    position: 'right-2 top-1/2 -translate-y-1/2 sm:right-3',
    iconBg: 'bg-sky-100 text-sky-600',
    icon: '⛽',
    title: 'Aviso parada',
    subtitle: 'de gasolina',
    dotColor: 'bg-sky-400',
    dotGlow: 'shadow-[0_0_8px_2px_rgba(56,189,248,0.85)]',
    anchor: { x: 89, y: 50 },
    dot: { x: 48, y: 54 },
  },
  {
    id: 'hazard',
    position: 'bottom-2 right-2 sm:bottom-3 sm:right-3',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: '⚠️',
    title: 'Alerta peligro',
    subtitle: 'en vía',
    dotColor: 'bg-amber-400',
    dotGlow: 'shadow-[0_0_8px_2px_rgba(251,191,36,0.85)]',
    anchor: { x: 85, y: 88 },
    dot: { x: 56, y: 80 },
  },
]

/** Fotografía 8K del Acto de Seguridad con teléfono flotante y callouts vectoriales (texto/iconos HTML nativos,
 *  nunca rasterizados) para garantizar nitidez absoluta en pantallas Retina/4K. */
function SafetyHeroGraphic() {
  return (
    <RevealBlock className="group relative h-64 w-full overflow-hidden rounded-3xl border border-bike-border shadow-soft sm:h-80 md:w-1/2">
      <img
        src="/images/safety-features-bg.jpg"
        alt="Piloto en carretera de montaña con respaldo de telemetría Bike Tracker"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />

      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SAFETY_CHIPS.map((chip) => (
          <line
            key={chip.id}
            x1={chip.anchor.x}
            y1={chip.anchor.y}
            x2={chip.dot.x}
            y2={chip.dot.y}
            stroke="white"
            strokeOpacity={0.55}
            strokeWidth={0.35}
            strokeDasharray="1.4 1.4"
          />
        ))}
      </svg>

      {SAFETY_CHIPS.map((chip) => (
        <span
          key={`${chip.id}-dot`}
          className={`pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${chip.dotColor} ${chip.dotGlow} animate-pulse`}
          style={{ left: `${chip.dot.x}%`, top: `${chip.dot.y}%` }}
        />
      ))}

      {SAFETY_CHIPS.map((chip) => (
        <div
          key={chip.id}
          className={`pointer-events-none absolute z-10 flex items-center gap-2 rounded-xl border border-white/60 bg-white/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-105 ${chip.position}`}
        >
          <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs ${chip.iconBg}`}>
            {chip.icon}
          </span>
          <span className="text-[11px] font-bold leading-tight text-slate-900">
            {chip.title}
            <br />
            <span className="text-[10px] font-medium text-slate-500">{chip.subtitle}</span>
          </span>
        </div>
      ))}

      <div className="absolute -bottom-2 -left-2 z-10 w-36 origin-bottom-left scale-90 rounded-2xl border-2 border-slate-700 bg-slate-950/95 p-2 text-white shadow-2xl backdrop-blur-md sm:bottom-2 sm:left-3 sm:w-44 sm:scale-100 sm:p-2.5">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          En vivo
        </span>
        <div className="mt-1.5 flex items-end gap-1">
          <span className="font-display text-2xl font-black leading-none">68</span>
          <span className="pb-0.5 text-[9px] text-slate-400">km/h</span>
        </div>
        <p className="mt-0.5 text-[9px] text-slate-400">📍 12.4 km</p>
        <svg className="mt-1.5 h-8 w-full" viewBox="0 0 100 30" fill="none">
          <path d="M5 25 Q 30 5, 50 15 T 95 5" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="15" r="3" fill="#38BDF8" />
        </svg>
      </div>
    </RevealBlock>
  )
}

export default function LandingStory() {
  return (
    <section id="benefits" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center font-display text-2xl font-black text-bike-ink sm:text-3xl">
        La Verdadera Experiencia de Rodar
      </h2>

      <div className="mt-12 space-y-14">
        {ACTS.map((act, index) => (
          <div
            key={act.title}
            className={`flex flex-col items-center gap-8 md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
          >
            <RevealBlock className="w-full overflow-hidden rounded-3xl border border-bike-border shadow-soft md:w-1/2">
              <img
                src={act.image}
                alt={act.title}
                className="h-64 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] sm:h-80"
              />
            </RevealBlock>
            <div className="w-full md:w-1/2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${act.badgeClass}`}>
                {act.badge}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold text-bike-ink sm:text-2xl">{act.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{act.text}</p>
            </div>
          </div>
        ))}

        <div className="flex flex-col items-center gap-8 md:flex-row">
          <SafetyHeroGraphic />
          <div className="w-full md:w-1/2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              🛡️ Seguridad en Grupo
            </span>
            <h3 className="mt-3 font-display text-xl font-bold text-bike-ink sm:text-2xl">Seguridad y Respaldo Inmediato</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Telemetría en vivo, alerta SOS de un toque y control de paradas de gasolina y peligros en vía: todo tu
              convoy conectado, listo para reaccionar en segundos.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
