import { useEffect, useRef } from 'react'

/** Fondo cinematográfico del Hero: video real (/videos/hero-headlight.mp4) de una moto en la oscuridad que
 *  enciende su faro LED y baña el asfalto.
 *
 *  Datos del clip: 768×1344 (vertical), 5,18 s, fondo ~#000. El faro está al 38% de la altura del cuadro.
 *  - `mix-blend-screen` vuelve transparente el negro del video sobre el fondo #070A10. Ningún ancestro del <video>
 *    crea contexto de apilamiento (sin z-index, transform ni mask): si lo hiciera, el negro se mezclaría contra un
 *    grupo transparente y aparecería como un rectángulo oscuro.
 *  - El video se dimensiona por ancho y se desplaza hacia arriba para que el faro caiga en la franja superior que
 *    el Hero reserva (pt-36 / sm:pt-40), por encima del titular, en cualquier ancho de pantalla.
 *  - Se reproduce una vez y queda congelado con el faro encendido: el clip va de apagado a encendido, así que
 *    un loop cortaría a negro cada 5 s detrás del titular. Si el usuario baja por la página y regresa al Hero,
 *    un IntersectionObserver rebobina el clip y el faro se enciende de nuevo. Con `prefers-reduced-motion` se
 *    muestra directamente el último cuadro y no se repite. */

/** Fracción vertical del cuadro donde está el centro del faro. */
const LAMP_FRACTION = 0.38
/** Relación alto/ancho del clip (1344 / 768). */
const CLIP_RATIO = 1344 / 768

/** Ancho del video y altura (px desde el borde superior del Hero) a la que debe quedar el faro, por breakpoint. */
const LAYOUT = {
  base: { width: 420, lampY: 66 },
  sm: { width: 560, lampY: 74 },
  lg: { width: 640, lampY: 80 },
}

const topFor = ({ width, lampY }: { width: number; lampY: number }) => Math.round(lampY - width * CLIP_RATIO * LAMP_FRACTION)

/** Máscara elíptica centrada en el faro (38% del alto). Radio horizontal = 50% del ancho y opacidad 0 en el
 *  100%, de modo que el video se desvanece por completo antes de sus bordes laterales e inferior (sin bandas). */
const VIDEO_MASK =
  'radial-gradient(ellipse 50% 40% at 50% 40%, black 28%, rgba(0,0,0,0.65) 58%, transparent 100%)'

/** Fracción visible del Hero por debajo de la cual se considera que el usuario "salió" de la sección. */
const VISIBLE_THRESHOLD = 0.15

export default function HeroHeadlightBeam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  /** true cuando el Hero salió del viewport: al volver, el faro se enciende de nuevo desde el segundo 0. */
  const hasScrolledAwayRef = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return
    // Último cuadro = faro encendido. Se usa con movimiento reducido y como respaldo si el navegador bloquea la
    // reproducción automática (modo ahorro de batería/datos), para que la moto nunca quede apagada.
    const showLastFrame = () => {
      const seek = () => {
        video.pause()
        video.currentTime = Math.max(0, video.duration - 0.05)
      }
      if (video.readyState >= 1) seek()
      else video.addEventListener('loadedmetadata', seek, { once: true })
    }

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      video.removeAttribute('autoplay')
      showLastFrame()
      return
    }
    void video.play().catch(showLastFrame)

    // Reactivación por scroll: al salir del Hero se pausa (ahorra CPU/batería) y al volver se rebobina y el faro
    // se enciende otra vez. Al terminar, el clip queda pausado en su último cuadro (faro encendido) porque no
    // tiene `loop`. Se compara `intersectionRatio` y no `isIntersecting`: con un umbral de 0.15, al bajar el
    // callback llega con el Hero aún parcialmente visible (isIntersecting = true) y la salida nunca se marcaría.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < VISIBLE_THRESHOLD) {
            hasScrolledAwayRef.current = true
            if (!video.ended) video.pause()
          } else if (hasScrolledAwayRef.current) {
            hasScrolledAwayRef.current = false
            video.currentTime = 0
            void video.play().catch(showLastFrame)
          }
        }
      },
      { threshold: VISIBLE_THRESHOLD },
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Resplandor ambiental de amplio espectro: extiende la luz del faro a lo ancho de pantallas ultra-anchas */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_25%,rgba(249,115,22,0.12),rgba(255,255,255,0.03)_35%,transparent_75%)] opacity-80" />

      <video
        ref={videoRef}
        src="/videos/hero-headlight.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        className="hero-headlight-video absolute left-1/2 max-w-none opacity-90 mix-blend-screen"
        style={{ maskImage: VIDEO_MASK, WebkitMaskImage: VIDEO_MASK }}
      />
      <style>{`
        .hero-headlight-video { width: ${LAYOUT.base.width}px; margin-left: -${LAYOUT.base.width / 2}px; top: ${topFor(LAYOUT.base)}px; }
        @media (min-width: 640px) {
          .hero-headlight-video { width: ${LAYOUT.sm.width}px; margin-left: -${LAYOUT.sm.width / 2}px; top: ${topFor(LAYOUT.sm)}px; }
        }
        @media (min-width: 1024px) {
          .hero-headlight-video { width: ${LAYOUT.lg.width}px; margin-left: -${LAYOUT.lg.width / 2}px; top: ${topFor(LAYOUT.lg)}px; }
        }
      `}</style>

      {/* Guías laterales muy tenues que enmarcan la escena en pantallas anchas */}
      <div className="absolute inset-y-0 left-1/2 hidden w-full max-w-7xl -translate-x-1/2 border-x border-white/[0.03] lg:block 2xl:max-w-[1440px]" />
    </div>
  )
}
