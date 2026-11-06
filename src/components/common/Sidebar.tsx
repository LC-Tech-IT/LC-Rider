import { useApp } from '../../context/AppContext'
import type { ComponentType, SVGProps } from 'react'
import Avatar from './Avatar'
import ColombianPlate from './ColombianPlate'
import { IconGauge, IconLifeBuoy, IconMap, IconRotateCw, IconUser, IconUsers, IconWrench } from './Icons'

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

export default function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    lang,
    setLang,
    activeVehicle,
    setView,
    user,
    logout,
    setAuthModalOpen,
    setEditProfileModalOpen,
    openSubscriptionCheckout,
    t,
  } = useApp()

  if (!sidebarOpen) return null

  return (
    <div className="absolute inset-0 z-50 flex">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => setSidebarOpen(false)} />
      <aside className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b-2 border-slate-200 p-5">
          {user?.isLoggedIn ? (
            <Avatar value={user.avatarUrl} className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-slate-200" />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-slate-200 text-slate-700">
              <IconUser className="h-6 w-6" strokeWidth={2} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-extrabold text-slate-950">
                {user?.isLoggedIn ? user.name : t('sidebar.defaultRiderName')}
              </p>
              {user?.isLoggedIn && (
                <span className="flex-shrink-0 rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-800">
                  {t(`tier.${user.tier}`)}
                </span>
              )}
            </div>
            {user?.isLoggedIn ? (
              <p className="truncate text-xs text-slate-600">{user.email}</p>
            ) : (
              <ColombianPlate plate={activeVehicle.plate} subtitle={activeVehicle.brand} size="sm" className="mt-1" />
            )}
          </div>
        </div>

        {user?.isLoggedIn ? (
          <div className="border-b-2 border-slate-200 p-3">
            <button
              onClick={() => {
                openSubscriptionCheckout(user.tier !== 'free' ? user.tier : undefined)
                setSidebarOpen(false)
              }}
              className="mb-2 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 text-xs font-bold text-white transition hover:bg-orange-700 active:scale-95"
            >
              {user.tier !== 'free' && <IconRotateCw className="h-4 w-4" strokeWidth={2.25} />}
              {user.tier === 'free' ? t('sidebar.viewPlans') : t('subscription.renewOrChange')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditProfileModalOpen(true)
                  setSidebarOpen(false)
                }}
                className="min-h-[44px] flex-1 rounded-lg border-2 border-slate-200 py-2 text-xs font-bold text-slate-800 active:scale-95"
              >
                {t('sidebar.editProfile')}
              </button>
              <button
                onClick={() => {
                  logout()
                  setSidebarOpen(false)
                }}
                className="min-h-[44px] flex-1 rounded-lg border-2 border-red-600 py-2 text-xs font-bold text-red-700 active:scale-95"
              >
                {t('sidebar.logout')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-b-2 border-slate-200 p-3">
            <button
              onClick={() => {
                setAuthModalOpen(true)
                setSidebarOpen(false)
              }}
              className="min-h-[44px] w-full rounded-lg bg-orange-600 py-2.5 text-xs font-bold text-white transition hover:bg-orange-700 active:scale-95"
            >
              {t('sidebar.signInRegister')}
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <SidebarItem icon={IconGauge} label={t('nav.tablero')} onClick={() => { setView('cockpit'); setSidebarOpen(false) }} />
          <SidebarItem icon={IconMap} label={t('nav.navegacion')} onClick={() => { setView('map'); setSidebarOpen(false) }} />
          <SidebarItem icon={IconWrench} label={t('nav.garajeSoat')} onClick={() => { setView('garage'); setSidebarOpen(false) }} />
          <SidebarItem icon={IconUsers} label={t('convoy.title')} onClick={() => { setView('convoy'); setSidebarOpen(false) }} />
          <SidebarItem icon={IconLifeBuoy} label={t('sidebar.support')} onClick={() => setSidebarOpen(false)} />
        </nav>

        <div className="border-t-2 border-slate-200 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">{t('sidebar.language')}</p>
          <div className="flex overflow-hidden rounded-lg border-2 border-slate-200">
            <button
              onClick={() => setLang('es')}
              className={`min-h-[44px] flex-1 py-2 text-sm font-bold transition ${lang === 'es' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`min-h-[44px] flex-1 py-2 text-sm font-bold transition ${lang === 'en' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700'}`}
            >
              EN
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function SidebarItem({ icon: Icon, label, onClick }: { icon: IconComponent; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[52px] w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
    >
      <Icon className="h-5 w-5 flex-shrink-0 text-slate-700" strokeWidth={2} />
      {label}
    </button>
  )
}
