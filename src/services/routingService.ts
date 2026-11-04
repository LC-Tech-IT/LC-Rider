import type { LatLng, PresetRoute, RouteInfo, RouteStep } from '../types'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search'
const PHOTON_BASE = 'https://photon.komoot.io/api'

export const PRESET_ROUTES: PresetRoute[] = [
  {
    id: 'cali-buenaventura',
    label: 'Cali → Buenaventura (Km 18)',
    origin: { lat: 3.4516, lng: -76.532 },
    originLabel: 'Cali, Valle del Cauca',
    destination: { lat: 3.8801, lng: -76.9906 },
    destinationLabel: 'Buenaventura, Valle del Cauca',
  },
  {
    id: 'bogota-lacalera',
    label: 'Bogotá → La Calera / Guatavita',
    origin: { lat: 4.711, lng: -74.0721 },
    originLabel: 'Bogotá D.C.',
    destination: { lat: 4.9484, lng: -73.8306 },
    destinationLabel: 'Guatavita, Cundinamarca',
  },
  {
    id: 'medellin-guatape',
    label: 'Medellín → Guatapé',
    origin: { lat: 6.2442, lng: -75.5812 },
    originLabel: 'Medellín, Antioquia',
    destination: { lat: 6.2326, lng: -75.1594 },
    destinationLabel: 'Guatapé, Antioquia',
  },
]

interface OsrmStep {
  distance: number
  duration: number
  maneuver: { type: string; modifier?: string }
  name: string
}

interface OsrmResponse {
  code: string
  routes: Array<{
    distance: number
    duration: number
    geometry: { coordinates: [number, number][] }
    legs: Array<{ steps: OsrmStep[] }>
  }>
}

function maneuverToSpanish(step: OsrmStep): string {
  const { type, modifier } = step.maneuver
  const road = step.name ? ` hacia ${step.name}` : ''
  const modifiers: Record<string, string> = {
    left: 'izquierda',
    right: 'derecha',
    'slight left': 'ligeramente a la izquierda',
    'slight right': 'ligeramente a la derecha',
    'sharp left': 'fuerte a la izquierda',
    'sharp right': 'fuerte a la derecha',
    straight: 'de frente',
    uturn: 'en U',
  }
  switch (type) {
    case 'depart':
      return `Iniciar recorrido${road}`
    case 'arrive':
      return 'Has llegado a tu destino'
    case 'roundabout':
    case 'rotary':
      return `Toma la rotonda${road}`
    case 'turn':
      return `Gira a la ${modifier ? modifiers[modifier] ?? modifier : 'frente'}${road}`
    case 'merge':
      return `Incorpórate${road}`
    case 'fork':
      return `Mantente ${modifier ? modifiers[modifier] ?? modifier : 'de frente'}${road}`
    case 'continue':
      return `Continúa ${modifier ? modifiers[modifier] ?? modifier : 'de frente'}${road}`
    default:
      return `Continúa${road}`
  }
}

function estimateTraffic(durationMinutes: number, distanceKm: number): RouteInfo['trafficEstimate'] {
  const avgSpeed = distanceKm / (durationMinutes / 60 || 1)
  if (avgSpeed > 55) return 'fluido'
  if (avgSpeed > 30) return 'moderado'
  return 'pesado'
}

export async function fetchRoute(origin: LatLng, destination: LatLng, originLabel: string, destinationLabel: string): Promise<RouteInfo> {
  const url = `${OSRM_BASE}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('No fue posible calcular la ruta. Intenta de nuevo.')
  }
  const data: OsrmResponse = await response.json()
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('No se encontró una ruta entre los puntos seleccionados.')
  }

  const best = data.routes[0]
  const coordinates: LatLng[] = best.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
  const steps: RouteStep[] = best.legs.flatMap((leg) =>
    leg.steps.map((s) => ({
      instruction: maneuverToSpanish(s),
      distanceMeters: s.distance,
      durationSeconds: s.duration,
      maneuver: s.maneuver.type,
      modifier: s.maneuver.modifier,
    })),
  )

  const distanceKm = best.distance / 1000
  const durationMinutes = best.duration / 60

  return {
    id: `route-${Date.now()}`,
    originLabel,
    destinationLabel,
    origin,
    destination,
    coordinates,
    distanceKm,
    durationMinutes,
    steps,
    trafficEstimate: estimateTraffic(durationMinutes, distanceKm),
  }
}

export type GeocodeResultType = 'city' | 'poi' | 'hotel' | 'gas' | 'address' | 'landmark'

export interface GeocodeResult {
  label: string
  subtitle?: string
  position: LatLng
  type?: GeocodeResultType
}

/**
 * Catálogo local de ciudades, municipios y puntos de interés moteros de Colombia. Responde instantáneamente
 * (sin red) y sirve de base del motor híbrido de geocodificación. Las coordenadas de los POIs específicos
 * (peajes, altos, el Data Center) son aproximaciones razonables para efectos de esta demo — se recomienda
 * verificarlas/ajustarlas con datos topográficos reales antes de usarlas en producción.
 */
const LOCAL_POIS: GeocodeResult[] = [
  // Ciudades y municipios principales
  { label: 'Bogotá D.C.', subtitle: 'Cundinamarca', position: { lat: 4.711, lng: -74.0721 }, type: 'city' },
  { label: 'Medellín', subtitle: 'Antioquia', position: { lat: 6.2442, lng: -75.5812 }, type: 'city' },
  { label: 'Cali', subtitle: 'Valle del Cauca', position: { lat: 3.4516, lng: -76.532 }, type: 'city' },
  { label: 'Barranquilla', subtitle: 'Atlántico', position: { lat: 10.9639, lng: -74.7964 }, type: 'city' },
  { label: 'Cartagena', subtitle: 'Bolívar', position: { lat: 10.391, lng: -75.4794 }, type: 'city' },
  { label: 'Bucaramanga', subtitle: 'Santander', position: { lat: 7.1193, lng: -73.1227 }, type: 'city' },
  { label: 'Pereira', subtitle: 'Risaralda', position: { lat: 4.8133, lng: -75.6961 }, type: 'city' },
  { label: 'Manizales', subtitle: 'Caldas', position: { lat: 5.0689, lng: -75.5174 }, type: 'city' },
  { label: 'Ibagué', subtitle: 'Tolima', position: { lat: 4.4389, lng: -75.2322 }, type: 'city' },
  { label: 'Cúcuta', subtitle: 'Norte de Santander', position: { lat: 7.8939, lng: -72.5078 }, type: 'city' },
  { label: 'Santa Marta', subtitle: 'Magdalena', position: { lat: 11.2408, lng: -74.199 }, type: 'city' },
  { label: 'Villavicencio', subtitle: 'Meta', position: { lat: 4.142, lng: -73.6266 }, type: 'city' },
  { label: 'Neiva', subtitle: 'Huila', position: { lat: 2.9273, lng: -75.2819 }, type: 'city' },
  { label: 'Armenia', subtitle: 'Quindío', position: { lat: 4.5339, lng: -75.6811 }, type: 'city' },
  { label: 'Popayán', subtitle: 'Cauca', position: { lat: 2.4448, lng: -76.6147 }, type: 'city' },
  { label: 'Pasto', subtitle: 'Nariño', position: { lat: 1.2136, lng: -77.2811 }, type: 'city' },
  { label: 'Tunja', subtitle: 'Boyacá', position: { lat: 5.5353, lng: -73.3678 }, type: 'city' },
  { label: 'Sogamoso', subtitle: 'Boyacá', position: { lat: 5.7147, lng: -72.9335 }, type: 'city' },
  { label: 'Zipaquirá', subtitle: 'Cundinamarca', position: { lat: 5.0246, lng: -74.0021 }, type: 'city' },
  { label: 'Chía', subtitle: 'Cundinamarca', position: { lat: 4.8607, lng: -74.0589 }, type: 'city' },
  { label: 'La Calera', subtitle: 'Cundinamarca', position: { lat: 4.7188, lng: -73.9694 }, type: 'city' },
  { label: 'Guatavita', subtitle: 'Cundinamarca', position: { lat: 4.9484, lng: -73.8306 }, type: 'city' },
  { label: 'Guatapé', subtitle: 'Antioquia', position: { lat: 6.2326, lng: -75.1594 }, type: 'city' },
  { label: 'Buenaventura', subtitle: 'Valle del Cauca', position: { lat: 3.8801, lng: -76.9906 }, type: 'city' },

  // Puntos de interés / empresas
  { label: 'Data Center Triara Claro', subtitle: 'Bogotá, Cundinamarca', position: { lat: 4.652, lng: -74.118 }, type: 'poi' },

  // Peajes y estaciones de servicio en rutas moteras clásicas
  { label: 'Peaje La Caro', subtitle: 'Autopista Norte, vía Bogotá - Tunja', position: { lat: 4.8935, lng: -73.9995 }, type: 'gas' },
  { label: 'Peaje Boquerón', subtitle: 'Vía Bogotá - Villavicencio', position: { lat: 4.15, lng: -73.99 }, type: 'gas' },
  { label: 'Peaje El Sisga', subtitle: 'Vía Bogotá - Guatavita', position: { lat: 4.9698, lng: -73.7975 }, type: 'gas' },
  { label: 'Estación de Servicio Km 18', subtitle: 'Vía Cali - Buenaventura', position: { lat: 3.5473, lng: -76.7188 }, type: 'gas' },

  // Altos y pasos de montaña emblemáticos
  { label: 'Alto de Patios', subtitle: 'Vía Bogotá - La Calera', position: { lat: 4.72, lng: -74.0 }, type: 'landmark' },
  { label: 'Alto de Letras', subtitle: 'Vía Ibagué - Manizales', position: { lat: 4.87, lng: -75.38 }, type: 'landmark' },
  { label: 'Alto de Minas', subtitle: 'Vía Medellín - Sonsón', position: { lat: 5.65, lng: -75.2 }, type: 'landmark' },

  // Sitios turísticos y hoteles moteros
  { label: 'El Peñón de Guatapé', subtitle: 'Guatapé, Antioquia', position: { lat: 6.2244, lng: -75.1642 }, type: 'landmark' },
  { label: 'Laguna de Guatavita', subtitle: 'Guatavita, Cundinamarca', position: { lat: 5.0006, lng: -73.7817 }, type: 'landmark' },
  { label: 'Hotel Portón de Guatapé', subtitle: 'Guatapé, Antioquia', position: { lat: 6.233, lng: -75.159 }, type: 'hotel' },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/** Búsqueda local instantánea (sin red) en el catálogo de Colombia. Se usa para dar feedback inmediato
 *  mientras la búsqueda por red (más lenta y sujeta a rate limits) llega en segundo plano. */
export function searchLocalPois(query: string): GeocodeResult[] {
  const q = normalize(query)
  if (!q) return []
  const qNoSpace = q.replace(/\s+/g, '')
  const tokens = q.split(/\s+/).filter(Boolean)

  return LOCAL_POIS.filter((poi) => {
    const haystack = normalize(`${poi.label} ${poi.subtitle ?? ''}`)
    // Coincidencia flexible: acepta tanto "data center triara" como "datacenter triara" (sin espacios exactos)
    // y también permite que las palabras aparezcan en cualquier orden ("triara data center").
    if (haystack.replace(/\s+/g, '').includes(qNoSpace)) return true
    return tokens.every((tok) => haystack.includes(tok))
  })
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === 'AbortError'
}

export function isDuplicateResult(candidate: GeocodeResult, existing: GeocodeResult[]): boolean {
  return existing.some((r) => {
    const sameLabel = normalize(r.label) === normalize(candidate.label)
    const distSq = (r.position.lat - candidate.position.lat) ** 2 + (r.position.lng - candidate.position.lng) ** 2
    return sameLabel || distSq < 0.0001
  })
}

interface NominatimResult {
  display_name: string
  lat: string
  lon: string
  type?: string
  class?: string
}

function classifyOsmType(item: { type?: string; class?: string }): GeocodeResultType {
  const type = item.type ?? ''
  const cls = item.class ?? ''
  if (['city', 'town', 'village', 'hamlet', 'municipality', 'administrative'].includes(type)) return 'city'
  if (type === 'hotel' || cls === 'tourism') return 'hotel'
  if (['fuel', 'toll_booth'].includes(type) || cls === 'amenity') return 'gas'
  if (cls === 'shop' || cls === 'office' || cls === 'building') return 'poi'
  return 'address'
}

async function geocodeWithNominatim(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = `${NOMINATIM_BASE}?q=${encodeURIComponent(query)}&format=jsonv2&limit=6&countrycodes=co&addressdetails=0`
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'Accept-Language': 'es' },
    signal,
  })
  if (!response.ok) return []
  const data: NominatimResult[] = await response.json()
  return data.map((d) => {
    const [main, ...rest] = d.display_name.split(',')
    return {
      label: main.trim(),
      subtitle: rest.join(',').trim() || undefined,
      position: { lat: parseFloat(d.lat), lng: parseFloat(d.lon) },
      type: classifyOsmType(d),
    }
  })
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] }
  properties: {
    name?: string
    city?: string
    state?: string
    country?: string
    osm_value?: string
  }
}

async function geocodeWithPhoton(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const url = `${PHOTON_BASE}/?q=${encodeURIComponent(query)}&limit=6&lang=es&lat=4.6&lon=-74.1`
  const response = await fetch(url, { signal })
  if (!response.ok) return []
  const data: { features: PhotonFeature[] } = await response.json()
  return data.features
    .filter((f) => f.properties.name)
    .map((f) => {
      const subtitleParts = [f.properties.city, f.properties.state, f.properties.country].filter(Boolean)
      const value = f.properties.osm_value ?? ''
      let type: GeocodeResultType = 'address'
      if (['city', 'town', 'village'].includes(value)) type = 'city'
      else if (value === 'hotel') type = 'hotel'
      else if (['fuel', 'toll_booth'].includes(value)) type = 'gas'
      return {
        label: f.properties.name as string,
        subtitle: subtitleParts.join(', ') || undefined,
        position: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
        type,
      }
    })
}

/**
 * Búsqueda por red únicamente: Nominatim (OpenStreetMap) primero, con Photon como respaldo si Nominatim
 * no responde o no encuentra nada (cobertura global). Se mantiene separada del catálogo local para que la
 * UI pueda mostrar los resultados locales instantáneamente sin esperar a la red, y luego enriquecerlos
 * en segundo plano apenas lleguen estos. Lanza el error de cancelación (AbortError) tal cual para que el
 * llamador lo distinga de "sin resultados".
 */
export async function geocodeRemote(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  let remoteMatches: GeocodeResult[] = []
  try {
    remoteMatches = await geocodeWithNominatim(trimmed, signal)
  } catch (err) {
    if (isAbortError(err)) throw err
    remoteMatches = []
  }

  if (remoteMatches.length === 0) {
    try {
      remoteMatches = await geocodeWithPhoton(trimmed, signal)
    } catch (err) {
      if (isAbortError(err)) throw err
      remoteMatches = []
    }
  }

  return remoteMatches
}

/**
 * Motor híbrido de geocodificación estilo Waze: combina el catálogo local (instantáneo) con la búsqueda
 * por red, deduplicando resultados repetidos. Úsalo cuando no importe esperar a la red; para una UI que
 * necesite feedback instantáneo, combina `searchLocalPois` (síncrono) con `geocodeRemote` por separado.
 */
export async function geocodeAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const localMatches = searchLocalPois(trimmed)
  const remoteMatches = await geocodeRemote(trimmed, signal)
  const merged = [...localMatches, ...remoteMatches.filter((r) => !isDuplicateResult(r, localMatches))]
  return merged.slice(0, 8)
}

export function getBrowserLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible en este dispositivo.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('No se pudo obtener tu ubicación GPS.')),
      { enableHighAccuracy: true, timeout: 8000 },
    )
  })
}

export function pointAtProgress(coordinates: LatLng[], progress: number): LatLng {
  if (coordinates.length === 0) return { lat: 0, lng: 0 }
  if (coordinates.length === 1) return coordinates[0]
  const clamped = Math.min(Math.max(progress, 0), 1)
  const targetIndex = clamped * (coordinates.length - 1)
  const i = Math.floor(targetIndex)
  const t = targetIndex - i
  const a = coordinates[i]
  const b = coordinates[Math.min(i + 1, coordinates.length - 1)]
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  }
}
