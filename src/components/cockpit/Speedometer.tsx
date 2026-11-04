const MAX_SPEED = 200
const START_ANGLE = -220
const END_ANGLE = 40
const SIZE = 280
const CENTER = SIZE / 2
const RADIUS = 118

function polarToCartesian(angleDeg: number, radius: number) {
  const angleRad = (angleDeg * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(angleRad),
    y: CENTER + radius * Math.sin(angleRad),
  }
}

function describeArc(startAngle: number, endAngle: number, radius: number) {
  const start = polarToCartesian(startAngle, radius)
  const end = polarToCartesian(endAngle, radius)
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`
}

function speedToAngle(speed: number): number {
  const clamped = Math.min(Math.max(speed, 0), MAX_SPEED)
  return START_ANGLE + (clamped / MAX_SPEED) * (END_ANGLE - START_ANGLE)
}

const TICKS = Array.from({ length: 11 }, (_, i) => i * (MAX_SPEED / 10))

/** `theme="dark"` adapta pista, marcas y cifras a fondos oscuros (maqueta HUD de la landing). Por defecto es claro,
 *  tal como se usa en el Cockpit de la app. */
export default function Speedometer({ speed, theme = 'light' }: { speed: number; theme?: 'light' | 'dark' }) {
  const dark = theme === 'dark'
  const needleAngle = speedToAngle(speed)
  const progressPath = describeArc(START_ANGLE, needleAngle, RADIUS)
  const trackPath = describeArc(START_ANGLE, END_ANGLE, RADIUS)
  const needleTip = polarToCartesian(needleAngle, RADIUS - 22)

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <defs>
          <linearGradient id="speedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C2E8" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path d={trackPath} fill="none" stroke={dark ? '#1A2233' : '#E2E8F0'} strokeWidth={14} strokeLinecap="round" />
        <path
          d={progressPath}
          fill="none"
          stroke="url(#speedGradient)"
          strokeWidth={14}
          strokeLinecap="round"
          style={{ transition: 'd 0.25s linear' }}
        />

        {TICKS.map((tickSpeed) => {
          const angle = speedToAngle(tickSpeed)
          const outer = polarToCartesian(angle, RADIUS + 12)
          const inner = polarToCartesian(angle, RADIUS + 2)
          const label = polarToCartesian(angle, RADIUS - 22)
          return (
            <g key={tickSpeed}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke={dark ? '#475569' : '#94A3B8'} strokeWidth={2} />
              <text
                x={label.x}
                y={label.y}
                fill={dark ? '#94A3B8' : '#475569'}
                fontSize={10}
                fontFamily="Orbitron"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {tickSpeed}
              </text>
            </g>
          )
        })}

        <line
          x1={CENTER}
          y1={CENTER}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="#F97316"
          strokeWidth={3}
          strokeLinecap="round"
          filter="url(#glow)"
          style={{ transition: 'all 0.25s linear' }}
        />
        <circle cx={CENTER} cy={CENTER} r={8} fill="#F97316" filter="url(#glow)" />
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-6">
        <span className={`font-display text-5xl font-black tabular-nums ${dark ? 'text-white' : 'text-bike-ink'}`}>
          {Math.round(speed)}
        </span>
        <span className={`mt-1 text-xs font-semibold tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>KM/H</span>
      </div>
    </div>
  )
}
