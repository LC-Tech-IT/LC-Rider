import { useApp } from '../../context/AppContext'
import type { Lang } from '../../types'

const CONTACT_EMAIL = 'contacto@lcsynctech.com'
const CONTACT_WHATSAPP = '+57 350 520 8592'

interface PolicySection {
  title: string
  paragraphs: string[]
  bullets?: string[]
}

/** Política de Tratamiento de Datos Personales (Ley Estatutaria 1581 de 2012 y Decreto 1377 de 2013).
 *  El texto debe ser validado por asesoría jurídica antes de cada cambio de versión (PRIVACY_POLICY_VERSION). */
const POLICY: Record<Lang, { updated: string; intro: string; sections: PolicySection[] }> = {
  es: {
    updated: 'Última actualización: 11 de octubre de 2026',
    intro:
      'En LC Rider respetamos tu privacidad. Esta política explica qué datos personales tratamos, para qué, cómo los protegemos y cómo puedes ejercer tus derechos como titular conforme a la Ley Estatutaria 1581 de 2012 (Habeas Data) y el Decreto 1377 de 2013.',
    sections: [
      {
        title: '1. Responsable del Tratamiento',
        paragraphs: [
          `LC SyncTech, operador de la plataforma LC Rider, con domicilio en Colombia. Canales de atención: correo ${CONTACT_EMAIL} y WhatsApp ${CONTACT_WHATSAPP}.`,
        ],
      },
      {
        title: '2. Datos que Recolectamos',
        paragraphs: ['Tratamos únicamente los datos necesarios para prestar el servicio:'],
        bullets: [
          'Identificación y contacto: nombre, apellidos, correo electrónico y teléfono; de forma opcional, género, edad y foto de perfil.',
          'Garaje: placa, marca y modelo de tus vehículos, fechas de vencimiento del SOAT y la revisión tecnomecánica, y las fotos o PDF de esos documentos si decides cargarlos.',
          'Suscripción: plan contratado, fecha de vigencia y código de club. Los pagos los procesa la pasarela Wompi: LC Rider no almacena números de tarjeta ni credenciales bancarias.',
          'Datos técnicos: un identificador de sesión por dispositivo, usado para permitir un solo dispositivo activo por cuenta.',
        ],
      },
      {
        title: '3. Tratamiento Especial de la Geolocalización (GPS en Tiempo Real)',
        paragraphs: [
          'Tus coordenadas GPS se usan únicamente mientras tienes una rodada activa o estás dentro de una sala de convoy, y solo para mostrar tu posición en el mapa del convoy, calcular la distancia al líder, detectar pilotos rezagados y enviar tu ubicación exacta cuando activas el botón SOS.',
          'Tu ubicación se transmite en tiempo real solo a los miembros de tu convoy y no guardamos un historial de tus recorridos en nuestros servidores.',
          'Tus datos de ubicación NUNCA se venden, arriendan ni comparten con anunciantes ni con terceros con fines comerciales.',
        ],
      },
      {
        title: '4. Finalidades del Tratamiento',
        paragraphs: ['Usamos tus datos para:'],
        bullets: [
          'Operar el modo convoy, la navegación y el botón SOS.',
          'Emitir alertas de seguridad vial y avisos de vencimiento de los documentos de tu garaje.',
          'Gestionar tu cuenta, tu suscripción y la facturación de los planes de pago.',
          'Atender tus consultas, peticiones, quejas y reclamos (PQR).',
        ],
      },
      {
        title: '5. Derechos del Titular (Ley 1581 de 2012, art. 8)',
        paragraphs: ['Como titular de los datos tienes derecho a:'],
        bullets: [
          'Conocer, actualizar y rectificar tus datos personales.',
          'Solicitar prueba de la autorización que nos otorgaste.',
          'Ser informado sobre el uso que les damos a tus datos.',
          'Revocar la autorización y solicitar la supresión de tus datos (derecho al olvido).',
          'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).',
          'Acceder de forma gratuita a tus datos personales.',
        ],
      },
      {
        title: '6. Procedimiento para Ejercer tus Derechos y Supresión',
        paragraphs: [
          'Puedes eliminar tu cuenta tú mismo en cualquier momento desde Perfil → "Eliminar mi cuenta y mis datos": se suprimen de inmediato tu perfil, tu garaje, tus documentos y tu suscripción.',
          `También puedes escribirnos a ${CONTACT_EMAIL} o al WhatsApp ${CONTACT_WHATSAPP}. Las consultas se atienden en un máximo de 10 días hábiles y los reclamos en un máximo de 15 días hábiles, según los artículos 14 y 15 de la Ley 1581 de 2012.`,
        ],
      },
      {
        title: '7. Seguridad de la Información',
        paragraphs: [
          'Toda la información viaja cifrada (TLS/HTTPS) y se almacena en bases de datos protegidas con Row Level Security (RLS), de modo que cada cuenta solo puede acceder a sus propios datos.',
          'Para operar el servicio nos apoyamos en encargados del tratamiento: Supabase (infraestructura en la nube, que puede implicar almacenamiento fuera de Colombia con estándares adecuados de protección) y Wompi (procesamiento de pagos).',
        ],
      },
      {
        title: '8. Vigencia',
        paragraphs: [
          'Tus datos se conservan mientras tu cuenta esté activa. Al eliminarla, se suprimen de nuestras bases de datos, salvo la información que debamos conservar por obligación legal (por ejemplo, soportes contables de pagos).',
        ],
      },
    ],
  },
  en: {
    updated: 'Last updated: October 11, 2026',
    intro:
      'At LC Rider we respect your privacy. This policy explains which personal data we process, why, how we protect it and how you can exercise your rights as a data subject under Colombian Statutory Law 1581 of 2012 (Habeas Data) and Decree 1377 of 2013.',
    sections: [
      {
        title: '1. Data Controller',
        paragraphs: [
          `LC SyncTech, operator of the LC Rider platform, based in Colombia. Support channels: email ${CONTACT_EMAIL} and WhatsApp ${CONTACT_WHATSAPP}.`,
        ],
      },
      {
        title: '2. Data We Collect',
        paragraphs: ['We only process the data needed to provide the service:'],
        bullets: [
          'Identity and contact: first name, last name, email and phone; optionally gender, age and profile photo.',
          'Garage: plate, make and model of your vehicles, SOAT and technical inspection expiry dates, and photos or PDFs of those documents if you choose to upload them.',
          "Subscription: plan, validity date and club code. Payments are processed by the Wompi gateway: LC Rider doesn't store card numbers or banking credentials.",
          'Technical data: one session identifier per device, used to allow a single active device per account.',
        ],
      },
      {
        title: '3. Special Handling of Geolocation (Real-Time GPS)',
        paragraphs: [
          "Your GPS coordinates are used only while you have an active ride or are inside a convoy room, and only to show your position on the convoy map, compute the distance to the leader, detect riders who fall behind and send your exact location when you trigger the SOS button.",
          "Your location is streamed in real time only to the members of your convoy, and we don't keep a history of your rides on our servers.",
          'Your location data is NEVER sold, rented or shared with advertisers or third parties for commercial purposes.',
        ],
      },
      {
        title: '4. Purposes of Processing',
        paragraphs: ['We use your data to:'],
        bullets: [
          'Run convoy mode, navigation and the SOS button.',
          'Send road-safety alerts and expiry reminders for your garage documents.',
          'Manage your account, subscription and billing for paid plans.',
          'Handle your questions, requests, complaints and claims.',
        ],
      },
      {
        title: '5. Your Rights (Law 1581 of 2012, art. 8)',
        paragraphs: ['As the data subject you have the right to:'],
        bullets: [
          'Access, update and correct your personal data.',
          'Request proof of the authorization you granted us.',
          'Be informed about how your data is used.',
          'Revoke your authorization and request deletion of your data (right to be forgotten).',
          'File complaints with the Superintendence of Industry and Commerce (SIC).',
          'Access your personal data free of charge.',
        ],
      },
      {
        title: '6. How to Exercise Your Rights and Request Deletion',
        paragraphs: [
          'You can delete your account yourself at any time from Profile → "Delete my account and my data": your profile, garage, documents and subscription are erased immediately.',
          `You can also write to ${CONTACT_EMAIL} or WhatsApp ${CONTACT_WHATSAPP}. Queries are answered within 10 business days and claims within 15 business days, per articles 14 and 15 of Law 1581 of 2012.`,
        ],
      },
      {
        title: '7. Information Security',
        paragraphs: [
          'All information travels encrypted (TLS/HTTPS) and is stored in databases protected with Row Level Security (RLS), so each account can only access its own data.',
          'To run the service we rely on data processors: Supabase (cloud infrastructure, which may involve storage outside Colombia under adequate protection standards) and Wompi (payment processing).',
        ],
      },
      {
        title: '8. Retention',
        paragraphs: [
          'Your data is kept while your account is active. When you delete it, it is erased from our databases, except for information we must keep by law (for example, payment accounting records).',
        ],
      },
    ],
  },
}

export default function PrivacyPolicyModal() {
  const { privacyModalOpen, setPrivacyModalOpen, lang, t } = useApp()

  if (!privacyModalOpen) return null

  const policy = POLICY[lang]

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={() => setPrivacyModalOpen(false)}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-bike-border bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        <div className="flex items-start justify-between gap-3 border-b border-bike-border px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-bike-orange">🔒 Habeas Data · Ley 1581</p>
            <h2 id="privacy-title" className="mt-0.5 font-display text-lg font-black text-bike-ink">
              {t('privacy.title')}
            </h2>
            <p className="text-[11px] text-slate-400">{policy.updated}</p>
          </div>
          <button onClick={() => setPrivacyModalOpen(false)} className="text-2xl leading-none text-slate-400" aria-label={t('privacy.close')}>
            ×
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm leading-relaxed text-slate-600">
          <p>{policy.intro}</p>
          {policy.sections.map((section) => (
            <section key={section.title}>
              <h3 className="mb-1.5 font-display text-sm font-bold text-bike-ink">{section.title}</h3>
              {section.paragraphs.map((p) => (
                <p key={p} className="mb-1.5">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-1 pl-1">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="font-bold text-bike-orange">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="border-t border-bike-border px-5 py-3">
          <button
            onClick={() => setPrivacyModalOpen(false)}
            className="w-full rounded-xl bg-bike-orange py-3 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
          >
            {t('privacy.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
