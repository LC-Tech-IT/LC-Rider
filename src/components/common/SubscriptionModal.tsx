import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { formatLongDate } from '../../utils/formatDate'
import { buildPaymentReference, getPlanAmountCOP, openWompiCheckout } from '../../services/paymentService'
import { clearPendingCheckout, savePendingCheckout } from '../../utils/storage'
import type { ComponentType, SVGProps } from 'react'
import type { SubscriptionTier } from '../../types'
import { IconBank, IconCard, IconCheck, IconCheckCircle, IconClock, IconPhone, IconSend, IconWhatsApp, IconZap } from './Icons'

type PaymentMethod = 'nequi' | 'pse' | 'card' | 'qr'
type CheckoutView = 'plans' | 'checkout' | 'processing' | 'success' | 'paymentPending' | 'qrPending'
type ActivationState = 'waiting' | 'active' | 'delayed'

/** Tras un pago aprobado, se consulta el plan en Supabase cada 3 s durante 60 s (además del aviso por Realtime). */
const ACTIVATION_POLL_MS = 3000
const ACTIVATION_MAX_ATTEMPTS = 20

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const WHATSAPP_SALES_NUMBER = '573505208592'

const PLAN_PRICE: Record<'pro' | 'club', { monthly: string; yearly: string }> = {
  pro: { monthly: '$14.900 COP', yearly: '$99.000 COP' },
  club: { monthly: '$34.900 COP', yearly: '$299.000 COP' },
}

export default function SubscriptionModal() {
  const {
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    subscriptionCheckoutTarget,
    subscriptionCheckoutBillingCycle,
    user,
    upgradeTier,
    redeemClubCode,
    refreshSubscriptionFromCloud,
    supabaseSignUp,
    signInWithGoogle,
    setAuthModalOpen,
    topLevelMode,
    setTopLevelMode,
    checkDemoRestriction,
    setPrivacyModalOpen,
    lang,
    t,
  } = useApp()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [clubCode, setClubCode] = useState('')
  const [clubNotice, setClubNotice] = useState('')

  const [view, setView] = useState<CheckoutView>('plans')
  const [checkoutTier, setCheckoutTier] = useState<'pro' | 'club'>('pro')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('nequi')
  /** Invitado registrado en el checkout cuya cuenta aún espera la confirmación del correo. */
  const [accountPendingConfirmation, setAccountPendingConfirmation] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestAcceptTerms, setGuestAcceptTerms] = useState(false)
  /** Correo con el que se pagó (el plan queda atado a él en el backend) y datos del registro posterior al pago. */
  const [payerEmail, setPayerEmail] = useState('')
  const [postPayPassword, setPostPayPassword] = useState('')
  const [claimingAccount, setClaimingAccount] = useState(false)
  const [claimError, setClaimError] = useState('')
  const [claimUserExists, setClaimUserExists] = useState(false)
  const [activation, setActivation] = useState<ActivationState>('waiting')
  /** Cada intento de pago tiene un número: "Volver a opciones de pago" invalida el intento en curso, de modo que una
   *  respuesta tardía del widget ya no cambia la pantalla. */
  const payAttemptRef = useRef(0)
  /** Vencimiento previo al pago: el plan se da por activado cuando la nube muestra el plan comprado con otro vencimiento. */
  const expiryBeforePayRef = useRef<string | undefined>(undefined)
  const isGuest = !user?.isLoggedIn

  useEffect(() => {
    if (!subscriptionModalOpen) return
    setClubNotice('')
    setCheckoutError('')
    setGuestName('')
    setGuestEmail('')
    setGuestAcceptTerms(false)
    setAccountPendingConfirmation(false)
    setPayerEmail('')
    setPostPayPassword('')
    setClaimError('')
    setClaimUserExists(false)
    if (subscriptionCheckoutTarget === 'pro' || subscriptionCheckoutTarget === 'club') {
      setCheckoutTier(subscriptionCheckoutTarget)
      setBillingCycle(subscriptionCheckoutBillingCycle)
      setView('checkout')
    } else {
      setView('plans')
    }
  }, [subscriptionModalOpen, subscriptionCheckoutTarget, subscriptionCheckoutBillingCycle])

  // Referencia estable mientras dure este checkout: se regenera solo si cambia el plan, no en cada render.
  // Nota: useMemo es un Hook y por eso debe llamarse aquí, antes del "return null" de abajo — nunca después,
  // o React pierde la cuenta del orden de Hooks entre un render con el modal cerrado y uno con el modal abierto.
  const qrReference = useMemo(
    () => buildPaymentReference(user?.id ?? (guestEmail.trim() || 'invitado')),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkoutTier, subscriptionModalOpen],
  )

  // Pago aprobado con sesión iniciada: el plan lo activa el webhook en Supabase (nunca el navegador). Se espera a
  // verlo en la nube para mostrar "Plan activo" con su fecha real; si tarda, se informa sin dar el pago por fallido.
  const loggedInUserId = user?.isLoggedIn ? user.id : null
  useEffect(() => {
    if (!subscriptionModalOpen || !loggedInUserId || (view !== 'success' && view !== 'paymentPending')) return
    let cancelled = false
    setActivation('waiting')
    void (async () => {
      for (let attempt = 0; attempt < ACTIVATION_MAX_ATTEMPTS && !cancelled; attempt++) {
        const sub = await refreshSubscriptionFromCloud()
        if (cancelled) return
        if (sub && sub.tier === checkoutTier && sub.subscriptionExpiresAt !== expiryBeforePayRef.current) {
          setActivation('active')
          if (view === 'paymentPending') setView('success')
          return
        }
        await new Promise((resolve) => window.setTimeout(resolve, ACTIVATION_POLL_MS))
      }
      if (!cancelled) setActivation('delayed')
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionModalOpen, loggedInUserId, view])

  if (!subscriptionModalOpen) return null

  const currentTier = user?.tier ?? 'free'

  /** El código no se valida aquí: se envía por WhatsApp VIP y el equipo activa el Club tras verificarlo. */
  function handleRedeemCode() {
    setClubNotice('')
    if (!clubCode.trim()) return
    if (checkDemoRestriction(t('subscription.clubCodeTitle'))) return
    redeemClubCode(clubCode)
    setClubNotice(t('subscription.clubVipNotice'))
    setClubCode('')
  }

  function startCheckout(tier: 'pro' | 'club') {
    if (checkDemoRestriction(t(tier === 'pro' ? 'subscription.proName' : 'subscription.clubName'))) return
    setCheckoutTier(tier)
    setCheckoutError('')
    setView('checkout')
  }

  /** Valida los datos mínimos del invitado (nombre, correo y autorización de datos). Sin contraseña: la cuenta se
   *  crea después del pago, con el mismo correo al que quedó atado el plan. */
  function validateGuest(): boolean {
    if (!isGuest) return true
    if (!guestName.trim() || !EMAIL_PATTERN.test(guestEmail.trim())) {
      setCheckoutError(t('subscription.errorGuestFields'))
      return false
    }
    if (!guestAcceptTerms) {
      setCheckoutError(t('auth.errorAcceptTerms'))
      return false
    }
    return true
  }

  /** Pago primero: abre Wompi de inmediato (sin registro previo). El plan lo activa el webhook firmado de Wompi:
   *  sobre la cuenta (referencia con su id) si hay sesión, o sobre el correo del pago si es invitado (tabla
   *  pending_subscriptions, que se aplica sola cuando esa persona crea su cuenta con ese correo o con Google). */
  async function handlePay() {
    setCheckoutError('')
    if (!validateGuest()) return

    const attempt = ++payAttemptRef.current
    const email = (user?.email || guestEmail).trim().toLowerCase()
    expiryBeforePayRef.current = user?.subscriptionExpiresAt
    setPayerEmail(email)
    setView('processing')
    try {
      const result = await openWompiCheckout({
        amountInCOP: getPlanAmountCOP(checkoutTier, billingCycle),
        reference: buildPaymentReference(user?.isLoggedIn ? user.id : 'invitado'),
        customerEmail: email,
        customerFullName: (user?.name || guestName).trim(),
      })
      if (attempt !== payAttemptRef.current) return
      if (result.status === 'APPROVED') {
        setView('success')
      } else if (result.status === 'PENDING') {
        // PSE / Nequi pueden quedar en verificación con el banco: no es un rechazo.
        setView('paymentPending')
      } else {
        setCheckoutError(t('subscription.errorPaymentDeclined'))
        setView('checkout')
      }
    } catch (err) {
      if (attempt !== payAttemptRef.current) return
      setCheckoutError(err instanceof Error ? err.message : t('auth.errorGeneric'))
      setView('checkout')
    }
  }

  /** El widget de Wompi no avisa si el usuario lo cierra sin pagar o si no logra cargar: este botón nunca deja la
   *  pantalla atrapada en "procesando". */
  function cancelProcessing() {
    payAttemptRef.current++
    setView('checkout')
  }

  /** Google OAuth desde el checkout: guarda el plan elegido y redirige; al volver autenticado se reabre este checkout. */
  async function handleGoogleCheckout() {
    setCheckoutError('')
    savePendingCheckout({ tier: checkoutTier, billingCycle })
    try {
      await signInWithGoogle()
    } catch (err) {
      clearPendingCheckout()
      setCheckoutError(err instanceof Error ? err.message : t('auth.errorGeneric'))
    }
  }

  /** Después de pagar: entrar con Google (sin reabrir el checkout, que ya está pago). Debe ser la cuenta de Google
   *  del mismo correo del pago para que el plan quede vinculado. */
  async function handleGoogleClaim() {
    setClaimError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : t('auth.errorGeneric'))
    }
  }

  /** Crea la cuenta con el correo del pago. Al nacer el perfil, Supabase le aplica los pagos pendientes de ese correo;
   *  si el webhook llega después, encuentra el perfil por correo y activa el plan directamente. */
  async function handleClaimAccount() {
    if (postPayPassword.trim().length < 6 || !payerEmail) return
    setClaimingAccount(true)
    setClaimError('')
    setClaimUserExists(false)
    try {
      const account = await supabaseSignUp({
        name: guestName.trim() || payerEmail.split('@')[0],
        lastName: '',
        gender: undefined,
        phone: '',
        email: payerEmail,
        password: postPayPassword,
        remember: true,
        allowPendingConfirmation: true,
      })
      setAccountPendingConfirmation(account.pendingConfirmation)
      setPostPayPassword('')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.errorGeneric')
      // Ya existe una cuenta con ese correo: el webhook le activa el plan a esa cuenta; solo debe iniciar sesión.
      if (message === t('auth.errorUserExists')) setClaimUserExists(true)
      else setClaimError(message)
    } finally {
      setClaimingAccount(false)
    }
  }

  function goToLogin() {
    setSubscriptionModalOpen(false)
    setTopLevelMode('app')
    setAuthModalOpen(true)
  }

  /** Cierra el modal; si el pago se hizo desde la landing con la cuenta ya activa, entra directo al tablero. */
  function finishAndEnter() {
    setSubscriptionModalOpen(false)
    if (topLevelMode === 'landing' && user?.isLoggedIn) setTopLevelMode('app')
  }

  /** Pago por QR: enviar el comprobante por WhatsApp NO activa el plan. El equipo lo activa tras verificar la
   *  transferencia (en la cuenta del correo indicado, o al crearla). No exige contraseña: la cuenta se crea después. */
  function handleQrReceiptClick(e: React.MouseEvent<HTMLAnchorElement>) {
    setCheckoutError('')
    if (!validateGuest()) {
      e.preventDefault()
      return
    }
    setPayerEmail((user?.email || guestEmail).trim().toLowerCase())
    setView('qrPending')
  }

  function handleClose() {
    setSubscriptionModalOpen(false)
  }

  const price = PLAN_PRICE[checkoutTier][billingCycle]
  const qrPlanName = t(checkoutTier === 'pro' ? 'subscription.proName' : 'subscription.clubName')
  const qrWhatsappUrl = `https://wa.me/${WHATSAPP_SALES_NUMBER}?text=${encodeURIComponent(
    t('subscription.qrWhatsappMessage', { plan: qrPlanName, price, reference: qrReference, email: (user?.email || guestEmail).trim().toLowerCase() }),
  )}`

  const planName = t(checkoutTier === 'pro' ? 'subscription.proName' : 'subscription.clubName')

  const claimAccountForm = (
    <div className="mt-2 w-full space-y-3 rounded-2xl border border-bike-border bg-slate-50 p-4 text-left">
      {claimUserExists ? (
        <>
          <p className="text-xs text-slate-600">{t('subscription.claimUserExists', { email: payerEmail })}</p>
          <button
            type="button"
            onClick={goToLogin}
            className="min-h-[48px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            {t('subscription.goToLogin')}
          </button>
        </>
      ) : (
        <>
          <p className="text-xs font-bold text-bike-ink">{t('subscription.claimAccountPrompt')}</p>
          <div className="rounded-xl border border-bike-border bg-white px-3 py-2 text-xs text-slate-600">
            <span className="font-semibold uppercase tracking-wider text-slate-400">{t('auth.email')}:</span> {payerEmail}
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t('auth.password')}</label>
            <input
              type="password"
              value={postPayPassword}
              onChange={(e) => setPostPayPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              autoComplete="new-password"
              className="w-full rounded-xl border border-bike-border bg-white px-3.5 py-2.5 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
            />
            <p className="mt-1 text-[11px] text-slate-400">{t('subscription.passwordMinHint')}</p>
          </div>
          {claimError && <p className="text-xs text-status-danger">{claimError}</p>}
          <button
            type="button"
            disabled={claimingAccount || postPayPassword.trim().length < 6}
            onClick={handleClaimAccount}
            className="min-h-[48px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
          >
            {claimingAccount ? t('subscription.claiming') : t('subscription.claimAndEnter')}
          </button>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-px flex-1 bg-bike-border" />
            {t('subscription.orLoginWithGoogle')}
            <span className="h-px flex-1 bg-bike-border" />
          </div>
          <button
            type="button"
            onClick={handleGoogleClaim}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-bike-border bg-white text-xs font-semibold text-bike-ink shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.8-.4-4.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.3 5.1 29.4 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.6 40.6 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.3 5.3C40.9 36.6 45 31 45 24c0-1.4-.1-2.8-.4-4.5z" />
            </svg>
            {t('auth.continueWithGoogle')}
          </button>
          <p className="text-[11px] text-slate-400">{t('subscription.googleSameEmailNote', { email: payerEmail })}</p>
        </>
      )}
    </div>
  )

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center bg-slate-900/50 sm:items-center" onClick={handleClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-bike-border bg-white p-5 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {view === 'plans' && (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-bike-ink">{t('subscription.title')}</h2>
              <button onClick={handleClose} className="text-2xl leading-none text-slate-400" aria-label={t('auth.close')}>
                ×
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-500">{t('subscription.subtitle')}</p>

            <div className="mb-4 flex overflow-hidden rounded-xl border border-bike-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 text-sm font-semibold transition ${billingCycle === 'monthly' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
              >
                {t('subscription.billingMonthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 text-sm font-semibold transition ${billingCycle === 'yearly' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
              >
                {t('subscription.billingYearly')}
              </button>
            </div>

            <div className="space-y-4">
              <PlanCard
                tier="free"
                currentTier={currentTier}
                badge={t('tier.free')}
                name={t('subscription.freeName')}
                tagline={t('subscription.freeTagline')}
                features={[t('subscription.freeFeature1'), t('subscription.freeFeature2'), t('subscription.freeFeature3')]}
                accent="border-bike-border"
                onActivate={() => {
                  if (checkDemoRestriction(t('subscription.freeName'))) return
                  void upgradeTier('free')
                }}
                t={t}
              />

              <PlanCard
                tier="pro"
                currentTier={currentTier}
                badge={t('tier.pro')}
                name={t('subscription.proName')}
                tagline={t('subscription.proTagline')}
                price={billingCycle === 'monthly' ? PLAN_PRICE.pro.monthly : PLAN_PRICE.pro.yearly}
                priceSuffix={billingCycle === 'monthly' ? t('subscription.perMonth') : t('subscription.perYear')}
                features={[
                  t('subscription.proFeature1'),
                  t('subscription.proFeature2'),
                  t('subscription.proFeature3'),
                  t('subscription.proFeature4'),
                ]}
                accent="border-bike-orange/50 bg-gradient-to-b from-orange-50 to-white"
                activateLabel={t('subscription.getPro')}
                onActivate={() => startCheckout('pro')}
                t={t}
              />

              <PlanCard
                tier="club"
                currentTier={currentTier}
                badge={t('tier.club')}
                name={t('subscription.clubName')}
                tagline={t('subscription.clubTagline')}
                price={PLAN_PRICE.club[billingCycle]}
                priceSuffix={billingCycle === 'monthly' ? t('subscription.perMonth') : t('subscription.perYear')}
                features={[t('subscription.clubFeature1'), t('subscription.clubFeature2'), t('subscription.clubFeature3')]}
                accent="border-bike-gold/50 bg-gradient-to-b from-amber-50 to-white"
                activateLabel={t('subscription.activateClub')}
                onActivate={() => startCheckout('club')}
                t={t}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-bike-border bg-slate-50 p-4">
              <p className="mb-2 text-sm font-bold text-bike-ink">{t('subscription.clubCodeTitle')}</p>
              <div className="flex gap-2">
                <input
                  value={clubCode}
                  onChange={(e) => setClubCode(e.target.value)}
                  placeholder={t('subscription.clubCodePlaceholder')}
                  className="flex-1 rounded-xl border border-bike-border bg-white px-3 py-2.5 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
                />
                <button onClick={handleRedeemCode} className="rounded-xl bg-bike-ink px-4 py-2.5 text-xs font-bold text-white active:scale-95">
                  {t('subscription.redeemCode')}
                </button>
              </div>
              {clubNotice && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-600" role="status">
                  <IconWhatsApp className="mt-px h-3.5 w-3.5 flex-shrink-0 text-emerald-600" strokeWidth={2.25} />
                  {clubNotice}
                </p>
              )}
            </div>
          </>
        )}

        {view === 'checkout' && (
          <>
            <div className="mb-1 flex items-center justify-between">
              <button onClick={() => setView('plans')} className="text-xs font-semibold text-slate-500">
                {t('convoy.back')}
              </button>
              <button onClick={handleClose} className="text-2xl leading-none text-slate-400" aria-label={t('auth.close')}>
                ×
              </button>
            </div>
            <h2 className="font-display text-lg font-bold text-bike-ink">
              {t(checkoutTier === 'pro' ? 'subscription.proName' : 'subscription.clubName')}
            </h2>
            <p className="mb-4 text-sm text-slate-500">{isGuest ? t('subscription.checkoutSubtitleGuest') : t('subscription.checkoutSubtitle')}</p>

            {isGuest && (
              <div className="mb-4 space-y-3 rounded-2xl border border-bike-border bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t('subscription.riderDataTitle')}</p>
                <button
                  type="button"
                  onClick={handleGoogleCheckout}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-bike-border bg-white py-3 text-sm font-bold text-bike-ink shadow-card transition active:scale-[0.98]"
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
                <p className="text-center text-[11px] text-slate-400">
                  {t('auth.googleConsentPrefix')}{' '}
                  <button type="button" onClick={() => setPrivacyModalOpen(true)} className="font-semibold text-bike-orange underline">
                    {t('auth.privacyPolicyLink')}
                  </button>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="h-px flex-1 bg-bike-border" />
                  {t('subscription.orFillYourData')}
                  <span className="h-px flex-1 bg-bike-border" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.name')}</label>
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t('auth.namePlaceholder')}
                    className="w-full rounded-xl border border-bike-border bg-white px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.email')}</label>
                  <input
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    type="email"
                    className="w-full rounded-xl border border-bike-border bg-white px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
                  />
                </div>
                <label className="flex cursor-pointer select-none items-start gap-2.5 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={guestAcceptTerms}
                    onChange={(e) => setGuestAcceptTerms(e.target.checked)}
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
              </div>
            )}

            <div className="mb-4 flex overflow-hidden rounded-xl border border-bike-border">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-2 text-sm font-semibold transition ${billingCycle === 'monthly' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
              >
                {t('subscription.billingMonthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`flex-1 py-2 text-sm font-semibold transition ${billingCycle === 'yearly' ? 'bg-bike-orange text-white' : 'bg-slate-50 text-slate-500'}`}
              >
                {t('subscription.billingYearly')}
              </button>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{t('subscription.paymentMethod')}</p>

            <button
              onClick={() => setPaymentMethod('qr')}
              className={`mb-3 flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${
                paymentMethod === 'qr' ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50'
              }`}
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <IconZap className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-800">{t('subscription.qrOptionTitle')}</p>
                <p className="text-[11px] font-semibold text-emerald-600">{t('subscription.qrOptionSubtitle')}</p>
              </div>
            </button>

            <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">{t('subscription.otherMethods')}</p>
            <div className="mb-4 grid grid-cols-3 gap-2">
              <MethodButton active={paymentMethod === 'nequi'} onClick={() => setPaymentMethod('nequi')} icon={IconPhone} label={t('subscription.methodNequi')} />
              <MethodButton active={paymentMethod === 'pse'} onClick={() => setPaymentMethod('pse')} icon={IconBank} label="PSE" />
              <MethodButton active={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')} icon={IconCard} label={t('subscription.methodCard')} />
            </div>

            {paymentMethod === 'qr' && (
              <div className="mb-4 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 text-center">
                <img
                  src="/images/qr-bancolombia.png"
                  alt={t('subscription.qrImageAlt')}
                  className="mx-auto h-48 w-48 rounded-2xl border-4 border-white object-cover shadow-xl"
                />
                <div className="flex items-center justify-center gap-3 text-xs font-bold text-emerald-700">
                  <a href="/images/qr-bancolombia.png" download className="underline underline-offset-2">
                    {t('subscription.qrDownload')}
                  </a>
                  <span className="text-emerald-300">·</span>
                  <a href="/images/qr-bancolombia.png" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {t('subscription.qrEnlarge')}
                  </a>
                </div>
                <p className="font-display text-sm font-bold text-bike-ink">{t('subscription.qrAmountLabel', { price })}</p>
                <ol className="space-y-2 text-left text-xs text-slate-600">
                  <li>1. {t('subscription.qrStep1')}</li>
                  <li>2. {t('subscription.qrStep2', { price })}</li>
                  <li>3. {t('subscription.qrStep3')}</li>
                </ol>
                <a
                  href={qrWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleQrReceiptClick}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
                >
                  <IconSend className="h-4 w-4" strokeWidth={2.25} />
                  {t('subscription.qrSendReceipt')}
                </a>
              </div>
            )}

            {checkoutError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-status-danger">{checkoutError}</p>}

            {paymentMethod === 'qr' ? (
              <p className="text-center text-[11px] text-slate-400">{t('subscription.qrActivationNote')}</p>
            ) : (
              <>
                <button
                  onClick={handlePay}
                  className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
                >
                  {t('subscription.payAndActivate', { price })}
                </button>
                <p className="mt-2 text-center text-[10px] text-slate-400">{t('subscription.checkoutDisclaimer')}</p>
              </>
            )}
          </>
        )}

        {view === 'processing' && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-bike-border border-t-bike-orange" />
            <p className="text-sm font-semibold text-slate-700">{t('subscription.processing')}</p>
            <p className="max-w-xs text-xs text-slate-400">{t('subscription.processingHint')}</p>
            <button
              type="button"
              onClick={cancelProcessing}
              className="mt-1 min-h-[44px] rounded-xl border border-bike-border px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              {t('subscription.cancelProcessing')}
            </button>
          </div>
        )}

        {view === 'qrPending' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <IconClock className="h-9 w-9" strokeWidth={2} />
            </span>
            <h2 className="font-display text-lg font-bold text-bike-ink">{t('subscription.qrPendingTitle')}</h2>
            <p className="max-w-xs text-sm text-slate-500">{t('subscription.qrPendingDesc')}</p>
            <div className="w-full rounded-xl border border-bike-border bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t('subscription.qrPendingReference')}</p>
              <p className="mt-0.5 break-all font-mono text-xs font-semibold text-bike-ink">{qrReference}</p>
            </div>
            {isGuest && claimAccountForm}
            <button onClick={handleClose} className="mt-3 min-h-[52px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white">
              {t('subscription.qrPendingClose')}
            </button>
          </div>
        )}

        {view === 'paymentPending' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <IconClock className="h-9 w-9" strokeWidth={2} />
            </span>
            <h2 className="font-display text-lg font-bold text-bike-ink">{t('subscription.paymentPendingTitle')}</h2>
            <p className="max-w-xs text-sm text-slate-500">{t('subscription.paymentPendingDesc', { email: payerEmail })}</p>
            {isGuest && claimAccountForm}
            <button onClick={handleClose} className="mt-3 min-h-[52px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white">
              {t('subscription.done')}
            </button>
          </div>
        )}

        {view === 'success' && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <IconCheckCircle className="h-9 w-9" strokeWidth={2} />
            </span>
            <h2 className="font-display text-lg font-bold text-bike-ink">{t('subscription.paymentApprovedTitle', { plan: planName })}</h2>

            {isGuest ? (
              accountPendingConfirmation ? (
                <p className="max-w-xs text-sm text-slate-500">{t('subscription.successConfirmEmail')}</p>
              ) : (
                <>
                  <p className="max-w-xs text-sm text-slate-500">{t('subscription.successGuestSubtitle', { email: payerEmail })}</p>
                  {claimAccountForm}
                </>
              )
            ) : (
              <>
                {activation === 'waiting' && (
                  <p className="flex items-center gap-2 text-sm text-slate-500" role="status">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-bike-border border-t-bike-orange" />
                    {t('subscription.activatingPlan')}
                  </p>
                )}
                {activation === 'active' && (
                  <p className="max-w-xs text-sm text-slate-500">
                    {t('subscription.successBody', { date: user?.subscriptionExpiresAt ? formatLongDate(user.subscriptionExpiresAt, lang) : '' })}
                  </p>
                )}
                {activation === 'delayed' && <p className="max-w-xs text-sm text-slate-500">{t('subscription.activationDelayed')}</p>}
                <button onClick={finishAndEnter} className="mt-3 min-h-[52px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white">
                  {topLevelMode === 'landing' ? t('subscription.goToDashboard') : t('subscription.done')}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MethodButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-xl border-2 py-3 text-[11px] font-bold transition ${
        active ? 'border-orange-600 bg-orange-50 text-slate-950' : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
      {label}
    </button>
  )
}

function PlanCard({
  tier,
  currentTier,
  badge,
  name,
  tagline,
  price,
  priceSuffix,
  features,
  accent,
  activateLabel,
  onActivate,
  t,
}: {
  tier: SubscriptionTier
  currentTier: SubscriptionTier
  badge: string
  name: string
  tagline: string
  price?: string
  priceSuffix?: string
  features: string[]
  accent: string
  activateLabel?: string
  onActivate: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}) {
  const isCurrent = tier === currentTier
  return (
    <div className={`rounded-2xl border p-4 ${accent}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{badge}</p>
        {isCurrent && <span className="text-[10px] font-bold uppercase tracking-wide text-status-ok">{t('subscription.currentPlan')}</span>}
      </div>
      <p className="mt-1 font-display text-lg font-black text-bike-ink">{name}</p>
      {price ? (
        <p className="text-sm text-slate-600">
          <span className="font-display text-xl font-black text-bike-ink">{price}</span> {priceSuffix}
        </p>
      ) : (
        <p className="text-sm text-slate-500">{tagline}</p>
      )}
      {price && <p className="mt-0.5 text-[11px] text-slate-400">{tagline}</p>}
      <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-1.5">
            <IconCheck className="mt-px h-3.5 w-3.5 flex-shrink-0 text-emerald-600" strokeWidth={3} />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onActivate}
        disabled={isCurrent}
        className="mt-3 min-h-[48px] w-full rounded-xl bg-orange-600 text-xs font-bold text-white transition hover:bg-orange-700 active:scale-[0.98] disabled:cursor-default disabled:bg-slate-200 disabled:text-slate-600"
      >
        {isCurrent ? t('subscription.activePlan') : activateLabel ?? t('subscription.activate')}
      </button>
    </div>
  )
}
