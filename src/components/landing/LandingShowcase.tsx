import { useEffect, useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import { useApp } from '../../context/AppContext'
import { useScrollReveal, scrollRevealClass } from '../../hooks/useScrollReveal'
import Speedometer from '../cockpit/Speedometer'
import ColombianPlate from '../common/ColombianPlate'
import { QUICK_ACTIONS } from '../common/quickActions'
import {
  IconAlert,
  IconArrowRight,
  IconBattery,
  IconClock,
  IconDashboard,
  IconFuel,
  IconGauge,
  IconMap,
  IconNavArrow,
  IconPhone,
  IconRegroup,
  IconRoute,
  IconSettings,
  IconSos,
  IconUsers,
  IconWrench,
  QuickActionIcon,
} from './LandingIcons'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>
type ShowcaseMode = 'mobile' | 'carplay'
type MemberStatus = 'onroute' | 'laggard'

interface MemberRow {
  id: string
  name: string
  status: MemberStatus
  detail: string
}

const INITIAL_MEMBERS: MemberRow[] = [
  { id: 'p1', name: 'Piloto 1', status: 'onroute', detail: '95 km/h' },
  { id: 'p2', name: 'Piloto 2', status: 'laggard', detail: 'Rezagado a 400m' },
  { id: 'p3', name: 'Piloto 3', status: 'onroute', detail: '88 km/h' },
]

function randomSpeed(): number {
  return 70 + Math.round(Math.random() * 40)
}

const MEMBER_ROLES = ['Líder', 'Rezagado', 'Guardián']

const HUD_ACTIONS: { label: string; icon: IconComponent; className: string }[] = [
  { label: 'Gasolina', icon: IconFuel, className: 'border-sky-400/25 bg-sky-500/10 text-sky-300' },
  { label: 'Peligro', icon: IconAlert, className: 'border-amber-400/25 bg-amber-500/10 text-amber-300' },
  { label: 'Reagrupar', icon: IconRegroup, className: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300' },
  { label: 'SOS', icon: IconSos, className: 'border-red-500/40 bg-red-600/20 text-red-300' },
]

/** Maqueta automotriz estilo Head-Up Display: réplica de una pantalla CarPlay/Android Auto montada en el
 *  tablero, con velocímetro real, telemetría de viaje, navegación activa y radar de convoy en vivo. */
function CarPlayMockup({ speed, members }: { speed: number; members: MemberRow[] }) {
  return (
    <div className="w-full max-w-5xl rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-[#1A1F2A] to-[#0B0F18] p-1.5 shadow-2xl shadow-black/50">
      <div className="rounded-[1.4rem] border border-black/60 bg-[#090D16] p-4 text-white sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
            <span className="font-mono tabular-nums text-white">10:42</span>
            <span>5G</span>
            <span className="inline-flex items-center gap-1">
              <IconBattery className="h-3.5 w-3.5" />
              <span className="tabular-nums">82%</span>
            </span>
          </div>
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
            CarPlay / Android Auto · Bike Tracker HUD
          </span>
          <div className="flex items-center gap-1.5 text-slate-400">
            {[IconMap, IconPhone, IconSettings].map((Icon, i) => (
              <span key={i} className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Icon className="h-4 w-4" />
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          {/* Panel Izquierdo — Telemetría y Velocímetro */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 md:w-[42%]">
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Vehículo Activo</p>
                <p className="text-sm font-bold text-white">Yamaha MT-09</p>
              </div>
              <ColombianPlate plate="RTX880" subtitle="YAMAHA" size="sm" />
            </div>

            <div className="relative mt-3 flex items-center justify-center overflow-hidden rounded-2xl border border-white/[0.06] bg-[#05070C] p-3">
              <Speedometer speed={speed} theme="dark" />
              <div className="absolute right-2 top-2 flex h-12 w-12 flex-col items-center justify-center rounded-full border-[3px] border-red-500 bg-white text-slate-900">
                <span className="text-base font-black leading-none tabular-nums">60</span>
                <span className="text-[6px] font-bold uppercase leading-none">km/h</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <IconClock className="h-4 w-4 text-slate-500" />
                <div className="mt-1.5 font-mono text-base font-semibold tabular-nums text-white">00:42</div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tiempo</div>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
                <IconRoute className="h-4 w-4 text-slate-500" />
                <div className="mt-1.5 font-mono text-base font-semibold tabular-nums text-orange-400">38.2 km</div>
                <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">Distancia</div>
              </div>
            </div>
          </div>

          {/* Panel Derecho — Convoy en Vivo y Navegación */}
          <div className="flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center gap-3 rounded-xl border border-orange-500/25 bg-orange-500/[0.07] p-3">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                <IconNavArrow className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Vía La Calera</p>
                <p className="text-xs text-orange-200/80">
                  Curva peligrosa a <span className="font-mono tabular-nums">300 m</span>
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {members.map((m, i) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${m.status === 'onroute' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <span className="text-xs font-semibold text-white">
                      {m.name} <span className="font-normal text-slate-500">· {MEMBER_ROLES[i]}</span>
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-semibold tabular-nums ${
                      m.status === 'onroute' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {m.status === 'onroute' ? 'En Ruta' : 'Rezagado'} · {m.detail}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {HUD_ACTIONS.map((action) => (
                <div
                  key={action.label}
                  className={`flex min-h-[64px] flex-col items-center justify-center gap-1.5 rounded-xl border text-center font-semibold ${action.className}`}
                >
                  <action.icon className="h-5 w-5" />
                  <span className="text-[11px]">{action.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Réplica fiel del Tablero/Cockpit real de la app (que es de tema claro): mismo velocímetro (componente real),
 *  mismas métricas y mismas acciones rápidas, montada en un chasis de teléfono en titanio oscuro. */
function CockpitMockup({ speed }: { speed: number }) {
  return (
    <div className="w-72 rounded-[2.75rem] border border-white/10 bg-gradient-to-b from-[#1A1F2A] to-[#0B0F18] p-1.5 shadow-2xl shadow-black/50">
      <div className="overflow-hidden rounded-[2.4rem] border border-black/60 bg-bike-bg">
        <div className="origin-top scale-[0.8] px-4 pb-2 pt-4">
          <div className="mb-3 flex items-center justify-between rounded-2xl border border-bike-border bg-white p-3 shadow-card">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400">Vehículo Activo</p>
              <p className="text-sm font-bold text-bike-ink">Yamaha MT-09</p>
            </div>
            <ColombianPlate plate="RTX880" subtitle="YAMAHA" size="sm" />
          </div>

          <div className="rounded-2xl border border-bike-border bg-white p-3 shadow-card">
            <Speedometer speed={speed} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col items-center rounded-2xl border border-bike-border bg-white p-3 text-center shadow-card">
              <IconClock className="h-4 w-4 text-slate-400" />
              <div className="mt-1 font-mono text-base font-bold tabular-nums text-bike-blue">00:42</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400">Tiempo</div>
            </div>
            <div className="flex flex-col items-center rounded-2xl border border-bike-border bg-white p-3 text-center shadow-card">
              <IconRoute className="h-4 w-4 text-slate-400" />
              <div className="mt-1 font-mono text-base font-bold tabular-nums text-bike-orange">38.2 km</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400">Distancia</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <div
                key={action.id}
                className={`flex min-h-[52px] items-center justify-center gap-1.5 rounded-2xl p-2 text-center font-bold text-white ${action.colorClass}`}
              >
                <QuickActionIcon id={action.icon} className="h-4 w-4 flex-shrink-0" />
                <span className="text-[11px] leading-tight">{action.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-around border-t border-bike-border bg-white px-1 pb-2 pt-2"
          style={{ marginTop: '-1.75rem' }}
        >
          <IconGauge className="h-5 w-5 text-bike-orange" />
          <IconMap className="h-5 w-5 text-slate-300" />
          <div className="-mt-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-status-danger text-white">
            <IconSos className="h-5 w-5" />
          </div>
          <IconWrench className="h-5 w-5 text-slate-300" />
          <IconUsers className="h-5 w-5 text-slate-300" />
        </div>
      </div>
    </div>
  )
}

const MODES: { id: ShowcaseMode; label: string; icon: IconComponent }[] = [
  { id: 'mobile', label: 'Vista Móvil', icon: IconPhone },
  { id: 'carplay', label: 'CarPlay / Android Auto', icon: IconDashboard },
]

export default function LandingShowcase() {
  const { setTopLevelMode, requestAppAccess } = useApp()
  const [mode, setMode] = useState<ShowcaseMode>('mobile')
  const [speed, setSpeed] = useState(92)
  const [members, setMembers] = useState<MemberRow[]>(INITIAL_MEMBERS)
  const mockup = useScrollReveal<HTMLDivElement>()

  useEffect(() => {
    const id = window.setInterval(() => {
      setSpeed(randomSpeed())
      setMembers((prev) =>
        prev.map((m) => (m.status === 'onroute' ? { ...m, detail: `${randomSpeed()} km/h` } : m)),
      )
    }, 1500)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section id="ride-mode" className="relative border-t border-white/[0.06] bg-[#05070C]">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">El Convoy</p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Bike Tracker en acción
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Así se ve tu convoy en tiempo real, en tu celular o en la pantalla de tu vehículo.
          </p>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  mode === m.id ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div ref={mockup.ref} className={`mt-12 flex justify-center ${scrollRevealClass(mockup.visible)}`}>
          {mode === 'mobile' ? <CockpitMockup speed={speed} /> : <CarPlayMockup speed={speed} members={members} />}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={() => requestAppAccess(() => setTopLevelMode('app'))}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 active:scale-95"
          >
            Probar en Mi Tablero
            <IconArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
