# 💎 SPRINT 24: Composición Visual Ultra-Nítida (Vector-Crisp) de Seguridad en `LandingStory.tsx`

## 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**.
El Product Manager ha identificado que la imagen anterior tenía texto rasterizado de baja resolución que se veía borroso/pixelado al escalarse en pantallas de alta densidad (Retina / 4K).
Tu misión en este Sprint 24 es implementar una **composición fotográfica y vectorial de máxima fidelidad (Vector-Crisp)**:
1. Utilizar la nueva fotografía base en ultra-alta definición 8K (`/images/safety-features-bg.jpg`), que posee la misma nitidez fotográfica profesional que `cockpit-view.jpg` y `friends-viewpoint.jpg`.
2. Superponer el smartphone y los 4 callouts (`Telemetría en vivo`, `Alerta SOS de un toque`, `Aviso de parada de gasolina`, `Alerta de peligro en vía`) mediante **elementos HTML/CSS y tipografía nativa del navegador con iconos vectoriales SVG**, garantizando **0% de borrosidad y 100% de nitidez vectorial absoluta en cualquier pantalla**.

---

## 2. [Objetivo Concreto y Alcance]
- **Archivo a modificar:**
  - `src/components/landing/LandingStory.tsx`
- **Recurso fotográfico HD disponible:**
  - `public/images/safety-features-bg.jpg` (Fotografía 8K en alta resolución, 640KB).

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### Implementación del Componente de Imagen de Seguridad Ultra-Nítida (`SafetyHeroGraphic`)
En `src/components/landing/LandingStory.tsx`, crear el componente visual para la tarjeta del Acto 3 ("Seguridad y Respaldo Inmediato"):

1. **Contenedor Principal (`RevealBlock`):**
   - `relative w-full overflow-hidden rounded-3xl border border-bike-border shadow-soft md:w-1/2 group` con altura estándar `h-64 sm:h-80`.

2. **Fotografía de Fondo HD:**
   - Renderizar la fotografía `/images/safety-features-bg.jpg`:
     ```tsx
     <img
       src="/images/safety-features-bg.jpg"
       alt="Piloto en carretera de montaña con respaldo de telemetría Bike Tracker"
       className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
     />
     ```

3. **Teléfono Inteligente en Primer Plano (Esquina Inferior Izquierda):**
   - Marco de teléfono flotante simulado en HTML/CSS (escala adaptada `scale-90 sm:scale-100 origin-bottom-left`):
     - Contenedor con bordes redondeados (`absolute -bottom-2 -left-2 sm:bottom-2 sm:left-3 w-36 sm:w-44 rounded-2xl border-2 border-slate-700 bg-slate-950/95 p-2 sm:p-2.5 shadow-2xl backdrop-blur-md text-white z-10`).
     - Pantalla de telemetría:
       - Píldora superior: `🟢 En vivo`
       - Velocímetro digital: `68` <span className="text-[9px] text-slate-400">km/h</span> y Distancia `12.4 km`.
       - Miniatura gráfica de ruta: línea de mapa con punto de ubicación azul.

4. **Los 4 Callouts / Chips Vectoriales Ultra-Nítidos con Conectores Luminosos:**
   - Renderizar los 4 badges como tarjetas flotantes con fondo blanco de alto contraste (`bg-white/95 text-slate-900 shadow-lg backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/60 flex items-center gap-2 z-10 transition-transform duration-300 hover:scale-105`):
     - **Chip 1 (Superior Izquierdo):**
       - Icono: `📡` (o SVG de antena/ondas en recuadro verde `bg-emerald-500 text-white p-1 rounded-lg`).
       - Texto: <span className="font-bold text-[11px] leading-tight text-slate-900">Telemetría<br/><span className="text-[10px] font-medium text-slate-500">en vivo</span></span>.
       - Punto conector: punto pulsante cian/verde en el casco del piloto.
     - **Chip 2 (Superior Derecho):**
       - Icono: `🆘` (o SVG SOS en recuadro rojo `bg-rose-500 text-white p-1 rounded-lg text-[10px] font-black`).
       - Texto: <span className="font-bold text-[11px] leading-tight text-slate-900">Alerta SOS<br/><span className="text-[10px] font-medium text-slate-500">de un toque</span></span>.
       - Punto conector: punto pulsante rojo.
     - **Chip 3 (Centro Derecho):**
       - Icono: `⛽` (o SVG de surtidor en recuadro azul `bg-sky-500 text-white p-1 rounded-lg`).
       - Texto: <span className="font-bold text-[11px] leading-tight text-slate-900">Aviso parada<br/><span className="text-[10px] font-medium text-slate-500">de gasolina</span></span>.
       - Punto conector: punto pulsante azul en el tanque.
     - **Chip 4 (Inferior Derecho):**
       - Icono: `⚠️` (o SVG de advertencia en recuadro ámbar `bg-amber-500 text-white p-1 rounded-lg`).
       - Texto: <span className="font-bold text-[11px] leading-tight text-slate-900">Alerta peligro<br/><span className="text-[10px] font-medium text-slate-500">en vía</span></span>.
       - Punto conector: punto pulsante naranja en el asfalto.

5. **Lado Derecho del Acto 3 — Texto Limpio:**
   - Mantener el badge `🛡️ Seguridad en Grupo`, el título H3 `Seguridad y Respaldo Inmediato` y el párrafo explicativo limpio sin cajones duplicados.

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] La imagen de fondo posee la misma calidad fotográfica nítida y cristalina (8K) que las otras dos fotos de la historia.
- [ ] Todos los textos y badges sobre la imagen se renderizan como texto vectorial nativo de HTML/CSS (cero pixelación o borrosidad en pantallas Retina/4K/móviles).
- [ ] La composición es 100% responsiva y se ajusta a la perfección en móviles (360px–430px) y pantallas de escritorio.
- [ ] `npm run build` ejecuta limpiamente con 0 errores de TypeScript y Vite.

---

## 5. [Restricciones Técnicas y Reglas de Calidad]
- Respetar las fuentes del proyecto (`Inter`, `Orbitron`).
- Asegurar que los chips flotantes tengan `pointer-events-none` o transiciones suaves para no obstaculizar la navegación.
