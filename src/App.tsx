import type { ReactNode } from 'react'
import { useApp } from './context/AppContext'
import { useWakeLock } from './hooks/useWakeLock'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import BottomNav from './components/common/BottomNav'
import Toast from './components/common/Toast'
import UpdateBanner from './components/common/UpdateBanner'
import CockpitView from './components/cockpit/CockpitView'
import ConvoyMap from './components/map/ConvoyMap'
import GarageView from './components/garage/GarageView'
import ConvoyLobby from './components/convoy/ConvoyLobby'
import RoutePlannerModal from './components/navigation/RoutePlannerModal'
import SOSModal from './components/emergency/SOSModal'
import AuthModal from './components/auth/AuthModal'
import AddVehicleModal from './components/garage/AddVehicleModal'
import WelcomeAuthScreen from './components/auth/WelcomeAuthScreen'
import OnboardingWizard from './components/auth/OnboardingWizard'
import EditProfileModal from './components/auth/EditProfileModal'
import NotificationModal from './components/common/NotificationModal'
import SubscriptionModal from './components/common/SubscriptionModal'
import ConcurrentSessionModal from './components/common/ConcurrentSessionModal'
import PrivacyPolicyModal from './components/common/PrivacyPolicyModal'
import LandingPage from './components/landing/LandingPage'

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-slate-200 text-bike-ink">
      <div className="relative flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
        {children}
      </div>
    </div>
  )
}

export default function App() {
  const { view, user, vehicles, topLevelMode, rideActive } = useApp()

  // Pantalla siempre activa durante la rodada o en las vistas de Tablero/Mapa, para que el velocímetro y la
  // navegación turn-by-turn nunca se pierdan por un bloqueo automático de pantalla a mitad de curva.
  useWakeLock(rideActive || view === 'cockpit' || view === 'map')

  if (topLevelMode === 'landing') {
    return <LandingPage />
  }

  if (!user || !user.isLoggedIn) {
    return (
      <PhoneFrame>
        <WelcomeAuthScreen />
        <AuthModal />
        <SubscriptionModal />
        <PrivacyPolicyModal />
        <Toast />
      </PhoneFrame>
    )
  }

  if (vehicles.length === 0) {
    return (
      <PhoneFrame>
        <OnboardingWizard />
        <SubscriptionModal />
        <ConcurrentSessionModal />
        <PrivacyPolicyModal />
        <Toast />
      </PhoneFrame>
    )
  }

  return (
    <PhoneFrame>
      <Header />

      <main className="relative flex-1 overflow-hidden">
        {view === 'cockpit' && <CockpitView />}
        {view === 'map' && <ConvoyMap />}
        {view === 'garage' && <GarageView />}
        {view === 'convoy' && <ConvoyLobby />}
      </main>

      <BottomNav />

      <Sidebar />
      <RoutePlannerModal />
      <SOSModal />
      <EditProfileModal />
      <AddVehicleModal />
      <NotificationModal />
      <SubscriptionModal />
      <ConcurrentSessionModal />
      <PrivacyPolicyModal />
      <Toast />
      <UpdateBanner />
    </PhoneFrame>
  )
}
