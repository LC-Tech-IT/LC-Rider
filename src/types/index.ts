export type Lang = 'es' | 'en'

export type DocumentStatus = 'ok' | 'warning' | 'expired'

export interface VehicleDocument {
  /** ISO date string (yyyy-mm-dd) */
  expiresAt: string
  fileName?: string
  fileSizeKb?: number
  /** Base64 data URL of the uploaded photo/PDF, persisted in localStorage */
  fileDataUrl?: string
}

export type VehicleCategory = 'sport' | 'trail' | 'car'

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  category: VehicleCategory
  type: 'moto' | 'carro'
  color: string
  avatarEmoji: string
  soat: VehicleDocument
  tecnomecanica: VehicleDocument
  planActive: boolean
  planExpiresAt?: string
}

export type GenderOption = 'male' | 'female' | 'unspecified'

/** Niveles oficiales de suscripción: Piloto Libre (gratis), Convoy Pro y Biker Club. */
export type SubscriptionTier = 'free' | 'pro' | 'club'

export interface UserProfile {
  id: string
  name: string
  lastName?: string
  email: string
  /** Emoji or Data URL (Base64) of an uploaded photo used as the profile avatar */
  avatarUrl: string
  gender?: GenderOption
  age?: number | null
  phone?: string
  isLoggedIn: boolean
  authProvider: 'google' | 'email'
  registeredAt: number
  /** Nivel de suscripción activo; 'free' por defecto. */
  tier: SubscriptionTier
  /** ISO date string de vencimiento de la suscripción de pago (Pro/Club), si aplica. */
  subscriptionExpiresAt?: string
  clubName?: string
  clubCode?: string
}

/** Snapshot of a single account's data, keyed by email in localStorage for multi-account isolation. */
export interface UserAccountData {
  user: UserProfile
  vehicles: Vehicle[]
  activeVehicleId: string
}

export type ConvoyRole = 'lider' | 'guardian' | 'piloto'

export type ConvoyStatus = 'en-ruta' | 'rezagado' | 'sos' | 'offline'

export interface LatLng {
  lat: number
  lng: number
}

export interface ConvoyMember {
  id: string
  name: string
  avatarEmoji: string
  role: ConvoyRole
  status: ConvoyStatus
  position: LatLng
  /** 0..1 progress along the current route */
  routeProgress: number
  speedKmh: number
  distanceToLeaderKm: number
  isCurrentUser?: boolean
  vehiclePlate?: string
}

export interface RouteStep {
  instruction: string
  distanceMeters: number
  durationSeconds: number
  maneuver?: string
}

export interface RouteInfo {
  id: string
  originLabel: string
  destinationLabel: string
  origin: LatLng
  destination: LatLng
  /** Full road geometry, ordered [lat, lng] pairs */
  coordinates: LatLng[]
  distanceKm: number
  durationMinutes: number
  steps: RouteStep[]
  trafficEstimate: 'fluido' | 'moderado' | 'pesado'
}

export interface PresetRoute {
  id: string
  label: string
  origin: LatLng
  originLabel: string
  destination: LatLng
  destinationLabel: string
}

export interface SOSAlert {
  id: string
  memberId: string
  memberName: string
  position: LatLng
  timestamp: number
  message: string
}

/** Historial de peticiones/alertas de convoy (gasolina, reagrupación, peligro, retén) para el Centro de Notificaciones. */
export interface ConvoyAlertEntry {
  id: string
  type: string
  message: string
  timestamp: number
}

export type NavStatus = 'idle' | 'planning' | 'routing' | 'navigating' | 'error'

export interface NavigationState {
  status: NavStatus
  route: RouteInfo | null
  currentStepIndex: number
  errorMessage?: string
}

export type AppView = 'cockpit' | 'map' | 'garage' | 'convoy'

/** Top-level app mode: the public marketing Landing Page, or the authenticated App itself. */
export type TopLevelMode = 'landing' | 'app'

export interface ConvoyRoom {
  pin: string
  leaderEmail: string
  createdAt: number
  tier: SubscriptionTier
  /** 3 para Free, 25 para Club, 999 (ilimitado en la práctica) para Pro. */
  maxMembers: number
}
