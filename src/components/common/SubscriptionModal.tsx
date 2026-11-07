import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { formatLongDate } from '../../utils/formatDate'
import { buildPaymentReference, getPlanAmountCOP, openWompiCheckout } from '../../services/paymentService'
import { clearPendingCheckout, savePendingCheckout } from '../../utils/storage'
import type { ComponentType, SVGProps } from 'react'
import type { SubscriptionTier } from '../../types'
import { IconBank, IconCard, IconCheck, IconCheckCircle, IconClock, IconPhone, IconSend, IconWhatsApp, IconZap } from './Icons'

type PaymentMethod = 'nequi' | 'pse' | 'card' | 'qr'
type CheckoutView = 'plans' | 'checkout' | 'processing' | 'success' | 'qrPending'

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
    supabaseSignUp,
    signInWithGoogle,
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
  const [guestPassword, setGuestPassword] = useState('')
  const [guestAcceptTerms, setGuestAcceptTerms] = useState(false)
  const isGuest = !user?.isLoggedIn

  useEffect(() => {
    if (!subscriptionModalOpen) return
    setClubNotice('')
    setCheckoutError('')
    setGuestName('')
    setGuestEmail('')
    setGuestPassword('')
    setGuestAcceptTerms(false)
    setAccountPendingConfirmation(false)
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

  async function handlePay() {
    setCheckoutError('')
    if (isGuest && (!guestName.trim() || !guestEmail.trim() || guestPassword.trim().length < 6)) {
      setCheckoutError(t('subscription.errorGuestFields'))
      return
    }
    if (isGuest && !guestAcceptTerms) {
      setCheckoutError(t('auth.errorAcceptTerms'))
      return
    }

    setView('processing')
    try {
      let payerId = user?.id
      // Checkout de invitado: crea la cuenta en el mismo paso. Un aviso de "confirma tu correo" no bloquea el pago:
      // la cuenta ya existe y la referencia lleva su id para que el webhook active el plan sobre ella. Un error real
      // de registro (correo ya usado, registro deshabilitado) sí detiene el pago: nadie paga sin cuenta asociada.
      if (isGuest) {
        const account = await supabaseSignUp({
          name: guestName.trim(),
          lastName: '',
          gender: undefined,
          phone: '',
          email: guestEmail.trim(),
          password: guestPassword,
          remember: true,
          allowPendingConfirmation: true,
        })
        payerId = account.userId
        setAccountPendingConfirmation(account.pendingConfirmation)
      }

      const amount = getPlanAmountCOP(checkoutTier, billingCycle)
      const reference = buildPaymentReference(payerId ?? 'invitado')
      const result = await openWompiCheckout({
        amountInCOP: amount,
        reference,
        customerEmail: (user?.email || guestEmail).trim(),
        customerFullName: (user?.name || guestName).trim(),
      })
      if (result.status === 'APPROVED') {
        // La activación autoritativa la hace el webhook `wompi-webhook` (service_role). upgradeTier refleja el plan
        // al instante en la UI; la siguiente sincronización lo alinea con lo que haya escrito el backend.
        await upgradeTier(checkoutTier, billingCycle)
        setView('success')
      } else {
        setCheckoutError(t('subscription.errorPaymentDeclined'))
        setView('checkout')
      }
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t('auth.errorGeneric'))
      setView('checkout')
    }
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

  /** Pago por QR: enviar el comprobante por WhatsApp NO activa el plan (ni en memoria ni en Supabase). El modal
   *  pasa a "Comprobante en revisión" y el equipo activa el plan —con el mes de regalo si es anual— solo tras
   *  verificar la transferencia. Si el usuario llegó como invitado, primero se crea su cuenta real. */
  async function handleQrReceiptClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isGuest && (!guestName.trim() || !guestEmail.trim() || guestPassword.trim().length < 6)) {
      e.preventDefault()
      setCheckoutError(t('subscription.errorGuestFields'))
      return
    }
    if (isGuest && !guestAcceptTerms) {
      e.preventDefault()
      setCheckoutError(t('auth.errorAcceptTerms'))
      return
    }
    setCheckoutError('')
    try {
      if (isGuest) {
        await supabaseSignUp({
          name: guestName.trim(),
          lastName: '',
          gender: undefined,
          phone: '',
          email: guestEmail.trim(),
          password: guestPassword,
          remember: true,
          allowPendingConfirmation: true,
        })
      }
      setView('qrPending')
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : t('auth.errorGeneric'))
    }
  }

  function handleClose() {
    setSubscriptionModalOpen(false)
  }

  const price = PLAN_PRICE[checkoutTier][billingCycle]
  const qrPlanName = t(checkoutTier === 'pro' ? 'subscription.proName' : 'subscription.clubName')
  const qrWhatsappUrl = `https://wa.me/${WHATSAPP_SALES_NUMBER}?text=${encodeURIComponent(
    t('subscription.qrWhatsappMessage', { plan: qrPlanName, price, reference: qrReference }),
  )}`

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
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">{t('auth.password')}</label>
                  <input
                    value={guestPassword}
                    onChange={(e) => setGuestPassword(e.target.value)}
                    placeholder={t('auth.passwordPlaceholder')}
                    type="password"
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
          <div className="flex flex-col items-center gap-4 py-14 text-center">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-bike-border border-t-bike-orange" />
            <p className="text-sm font-semibold text-slate-600">{t('subscription.processing')}</p>
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
            <button onClick={handleClose} className="mt-3 min-h-[52px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white">
              {t('subscription.qrPendingClose')}
            </button>
          </div>
        )}

        {view === 'success' && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <IconCheckCircle className="h-9 w-9" strokeWidth={2} />
            </span>
            <h2 className="font-display text-lg font-bold text-bike-ink">
              {t('subscription.successTitle', { plan: t(checkoutTier === 'pro' ? 'subscription.proName' : 'subscription.clubName') })}
            </h2>
            <p className="max-w-xs text-sm text-slate-500">
              {accountPendingConfirmation
                ? t('subscription.successConfirmEmail')
                : t('subscription.successBody', { date: user?.subscriptionExpiresAt ? formatLongDate(user.subscriptionExpiresAt, lang) : '' })}
            </p>
            <button onClick={handleClose} className="mt-3 min-h-[52px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white">
              {t('subscription.done')}
            </button>
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
