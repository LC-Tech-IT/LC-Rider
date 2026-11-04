import type { ComponentType, SVGProps } from 'react'
import { useApp } from '../../context/AppContext'
import type { RouteStep } from '../../types'
import {
  IconNavArrive,
  IconNavMerge,
  IconNavRoundabout,
  IconNavStraight,
  IconNavTurnLeft,
  IconNavTurnRight,
  IconNavUturn,
} from '../common/Icons'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/** Icono SVG de la maniobra a partir del tipo y el sentido que entrega OSRM. Las rutas guardadas antes de
 *  conservar `modifier` caen en la flecha recta. */
function maneuverIcon(step: RouteStep): IconComponent {
  const type = step.maneuver ?? ''
  const modifier = step.modifier ?? ''
  if (type === 'arrive') return IconNavArrive
  if (type === 'depart') return IconNavStraight
  if (type === 'roundabout' || type === 'rotary' || type === 'roundabout turn') return IconNavRoundabout
  if (type === 'merge' || type === 'fork') return IconNavMerge
  if (modifier === 'uturn') return IconNavUturn
  if (modifier.includes('left')) return IconNavTurnLeft
  if (modifier.includes('right')) return IconNavTurnRight
  return IconNavStraight
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
  const ManeuverIcon = maneuverIcon(step)

  return (
    <div className="absolute left-2 right-2 top-2 z-20 flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-3 py-3 shadow-xl">
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
        <ManeuverIcon className="h-7 w-7" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-slate-950">{step.instruction}</p>
        <p className="text-xs font-semibold text-slate-700">
          {t('map.inDistance', {
            distance:
              remainingInStepKm < 1 ? `${Math.round(remainingInStepKm * 1000)} m` : `${remainingInStepKm.toFixed(1)} km`,
          })}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="font-display text-lg font-bold tabular-nums text-slate-950">{Math.max(0, Math.round(route.durationMinutes - (distanceTraveledKm / route.distanceKm) * route.durationMinutes))}</p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{t('map.minEta')}</p>
      </div>
    </div>
  )
}
