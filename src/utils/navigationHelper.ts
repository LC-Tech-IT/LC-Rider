import { Capacitor } from '@capacitor/core'

/** Detección informativa: si la app corre instalada (PWA standalone o empaquetada con Capacitor). */
export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  return iosStandalone || displayModeStandalone || Capacitor.isNativePlatform()
}

/** Navegación a "Inicio": en navegador web es un simple cambio de estado reactivo hacia la Landing. En la
 *  app instalada (PWA standalone o APK) la Landing se abre en el navegador del sistema en vez de reemplazar
 *  la app, para mantener ambos entornos totalmente independientes. */
export function goToLanding(setTopLevelMode?: (mode: 'landing' | 'app') => void) {
  if (isStandaloneApp()) {
    window.open(window.location.origin, '_blank', 'noopener,noreferrer')
    return
  }
  if (setTopLevelMode) {
    setTopLevelMode('landing')
  }
}
