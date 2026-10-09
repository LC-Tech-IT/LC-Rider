import { useEffect, useRef, useState } from 'react'
import { getChatbotResponse, SUGGESTED_PROMPTS } from '../../services/chatbotService'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: '¡Hola! Soy el Asistente Biker de LC Tech 🏍️. Puedo ayudarte a elegir tu plan, armar tu convoy, renovar tu suscripción o resolver cualquier duda técnica de la app. Por cierto, con Convoy Pro tu convoy queda ilimitado y desbloqueas alertas por voz — ¿quieres que te cuente más?',
}

interface LandingChatbotProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function LandingChatbot({ open: openProp, onOpenChange }: LandingChatbotProps) {
  const [openState, setOpenState] = useState(false)
  const open = openProp ?? openState
  const setOpen = (next: boolean) => {
    setOpenState(next)
    onOpenChange?.(next)
  }
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      const response = getChatbotResponse(trimmed)
      setMessages((prev) => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: response }])
      setTyping(false)
    }, 500)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 max-w-[85vw] flex-col overflow-hidden rounded-3xl border border-bike-border bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-bike-border bg-bike-surface px-4 py-3">
            <div>
              <p className="font-display text-sm font-bold text-bike-ink">💬 Asistente Biker</p>
              <p className="text-[10px] text-slate-500">Bike Tracker · LC Tech</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-xl leading-none text-slate-400" aria-label="Cerrar chat">
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user' ? 'bg-bike-blue text-white' : 'bg-bike-surface text-bike-ink'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-bike-surface px-3 py-2 text-xs text-slate-500">Escribiendo…</div>
              </div>
            )}
          </div>

          <div className="border-t border-bike-border px-3 pb-2 pt-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-bike-border px-2.5 py-1 text-[10px] font-medium text-slate-600 transition hover:border-bike-blue hover:text-bike-blue"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 rounded-full border border-bike-border bg-bike-surface px-3 py-2 text-xs text-bike-ink placeholder:text-slate-400 focus:border-bike-blue focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bike-blue text-sm text-white transition active:scale-95"
                aria-label="Enviar mensaje"
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full bg-bike-orange px-4 py-3 text-sm font-bold text-white shadow-glow-orange transition active:scale-95"
      >
        💬 Asistente Biker
      </button>
    </div>
  )
}
