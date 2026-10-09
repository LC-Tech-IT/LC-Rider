import { useApp } from '../../context/AppContext'

export default function Toast() {
  const { toastMessage } = useApp()

  if (!toastMessage) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[70] flex justify-center px-4 pt-3" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}>
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-bike-border bg-white px-4 py-3 text-sm font-semibold text-bike-ink shadow-2xl">
        {toastMessage}
      </div>
    </div>
  )
}
