import type { Lang } from '../types'

/** Locale primario por idioma: español de Colombia (no es-ES) e inglés de EE. UU. */
const LOCALE_BY_LANG: Record<Lang, string> = {
  es: 'es-CO',
  en: 'en-US',
}

/** Prosodia para navegación en carretera: pausada y clara, óptima con viento e intercomunicador en el casco. */
const NAV_PROSODY = { rate: 1.05, pitch: 1.02 }

/** Prosodia para la demo comercial de la landing: rápida, ágil y llena de energía para salir a rodar. */
const DEMO_PROSODY = { rate: 1.18, pitch: 1.1 }

function speechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/* ───────────────────────── Selección de voz ───────────────────────── */

// Chrome carga las voces de forma asíncrona: se cachean y se refrescan con `voiceschanged`.
let cachedVoices: SpeechSynthesisVoice[] = []

function refreshVoices(): void {
  try {
    cachedVoices = window.speechSynthesis.getVoices()
  } catch {
    cachedVoices = []
  }
}

if (speechSynthesisAvailable()) {
  refreshVoices()
  try {
    window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
  } catch {
    /* Navegadores antiguos sin EventTarget en speechSynthesis: se lee la lista en cada locución. */
  }
}

const normLang = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase()

/** Dentro de un mismo nivel, prefiere voces neuronales ("Natural"/"Online") y luego las de Google. */
function quality(v: SpeechSynthesisVoice): number {
  if (/natural|online|neural/i.test(v.name)) return 2
  if (/google/i.test(v.name)) return 1
  return 0
}

function bestOf(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null
  return [...voices].sort((a, b) => quality(b) - quality(a))[0]
}

const COLOMBIA = (v: SpeechSynthesisVoice) =>
  normLang(v) === 'es-co' || /colombia|salome|gonzalo/i.test(v.name)
const LATAM_NEUTRAL = (v: SpeechSynthesisVoice) =>
  ['es-419', 'es-us', 'es-mx'].some((p) => normLang(v).startsWith(p)) ||
  /latin|latino|m[eé]xico|estados unidos|united states/i.test(v.name)
const SPAIN = (v: SpeechSynthesisVoice) => normLang(v) === 'es-es' || /espa[ñn]a|spain|castilian/i.test(v.name)

/** Elige la mejor voz disponible: Colombia → Latinoamérica neutra (es-419/es-US/es-MX) → cualquier otra de
 *  Latinoamérica → (último recurso) cualquier voz en español. En inglés prioriza en-US. */
export function pickBestVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (!speechSynthesisAvailable()) return null
  if (!cachedVoices.length) refreshVoices()
  const voices = cachedVoices

  if (lang === 'es') {
    const spanish = voices.filter((v) => normLang(v).startsWith('es'))
    return (
      bestOf(spanish.filter(COLOMBIA)) ??
      bestOf(spanish.filter(LATAM_NEUTRAL)) ??
      bestOf(spanish.filter((v) => !SPAIN(v))) ??
      bestOf(spanish)
    )
  }
  const english = voices.filter((v) => normLang(v).startsWith('en'))
  return bestOf(english.filter((v) => normLang(v) === 'en-us')) ?? bestOf(english)
}

/* ───────────────────────── Locución ───────────────────────── */

function speak(text: string, lang: Lang, options?: { pitch?: number; rate?: number; onEnd?: () => void }): void {
  if (!speechSynthesisAvailable() || !text) {
    options?.onEnd?.()
    return
  }
  try {
    const utterance = new SpeechSynthesisUtterance(text)
    const voice = pickBestVoice(lang)
    if (voice) {
      utterance.voice = voice
      utterance.lang = voice.lang
    } else {
      utterance.lang = LOCALE_BY_LANG[lang]
    }
    utterance.rate = options?.rate ?? NAV_PROSODY.rate
    utterance.pitch = options?.pitch ?? NAV_PROSODY.pitch
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
  speak(instruction, lang, NAV_PROSODY)
}

/** Alerta de intercomunicador de convoy (gasolina, reagrupación, rezagados). */
export function announceIntercom(message: string, lang: Lang): void {
  speak(message, lang, { ...NAV_PROSODY, pitch: 1.06 })
}

/** Locución enérgica con aviso de fin (para encadenar UI tras la voz). `onEnd` se llama también si la voz falla
 *  o no existe, así quien espera nunca queda colgado. */
export function speakWithVoice(text: string, lang: Lang, onEnd?: () => void): void {
  speak(text, lang, { ...DEMO_PROSODY, onEnd })
}

/** Locuciones de la demo "Iniciar Convoy" del radar de la landing, por fase. */
export const CONVOY_RADAR_LINES: Record<'locating' | 'connecting' | 'ready', Record<Lang, string>> = {
  locating: { es: '¡Rastreo GPS activo! ¡Buscando pilotos en ruta!', en: 'GPS tracking active! Scanning riders on route!' },
  connecting: { es: '¡Enlazando telemetría de convoy!', en: 'Linking convoy telemetry!' },
  ready: { es: '¡Todos los pilotos encontrados! ¡Listos para rodar con toda!', en: 'All riders connected! Ready to hit the road!' },
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
