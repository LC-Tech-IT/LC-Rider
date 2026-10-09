import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'

/** Cada cuánto se revisa en segundo plano si hay un despliegue nuevo (más allá de la revisión automática
 *  que el navegador ya hace al cargar la página). */
const CHECK_INTERVAL_MS = 5 * 60 * 1000

/** Detecta cuando el Service Worker instala una versión nueva que queda "esperando" (porque la pestaña sigue
 *  controlada por la versión anterior) y ofrece un aviso no intrusivo para activarla con un clic, sin forzar
 *  la recarga mientras el piloto está en plena rodada. */
export default function UpdateBanner() {
  const { t } = useApp()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return

    let intervalId: number | null = null
    let reloaded = false

    function watchInstalling(reg: ServiceWorkerRegistration) {
      const installing = reg.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          setUpdateAvailable(true)
        }
      })
    }

    function handleControllerChange() {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return
      registrationRef.current = reg

      // Ya había una versión nueva esperando (p. ej. se instaló mientras la pestaña estaba en segundo plano).
      if (reg.waiting && navigator.serviceWorker.controller) {
        setUpdateAvailable(true)
      }
      reg.addEventListener('updatefound', () => watchInstalling(reg))
      intervalId = window.setInterval(() => reg.update().catch(() => {}), CHECK_INTERVAL_MS)
    })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [])

  if (!updateAvailable) return null

  function handleUpdate() {
    registrationRef.current?.waiting?.postMessage({ type: 'SKIP_WAITING' })
  }

  return (
    <div
      className="absolute inset-x-0 top-0 z-[90] flex items-center justify-center gap-3 bg-bike-ink px-4 py-2.5 text-center text-xs font-semibold text-white shadow-lg"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.625rem)' }}
    >
      <span>{t('update.available')}</span>
      <button
        onClick={handleUpdate}
        className="flex-shrink-0 rounded-full bg-bike-orange px-3 py-1.5 text-[11px] font-bold text-white shadow-glow-orange active:scale-95"
      >
        {t('update.action')}
      </button>
    </div>
  )
}
