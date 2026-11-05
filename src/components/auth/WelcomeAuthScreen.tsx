import { useApp } from '../../context/AppContext'

export default function WelcomeAuthScreen() {
  const { lang, setLang, signInWithGoogle, loginDemo, setAuthModalOpen, showToast, t } = useApp()

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('auth.errorGeneric'))
    }
  }

  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-orange-50 via-white to-sky-50 px-6 pb-8 pt-6">
      <div className="flex items-center justify-end">
        <div className="flex overflow-hidden rounded-full border border-bike-border bg-white shadow-card">
          <button
            onClick={() => setLang('es')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${lang === 'es' ? 'bg-bike-orange text-white' : 'text-slate-500'}`}
          >
            ES
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${lang === 'en' ? 'bg-bike-orange text-white' : 'text-slate-500'}`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <img
          src="/images/app-icon.jpg"
          alt="LC Rider"
          className="h-24 w-24 rounded-3xl border-2 border-bike-orange object-cover shadow-glow-orange"
        />
        <h1 className="mt-6 font-display text-3xl font-black text-bike-ink">{t('welcome.title')}</h1>
        <p className="mt-3 max-w-xs text-sm text-slate-500">{t('welcome.tagline')}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-bike-border bg-white py-3.5 text-sm font-bold text-bike-ink shadow-card transition active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 40.6 16.2 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.3 5.3C40.9 36.6 45 31 45 24c0-1.4-.1-2.8-.4-4.5z" />
          </svg>
          {t('auth.continueWithGoogle')}
        </button>

        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
        >
          {t('welcome.createOrEmail')}
        </button>

        <p className="pt-1 text-center text-xs text-slate-500">
          {t('welcome.tryDemoQuestion')}{' '}
          <button onClick={loginDemo} className="font-semibold text-bike-blue underline">
            {t('welcome.tryDemo')}
          </button>
        </p>
      </div>
    </div>
  )
}
