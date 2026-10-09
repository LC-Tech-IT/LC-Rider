import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function LandingPricing() {
  const { setTopLevelMode, openSubscriptionCheckout, requestAppAccess } = useApp()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  function goToCheckout(tier: 'pro' | 'club') {
    requestAppAccess(() => {
      setTopLevelMode('app')
      openSubscriptionCheckout(tier, tier === 'club' ? 'yearly' : billingCycle)
    })
  }

  function startFree() {
    requestAppAccess(() => setTopLevelMode('app'))
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <span className="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bike-orange">
          Planes y Precios
        </span>
        <h2 className="mt-3 font-display text-2xl font-black text-bike-ink sm:text-4xl">
          Precios Claros, Transparentes y Accesibles
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 sm:text-base">
          Elige la modalidad que mejor se adapte a tus rodadas. Sin sorpresas ni letras pequeñas.
        </p>

        {/* Switch de Facturación */}
        <div className="mt-8 inline-flex items-center rounded-full border border-bike-border bg-slate-100 p-1.5 shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
              billingCycle === 'monthly' ? 'bg-white text-bike-ink shadow-card' : 'text-slate-500 hover:text-bike-ink'
            }`}
          >
            Pago Mensual
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
              billingCycle === 'yearly' ? 'bg-bike-orange text-white shadow-glow-orange' : 'text-slate-500 hover:text-bike-ink'
            }`}
          >
            <span>Pago Anual</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                billingCycle === 'yearly' ? 'bg-white text-bike-orange' : 'bg-orange-100 text-bike-orange'
              }`}
            >
              Ahorra 45%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-3">
        {/* Card 1: Piloto Libre */}
        <div className="flex h-full flex-col justify-between rounded-3xl border border-bike-border bg-white p-8 shadow-soft transition hover:shadow-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bike-blue">Plan Piloto Libre</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-bike-ink">$0</span>
              <span className="text-sm font-semibold text-slate-400">/ siempre</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Para quienes salen a rodar de vez en cuando.</p>

            <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>
                  Convoy de hasta <strong>3 pilotos</strong>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>
                  <strong>1 vehículo</strong> en garaje
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>Alertas de SOAT y Tecnomecánica</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>SOS básico con ubicación GPS</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>Rutas y navegación en tiempo real</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={startFree}
              className="w-full rounded-2xl border border-bike-border bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              Empezar Gratis
            </button>
          </div>
        </div>

        {/* Card 2: Convoy Pro (Destacada) */}
        <div className="relative flex h-full flex-col justify-between rounded-3xl border-2 border-bike-orange bg-gradient-to-b from-orange-50/70 via-white to-white p-8 shadow-xl">
          <span className="absolute -top-3.5 right-8 flex items-center gap-1.5 rounded-full bg-bike-orange px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-glow-orange">
            ⭐ Más Popular
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bike-orange">Plan Convoy Pro</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-bike-ink">
                {billingCycle === 'yearly' ? '$99.000' : '$14.900'}
              </span>
              <span className="text-sm font-bold text-slate-500">COP {billingCycle === 'yearly' ? '/ año' : '/ mes'}</span>
            </div>
            <p className="mt-2 text-xs font-bold text-status-ok">
              {billingCycle === 'yearly'
                ? '⚡ Equivale a ≈ $8.250 COP/mes (Ahorras 45%)'
                : 'Paga mes a mes, cancela cuando quieras'}
            </p>

            <ul className="mt-8 space-y-3.5 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>
                  <strong>Pilotos ilimitados</strong> en convoy
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>
                  Hasta <strong>5 vehículos</strong> en el garaje
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>
                  <strong>Alertas de voz</strong> en intercomunicador Bluetooth
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>Telemetría avanzada, radar y exportación GPX</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-bike-orange">✓</span>
                <span>Prioridad en emergencias SOS y alertas grupales</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 space-y-3 pt-4">
            <button
              onClick={() => goToCheckout('pro')}
              className="w-full rounded-2xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
            >
              ⚡ Obtener Convoy Pro
            </button>
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-700">
              🎁 1 Mes Gratis adicional pagando con QR Bancolombia / Nequi
            </p>
          </div>
        </div>

        {/* Card 3: Biker Club */}
        <div className="relative flex h-full flex-col justify-between rounded-3xl border border-bike-border bg-white p-8 shadow-soft transition hover:shadow-card">
          <span className="absolute -top-3.5 right-8 flex items-center gap-1.5 rounded-full bg-bike-ink px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-card">
            👥 Para Clubes
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Plan Biker Club</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-bike-ink">$299.000</span>
              <span className="text-sm font-semibold text-slate-400">COP / año</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Para clubes de moteros, marcas y organizadores.</p>

            <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-amber-500">✓</span>
                <span>
                  Convoy de hasta <strong>25 pilotos simultáneos</strong>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-amber-500">✓</span>
                <span>Código de canje exclusivo para tu Club</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-amber-500">✓</span>
                <span>Nombre y emblema del Club en la cabecera</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-amber-500">✓</span>
                <span>
                  <strong>Todas las funciones Pro</strong> para los miembros
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="font-bold text-amber-500">✓</span>
                <span>Soporte prioritario para rodadas del club</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={() => goToCheckout('club')}
              className="w-full rounded-2xl bg-bike-ink py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-slate-800 active:scale-[0.98]"
            >
              🏆 Activar Biker Club
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
