import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { goToLanding } from '../../utils/navigationHelper'
import Avatar from './Avatar'

export default function Header() {
  const {
    vehicles,
    activeVehicle,
    setActiveVehicleId,
    setSidebarOpen,
    setAuthModalOpen,
    setTopLevelMode,
    setNotificationModalOpen,
    unreadNotificationsCount,
    markNotificationsRead,
    user,
    t,
  } = useApp()
  const [plateMenuOpen, setPlateMenuOpen] = useState(false)

  function openNotifications() {
    setNotificationModalOpen(true)
    markNotificationsRead()
  }

  return (
    <header className="relative z-30 flex items-center justify-between gap-2 border-b border-bike-border bg-white px-4 py-3">
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 p-2 text-slate-600 active:scale-95 transition"
        aria-label={t('header.openMenu')}
      >
        <span className="text-xl">☰</span>
      </button>

      <div className="relative min-w-0 flex-1 flex justify-center">
        <button
          onClick={() => setPlateMenuOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 shadow-card"
        >
          <span className="text-lg leading-none">{activeVehicle.avatarEmoji}</span>
          <span className="font-display text-sm font-bold tracking-wider text-bike-blue">
            {activeVehicle.brand} {activeVehicle.plate}
          </span>
          <span className="text-xs text-slate-400">▾</span>
        </button>

        {plateMenuOpen && (
          <div className="absolute left-1/2 top-full z-40 mt-2 w-56 -translate-x-1/2 rounded-xl border border-bike-border bg-white shadow-xl">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVehicleId(v.id)
                  setPlateMenuOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition first:rounded-t-xl last:rounded-b-xl hover:bg-slate-50 ${
                  v.id === activeVehicle.id ? 'text-bike-blue' : 'text-slate-600'
                }`}
              >
                <span>{v.avatarEmoji}</span>
                <span className="flex-1">
                  {v.brand} {v.model}
                </span>
                <span className="font-display text-xs tracking-wide text-slate-400">{v.plate}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={() => goToLanding(setTopLevelMode)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-600 active:scale-95 transition"
          aria-label={t('nav.home')}
          title={t('nav.home')}
        >
          🏠
        </button>

        <button
          onClick={() => (user?.isLoggedIn ? setSidebarOpen(true) : setAuthModalOpen(true))}
          className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-bike-border bg-slate-100 text-lg active:scale-95 transition"
          aria-label={user?.isLoggedIn ? t('header.account') : t('header.signIn')}
        >
          {user?.isLoggedIn ? <Avatar value={user.avatarUrl} className="h-full w-full rounded-full" /> : '👤'}
          {user?.isLoggedIn && user.tier !== 'free' && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-white text-[9px] leading-none shadow-card">
              {user.tier === 'pro' ? '⚡' : '🏆'}
            </span>
          )}
        </button>

        <button
          onClick={openNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 active:scale-95 transition"
          aria-label={t('header.notifications')}
        >
          <span className="text-lg">🔔</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[10px] font-bold text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
