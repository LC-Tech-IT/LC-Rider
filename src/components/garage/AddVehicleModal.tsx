import { useApp } from '../../context/AppContext'
import VehicleForm from './VehicleForm'
import type { Vehicle } from '../../types'

export default function AddVehicleModal() {
  const { addVehicleModalOpen, setAddVehicleModalOpen, addVehicle, checkDemoRestriction, t } = useApp()

  if (!addVehicleModalOpen) return null

  function handleClose() {
    setAddVehicleModalOpen(false)
  }

  function handleSave(vehicle: Vehicle, setActive: boolean) {
    // Defensa adicional: aunque GarageView ya bloquea la entrada a este modal en Modo Demo, se repite la
    // guarda aquí por si el modal se invoca desde otro punto en el futuro.
    if (checkDemoRestriction(t('addVehicle.title'))) {
      handleClose()
      return
    }
    addVehicle(vehicle, setActive)
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-bike-border bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-bike-ink">{t('addVehicle.title')}</h2>
          <button onClick={handleClose} className="text-2xl leading-none text-slate-400">
            ×
          </button>
        </div>

        <VehicleForm onSave={handleSave} onCancel={handleClose} showActiveToggle />
      </div>
    </div>
  )
}
