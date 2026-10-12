import type { UserAccountData } from '../types'

const PREFIX = 'biketracker.'
const ACCOUNTS_KEY = 'accounts'
const CURRENT_USER_KEY = 'currentUserEmail'

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
