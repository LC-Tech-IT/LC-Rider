import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { goToLanding } from '../../utils/navigationHelper'
import Avatar, { isPhotoAvatar } from './Avatar'
import ColombianPlate from './ColombianPlate'
import { IconBell, IconChevronDown, IconHome, IconMenu, IconStar, IconUser, IconUsers } from './Icons'


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
    <header className="relative z-30 flex items-center justify-between gap-2 border-b-2 border-slate-200 bg-white px-3 py-2.5">
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-900 transition active:scale-95"
        aria-label={t('header.openMenu')}
      >
        <IconMenu className="h-5 w-5" strokeWidth={2.25} />
      </button>

      <div className="relative min-w-0 flex-1 flex justify-center">
        <button
          onClick={() => setPlateMenuOpen((o) => !o)}
          className="flex min-h-[44px] max-w-full items-center gap-1.5 rounded-lg px-1 transition active:scale-95"
          aria-haspopup="listbox"
          aria-expanded={plateMenuOpen}
        >
          <ColombianPlate plate={activeVehicle.plate} subtitle={activeVehicle.brand} size="md" className="max-w-[9.5rem]" />
          <IconChevronDown className="h-4 w-4 flex-shrink-0 text-slate-600" strokeWidth={2.25} />
        </button>

        {plateMenuOpen && (
          <div className="absolute left-1/2 top-full z-40 mt-2 w-60 -translate-x-1/2 rounded-xl border-2 border-slate-200 bg-white shadow-xl">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVehicleId(v.id)
                  setPlateMenuOpen(false)
                }}
                className={`flex min-h-[48px] w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition first:rounded-t-xl last:rounded-b-xl hover:bg-slate-50 ${
                  v.id === activeVehicle.id ? 'bg-slate-50 font-bold text-slate-900' : 'text-slate-700'
                }`}
              >
                <span className="flex-1 truncate">
                  {v.brand} {v.model}
                </span>
                <ColombianPlate plate={v.plate} size="sm" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-shrink-0 items-center gap-1.5">
        <button
          onClick={() => goToLanding(setTopLevelMode)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-900 transition active:scale-95"
          aria-label={t('nav.home')}
          title={t('nav.home')}
        >
          <IconHome className="h-5 w-5" strokeWidth={2} />
        </button>

        <button
          onClick={() => (user?.isLoggedIn ? setSidebarOpen(true) : setAuthModalOpen(true))}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-900 transition active:scale-95"
          aria-label={user?.isLoggedIn ? t('header.account') : t('header.signIn')}
        >
          <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full">
            {user?.isLoggedIn && isPhotoAvatar(user.avatarUrl) ? (
              <Avatar value={user.avatarUrl} className="h-full w-full rounded-full" />
            ) : (
              <IconUser className="h-5 w-5" strokeWidth={2} />
            )}
          </span>
          {user?.isLoggedIn && user.tier !== 'free' && (
            <span
              className={`absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white text-white ${
                user.tier === 'pro' ? 'bg-orange-600' : 'bg-slate-900'
              }`}
              title={user.tier === 'pro' ? 'Convoy Pro' : 'Biker Club'}
            >
              {user.tier === 'pro' ? <IconStar className="h-2.5 w-2.5" strokeWidth={3} /> : <IconUsers className="h-2.5 w-2.5" strokeWidth={3} />}
            </span>
          )}
        </button>

        <button
          onClick={openNotifications}
          className="relative flex h-10 w-10 items-center justify-center rounded-lg border-2 border-slate-200 bg-white text-slate-900 transition active:scale-95"
          aria-label={t('header.notifications')}
        >
          <IconBell className="h-5 w-5" strokeWidth={2} />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[10px] font-bold tabular-nums text-white">
              {unreadNotificationsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
