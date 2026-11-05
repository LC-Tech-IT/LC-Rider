export interface ChatbotIntent {
  keywords: string[]
  response: string
}

const GUARDRAIL_RESPONSE =
  'Soy el asistente oficial de **LC Rider (LC SyncTech)** y estoy capacitado exclusivamente para brindarte información sobre nuestra aplicación, planes y soporte técnico motero. Para consultas ajenas a nuestro producto o situaciones de apoyo personal, te sugerimos acudir a los canales y líneas de atención especializadas de tu región.'

const EMERGENCY_LINE =
  'Si tú o alguien más está en peligro inmediato, por favor comunícate ahora mismo con las líneas de emergencia de tu país (por ejemplo, 123 o 911).'

/** Palabras relacionadas con crisis de salud mental o auxilio vital: reciben el guardrail + líneas de emergencia. */
const CRISIS_KEYWORDS = [
  'suicid',
  'quitarme la vida',
  'matarme',
  'no quiero vivir',
  'hacerme daño',
  'hacerme dano',
  'autolesion',
  'autolesión',
  'depresion',
  'depresión',
  'salud mental',
  'ansiedad',
  'ataque de panico',
  'ataque de pánico',
]

/** Temas explícitamente fuera del ámbito del producto: solo reciben el guardrail estándar. */
const OUT_OF_SCOPE_KEYWORDS = [
  'politica',
  'política',
  'presidente',
  'elecciones',
  'gobierno',
  'religion',
  'religión',
  'dios',
  'iglesia',
  'biblia',
  'horoscopo',
  'horóscopo',
  'tarea de',
  'receta de cocina',
  'chiste',
]

/** Tono motero colombiano cercano y cálido ("parcero", "hermano de ruta") en cada respuesta, siempre
 *  natural y nunca forzado — las cifras y datos de contacto se mantienen exactos y verificables. */
const PRODUCT_INTENTS: ChatbotIntent[] = [
  {
    keywords: [
      'que es lc rider', 'qué es lc rider', 'que es lcrider', 'que es bike tracker', 'qué es bike tracker', 'de que se trata', 'de qué se trata', 'que es esto', 'qué es esto',
      'como funciona', 'cómo funciona', 'que hace la app', 'qué hace la app', 'para que sirve', 'para qué sirve',
      'que es esta app', 'qué es esta app', 'que es la app', 'qué es la app', 'que es bike', 'de que trata',
    ],
    response:
      '¡Quiubo, parcero! LC Rider es la plataforma de LC SyncTech hecha por y para moteros que ruedan en parche: conecta a todo el convoy en un mapa en tiempo real (quién va de Líder, quién de Piloto Guardián y quién se nos queda rezagado), te guía con navegación turn-by-turn con voz estilo Waze, dispara un botón SOS con tu ubicación GPS exacta ante cualquier eventualidad, y te lleva el control digital de tus motos (SOAT, tecnomecánica, garaje). Funciona desde el celular o instalada como app en tu pantalla de inicio (PWA, sin tiendas ni descargas pesadas), y hasta se ve en pantallas tipo CarPlay/Android Auto. Tiene un plan gratis pa\' arrancar y planes Pro/Club pa\' rodar sin límites. ¿Le sigo contando del modo Convoy, el botón SOS o los planes, hermano?',
  },
  {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'cuánto cuesta', 'plan', 'suscripcion', 'suscripción'],
    response:
      '¡De una, parce! Así están los planes pa\' que elijas con toda la info: 🆓 **Piloto Libre** ($0 COP, pa\' siempre — convoy de hasta 3 pilotos, 1 moto en el garaje y SOS básico). ⚡ **Convoy Pro**: el más popular es el **Anual a $99.000 COP** (te sale como a $8.250 COP al mes — ¡ahorras un 45%!), o si prefieres ir mes a mes, el **Mensual a $14.900 COP** — ambos con convoy de hasta 12 pilotos. 🏆 **Biker Club**, pensado pa\' tu club — hasta 50 pilotos en convoy simultáneo: el **Anual a $299.000 COP** (como a $24.916 COP al mes — ¡ahorras un 28%!) o el **Mensual a $34.900 COP** si prefieres flexibilidad mes a mes. Y ojo, hermano: si pagas por **QR de Bancolombia o Nequi** te ahorras las comisiones, y en los planes anuales te regalamos **1 mes adicional gratis** 🎁. Actívalo desde "Ver Planes" en la app, o escríbenos directo al WhatsApp 📲 +57 350 520 8592 y te ayudamos personalmente.',
  },
  {
    keywords: [
      'como pago', 'cómo pago', 'metodo de pago', 'método de pago', 'medios de pago', 'nequi', 'daviplata', 'pse',
      'tarjeta de credito', 'tarjeta de crédito', 'tarjeta de debito', 'tarjeta de débito', 'pagar', 'qr', 'codigo qr', 'código qr',
    ],
    response:
      'Tienes varias formas de pagar, parce: ⚡ la más recomendada es el **QR de Bancolombia/Nequi** (sin comisiones + 1 mes adicional gratis de regalo en los planes anuales — solo escaneas, transfieres el valor exacto de tu plan y nos mandas el comprobante por WhatsApp al 📲 +57 350 520 8592), o si prefieres, también aceptamos 📱 Nequi/Daviplata, 🏦 PSE (con los bancos principales de Colombia) y 💳 tarjeta de crédito/débito, todo desde el checkout dentro de la app en "Ver Planes".',
  },
  {
    keywords: ['renovar', 'renovacion', 'renovación', 'vencimiento', 'vence mi plan', 'cuando vence', 'cuándo vence', 'cambiar de plan', 'actualizar plan'],
    response:
      'Tranquilo, hermano, eso lo ves fácil: la fecha de vigencia de tu plan está en tu Perfil o el menú lateral, con el botón "🔄 Renovar Suscripción / Cambiar Plan". Ahí eliges el método de pago (QR, Nequi, PSE o tarjeta) y tu plan queda activo de inmediato — 30 días si es mensual, o 365 si eliges el Convoy Pro Anual.',
  },
  {
    keywords: ['codigo de club', 'código de club', 'canjear codigo', 'canjear código', 'club yamaha', 'biker crew', 'club bmw'],
    response:
      'Si tu club motero tiene un Código de Club (el que te entrega tu organización), lo canjeas en "Ver Planes" → "¿Tienes un Código de Club?". Eso activa el plan Biker Club al instante, con cupo de hasta 50 pilotos en convoy simultáneo — ideal pa\' rodar con todo el parche.',
  },
  {
    keywords: ['convoy', 'grupo', 'rodada', 'lider', 'líder', 'guardian', 'guardián', 'rezagad'],
    response:
      'El modo Convoy conecta a todo el parche en tiempo real sobre el mapa: ves quién va de Líder, quién es el Piloto Guardián y si alguien se rezaga o se desvía de la ruta, con alertas visuales al toque pa\' que nadie se pierda en una curva.',
  },
  {
    keywords: ['guante', 'guantes'],
    response:
      'Sí señor — el Modo Guantes (In-Ride Glove Mode) usa botones gigantes de al menos 48-70px, pensados pa\' activarse de un solo toque con los guantes puestos y con miradas de medio segundo al manillar. Pura ergonomía pa\' la carretera.',
  },
  {
    keywords: ['carplay', 'android auto', 'pantalla del carro', 'moto pantalla'],
    response:
      'LC Rider tiene una vista optimizada estilo CarPlay/Android Auto dentro del showcase de la app, con velocímetro y estado del convoy en alto contraste pa\' tableros y pantallas montadas en el manillar.',
  },
  {
    keywords: ['bateria', 'batería', 'consumo', 'gps'],
    response:
      'La app está optimizada pa\' gastar poca batería en rodadas largas: usa actualizaciones de posición eficientes, reduce la transmisión del GPS cuando estás detenido, y mantiene la pantalla activa durante la rodada pa\' que nunca se te apague el velocímetro a mitad de curva.',
  },
  {
    keywords: ['sin señal', 'sin senal', 'sin internet', 'offline', 'mesh', 'zona sin cobertura'],
    response:
      'Tu velocímetro, el mapa y la navegación turn-by-turn siguen trabajando aunque te quedes sin señal en un túnel o una zona alejada — verás un avisito de "GPS Satelital Activo" y la app no se te cuelga. Lo único que sí necesita datos móviles es sincronizar tu posición en vivo con el resto del convoy.',
  },
  {
    keywords: ['sos', 'emergencia', 'accidente', 'auxilio'],
    response:
      'El botón SOS difunde tu ubicación GPS exacta a todo el convoy con una sola pulsación sostenida (pa\' evitar falsas alarmas), con sirena y vibración incluidas, tanto en la app como en el Modo Guantes. Tu parche se entera al instante si necesitas una mano.',
  },
  {
    keywords: ['registro', 'registrarme', 'crear cuenta', 'iniciar sesion', 'iniciar sesión', 'google'],
    response:
      'Te registras gratis con tu cuenta de Google o con tu correo desde el botón "Iniciar Rodada Gratis" — el proceso toma menos de un minuto y luego te pedimos registrar tu primera moto. Así de fácil, parce.',
  },
  {
    keywords: ['contacto', 'lc synctech', 'synctech', 'lc tech', 'soporte', 'ayuda tecnica', 'ayuda técnica', 'whatsapp', 'correo', 'club motero', 'registrar mi club'],
    response:
      '¡Claro que sí, parce! Somos LC SyncTech — Tecnología inteligente que te respalda 🏍️. Escríbenos directo por WhatsApp al 📲 +57 350 520 8592 o al correo 📧 contacto@lcsynctech.com. Ahí también puedes registrar tu club motero pa\' activar el plan Biker Club.',
  },
]

const FALLBACK_RESPONSE =
  'Te puedo ayudar con info sobre precios y planes (incluyendo el pago por QR Bancolombia/Nequi), métodos de pago, renovación de tu suscripción, códigos de club, el modo Convoy, compatibilidad con guantes y CarPlay/Android Auto, batería, zonas sin señal, el botón SOS o cómo registrarte. ¿Sobre cuál te gustaría que te cuente, parce?'

const DIACRITICS_REGEX = new RegExp('[\\u0300-\\u036f]', 'g')

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(DIACRITICS_REGEX, '')
}

function containsAny(normalizedText: string, keywords: string[]): boolean {
  return keywords.some((keyword) => normalizedText.includes(normalize(keyword)))
}

/** Clasifica el mensaje del usuario y devuelve la respuesta del asistente, aplicando primero los guardrails. */
export function getChatbotResponse(message: string): string {
  const normalized = normalize(message)

  if (containsAny(normalized, CRISIS_KEYWORDS)) {
    return `${GUARDRAIL_RESPONSE}\n\n${EMERGENCY_LINE}`
  }

  if (containsAny(normalized, OUT_OF_SCOPE_KEYWORDS)) {
    return GUARDRAIL_RESPONSE
  }

  for (const intent of PRODUCT_INTENTS) {
    if (containsAny(normalized, intent.keywords)) {
      return intent.response
    }
  }

  return FALLBACK_RESPONSE
}

export const SUGGESTED_PROMPTS = [
  '¿Qué es LC Rider?',
  '¿Qué incluye Convoy Pro?',
  '¿Cómo pago con QR Bancolombia/Nequi?',
  '¿Tiene alerta SOS?',
]
