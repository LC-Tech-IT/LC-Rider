import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { Vehicle } from '../../types'
import ColombianPlate from '../common/ColombianPlate'
import { IconCar, IconCheck, IconMotorcycle, IconPlus } from '../common/Icons'

const STATUS_STYLES = {
  ok: { bg: 'border-emerald-200 bg-emerald-50', text: 'text-emerald-800', dot: 'bg-emerald-600', labelKey: 'garage.statusOk' },
  warning: { bg: 'border-amber-300 bg-amber-50', text: 'text-amber-900', dot: 'bg-amber-500', labelKey: 'garage.statusWarning' },
  expired: { bg: 'border-red-300 bg-red-50', text: 'text-red-800', dot: 'bg-red-600', labelKey: 'garage.statusExpired' },
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
            return (
              <div key={vehicle.id} className="rounded-2xl border-2 border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50">
                    {vehicle.type === 'carro' ? (
                      <IconCar className="h-6 w-6 text-slate-800" strokeWidth={2} />
                    ) : (
                      <IconMotorcycle className="h-6 w-6 text-slate-800" strokeWidth={2} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-950">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs font-semibold capitalize text-slate-600">{vehicle.type}</p>
                  </div>
                  <ColombianPlate plate={vehicle.plate} subtitle={vehicle.brand} size="md" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DocBadge label={t('garage.soat')} status={soat.status} days={soat.days} t={t} />
                  <DocBadge label={t('garage.tecno')} status={tecno.status} days={tecno.days} t={t} />
                </div>

                {(vehicle.soat.fileName || vehicle.tecnomecanica.fileName) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {vehicle.soat.fileName && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">
                        <IconCheck className="h-3 w-3" strokeWidth={3} />
                        {t('garage.documentLinked')} · SOAT
                      </span>
                    )}
                    {vehicle.tecnomecanica.fileName && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">
                        <IconCheck className="h-3 w-3" strokeWidth={3} />
                        {t('garage.documentLinked')} · Tecno
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t('garage.assistancePlan')}</p>
                    <p className="text-[11px] font-medium text-slate-600">
                      {vehicle.planActive
                        ? t('garage.planActiveUntil', { date: vehicle.planExpiresAt ?? '' })
                        : t('garage.noActivePlan')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (checkDemoRestriction(t(vehicle.planActive ? 'garage.renew' : 'garage.activate'))) return
                      setRenewalTarget(vehicle)
                    }}
                    className="min-h-[40px] flex-shrink-0 rounded-lg bg-orange-600 px-3.5 text-xs font-bold text-white transition hover:bg-orange-700 active:scale-95"
                  >
                    {vehicle.planActive ? t('garage.renew') : t('garage.activate')}
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setActiveVehicleId(vehicle.id)}
                    disabled={isActive}
                    className={`flex min-h-[48px] flex-1 items-center justify-center rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'cursor-default border-2 border-emerald-300 bg-emerald-50 text-emerald-800'
                        : 'bg-slate-900 text-white active:scale-95'
                    }`}
                  >
                    {isActive && <IconCheck className="mr-1 inline h-4 w-4" strokeWidth={2.75} />}
                    {isActive ? t('garage.selected') : t('garage.selectForRide')}
                  </button>
                  <button
                    onClick={() => {
                      if (checkDemoRestriction(t('garage.delete'))) return
                      setDeleteTarget(vehicle)
                    }}
                    className="min-h-[48px] rounded-xl border-2 border-red-600 px-4 text-xs font-bold text-red-700 active:scale-95"
                  >
                    {t('garage.delete')}
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

function DocBadge({
  label,
  status,
  days,
  t,
}: {
  label: string
  status: 'ok' | 'warning' | 'expired'
  days: number
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  const style = STATUS_STYLES[status]
  return (
    <div className={`rounded-xl border-2 p-3 ${style.bg}`}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">{label}</span>
      </div>
      <p className={`text-sm font-extrabold ${style.text}`}>{t(style.labelKey)}</p>
      <p className="text-[11px] font-medium text-slate-700">
        {status === 'expired' ? t('garage.expiredSince', { days: Math.abs(days) }) : t('garage.daysLeft', { days })}
      </p>
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
