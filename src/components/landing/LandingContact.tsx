import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const SUBJECT_OPTIONS = [
  { value: 'support', label: 'Soporte técnico' },
  { value: 'club', label: 'Registro de Club Motero' },
  { value: 'plans', label: 'Información de Planes' },
]

const WHATSAPP_NUMBER = '573505208592'
const WHATSAPP_MESSAGE = 'Hola Bike Tracker, quisiera más información sobre la app y los planes Pro'
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

    const subjectLabel = SUBJECT_OPTIONS.find((opt) => opt.value === subject)?.label ?? 'Consulta Bike Tracker'
    const body = `Nombre: ${name}\nCorreo: ${email}\n\n${message}`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subjectLabel)}&body=${encodeURIComponent(body)}`

    showToast('¡Mensaje enviado! Nuestro equipo te contactará muy pronto.')
    setName('')
    setEmail('')
    setSubject(SUBJECT_OPTIONS[0].value)
    setMessage('')
  }

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="text-center font-display text-2xl font-black text-bike-ink sm:text-3xl">
        ¿Tienes Preguntas o Representas a un Club Motero?
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-600 sm:text-base">
        Estamos aquí para apoyarte en cada kilómetro. Escríbenos o conéctate con nuestro equipo.
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-bike-border bg-white p-6 shadow-soft">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
              className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Asunto</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink focus:border-bike-blue focus:outline-none"
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-slate-400">Mensaje</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Cuéntanos en qué podemos ayudarte..."
              rows={4}
              className="w-full resize-none rounded-xl border border-bike-border bg-slate-50 px-4 py-3 text-sm text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
          >
            ✉️ Enviar Mensaje
          </button>
        </form>

        <div className="space-y-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-3xl border border-bike-border bg-white p-5 shadow-soft transition hover:shadow-card"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: '#25D36622' }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="#25D366" aria-hidden="true">
                <path d="M16.004 3C9.086 3 3.5 8.55 3.5 15.42c0 2.36.65 4.57 1.78 6.46L3 29l7.32-2.24a13.02 13.02 0 0 0 5.68 1.31h.005c6.92 0 12.5-5.55 12.5-12.42C28.5 8.78 22.92 3 16.004 3Zm0 22.7h-.004a10.6 10.6 0 0 1-5.4-1.48l-.387-.23-4.34 1.33 1.36-4.22-.253-.43a10.32 10.32 0 0 1-1.58-5.5c0-5.71 4.66-10.35 10.41-10.35 2.78 0 5.39 1.08 7.36 3.04a10.24 10.24 0 0 1 3.05 7.33c0 5.71-4.67 10.35-10.42 10.35Zm5.7-7.76c-.31-.16-1.85-.91-2.14-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-1 1.23-.18.21-.37.23-.68.08-.31-.16-1.32-.49-2.51-1.55-.93-.83-1.56-1.85-1.74-2.16-.18-.31-.02-.48.14-.63.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.1-.21.05-.39-.02-.55-.08-.16-.71-1.72-.97-2.35-.26-.62-.52-.54-.71-.55h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.26.16.21 2.22 3.4 5.39 4.76.75.33 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.85-.76 2.11-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.36Z" />
              </svg>
            </span>
            <div>
              <p className="font-display text-sm font-bold text-bike-ink">WhatsApp Oficial</p>
              <p className="text-xs text-slate-500">Chatea con nuestro equipo de soporte y ventas en tiempo real.</p>
            </div>
          </a>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Consulta%20Bike%20Tracker`}
            className="flex items-center gap-4 rounded-3xl border border-bike-border bg-white p-5 shadow-soft transition hover:shadow-card"
          >
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-50">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 6 10 7 10-7" />
              </svg>
            </span>
            <div>
              <p className="font-display text-sm font-bold text-bike-ink">Correo Electrónico</p>
              <p className="text-xs text-slate-500">{CONTACT_EMAIL}</p>
            </div>
          </a>

          <div className="flex items-center gap-4 rounded-3xl border border-bike-border bg-white p-5 shadow-soft">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">📍</span>
            <div>
              <p className="font-display text-sm font-bold text-bike-ink">Sede</p>
              <p className="text-xs text-slate-500">Bogotá D.C., Colombia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
