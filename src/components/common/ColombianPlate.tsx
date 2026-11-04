/** Formatea la placa al estilo troquelado colombiano: 6 caracteres → 'RTX · 880' / 'MCP · 412' (y motos 'ABC · 12D').
 *  Cualquier otro largo se muestra tal cual, en mayúsculas y sin espacios. */
export function formatPlate(plate: string): string {
  const clean = plate.replace(/[\s·.-]/g, '').toUpperCase()
  return clean.length === 6 ? `${clean.slice(0, 3)} · ${clean.slice(3)}` : clean
}

type PlateSize = 'sm' | 'md' | 'lg'

const SIZES: Record<PlateSize, { box: string; plate: string; subtitle: string }> = {
  sm: { box: 'px-1.5 pb-[3px] pt-[3px]', plate: 'text-[11px]', subtitle: 'mt-px text-[6px]' },
  md: { box: 'px-2.5 pb-1 pt-1', plate: 'text-[14px]', subtitle: 'mt-0.5 text-[7px] md:text-[8px]' },
  lg: { box: 'px-3 pb-1.5 pt-1.5', plate: 'text-[17px]', subtitle: 'mt-1 text-[8px]' },
}

interface ColombianPlateProps {
  plate: string
  /** Texto inferior (municipio, país o marca). Por defecto 'COLOMBIA'. */
  subtitle?: string
  size?: PlateSize
  className?: string
}

/** Placa vehicular colombiana: fondo amarillo reflectivo, marco negro troquelado de 2px, caracteres negros
 *  monoespaciados con punto central y leyenda inferior en mayúsculas. */
export default function ColombianPlate({ plate, subtitle = 'COLOMBIA', size = 'md', className = '' }: ColombianPlateProps) {
  const s = SIZES[size]
  return (
    <span
      className={`inline-flex flex-col items-center rounded-md border-2 border-slate-950 bg-[#FACC15] text-slate-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.1)] ${s.box} ${className}`}
      aria-label={`Placa ${plate}`}
    >
      <span className={`whitespace-nowrap font-mono font-black leading-none tracking-widest ${s.plate}`}>{formatPlate(plate)}</span>
      {subtitle && (
        <span
          className={`max-w-full truncate font-black uppercase leading-none tracking-[0.2em] text-slate-900 ${s.subtitle}`}
        >
          {subtitle}
        </span>
      )}
    </span>
  )
}
