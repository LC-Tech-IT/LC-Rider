import type { Lang } from '../types'

/** Formatea una fecha ISO (yyyy-mm-dd) de forma legible según el idioma activo, p. ej. "24 de octubre de 2026". */
export function formatLongDate(dateIso: string, lang: Lang): string {
  const date = new Date(`${dateIso}T00:00:00`)
  return new Intl.DateTimeFormat(lang === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}
