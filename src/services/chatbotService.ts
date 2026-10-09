export interface ChatbotIntent {
  keywords: string[]
  response: string
}

const GUARDRAIL_RESPONSE =
  'Soy el asistente oficial de **Bike Tracker (LC Tech)** y estoy capacitado exclusivamente para brindarte información sobre nuestra aplicación, planes y soporte técnico motero. Para consultas ajenas a nuestro producto o situaciones de apoyo personal, te sugerimos acudir a los canales y líneas de atención especializadas de tu región.'

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

const PRODUCT_INTENTS: ChatbotIntent[] = [
  {
    keywords: [
      'que es bike tracker', 'qué es bike tracker', 'de que se trata', 'de qué se trata', 'que es esto', 'qué es esto',
      'como funciona', 'cómo funciona', 'que hace la app', 'qué hace la app', 'para que sirve', 'para qué sirve',
      'que es esta app', 'qué es esta app', 'que es la app', 'qué es la app', 'que es bike', 'de que trata',
    ],
    response:
      'Bike Tracker es la plataforma de LC Tech para moteros que ruedan en grupo: conecta a todo el convoy en un mapa en tiempo real (quién es el Líder, quién el Piloto Guardián, quién se rezaga), te guía con navegación turn-by-turn con voz estilo Waze, difunde un botón SOS con tu ubicación GPS exacta ante cualquier emergencia, y lleva el control digital de tus vehículos (SOAT, tecnomecánica, garaje). Funciona desde tu celular o instalada como app (PWA/APK), y también se ve en pantallas tipo CarPlay/Android Auto. Tiene un plan gratuito para empezar y planes Pro/Club para convoyes sin límite de pilotos. ¿Quieres que te cuente sobre el modo Convoy, el botón SOS o los planes?',
  },
  {
    keywords: ['precio', 'costo', 'cuanto cuesta', 'cuánto cuesta', 'plan', 'suscripcion', 'suscripción'],
    response:
      'Tenemos tres planes: 🆓 **Piloto Libre** ($0, convoy de hasta 3 pilotos, 1 vehículo y SOS básico), ⚡ **Convoy Pro** a $9.900 COP/mes (~$2.49 USD) o $79.900 COP/año (~$19.99 USD), con pilotos ilimitados, hasta 5 vehículos, telemetría avanzada, GPX y alertas por voz en intercomunicador; y 🏆 **Biker Club** a $39.900 COP/mes (~$9.99 USD), pensado para clubes moteros con hasta 25 pilotos por sala mediante una cuenta de club o un Código de Club. Puedes activarlos desde la sección "Ver Planes" dentro de la app o desde "Obtener Convoy Pro" en esta misma página.',
  },
  {
    keywords: [
      'como pago', 'cómo pago', 'metodo de pago', 'método de pago', 'medios de pago', 'nequi', 'daviplata', 'pse',
      'tarjeta de credito', 'tarjeta de crédito', 'tarjeta de debito', 'tarjeta de débito', 'pagar',
    ],
    response:
      'Puedes pagar tu suscripción con 📱 Nequi o Daviplata, 🏦 PSE (con los bancos principales de Colombia) o 💳 tarjeta de crédito/débito. El checkout está dentro de la app, en "Ver Planes" → elige Convoy Pro o Biker Club → selecciona tu método de pago y confirma: tu plan se activa al instante.',
  },
  {
    keywords: ['renovar', 'renovacion', 'renovación', 'vencimiento', 'vence mi plan', 'cuando vence', 'cuándo vence', 'cambiar de plan', 'actualizar plan'],
    response:
      'Puedes ver la fecha de vigencia de tu plan y renovarlo o cambiarlo en cualquier momento desde tu Perfil o el menú lateral, con el botón "🔄 Renovar Suscripción / Cambiar Plan". Ahí eliges el método de pago y tu plan queda activo de inmediato por 30 días (o 365 si eliges el plan anual de Convoy Pro).',
  },
  {
    keywords: ['codigo de club', 'código de club', 'canjear codigo', 'canjear código', 'club yamaha', 'biker crew', 'club bmw'],
    response:
      'Si tu club motero tiene un Código de Club (por ejemplo entregado por tu organización), puedes canjearlo en "Ver Planes" → "¿Tienes un Código de Club?". Esto activa el plan Biker Club al instante, con cupo de hasta 25 pilotos por sala de convoy.',
  },
  {
    keywords: ['convoy', 'grupo', 'rodada', 'lider', 'líder', 'guardian', 'guardián', 'rezagad'],
    response:
      'El modo Convoy conecta a todo el grupo en tiempo real sobre el mapa: ves quién va Líder, quién es el Piloto Guardián y si alguien se rezaga o se desvía de la ruta, con alertas visuales al instante para que nunca se pierdan en una curva.',
  },
  {
    keywords: ['guante', 'guantes'],
    response:
      'Sí — el Modo Guantes (In-Ride Glove Mode) usa botones gigantes de al menos 70px, pensados para activarse de un solo toque con guantes de protección puestos y con miradas de medio segundo al manillar.',
  },
  {
    keywords: ['carplay', 'android auto', 'pantalla del carro', 'moto pantalla'],
    response:
      'Bike Tracker incluye una vista optimizada estilo CarPlay/Android Auto dentro del showcase de la app, con velocímetro y estado del convoy en alto contraste para tableros y pantallas montadas en el manillar.',
  },
  {
    keywords: ['bateria', 'batería', 'consumo', 'gps'],
    response:
      'La app está optimizada para bajo consumo de batería en rutas largas: usa actualizaciones de posición eficientes y puedes activar el modo de alto contraste solo cuando lo necesites.',
  },
  {
    keywords: ['sin señal', 'sin senal', 'sin internet', 'offline', 'mesh', 'zona sin cobertura'],
    response:
      'Estamos trabajando en un modo offline/mesh para zonas sin cobertura celular, que permitirá mantener el convoy sincronizado incluso en tramos sin señal. Por ahora, la telemetría en vivo requiere datos móviles.',
  },
  {
    keywords: ['sos', 'emergencia', 'accidente', 'auxilio'],
    response:
      'El botón SOS difunde tu ubicación GPS exacta a todo el convoy con una sola pulsación mantenida (para evitar falsos positivos), acompañado de sirena y vibración, tanto en la app como en el Modo Guantes.',
  },
  {
    keywords: ['registro', 'registrarme', 'crear cuenta', 'iniciar sesion', 'iniciar sesión', 'google'],
    response:
      'Puedes registrarte gratis con tu cuenta de Google o con tu correo desde el botón "Iniciar Rodada Gratis" — el proceso toma menos de un minuto y luego te pedimos registrar tu primera moto.',
  },
  {
    keywords: ['contacto', 'lc tech', 'soporte', 'ayuda tecnica', 'ayuda técnica', 'whatsapp', 'correo', 'club motero', 'registrar mi club'],
    response:
      'LC Tech — Tecnología inteligente que te respalda. Puedes escribirnos por WhatsApp o correo (soporte@biketracker.app) desde la sección "Contacto" al final de esta página — ahí también puedes registrar a tu club motero para el plan Biker Club, o escribirnos desde la sección de Soporte dentro de la app una vez inicies sesión.',
  },
]

const FALLBACK_RESPONSE =
  'Puedo ayudarte con información sobre precios y planes, métodos de pago, renovación de tu suscripción, códigos de club, el modo Convoy, compatibilidad con guantes y CarPlay/Android Auto, batería, el modo sin señal, el botón SOS o cómo registrarte. ¿Sobre cuál te gustaría saber más?'

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
  '¿Qué es Bike Tracker?',
  '¿Qué incluye Convoy Pro?',
  '¿Cómo pago mi suscripción?',
  '¿Tiene alerta SOS?',
]
