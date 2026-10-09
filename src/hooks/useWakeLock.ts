import { useEffect, useRef } from 'react'

/** Mantiene la pantalla encendida mientras `enabled` sea verdadero (rodada activa o vistas de Tablero/Mapa),
 *  reclamando `navigator.wakeLock` de nuevo si el sistema operativo lo libera al volver del segundo plano. */
export function useWakeLock(enabled: boolean) {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return

    let isMounted = true

    async function requestLock() {
      try {
        if (document.visibilityState === 'visible' && !sentinelRef.current) {
          sentinelRef.current = await navigator.wakeLock.request('screen')
          sentinelRef.current.addEventListener('release', () => {
            sentinelRef.current = null
          })
        }
      } catch {
        // Silencioso si el sistema operativo no otorga permiso (p. ej. batería baja).
      }
    }

    requestLock()

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && enabled && isMounted) {
        requestLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null
    }
  }, [enabled])
}
