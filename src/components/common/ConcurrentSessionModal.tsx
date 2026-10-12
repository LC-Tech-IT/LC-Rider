import { useState } from 'react'
import { useApp } from '../../context/AppContext'

/** Modal bloqueante de sesión única: aparece cuando la cuenta se abre en otro dispositivo. No se cierra con
 *  clic exterior; la única salida es retomar el control en este dispositivo o cerrar sesión. */
export default function ConcurrentSessionModal() {
  const { concurrentSessionModalOpen, reclaimSession, logout, t } = useApp()
  const [reclaiming, setReclaiming] = useState(false)
  const [error, setError] = useState(false)

  if (!concurrentSessionModalOpen) return null

  async function handleReclaim() {
    setReclaiming(true)
    setError(false)
    try {
      setError(!(await reclaimSession()))
    } finally {
      setReclaiming(false)
    }
  }

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-slate-900/70 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-3xl border border-bike-border bg-white p-6 text-center shadow-2xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-red-100 text-4xl">
          ⚠️
        </span>
        <h2 className="mt-4 font-display text-lg font-bold text-bike-ink">{t('session.concurrentTitle')}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t('session.concurrentMessage')}</p>
        {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{t('session.reclaimError')}</p>}

        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleReclaim}
            disabled={reclaiming}
            className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98] disabled:opacity-70"
          >
            {reclaiming ? t('session.reclaiming') : t('session.reclaimAction')}
          </button>
          <button
            onClick={logout}
            disabled={reclaiming}
            className="w-full rounded-xl border border-bike-border bg-white py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            {t('session.logoutAction')}
          </button>
        </div>
      </div>
    </div>
  )
}
