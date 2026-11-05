import { useApp } from '../../context/AppContext'
import VehicleForm from '../garage/VehicleForm'
import { IconMotorcycle } from '../common/Icons'

export default function OnboardingWizard() {
  const { user, addVehicle, logout, openSubscriptionCheckout, t } = useApp()
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bike-bg px-5 pb-8 pt-6">
      {/* Cancelar cierra la sesión y deja al usuario en la bienvenida de la app (WelcomeAuthScreen):
          la app nunca expulsa a la landing comercial. */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-200/60 hover:text-bike-ink"
        >
          {t('onboarding.cancelAndBack')}
        </button>
      </div>

      <div className="mb-5 mt-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-bike-orange shadow-sm">
          <IconMotorcycle className="h-8 w-8" strokeWidth={2} />
        </div>
        <h1 className="mt-3 font-display text-xl font-bold text-bike-ink">{t('onboarding.greeting', { name: firstName })}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('onboarding.explain')}</p>
      </div>

      {/* Incentivo a Convoy Pro: informativo, nunca bloquea el registro gratuito del primer vehículo. */}
      <div className="mb-5 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-slate-950 via-[#0B0F18] to-slate-900 p-4 text-white shadow-lg">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-orange-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
            Convoy Pro
          </span>
          <span className="text-xs font-semibold text-emerald-400">{t('onboarding.proHighlight')}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-300">{t('onboarding.proPitch')}</p>
        <button
          type="button"
          onClick={() => openSubscriptionCheckout('pro', 'yearly')}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-orange-500/40 bg-orange-600/20 px-3 py-2.5 text-xs font-bold text-orange-200 transition hover:bg-orange-600 hover:text-white active:scale-95"
        >
          <span>{t('onboarding.proCta')}</span>
          <span aria-hidden="true">&rarr;</span>
        </button>
      </div>

      <div className="rounded-2xl border border-bike-border bg-white p-4 shadow-card">
        <VehicleForm
          onSave={(vehicle) => addVehicle(vehicle, true)}
          showActiveToggle={false}
          submitLabel={t('onboarding.saveAndEnter')}
        />
      </div>
    </div>
  )
}
