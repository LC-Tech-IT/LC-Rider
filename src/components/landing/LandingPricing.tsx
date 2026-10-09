import { useApp } from '../../context/AppContext'

export default function LandingPricing() {
  const { setTopLevelMode, openSubscriptionCheckout, requestAppAccess } = useApp()

  function goToCheckout(tier: 'pro' | 'club', billingCycle?: 'monthly' | 'yearly') {
    requestAppAccess(() => {
      setTopLevelMode('app')
      openSubscriptionCheckout(tier, billingCycle)
    })
  }

  function startFree() {
    requestAppAccess(() => setTopLevelMode('app'))
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center font-display text-2xl font-black text-bike-ink sm:text-3xl">Precios Claros y Accesibles</h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 sm:text-base">
        Empieza gratis con tu grupo pequeño, desbloquea Convoy Pro para rodar sin límites, o activa Biker Club para tu club de motociclistas.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-bike-border bg-white p-7 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-widest text-bike-blue">Plan Piloto Libre</p>
          <p className="mt-2 font-display text-3xl font-black text-bike-ink">
            $0<span className="text-sm font-semibold text-slate-400"> / siempre</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>🏍️ Convoy de hasta 3 pilotos</li>
            <li>🛠️ 1 vehículo en el garaje</li>
            <li>🆘 SOS básico con ubicación GPS</li>
            <li>🗺️ Rutas y navegación en tiempo real</li>
          </ul>
          <button
            onClick={startFree}
            className="mt-8 w-full rounded-xl border border-bike-border py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Empezar Gratis
          </button>
        </div>

        <div className="relative rounded-3xl border border-bike-orange/50 bg-gradient-to-b from-orange-50 to-white p-7 shadow-soft">
          <span className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-bike-gold px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Más Popular
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-bike-orange">Convoy Pro Anual</p>
          <p className="mt-2 font-display text-3xl font-black text-bike-ink">
            $99.000 COP<span className="text-sm font-semibold text-slate-400"> / año</span>
          </p>
          <p className="mt-1 text-xs font-bold text-status-ok">Ahorras 45% · ≈ $8.250 COP/mes</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>👥 Pilotos ilimitados en convoy</li>
            <li>🛠️ Hasta 5 vehículos en el garaje</li>
            <li>🎙️ Alertas por voz en intercomunicador</li>
            <li>📡 Telemetría, radar y exportación GPX</li>
          </ul>
          <button
            onClick={() => goToCheckout('pro', 'yearly')}
            className="mt-8 w-full rounded-xl bg-bike-orange py-3 text-sm font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
          >
            ⚡ Obtener Convoy Pro Anual
          </button>
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-700">
            ⚡ Paga por QR Bancolombia/Nequi: ahorra comisiones + 1 mes adicional gratis
          </p>
        </div>

        <div className="rounded-3xl border border-bike-border bg-white p-7 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-widest text-bike-blue">Convoy Pro Mensual</p>
          <p className="mt-2 font-display text-3xl font-black text-bike-ink">
            $14.900 COP<span className="text-sm font-semibold text-slate-400"> / mes</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Paga mes a mes, sin permanencia</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>👥 Pilotos ilimitados en convoy</li>
            <li>🛠️ Hasta 5 vehículos en el garaje</li>
            <li>🎙️ Alertas por voz en intercomunicador</li>
            <li>📡 Telemetría, radar y exportación GPX</li>
          </ul>
          <button
            onClick={() => goToCheckout('pro', 'monthly')}
            className="mt-8 w-full rounded-xl border border-bike-border py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Obtener Convoy Pro Mensual
          </button>
        </div>

        <div className="relative rounded-3xl border border-bike-gold/50 bg-gradient-to-b from-amber-50 to-white p-7 shadow-soft">
          <span className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-bike-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Para Clubes
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Plan Biker Club</p>
          <p className="mt-2 font-display text-3xl font-black text-bike-ink">
            $299.000 COP<span className="text-sm font-semibold text-slate-400"> / año</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Administración grupal para tu club motero</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>👥 Convoy de hasta 25 pilotos simultáneos</li>
            <li>🔑 Cuenta de club o Código de Club</li>
            <li>🎙️ Todo lo incluido en Convoy Pro</li>
          </ul>
          <button
            onClick={() => goToCheckout('club')}
            className="mt-8 w-full rounded-xl bg-bike-ink py-3 text-sm font-bold text-white shadow-card transition active:scale-[0.98]"
          >
            🏆 Activar Biker Club
          </button>
        </div>
      </div>
    </section>
  )
}
