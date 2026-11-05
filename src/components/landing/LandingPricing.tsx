import { useState } from 'react'
import type { ReactNode } from 'react'
import { useApp } from '../../context/AppContext'
import { IconCheck, IconGift } from './LandingIcons'

function Feature({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <li className="flex items-start gap-3">
      <IconCheck className={`mt-0.5 h-4 w-4 flex-shrink-0 ${accent}`} strokeWidth={2.25} />
      <span>{children}</span>
    </li>
  )
}

function Price({ amount, period }: { amount: string; period: string }) {
  return (
    <div className="mt-5 flex items-baseline gap-1.5">
      <span className="font-sans text-4xl font-extrabold tabular-nums tracking-tight text-white sm:text-[2.6rem] 2xl:text-5xl">{amount}</span>
      <span className="text-sm font-medium text-slate-500 2xl:text-base">{period}</span>
    </div>
  )
}

export default function LandingPricing() {
  const { setTopLevelMode, openSubscriptionCheckout, requestAppAccess } = useApp()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const yearly = billingCycle === 'yearly'

  function goToCheckout(tier: 'pro' | 'club') {
    requestAppAccess(() => {
      setTopLevelMode('app')
      openSubscriptionCheckout(tier, billingCycle)
    })
  }

  function startFree() {
    requestAppAccess(() => setTopLevelMode('app'))
  }

  return (
    <section
      id="pricing"
      className="relative overflow-hidden border-t border-white/[0.06] bg-[#070A10] bg-[radial-gradient(ellipse_100%_60%_at_50%_40%,rgba(234,88,12,0.07),transparent_75%)]"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">Planes y Precios</p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Precios claros, sin letra pequeña
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Elige la modalidad que mejor se adapte a tus rodadas. Cambia o cancela cuando quieras.
          </p>

          {/* Switch de Facturación */}
          <div className="mt-9 inline-flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`rounded-lg px-5 py-2 text-xs font-semibold transition sm:text-sm ${
                !yearly ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold transition sm:text-sm ${
                yearly ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Anual
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  yearly ? 'bg-orange-600 text-white' : 'bg-orange-500/15 text-orange-400'
                }`}
              >
                Ahorra hasta 45%
              </span>
            </button>
          </div>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Card 1: Piloto Libre */}
          <div className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-8 lg:p-9 2xl:p-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Piloto Libre</p>
              <Price amount="$0" period="/ siempre" />
              <p className="mt-2 text-xs text-slate-500">Para quienes salen a rodar de vez en cuando.</p>

              <ul className="mt-7 space-y-3.5 border-t border-white/[0.06] pt-6 text-sm text-slate-300 2xl:space-y-4 2xl:text-[15px]">
                <Feature accent="text-slate-400">
                  Convoy de hasta <strong className="font-semibold text-white">3 pilotos</strong>
                </Feature>
                <Feature accent="text-slate-400">
                  <strong className="font-semibold text-white">1 vehículo</strong> en garaje
                </Feature>
                <Feature accent="text-slate-400">Alertas de SOAT y Tecnomecánica</Feature>
                <Feature accent="text-slate-400">SOS básico con ubicación GPS</Feature>
                <Feature accent="text-slate-400">Rutas y navegación en tiempo real</Feature>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={startFree}
                className="w-full rounded-xl border border-white/15 bg-white/5 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white active:scale-[0.98]"
              >
                Empezar Gratis
              </button>
            </div>
          </div>

          {/* Card 2: Convoy Pro (Destacada) */}
          <div className="relative flex h-full flex-col justify-between rounded-2xl border border-orange-500/50 bg-gradient-to-b from-orange-500/[0.07] to-slate-900/60 p-8 shadow-2xl shadow-orange-950/20 lg:p-9 2xl:p-10">
            <span className="absolute -top-3 left-7 rounded-md border border-orange-500/40 bg-[#0B0F18] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">
              Más Popular
            </span>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-400">Convoy Pro</p>
              <Price amount={yearly ? '$99.000' : '$14.900'} period={yearly ? 'COP / año' : 'COP / mes'} />
              <p className="mt-2 text-xs font-medium text-emerald-400">
                {yearly ? 'Equivale a ≈ $8.250 COP/mes · Ahorras 45%' : 'Paga mes a mes, cancela cuando quieras'}
              </p>

              <ul className="mt-7 space-y-3.5 border-t border-white/[0.08] pt-6 text-sm text-slate-300 2xl:space-y-4 2xl:text-[15px]">
                <Feature accent="text-orange-400">
                  <strong className="font-semibold text-white">Pilotos ilimitados</strong> en convoy
                </Feature>
                <Feature accent="text-orange-400">
                  Hasta <strong className="font-semibold text-white">5 vehículos</strong> en el garaje
                </Feature>
                <Feature accent="text-orange-400">
                  <strong className="font-semibold text-white">Alertas de voz</strong> en intercomunicador Bluetooth
                </Feature>
                <Feature accent="text-orange-400">Telemetría avanzada, radar y exportación GPX</Feature>
                <Feature accent="text-orange-400">Prioridad en emergencias SOS y alertas grupales</Feature>
              </ul>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={() => goToCheckout('pro')}
                className="w-full rounded-xl bg-orange-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 active:scale-[0.98]"
              >
                Obtener Convoy Pro
              </button>
              <p className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2 text-center text-[11px] font-medium text-emerald-300">
                <IconGift className="h-3.5 w-3.5 flex-shrink-0" />1 mes gratis adicional pagando con QR Bancolombia / Nequi
              </p>
            </div>
          </div>

          {/* Card 3: Biker Club */}
          <div className="relative flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-8 lg:p-9 2xl:p-10">
            <span className="absolute -top-3 left-7 rounded-md border border-white/15 bg-[#0B0F18] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">
              Para Clubes
            </span>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300">Biker Club</p>
              <Price amount={yearly ? '$299.000' : '$34.900'} period={yearly ? 'COP / año' : 'COP / mes'} />
              <p className="mt-2 text-xs font-medium text-amber-300/90">
                {yearly ? 'Equivale a ≈ $24.916 COP/mes · Ahorras 28%' : 'Flexibilidad mes a mes para tu club o rodadas'}
              </p>

              <ul className="mt-7 space-y-3.5 border-t border-white/[0.06] pt-6 text-sm text-slate-300 2xl:space-y-4 2xl:text-[15px]">
                <Feature accent="text-amber-300">
                  Convoy de hasta <strong className="font-semibold text-white">25 pilotos simultáneos</strong>
                </Feature>
                <Feature accent="text-amber-300">Código de canje exclusivo para tu Club</Feature>
                <Feature accent="text-amber-300">Nombre y emblema del Club en la cabecera</Feature>
                <Feature accent="text-amber-300">
                  <strong className="font-semibold text-white">Todas las funciones Pro</strong> para los miembros
                </Feature>
                <Feature accent="text-amber-300">Soporte prioritario para rodadas del club</Feature>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => goToCheckout('club')}
                className="w-full rounded-xl border border-amber-300/30 bg-amber-300/10 py-3.5 text-sm font-bold text-amber-200 transition hover:bg-amber-300/15 hover:text-amber-100 active:scale-[0.98]"
              >
                Activar Biker Club
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
