import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { GenderOption } from '../../types'

const GENDER_OPTIONS: Array<{ value: GenderOption; icon: string; labelKey: string }> = [
  { value: 'male', icon: '👨', labelKey: 'profile.genderMale' },
  { value: 'female', icon: '👩', labelKey: 'profile.genderFemale' },
  { value: 'unspecified', icon: '🤐', labelKey: 'profile.genderUnspecified' },
]

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, signInWithGoogle, supabaseSignIn, supabaseSignUp, setPrivacyModalOpen, t } = useApp()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [gender, setGender] = useState<GenderOption>('unspecified')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (authModalOpen) {
      setError('')
      setInfo('')
      setSubmitting(false)
      setName('')
      setLastName('')
      setGender('unspecified')
      setPhone('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setRememberMe(true)
      setAcceptTerms(false)
      setTab('signin')
    }
  }, [authModalOpen])

  if (!authModalOpen) return null

  function switchTab(next: 'signin' | 'signup') {
    setTab(next)
    setError('')
    setInfo('')
  }

  async function handleSignIn() {
    setError('')
    setInfo('')
    if (!email.trim() || !password.trim()) {
      setError(t('auth.errorRequired'))
      return
    }
    setSubmitting(true)
    try {
      await supabaseSignIn(email.trim(), password, rememberMe)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignUp() {
    setError('')
    setInfo('')
    if (!name.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(t('auth.errorRequired'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('auth.errorPasswordMismatch'))
      return
    }
    if (!acceptTerms) {
      setError(t('auth.errorAcceptTerms'))
      return
    }
    setSubmitting(true)
    try {
      await supabaseSignUp({ name, lastName, gender, phone, email: email.trim(), password, remember: rememberMe })
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.errorGeneric')
      if (message === t('auth.errorConfirmEmail')) {
        setInfo(message)
        setTab('signin')
      } else {
        setError(message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setInfo('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.errorGeneric'))
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-bike-border bg-white p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-bike-ink">
            {tab === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
          </h2>
          <button onClick={() => setAuthModalOpen(false)} className="text-2xl leading-none text-slate-400" aria-label={t('auth.close')}>
            ×
          </button>
        </div>

        <div className="mb-4 flex overflow-hidden rounded-xl border border-bike-border">
          <button
            onClick={() => switchTab('signin')}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'signin' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
          >
            {t('auth.signIn')}
          </button>
          <button
            onClick={() => switchTab('signup')}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${tab === 'signup' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
          >
            {t('auth.createAccount')}
          </button>
        </div>

        <button
          onClick={handleGoogle}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-bike-border bg-white py-3 text-sm font-bold text-bike-ink shadow-card transition active:scale-[0.98]"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 40.6 16.2 45 24 45z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.3 5.3C40.9 36.6 45 31 45 24c0-1.4-.1-2.8-.4-4.5z" />
          </svg>
          {t('auth.continueWithGoogle')}
        </button>
        {/* Google puede crear la cuenta en el mismo paso: la autorización se otorga por conducta inequívoca. */}
        <p className="-mt-2 mb-4 text-center text-[11px] text-slate-400">
          {t('auth.googleConsentPrefix')}{' '}
          <button type="button" onClick={() => setPrivacyModalOpen(true)} className="font-semibold text-bike-orange underline">
            {t('auth.privacyPolicyLink')}
          </button>
        </p>
        <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
          <span className="h-px flex-1 bg-bike-border" />
          {t('auth.or')}
          <span className="h-px flex-1 bg-bike-border" />
        </div>

        {tab === 'signin' ? (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.email')}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                type="email"
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.password')}</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                type="password"
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-bike-border text-bike-orange focus:ring-bike-orange"
              />
              <span>{t('auth.rememberMe')}</span>
            </label>

            {info && <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-bike-blue">{info}</p>}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{error}</p>}

            <button
              onClick={handleSignIn}
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? t('auth.submitting') : t('auth.submitSignIn')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.name')}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                  className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.lastName')}</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('auth.lastNamePlaceholder')}
                  className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('profile.gender')}</p>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setGender(g.value)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition ${
                      gender === g.value ? 'border-bike-orange bg-orange-50' : 'border-bike-border bg-white'
                    }`}
                  >
                    <span className="text-lg">{g.icon}</span>
                    <span className="text-[10px] font-semibold text-slate-600">{t(g.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.phone')}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('auth.phonePlaceholder')}
                type="tel"
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.email')}</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                type="email"
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.password')}</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                type="password"
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.confirmPassword')}</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmPasswordPlaceholder')}
                type="password"
                className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-bike-border text-bike-orange focus:ring-bike-orange"
              />
              <span>{t('auth.rememberMe')}</span>
            </label>

            <label className="flex cursor-pointer select-none items-start gap-2.5 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-bike-border text-bike-orange focus:ring-bike-orange"
              />
              <span>
                {t('auth.acceptPrefix')}{' '}
                <button
                  type="button"
                  onClick={() => setPrivacyModalOpen(true)}
                  className="font-bold text-bike-orange underline hover:text-orange-600"
                >
                  {t('auth.privacyPolicyLink')}
                </button>{' '}
                {t('auth.acceptSuffix')}
              </span>
            </label>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{error}</p>}

            <button
              onClick={handleSignUp}
              disabled={submitting}
              className="mt-2 w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? t('auth.submitting') : t('auth.submitCreate')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
