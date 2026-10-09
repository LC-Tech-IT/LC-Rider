import { useApp } from '../../context/AppContext'

export default function LandingPricing() {
  const { setTopLevelMode, openSubscriptionCheckout, requestAppAccess } = useApp()

  function goToCheckout(tier: 'pro' | 'club') {
    requestAppAccess(() => {
      setTopLevelMode('app')
      openSubscriptionCheckout(tier)
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

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
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
          <p className="text-xs font-bold uppercase tracking-widest text-bike-orange">Plan Convoy Pro</p>
          <p className="mt-2 font-display text-3xl font-black text-bike-ink">
            $9.900 COP<span className="text-sm font-semibold text-slate-400"> / mes</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">≈ $2.49 USD/mes · o $79.900 COP (≈ $19.99 USD) al año</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>👥 Pilotos ilimitados en convoy</li>
            <li>🛠️ Hasta 5 vehículos en el garaje</li>
            <li>🎙️ Alertas por voz en intercomunicador</li>
            <li>📡 Telemetría, radar y exportación GPX</li>
          </ul>
          <button
            onClick={() => goToCheckout('pro')}
            className="mt-8 w-full rounded-xl bg-bike-orange py-3 text-sm font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
          >
            ⚡ Obtener Convoy Pro
          </button>
        </div>

        <div className="relative rounded-3xl border border-bike-gold/50 bg-gradient-to-b from-amber-50 to-white p-7 shadow-soft">
          <span className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-bike-ink px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Para Clubes
          </span>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Plan Biker Club</p>
          <p className="mt-2 font-display text-3xl font-black text-bike-ink">
            $39.900 COP<span className="text-sm font-semibold text-slate-400"> / mes</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">≈ $9.99 USD/mes</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-600">
            <li>🏆 Hasta 25 pilotos por sala de convoy</li>
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
