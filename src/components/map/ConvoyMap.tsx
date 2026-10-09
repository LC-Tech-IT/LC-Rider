import { useEffect, useRef, useState } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useApp } from '../../context/AppContext'
import TurnByTurnBanner from '../navigation/TurnByTurnBanner'
import { isPhotoAvatar } from '../common/Avatar'
import { QUICK_ACTIONS, type QuickAction } from '../common/quickActions'
import { announceIntercom } from '../../services/voiceGuidanceService'
import type { ConvoyMember, ConvoyRole, ConvoyStatus } from '../../types'

const STATUS_COLOR: Record<ConvoyStatus, string> = {
  'en-ruta': '#16A34A',
  rezagado: '#F59E0B',
  sos: '#DC2626',
  offline: '#94A3B8',
}

const STATUS_LABEL_KEY: Record<ConvoyStatus, string> = {
  'en-ruta': 'map.statusOnRoute',
  rezagado: 'map.statusLaggard',
  sos: 'map.statusSos',
  offline: 'map.statusOffline',
}

const ROLE_LABEL_KEY: Record<ConvoyRole, string> = {
  lider: 'convoy.leader',
  guardian: 'convoy.guardian',
  piloto: 'convoy.rider',
}

/** Neutraliza el avatar/nombre de un piloto antes de insertarlo en el HTML crudo de un marcador de Leaflet.
 *  `avatarEmoji` y `name` llegan de Supabase Realtime (broadcast de otros dispositivos del convoy) y no son
 *  de confianza: sin este escape, un participante malicioso podría inyectar HTML/JS que se ejecutaría en la
 *  app de todos los demás pilotos de la sala (Leaflet inserta este string vía innerHTML, sin el auto-escape
 *  que React aplica al JSX normal). */
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function memberIcon(member: ConvoyMember) {
  const color = STATUS_COLOR[member.status]
  const pulse = member.status === 'sos' ? 'animation:pulseRing 1.4s infinite;' : ''
  const avatarHtml = isPhotoAvatar(member.avatarEmoji)
    ? `<img src="${escapeHtml(member.avatarEmoji)}" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" />`
    : escapeHtml(member.avatarEmoji)
  return L.divIcon({
    className: 'convoy-marker',
    html: `
      <div style="position:relative;width:38px;height:38px;${pulse}">
        <div style="width:38px;height:38px;border-radius:9999px;background:#FFFFFF;border:4px solid ${color};display:flex;align-items:center;justify-content:center;font-size:16px;overflow:hidden;box-shadow:0 2px 8px rgba(15,23,42,0.35);">
          ${avatarHtml}
        </div>
        <div style="position:absolute;bottom:-2px;right:-2px;width:12px;height:12px;border-radius:9999px;background:${color};border:2px solid #ffffff;"></div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  })
}

function currentUserIcon(member: ConvoyMember) {
  const avatarHtml = isPhotoAvatar(member.avatarEmoji)
    ? `<img src="${escapeHtml(member.avatarEmoji)}" style="width:100%;height:100%;object-fit:cover;border-radius:9999px;" />`
    : escapeHtml(member.avatarEmoji)
  return L.divIcon({
    className: 'convoy-marker',
    html: `
      <div style="position:relative;width:46px;height:46px;">
        <div class="radar-pulse" style="position:absolute;inset:0;border-radius:9999px;"></div>
        <div style="position:absolute;inset:5px;border-radius:9999px;background:#FFFFFF;border:3px solid #0284C7;display:flex;align-items:center;justify-content:center;font-size:18px;overflow:hidden;box-shadow:0 2px 10px rgba(2,132,199,0.45);">
          ${avatarHtml}
        </div>
      </div>
    `,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  })
}

const startIcon = L.divIcon({
  className: 'convoy-marker',
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#16A34A;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(15,23,42,0.4);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

const endIcon = L.divIcon({
  className: 'convoy-marker',
  html: `<div style="font-size:20px;filter:drop-shadow(0 2px 3px rgba(15,23,42,0.5));">🏁</div>`,
  iconSize: [24, 24],
  iconAnchor: [8, 20],
})

function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m} min`
  return `${h}h ${m}m`
}

function FitRoute({ coordinates }: { coordinates: { lat: number; lng: number }[] }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates.length > 1) {
      const bounds = L.latLngBounds(coordinates.map((c) => [c.lat, c.lng]))
      map.fitBounds(bounds, { padding: [40, 40] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates])
  return null
}

export default function ConvoyMap() {
  const {
    navigation,
    convoyMembers,
    rideActive,
    simulationRunning,
    startRide,
    pauseRide,
    finalizeRide,
    setRoutePlannerOpen,
    showToast,
    addConvoyAlert,
    usingRealGps,
    isOnline,
    user,
    lang,
    t,
  } = useApp()
  const [panelExpanded, setPanelExpanded] = useState(false)
  const [reportMenuOpen, setReportMenuOpen] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const route = navigation.route

  if (!route) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-bike-bg px-6 text-center">
        <span className="text-4xl">🗺️</span>
        <p className="text-sm text-slate-500">{t('map.emptyTitle')}</p>
        <button
          onClick={() => setRoutePlannerOpen(true)}
          className="rounded-full bg-bike-orange px-5 py-2.5 text-sm font-bold text-white shadow-glow-orange active:scale-95"
        >
          {t('map.planRoute')}
        </button>
      </div>
    )
  }

  function centerOnMe() {
    const user = convoyMembers.find((m) => m.isCurrentUser)
    if (user && mapRef.current) {
      mapRef.current.flyTo([user.position.lat, user.position.lng], 15, { duration: 0.8 })
    }
  }

  function viewFullConvoy() {
    if (!mapRef.current || !route) return
    const points: [number, number][] = [
      ...route.coordinates.map((c): [number, number] => [c.lat, c.lng]),
      ...convoyMembers.map((m): [number, number] => [m.position.lat, m.position.lng]),
    ]
    mapRef.current.fitBounds(L.latLngBounds(points), { padding: [50, 50] })
  }

  function handleFinalize() {
    finalizeRide()
    setPanelExpanded(false)
    setReportMenuOpen(false)
  }

  function handleReport(action: QuickAction) {
    showToast(action.message)
    // Las alertas por voz del intercomunicador son exclusivas de los planes Pro y Club.
    if (user?.tier !== 'free') announceIntercom(action.spokenMessage, lang)
    addConvoyAlert(action.id, action.message)
    setReportMenuOpen(false)
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        ref={mapRef}
        center={[route.coordinates[0].lat, route.coordinates[0].lng]}
        zoom={13}
        zoomControl={false}
        attributionControl={true}
        className="relative z-0 h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <FitRoute coordinates={route.coordinates} />
        <Polyline
          positions={route.coordinates.map((c) => [c.lat, c.lng])}
          pathOptions={{ color: '#4338CA', weight: 8, opacity: 0.8, lineCap: 'round' }}
        />
        <Polyline
          positions={route.coordinates.map((c) => [c.lat, c.lng])}
          pathOptions={{ color: '#8B5CF6', weight: 5, opacity: 0.95, lineCap: 'round' }}
        />
        <Marker position={[route.coordinates[0].lat, route.coordinates[0].lng]} icon={startIcon} />
        <Marker
          position={[route.coordinates[route.coordinates.length - 1].lat, route.coordinates[route.coordinates.length - 1].lng]}
          icon={endIcon}
        />
        {rideActive &&
          convoyMembers.map((member) => (
            <Marker
              key={member.id}
              position={[member.position.lat, member.position.lng]}
              icon={member.isCurrentUser ? currentUserIcon(member) : memberIcon(member)}
            >
              <Tooltip permanent direction="top" offset={[0, member.isCurrentUser ? -24 : -20]} className="convoy-tooltip">
                {member.isCurrentUser ? t('map.you') : member.name.split(' ')[0]} • {Math.round(member.speedKmh)} km/h
              </Tooltip>
            </Marker>
          ))}
      </MapContainer>

      {!isOnline && (
        <div
          className="absolute inset-x-0 top-0 z-20 flex min-h-[48px] items-center justify-center gap-2 bg-amber-500 px-3 py-2 text-center text-xs font-bold text-white shadow-md"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
        >
          {t('connectivity.offlineBanner')}
        </div>
      )}

      {rideActive && <TurnByTurnBanner />}

      {rideActive && (
        <div className="absolute right-3 top-24 z-20 flex flex-col gap-2">
          <button
            onClick={centerOnMe}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-bike-border bg-white text-lg shadow-xl active:scale-95"
            aria-label={t('map.centerOnMeAria')}
            title={t('map.centerOnMe')}
          >
            🎯
          </button>
          <button
            onClick={viewFullConvoy}
            className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full border border-bike-border bg-white text-lg shadow-xl active:scale-95"
            aria-label={t('map.viewConvoyAria')}
            title={t('map.viewConvoy')}
          >
            🗺️
          </button>
        </div>
      )}

      {rideActive && !panelExpanded && (
        <button
          onClick={() => setReportMenuOpen((o) => !o)}
          className="absolute right-3 bottom-[9.5rem] z-20 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-bike-orange to-amber-500 text-2xl text-white shadow-2xl transition active:scale-95"
          aria-label="Reportar en Vía"
          title="Reportar en Vía"
        >
          ⚠️
        </button>
      )}

      {reportMenuOpen && (
        <div
          className="absolute inset-0 z-30 flex items-end justify-center bg-slate-900/30"
          onClick={() => setReportMenuOpen(false)}
        >
          <div
            className="mb-[9.5rem] w-[calc(100%-1.5rem)] max-w-sm rounded-3xl border border-bike-border bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-slate-400">Reportar en la Vía</p>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleReport(action)}
                  className={`flex min-h-[70px] flex-col items-center justify-center gap-1.5 rounded-2xl p-3 font-bold text-white shadow-card transition active:scale-95 ${action.colorClass}`}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-center text-xs leading-tight">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 rounded-t-3xl border-t border-bike-border bg-white shadow-2xl transition-all ${
          rideActive && panelExpanded ? 'max-h-[65vh]' : 'max-h-64'
        } overflow-hidden`}
      >
        <button onClick={() => setPanelExpanded((e) => !e)} className="flex w-full flex-col items-center gap-2 pb-1 pt-2">
          <span className="h-1 w-10 rounded-full bg-slate-200" />
          <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 text-xs font-semibold text-slate-600">
            <span>📍 {route.distanceKm.toFixed(1)} km</span>
            <span>⏱️ {formatDuration(route.durationMinutes)}</span>
            <span>👥 {convoyMembers.length} {t('map.riders')}</span>
            {rideActive && usingRealGps && (
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t('map.gpsLive')}
              </span>
            )}
          </div>
        </button>

        <div className="px-4 pb-4 pt-1">
          {!rideActive ? (
            <button
              onClick={startRide}
              className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
            >
              {t('map.startRide')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={pauseRide}
                className="flex-1 rounded-xl bg-bike-blue py-3 text-sm font-bold text-white shadow-glow-blue transition active:scale-[0.98]"
              >
                {simulationRunning ? t('map.pause') : t('map.resume')}
              </button>
              <button
                onClick={handleFinalize}
                className="flex-1 rounded-xl border-2 border-status-danger py-3 text-sm font-bold text-status-danger transition active:scale-[0.98]"
              >
                {t('map.finishRide')}
              </button>
            </div>
          )}
        </div>

        {rideActive && panelExpanded && (
          <div className="max-h-[42vh] space-y-2 overflow-y-auto px-4 pb-4">
            {convoyMembers.map((member) => {
              const leader = convoyMembers.find((m) => m.role === 'lider') ?? convoyMembers[0]
              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl border border-bike-border bg-slate-50 px-3 py-2.5"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg"
                    style={{ border: `2px solid ${STATUS_COLOR[member.status]}` }}
                  >
                    {member.avatarEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-bike-ink">
                      {member.name} {member.isCurrentUser && <span className="text-bike-blue">{t('map.you')}</span>}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t(ROLE_LABEL_KEY[member.role])} · {member.vehiclePlate}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-sm font-bold text-bike-ink tabular-nums">
                      {Math.round(member.speedKmh)} km/h
                    </p>
                    <p className="text-[10px] font-semibold" style={{ color: STATUS_COLOR[member.status] }}>
                      {t(STATUS_LABEL_KEY[member.status])}
                    </p>
                  </div>
                  {!member.isCurrentUser && leader && (
                    <span className="text-[10px] text-slate-400">{member.distanceToLeaderKm.toFixed(2)} km</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
