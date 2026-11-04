import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { ComponentType, SVGProps } from 'react'
import type { ConvoyRole } from '../../types'
import Avatar from '../common/Avatar'
import { IconCrown, IconMotorcycle, IconShield, IconUsers } from '../common/Icons'

const ROLES: Array<{ value: ConvoyRole; icon: ComponentType<SVGProps<SVGSVGElement>>; labelKey: string; descKey: string }> = [
  { value: 'lider', icon: IconCrown, labelKey: 'convoy.leader', descKey: 'convoy.leaderDesc' },
  { value: 'piloto', icon: IconMotorcycle, labelKey: 'convoy.rider', descKey: 'convoy.riderDesc' },
  { value: 'guardian', icon: IconShield, labelKey: 'convoy.guardian', descKey: 'convoy.guardianDesc' },
]

const ROLE_LABEL_KEY: Record<ConvoyRole, string> = { lider: 'convoy.leader', piloto: 'convoy.rider', guardian: 'convoy.guardian' }

export default function ConvoyLobby() {
  const {
    convoyRoom,
    convoyMembers,
    createConvoyRoom,
    joinConvoyRoom,
    leaveConvoyRoom,
    navigation,
    user,
    convoyMemberLimit,
    setSubscriptionModalOpen,
    isDemoUser,
    t,
  } = useApp()
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu')
  const [name, setName] = useState('')
  const [pinInput, setPinInput] = useState('')
  const [role, setRole] = useState<ConvoyRole>('piloto')

  if (convoyRoom) {
    return (
      <div className="flex h-full flex-col overflow-y-auto bg-bike-bg px-4 pb-6 pt-4">
        {isDemoUser && (
          <p className="mb-3 rounded-xl bg-orange-50 px-3 py-2 text-xs text-bike-orange">{t('demo.convoyBanner')}</p>
        )}
        <div className="mb-4 rounded-2xl border border-sky-200 bg-white p-5 text-center shadow-card">
          <p className="text-xs uppercase tracking-widest text-slate-400">{t('convoy.pinLabel')}</p>
          <p className="font-display text-4xl font-black tracking-[0.3em] text-bike-blue">{convoyRoom.pin}</p>
          <p className="mt-1 text-xs text-slate-500">{t('convoy.shareHint')}</p>
        </div>

        {!navigation.route && (
          <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">{t('convoy.noRouteWarning')}</p>
        )}

        {convoyMembers.length <= 1 && (
          <p className="mb-3 rounded-xl bg-sky-50 px-3 py-2 text-xs text-bike-blue">{t('convoy.aloneInRoom')}</p>
        )}

        {convoyRoom.tier === 'free' && (
          <div className="mb-3 flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <span>{t('convoy.freeLimitWarning')}</span>
            <button onClick={() => setSubscriptionModalOpen(true)} className="flex-shrink-0 font-bold underline">
              {t('convoy.upgradeForMore')}
            </button>
          </div>
        )}

        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t('convoy.members')}</p>
          <p className="font-display text-xs font-bold text-bike-blue">
            {convoyRoom.maxMembers >= 999
              ? `${convoyMembers.length} · ${t('convoy.unlimited')}`
              : t('convoy.capacity', { count: convoyMembers.length, max: convoyRoom.maxMembers })}
          </p>
        </div>
        <div className="space-y-2">
          {convoyMembers.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5">
              <Avatar value={m.avatarEmoji} className="h-9 w-9 flex-shrink-0 rounded-full" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-950">
                  {m.name}{' '}
                  {m.isCurrentUser && m.name !== t('rideSummary.you') && <span className="text-sky-800">{t('map.you')}</span>}
                </p>
                <p className="text-[11px] font-semibold text-slate-600">{t(ROLE_LABEL_KEY[m.role])}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={leaveConvoyRoom}
          className="mt-6 w-full rounded-xl border-2 border-status-danger py-3 text-sm font-bold text-status-danger"
        >
          {t('convoy.leaveRoom')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-bike-bg px-6">
      {mode === 'menu' && (
        <div className="w-full max-w-sm space-y-3 text-center">
          {isDemoUser && (
            <p className="rounded-xl bg-orange-50 px-3 py-2 text-xs text-bike-orange">{t('demo.convoyBanner')}</p>
          )}
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-800">
            <IconUsers className="h-8 w-8" strokeWidth={2} />
          </span>
          <h1 className="text-lg font-extrabold tracking-tight text-slate-950">{t('convoy.title')}</h1>
          <p className="mb-4 text-sm text-slate-500">{t('convoy.subtitle')}</p>
          <button
            onClick={() => setMode('create')}
            className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange active:scale-95"
          >
            {t('convoy.createRoom')}
          </button>
          <button
            onClick={() => setMode('join')}
            className="w-full rounded-xl border border-bike-border bg-white py-3.5 text-sm font-bold text-slate-700 shadow-card active:scale-95"
          >
            {t('convoy.joinWithPin')}
          </button>
        </div>
      )}

      {(mode === 'create' || mode === 'join') && (
        <div className="w-full max-w-sm space-y-4">
          <button onClick={() => setMode('menu')} className="text-xs text-slate-500">
            {t('convoy.back')}
          </button>
          <h1 className="font-display text-lg font-bold text-bike-ink">
            {mode === 'create' ? t('convoy.createRoomTitle') : t('convoy.joinRoomTitle')}
          </h1>

          {mode === 'create' && (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
              {t(`tier.${user?.tier ?? 'free'}`)} ·{' '}
              {convoyMemberLimit >= 999
                ? t('convoy.unlimited')
                : t('convoy.capacity', { count: 1, max: convoyMemberLimit })}
            </p>
          )}

          {mode === 'join' && (
            <input
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder={t('convoy.pinPlaceholder')}
              inputMode="numeric"
              className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-center font-display text-xl tracking-[0.3em] text-bike-ink placeholder:tracking-normal placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
            />
          )}

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('convoy.namePlaceholder')}
            className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
          />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('convoy.role')}</p>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition ${
                    role === r.value ? 'border-orange-600 bg-orange-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                      role === r.value ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <r.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-950">{t(r.labelKey)}</p>
                    <p className="text-[11px] font-medium text-slate-600">{t(r.descKey)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={mode === 'join' && pinInput.length !== 6}
            onClick={() => {
              if (mode === 'create') createConvoyRoom(name, role)
              else joinConvoyRoom(pinInput, name, role)
            }}
            className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            {mode === 'create' ? t('convoy.createRoom') : t('convoy.join')}
          </button>
        </div>
      )}
    </div>
  )
}
