# 🎨 SPRINT 23: Integración de Imagen Oficial de Seguridad y Limpieza de Cajones en `LandingStory.tsx`

## 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**. Tu misión en este Sprint 23 es actualizar la sección del Acto 3 ("Seguridad y Respaldo Inmediato") en `LandingStory.tsx` para incorporar la nueva imagen oficial con el smartphone en primer plano (que ya integra gráficamente los 4 callouts de telemetría y seguridad) y retirar los cajones/tarjetas redundantes del lado del texto.

---

## 2. [Objetivo Concreto y Alcance]
- **Archivo a modificar:**
  - `src/components/landing/LandingStory.tsx`
- **Recurso visual copiado y disponible:**
  - `public/images/safety-features.png`

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### Actualización del Acto 3 en `src/components/landing/LandingStory.tsx`
1. **Columna Izquierda — Imagen de Alta Fidelidad (`md:w-1/2`):**
   - Usar el contenedor `RevealBlock` con `rounded-3xl border border-bike-border shadow-soft overflow-hidden`.
   - Renderizar la nueva imagen oficial `/images/safety-features.png`:
     ```tsx
     <img
       src="/images/safety-features.png"
       alt="Seguridad y telemetría en tiempo real de Bike Tracker"
       className="h-64 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] sm:h-80"
     />
     ```
   - No se requiere ninguna insignia adicional sobre la imagen.

2. **Columna Derecha — Texto Limpio y Elegante (`md:w-1/2`):**
   - Mantener el bloque de texto limpio y legible:
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
   - **Retirar por completo la cuadrícula / cajones de tarjetas (`SAFETY_FEATURES.map(...)`)**, ya que la nueva imagen ya exhibe nativamente los 4 pilares en su composición gráfica.
   - Eliminar la constante `SAFETY_FEATURES` si ya no se utiliza en el archivo.

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] La sección "Seguridad y Respaldo Inmediato" muestra la nueva imagen `/images/safety-features.png` a la izquierda y el texto limpio a la derecha (en desktop) y apilados naturalmente (en móvil).
- [ ] No existen cajones o cajas de texto duplicadas debajo del párrafo.
- [ ] El diseño es 100% responsivo en smartphones (360px–430px) y computadores.
- [ ] `npm run build` ejecuta limpiamente con 0 errores de TypeScript y Vite.

---

## 5. [Restricciones Técnicas y Reglas de Calidad]
- Respetar los estilos y tokens de Tailwind (`font-display`, `text-bike-ink`, etc.).
- Cero dependencias adicionales ni advertencias de variables no usadas.
