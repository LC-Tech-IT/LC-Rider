import type { Lang } from '../types'

const LOCALE_BY_LANG: Record<Lang, string> = {
  es: 'es-ES',
  en: 'en-US',
}

function speechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function speak(text: string, lang: Lang, options?: { pitch?: number; rate?: number; onEnd?: () => void }): void {
  if (!speechSynthesisAvailable() || !text) {
    options?.onEnd?.()
    return
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LOCALE_BY_LANG[lang]
    utterance.rate = options?.rate ?? 1
    utterance.pitch = options?.pitch ?? 1
    if (options?.onEnd) {
      utterance.onend = options.onEnd
      utterance.onerror = options.onEnd
    }
    window.speechSynthesis.speak(utterance)
  } catch {
    /* Síntesis de voz no soportada o bloqueada por el navegador — falla en silencio. */
    options?.onEnd?.()
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

/** Locución de intercomunicador con aviso de fin (para encadenar UI tras la voz). `onEnd` se llama también si
 *  la voz falla o no existe, así quien espera nunca queda colgado. */
export function announceIntercomThen(message: string, lang: Lang, onEnd: () => void): void {
  speak(message, lang, { pitch: 1.05, rate: 1.05, onEnd })
}

/** iOS Safari solo permite speechSynthesis si la primera locución nace de un gesto del usuario. Llamar esto
 *  dentro del handler del clic "desbloquea" la voz para locuciones programadas segundos después. */
export function primeSpeechFromGesture(): void {
  if (!speechSynthesisAvailable()) return
  try {
    const silent = new SpeechSynthesisUtterance(' ')
    silent.volume = 0
    window.speechSynthesis.speak(silent)
  } catch {
    /* sin soporte: nada que desbloquear */
  }
}

export function cancelSpeech(): void {
  if (speechSynthesisAvailable()) window.speechSynthesis.cancel()
}
