import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const APK_VERSION = '1.0.0'
const APK_SIZE = '18.4 MB'

type GatewayView = 'choices' | 'pwa' | 'apk'

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
  const [view, setView] = useState<GatewayView>('choices')

  // Cada vez que se abre el modal arranca desde la pantalla de opciones, sin arrastrar la sub-vista
  // (PWA/APK) en la que se haya quedado la última vez que se abrió.
  useEffect(() => {
    if (installModalOpen) setView('choices')
  }, [installModalOpen])

  if (!installModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm"
      onClick={() => setInstallModalOpen(false)}
    >
      <div
        className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-3xl border border-bike-border bg-white p-6 shadow-2xl duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/app-icon.jpg" alt="Bike Tracker" className="h-11 w-11 rounded-xl object-cover shadow-card" />
            <div>
              <p className="font-display text-base font-bold text-bike-ink">{t('install.title')}</p>
              <p className="text-xs text-slate-500">{t('install.subtitle')}</p>
            </div>
          </div>
          <button onClick={() => setInstallModalOpen(false)} className="text-2xl leading-none text-slate-400" aria-label={t('install.close')}>
            ×
          </button>
        </div>

        {isStandalone ? (
          <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-center text-sm font-semibold text-status-ok">
            {t('install.alreadyInstalled')}
          </div>
        ) : view === 'choices' ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-slate-600">{t('install.valueMessage')}</p>

            <div className="space-y-2.5">
              <button
                onClick={continueToApp}
                className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
              >
                {t('install.openAppOption')}
              </button>
              <button
                onClick={() => setView('pwa')}
                className="w-full rounded-xl border border-bike-border bg-white py-3.5 text-sm font-bold text-bike-ink shadow-card transition hover:bg-slate-50 active:scale-[0.98]"
              >
                {t('install.installPwaOption')}
              </button>
              <button
                onClick={() => setView('apk')}
                className="w-full rounded-xl border border-bike-border bg-white py-3.5 text-sm font-bold text-bike-ink shadow-card transition hover:bg-slate-50 active:scale-[0.98]"
              >
                {t('install.downloadApkOption')}
              </button>
            </div>

            <button onClick={continueToApp} className="w-full text-center text-xs font-semibold text-slate-400 underline-offset-2 hover:underline">
              {t('install.continueWebOption')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setView('choices')}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-bike-ink"
            >
              ← {t('install.backToOptions')}
            </button>

            {view === 'pwa' ? (
              <div className="space-y-4">
                <p className="text-center text-xs font-semibold uppercase tracking-widest text-bike-orange">{t('install.pwaRecommended')}</p>

                {canInstallNatively ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">{t('install.pwaNativeText')}</p>
                    <button
                      onClick={triggerNativeInstall}
                      className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
                    >
                      {t('install.pwaInstallNow')}
                    </button>
                  </div>
                ) : isIosDevice ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">{t('install.pwaIosIntro')}</p>
                    <ol className="space-y-3 text-sm text-slate-700">
                      {[t('install.pwaIosStep1'), t('install.pwaIosStep2'), t('install.pwaIosStep3')].map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-bike-orange">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600">{t('install.pwaFallbackText')}</p>
                    <p className="text-xs text-slate-400">{t('install.pwaFallbackHint')}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-bike-border bg-slate-50 p-4">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-card">🤖</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-bike-ink">{t('install.apkTitle')}</p>
                    <p className="text-xs text-slate-500">
                      {t('install.apkVersion', { version: APK_VERSION })} · {t('install.apkSize', { size: APK_SIZE })}
                    </p>
                  </div>
                </div>

                <a
                  href="/downloads/bike-tracker.apk"
                  download
                  className="flex w-full items-center justify-center rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
                >
                  {t('install.apkDownloadButton')}
                </a>

                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t('install.apkGuideTitle')}</p>
                  <ol className="space-y-3 text-sm text-slate-700">
                    {[t('install.apkGuideStep1'), t('install.apkGuideStep2'), t('install.apkGuideStep3')].map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-bike-orange">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-700">{t('install.apkWarning')}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setInstallModalOpen(false)}
          className="mt-4 w-full rounded-xl border border-bike-border py-3 text-sm font-semibold text-slate-600"
        >
          {t('install.closeButton')}
        </button>
      </div>
    </div>
  )
}
