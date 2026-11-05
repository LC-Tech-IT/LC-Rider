import { useApp } from '../../context/AppContext'

/** Modal de instalación 100% PWA: un toque en Android/Chrome/Edge (prompt nativo), guía de 3 pasos en
 *  iOS Safari y explicación para anclar la app en escritorio u otros navegadores. */
export default function InstallAppModal() {
  const {
    installModalOpen,
    setInstallModalOpen,
    canInstallNatively,
    isIosDevice,
    isStandalone,
    triggerNativeInstall,
    continueToApp,
    t,
  } = useApp()

  if (!installModalOpen) return null

  const iosSteps = [
    { icon: '⎋', text: t('install.iosStep1') },
    { icon: '➕', text: t('install.iosStep2') },
    { icon: '✓', text: t('install.iosStep3') },
  ]

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={() => setInstallModalOpen(false)}
    >
      <div
        className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-3xl border border-bike-border bg-white p-6 shadow-2xl duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setInstallModalOpen(false)}
          className="absolute right-5 top-4 text-2xl leading-none text-slate-400"
          aria-label={t('install.close')}
        >
          ×
        </button>

        <div className="flex flex-col items-center text-center">
          <img src="/images/app-icon.jpg" alt="LC Rider" className="h-16 w-16 rounded-2xl object-cover shadow-card" />
          <h2 className="mt-3 font-display text-lg font-black text-bike-ink">{t('install.title')}</h2>
          <p className="mt-1 text-xs text-slate-500">{t('install.subtitle')}</p>
        </div>

        <div className="mt-5">
          {isStandalone ? (
            <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center text-sm font-semibold text-status-ok">
              {t('install.alreadyInstalled')}
            </div>
          ) : canInstallNatively ? (
            <div className="space-y-3">
              <button
                onClick={triggerNativeInstall}
                className="w-full rounded-2xl bg-bike-orange py-4 text-base font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
              >
                {t('install.nativeCta')}
              </button>
              <p className="text-center text-xs font-semibold text-slate-500">{t('install.nativeSupport')}</p>
            </div>
          ) : isIosDevice ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-600">{t('install.iosIntro')}</p>
              <ol className="space-y-2.5">
                {iosSteps.map((step, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-2xl border border-bike-border bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-bike-orange text-xs font-black text-white">
                      {i + 1}
                    </span>
                    <span className="flex-1">{step.text}</span>
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-base text-bike-blue shadow-card">
                      {step.icon}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl border border-bike-border bg-slate-50 p-4">
              <p className="text-sm text-slate-600">{t('install.desktopText')}</p>
              <p className="text-xs text-slate-400">{t('install.desktopHint')}</p>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <button
            onClick={continueToApp}
            className="w-full rounded-xl border border-bike-border bg-white py-3 text-sm font-bold text-bike-ink shadow-card transition hover:bg-slate-50 active:scale-[0.98]"
          >
            {t('install.continueWeb')}
          </button>
          <button
            onClick={() => setInstallModalOpen(false)}
            className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            {t('install.closeButton')}
          </button>
        </div>
      </div>
    </div>
  )
}
