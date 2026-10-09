export interface QuickAction {
  id: 'gasoline' | 'hazard' | 'regroup' | 'police'
  icon: string
  label: string
  message: string
  spokenMessage: string
  colorClass: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'gasoline',
    icon: '⛽',
    label: 'Parada Gasolina',
    message: '⛽ Notificación enviada: Solicitaste parada de gasolina al convoy',
    spokenMessage: 'Atención convoy: parada de gasolina solicitada.',
    colorClass: 'bg-sky-500 hover:bg-sky-600',
  },
  {
    id: 'hazard',
    icon: '⚠️',
    label: 'Peligro en Vía',
    message: '⚠️ Alerta emitida: Peligro en vía reportado al grupo',
    spokenMessage: 'Atención convoy: peligro reportado en la vía.',
    colorClass: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    id: 'regroup',
    icon: '🛑',
    label: 'Reagrupación',
    message: '🛑 Solicitud enviada: Reagrupación de convoy solicitada',
    spokenMessage: 'Atención convoy: reagrupación solicitada, reduzcan la velocidad.',
    colorClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    id: 'police',
    icon: '👮',
    label: 'Control Policial / Retén',
    message: '👮 Alerta emitida: Presencia de control policial / retén en la vía',
    spokenMessage: 'Atención convoy: control policial en la vía.',
    colorClass: 'bg-indigo-600 hover:bg-indigo-700',
  },
]
