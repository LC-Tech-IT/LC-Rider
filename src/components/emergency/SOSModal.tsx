import { useEffect, useRef, useState } from 'react'
import { useApp } from '../../context/AppContext'

const HOLD_DURATION_MS = 2000

export default function SOSModal() {
  const { sosActive, cancelSOS, convoyMembers, t } = useApp()
  const [dismissed, setDismissed] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const holdRaf = useRef<number | null>(null)
  const holdStart = useRef<number | null>(null)

  useEffect(() => {
    if (sosActive) setDismissed(false)
  }, [sosActive])

  if (!sosActive || dismissed) return null

  const user = convoyMembers.find((m) => m.isCurrentUser)

  function startHold() {
    holdStart.current = performance.now()
    const step = (now: number) => {
      if (holdStart.current === null) return
      const elapsed = now - holdStart.current
      const progress = Math.min(1, elapsed / HOLD_DURATION_MS)
      setHoldProgress(progress)
      if (progress >= 1) {
        cancelSOS()
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
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-status-danger/95 px-6 text-center backdrop-blur-sm">
      <div className="flex h-24 w-24 animate-pulseRing items-center justify-center rounded-full bg-white/10 text-5xl">
        🆘
      </div>
      <div>
        <h1 className="font-display text-2xl font-black text-white">{t('sos.alertActive')}</h1>
        <p className="mt-2 text-sm text-white/80">{t('sos.broadcast')}</p>
        {user && (
          <p className="mt-1 font-mono text-xs text-white/70">
            {user.position.lat.toFixed(5)}, {user.position.lng.toFixed(5)}
          </p>
        )}
      </div>

      <button
        onPointerDown={startHold}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-white/40 bg-black/30 text-sm font-bold text-white active:scale-95"
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 46}
            strokeDashoffset={2 * Math.PI * 46 * (1 - holdProgress)}
            strokeLinecap="round"
          />
        </svg>
        <span className="px-4">{t('sos.holdToCancel')}</span>
      </button>

      <button onClick={() => setDismissed(true)} className="text-xs font-semibold text-white/70 underline">
        {t('sos.minimize')}
      </button>
    </div>
  )
}
