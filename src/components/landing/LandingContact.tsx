import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { IconMail, IconPin, IconSend, IconWhatsApp } from './LandingIcons'

const SUBJECT_OPTIONS = [
  { value: 'support', label: 'Soporte técnico' },
  { value: 'club', label: 'Registro de Club Motero' },
  { value: 'plans', label: 'Información de Planes' },
]

const WHATSAPP_NUMBER = '573505208592'
const WHATSAPP_MESSAGE = 'Hola LC Rider, quisiera más información sobre la app y los planes Pro'
const CONTACT_EMAIL = 'contacto@lcsynctech.com'

export default function LandingContact() {
  const { showToast } = useApp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(SUBJECT_OPTIONS[0].value)
  const [message, setMessage] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Completa tu nombre, correo y mensaje antes de enviar.')
      return
    }

    const subjectLabel = SUBJECT_OPTIONS.find((opt) => opt.value === subject)?.label ?? 'Consulta LC Rider'
    const body = `Nombre: ${name}\nCorreo: ${email}\n\n${message}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subjectLabel)}&body=${encodeURIComponent(body)}`

    showToast('¡Mensaje enviado! Nuestro equipo te contactará muy pronto.')
    setName('')
    setEmail('')
    setSubject(SUBJECT_OPTIONS[0].value)
    setMessage('')
  }

  const labelClass = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500'
  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20'

  return (
    <section id="contact" className="border-t border-white/[0.06] bg-[#05070C]">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1400px] px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">Contacto</p>
          <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ¿Preguntas o representas a un club motero?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400">
            Estamos aquí para apoyarte en cada kilómetro. Escríbenos o conéctate con nuestro equipo.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-[1.3fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-white sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contact-name" className={labelClass}>
                  Nombre
                </label>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={fieldClass}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className={labelClass}>
                  Correo electrónico
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className={fieldClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="contact-subject" className={labelClass}>
                Asunto
              </label>
              <select id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className={fieldClass}>
                {SUBJECT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="contact-message" className={labelClass}>
                Mensaje
              </label>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos en qué podemos ayudarte..."
                rows={5}
                className={`${fieldClass} resize-none`}
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-[0.98]"
            >
              <IconSend className="h-4 w-4" />
              Enviar Mensaje
            </button>
          </form>

          <div className="space-y-3">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-white/20 hover:bg-slate-900"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-[#25D366]">
                <IconWhatsApp className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">WhatsApp Oficial</p>
                <p className="text-xs text-slate-400">Soporte y ventas en tiempo real.</p>
              </div>
            </a>

            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Consulta%20LC%20Rider`}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-white/20 hover:bg-slate-900"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <IconMail className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Correo Electrónico</p>
                <p className="truncate text-xs text-slate-400">{CONTACT_EMAIL}</p>
              </div>
            </a>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300">
                <IconPin className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Sede</p>
                <p className="text-xs text-slate-400">Bogotá D.C., Colombia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
