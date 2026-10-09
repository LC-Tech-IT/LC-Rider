import { useApp } from '../../context/AppContext'
import { goToLanding } from '../../utils/navigationHelper'
import Avatar from './Avatar'

export default function Sidebar() {
  const {
    sidebarOpen,
    setSidebarOpen,
    lang,
    setLang,
    activeVehicle,
    setView,
    setTopLevelMode,
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
        <div className="flex items-center gap-3 border-b border-bike-border p-5">
          {user?.isLoggedIn ? (
            <Avatar value={user.avatarUrl} className="h-12 w-12 rounded-full" emojiClassName="bg-orange-100 text-2xl" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-2xl">🪖</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-display text-sm font-bold text-bike-ink">
                {user?.isLoggedIn ? user.name : t('sidebar.defaultRiderName')}
              </p>
              {user?.isLoggedIn && (
                <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  {t(`tier.${user.tier}`)}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-500">
              {user?.isLoggedIn ? user.email : `${activeVehicle.brand} ${activeVehicle.plate}`}
            </p>
          </div>
        </div>

        {user?.isLoggedIn ? (
          <div className="border-b border-bike-border p-3">
            <button
              onClick={() => {
                openSubscriptionCheckout(user.tier !== 'free' ? user.tier : undefined)
                setSidebarOpen(false)
              }}
              className="mb-2 w-full rounded-lg bg-bike-orange py-2 text-xs font-bold text-white shadow-glow-orange active:scale-95"
            >
              {user.tier === 'free' ? t('sidebar.viewPlans') : t('subscription.renewOrChange')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditProfileModalOpen(true)
                  setSidebarOpen(false)
                }}
                className="flex-1 rounded-lg border border-bike-border py-2 text-xs font-semibold text-slate-600 active:scale-95"
              >
                {t('sidebar.editProfile')}
              </button>
              <button
                onClick={() => {
                  logout()
                  setSidebarOpen(false)
                }}
                className="flex-1 rounded-lg border-2 border-status-danger py-2 text-xs font-bold text-status-danger active:scale-95"
              >
                {t('sidebar.logout')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-b border-bike-border p-3">
            <button
              onClick={() => {
                setAuthModalOpen(true)
                setSidebarOpen(false)
              }}
              className="w-full rounded-lg bg-bike-orange py-2.5 text-xs font-bold text-white shadow-glow-orange active:scale-95"
            >
              {t('sidebar.signInRegister')}
            </button>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <SidebarItem icon="🚦" label={t('nav.tablero')} onClick={() => { setView('cockpit'); setSidebarOpen(false) }} />
          <SidebarItem icon="🗺️" label={t('nav.navegacion')} onClick={() => { setView('map'); setSidebarOpen(false) }} />
          <SidebarItem icon="🛠️" label={t('nav.garajeSoat')} onClick={() => { setView('garage'); setSidebarOpen(false) }} />
          <SidebarItem icon="👥" label={t('convoy.title')} onClick={() => { setView('convoy'); setSidebarOpen(false) }} />
          <SidebarItem icon="🆘" label={t('sidebar.support')} onClick={() => setSidebarOpen(false)} />
          <div className="my-2 border-t border-bike-border" />
          <SidebarItem
            icon="🏠"
            label={t('nav.home')}
            onClick={() => {
              goToLanding(setTopLevelMode)
              setSidebarOpen(false)
            }}
          />
        </nav>

        <div className="border-t border-bike-border p-4">
          <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">{t('sidebar.language')}</p>
          <div className="flex overflow-hidden rounded-lg border border-bike-border">
            <button
              onClick={() => setLang('es')}
              className={`flex-1 py-2 text-sm font-semibold transition ${lang === 'es' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
            >
              ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`flex-1 py-2 text-sm font-semibold transition ${lang === 'en' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
            >
              EN
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}

function SidebarItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
    >
      <span className="text-lg">{icon}</span>
      {label}
    </button>
  )
}
