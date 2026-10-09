import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { useApp } from '../../context/AppContext'
import Speedometer from './Speedometer'
import { QUICK_ACTIONS } from '../common/quickActions'

function formatElapsed(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

const radarIcon = L.divIcon({
  className: 'convoy-marker',
  html: `<div style="width:14px;height:14px;border-radius:9999px;background:#F97316;box-shadow:0 0 8px 3px rgba(249,115,22,0.7);border:2px solid #ffffff"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
})

export default function CockpitView() {
  const {
    activeVehicle,
    navigation,
    currentSpeedKmh,
    elapsedSeconds,
    distanceTraveledKm,
    setRoutePlannerOpen,
    setView,
    showToast,
    isOnline,
    t,
  } = useApp()

  const route = navigation.route
  const userMember = route ? { position: route.coordinates[0] } : null

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bike-bg px-4 pb-6 pt-4">
      <h1 className="mb-3 font-display text-lg font-bold text-bike-ink">{t('cockpit.title')}</h1>

      {!isOnline && (
        <div className="mb-3 flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-700">
          {t('connectivity.offlineBanner')}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-2xl border border-bike-border bg-white p-3 shadow-card">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400">{t('cockpit.activeVehicle')}</p>
          <p className="font-display text-base font-bold text-bike-ink">
            {activeVehicle.brand} {activeVehicle.model}
          </p>
        </div>
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 font-display text-sm font-bold tracking-widest text-bike-blue">
          {activeVehicle.plate}
        </div>
      </div>

      <div className="relative mb-4 overflow-hidden rounded-2xl border border-bike-border shadow-card">
        <div className="h-32 w-full">
          {route ? (
            <MapContainer
              center={[route.coordinates[0].lat, route.coordinates[0].lng]}
              zoom={12}
              zoomControl={false}
              dragging={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              attributionControl={false}
              className="relative z-0 h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
              <Polyline
                positions={route.coordinates.map((c) => [c.lat, c.lng])}
                pathOptions={{ color: '#8B5CF6', weight: 4, opacity: 0.95 }}
              />
              {userMember && <Marker position={[userMember.position.lat, userMember.position.lng]} icon={radarIcon} />}
            </MapContainer>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-100">
              <span className="text-2xl">📡</span>
              <button
                onClick={() => setRoutePlannerOpen(true)}
                className="min-h-[48px] rounded-full bg-bike-orange px-4 py-1.5 text-xs font-bold text-white shadow-glow-orange active:scale-95"
              >
                {t('cockpit.planRoute')}
              </button>
            </div>
          )}
        </div>
        <div className="absolute left-2 top-2 z-10 rounded bg-white/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-bike-blue shadow-card">
          {t('cockpit.radar')}
        </div>
      </div>

      <div className="rounded-2xl border border-bike-border bg-white p-4 shadow-card">
        <Speedometer speed={currentSpeedKmh} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard icon="⏱️" label={t('cockpit.time')} value={formatElapsed(elapsedSeconds)} accent="text-bike-blue" />
        <MetricCard icon="📏" label={t('cockpit.distance')} value={`${distanceTraveledKm.toFixed(1)} km`} accent="text-bike-orange" />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">Acciones Rápidas en Ruta</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => showToast(action.message)}
              className={`flex min-h-[64px] items-center justify-center gap-2 rounded-2xl p-3 font-bold text-white shadow-card transition active:scale-95 ${action.colorClass}`}
            >
              <span className="text-xl">{action.icon}</span>
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {route && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-bike-border bg-white px-4 py-3 text-xs text-slate-600 shadow-card">
          <span>
            {route.originLabel} → {route.destinationLabel}
          </span>
          <button onClick={() => setView('map')} className="flex min-h-[48px] items-center font-bold text-bike-blue">
            {t('cockpit.viewMap')}
          </button>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-bike-border bg-white p-4 text-center shadow-card">
      <div className="mb-1 text-lg">{icon}</div>
      <div className={`font-display text-xl font-bold tabular-nums ${accent}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  )
}
