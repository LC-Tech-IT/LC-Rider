import type { UserAccountData } from '../types'

const PREFIX = 'lcrider.'
/** Prefijo de la marca anterior (Bike Tracker). Sus datos se migran una sola vez al prefijo nuevo. */
const LEGACY_PREFIX = 'biketracker.'
const ACCOUNTS_KEY = 'accounts'
const CURRENT_USER_KEY = 'currentUserEmail'
const PENDING_CHECKOUT_KEY = PREFIX + 'pending_checkout'
/** Una intención de compra más vieja que esto (p. ej. el usuario abandonó el login de Google) ya no reabre el checkout. */
const PENDING_CHECKOUT_TTL_MS = 30 * 60 * 1000

export interface PendingCheckout {
  tier: 'pro' | 'club'
  billingCycle: 'monthly' | 'yearly'
}

/** Recuerda en sessionStorage (misma pestaña) el plan que el invitado iba a comprar antes de salir a Google OAuth,
 *  para reabrir el checkout de ese plan al volver ya autenticado. */
export function savePendingCheckout(checkout: PendingCheckout): void {
  try {
    window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify({ ...checkout, savedAt: Date.now() }))
  } catch {
    /* sessionStorage no disponible: el usuario vuelve a elegir el plan manualmente. */
  }
}

/** Lee y borra (uso único) la intención de compra pendiente, si existe y sigue vigente. */
export function takePendingCheckout(): PendingCheckout | null {
  try {
    const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY)
    if (raw === null) return null
    window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY)
    const data = JSON.parse(raw) as Partial<PendingCheckout & { savedAt: number }>
    const validTier = data.tier === 'pro' || data.tier === 'club'
    const validCycle = data.billingCycle === 'monthly' || data.billingCycle === 'yearly'
    const fresh = typeof data.savedAt === 'number' && Date.now() - data.savedAt < PENDING_CHECKOUT_TTL_MS
    return validTier && validCycle && fresh ? { tier: data.tier!, billingCycle: data.billingCycle! } : null
  } catch {
    return null
  }
}

export function clearPendingCheckout(): void {
  try {
    window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY)
  } catch {
    /* nada que limpiar */
  }
}

/** Copia al prefijo `lcrider.` todo lo guardado con `biketracker.` (cuentas, garaje, sesión, id de dispositivo,
 *  preferencias) y borra la copia antigua. Si ya existe un valor con el prefijo nuevo, gana el nuevo. Se ejecuta al
 *  importar este módulo, antes de que AppContext lea la sesión, para que nadie pierda su sesión ni su garaje. */
function migrateLegacyStorage(store: Storage): void {
  const legacyKeys: string[] = []
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i)
    if (key?.startsWith(LEGACY_PREFIX)) legacyKeys.push(key)
  }
  for (const legacyKey of legacyKeys) {
    const newKey = PREFIX + legacyKey.slice(LEGACY_PREFIX.length)
    const value = store.getItem(legacyKey)
    if (value !== null && store.getItem(newKey) === null) store.setItem(newKey, value)
    // Solo se borra lo antiguo si la copia quedó guardada (p. ej. sin cuota llena).
    if (store.getItem(newKey) !== null) store.removeItem(legacyKey)
  }
}

for (const getStore of [() => window.localStorage, () => window.sessionStorage]) {
  try {
    migrateLegacyStorage(getStore())
  } catch {
    /* Almacenamiento no disponible: no hay nada que migrar. */
  }
}

export function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* localStorage unavailable or quota exceeded — fail silently */
  }
}

function loadAccounts(): Record<string, UserAccountData> {
  return loadStorage<Record<string, UserAccountData>>(ACCOUNTS_KEY, {})
}

/** Retrieves the isolated account data (profile + garage) for a given email, or null if it has never signed in before. */
export function getAccount(email: string): UserAccountData | null {
  const accounts = loadAccounts()
  return accounts[email.toLowerCase()] ?? null
}

/** Persists one account's data under its email, keeping every other account untouched. */
export function saveAccount(account: UserAccountData): void {
  const accounts = loadAccounts()
  accounts[account.user.email.toLowerCase()] = account
  saveStorage(ACCOUNTS_KEY, accounts)
}

/** Elimina por completo la caché local de una cuenta (derecho de supresión), sin tocar las demás cuentas
 *  que hayan iniciado sesión en este mismo dispositivo. */
export function removeAccount(email: string): void {
  const accounts = loadAccounts()
  delete accounts[email.toLowerCase()]
  saveStorage(ACCOUNTS_KEY, accounts)
}

/** La sesión "recordada" vive en localStorage (sobrevive a cerrar el navegador); la sesión temporal
 *  (Remember Me desactivado) vive solo en sessionStorage, que el navegador borra al cerrar la app/pestaña. */
export function getCurrentUserEmail(): string | null {
  try {
    const sessionRaw = window.sessionStorage.getItem(PREFIX + CURRENT_USER_KEY)
    if (sessionRaw !== null) return JSON.parse(sessionRaw) as string
  } catch {
    /* sessionStorage no disponible — se sigue con localStorage */
  }
  return loadStorage<string | null>(CURRENT_USER_KEY, null)
}

export function setCurrentUserEmail(email: string | null, remember = true): void {
  if (email === null) {
    try {
      window.localStorage.removeItem(PREFIX + CURRENT_USER_KEY)
    } catch {
      /* localStorage no disponible */
    }
    try {
      window.sessionStorage.removeItem(PREFIX + CURRENT_USER_KEY)
    } catch {
      /* sessionStorage no disponible */
    }
    return
  }

  if (remember) {
    saveStorage(CURRENT_USER_KEY, email)
    try {
      window.sessionStorage.removeItem(PREFIX + CURRENT_USER_KEY)
    } catch {
      /* sessionStorage no disponible */
    }
  } else {
    try {
      window.sessionStorage.setItem(PREFIX + CURRENT_USER_KEY, JSON.stringify(email))
    } catch {
      /* sessionStorage no disponible */
    }
    try {
      window.localStorage.removeItem(PREFIX + CURRENT_USER_KEY)
    } catch {
      /* localStorage no disponible */
    }
  }
}
