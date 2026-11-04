import { useApp } from '../../context/AppContext'
import type { ConvoyMember, ConvoyStatus } from '../../types'
import { IconAlert, IconHome, IconSignal, IconSos } from './Icons'

/** Menos de 1 hora → MM:SS en minutos; desde 1 hora → HH:MM en horas (una rodada corta no debe verse como 00:00 h). */
function formatElapsed(totalSeconds: number): { value: string; unit: string } {
  const pad = (n: number) => n.toString().padStart(2, '0')
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  if (h === 0) return { value: `${pad(m)}:${pad(totalSeconds % 60)}`, unit: 'min' }
  return { value: `${pad(h)}:${pad(m)}`, unit: 'h' }
}

/** Orden de la formación: el líder abre, los pilotos en medio y el guardián cierra. */
const ROLE_ORDER: Record<ConvoyMember['role'], number> = { lider: 0, piloto: 1, guardian: 2 }

/** Solo se confirma "llegó a casa" para quien terminó en ruta con el convoy; un rezagado, un SOS activo o un
 *  piloto sin señal se muestran con su estado real en lugar de darlos por llegados. */
const STATUS_BADGE: Record<ConvoyStatus, { key: string; className: string; Icon: typeof IconHome }> = {
  'en-ruta': { key: 'rideSummary.arrived', className: 'text-emerald-400', Icon: IconHome },
  rezagado: { key: 'rideSummary.laggard', className: 'text-amber-400', Icon: IconAlert },
  sos: { key: 'rideSummary.sos', className: 'text-red-400', Icon: IconSos },
  offline: { key: 'rideSummary.offline', className: 'text-slate-400', Icon: IconSignal },
}

export default function RideSummaryModal() {
  const { rideSummary, closeRideSummary, setView, t } = useApp()

  if (!rideSummary) return null

  const members = [...rideSummary.members].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
  const arrivedCount = members.filter((m) => m.status === 'en-ruta').length
  const totalCount = members.length
  const complete = arrivedCount === totalCount
  const elapsed = formatElapsed(rideSummary.elapsedSeconds)
  const youLabel = t('rideSummary.you')

  function handleClose() {
    closeRideSummary()
    setView('cockpit')
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ride-summary-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F18] text-white shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <h2 id="ride-summary-title" className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {t('rideSummary.title')}
          </h2>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${
              complete ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${complete ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {complete ? t('rideSummary.complete') : t('rideSummary.pending', { count: totalCount - arrivedCount })}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 px-5 py-5">
          <Stat label={t('rideSummary.distance')} value={rideSummary.distanceKm.toFixed(1)} unit="km" />
          <Stat label={t('rideSummary.time')} value={elapsed.value} unit={elapsed.unit} />
          <Stat label={t('rideSummary.home')} value={`${arrivedCount}/${totalCount}`} />
        </div>

        <ul className="flex-1 space-y-2 overflow-y-auto px-5 pb-5">
          {members.map((member) => {
            const badge = STATUS_BADGE[member.status]
            return (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {member.name}
                    {member.isCurrentUser && member.name !== youLabel && <span className="font-normal text-slate-500"> · {youLabel}</span>}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{t(`role.${member.role}`)}</p>
                </div>
                <span className={`inline-flex flex-shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${badge.className}`}>
                  <badge.Icon className="h-4 w-4" />
                  {t(badge.key)}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="border-t border-white/[0.08] p-4">
          <button
            onClick={handleClose}
            className="min-h-[52px] w-full rounded-xl bg-orange-600 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-[0.98]"
          >
            {t('rideSummary.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className="font-display text-2xl font-bold tabular-nums text-white">{value}</span>
        {unit && <span className="text-[11px] text-slate-500">{unit}</span>}
      </p>
    </div>
  )
}
