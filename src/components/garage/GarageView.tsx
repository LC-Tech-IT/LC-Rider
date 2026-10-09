import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { Vehicle } from '../../types'

const STATUS_STYLES = {
  ok: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-status-ok', labelKey: 'garage.statusOk' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-status-warning', labelKey: 'garage.statusWarning' },
  expired: { bg: 'bg-red-50', text: 'text-status-danger', dot: 'bg-status-danger', labelKey: 'garage.statusExpired' },
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
    <div className="h-full overflow-y-auto bg-bike-bg px-4 pb-6 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-bold text-bike-ink">{t('garage.title')}</h1>
        <button
          onClick={handleAddVehicle}
          className="rounded-full bg-bike-orange px-3.5 py-2 text-xs font-bold text-white shadow-glow-orange active:scale-95"
        >
          {t('garage.addVehicle')}
        </button>
      </div>

      <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const soat = vehicleDocStatus(vehicle.soat.expiresAt)
            const tecno = vehicleDocStatus(vehicle.tecnomecanica.expiresAt)
            const isActive = vehicle.id === activeVehicleId
            return (
              <div key={vehicle.id} className="rounded-2xl border border-bike-border bg-white p-4 shadow-card">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                    style={{ backgroundColor: `${vehicle.color}1A` }}
                  >
                    {vehicle.avatarEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold text-bike-ink">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs capitalize text-slate-500">{vehicle.type}</p>
                  </div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 font-display text-xs font-bold tracking-widest text-bike-blue">
                    {vehicle.plate}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <DocBadge label={t('garage.soat')} status={soat.status} days={soat.days} t={t} />
                  <DocBadge label={t('garage.tecno')} status={tecno.status} days={tecno.days} t={t} />
                </div>

                {(vehicle.soat.fileName || vehicle.tecnomecanica.fileName) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {vehicle.soat.fileName && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        {t('garage.documentLinked')} · SOAT
                      </span>
                    )}
                    {vehicle.tecnomecanica.fileName && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                        {t('garage.documentLinked')} · Tecno
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">{t('garage.assistancePlan')}</p>
                    <p className="text-[11px] text-slate-500">
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
                    className="rounded-full bg-bike-orange px-3.5 py-1.5 text-xs font-bold text-white shadow-glow-orange active:scale-95"
                  >
                    {vehicle.planActive ? t('garage.renew') : t('garage.activate')}
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setActiveVehicleId(vehicle.id)}
                    disabled={isActive}
                    className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition ${
                      isActive
                        ? 'cursor-default bg-emerald-50 text-emerald-700'
                        : 'bg-bike-blue text-white shadow-glow-blue active:scale-95'
                    }`}
                  >
                    {isActive ? t('garage.selected') : t('garage.selectForRide')}
                  </button>
                  <button
                    onClick={() => {
                      if (checkDemoRestriction(t('garage.delete'))) return
                      setDeleteTarget(vehicle)
                    }}
                    className="rounded-xl border-2 border-status-danger px-4 py-2.5 text-xs font-bold text-status-danger active:scale-95"
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
    <div className={`rounded-xl p-3 ${style.bg}`}>
      <div className="mb-1 flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <p className={`text-sm font-bold ${style.text}`}>{t(style.labelKey)}</p>
      <p className="text-[11px] text-slate-500">
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
            className="flex-1 rounded-xl bg-bike-orange py-2.5 text-sm font-bold text-white shadow-glow-orange"
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
