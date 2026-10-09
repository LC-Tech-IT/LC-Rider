import { useApp } from '../../context/AppContext'

const MANEUVER_ICONS: Record<string, string> = {
  depart: '🚀',
  arrive: '🏁',
  turn: '↪️',
  roundabout: '🔄',
  rotary: '🔄',
  merge: '🔀',
  fork: '🔀',
  continue: '⬆️',
}

export default function TurnByTurnBanner() {
  const { navigation, distanceTraveledKm, t } = useApp()
  const route = navigation.route
  if (!route || route.steps.length === 0) return null

  let cumulativeKm = 0
  let currentStepIndex = 0
  for (let i = 0; i < route.steps.length; i++) {
    cumulativeKm += route.steps[i].distanceMeters / 1000
    if (cumulativeKm >= distanceTraveledKm) {
      currentStepIndex = i
      break
    }
    currentStepIndex = i
  }

  const step = route.steps[currentStepIndex]
  const remainingInStepKm = Math.max(0, cumulativeKm - distanceTraveledKm)
  const icon = MANEUVER_ICONS[step.maneuver ?? ''] ?? '➡️'

  return (
    <div className="absolute left-2 right-2 top-2 z-20 flex items-center gap-3 rounded-2xl border border-bike-border bg-white px-4 py-3 shadow-xl">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-sky-50 text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-bike-ink">{step.instruction}</p>
        <p className="text-xs text-slate-500">
          {t('map.inDistance', {
            distance:
              remainingInStepKm < 1 ? `${Math.round(remainingInStepKm * 1000)} m` : `${remainingInStepKm.toFixed(1)} km`,
          })}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-display text-lg font-bold text-bike-blue">{Math.max(0, Math.round(route.durationMinutes - (distanceTraveledKm / route.distanceKm) * route.durationMinutes))}</p>
        <p className="text-[9px] uppercase tracking-widest text-slate-400">{t('map.minEta')}</p>
      </div>
    </div>
  )
}
