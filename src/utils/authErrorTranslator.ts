import type { Lang } from '../types'
import { translate } from './i18n'

/**
 * Mapeo de patrones de errores crudos de Supabase Auth (siempre en inglés) hacia las llaves de traducción
 * ya existentes en `i18n.ts`. Se evalúan en orden; el primer patrón que coincida gana.
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; key: string }> = [
  { pattern: /invalid login credentials/i, key: 'auth.errorInvalidCredentials' },
  { pattern: /email logins? (is|are) disabled/i, key: 'auth.errorEmailLoginsDisabled' },
  { pattern: /(user )?already registered|already exists/i, key: 'auth.errorUserExists' },
  { pattern: /password should be at least/i, key: 'auth.errorPasswordTooShort' },
  { pattern: /unable to validate email address|invalid email/i, key: 'auth.errorInvalidEmail' },
  { pattern: /email not confirmed/i, key: 'auth.errorConfirmEmail' },
  { pattern: /for security purposes.*after \d+ seconds?|rate limit/i, key: 'auth.errorRateLimited' },
  { pattern: /failed to fetch|networkerror|network request failed/i, key: 'auth.errorNetwork' },
  { pattern: /signup.*disabled/i, key: 'auth.errorSignupDisabled' },
]

/** Traduce un mensaje de error crudo de Supabase Auth (en inglés) a un mensaje amigable en el idioma activo.
 *  Si no reconoce el patrón, devuelve un mensaje genérico traducido en vez de mostrar el texto en inglés. */
export function translateAuthError(rawMessage: string, lang: Lang): string {
  const match = ERROR_PATTERNS.find(({ pattern }) => pattern.test(rawMessage))
  return translate(lang, match?.key ?? 'auth.errorGeneric')
}
