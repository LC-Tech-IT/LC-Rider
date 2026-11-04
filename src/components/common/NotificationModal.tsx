import { useApp } from '../../context/AppContext'
import { IconBell } from './Icons'

function formatTimestamp(timestamp: number, lang: 'es' | 'en'): string {
  return new Date(timestamp).toLocaleString(lang === 'es' ? 'es-CO' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotificationModal() {
  const {
    notificationModalOpen,
    setNotificationModalOpen,
    sosAlerts,
    convoyAlerts,
    activeVehicle,
    vehicleDocStatus,
    clearAllNotifications,
    setView,
    lang,
    t,
  } = useApp()

  if (!notificationModalOpen) return null

  const soatStatus = vehicleDocStatus(activeVehicle.soat.expiresAt)
  const tecnoStatus = vehicleDocStatus(activeVehicle.tecnomecanica.expiresAt)
  const docWarnings = [
    soatStatus.status !== 'ok' ? { label: 'SOAT', status: soatStatus.status } : null,
    tecnoStatus.status !== 'ok' ? { label: 'Tecnomecánica', status: tecnoStatus.status } : null,
  ].filter((w): w is { label: string; status: 'warning' | 'expired' } => w !== null)

  const hasAnything = sosAlerts.length > 0 || convoyAlerts.length > 0 || docWarnings.length > 0

  function viewOnMap() {
    setView('map')
    setNotificationModalOpen(false)
  }

  return (
    <div
      className="absolute inset-0 z-[100] flex items-end justify-center bg-slate-900/50 sm:items-center"
      onClick={() => setNotificationModalOpen(false)}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-bike-border bg-white p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-bike-ink">{t('notifications.title')}</h2>
          <button onClick={() => setNotificationModalOpen(false)} className="text-2xl leading-none text-slate-400" aria-label={t('auth.close')}>
            ×
          </button>
        </div>

        {hasAnything && (
          <button
            onClick={clearAllNotifications}
            className="mb-4 w-full rounded-xl border border-bike-border py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            {t('notifications.clearAll')}
          </button>
        )}

        {!hasAnything ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-700">
              <IconBell className="h-8 w-8" strokeWidth={2} />
            </span>
            <p className="max-w-xs text-sm font-medium text-slate-700">{t('notifications.empty')}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sosAlerts.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('notifications.sectionSos')}</p>
                <div className="space-y-2">
                  {sosAlerts.map((alert) => (
                    <div key={alert.id} className="rounded-xl border border-status-danger/30 bg-red-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-status-danger">{t('notifications.sosAlert', { name: alert.memberName })}</p>
                        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-status-danger" />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{formatTimestamp(alert.timestamp, lang)}</p>
                      <button onClick={viewOnMap} className="mt-2 text-xs font-bold text-bike-blue">
                        {t('notifications.viewOnMap')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {convoyAlerts.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('notifications.sectionConvoy')}</p>
                <div className="space-y-2">
                  {convoyAlerts.map((alert) => (
                    <div key={alert.id} className="rounded-xl border border-bike-border bg-slate-50 p-3">
                      <p className="text-sm text-bike-ink">{alert.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatTimestamp(alert.timestamp, lang)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {docWarnings.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('notifications.sectionDocs')}</p>
                <div className="space-y-2">
                  {docWarnings.map((w) => (
                    <div
                      key={w.label}
                      className={`rounded-xl border p-3 ${
                        w.status === 'expired' ? 'border-status-danger/30 bg-red-50' : 'border-status-warning/30 bg-amber-50'
                      }`}
                    >
                      <p className={`text-sm font-semibold ${w.status === 'expired' ? 'text-status-danger' : 'text-amber-700'}`}>
                        {t(w.status === 'expired' ? 'notifications.docExpiredAlert' : 'notifications.docAlert', {
                          plate: activeVehicle.plate,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
