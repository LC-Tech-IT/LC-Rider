# 📋 PROMPT DE EJECUCIÓN: SPRINT 6 (Tacómetro Deportivo Interactivo de RPM & Slogan Oficial LC Tech)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo en esta actualización es reemplazar la línea de pulsaciones/ECG del Hero de la Landing Page por un **Tacómetro Deportivo de Moto de Alto Cilindraje (Gauge de RPM interactivo con aguja física)** con estado estático en reposo y actualizar el **slogan oficial de LC Tech**.

---

## 2. [Especificación Técnica Detallada]

### A. Tacómetro Deportivo de Moto (`src/components/landing/LandingHeroTachometer.tsx`)
Crear un nuevo componente visual de alta fidelidad que sustituya a `LandingHeroECG.tsx`:

1. **Diseño del Dial (0 a 14 x 1000 RPM):**
   - Dial semicircular de estilo tablero deportivo de moto (`#FFFFFF` con sombras suaves y borde `#E2E8F0`).
   - Graduación de números: `0, 2, 4, 6, 8, 10, 12, 14` con leyenda `x1000 RPM`.
   - **Zona Roja (*Redline*):** Desde 10k hasta 14k RPM marcada en naranja/rojo deportivo de alto contraste.
   - **Aguja Indicadora Deportiva:** Aguja luminosa naranja (`#F97316`) con pivote central y sombra dinámica, con rotación en grados precisa calculada según las RPM actuales.
2. **Display Digital Central & Indicadores:**
   - Lectura digital de RPM con tipografía `'Orbitron', sans-serif`.
   - Indicador de marcha: `[ N ]` en verde brillante en reposo, cambiando a `[ 1 ]` al acelerar.
   - **Shift Light (LED de cambio de marcha):** Destello estroboscópico de alerta cuando las RPM superan las 10.000 RPM durante la aceleración.
3. **Comportamiento y Dinámica (100% Estático en Reposo):**
   - 🛑 **Estado Inicial / En Reposo (SIN ACELERAR):**
     - La aguja **permanece TOTALMENTE QUIETA en 0 RPM** (sin oscilación, sin vibraciones continuas, para evitar fatiga visual o sensación de mareo).
     - El display digital muestra `0 RPM` fijo.
   - 🔥 **Al pulsar `🔊 Acelerar Motor`:**
     - La aguja sube rápidamente en un barrido enérgico de aceleración hasta alcanzar 11.500 - 12.000 RPM.
     - El sonido del motor de alto cilindraje se reproduce con `playEngineRev()` desde `src/services/soundService.ts`.
     - El *Shift Light* destella y el display marca las RPM máximas.
     - La aguja retorna de forma progresiva y suave de vuelta a **0 RPM**, quedando nuevamente **completamente estática e inmóvil**.
4. **Control de Audio:**
   - Botón discreto para silenciar / activar el sonido (`🔊` / `🔇`).

---

### B. Actualización del Slogan Oficial de LC Tech
1. En el Header de `src/components/landing/LandingPage.tsx`:
   - Cambiar la etiqueta actual por el slogan oficial de la empresa:
     ```html
     <p className="font-display text-xs font-black tracking-wide text-bike-ink">
       LC TECH <span className="hidden font-body font-medium text-slate-500 sm:inline">· Tecnología inteligente que te respalda.</span>
     </p>
     ```
2. En el Footer de `LandingPage.tsx` y en el `chatbotService.ts`:
   - Actualizar las menciones corporativas para incluir: *"LC Tech — Tecnología inteligente que te respalda."*

---

### C. Reemplazo en la Landing Page (`src/components/landing/LandingPage.tsx`)
- Importar y montar `LandingHeroTachometer` en el Hero justo debajo de la fotografía de convoy (`/images/convoy-journey.jpg`).
- Eliminar las importaciones y referencias a `LandingHeroECG.tsx`.

---

## 3. [Archivos y Rutas Afectadas]
- `src/components/landing/LandingHeroTachometer.tsx` (Nuevo componente de Tacómetro de RPM).
- `src/components/landing/LandingPage.tsx` (Montar tacómetro y actualizar slogan en Header y Footer).
- `src/services/chatbotService.ts` (Actualizar descripción con slogan de LC Tech).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Tacómetro Estático en Reposo:** El tacómetro y su aguja permanecen totalmente quietos en 0 RPM mientras no se presione el botón de acelerar.
2. ✅ **Aceleración On-Demand:** Al presionar "Acelerar Motor", la aguja sube enérgicamente a la zona roja sincronizada con el rugido de audio y luego vuelve a 0 RPM en reposo absoluto.
3. ✅ **Slogan Oficial LC Tech:** En el Header y textos corporativos se lee exactamente *"LC TECH · Tecnología inteligente que te respalda."*.
4. ✅ **Diseño Luminoso y Limpio:** Mantiene la paleta unificada clara y estética de la aplicación.
5. ✅ **Compilación y Tipos:** `npm run build` y `tsc --noEmit` compilan con 0 errores.
6. ✅ **Reporte en Español:** Resumen de entrega redactado en Español.
