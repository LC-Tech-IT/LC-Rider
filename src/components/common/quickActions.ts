import type { QuickActionIconId } from './Icons'

export interface QuickAction {
  id: 'gasoline' | 'hazard' | 'regroup' | 'police'
  /** Identificador del icono SVG (ver QuickActionIcon en Icons.tsx). */
  icon: QuickActionIconId
  label: string
  message: string
  spokenMessage: string
  colorClass: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'gasoline',
    icon: 'fuel',
    label: 'Parada Gasolina',
    message: 'Notificación enviada: Solicitaste parada de gasolina al convoy',
    spokenMessage: 'Atención convoy: parada de gasolina solicitada.',
    colorClass: 'bg-sky-700 hover:bg-sky-800',
  },
  {
    id: 'hazard',
    icon: 'hazard',
    label: 'Peligro en Vía',
    message: 'Alerta emitida: Peligro en vía reportado al grupo',
    spokenMessage: 'Atención convoy: peligro reportado en la vía.',
    colorClass: 'bg-amber-700 hover:bg-amber-800',
  },
  {
    id: 'regroup',
    icon: 'regroup',
    label: 'Reagrupación',
    message: 'Solicitud enviada: Reagrupación de convoy solicitada',
    spokenMessage: 'Atención convoy: reagrupación solicitada, reduzcan la velocidad.',
    colorClass: 'bg-emerald-700 hover:bg-emerald-800',
  },
  {
    id: 'police',
    icon: 'police',
    label: 'Control Policial / Retén',
    message: 'Alerta emitida: Presencia de control policial / retén en la vía',
    spokenMessage: 'Atención convoy: control policial en la vía.',
    colorClass: 'bg-indigo-700 hover:bg-indigo-800',
  },
]
