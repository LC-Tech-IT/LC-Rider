import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useScrollReveal, scrollRevealClass } from '../../hooks/useScrollReveal'
import Speedometer from '../cockpit/Speedometer'
import { QUICK_ACTIONS } from '../common/quickActions'

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

/** Maqueta automotriz estilo Head-Up Display: réplica de una pantalla CarPlay/Android Auto montada en el
 *  tablero, con tacómetro real, telemetría de viaje, navegación activa y radar de convoy en vivo. */
function CarPlayMockup({ speed, members }: { speed: number; members: MemberRow[] }) {
  return (
    <div className="w-full max-w-4xl rounded-3xl border-4 border-slate-800 bg-[#090D16] p-4 text-white shadow-2xl sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
          <span className="font-display tabular-nums text-white">10:42</span>
          <span>5G</span>
          <span>🔋 82%</span>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-center text-[10px] font-bold uppercase tracking-widest text-cyan-300">
          🏎️ CarPlay / Android Auto · Bike Tracker HUD
        </span>
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">🗺️</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">📞</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">⚙️</span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row">
        {/* Panel Izquierdo — Telemetría y Tacómetro */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:w-[42%]">
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-slate-400">Vehículo Activo</p>
              <p className="font-display text-sm font-bold text-white">Yamaha MT-09</p>
            </div>
            <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 font-display text-xs font-bold tracking-widest text-bike-blue">
              RTX880
            </div>
          </div>

          <div className="relative mt-3 flex justify-center rounded-2xl bg-white p-3">
            <Speedometer speed={speed} />
            <div className="absolute right-2 top-2 flex h-12 w-12 flex-col items-center justify-center rounded-full border-4 border-status-danger bg-white text-slate-900 shadow-md">
              <span className="text-base font-black leading-none">60</span>
              <span className="text-[6px] font-bold uppercase leading-none">km/h</span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <div className="text-base">⏱️</div>
              <div className="font-display text-base font-bold tabular-nums text-bike-blue">00:42</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400">Tiempo</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
              <div className="text-base">📏</div>
              <div className="font-display text-base font-bold tabular-nums text-bike-orange">38.2 km</div>
              <div className="text-[9px] uppercase tracking-widest text-slate-400">Distancia</div>
            </div>
          </div>
        </div>

        {/* Panel Derecho — Convoy en Vivo y Navegación */}
        <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 rounded-xl border border-sky-400/30 bg-sky-500/10 p-3">
            <span className="text-2xl">⬆️</span>
            <div>
              <p className="font-display text-sm font-bold text-white">Vía La Calera</p>
              <p className="text-xs text-sky-200">Curva peligrosa a 300m</p>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {members.map((m, i) => (
              <div key={m.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${m.status === 'onroute' ? 'bg-status-ok' : 'bg-status-warning'}`} />
                  <span className="text-xs font-semibold text-white">
                    {m.name} · {MEMBER_ROLES[i]}
                  </span>
                </div>
                <span className={`text-[11px] font-bold ${m.status === 'onroute' ? 'text-status-ok' : 'text-status-warning'}`}>
                  {m.status === 'onroute' ? 'En Ruta' : 'Rezagado'} · {m.detail}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-bike-blue text-center font-bold text-white shadow-card">
              <span className="text-xl">⛽</span>
              <span className="text-[11px]">Gasolina</span>
            </div>
            <div className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-bike-orange text-center font-bold text-white shadow-card">
              <span className="text-xl">⚠️</span>
              <span className="text-[11px]">Peligro</span>
            </div>
            <div className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-emerald-600 text-center font-bold text-white shadow-card">
              <span className="text-xl">🛑</span>
              <span className="text-[11px]">Reagrupar</span>
            </div>
            <div className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl bg-status-danger text-center font-bold text-white shadow-card">
              <span className="text-xl">🆘</span>
              <span className="text-[11px]">SOS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Réplica fiel del Tablero/Cockpit real de la app: mismo tacómetro (componente real), mismas métricas
 *  y mismos botones de acciones rápidas de 4 colores, con la barra de navegación y el botón SOS. */
function CockpitMockup({ speed }: { speed: number }) {
  return (
    <div className="w-72 overflow-hidden rounded-[2.5rem] border-4 border-slate-800 bg-bike-bg shadow-soft">
      <div className="origin-top scale-[0.8] px-4 pb-2 pt-4">
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-bike-border bg-white p-3 shadow-card">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-slate-400">Vehículo Activo</p>
            <p className="font-display text-sm font-bold text-bike-ink">Yamaha MT-09</p>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 font-display text-xs font-bold tracking-widest text-bike-blue">
            RTX880
          </div>
        </div>

        <div className="rounded-2xl border border-bike-border bg-white p-3 shadow-card">
          <Speedometer speed={speed} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-bike-border bg-white p-3 text-center shadow-card">
            <div className="text-base">⏱️</div>
            <div className="font-display text-base font-bold tabular-nums text-bike-blue">00:42</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400">Tiempo</div>
          </div>
          <div className="rounded-2xl border border-bike-border bg-white p-3 text-center shadow-card">
            <div className="text-base">📏</div>
            <div className="font-display text-base font-bold tabular-nums text-bike-orange">38.2 km</div>
            <div className="text-[9px] uppercase tracking-widest text-slate-400">Distancia</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {QUICK_ACTIONS.map((action) => (
            <div
              key={action.id}
              className={`flex min-h-[52px] items-center justify-center gap-1.5 rounded-2xl p-2 text-center font-bold text-white shadow-card ${action.colorClass}`}
            >
              <span className="text-base">{action.icon}</span>
              <span className="text-[11px] leading-tight">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-around border-t border-bike-border bg-white px-1 pb-1 pt-2"
        style={{ marginTop: '-1.75rem' }}
      >
        <span className="text-sm text-bike-orange">📊</span>
        <span className="text-sm text-slate-300">🗺️</span>
        <div className="-mt-6 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-status-danger text-white shadow-glow-red">
          <span className="text-sm">🆘</span>
        </div>
        <span className="text-sm text-slate-300">🛠️</span>
        <span className="text-sm text-slate-300">👥</span>
      </div>
    </div>
  )
}

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
    <section id="ride-mode" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center font-display text-2xl font-black text-bike-ink sm:text-3xl">Bike Tracker en Acción</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 sm:text-base">
        Así se ve tu convoy en tiempo real, ya sea en tu celular o en la pantalla de tu vehículo.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setMode('mobile')}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            mode === 'mobile' ? 'bg-bike-blue text-white shadow-glow-blue' : 'border border-bike-border bg-white text-slate-600'
          }`}
        >
          📱 Vista Móvil
        </button>
        <button
          onClick={() => setMode('carplay')}
          className={`rounded-full px-4 py-2 text-xs font-bold transition ${
            mode === 'carplay' ? 'bg-bike-blue text-white shadow-glow-blue' : 'border border-bike-border bg-white text-slate-600'
          }`}
        >
          🏎️ Vista CarPlay / Android Auto
        </button>
      </div>

      <div ref={mockup.ref} className={`mt-10 flex justify-center ${scrollRevealClass(mockup.visible)}`}>
        {mode === 'mobile' ? <CockpitMockup speed={speed} /> : <CarPlayMockup speed={speed} members={members} />}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => requestAppAccess(() => setTopLevelMode('app'))}
          className="rounded-full bg-bike-orange px-6 py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-95"
        >
          🚀 Probar en Mi Tablero
        </button>
      </div>
    </section>
  )
}
