import { useApp } from '../../context/AppContext'
import VehicleForm from '../garage/VehicleForm'

export default function OnboardingWizard() {
  const { user, addVehicle, setTopLevelMode, t } = useApp()
  const firstName = user?.name?.split(' ')[0] ?? ''

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bike-bg px-5 pb-8 pt-8">
      <button
        onClick={() => setTopLevelMode('landing')}
        className="self-start text-xs font-semibold text-slate-500 underline transition hover:text-bike-ink"
      >
        {t('onboarding.cancelAndBack')}
      </button>

      <div className="mb-6 mt-4 text-center">
        <span className="text-4xl">🏍️</span>
        <h1 className="mt-3 font-display text-xl font-bold text-bike-ink">{t('onboarding.greeting', { name: firstName })}</h1>
        <p className="mt-2 text-sm text-slate-500">{t('onboarding.explain')}</p>
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
