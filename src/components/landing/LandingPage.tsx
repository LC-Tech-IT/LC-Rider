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
import { IconArrowRight, IconDownload, IconLock, IconMail, IconWhatsApp } from './LandingIcons'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

const NAV_LINKS: { label: string; target: string }[] = [
  { label: 'La Experiencia', target: 'benefits' },
  { label: 'El Convoy', target: 'ride-mode' },
  { label: 'Planes', target: 'pricing' },
  { label: 'Contacto', target: 'contact' },
]

const HERO_METRICS = [
  { value: '11.8M+', label: 'Parque de motocicletas' },
  { value: '99.9%', label: 'Uptime Cloudflare Global Edge' },
  { value: '100%', label: 'Compatible intercomunicadores Bluetooth' },
  { value: 'Zero', label: 'Distracción táctil en ruta' },
]

const WHATSAPP_URL =
  'https://wa.me/573505208592?text=Hola%20Bike%20Tracker%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20app%20y%20los%20planes%20Pro'

export default function LandingPage() {
  const { setTopLevelMode, setInstallModalOpen, setAuthModalOpen, setPrivacyModalOpen, requestAppAccess, user } = useApp()
  const [chatOpen, setChatOpen] = useState(false)
  const heroCluster = useScrollReveal<HTMLDivElement>()

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
    <div className="relative min-h-[100dvh] w-full bg-[#070A10] font-sans text-slate-300 antialiased">
      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070A10]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/app-icon.jpg"
              alt="Bike Tracker"
              className="h-10 w-10 flex-shrink-0 rounded-xl border border-white/10 object-cover shadow-md"
            />
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <span className="font-sans text-base font-extrabold tracking-tight text-white">Bike Tracker</span>
                <span className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:inline-block">
                  Telemetry
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                por <span className="font-semibold text-slate-200">LC SyncTech</span>
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <button
                key={link.target}
                onClick={() => scrollToId(link.target)}
                className="text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => setChatOpen(true)}
              className="text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-white"
            >
              Asistente AI
            </button>
          </nav>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={() => setInstallModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white sm:px-3"
              title="Instalar Bike Tracker"
              aria-label="Instalar Bike Tracker"
            >
              <IconDownload className="h-4 w-4" />
              <span className="hidden sm:inline">Instalar</span>
            </button>
            <button
              onClick={handleHeaderCta}
              className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-orange-500 active:scale-95"
            >
              {user?.isLoggedIn ? 'Mi Tablero' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-[#070A10] to-[#070A10]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500" />
              Sistema de Telemetría &amp; Navegación Grupal
            </div>

            <h1 className="mt-6 font-sans text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.08]">
              Salimos juntos.
              <br />
              Rodamos juntos.
              <br />
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300 bg-clip-text text-transparent">
                Volvemos todos a casa.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base font-normal leading-relaxed text-slate-400 sm:text-lg">
              La plataforma de telemetría de alta disponibilidad diseñada por y para motociclistas. Conecta al líder, al
              piloto guardián y al convoy en tiempo real con cero distracción en el manillar.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={enterApp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-500 active:scale-95 sm:w-auto"
              >
                Iniciar Rodada Gratis
                <IconArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollToId('pricing')}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white active:scale-95 sm:w-auto"
              >
                Ver Planes y Precios
              </button>
            </div>

            {/* Franja de métricas */}
            <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] lg:grid-cols-4">
              {HERO_METRICS.map((metric, index) => (
                <div
                  key={metric.label}
                  className={`px-4 py-5 text-center ${index % 2 === 1 ? 'border-l border-white/[0.08]' : ''} ${
                    index >= 2 ? 'border-t border-white/[0.08] lg:border-t-0' : ''
                  } ${index === 2 ? 'lg:border-l' : ''}`}
                >
                  <dt className="sr-only">{metric.label}</dt>
                  <dd className="font-sans text-2xl font-extrabold tabular-nums tracking-tight text-white sm:text-3xl">
                    {metric.value}
                  </dd>
                  <dd className="mt-1 text-[11px] font-medium uppercase leading-snug tracking-wider text-slate-500">
                    {metric.label}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Instrument Cluster: fotografía de ruta + tacómetro en un único bisel */}
            <div
              ref={heroCluster.ref}
              className={`mx-auto mt-14 max-w-5xl rounded-3xl border border-white/10 bg-slate-900/50 p-2 text-left shadow-2xl shadow-black/40 backdrop-blur sm:p-3 ${scrollRevealClass(heroCluster.visible)}`}
            >
              <div className="flex items-center justify-between px-3 pb-2.5 pt-1.5 sm:px-4">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Live Telemetry</span>
                </div>
                <span className="font-mono text-[10px] tabular-nums tracking-wider text-slate-500">CONVOY · 05 PILOTOS</span>
              </div>

              <div className="grid gap-2 sm:gap-3 lg:grid-cols-[1.45fr_1fr]">
                <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] lg:min-h-[380px]">
                  <img
                    src="/images/convoy-journey.jpg"
                    alt="Convoy de moteros rodando en curvas de montaña"
                    className="h-60 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] sm:h-80 lg:absolute lg:inset-0 lg:h-full"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070A10]/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 grid grid-cols-3 gap-px border-t border-white/10 bg-white/[0.06] backdrop-blur-md">
                    {[
                      { label: 'Velocidad', value: '68', unit: 'km/h' },
                      { label: 'Distancia', value: '124.6', unit: 'km' },
                      { label: 'Al líder', value: '320', unit: 'm' },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#070A10]/70 px-3 py-2.5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                        <p className="mt-0.5 flex items-baseline gap-1">
                          <span className="font-display text-lg font-bold tabular-nums text-white">{item.value}</span>
                          <span className="text-[10px] text-slate-500">{item.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <LandingHeroTachometer />
              </div>
            </div>
          </div>
        </section>

        <LandingStory />
        <LandingShowcase />
        <LandingPricing />
        <LandingContact />
      </main>

      <footer className="border-t border-white/[0.08] bg-[#05070C]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <img src="/images/app-icon.jpg" alt="Bike Tracker" className="h-9 w-9 rounded-lg border border-white/10 object-cover" />
              <div>
                <p className="text-sm font-extrabold tracking-tight text-white">Bike Tracker</p>
                <p className="text-[11px] text-slate-500">por LC SyncTech</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Telemetría de convoy, navegación y seguridad en tiempo real para quienes ruedan en grupo.
            </p>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <a
              href="mailto:contacto@lcsynctech.com?subject=Consulta%20Bike%20Tracker"
              className="inline-flex items-center gap-2.5 text-slate-400 transition hover:text-white"
            >
              <IconMail className="h-4 w-4 text-slate-500" />
              contacto@lcsynctech.com
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-slate-400 transition hover:text-white"
            >
              <IconWhatsApp className="h-4 w-4 text-slate-500" />
              WhatsApp Oficial
            </a>
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="inline-flex items-center gap-2.5 text-left text-slate-400 transition hover:text-white"
            >
              <IconLock className="h-4 w-4 text-slate-500" />
              Política de Tratamiento de Datos (Ley 1581)
            </button>
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-4 py-5 text-center text-[11px] text-slate-600 sm:px-6">
          © {new Date().getFullYear()} LC SyncTech · Tecnología inteligente que te respalda. Todos los derechos reservados.
        </div>
      </footer>

      <LandingChatbot open={chatOpen} onOpenChange={setChatOpen} />
      <InstallAppModal />
      <SubscriptionModal />
      <PrivacyPolicyModal />
      <Toast />
    </div>
  )
}
