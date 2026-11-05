import { useEffect, useRef, useState } from 'react'
import { getChatbotResponse, SUGGESTED_PROMPTS } from '../../services/chatbotService'
import { IconChat, IconSend } from './LandingIcons'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'bot',
  text: '¡Hola! Soy el Asistente LC Rider de LC SyncTech 🏍️. Puedo ayudarte a elegir tu plan, armar tu convoy, renovar tu suscripción o resolver cualquier duda técnica de la app. Por cierto, con Convoy Pro tu convoy se amplía a 12 pilotos y desbloqueas alertas por voz — ¿quieres que te cuente más?',
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
        <div className="mb-3 flex h-[28rem] w-80 max-w-[85vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F18] shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Asistente LC Rider
              </p>
              <p className="text-[10px] text-slate-500">LC Rider · LC SyncTech</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-xl leading-none text-slate-500 transition hover:text-white" aria-label="Cerrar chat">
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    m.role === 'user' ? 'bg-orange-600 text-white' : 'border border-white/[0.06] bg-white/[0.04] text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs text-slate-500">Escribiendo…</div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.08] px-3 pb-2 pt-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-md border border-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-400 transition hover:border-orange-500/50 hover:text-orange-300"
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
                className="flex-1 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none"
              />
              <button
                type="submit"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white transition hover:bg-orange-500 active:scale-95"
                aria-label="Enviar mensaje"
              >
                <IconSend className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0F18]/95 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-black/50 backdrop-blur transition hover:border-orange-500/50 active:scale-95"
      >
        <IconChat className="h-4 w-4 text-orange-400" />
        Asistente LC Rider
      </button>
    </div>
  )
}
