# 🚀 Prompt de Ejecución para Claude — Sprint 28: Resiliencia Motera en Ruta, Auto-Actualización PWA/Store y Blindaje de Seguridad

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
Estamos en la fase de **afinado de resiliencia, seguridad y preparación para tiendas de aplicaciones (Play Store & App Store)**.

Debemos implementar 5 bloques esenciales para asegurar un producto de nivel empresarial:
1. **Screen Wake Lock API:** Pantalla siempre activa y protegida contra bloqueo durante la rodada.
2. **Resiliencia Offline en Túneles:** GPS satelital nativo continuo y reconexión suave de WebSockets sin alertas intrusivas.
3. **Gestión Inteligente de Batería & Modo Guantes:** Throttling cuando la moto está detenida y botones con touch targets >= 48px.
4. **Sistema de Auto-Actualización (PWA / Live Updates):** Detección en segundo plano de nuevas versiones desplegadas y aviso no intrusivo para recargar con 1 clic.
5. **Blindaje de Seguridad Web & App:** Cabeceras de seguridad HTTP (`vercel.json`), sanitización de entradas y protección contra inyecciones y clickjacking.

---

## 2. [Objetivo Concreto y Alcance]

### A. Screen Wake Lock (`src/hooks/useWakeLock.ts`):
- Activar `navigator.wakeLock.request('screen')` cuando `rideActive === true` o en vistas `cockpit` / `map`.
- Re-adquirir el WakeLock en el evento `visibilitychange` cuando la app vuelve al primer plano.

### B. Resiliencia de Conectividad & Estado Offline:
- Exponer `isOnline` en `AppContext.tsx`.
- Si `!isOnline`, mostrar badge superior sutil: `⚠️ Sin conexión a internet · GPS Satelital Activo`.
- Evitar que fallos temporales de red congelen la UI o rompan la sesión.

### C. Sistema de Auto-Actualización de la App (`src/components/common/UpdateBanner.tsx` + `sw.js`):
- Registrar listener en el Service Worker para detectar cuando hay un nuevo Service Worker esperando activación (`waiting`).
- Desplegar una notificación superior elegante: *"🚀 Nueva actualización disponible. [Actualizar Ahora]"* que ejecute `skipWaiting()` y `window.location.reload()`.

### D. Blindaje de Seguridad (`vercel.json`):
- Crear/actualizar `vercel.json` con cabeceras de seguridad:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(self), wake-lock=(self)`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`

### E. Ergonomía para Guantes (Touch Targets de 48px+):
- En `CockpitView.tsx` y `ConvoyMap.tsx`, clases `min-h-[48px] min-w-[48px]` en controles de navegación y alertas.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/hooks/useWakeLock.ts` (Nuevo hook de gestión de pantalla activa).
- `src/components/common/UpdateBanner.tsx` (Nuevo componente de notificación de actualización).
- `public/sw.js` (Estrategia de ciclo de vida de caché con soporte para skipWaiting y control de versiones).
- `src/context/AppContext.tsx` (Integración de WakeLock, conectividad `isOnline` y throttle de GPS).
- `src/components/cockpit/CockpitView.tsx` (Botones de 48px+ y badge offline).
- `src/components/map/ConvoyMap.tsx` (Botones de 48px+ y badge offline).
- `vercel.json` (Cabeceras de seguridad y configuración de rutas SPA).
- `src/utils/i18n.ts` (Traducciones para WakeLock, offline y actualizaciones).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Crear Hook `src/hooks/useWakeLock.ts`
```typescript
import { useEffect, useRef } from 'react'

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
      } catch (err) {
        // Silencioso si el sistema operativo no otorga permiso
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
```

---

### Tarea 2: Crear Sistema de Auto-Actualización (`src/components/common/UpdateBanner.tsx`)
1. Detectar actualizaciones de Service Worker:
```typescript
import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function UpdateBanner() {
  const { t } = useApp()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker)
            setUpdateAvailable(true)
          }
        })
      })

      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting)
        setUpdateAvailable(true)
      }
    })
  }, [])

  function handleUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }
    window.location.reload()
  }

  if (!updateAvailable) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-bike-orange px-4 py-2.5 text-xs font-bold text-white shadow-lg animate-in slide-in-from-top">
      <div className="flex items-center gap-2">
        <span>🚀</span>
        <span>{t('app.updateAvailable')}</span>
      </div>
      <button
        onClick={handleUpdate}
        className="rounded-lg bg-white px-3 py-1 font-extrabold text-bike-orange shadow transition active:scale-95"
      >
        {t('app.updateButton')}
      </button>
    </div>
  )
}
```
2. En `public/sw.js`, agregar el listener:
```javascript
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
```

---

### Tarea 3: Configurar Cabeceras de Seguridad en `vercel.json`
Crear/actualizar `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(self), wake-lock=(self)" }
      ]
    }
  ],
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Tarea 4: Integrar WakeLock, Conectividad y UpdateBanner en `AppContext.tsx` y `App.tsx`
1. En `AppContext.tsx`: Invocar `useWakeLock(rideActive || view === 'cockpit' || view === 'map')` y exponer `isOnline`.
2. En `App.tsx`: Incluir `<UpdateBanner />`.
3. En `CockpitView.tsx` y `ConvoyMap.tsx`: Ajustar tamaños mínimos de botones a `h-12 w-12` (48px) y añadir el badge discreto si `!isOnline`.

---

### Tarea 5: Actualizar Traducciones (`src/utils/i18n.ts`)
1. Agregar llaves de i18n para:
   - `app.updateAvailable`: *"Nueva versión disponible con mejoras de ruta."*
   - `app.updateButton`: *"Actualizar Ahora"*
   - `status.offlineGps`: *"Sin conexión de datos (GPS Satelital Activo)"*

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] La pantalla del dispositivo se mantiene encendida automáticamente durante la rodada y no se apaga.
- [ ] Al perder señal o simular desconexión, la app se mantiene fluida con el badge de GPS Satelital sin cuadros de diálogo molestos.
- [ ] Cuando se publica un nuevo despliegue, la app detecta la actualización y muestra el banner de recarga en 1 clic.
- [ ] `vercel.json` incluye todas las cabeceras de seguridad recomendadas (CSP, anti-clickjacking, no-sniff).
- [ ] `npm run build` compila al 100% sin errores de TypeScript ni linter.
