import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import LandingHeroTachometer from './LandingHeroTachometer'
import LandingStory from './LandingStory'
import LandingShowcase from './LandingShowcase'
import LandingPricing from './LandingPricing'
import LandingContact from './LandingContact'
import LandingChatbot from './LandingChatbot'
import InstallAppModal from '../common/InstallAppModal'
import SubscriptionModal from '../common/SubscriptionModal'
import PrivacyPolicyModal from '../common/PrivacyPolicyModal'
import Toast from '../common/Toast'
import { useScrollReveal, scrollRevealClass } from '../../hooks/useScrollReveal'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export default function LandingPage() {
  const { setTopLevelMode, setInstallModalOpen, setAuthModalOpen, setPrivacyModalOpen, requestAppAccess, user } = useApp()
  const [chatOpen, setChatOpen] = useState(false)
  const heroImage = useScrollReveal<HTMLDivElement>()

  function enterApp() {
    requestAppAccess(() => setTopLevelMode('app'))
  }

  function handleHeaderCta() {
    requestAppAccess(() => {
      setTopLevelMode('app')
      if (!user?.isLoggedIn) setAuthModalOpen(true)
    })
  }

  return (
    <div className="relative min-h-[100dvh] w-full bg-bike-bg font-body text-slate-700">
      <header className="sticky top-0 z-40 border-b border-bike-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/images/app-icon.jpg"
              alt="Bike Tracker"
              className="h-11 w-11 rounded-2xl border-2 border-bike-orange object-cover shadow-glow-orange"
            />
            <div className="leading-tight">
              <p className="font-display text-base font-black tracking-tight text-bike-ink">Bike Tracker</p>
              <p className="font-body text-xs font-semibold text-slate-500">
                por <span className="font-bold text-bike-orange">LC TECH</span>{' '}
                <span className="hidden sm:inline">· Tecnología inteligente que te respalda.</span>
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 sm:flex">
            <button onClick={() => scrollToId('benefits')} className="transition hover:text-bike-ink">
              La Experiencia
            </button>
            <button onClick={() => scrollToId('ride-mode')} className="transition hover:text-bike-ink">
              El Convoy
            </button>
            <button onClick={() => scrollToId('pricing')} className="transition hover:text-bike-ink">
              Planes
            </button>
            <button onClick={() => setChatOpen(true)} className="transition hover:text-bike-ink">
              Asistente AI
            </button>
            <button onClick={() => scrollToId('contact')} className="transition hover:text-bike-ink">
              Contacto
            </button>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={() => setInstallModalOpen(true)}
              className="inline-flex items-center rounded-xl border border-bike-border bg-white px-2.5 py-2.5 text-xs font-bold text-bike-ink shadow-card transition hover:bg-slate-50 sm:px-3"
              title="Instalar Bike Tracker"
              aria-label="Instalar Bike Tracker"
            >
              <span aria-hidden="true">📲</span>
              <span className="hidden sm:ml-1.5 sm:inline">Instalar</span>
            </button>
            <button
              onClick={handleHeaderCta}
              className="rounded-xl bg-bike-orange px-4 py-2.5 text-xs font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-95 sm:px-5 sm:text-sm"
            >
              {user?.isLoggedIn ? '🚀 Mi Tablero' : '🔑 Iniciar Sesión'}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-5xl px-6 pb-16 pt-14 text-center sm:pt-20">
          <span className="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bike-orange">
            ⚡ La Libertad de Rodar con Tranquilidad
          </span>

          <h1 className="mt-5 font-display text-3xl font-black leading-tight text-bike-ink sm:text-5xl">
            Salimos juntos, rodamos juntos,
            <br className="hidden sm:block" /> volvemos todos juntos a casa.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm text-slate-600 sm:text-base">
            Diseñada por y para moteros. La plataforma que conecta al líder, al piloto guardián y a cada piloto en
            tiempo real para que nadie se quede atrás ni pierda la ruta.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={enterApp}
              className="w-full rounded-full bg-bike-orange px-6 py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-95 sm:w-auto"
            >
              🔥 Iniciar Rodada Gratis
            </button>
            <button
              onClick={() => scrollToId('pricing')}
              className="w-full rounded-full border border-bike-border bg-white px-6 py-3.5 text-sm font-bold text-bike-ink shadow-card transition hover:bg-slate-50 active:scale-95 sm:w-auto"
            >
              ⚡ Ver Planes y Precios
            </button>
          </div>

          <div
            ref={heroImage.ref}
            className={`mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-bike-border shadow-soft ${scrollRevealClass(heroImage.visible)}`}
          >
            <img
              src="/images/convoy-journey.jpg"
              alt="Convoy de moteros rodando en curvas de montaña"
              className="h-56 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] sm:h-72"
            />
          </div>

          <div className="mx-auto mt-6 max-w-3xl">
            <LandingHeroTachometer />
          </div>
        </section>

        <LandingStory />
        <LandingShowcase />
        <LandingPricing />
        <LandingContact />
      </main>

      <footer className="border-t border-bike-border px-6 py-10 text-center">
        <p className="text-xs font-semibold text-slate-500">🏍️ Bike Tracker — LC Tech</p>
        <p className="mt-1 text-[11px] text-slate-400">Tecnología inteligente que te respalda. · {new Date().getFullYear()}</p>
        <p className="mt-1 text-[11px] text-slate-400">
          <a href="mailto:leecastro.tech@gmail.com?subject=Consulta%20Bike%20Tracker" className="hover:text-bike-ink hover:underline">
            📧 leecastro.tech@gmail.com
          </a>{' '}
          ·{' '}
          <a
            href="https://wa.me/573505208592?text=Hola%20Bike%20Tracker%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20app%20y%20los%20planes%20Pro"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-bike-ink hover:underline"
          >
            📲 WhatsApp Oficial
          </a>
        </p>
        <p className="mt-3 text-[11px]">
          <button onClick={() => setPrivacyModalOpen(true)} className="font-semibold text-slate-500 hover:text-bike-ink hover:underline">
            🔒 Política de Privacidad &amp; Datos (Ley 1581)
          </button>
        </p>
      </footer>

      <LandingChatbot open={chatOpen} onOpenChange={setChatOpen} />
      <InstallAppModal />
      <SubscriptionModal />
      <PrivacyPolicyModal />
      <Toast />
    </div>
  )
}
