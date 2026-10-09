import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type {
  AppView,
  ConvoyAlertEntry,
  ConvoyMember,
  ConvoyRoom,
  Lang,
  LatLng,
  NavigationState,
  RouteInfo,
  SOSAlert,
  SubscriptionTier,
  TopLevelMode,
  UserProfile,
  Vehicle,
} from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { fetchRoute, PRESET_ROUTES } from '../services/routingService'
import { supabase } from '../services/supabaseClient'
import { announceIntercom, announceTurnInstruction } from '../services/voiceGuidanceService'
import { createInitialConvoyMembers, createSoloMember, resetMembersToPosition, tickConvoySimulation } from '../utils/mockConvoySimulator'
import { playConfirmBeep, startSiren, stopSiren, vibrateAlert, vibrateStop } from '../utils/audioAlert'
import { translateAuthError } from '../utils/authErrorTranslator'
import { translate } from '../utils/i18n'
import { isStandaloneApp } from '../utils/navigationHelper'
import { getAccount, getCurrentUserEmail, loadStorage, saveAccount, saveStorage, setCurrentUserEmail } from '../utils/storage'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DEFAULT_POSITION: LatLng = { lat: 4.711, lng: -74.0721 }

/** Matriz oficial de monetización: cupos de convoy y garaje por nivel de suscripción. */
const TIER_CONVOY_LIMIT: Record<SubscriptionTier, number> = { free: 3, pro: 999, club: 6 }
const TIER_VEHICLE_LIMIT: Record<SubscriptionTier, number> = { free: 1, pro: 5, club: 5 }

/** Códigos de canje de Biker Club (demo): activan el tier 'club' con el nombre del club asociado. */
const CLUB_CODES: Record<string, string> = {
  'CLUB-YAMAHA': 'Yamaha Riders Club',
  'BIKER-CREW': 'Biker Crew',
  'CLUB-BMW': 'BMW Motorrad Club',
}

function daysUntil(dateIso: string): number {
  const target = new Date(dateIso).getTime()
  const now = Date.now()
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

function futureDate(daysFromNow: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().slice(0, 10)
}

const DEMO_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    plate: 'MCP412',
    brand: 'Toyota',
    model: 'Hilux',
    category: 'car',
    type: 'carro',
    color: '#0066FF',
    avatarEmoji: '🚙',
    soat: { expiresAt: futureDate(45) },
    tecnomecanica: { expiresAt: futureDate(12) },
    planActive: true,
    planExpiresAt: futureDate(90),
  },
  {
    id: 'v2',
    plate: 'RTX880',
    brand: 'Yamaha',
    model: 'MT-09',
    category: 'sport',
    type: 'moto',
    color: '#00E5FF',
    avatarEmoji: '🏍️',
    soat: { expiresAt: futureDate(-5) },
    tecnomecanica: { expiresAt: futureDate(150) },
    planActive: false,
  },
  {
    id: 'v3',
    plate: 'XKT205',
    brand: 'Kawasaki',
    model: 'Versys 650',
    category: 'trail',
    type: 'moto',
    color: '#FF3B30',
    avatarEmoji: '🏍️',
    soat: { expiresAt: futureDate(210) },
    tecnomecanica: { expiresAt: futureDate(200) },
    planActive: true,
    planExpiresAt: futureDate(30),
  },
]

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function buildProfile(
  name: string,
  email: string,
  avatarUrl: string,
  authProvider: 'google' | 'email',
  tier: SubscriptionTier = 'free',
): UserProfile {
  return {
    id: generateId('user'),
    name,
    email: email.toLowerCase(),
    avatarUrl,
    isLoggedIn: true,
    authProvider,
    registeredAt: Date.now(),
    tier,
  }
}

/** Restores the last active session (if any) from its isolated per-account storage. */
function loadInitialSession(): { user: UserProfile | null; vehicles: Vehicle[]; activeVehicleId: string } {
  const email = getCurrentUserEmail()
  const account = email ? getAccount(email) : null
  if (!account) return { user: null, vehicles: [], activeVehicleId: '' }
  return { user: account.user, vehicles: account.vehicles, activeVehicleId: account.activeVehicleId }
}

interface AppContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: string, vars?: Record<string, string | number>) => string

  view: AppView
  setView: (view: AppView) => void

  topLevelMode: TopLevelMode
  setTopLevelMode: (mode: TopLevelMode) => void

  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  user: UserProfile | null
  authModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
  editProfileModalOpen: boolean
  setEditProfileModalOpen: (open: boolean) => void
  loginDemo: () => void
  isDemoUser: boolean
  checkDemoRestriction: (actionName: string) => boolean
  signInWithGoogle: () => Promise<void>
  supabaseSignIn: (email: string, password: string, remember?: boolean) => Promise<void>
  supabaseSignUp: (payload: {
    name: string
    lastName: string
    gender: UserProfile['gender']
    phone: string
    email: string
    password: string
    remember?: boolean
  }) => Promise<void>
  updateProfile: (partial: Partial<Pick<UserProfile, 'name' | 'avatarUrl' | 'gender' | 'age'>>) => void
  logout: () => void

  subscriptionModalOpen: boolean
  setSubscriptionModalOpen: (open: boolean) => void
  subscriptionCheckoutTarget: SubscriptionTier | null
  subscriptionCheckoutBillingCycle: 'monthly' | 'yearly'
  openSubscriptionCheckout: (tier?: SubscriptionTier, billingCycle?: 'monthly' | 'yearly') => void
  upgradeTier: (tier: SubscriptionTier, billingCycle?: 'monthly' | 'yearly') => void
  redeemClubCode: (code: string) => string | null
  vehicleLimit: number
  convoyMemberLimit: number

  vehicles: Vehicle[]
  activeVehicleId: string
  setActiveVehicleId: (id: string) => void
  activeVehicle: Vehicle
  addVehicleModalOpen: boolean
  setAddVehicleModalOpen: (open: boolean) => void
  addVehicle: (vehicle: Vehicle, setActive: boolean) => void
  deleteVehicle: (vehicleId: string) => void
  renewPlan: (vehicleId: string) => void
  vehicleDocStatus: (dateIso: string) => { status: 'ok' | 'warning' | 'expired'; days: number }

  navigation: NavigationState
  planRoute: (origin: LatLng, destination: LatLng, originLabel: string, destinationLabel: string) => Promise<void>
  clearRoute: () => void
  routePlannerOpen: boolean
  setRoutePlannerOpen: (open: boolean) => void

  convoyMembers: ConvoyMember[]
  convoyRoom: ConvoyRoom | null
  createConvoyRoom: (name: string, role: ConvoyMember['role']) => void
  joinConvoyRoom: (pin: string, name: string, role: ConvoyMember['role']) => void
  leaveConvoyRoom: () => void

  rideActive: boolean
  simulationRunning: boolean
  startRide: () => void
  pauseRide: () => void
  finalizeRide: () => void
  simulationSpeed: number
  setSimulationSpeed: (speed: number) => void

  currentSpeedKmh: number
  elapsedSeconds: number
  distanceTraveledKm: number
  usingRealGps: boolean

  sosActive: boolean
  sosAlerts: SOSAlert[]
  triggerSOS: () => void
  cancelSOS: () => void

  convoyAlerts: ConvoyAlertEntry[]
  addConvoyAlert: (type: string, message: string) => void

  notificationModalOpen: boolean
  setNotificationModalOpen: (open: boolean) => void
  unreadNotificationsCount: number
  markNotificationsRead: () => void
  clearAllNotifications: () => void

  toastMessage: string | null
  showToast: (message: string) => void

  isOnline: boolean

  installModalOpen: boolean
  setInstallModalOpen: (open: boolean) => void
  canInstallNatively: boolean
  isIosDevice: boolean
  isStandalone: boolean
  triggerNativeInstall: () => Promise<void>
  requestAppAccess: (action: () => void) => void
  continueToApp: () => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => loadStorage<Lang>('lang', 'es'))
  const [view, setView] = useState<AppView>('cockpit')
  const [topLevelMode, setTopLevelMode] = useState<TopLevelMode>(() => (isStandaloneApp() ? 'app' : 'landing'))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [user, setUser] = useState<UserProfile | null>(() => loadInitialSession().user)
  const userRef = useRef<UserProfile | null>(user)
  useEffect(() => {
    userRef.current = user
  }, [user])
  const isDemoUser = user?.email === 'demo@biketracker.app'
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false)
  const [addVehicleModalOpen, setAddVehicleModalOpen] = useState(false)
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false)
  const [subscriptionCheckoutTarget, setSubscriptionCheckoutTarget] = useState<SubscriptionTier | null>(null)
  const [subscriptionCheckoutBillingCycle, setSubscriptionCheckoutBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  /** Abre el modal de suscripción; si se indica un tier de pago, salta directo al checkout de ese plan
   *  (usado por "Obtener Convoy Pro" / "Activar Biker Club" en la Landing y por "Renovar Suscripción"). El
   *  ciclo de facturación es opcional: permite que, por ejemplo, la tarjeta "Convoy Pro Anual" de la Landing
   *  abra el checkout ya posicionado en el ciclo anual, en vez de forzar al usuario a cambiarlo manualmente. */
  const openSubscriptionCheckout = useCallback((tier?: SubscriptionTier, billingCycle?: 'monthly' | 'yearly') => {
    setSubscriptionCheckoutTarget(tier ?? null)
    if (billingCycle) setSubscriptionCheckoutBillingCycle(billingCycle)
    setSubscriptionModalOpen(true)
  }, [])

  const [vehicleDocs, setVehicleDocs] = useState<Vehicle[]>(() => loadInitialSession().vehicles)
  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => loadInitialSession().activeVehicleId)

  const [navigation, setNavigation] = useState<NavigationState>({
    status: 'idle',
    route: null,
    currentStepIndex: 0,
  })
  const [routePlannerOpen, setRoutePlannerOpen] = useState(false)

  const [convoyMembers, setConvoyMembers] = useState<ConvoyMember[]>(() =>
    loadInitialSession().user?.email === 'demo@biketracker.app'
      ? createInitialConvoyMembers(DEFAULT_POSITION, DEMO_VEHICLES[0].plate)
      : createSoloMember(DEFAULT_POSITION),
  )
  const [convoyRoom, setConvoyRoom] = useState<ConvoyRoom | null>(null)
  const convoyChannelRef = useRef<RealtimeChannel | null>(null)

  const [rideActive, setRideActive] = useState(false)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState(8)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [distanceTraveledKm, setDistanceTraveledKm] = useState(0)
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0)

  const [sosActive, setSosActive] = useState(false)
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([])
  const [convoyAlerts, setConvoyAlerts] = useState<ConvoyAlertEntry[]>([])

  const [notificationModalOpen, setNotificationModalOpen] = useState(false)
  const [notificationsLastReadAt, setNotificationsLastReadAt] = useState(0)
  const [rememberMe, setRememberMe] = useState(true)

  const [usingRealGps, setUsingRealGps] = useState(false)
  const gpsWatchIdRef = useRef<number | null>(null)
  const spokenStepRef = useRef<number>(-1)
  const announcedLaggardsRef = useRef<Set<string>>(new Set())
  const convoyMembersRef = useRef<ConvoyMember[]>(convoyMembers)
  useEffect(() => {
    convoyMembersRef.current = convoyMembers
  }, [convoyMembers])

  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  // --- Resiliencia de conectividad: expone isOnline para mostrar un aviso no intrusivo en túneles o zonas
  // sin señal, sin congelar la UI ni romper la sesión (la rodada y el convoy simplemente dejan de transmitir
  // hasta que vuelve la red). ---
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const [installModalOpen, setInstallModalOpen] = useState(false)
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const isIosDevice = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    setIsStandalone(standaloneQuery.matches)
    const handleStandaloneChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches)
    standaloneQuery.addEventListener('change', handleStandaloneChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      standaloneQuery.removeEventListener('change', handleStandaloneChange)
    }
  }, [])

  const triggerNativeInstall = useCallback(async () => {
    if (!deferredInstallPrompt) return
    await deferredInstallPrompt.prompt()
    await deferredInstallPrompt.userChoice
    setDeferredInstallPrompt(null)
    setInstallModalOpen(false)
  }, [deferredInstallPrompt])

  // --- Separación Landing / App: todo CTA de la Landing que intenta entrar al tablero pasa por aquí. En
  // navegador web (no instalada), la acción queda en espera y se abre el modal de acceso/descarga en vez de
  // saltar directo a la app; en la app ya instalada (PWA standalone o APK), entra de inmediato. ---
  const pendingAppActionRef = useRef<(() => void) | null>(null)

  const requestAppAccess = useCallback((action: () => void) => {
    if (isStandaloneApp()) {
      action()
      return
    }
    pendingAppActionRef.current = action
    setInstallModalOpen(true)
  }, [])

  /** Ejecuta la acción de entrada a la app que quedó pendiente (o, si el modal se abrió sin una, entra
   *  directo al tablero) y cierra el modal. La usan tanto "Ya tengo la App" como "Continuar en versión web",
   *  ya que ninguna puede forzar el lanzamiento real de una PWA/APK instalada desde el navegador. */
  const continueToApp = useCallback(() => {
    const action = pendingAppActionRef.current
    pendingAppActionRef.current = null
    setInstallModalOpen(false)
    if (action) {
      action()
    } else {
      setTopLevelMode('app')
    }
  }, [])

  const simIntervalRef = useRef<number | null>(null)

  const activeVehicle = vehicleDocs.find((v) => v.id === activeVehicleId) ?? vehicleDocs[0] ?? DEMO_VEHICLES[0]
  const vehicleLimit = TIER_VEHICLE_LIMIT[user?.tier ?? 'free']
  const convoyMemberLimit = TIER_CONVOY_LIMIT[user?.tier ?? 'free']

  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    saveStorage('lang', next)
  }, [])

  const showToast = useCallback((message: string) => {
    setToastMessage(message)
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 3000)
    if ('vibrate' in navigator) navigator.vibrate(60)
  }, [])

  // --- Persistencia en localStorage, aislada por cuenta (email). El puntero de sesión activa respeta
  // "Mantener sesión iniciada": si está desactivado, vive solo en sessionStorage y expira al cerrar la app. ---
  useEffect(() => {
    if (user?.isLoggedIn) {
      saveAccount({ user, vehicles: vehicleDocs, activeVehicleId })
      setCurrentUserEmail(user.email, rememberMe)
    } else {
      setCurrentUserEmail(null)
    }
  }, [user, vehicleDocs, activeVehicleId, rememberMe])

  // --- Autenticación ---
  /** Aplica un perfil ya autenticado (Google OAuth, Supabase) fusionándolo con el garaje local guardado para ese
   *  correo; si es la primera vez que se ve ese correo, arranca con el garaje vacío para disparar el Onboarding.
   *  El convoy real siempre arranca solo con el piloto actual: nunca se mezclan miembros ficticios del Modo Demo. */
  const applyAuthenticatedProfile = useCallback((profile: UserProfile, remember: boolean = true) => {
    setRememberMe(remember)
    const existing = getAccount(profile.email)
    if (existing) {
      // El nivel de suscripción vive únicamente en el almacenamiento local de la cuenta (igual que el garaje),
      // nunca en Supabase: se conserva el ya guardado en vez del 'free' por defecto del perfil recién construido.
      setUser({
        ...existing.user,
        ...profile,
        isLoggedIn: true,
        tier: existing.user.tier,
        subscriptionExpiresAt: existing.user.subscriptionExpiresAt,
        clubName: existing.user.clubName,
        clubCode: existing.user.clubCode,
      })
      setVehicleDocs(existing.vehicles)
      setActiveVehicleId(existing.activeVehicleId)
    } else {
      setUser(profile)
      setVehicleDocs([])
      setActiveVehicleId('')
    }
    setConvoyMembers(createSoloMember(DEFAULT_POSITION))
  }, [])

  /** Redirige a Google para autenticarse vía Supabase Auth (OAuth real). Al volver, onAuthStateChange aplica la sesión. */
  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw new Error(translateAuthError(error.message, lang))
  }, [lang])

  // Restaura automáticamente la sesión de Supabase (incluida la vuelta del redirect de Google OAuth), sin pisar
  // una sesión local ya activa (p. ej. el Modo Demo, que no vive en Supabase).
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' || !session?.user || userRef.current) return
      const meta = session.user.user_metadata ?? {}
      applyAuthenticatedProfile({
        id: session.user.id,
        name: meta.name ?? meta.full_name ?? session.user.email?.split('@')[0] ?? 'Piloto',
        lastName: meta.lastName,
        email: (session.user.email ?? '').toLowerCase(),
        avatarUrl: meta.avatarUrl ?? meta.avatar_url ?? meta.picture ?? '🏍️',
        gender: meta.gender,
        phone: meta.phone,
        isLoggedIn: true,
        authProvider: meta.iss?.includes('google') || meta.provider === 'google' ? 'google' : 'email',
        registeredAt: session.user.created_at ? new Date(session.user.created_at).getTime() : Date.now(),
        tier: 'free',
      })
      setAuthModalOpen(false)
    })
    return () => subscription.unsubscribe()
  }, [applyAuthenticatedProfile])

  /** Inicia sesión real contra Supabase Auth solo con correo y contraseña. */
  const supabaseSignIn = useCallback(
    async (email: string, password: string, remember: boolean = true) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) {
        throw new Error(translateAuthError(error.message, lang))
      }
      if (!data.user) throw new Error(t('auth.errorGeneric'))

      const meta = data.user.user_metadata ?? {}
      const profile: UserProfile = {
        id: data.user.id,
        name: meta.name ?? data.user.email?.split('@')[0] ?? 'Piloto',
        lastName: meta.lastName,
        email: (data.user.email ?? email).toLowerCase(),
        avatarUrl: meta.avatarUrl ?? '🏍️',
        gender: meta.gender,
        phone: meta.phone,
        isLoggedIn: true,
        authProvider: 'email',
        registeredAt: data.user.created_at ? new Date(data.user.created_at).getTime() : Date.now(),
        tier: 'free',
      }
      applyAuthenticatedProfile(profile, remember)
      setAuthModalOpen(false)
    },
    [applyAuthenticatedProfile, lang, t],
  )

  /** Crea una cuenta real en Supabase Auth con los datos completos del piloto. */
  const supabaseSignUp = useCallback(
    async (payload: {
      name: string
      lastName: string
      gender: UserProfile['gender']
      phone: string
      email: string
      password: string
      remember?: boolean
    }) => {
      const normalizedEmail = payload.email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: payload.password,
        options: {
          data: {
            name: payload.name.trim(),
            lastName: payload.lastName.trim(),
            gender: payload.gender,
            phone: payload.phone.trim(),
          },
        },
      })

      if (error) {
        throw new Error(translateAuthError(error.message, lang))
      }

      // Supabase responde éxito con un arreglo de identidades vacío cuando el correo ya existía (protección anti-enumeración).
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error(t('auth.errorUserExists'))
      }
      if (!data.user) throw new Error(t('auth.errorGeneric'))

      const profile: UserProfile = {
        id: data.user.id,
        name: payload.name.trim(),
        lastName: payload.lastName.trim(),
        email: normalizedEmail,
        avatarUrl: '🏍️',
        gender: payload.gender,
        phone: payload.phone.trim(),
        isLoggedIn: true,
        authProvider: 'email',
        registeredAt: Date.now(),
        tier: 'free',
      }

      if (!data.session) {
        // El proyecto de Supabase exige confirmación de correo antes de iniciar sesión.
        throw new Error(t('auth.errorConfirmEmail'))
      }

      applyAuthenticatedProfile(profile, payload.remember ?? true)
      setAuthModalOpen(false)
    },
    [applyAuthenticatedProfile, lang, t],
  )

  const loginDemo = useCallback(() => {
    // El Modo Demo siempre arranca fresco con las 3 motos de prueba y el convoy simulado, sin importar sesiones anteriores.
    if (convoyChannelRef.current) {
      supabase.removeChannel(convoyChannelRef.current)
      convoyChannelRef.current = null
    }
    setConvoyRoom(null)
    // El Modo Demo arranca en tier 'pro' para mostrar la experiencia completa (voz de intercomunicador, etc.).
    setUser(buildProfile('Piloto Demo', 'demo@biketracker.app', '🕶️', 'email', 'pro'))
    setVehicleDocs(DEMO_VEHICLES)
    setActiveVehicleId(DEMO_VEHICLES[0].id)
    setConvoyMembers(createInitialConvoyMembers(DEFAULT_POSITION, DEMO_VEHICLES[0].plate))

    // Showcase guiado: traza de inmediato una ruta escénica predeterminada (Bogotá - La Calera / Guatavita)
    // y arranca la simulación de rodada, para que el velocímetro, el mapa y las alertas de voz se vean en
    // plena acción sin que el visitante tenga que configurar nada. Se llama a fetchRoute directamente (en vez
    // de a planRoute, definido más abajo en este mismo archivo) para evitar depender de una función que en
    // este punto del código aún no se inicializó en el cuerpo del componente.
    const demoRoute = PRESET_ROUTES.find((r) => r.id === 'bogota-lacalera') ?? PRESET_ROUTES[0]
    setNavigation({ status: 'routing', route: null, currentStepIndex: 0 })
    fetchRoute(demoRoute.origin, demoRoute.destination, demoRoute.originLabel, demoRoute.destinationLabel)
      .then((route) => {
        setNavigation({ status: 'navigating', route, currentStepIndex: 0 })
        setConvoyMembers((prev) => resetMembersToPosition(prev, route.coordinates[0]))
        setElapsedSeconds(0)
        setDistanceTraveledKm(0)
        setCurrentSpeedKmh(0)
        setRideActive(true)
        setSimulationRunning(true)
      })
      .catch(() => {
        // Sin red o el servicio de ruteo no respondió: el Modo Demo sigue siendo utilizable, solo sin el
        // arranque automático de la rodada guiada (el visitante puede trazar una ruta manualmente).
        setNavigation({ status: 'idle', route: null, currentStepIndex: 0 })
      })
  }, [])

  /** Guarda central del Modo Demo (showcase de solo lectura): bloquea cualquier mutación de datos reales
   *  (garaje, perfil, documentos) mostrando un toast explicativo, y deja intacto todo lo que es puramente
   *  visual/simulado (telemetría, convoy, navegación). */
  const checkDemoRestriction = useCallback(
    (actionName: string): boolean => {
      if (!isDemoUser) return false
      showToast(t('demo.restrictedAction', { action: actionName }))
      return true
    },
    [isDemoUser, showToast, t],
  )

  const updateProfile = useCallback((partial: Partial<Pick<UserProfile, 'name' | 'avatarUrl' | 'gender' | 'age'>>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev))
    if (partial.avatarUrl !== undefined || partial.name !== undefined) {
      setConvoyMembers((prev) =>
        prev.map((m) =>
          m.isCurrentUser
            ? { ...m, avatarEmoji: partial.avatarUrl ?? m.avatarEmoji, name: partial.name ?? m.name }
            : m,
        ),
      )
    }
    setEditProfileModalOpen(false)
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut().catch(() => {
      /* Sesión ya inválida o sin conexión — el logout local continúa igualmente. */
    })
    if (convoyChannelRef.current) {
      supabase.removeChannel(convoyChannelRef.current)
      convoyChannelRef.current = null
    }
    setConvoyRoom(null)
    setConvoyMembers(createSoloMember(DEFAULT_POSITION))
    setUser(null)
    setVehicleDocs([])
    setActiveVehicleId('')
  }, [])

  // --- Suscripciones (Free / Pro / Club) ---
  /** Simula la activación de una suscripción de pago (Pro o Club) para pruebas y producción. El modal
   *  permanece abierto para que el usuario vea la confirmación ("Plan activo") antes de cerrarlo. */
  const upgradeTier = useCallback((tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    const days = billingCycle === 'yearly' ? 365 : 30
    setUser((prev) =>
      prev
        ? {
            ...prev,
            tier,
            subscriptionExpiresAt: futureDate(days),
            ...(tier !== 'club' ? { clubName: undefined, clubCode: undefined } : {}),
          }
        : prev,
    )
  }, [])

  /** Canjea un Código de Club válido, activando el tier 'club' con cupo de hasta 6 motos.
   *  Devuelve el nombre del club si el código es válido, o null si no existe. El modal permanece abierto
   *  para que el usuario vea el mensaje de bienvenida al club antes de cerrarlo. */
  const redeemClubCode = useCallback((code: string): string | null => {
    const normalized = code.trim().toUpperCase()
    const clubName = CLUB_CODES[normalized]
    if (!clubName) return null
    setUser((prev) =>
      prev
        ? { ...prev, tier: 'club', clubName, clubCode: normalized, subscriptionExpiresAt: futureDate(30) }
        : prev,
    )
    return clubName
  }, [])

  // --- Vehículos ---
  const addVehicle = useCallback((vehicle: Vehicle, setActive: boolean) => {
    setVehicleDocs((prev) => [...prev, vehicle])
    if (setActive) {
      setActiveVehicleId(vehicle.id)
    }
    setAddVehicleModalOpen(false)
  }, [])

  const deleteVehicle = useCallback((vehicleId: string) => {
    setVehicleDocs((prev) => {
      const next = prev.filter((v) => v.id !== vehicleId)
      if (activeVehicleId === vehicleId && next.length > 0) {
        setActiveVehicleId(next[0].id)
      }
      return next
    })
  }, [activeVehicleId])

  const planRoute = useCallback(
    async (origin: LatLng, destination: LatLng, originLabel: string, destinationLabel: string) => {
      setNavigation({ status: 'routing', route: null, currentStepIndex: 0 })
      try {
        const route: RouteInfo = await fetchRoute(origin, destination, originLabel, destinationLabel)
        setNavigation({ status: 'navigating', route, currentStepIndex: 0 })
        setConvoyMembers((prev) => resetMembersToPosition(prev, route.coordinates[0]))
        setElapsedSeconds(0)
        setDistanceTraveledKm(0)
        setCurrentSpeedKmh(0)
        setRideActive(false)
        setSimulationRunning(false)
        setRoutePlannerOpen(false)
        setView('map')
      } catch (err) {
        setNavigation({
          status: 'error',
          route: null,
          currentStepIndex: 0,
          errorMessage: err instanceof Error ? err.message : 'Error desconocido al trazar la ruta.',
        })
      }
    },
    [],
  )

  const clearRoute = useCallback(() => {
    setNavigation({ status: 'idle', route: null, currentStepIndex: 0 })
    setConvoyMembers((prev) => resetMembersToPosition(prev, DEFAULT_POSITION))
    setRideActive(false)
    setSimulationRunning(false)
    spokenStepRef.current = -1
    announcedLaggardsRef.current.clear()
  }, [])

  /** Abre (o reabre) el canal de Supabase Realtime de la sala y aplica el cupo de la matriz de monetización:
   *  el líder (quien crea la sala) rechaza a los pilotos que exceden su cupo, avisando al piloto rechazado
   *  mediante un evento dirigido ('room_full') para que su propio dispositivo muestre el aviso de upgrade. */
  const setupConvoyChannel = useCallback((pin: string, isLeader: boolean, tier: SubscriptionTier, maxMembers: number) => {
    if (convoyChannelRef.current) {
      supabase.removeChannel(convoyChannelRef.current)
    }
    const selfId = userRef.current?.id ?? 'me'
    const channel = supabase.channel(`convoy:${pin}`)

    function broadcastSelf() {
      const self = convoyMembersRef.current.find((m) => m.isCurrentUser)
      if (!self) return
      channel.send({
        type: 'broadcast',
        event: 'location_update',
        payload: {
          id: selfId,
          name: userRef.current?.name ?? self.name,
          avatarEmoji: userRef.current?.avatarUrl ?? self.avatarEmoji,
          role: self.role,
          status: self.status,
          position: self.position,
          routeProgress: self.routeProgress,
          speedKmh: self.speedKmh,
          distanceToLeaderKm: 0,
          ...(isLeader ? { roomTier: tier, roomMaxMembers: maxMembers } : {}),
        },
      })
    }

    channel.on('broadcast', { event: 'location_update' }, ({ payload }) => {
      const remote = payload as ConvoyMember & { roomTier?: SubscriptionTier; roomMaxMembers?: number }
      if (!remote?.id || remote.id === selfId) return

      const alreadyIn = convoyMembersRef.current.some((m) => m.id === remote.id)
      if (isLeader && !alreadyIn && convoyMembersRef.current.length >= maxMembers) {
        channel.send({ type: 'broadcast', event: 'room_full', payload: { targetId: remote.id } })
        return
      }

      setConvoyMembers((prev) => {
        const idx = prev.findIndex((m) => m.id === remote.id)
        if (idx === -1) return [...prev, { ...remote, isCurrentUser: false }]
        const next = [...prev]
        next[idx] = { ...next[idx], ...remote, isCurrentUser: false }
        return next
      })

      // El unido adopta el tier/cupo real de la sala apenas lo conoce por un broadcast del líder.
      if (remote.roomTier && remote.roomMaxMembers) {
        setConvoyRoom((prev) => (prev ? { ...prev, tier: remote.roomTier!, maxMembers: remote.roomMaxMembers! } : prev))
      }
    })

    channel.on('broadcast', { event: 'room_full' }, ({ payload }) => {
      if (payload?.targetId !== selfId) return
      if (convoyChannelRef.current) {
        supabase.removeChannel(convoyChannelRef.current)
        convoyChannelRef.current = null
      }
      setConvoyRoom(null)
      setConvoyMembers((prev) => prev.filter((m) => m.isCurrentUser))
      showToast(t('convoy.roomFullUpgrade'))
    })

    // El canal solo queda "listo" (convoyChannelRef con valor) cuando Realtime confirma la suscripción; recién
    // entonces se anuncia la propia presencia, sin esperar al siguiente watchPosition (que podría tardar o no
    // volver a dispararse si la posición no cambia), para que el líder pueda aplicar el cupo de inmediato.
    channel.subscribe((status) => {
      if (status !== 'SUBSCRIBED') return
      convoyChannelRef.current = channel
      broadcastSelf()
    })
  }, [showToast, t])

  const createConvoyRoom = useCallback(
    (name: string, role: ConvoyMember['role']) => {
      const pin = Math.floor(100000 + Math.random() * 900000).toString()
      const tier = user?.tier ?? 'free'
      const maxMembers = TIER_CONVOY_LIMIT[tier]
      setConvoyRoom({ pin, leaderEmail: user?.email ?? '', createdAt: Date.now(), tier, maxMembers })
      setConvoyMembers((prev) => prev.map((m) => (m.isCurrentUser ? { ...m, role, name: name || m.name } : m)))
      if (!isDemoUser) setupConvoyChannel(pin, true, tier, maxMembers)
    },
    [isDemoUser, setupConvoyChannel, user],
  )

  const joinConvoyRoom = useCallback(
    (pin: string, name: string, role: ConvoyMember['role']) => {
      // El cupo real de la sala lo declara el líder; hasta conocerlo por un broadcast, se asume sin límite.
      setConvoyRoom({ pin, leaderEmail: '', createdAt: Date.now(), tier: 'pro', maxMembers: 999 })
      setConvoyMembers((prev) => prev.map((m) => (m.isCurrentUser ? { ...m, role, name: name || m.name } : m)))
      if (!isDemoUser) setupConvoyChannel(pin, false, 'pro', 999)
    },
    [isDemoUser, setupConvoyChannel],
  )

  const leaveConvoyRoom = useCallback(() => {
    if (convoyChannelRef.current) {
      supabase.removeChannel(convoyChannelRef.current)
      convoyChannelRef.current = null
    }
    setConvoyRoom(null)
    // En convoy real, los pilotos remotos solo existían mientras el canal Realtime estaba activo; en Modo Demo
    // los 4 miembros simulados son permanentes y no deben desaparecer al salir de la sala.
    if (!isDemoUser) setConvoyMembers((prev) => prev.filter((m) => m.isCurrentUser))
  }, [isDemoUser])

  const startRide = useCallback(() => {
    setRideActive(true)
    setSimulationRunning(true)
  }, [])

  const pauseRide = useCallback(() => {
    setSimulationRunning((prev) => !prev)
  }, [])

  const finalizeRide = useCallback(() => {
    setRideActive(false)
    setSimulationRunning(false)
    setElapsedSeconds(0)
    setDistanceTraveledKm(0)
    setCurrentSpeedKmh(0)
    spokenStepRef.current = -1
    announcedLaggardsRef.current.clear()
    setConvoyMembers((prev) => {
      const start = navigation.route?.coordinates[0] ?? DEFAULT_POSITION
      return resetMembersToPosition(prev, start)
    })
  }, [navigation.route])

  // --- Geolocalización GPS real: mientras hay rodada activa, la posición/velocidad reales del piloto
  // reemplazan a la simulación para el marcador del usuario en el mapa. Los demás convoy members siguen simulados. ---
  useEffect(() => {
    if (!rideActive || !navigation.route || !('geolocation' in navigator)) {
      setUsingRealGps(false)
      return
    }

    const route = navigation.route
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const realPosition: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }

        let nearestIndex = 0
        let nearestDistSq = Infinity
        for (let i = 0; i < route.coordinates.length; i++) {
          const c = route.coordinates[i]
          const distSq = (c.lat - realPosition.lat) ** 2 + (c.lng - realPosition.lng) ** 2
          if (distSq < nearestDistSq) {
            nearestDistSq = distSq
            nearestIndex = i
          }
        }
        const progress = route.coordinates.length > 1 ? nearestIndex / (route.coordinates.length - 1) : 0
        const speedKmh = pos.coords.speed !== null && pos.coords.speed >= 0 ? pos.coords.speed * 3.6 : undefined

        setUsingRealGps(true)
        setConvoyMembers((prev) =>
          prev.map((m) =>
            m.isCurrentUser
              ? { ...m, position: realPosition, routeProgress: Math.max(m.routeProgress, progress), speedKmh: speedKmh ?? m.speedKmh }
              : m,
          ),
        )
        setDistanceTraveledKm(route.distanceKm * progress)
        if (speedKmh !== undefined) setCurrentSpeedKmh(speedKmh)
      },
      () => setUsingRealGps(false),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    )
    gpsWatchIdRef.current = watchId

    return () => {
      navigator.geolocation.clearWatch(watchId)
      gpsWatchIdRef.current = null
      setUsingRealGps(false)
    }
  }, [rideActive, navigation.route])

  // --- Convoy real: mientras se está en una sala (y no es Modo Demo), transmite la posición GPS real del piloto
  // por Supabase Realtime para que los demás dispositivos del convoy la vean en su mapa. ---
  const lastBroadcastAtRef = useRef(0)
  useEffect(() => {
    if (!convoyRoom || isDemoUser || !('geolocation' in navigator)) return
    const selfId = user?.id ?? 'me'

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const position: LatLng = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const speedKmh = pos.coords.speed !== null && pos.coords.speed >= 0 ? pos.coords.speed * 3.6 : 0
        const self = convoyMembersRef.current.find((m) => m.isCurrentUser)

        setConvoyMembers((prev) => prev.map((m) => (m.isCurrentUser ? { ...m, position, speedKmh } : m)))

        // Gestión de batería: con la moto detenida (< 3 km/h), el marcador local se sigue actualizando para
        // que el mapa no se vea congelado, pero el broadcast por Supabase Realtime (red + batería) se limita
        // a una vez cada 10s en vez de en cada lectura del GPS, ya que la posición apenas cambia en una parada.
        const STOPPED_THRESHOLD_KMH = 3
        const BROADCAST_INTERVAL_STOPPED_MS = 10000
        const isStopped = speedKmh < STOPPED_THRESHOLD_KMH
        const now = Date.now()
        if (isStopped && now - lastBroadcastAtRef.current < BROADCAST_INTERVAL_STOPPED_MS) {
          return
        }
        lastBroadcastAtRef.current = now

        const isLeader = convoyRoom?.leaderEmail && convoyRoom.leaderEmail === user?.email
        convoyChannelRef.current?.send({
          type: 'broadcast',
          event: 'location_update',
          payload: {
            id: selfId,
            name: user?.name ?? self?.name ?? 'Piloto',
            avatarEmoji: user?.avatarUrl ?? self?.avatarEmoji ?? '🏍️',
            role: self?.role ?? 'piloto',
            status: self?.status ?? 'en-ruta',
            position,
            routeProgress: 0,
            speedKmh,
            distanceToLeaderKm: 0,
            vehiclePlate: activeVehicle?.plate,
            // Solo el líder declara el cupo real de la sala; los demás lo adoptan al recibirlo.
            ...(isLeader && convoyRoom ? { roomTier: convoyRoom.tier, roomMaxMembers: convoyRoom.maxMembers } : {}),
          },
        })
      },
      () => {
        /* Sin permiso o sin señal GPS: el piloto simplemente no transmite su posición al convoy. */
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [convoyRoom, isDemoUser, user, activeVehicle])

  useEffect(() => {
    if (!simulationRunning || !navigation.route || !isDemoUser) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current)
        simIntervalRef.current = null
      }
      return
    }

    const tickMs = 1000
    simIntervalRef.current = window.setInterval(() => {
      setConvoyMembers((prevMembers) => {
        if (!navigation.route) return prevMembers
        const updated = tickConvoySimulation({
          members: prevMembers,
          route: navigation.route,
          deltaSeconds: tickMs / 1000,
          timeScale: simulationSpeed,
          skipCurrentUser: usingRealGps,
        })

        // --- Intercom de convoy: anuncia por voz cuando un piloto queda rezagado (y deja de estarlo).
        // Las alertas por voz son exclusivas de los planes Pro y Club. ---
        const voiceAllowed = userRef.current?.tier !== 'free'
        updated.forEach((member) => {
          if (member.status === 'rezagado' && !announcedLaggardsRef.current.has(member.id)) {
            announcedLaggardsRef.current.add(member.id)
            if (voiceAllowed) {
              const message = member.isCurrentUser
                ? t('convoy.voiceYouAreLaggard')
                : t('convoy.voiceMemberLaggard', { name: member.name.split(' ')[0] })
              announceIntercom(message, lang)
            }
          } else if (member.status !== 'rezagado' && announcedLaggardsRef.current.has(member.id)) {
            announcedLaggardsRef.current.delete(member.id)
          }
        })

        const user = updated.find((m) => m.isCurrentUser)
        if (user && !usingRealGps) {
          setCurrentSpeedKmh(user.speedKmh)
          setDistanceTraveledKm(navigation.route.distanceKm * user.routeProgress)
        }
        if (user && user.routeProgress >= 1) {
          setSimulationRunning(false)
        }
        return updated
      })
      setElapsedSeconds((s) => s + tickMs / 1000)
    }, tickMs)

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current)
        simIntervalRef.current = null
      }
    }
  }, [simulationRunning, navigation.route, simulationSpeed, usingRealGps, lang, t, isDemoUser])

  // --- Navegación por voz tipo Waze: anuncia cada paso de la ruta apenas se entra en su tramo. ---
  useEffect(() => {
    if (!rideActive || !navigation.route || navigation.route.steps.length === 0) {
      spokenStepRef.current = -1
      return
    }
    const route = navigation.route
    let cumulativeKm = 0
    let stepIndex = 0
    for (let i = 0; i < route.steps.length; i++) {
      cumulativeKm += route.steps[i].distanceMeters / 1000
      stepIndex = i
      if (cumulativeKm >= distanceTraveledKm) break
    }

    if (stepIndex !== spokenStepRef.current) {
      spokenStepRef.current = stepIndex
      setNavigation((prev) => (prev.route ? { ...prev, currentStepIndex: stepIndex } : prev))
      announceTurnInstruction(route.steps[stepIndex].instruction, lang)
    }
  }, [distanceTraveledKm, rideActive, navigation.route, lang])

  const renewPlan = useCallback((vehicleId: string) => {
    setVehicleDocs((prev) =>
      prev.map((v) =>
        v.id === vehicleId
          ? { ...v, planActive: true, planExpiresAt: futureDate(365) }
          : v,
      ),
    )
  }, [])

  const vehicleDocStatus = useCallback((dateIso: string) => {
    const days = daysUntil(dateIso)
    if (days < 0) return { status: 'expired' as const, days }
    if (days <= 30) return { status: 'warning' as const, days }
    return { status: 'ok' as const, days }
  }, [])

  const triggerSOS = useCallback(() => {
    setSosActive(true)
    startSiren()
    vibrateAlert()
    // La alerta se agrega aquí, fuera del updater de setConvoyMembers: anidar un setState dentro del
    // actualizador funcional de otro es impuro y React puede invocarlo más de una vez (p. ej. en StrictMode),
    // duplicando la alerta de SOS.
    const current = convoyMembersRef.current.find((m) => m.isCurrentUser)
    if (current) {
      const alert: SOSAlert = {
        id: `sos-${Date.now()}`,
        memberId: current.id,
        memberName: current.name,
        position: current.position,
        timestamp: Date.now(),
        message: 'Alerta SOS activada — se requiere asistencia inmediata.',
      }
      setSosAlerts((alerts) => [alert, ...alerts])
    }
    setConvoyMembers((prev) => prev.map((m) => (m.isCurrentUser ? { ...m, status: 'sos' } : m)))
  }, [])

  const cancelSOS = useCallback(() => {
    setSosActive(false)
    stopSiren()
    vibrateStop()
    playConfirmBeep()
    setConvoyMembers((prev) => prev.map((m) => (m.isCurrentUser ? { ...m, status: 'en-ruta' } : m)))
  }, [])

  const addConvoyAlert = useCallback((type: string, message: string) => {
    setConvoyAlerts((prev) => [{ id: generateId('alert'), type, message, timestamp: Date.now() }, ...prev])
  }, [])

  const markNotificationsRead = useCallback(() => {
    setNotificationsLastReadAt(Date.now())
  }, [])

  const clearAllNotifications = useCallback(() => {
    setSosAlerts([])
    setConvoyAlerts([])
    setNotificationsLastReadAt(Date.now())
  }, [])

  const unreadNotificationsCount =
    sosAlerts.filter((a) => a.timestamp > notificationsLastReadAt).length +
    convoyAlerts.filter((a) => a.timestamp > notificationsLastReadAt).length

  const value: AppContextValue = {
    lang,
    setLang,
    t,
    view,
    setView,
    topLevelMode,
    setTopLevelMode,
    sidebarOpen,
    setSidebarOpen,
    user,
    authModalOpen,
    setAuthModalOpen,
    editProfileModalOpen,
    setEditProfileModalOpen,
    loginDemo,
    isDemoUser,
    checkDemoRestriction,
    signInWithGoogle,
    supabaseSignIn,
    supabaseSignUp,
    updateProfile,
    logout,
    subscriptionModalOpen,
    setSubscriptionModalOpen,
    subscriptionCheckoutTarget,
    subscriptionCheckoutBillingCycle,
    openSubscriptionCheckout,
    upgradeTier,
    redeemClubCode,
    vehicleLimit,
    convoyMemberLimit,
    vehicles: vehicleDocs,
    activeVehicleId,
    setActiveVehicleId,
    activeVehicle,
    addVehicleModalOpen,
    setAddVehicleModalOpen,
    addVehicle,
    deleteVehicle,
    renewPlan,
    vehicleDocStatus,
    navigation,
    planRoute,
    clearRoute,
    routePlannerOpen,
    setRoutePlannerOpen,
    convoyMembers,
    convoyRoom,
    createConvoyRoom,
    joinConvoyRoom,
    leaveConvoyRoom,
    rideActive,
    simulationRunning,
    startRide,
    pauseRide,
    finalizeRide,
    simulationSpeed,
    setSimulationSpeed,
    currentSpeedKmh,
    elapsedSeconds,
    distanceTraveledKm,
    usingRealGps,
    sosActive,
    sosAlerts,
    triggerSOS,
    cancelSOS,
    convoyAlerts,
    addConvoyAlert,
    notificationModalOpen,
    setNotificationModalOpen,
    unreadNotificationsCount,
    markNotificationsRead,
    clearAllNotifications,
    toastMessage,
    showToast,
    isOnline,
    installModalOpen,
    setInstallModalOpen,
    canInstallNatively: deferredInstallPrompt !== null,
    isIosDevice,
    isStandalone,
    triggerNativeInstall,
    requestAppAccess,
    continueToApp,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
