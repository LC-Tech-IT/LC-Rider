import type { Lang } from '../types'

const LOCALE_BY_LANG: Record<Lang, string> = {
  es: 'es-ES',
  en: 'en-US',
}

function speechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function speak(text: string, lang: Lang, options?: { pitch?: number; rate?: number }): void {
  if (!speechSynthesisAvailable() || !text) return
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LOCALE_BY_LANG[lang]
    utterance.rate = options?.rate ?? 1
    utterance.pitch = options?.pitch ?? 1
    window.speechSynthesis.speak(utterance)
  } catch {
    /* Síntesis de voz no soportada o bloqueada por el navegador — falla en silencio. */
  }
}

/** Instrucción de navegación tipo Waze, anunciada ante cada giro o maniobra de la ruta. */
export function announceTurnInstruction(instruction: string, lang: Lang): void {
  speak(instruction, lang)
}

/** Alerta de intercomunicador de convoy (gasolina, reagrupación, rezagados). */
export function announceIntercom(message: string, lang: Lang): void {
  speak(message, lang, { pitch: 1.1 })
}

export function cancelSpeech(): void {
  if (speechSynthesisAvailable()) window.speechSynthesis.cancel()
}
