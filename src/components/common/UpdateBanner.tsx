import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { IconRotateCw } from './Icons'

/** Revisión periódica en segundo plano (además de al abrir la app y al volver a primer plano). */
const CHECK_INTERVAL_MS = 3 * 60 * 1000
/** "Más tarde" oculta el aviso durante este tiempo; luego reaparece en la siguiente revisión. */
const SNOOZE_MS = 30 * 60 * 1000
/** Si el nuevo Service Worker no toma el control a tiempo, se recarga igual (la navegación va a red primero). */
const RELOAD_FALLBACK_MS = 3000

interface VersionInfo {
  buildId: string
  buildTime?: string
  version?: string
  commit?: string | null
}

/** Etiqueta del build nuevo: commit desplegado (Cloudflare Pages) o, si no hay, fecha y hora del build. */
function versionLabel(info: VersionInfo): string {
  const version = info.version ? `v${info.version}` : ''
  let detail = info.commit ?? ''
  if (!detail && info.buildTime) {
    const d = new Date(info.buildTime)
    const pad = (n: number) => String(n).padStart(2, '0')
    if (!Number.isNaN(d.getTime())) detail = `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  }
  return [version, detail].filter(Boolean).join(' · ')
}

/** Build publicado en el servidor. `null` si no se pudo consultar (sin red, entorno de desarrollo). */
async function fetchLatestVersion(): Promise<VersionInfo | null> {
  try {
    const res = await fetch(`/version.json?_t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<VersionInfo>
    return typeof data.buildId === 'string' ? (data as VersionInfo) : null
  } catch {
    return null
  }
}

/** true si el servidor tiene un build más reciente que el que está corriendo esta pestaña. */
const isNewer = (info: VersionInfo | null) => !!info && Number(info.buildId) > Number(__APP_BUILD_ID__)

/** Aviso global de actualización de la PWA (landing, bienvenida, onboarding y app).
 *
 *  Detecta un despliegue nuevo por dos vías:
 *  1. Service Worker: cada build publica un sw.js distinto; el nuevo queda "esperando" (registration.waiting).
 *  2. /version.json: respaldo para iOS Safari y para PWAs que vuelven de segundo plano con código viejo en memoria.
 *  Revisa al abrir, al volver a primer plano (`visibilitychange`) y cada 3 minutos.
 *
 *  "Actualizar Ahora" activa el SW en espera (SKIP_WAITING → `controllerchange` → recarga). Durante una rodada
 *  nunca se recarga: solo se muestra una pastilla mínima y la tarjeta aparece al terminar. */
export default function UpdateBanner() {
  const { t, rideActive } = useApp()
  const [updateReady, setUpdateReady] = useState(false)
  const [newVersion, setNewVersion] = useState<string | null>(null)
  const [snoozedUntil, setSnoozedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const [isUpdating, setIsUpdating] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  /** Solo se recarga ante `controllerchange` si el usuario pidió actualizar en esta pestaña. */
  const updateRequestedRef = useRef(false)

  useEffect(() => {
    // En desarrollo no hay version.json ni build id real: el aviso no aplica.
    if (import.meta.env.DEV) return
    const sw = 'serviceWorker' in navigator ? navigator.serviceWorker : null
    let disposed = false

    function applyVersion(info: VersionInfo | null) {
      if (disposed || !isNewer(info) || !info) return
      setNewVersion(versionLabel(info) || null)
      setUpdateReady(true)
    }

    /** Hay un SW nuevo esperando. Si esta pestaña ya corre el build más reciente (p. ej. se recargó por otra vía),
     *  se activa en silencio; si no, o si no se puede confirmar (sin red), se avisa al usuario. */
    async function handleWaiting(reg: ServiceWorkerRegistration) {
      if (!reg.waiting || !sw?.controller) return
      const latest = await fetchLatestVersion()
      if (disposed) return
      if (latest && latest.buildId === __APP_BUILD_ID__) {
        reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
        return
      }
      applyVersion(latest)
      setUpdateReady(true)
    }

    function watchInstalling(reg: ServiceWorkerRegistration) {
      const worker = reg.installing
      if (!worker) return
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed') void handleWaiting(reg)
      })
    }

    function check() {
      setNow(Date.now())
      void registrationRef.current?.update().catch(() => {})
      void fetchLatestVersion().then(applyVersion)
    }

    function onVisibility() {
      if (document.visibilityState === 'visible') check()
    }

    function onControllerChange() {
      if (updateRequestedRef.current) window.location.reload()
    }

    sw?.addEventListener('controllerchange', onControllerChange)
    // `ready` (y no getRegistration) porque main.tsx registra el SW en el evento `load`, después de este montaje.
    void sw?.ready.then((reg) => {
      if (disposed) return
      registrationRef.current = reg
      void handleWaiting(reg)
      watchInstalling(reg)
      reg.addEventListener('updatefound', () => watchInstalling(reg))
    })

    document.addEventListener('visibilitychange', onVisibility)
    const intervalId = window.setInterval(check, CHECK_INTERVAL_MS)
    void fetchLatestVersion().then(applyVersion)

    return () => {
      disposed = true
      sw?.removeEventListener('controllerchange', onControllerChange)
      document.removeEventListener('visibilitychange', onVisibility)
      window.clearInterval(intervalId)
    }
  }, [])

  function handleUpdate() {
    setIsUpdating(true)
    updateRequestedRef.current = true
    const waiting = registrationRef.current?.waiting
    if (waiting) {
      waiting.postMessage({ type: 'SKIP_WAITING' })
      window.setTimeout(() => window.location.reload(), RELOAD_FALLBACK_MS)
    } else {
      window.location.reload()
    }
  }

  function handleLater() {
    const until = Date.now() + SNOOZE_MS
    setSnoozedUntil(until)
    setNow(Date.now())
  }

  if (!updateReady) return null

  // En plena rodada: pastilla mínima, sin botones ni recarga, que no tapa velocímetro, mapa ni SOS.
  if (rideActive && !isUpdating) {
    return (
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center px-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 4px)' }}
        role="status"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur-sm">
          <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
          {t('update.ridePill')}
        </span>
      </div>
    )
  }

  if (now < snoozedUntil && !isUpdating) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] px-3"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <div
        className="pointer-events-auto mx-auto max-w-md rounded-2xl border border-orange-500/40 bg-[#0B101B]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md duration-300 animate-in fade-in slide-in-from-top-4"
        role="alertdialog"
        aria-labelledby="update-banner-title"
        aria-describedby="update-banner-desc"
      >
        <div className="flex items-start gap-3">
          <span className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
            <span className="absolute inset-0 rounded-xl ring-1 ring-orange-500/50 motion-safe:animate-pulse" aria-hidden="true" />
            <IconRotateCw className={`h-5 w-5 ${isUpdating ? 'animate-spin' : ''}`} strokeWidth={2.25} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p id="update-banner-title" className="text-sm font-extrabold text-white">
                {t('update.title')}
              </p>
              {newVersion && (
                <span className="rounded-md border border-orange-500/30 bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-300">
                  {newVersion}
                </span>
              )}
            </div>
            <p id="update-banner-desc" className="mt-1 text-xs leading-relaxed text-slate-300">
              {t('update.desc')}
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex gap-2">
          <button
            onClick={handleLater}
            disabled={isUpdating}
            className="h-12 flex-1 rounded-xl border border-white/15 text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white active:scale-[0.98] disabled:opacity-40"
          >
            {t('update.later')}
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="h-12 flex-[2] rounded-xl bg-orange-600 text-sm font-bold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-500 active:scale-[0.98] disabled:cursor-wait motion-safe:animate-updateGlow"
          >
            {isUpdating ? t('update.updating') : t('update.action')}
          </button>
        </div>
      </div>
    </div>
  )
}
