import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  PRESET_ROUTES,
  geocodeRemote,
  getBrowserLocation,
  isDuplicateResult,
  searchLocalPois,
  type GeocodeResult,
} from '../../services/routingService'
import { loadStorage, saveStorage } from '../../utils/storage'
import type { LatLng } from '../../types'

const DEBOUNCE_MS = 350
const RECENTS_KEY = 'recentDestinations'
const MAX_RECENTS = 5

const TYPE_ICON: Record<NonNullable<GeocodeResult['type']>, string> = {
  city: '🏙️',
  poi: '🏢',
  hotel: '🏨',
  gas: '⛽',
  landmark: '🏔️',
  address: '📍',
}

interface Point {
  label: string
  position: LatLng | null
}

function saveRecent(result: GeocodeResult) {
  const recents = loadStorage<GeocodeResult[]>(RECENTS_KEY, [])
  const deduped = recents.filter((r) => r.label !== result.label)
  saveStorage(RECENTS_KEY, [result, ...deduped].slice(0, MAX_RECENTS))
}

export default function RoutePlannerModal() {
  const { routePlannerOpen, setRoutePlannerOpen, planRoute, navigation, t } = useApp()
  const [origin, setOrigin] = useState<Point>({ label: '', position: null })
  const [destination, setDestination] = useState<Point>({ label: '', position: null })
  const [originResults, setOriginResults] = useState<GeocodeResult[]>([])
  const [destResults, setDestResults] = useState<GeocodeResult[]>([])
  const [originLoading, setOriginLoading] = useState(false)
  const [destLoading, setDestLoading] = useState(false)
  const [originFocused, setOriginFocused] = useState(false)
  const [destFocused, setDestFocused] = useState(false)
  const [originSearched, setOriginSearched] = useState(false)
  const [destSearched, setDestSearched] = useState(false)
  const [locating, setLocating] = useState(false)
  const [recents, setRecents] = useState<GeocodeResult[]>(() => loadStorage<GeocodeResult[]>(RECENTS_KEY, []))

  const originDebounceRef = useRef<number | null>(null)
  const destDebounceRef = useRef<number | null>(null)
  const originAbortRef = useRef<AbortController | null>(null)
  const destAbortRef = useRef<AbortController | null>(null)

  useEffect(
    () => () => {
      if (originDebounceRef.current) window.clearTimeout(originDebounceRef.current)
      if (destDebounceRef.current) window.clearTimeout(destDebounceRef.current)
      originAbortRef.current?.abort()
      destAbortRef.current?.abort()
    },
    [],
  )

  if (!routePlannerOpen) return null

  /** El catálogo local responde de inmediato (sin red); la búsqueda remota llega después del debounce y
   *  solo enriquece la lista ya visible, nunca la bloquea ni la reemplaza mientras carga. */
  function runSearch(
    query: string,
    setResults: (updater: (prev: GeocodeResult[]) => GeocodeResult[]) => void,
    setLoading: (l: boolean) => void,
    setSearched: (s: boolean) => void,
    abortRef: { current: AbortController | null },
  ) {
    abortRef.current?.abort()
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setLoading(false)
      setSearched(false)
      return
    }
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    geocodeRemote(trimmed, controller.signal)
      .then((remoteResults) => {
        // Aunque la petición no se haya cancelado a tiempo, si ya no es la búsqueda vigente (el usuario
        // seleccionó un resultado o inició otra búsqueda) se descarta para no pisar el estado actual.
        if (abortRef.current !== controller) return
        setResults((prev) => [...prev, ...remoteResults.filter((r) => !isDuplicateResult(r, prev))])
        setSearched(true)
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setSearched(true)
      })
      .finally(() => {
        if (abortRef.current === controller) setLoading(false)
      })
  }

  function handleSearch(query: string, target: 'origin' | 'destination') {
    const trimmed = query.trim()
    const localMatches = trimmed.length >= 2 ? searchLocalPois(trimmed) : []

    if (target === 'origin') {
      setOrigin({ label: query, position: null })
      setOriginResults(localMatches)
      setOriginSearched(localMatches.length > 0)
      // Escribir implica que el campo está en uso: reabre el desplegable aunque una selección previa
      // lo haya cerrado sin que el input llegara a perder el foco realmente (se previene el blur al elegir).
      setOriginFocused(true)
      if (originDebounceRef.current) window.clearTimeout(originDebounceRef.current)
      originDebounceRef.current = window.setTimeout(
        () => runSearch(query, setOriginResults, setOriginLoading, setOriginSearched, originAbortRef),
        DEBOUNCE_MS,
      )
    } else {
      setDestination({ label: query, position: null })
      setDestResults(localMatches)
      setDestSearched(localMatches.length > 0)
      setDestFocused(true)
      if (destDebounceRef.current) window.clearTimeout(destDebounceRef.current)
      destDebounceRef.current = window.setTimeout(
        () => runSearch(query, setDestResults, setDestLoading, setDestSearched, destAbortRef),
        DEBOUNCE_MS,
      )
    }
  }

  function selectResult(result: GeocodeResult, target: 'origin' | 'destination') {
    if (target === 'origin') {
      // Cancela cualquier búsqueda por red aún en curso: si no, su respuesta podría llegar tarde y
      // sobrescribir la lista justo cuando ya se seleccionó un resultado (o se muestran los recientes).
      originAbortRef.current?.abort()
      originAbortRef.current = null
      if (originDebounceRef.current) window.clearTimeout(originDebounceRef.current)
      setOrigin({ label: result.label, position: result.position })
      setOriginResults([])
      setOriginLoading(false)
      setOriginFocused(false)
    } else {
      destAbortRef.current?.abort()
      destAbortRef.current = null
      if (destDebounceRef.current) window.clearTimeout(destDebounceRef.current)
      setDestination({ label: result.label, position: result.position })
      setDestResults([])
      setDestLoading(false)
      setDestFocused(false)
    }
    saveRecent(result)
    setRecents(loadStorage<GeocodeResult[]>(RECENTS_KEY, []))
  }

  function clearField(target: 'origin' | 'destination') {
    if (target === 'origin') {
      if (originDebounceRef.current) window.clearTimeout(originDebounceRef.current)
      setOrigin({ label: '', position: null })
      setOriginResults([])
      setOriginSearched(false)
      setOriginLoading(false)
      originAbortRef.current?.abort()
      originAbortRef.current = null
    } else {
      if (destDebounceRef.current) window.clearTimeout(destDebounceRef.current)
      setDestination({ label: '', position: null })
      setDestResults([])
      setDestSearched(false)
      setDestLoading(false)
      destAbortRef.current?.abort()
      destAbortRef.current = null
    }
  }

  async function useMyLocation() {
    setLocating(true)
    try {
      const pos = await getBrowserLocation()
      setOrigin({ label: t('routePlanner.myLocationLabel'), position: pos })
      setOriginResults([])
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo obtener la ubicación.')
    } finally {
      setLocating(false)
    }
  }

  function selectPreset(presetId: string) {
    const preset = PRESET_ROUTES.find((p) => p.id === presetId)
    if (!preset) return
    setOrigin({ label: preset.originLabel, position: preset.origin })
    setDestination({ label: preset.destinationLabel, position: preset.destination })
  }

  const canTrace = origin.position && destination.position && navigation.status !== 'routing'

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-bike-border bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-bike-ink">{t('routePlanner.title')}</h2>
          <button onClick={() => setRoutePlannerOpen(false)} className="text-2xl leading-none text-slate-400">
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('routePlanner.origin')}</label>
            <div className="relative">
              <input
                value={origin.label}
                onChange={(e) => handleSearch(e.target.value, 'origin')}
                onFocus={() => setOriginFocused(true)}
                onBlur={() => window.setTimeout(() => setOriginFocused(false), 150)}
                placeholder={t('routePlanner.originPlaceholder')}
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 pr-9 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
              {origin.label && (
                <button
                  onClick={() => clearField('origin')}
                  aria-label={t('routePlanner.clear')}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 hover:bg-slate-300"
                >
                  ✕
                </button>
              )}
              {originFocused && (
                <SearchDropdown
                  loading={originLoading}
                  results={originResults}
                  recents={!origin.label ? recents : []}
                  searched={originSearched}
                  onSelect={(r) => selectResult(r, 'origin')}
                  t={t}
                />
              )}
            </div>
            <button
              onClick={useMyLocation}
              disabled={locating}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-bike-blue disabled:opacity-50"
            >
              📍 {locating ? t('routePlanner.locating') : t('routePlanner.useMyLocation')}
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('routePlanner.destination')}</label>
            <div className="relative">
              <input
                value={destination.label}
                onChange={(e) => handleSearch(e.target.value, 'destination')}
                onFocus={() => setDestFocused(true)}
                onBlur={() => window.setTimeout(() => setDestFocused(false), 150)}
                placeholder={t('routePlanner.destinationPlaceholder')}
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 pr-9 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
              {destination.label && (
                <button
                  onClick={() => clearField('destination')}
                  aria-label={t('routePlanner.clear')}
                  className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 hover:bg-slate-300"
                >
                  ✕
                </button>
              )}
              {destFocused && (
                <SearchDropdown
                  loading={destLoading}
                  results={destResults}
                  recents={!destination.label ? recents : []}
                  searched={destSearched}
                  onSelect={(r) => selectResult(r, 'destination')}
                  t={t}
                />
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('routePlanner.popularRoutes')}</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_ROUTES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => selectPreset(preset.id)}
                  className="rounded-full border border-bike-border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-bike-blue/50 hover:text-bike-blue"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {navigation.status === 'error' && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{navigation.errorMessage}</p>
          )}

          <button
            disabled={!canTrace}
            onClick={() =>
              origin.position &&
              destination.position &&
              planRoute(origin.position, destination.position, origin.label, destination.label)
            }
            className="mt-2 w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]"
          >
            {navigation.status === 'routing' ? t('routePlanner.calculating') : t('routePlanner.traceRoute')}
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchDropdown({
  loading,
  results,
  recents,
  searched,
  onSelect,
  t,
}: {
  loading: boolean
  results: GeocodeResult[]
  recents: GeocodeResult[]
  searched: boolean
  onSelect: (r: GeocodeResult) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  // Los resultados ya visibles (locales o de una red anterior) tienen prioridad: nunca se ocultan
  // detrás del indicador de carga mientras la búsqueda por red los enriquece en segundo plano.
  if (results.length > 0) {
    return (
      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-bike-border bg-white shadow-xl">
        {results.map((r, i) => (
          <ResultRow key={i} result={r} onSelect={onSelect} />
        ))}
        {loading && <p className="border-t border-bike-border px-3 py-2 text-[11px] text-slate-400">{t('routePlanner.searching')}</p>}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-bike-border bg-white px-3 py-3 text-xs text-slate-500 shadow-xl">
        {t('routePlanner.searching')}
      </div>
    )
  }

  if (searched) {
    return (
      <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-xl border border-bike-border bg-white px-3 py-3 text-xs text-slate-500 shadow-xl">
        {t('routePlanner.noResults')}
      </div>
    )
  }

  if (recents.length > 0) {
    return (
      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-y-auto rounded-xl border border-bike-border bg-white shadow-xl">
        <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('routePlanner.recentSearches')}</p>
        {recents.map((r, i) => (
          <ResultRow key={i} result={r} onSelect={onSelect} />
        ))}
      </div>
    )
  }

  return null
}

function ResultRow({ result, onSelect }: { result: GeocodeResult; onSelect: (r: GeocodeResult) => void }) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => onSelect(result)}
      className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition hover:bg-slate-50"
    >
      <span className="mt-0.5 text-base leading-none">{TYPE_ICON[result.type ?? 'address']}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-bike-ink">{result.label}</span>
        {result.subtitle && <span className="block truncate text-[11px] text-slate-400">{result.subtitle}</span>}
      </span>
    </button>
  )
}
