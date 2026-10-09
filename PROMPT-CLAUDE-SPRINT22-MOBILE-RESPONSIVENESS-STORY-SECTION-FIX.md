# 📱 SPRINT 22: Enfoque Mobile-First — Corrección de Responsividad y Legibilidad en la Sección de Seguridad (`LandingStory.tsx`)

## 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**.
El Product Manager & Stakeholder ha enfatizado una **regla fundamental de diseño:** **Bike Tracker es una aplicación Mobile-First**. Todo componente, bloque o sección debe diseñarse y probarse con prioridad absoluta en pantallas de smartphones (360px a 430px de ancho), garantizando que los textos nunca queden recortados, solapados o ilegibles, y adaptándose a su vez de forma impecable a pantallas de escritorio (PC/Tablet).

---

## 2. [Diagnóstico del Problema en Móviles]
En el Sprint anterior, en el bloque 3 ("Seguridad y Respaldo Inmediato") de `src/components/landing/LandingStory.tsx`:
- Se colocó todo el contenido (badge, título H3, párrafo y las 4 tarjetas de alerta) en un contenedor absoluto `absolute inset-0 flex flex-col justify-end` sobre la imagen con altura fija `h-72`.
- **Falla en Smartphone:** Debido a que el alto de la imagen es limitado (`288px`) y el contenedor tiene `overflow-hidden`, en pantallas móviles el badge y el título quedaron empujados hacia arriba y completamente recortados/invisibles, dejando solo visible el final del párrafo y las tarjetas.

---

## 3. [Objetivo Concreto y Alcance]
- **Archivo afectado:**
  - `src/components/landing/LandingStory.tsx`

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Separar el Texto de la Imagen con Estructura Responsive Idéntica a los Actos 1 y 2
En `src/components/landing/LandingStory.tsx`, estandarizar el Acto 3 de Seguridad para que siga el mismo patrón desacoplado y 100% responsivo que los Actos 1 y 2 (`flex flex-col md:flex-row gap-8 items-center`):

1. **Columna de Imagen (`w-full md:w-1/2`):**
   - Utilizar el contenedor `RevealBlock` con `rounded-3xl border border-bike-border shadow-soft overflow-hidden relative group`.
   - Imagen fotográfica de alta calidad `/images/convoy-journey.jpg` con clase `h-64 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] sm:h-80`.
   - Puede incluir una insignia sutil flotante en la esquina superior/inferior de la imagen (ej: píldora pequeña `🛡️ Convoy Protegido 24/7` con `bg-slate-950/70 text-white backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold`).

2. **Columna de Texto e Información (`w-full md:w-1/2`):**
   - Badge de categoría:
     ```tsx
     <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
       🛡️ Seguridad en Grupo
     </span>
     ```
   - Título H3:
     ```tsx
     <h3 className="mt-3 font-display text-xl font-bold text-bike-ink sm:text-2xl">
       Seguridad y Respaldo Inmediato
     </h3>
     ```
   - Párrafo descriptivo:
     ```tsx
     <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
       Telemetría en vivo, alerta SOS de un toque y control de paradas de gasolina y peligros en vía: todo tu convoy conectado, listo para reaccionar en segundos.
     </p>
     ```
   - **Botonera / Grid de los 4 Pilares de Seguridad:**
     - En lugar de montarlos sobre la foto, colocarlos debajo del párrafo en una cuadrícula clara de 2 columnas (`grid grid-cols-2 gap-2.5 mt-5`):
       ```tsx
       <div className="mt-5 grid grid-cols-2 gap-2.5">
         {SAFETY_FEATURES.map((feature) => (
           <div
             key={feature.label}
             className="flex items-center gap-2.5 rounded-2xl border border-bike-border bg-white p-3 shadow-card transition hover:border-emerald-300"
           >
             <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg shadow-sm">
               {feature.icon}
             </span>
             <span className="text-xs font-bold leading-tight text-bike-ink">
               {feature.label}
             </span>
           </div>
         ))}
       </div>
       ```
     - Esto garantiza máxima legibilidad sobre fondo blanco/claro, excelente contraste y cero recortes en pantallas de 360px a 430px.

3. **Alternancia Visual de Actos:**
   - Acto 1 (Hermandad): Imagen a la izquierda, texto a la derecha (`md:flex-row`).
   - Acto 2 (Cero Preocupaciones): Texto a la izquierda, imagen a la derecha (`md:flex-row-reverse`).
   - Acto 3 (Seguridad): Imagen a la izquierda, texto a la derecha (`md:flex-row`).

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] En dispositivos móviles (pantallas de 360px a 412px de ancho), el título "Seguridad y Respaldo Inmediato", el badge "🛡️ Seguridad en Grupo", el párrafo explicativo y las 4 tarjetas de seguridad se leen de forma 100% nítida y completa sin ningún tipo de recorte vertical u horizontal.
- [ ] La imagen de convoy se visualiza limpia con bordes redondeados (`rounded-3xl`) y efecto de zoom suave al pasar el cursor o interactuar.
- [ ] En pantallas de escritorio (PC), el bloque se distribuye armoniosamente en 2 columnas (50% imagen / 50% texto con tarjetas).
- [ ] `npm run build` ejecuta limpiamente con 0 errores de TypeScript y Vite.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- Seguir las clases de diseño de Tailwind del proyecto (`font-display`, `text-bike-ink`, `border-bike-border`, `shadow-card`, etc.).
- Comprobar que en ningún ancho de pantalla móvil se genere scroll horizontal indeseado (`overflow-x`).
