import { useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'
import type { AppView } from '../../types'

const ITEMS: Array<{ view: AppView; icon: string; labelKey: string }> = [
  { view: 'cockpit', icon: '📊', labelKey: 'nav.tablero' },
  { view: 'map', icon: '🗺️', labelKey: 'nav.mapa' },
  { view: 'garage', icon: '🛠️', labelKey: 'nav.garaje' },
  { view: 'convoy', icon: '👥', labelKey: 'nav.convoy' },
]

const HOLD_DURATION_MS = 2000

export default function BottomNav() {
  const { view, setView, triggerSOS, cancelSOS, sosActive, t } = useApp()
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRaf = useRef<number | null>(null)
  const holdStart = useRef<number | null>(null)

  function startHold() {
    holdStart.current = performance.now()
    const step = (now: number) => {
      if (holdStart.current === null) return
      const elapsed = now - holdStart.current
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS)
      setHoldProgress(progress)
      if (progress >= 1) {
        if (sosActive) cancelSOS()
        else triggerSOS()
        setHoldProgress(0)
        holdStart.current = null
        return
      }
      holdRaf.current = requestAnimationFrame(step)
    }
    holdRaf.current = requestAnimationFrame(step)
  }

  function stopHold() {
    holdStart.current = null
    setHoldProgress(0)
    if (holdRaf.current) cancelAnimationFrame(holdRaf.current)
  }

  return (
    <nav
      className="relative z-30 flex items-center justify-around border-t border-bike-border bg-white px-1"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {ITEMS.slice(0, 2).map((item) => (
        <NavButton key={item.view} icon={item.icon} label={t(item.labelKey)} active={view === item.view} onClick={() => setView(item.view)} />
      ))}

      <button
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        className={`relative -mt-7 flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full border-4 border-white bg-status-danger text-white shadow-glow-red active:scale-95 transition ${
          sosActive ? 'animate-pulseRing' : ''
        }`}
        aria-label={sosActive ? t('sos.holdToDeactivateAria') : t('sos.holdToActivateAria')}
        title={sosActive ? t('sos.holdToDeactivateAria') : t('sos.holdToActivateAria')}
      >
        {holdProgress > 0 && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r="32"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * 32}
              strokeDashoffset={2 * Math.PI * 32 * (1 - holdProgress)}
              strokeLinecap="round"
            />
          </svg>
        )}
        <span className="text-2xl">🆘</span>
        <span className="text-[10px] font-bold tracking-wide">{t('sos.button')}</span>
      </button>

      {ITEMS.slice(2).map((item) => (
        <NavButton key={item.view} icon={item.icon} label={t(item.labelKey)} active={view === item.view} onClick={() => setView(item.view)} />
      ))}
    </nav>
  )
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[60px] min-w-[60px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[10px] font-semibold transition ${
        active ? 'text-bike-orange' : 'text-slate-400'
      }`}
    >
      <span className="text-xl transition">{icon}</span>
      {label}
    </button>
  )
}
