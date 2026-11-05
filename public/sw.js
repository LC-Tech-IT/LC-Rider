// El marcador de build de CACHE_NAME lo sustituye el plugin pwa-version de vite.config.ts en cada build: así cada despliegue publica
// un sw.js distinto byte a byte (el navegador detecta la versión nueva) y una caché propia (la anterior se borra
// al activarse).
const CACHE_NAME = 'bike-tracker-__BUILD_ID__'
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}),
  )
  // Deliberadamente NO se llama a self.skipWaiting() aquí: una versión nueva debe quedar "esperando"
  // (registration.waiting) mientras la pestaña sigue controlada por la anterior, para que la UI (ver
  // UpdateBanner.tsx) pueda avisar al piloto y dejar que decida cuándo activarla, en vez de recargar la
  // app de golpe en plena rodada.
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

// Puente para el botón "Actualizar Ahora" de UpdateBanner.tsx: activa de inmediato la versión que estaba
// esperando, lo que dispara 'controllerchange' en la página y su recarga controlada.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Estrategia para peticiones del propio origen:
// 1. Navegación (HTML principal): Red primero con fallback a caché para garantizar que siempre
//    se carguen los bundles JS/CSS más recientes del despliegue, y usar caché offline si no hay red.
// 2. Assets estáticos del origen: stale-while-revalidate.
// 3. Dominios externos (tiles, OSRM, Nominatim, Google Fonts): pasan sin interceptar.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // /version.json es el respaldo de detección de versiones: siempre va a la red, nunca a la caché.
  if (url.pathname === '/version.json') return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || (await caches.match('/index.html')) || (await caches.match('/'))
        }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => cached)
      return cached || networkFetch
    }),
  )
})
