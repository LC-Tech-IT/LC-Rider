import { useEffect, useRef, useState } from 'react'

/** Revela un elemento con una transición suave (fade + translate + scale) apenas entra en pantalla,
 *  usando IntersectionObserver. La revelación ocurre una sola vez por elemento. */
export function useScrollReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, ...options },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

/** Clases utilitarias listas para combinar con `visible`: oculto y desplazado antes de revelarse, en su
 *  posición final con opacidad completa después. */
export function scrollRevealClass(visible: boolean): string {
  return `transition-all duration-700 ease-out ${visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-95 opacity-0'}`
}
