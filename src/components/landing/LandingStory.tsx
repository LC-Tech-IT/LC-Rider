import type { ComponentType, ReactNode, SVGProps } from 'react'
import { useScrollReveal, scrollRevealClass } from '../../hooks/useScrollReveal'
import {
  IconAlert,
  IconBadge,
  IconDocument,
  IconFuel,
  IconHeadset,
  IconHome,
  IconNavArrow,
  IconPhone,
  IconRoute,
  IconShield,
  IconSignal,
  IconSos,
  IconUsers,
  IconWrench,
} from './LandingIcons'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

function RevealBlock({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`${scrollRevealClass(visible)} ${className ?? ''}`}>
      {children}
    </div>
  )
}

/** Micro-etiqueta técnica sobre fotografías y paneles (sustituye a los antiguos chips con emojis). */
function TechTag({ icon: Icon, children }: { icon: IconComponent; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#070A10]/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 backdrop-blur-md">
      <Icon className="h-3.5 w-3.5 text-orange-400" />
      {children}
    </span>
  )
}

/* ─────────────── Medios de cada acto ─────────────── */

const GARAGE_ROWS = [
  { plate: 'RTX 880', model: 'Yamaha MT-09', soat: 'Vigente', tecno: 'Vigente', ok: true },
  { plate: 'KLM 42F', model: 'BMW R 1250 GS', soat: 'Vigente', tecno: 'Vence en 12 días', ok: false },
]

/** Acto 01: panel tipo TFT con la flota y el semáforo de documentos legales. */
function GarageMedia() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Garaje · Flota</span>
        <span className="font-mono text-[10px] tabular-nums text-slate-500">02 VEHÍCULOS</span>
      </div>
      <div className="mt-4 space-y-3">
        {GARAGE_ROWS.map((row) => (
          <div key={row.plate} className="rounded-xl border border-white/[0.08] bg-[#070A10]/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">{row.model}</p>
                <p className="mt-0.5 font-mono text-[11px] tracking-widest text-slate-500">{row.plate}</p>
              </div>
              <IconWrench className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'SOAT', value: row.soat, ok: true },
                { label: 'Tecnomecánica', value: row.tecno, ok: row.ok },
              ].map((doc) => (
                <div key={doc.label} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${doc.ok ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{doc.label}</p>
                    <p className={`truncate text-[11px] font-semibold ${doc.ok ? 'text-emerald-300' : 'text-amber-300'}`}>{doc.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoMedia({ src, alt, tags }: { src: string; alt: string; tags: { icon: IconComponent; label: string }[] }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10">
      <img
        src={src}
        alt={alt}
        className="h-64 w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] sm:h-80"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070A10]/70 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <TechTag key={tag.label} icon={tag.icon}>
            {tag.label}
          </TechTag>
        ))}
      </div>
    </div>
  )
}

/* Acto 03: pantalla real de Bike Tracker sobre el soporte GPS de cockpit-view.jpg.
 * La foto mide 1376×768 px y la pantalla del soporte ocupa x 786–866 / y 334–397. El contenedor conserva la
 * proporción exacta de la foto (sin recorte de object-cover), así esas coordenadas porcentuales encajan en
 * cualquier ancho. */
const MOUNT_SCREEN = { left: 57.12, top: 43.49, width: 5.81, height: 8.2 }
const CALLOUT_ANCHOR = { x: 39.5, y: 30 }

/** Mapa de navegación de la app (tema diurno): ruta morada, posiciones del convoy y piloto actual en naranja. */
function MiniNavMap({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <rect width="160" height="100" fill="#EEF2F6" />
      <path d="M-5 70 L60 52 L170 66" stroke="#FFFFFF" strokeWidth="7" fill="none" />
      <path d="M38 -5 L52 110" stroke="#FFFFFF" strokeWidth="5" fill="none" />
      <path d="M110 -5 Q100 40 128 110" stroke="#FFFFFF" strokeWidth="4" fill="none" />
      <path d="M14 92 C 40 80, 52 58, 76 54 S 118 40, 148 12" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" fill="none" />
      {[
        [28, 85],
        [46, 70],
        [96, 46],
        [118, 36],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
      ))}
      <circle cx="72" cy="55" r="8" fill="#F97316" opacity="0.25" />
      <circle cx="72" cy="55" r="5" fill="#F97316" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  )
}

/** Réplica a escala de la vista de navegación activa, tal como se ve en el teléfono montado en el manillar. */
function HandlebarAppScreen() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between bg-slate-900 px-2 py-1">
        <span className="inline-flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.14em] text-white sm:text-[8px]">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Convoy activo · 5 riders
        </span>
        <span className="font-mono text-[7px] tabular-nums text-slate-400 sm:text-[8px]">10:42</span>
      </div>
      <div className="relative">
        <MiniNavMap className="block h-20 w-full sm:h-24" />
        <div className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded bg-white/95 px-1.5 py-1 shadow-sm">
          <IconNavArrow className="h-3 w-3 rotate-45 text-violet-600" strokeWidth={2.5} />
          <span className="text-[7px] font-bold uppercase leading-tight tracking-wide sm:text-[8px]">
            Próxima curva
            <span className="block font-mono text-[9px] tabular-nums text-slate-900 sm:text-[10px]">150 m</span>
          </span>
        </div>
      </div>
      <div className="grid grid-cols-[1fr_auto] items-center gap-2 border-t border-slate-200 px-2 py-1.5">
        <p className="flex items-baseline gap-1">
          <span className="text-lg font-black leading-none tabular-nums sm:text-xl">84</span>
          <span className="text-[8px] font-bold tracking-[0.18em] text-slate-500">KM/H</span>
        </p>
        <div className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <circle cx="12" cy="12" r="10.5" fill="none" stroke="#CBD5E1" strokeWidth="1" />
            <circle cx="12" cy="12" r="6" fill="none" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M12 12 L12 1.5 A10.5 10.5 0 0 1 21 7 Z" fill="#22C55E" opacity="0.25" />
            <circle cx="15" cy="6" r="1.4" fill="#0284C7" />
            <circle cx="8" cy="15" r="1.4" fill="#0284C7" />
            <circle cx="12" cy="12" r="1.6" fill="#F97316" />
          </svg>
          <span className="text-[7px] font-bold uppercase leading-tight tracking-wide text-slate-500 sm:text-[8px]">
            Radar
            <span className="block text-emerald-600">5/5 OK</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function HandlebarMedia() {
  return (
    <div className="group relative aspect-[1376/768] w-full overflow-hidden rounded-2xl border border-white/10">
      <img
        src="/images/cockpit-view.jpg"
        alt="Vista del manillar con Bike Tracker abierto en el soporte GPS"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Pantalla del soporte: la app encendida, calibrada sobre el vidrio del GPS de la foto. */}
      <div
        className="absolute overflow-hidden rounded-[3px] bg-white ring-1 ring-black/60"
        style={{
          left: `${MOUNT_SCREEN.left}%`,
          top: `${MOUNT_SCREEN.top}%`,
          width: `${MOUNT_SCREEN.width}%`,
          height: `${MOUNT_SCREEN.height}%`,
        }}
      >
        <MiniNavMap className="h-full w-full" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-white/90" />
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
      </div>
      <span
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-md ring-2 ring-orange-400/80"
        style={{
          left: `${MOUNT_SCREEN.left + MOUNT_SCREEN.width / 2}%`,
          top: `${MOUNT_SCREEN.top + MOUNT_SCREEN.height / 2}%`,
          width: `${MOUNT_SCREEN.width + 2.4}%`,
          height: `${MOUNT_SCREEN.height + 4}%`,
        }}
      />

      {/* Ampliación legible de esa misma pantalla, unida al soporte con una línea guía. */}
      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          x1={CALLOUT_ANCHOR.x}
          y1={CALLOUT_ANCHOR.y}
          x2={MOUNT_SCREEN.left}
          y2={MOUNT_SCREEN.top + MOUNT_SCREEN.height / 2}
          stroke="#FB923C"
          strokeOpacity={0.85}
          strokeWidth={0.35}
          strokeDasharray="1.2 1"
        />
      </svg>
      <div className="absolute left-[3%] top-[6%] hidden w-[36.5%] sm:block">
        <HandlebarAppScreen />
      </div>

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
        <TechTag icon={IconSignal}>GPS en vivo</TechTag>
        <TechTag icon={IconHeadset}>Voz Bluetooth</TechTag>
        <span className="sm:hidden">
          <TechTag icon={IconPhone}>App en el manillar</TechTag>
        </span>
      </div>
    </div>
  )
}

interface SafetyCallout {
  id: string
  icon: IconComponent
  title: string
  position: string
  accent: string
  dot: string
  /** Coordenadas en porcentaje (0-100) sobre la fotografía: anchor = esquina del callout, target = punto en la escena. */
  anchor: { x: number; y: number }
  target: { x: number; y: number }
}

const SAFETY_CALLOUTS: SafetyCallout[] = [
  {
    id: 'telemetry',
    icon: IconSignal,
    title: 'Telemetría Satelital en Vivo',
    position: 'top-3 left-3',
    accent: 'text-emerald-400',
    dot: 'bg-emerald-400',
    anchor: { x: 18, y: 12 },
    target: { x: 44, y: 29 },
  },
  {
    id: 'sos',
    icon: IconSos,
    title: 'Botón SOS de un Toque',
    position: 'top-3 right-3',
    accent: 'text-red-400',
    dot: 'bg-red-500',
    anchor: { x: 82, y: 12 },
    target: { x: 50, y: 38 },
  },
  {
    id: 'gasoline',
    icon: IconFuel,
    title: 'Aviso de Parada de Gasolina',
    position: 'right-3 top-1/2 -translate-y-1/2',
    accent: 'text-sky-400',
    dot: 'bg-sky-400',
    anchor: { x: 80, y: 50 },
    target: { x: 48, y: 54 },
  },
  {
    id: 'hazard',
    icon: IconAlert,
    title: 'Alerta de Peligro en Vía',
    position: 'bottom-3 right-3',
    accent: 'text-amber-400',
    dot: 'bg-amber-400',
    anchor: { x: 80, y: 88 },
    target: { x: 56, y: 80 },
  },
]

/** Acto 04: fotografía con callouts técnicos vectoriales (texto/iconos HTML nativos, nítidos en Retina/4K). */
function SafetyMedia() {
  return (
    <div className="group relative h-72 w-full overflow-hidden rounded-2xl border border-white/10 sm:h-80">
      <img
        src="/images/safety-features-bg.jpg"
        alt="Piloto en carretera de montaña con respaldo de telemetría Bike Tracker"
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#070A10]/25" />

      <svg className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SAFETY_CALLOUTS.map((c) => (
          <line
            key={c.id}
            x1={c.anchor.x}
            y1={c.anchor.y}
            x2={c.target.x}
            y2={c.target.y}
            stroke="white"
            strokeOpacity={0.4}
            strokeWidth={0.3}
            strokeDasharray="1.2 1.2"
          />
        ))}
      </svg>

      {SAFETY_CALLOUTS.map((c) => (
        <span
          key={`${c.id}-dot`}
          className={`pointer-events-none absolute hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full ring-4 ring-white/10 sm:block ${c.dot}`}
          style={{ left: `${c.target.x}%`, top: `${c.target.y}%` }}
        />
      ))}

      {SAFETY_CALLOUTS.map((c) => (
        <div
          key={c.id}
          className={`pointer-events-none absolute z-10 flex max-w-[46%] items-center gap-2 rounded-lg border border-white/10 bg-[#070A10]/80 px-2.5 py-1.5 backdrop-blur-md ${c.position}`}
        >
          <c.icon className={`h-4 w-4 flex-shrink-0 ${c.accent}`} />
          <span className="text-[10px] font-semibold leading-tight text-slate-200 sm:text-[11px]">{c.title}</span>
        </div>
      ))}

      <div className="absolute bottom-3 left-3 z-10 w-36 rounded-xl border border-white/10 bg-[#070A10]/90 p-2.5 text-white backdrop-blur-md sm:w-40">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          En vivo
        </span>
        <div className="mt-1.5 flex items-end gap-1">
          <span className="font-display text-2xl font-black leading-none tabular-nums">68</span>
          <span className="pb-0.5 text-[9px] text-slate-400">km/h</span>
        </div>
        <svg className="mt-1.5 h-7 w-full" viewBox="0 0 100 30" fill="none" aria-hidden="true">
          <path d="M5 25 Q 30 5, 50 15 T 95 5" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="15" r="3" fill="#F97316" />
        </svg>
      </div>
    </div>
  )
}

/** Acto 05: resumen de rodada cerrada (la promesa cumplida). */
function ReturnMedia() {
  const riders = ['Líder', 'Piloto 2', 'Piloto 3', 'Piloto 4', 'Guardián']
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Rodada finalizada</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Convoy completo
        </span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Distancia', value: '248.3', unit: 'km' },
          { label: 'Tiempo', value: '05:42', unit: 'h' },
          { label: 'En casa', value: '5/5', unit: '' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="font-display text-xl font-bold tabular-nums text-white">{stat.value}</span>
              {stat.unit && <span className="text-[10px] text-slate-500">{stat.unit}</span>}
            </p>
          </div>
        ))}
      </div>
      <ul className="mt-5 space-y-2">
        {riders.map((rider) => (
          <li key={rider} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-[#070A10]/60 px-3 py-2">
            <span className="text-xs font-medium text-slate-300">{rider}</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              <IconHome className="h-3.5 w-3.5" />
              Llegó a casa
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ─────────────── Narrativa ─────────────── */

interface Act {
  number: string
  kicker: string
  icon: IconComponent
  title: string
  text: string
  points: string[]
  media: ReactNode
}

const ACTS: Act[] = [
  {
    number: '01',
    kicker: 'El Garaje & Preparación',
    icon: IconDocument,
    title: 'Todo listo antes de encender el motor',
    text: 'La rodada empieza en el garaje. Tu flota y sus documentos legales quedan bajo control, con avisos antes de que el SOAT o la revisión tecnomecánica venzan.',
    points: ['Semáforo de vigencia de SOAT y Tecnomecánica', 'Hasta 5 vehículos sincronizados en la nube'],
    media: <GarageMedia />,
  },
  {
    number: '02',
    kicker: 'El Convoy en Formación',
    icon: IconUsers,
    title: 'El líder abre paso. El guardián cuida la retaguardia.',
    text: 'Cada piloto ocupa su lugar en la formación. El líder marca la ruta, el guardián cierra el grupo y todos ven en vivo dónde está cada integrante del convoy.',
    points: ['Roles de Líder, Piloto y Guardián', 'Posición de cada piloto en tiempo real'],
    media: (
      <PhotoMedia
        src="/images/friends-viewpoint.jpg"
        alt="Grupo de moteros en un mirador de montaña"
        tags={[
          { icon: IconRoute, label: 'Ruta compartida' },
          { icon: IconBadge, label: 'Guardián activo' },
        ]}
      />
    ),
  },
  {
    number: '03',
    kicker: 'En Curva · High Speed Telemetry',
    icon: IconHeadset,
    title: 'Visibilidad total, incluso con el sol de frente',
    text: 'Un HUD de alto contraste pensado para leerse de un vistazo, y alertas de voz que llegan por Bluetooth directo al intercomunicador del casco. Tus ojos siguen en la vía.',
    points: ['Alto contraste legible a pleno sol', 'Alertas de voz en el intercomunicador'],
    media: <HandlebarMedia />,
  },
  {
    number: '04',
    kicker: 'El Escudo de Carretera',
    icon: IconShield,
    title: 'Nadie se queda atrás',
    text: 'Detección precisa de rezagados, botón SOS que comparte tu ubicación exacta y avisos de parada o peligro en la vía: el convoy entero reacciona en segundos.',
    points: ['Alerta automática de pilotos rezagados', 'SOS con ubicación GPS exacta al grupo'],
    media: <SafetyMedia />,
  },
  {
    number: '05',
    kicker: 'El Regreso Seguro',
    icon: IconHome,
    title: 'La promesa cumplida de la rodada',
    text: 'Al final del día lo que importa es uno solo: que todos volvieron. Con el guardián cerrando el grupo y el convoy visible hasta el último kilómetro, nadie llega solo.',
    points: ['Tiempo y distancia de la rodada en tu tablero', 'El guardián confirma que nadie quedó atrás'],
    media: <ReturnMedia />,
  },
]

export default function LandingStory() {
  return (
    <section id="benefits" className="border-t border-white/[0.06] bg-[#070A10]">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">La Experiencia</p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Una rodada en cinco actos
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Del garaje a la puerta de tu casa: así acompaña Bike Tracker cada kilómetro de la hermandad motera.
          </p>
        </div>

        <ol className="mt-16 space-y-20 sm:space-y-24">
          {ACTS.map((act, index) => (
            <li
              key={act.number}
              className={`flex flex-col items-center gap-10 md:flex-row md:gap-14 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <RevealBlock className="w-full md:w-1/2">{act.media}</RevealBlock>

              <div className="w-full md:w-1/2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold tabular-nums text-orange-400">{act.number}</span>
                  <span className="h-px w-8 bg-white/15" />
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    <act.icon className="h-3.5 w-3.5 text-slate-500" />
                    {act.kicker}
                  </span>
                </div>
                <h3 className="mt-4 font-sans text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
                  {act.title}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-400 sm:text-base">{act.text}</p>
                <ul className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5">
                  {act.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="mt-2 h-1 w-3 flex-shrink-0 rounded-full bg-orange-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
