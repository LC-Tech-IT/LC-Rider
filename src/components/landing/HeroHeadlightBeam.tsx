/** Fondo cinematográfico del Hero: en la penumbra aparece la firma lumínica frontal de una moto naked/deportiva
 *  (DRL LED afilados gemelos + proyector central), se enciende y proyecta un haz cónico tenue sobre el asfalto.
 *
 *  Secuencia (2 s, keyframes en tailwind.config.js): 0–0.4 s DRL tenues · 0.4–0.8 s destello del LED principal ·
 *  0.8–2 s el haz se abre hacia el frente. Con `prefers-reduced-motion` se muestra directamente el estado final.
 *
 *  Es decorativo (aria-hidden, pointer-events-none, z-0): el texto del Hero va encima en z-10 y la luz se mantiene
 *  por debajo de ~18% de opacidad en el centro, desvaneciéndose hacia los costados y el fondo #070A10. */

/** Distancia desde el borde superior del Hero hasta el centro del proyector (origen del haz), en px. */
const LENS_Y = 84
const BEAM_W = 1400
const BEAM_H = 820
const BEAM_CLIP = 'polygon(48.6% 0, 51.4% 0, 100% 100%, 0 100%)'
const BEAM_FADE = 'radial-gradient(ellipse 55% 100% at 50% 0, black 25%, transparent 85%)'

export default function HeroHeadlightBeam() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Resplandor ambiental del faro sobre la escena */}
      <div className="absolute inset-0 origin-top animate-headlightBeam bg-[radial-gradient(ellipse_80%_60%_at_50%_15%,rgba(249,115,22,0.15),rgba(255,255,255,0.06)_40%,transparent_75%)] opacity-70 motion-reduce:animate-none" />

      {/* Haz cónico sobre el asfalto + textura de asfalto y guías del carril */}
      <div
        className="absolute origin-top animate-headlightBeam motion-reduce:animate-none"
        style={{
          top: LENS_Y,
          left: '50%',
          marginLeft: -BEAM_W / 2,
          width: BEAM_W,
          height: BEAM_H,
          WebkitMaskImage: BEAM_FADE,
          maskImage: BEAM_FADE,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            clipPath: BEAM_CLIP,
            background:
              'linear-gradient(to bottom, rgba(255,237,213,0.18), rgba(251,146,60,0.08) 35%, rgba(251,146,60,0.03) 65%, transparent 92%)',
          }}
        />
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${BEAM_W} ${BEAM_H}`} preserveAspectRatio="none">
          <defs>
            <filter id="asphalt-grain" x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <clipPath id="beam-clip">
              <polygon points={`${BEAM_W * 0.486},0 ${BEAM_W * 0.514},0 ${BEAM_W},${BEAM_H} 0,${BEAM_H}`} />
            </clipPath>
          </defs>
          {/* Grano de asfalto, visible solo dentro del haz */}
          <rect width={BEAM_W} height={BEAM_H} filter="url(#asphalt-grain)" opacity="0.07" clipPath="url(#beam-clip)" />
          {/* Bordes del carril con fuga al proyector */}
          <line x1={BEAM_W / 2} y1="0" x2={BEAM_W * 0.2} y2={BEAM_H} stroke="white" strokeOpacity="0.07" strokeWidth="2" />
          <line x1={BEAM_W / 2} y1="0" x2={BEAM_W * 0.8} y2={BEAM_H} stroke="white" strokeOpacity="0.07" strokeWidth="2" />
          {/* Línea central discontinua */}
          <line
            x1={BEAM_W / 2}
            y1="40"
            x2={BEAM_W / 2}
            y2={BEAM_H}
            stroke="#FBBF24"
            strokeOpacity="0.12"
            strokeWidth="3"
            strokeDasharray="22 30"
          />
        </svg>
      </div>

      {/* Firma lumínica frontal de la moto */}
      <div className="absolute left-1/2 top-5 -ml-[120px] h-[110px] w-[240px]">
        {/* Halo del proyector */}
        <div
          className="absolute left-1/2 top-[64px] -ml-12 -mt-12 h-24 w-24 animate-headlightFlash rounded-full bg-[radial-gradient(circle,rgba(255,247,237,0.55),rgba(251,146,60,0.18)_45%,transparent_70%)] blur-md motion-reduce:animate-none"
        />
        <svg viewBox="0 0 240 110" className="relative h-full w-full">
          <defs>
            <radialGradient id="projector-lens" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FFF7ED" />
              <stop offset="100%" stopColor="#FB923C" />
            </radialGradient>
          </defs>

          {/* Manillar y barras de horquilla en penumbra */}
          <path d="M10 24 Q120 8 230 24" fill="none" stroke="#94A3B8" strokeOpacity="0.16" strokeWidth="3" strokeLinecap="round" />
          <path d="M97 92 L93 110 M143 92 L147 110" stroke="#94A3B8" strokeOpacity="0.16" strokeWidth="6" strokeLinecap="round" />

          {/* Cúpula del faro */}
          <path
            d="M72 22 L168 22 L194 42 L182 74 L150 92 L90 92 L58 74 L46 42 Z"
            fill="#0B0F18"
            stroke="#FFFFFF"
            strokeOpacity="0.08"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* DRL LED gemelos afilados */}
          <g
            className="animate-headlightDrl motion-reduce:animate-none"
            style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.75)) drop-shadow(0 0 12px rgba(249,115,22,0.6))' }}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M58 44 L97 54 L108 67" stroke="#FFF7ED" strokeWidth="3.5" />
            <path d="M182 44 L143 54 L132 67" stroke="#FFF7ED" strokeWidth="3.5" />
            <path d="M68 60 L95 68" stroke="#FCD34D" strokeWidth="2" />
            <path d="M172 60 L145 68" stroke="#FCD34D" strokeWidth="2" />
          </g>

          {/* Proyector central (LED principal) */}
          <g className="animate-headlightFlash motion-reduce:animate-none" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle cx="120" cy="64" r="13" fill="url(#projector-lens)" />
            <circle cx="120" cy="64" r="16.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    </div>
  )
}
