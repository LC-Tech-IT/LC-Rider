const CACHE_NAME = 'bike-tracker-v3'
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

// Estrategia stale-while-revalidate, solo para peticiones del propio origen (assets del build,
// imágenes locales). Cualquier llamada a un dominio externo (tiles de mapa, OSRM, Nominatim,
// Google Fonts) pasa de largo sin interceptarse, para no cachear datos que deben ser siempre frescos.
self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

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
