import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { Vehicle } from '../../types'
import ColombianPlate from '../common/ColombianPlate'
import { IconCar, IconCheck, IconMotorcycle, IconPaperclip, IconPlus, IconShield, IconTrash } from '../common/Icons'

/** Semáforo documental: punto de color + texto de estado. Sin fondos pastel (ficha técnica, no "cajones"). */
const STATUS_STYLES = {
  ok: { text: 'text-slate-900', dot: 'bg-emerald-500', labelKey: 'garage.statusOk' },
  warning: { text: 'text-amber-700', dot: 'bg-amber-500', labelKey: 'garage.statusWarning' },
  expired: { text: 'text-red-700', dot: 'bg-red-600', labelKey: 'garage.statusExpired' },
}

export default function GarageView() {
  const {
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    vehicleDocStatus,
    renewPlan,
    deleteVehicle,
    setAddVehicleModalOpen,
    setSubscriptionModalOpen,
    vehicleLimit,
    checkDemoRestriction,
    showToast,
    t,
  } = useApp()
  const [renewalTarget, setRenewalTarget] = useState<Vehicle | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null)

  function handleAddVehicle() {
    if (checkDemoRestriction(t('garage.addVehicle'))) return
    if (vehicles.length >= vehicleLimit) {
      showToast(t('garage.vehicleLimitReached', { limit: vehicleLimit }))
      setSubscriptionModalOpen(true)
      return
    }
    setAddVehicleModalOpen(true)
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-100 px-4 pb-6 pt-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-extrabold tracking-tight text-slate-950">{t('garage.title')}</h1>
        <button
          onClick={handleAddVehicle}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-orange-600 px-3.5 text-xs font-bold text-white transition hover:bg-orange-700 active:scale-95"
        >
          <IconPlus className="mr-1.5 h-4 w-4" strokeWidth={2.5} />
          {t('garage.addVehicle')}
        </button>
      </div>

      <div className="space-y-3">
        {vehicles.map((vehicle) => {
          const soat = vehicleDocStatus(vehicle.soat.expiresAt)
          const tecno = vehicleDocStatus(vehicle.tecnomecanica.expiresAt)
          const isActive = vehicle.id === activeVehicleId

          function requestDelete() {
            if (checkDemoRestriction(t('garage.delete'))) return
            setDeleteTarget(vehicle)
          }

          return (
            <div
              key={vehicle.id}
              className={`rounded-2xl border-2 border-slate-200/90 bg-white p-4 shadow-sm transition ${
                isActive ? 'border-l-4 border-l-slate-950 ring-1 ring-slate-900/10' : ''
              }`}
            >
              {/* Cabecera: medallón, identidad y placa */}
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                  {vehicle.type === 'carro' ? (
                    <IconCar className="h-8 w-8" strokeWidth={1.75} />
                  ) : (
                    <IconMotorcycle className="h-8 w-8" strokeWidth={1.75} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-base font-black leading-tight tracking-tight text-slate-950">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{vehicle.type}</span>
                    {isActive && (
                      <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                        <IconCheck className="h-3 w-3" strokeWidth={3} />
                        {t('garage.activeBadge')}
                      </span>
                    )}
                  </div>
                </div>
                <ColombianPlate plate={vehicle.plate} subtitle={vehicle.brand} size="md" />
              </div>

              {/* Franja técnica documental: dos columnas separadas por un divisor de 1px */}
              <div className="my-3 grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
                <DocColumn
                  label={t('garage.soat')}
                  status={soat.status}
                  days={soat.days}
                  linked={Boolean(vehicle.soat.fileName)}
                  className="pr-3"
                  t={t}
                />
                <DocColumn
                  label={t('garage.tecno')}
                  status={tecno.status}
                  days={tecno.days}
                  linked={Boolean(vehicle.tecnomecanica.fileName)}
                  className="pl-3"
                  t={t}
                />
              </div>

              {/* Plan de asistencia: línea ligera, sin cajón */}
              <div className="flex items-center justify-between gap-3 py-1 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <IconShield className="h-4 w-4 flex-shrink-0 text-slate-500" strokeWidth={2} />
                  <span className="font-medium leading-snug text-slate-600">
                    {t('garage.assistanceLabel')}:{' '}
                    <strong className="whitespace-nowrap font-bold text-slate-900">
                      {vehicle.planActive
                        ? t('garage.assistanceUntil', { date: vehicle.planExpiresAt ?? '' })
                        : t('garage.noActivePlan')}
                    </strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (checkDemoRestriction(t(vehicle.planActive ? 'garage.renew' : 'garage.activate'))) return
                    setRenewalTarget(vehicle)
                  }}
                  className="min-h-[40px] flex-shrink-0 px-1 text-xs font-black uppercase tracking-wider text-orange-600 transition hover:text-orange-700 active:scale-95"
                >
                  {vehicle.planActive ? t('garage.renew') : t('garage.activate')}
                </button>
              </div>

              {/* Acciones */}
              <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3">
                {isActive ? (
                  <span className="flex flex-1 items-center gap-1.5 text-xs font-black text-emerald-700">
                    <IconCheck className="h-4 w-4" strokeWidth={3} />
                    {t('garage.selectedForRide')}
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveVehicleId(vehicle.id)}
                    className="min-h-[44px] flex-1 rounded-xl bg-slate-950 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-slate-900 active:scale-[0.98]"
                  >
                    {t('garage.selectForRide')}
                  </button>
                )}
                <button
                  onClick={requestDelete}
                  className="flex min-h-[44px] w-11 flex-shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 text-slate-500 transition hover:border-red-300 hover:text-red-600 active:scale-95"
                  aria-label={t('garage.delete')}
                  title={t('garage.delete')}
                >
                  <IconTrash className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {renewalTarget && (
        <RenewalModal
          vehicle={renewalTarget}
          t={t}
          onClose={() => setRenewalTarget(null)}
          onConfirm={() => {
            renewPlan(renewalTarget.id)
            setRenewalTarget(null)
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          vehicle={deleteTarget}
          t={t}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            deleteVehicle(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}

function DocColumn({
  label,
  status,
  days,
  linked,
  className,
  t,
}: {
  label: string
  status: 'ok' | 'warning' | 'expired'
  days: number
  linked: boolean
  className: string
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  const style = STATUS_STYLES[status]
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
        <span className="truncate text-[10px] font-black uppercase tracking-widest text-slate-600">{label}</span>
      </div>
      <p className={`text-xs font-black ${style.text}`}>{t(style.labelKey)}</p>
      <p className="text-[11px] font-semibold text-slate-600">
        {status === 'expired' ? t('garage.expiredSince', { days: Math.abs(days) }) : t('garage.daysLeft', { days })}
      </p>
      {linked && (
        <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-600" title={t('garage.documentLinked')}>
          <IconPaperclip className="h-3 w-3 flex-shrink-0" strokeWidth={2.25} />
          <span className="truncate">{t('garage.documentLinked')}</span>
        </p>
      )}
    </div>
  )
}

function RenewalModal({
  vehicle,
  onClose,
  onConfirm,
  t,
}: {
  vehicle: Vehicle
  onClose: () => void
  onConfirm: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-bike-border bg-white p-5 shadow-2xl">
        <h3 className="font-display text-base font-bold text-bike-ink">{t('garage.renewalTitle')}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {t('garage.renewalBody', { vehicle: `${vehicle.brand} ${vehicle.plate}` })}
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-bike-border py-2.5 text-sm font-semibold text-slate-600"
          >
            {t('garage.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-orange-600 py-2.5 text-sm font-bold text-white"
          >
            {t('garage.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  vehicle,
  onClose,
  onConfirm,
  t,
}: {
  vehicle: Vehicle
  onClose: () => void
  onConfirm: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-bike-border bg-white p-5 shadow-2xl">
        <h3 className="font-display text-base font-bold text-bike-ink">{t('garage.deleteConfirmTitle')}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {t('garage.deleteConfirmBody', { vehicle: `${vehicle.brand} ${vehicle.plate}` })}
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-bike-border py-2.5 text-sm font-semibold text-slate-600"
          >
            {t('garage.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl border-2 border-status-danger py-2.5 text-sm font-bold text-status-danger"
          >
            {t('garage.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}
