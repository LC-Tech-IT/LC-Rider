import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import { useApp } from '../../context/AppContext'
import Speedometer from './Speedometer'
import ColombianPlate from '../common/ColombianPlate'
import { QUICK_ACTIONS } from '../common/quickActions'
import { IconClock, IconRoute, IconSignal, QuickActionIcon } from '../common/Icons'
import type { ComponentType, SVGProps } from 'react'

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

  // Modo Instrumentación Diurna: fondos claros y tinta slate-900 (contraste ~17:1 sobre blanco) para anular el
  // efecto espejo del vidrio a pleno sol; biseles de 2px y hitboxes de 52px+ para operar con guantes.
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-100 px-4 pb-6 pt-4">
      <h1 className="mb-3 text-lg font-extrabold tracking-tight text-slate-900">{t('cockpit.title')}</h1>

      {!isOnline && (
        <div className="mb-3 flex min-h-[48px] items-center justify-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-3 py-2 text-center text-xs font-bold text-amber-900">
          {t('connectivity.offlineBanner')}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between rounded-2xl border-2 border-slate-200/80 bg-white p-3 shadow-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t('cockpit.activeVehicle')}</p>
          <p className="text-base font-extrabold text-slate-900">
            {activeVehicle.brand} {activeVehicle.model}
          </p>
        </div>
        <ColombianPlate plate={activeVehicle.plate} subtitle={activeVehicle.brand} size="md" />
      </div>

      <div className="relative mb-4 overflow-hidden rounded-2xl border-2 border-slate-200/80 shadow-sm">
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
              <IconSignal className="h-7 w-7 text-slate-500" />
              <button
                onClick={() => setRoutePlannerOpen(true)}
                className="min-h-[52px] rounded-xl bg-orange-600 px-5 py-1.5 text-sm font-bold text-white shadow-sm active:scale-95"
              >
                {t('cockpit.planRoute')}
              </button>
            </div>
          )}
        </div>
        <div className="absolute left-2 top-2 z-10 rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-900">
          {t('cockpit.radar')}
        </div>
      </div>

      <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-sm">
        <Speedometer speed={currentSpeedKmh} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <MetricCard icon={IconClock} label={t('cockpit.time')} value={formatElapsed(elapsedSeconds)} />
        <MetricCard icon={IconRoute} label={t('cockpit.distance')} value={`${distanceTraveledKm.toFixed(1)} km`} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-600">{t('cockpit.quickActions')}</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              onClick={() => showToast(action.message)}
              className={`flex min-h-[64px] items-center gap-2.5 rounded-2xl border-2 border-black/10 px-3.5 py-3 text-left font-bold text-white shadow-sm transition active:scale-95 ${action.colorClass}`}
            >
              <QuickActionIcon id={action.icon} className="h-6 w-6 flex-shrink-0" />
              <span className="text-sm leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {route && (
        <div className="mt-3 flex items-center justify-between rounded-xl border-2 border-slate-200/80 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">
          <span>
            {route.originLabel} → {route.destinationLabel}
          </span>
          <button onClick={() => setView('map')} className="flex min-h-[52px] items-center font-bold text-sky-800">
            {t('cockpit.viewMap')}
          </button>
        </div>
      )}
    </div>
  )
}

function MetricCard({ icon: Icon, label, value }: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-slate-200/80 bg-white p-4 text-center shadow-sm">
      <Icon className="mb-1 h-5 w-5 text-slate-500" />
      <div className="font-display text-xl font-bold tabular-nums text-slate-900">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{label}</div>
    </div>
  )
}
