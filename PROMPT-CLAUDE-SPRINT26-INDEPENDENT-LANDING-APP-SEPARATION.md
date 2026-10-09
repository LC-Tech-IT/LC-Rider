# 🚀 Prompt de Ejecución para Claude — Sprint 26: Separación Total e Independencia de Landing Page y Aplicación

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El Stakeholder y Product Lead ha definido un cambio arquitectónico y funcional clave:
> *"Separar el landing page de la app para que sean totalmente independientes. Cuando el usuario esté en el navegador web y haga clic sobre 'Mi Tablero' (o los botones de acceso a la app), se le debe indicar que debe descargar la app o, en su defecto, si ya la tiene descargada/instalada, redirigirlo o permitirle abrir la app."*

Actualmente, al hacer clic en "Mi Tablero" o "Iniciar Rodada" en la Landing Page, el navegador web pasa internamente a la vista de la app sin distinción, haciendo que la experiencia de Landing y App se perciban mezcladas.

---

## 2. [Objetivo Concreto y Alcance]
1. **Aislamiento Total de la Landing Page en Navegador Web:**
   - La Landing Page (`LandingPage.tsx`) funciona como el portal web oficial de información, marketing, planes y soporte.
   - La Aplicación (`CockpitView`, `ConvoyMap`, `GarageView`, `WelcomeAuthScreen`, etc.) es la herramienta operativa de navegación, telemetría y convoy.
2. **Intercepción de CTAs en la Landing Page:**
   - Al hacer clic en **"Mi Tablero"**, **"Iniciar Sesión"**, **"Iniciar Rodada Gratis"**, **"Probar en Mi Tablero"** o los botones de suscripción:
     - **Si está en navegador convencional (no standalone / no instalada):** No saltar directamente a la app. En su lugar, desplegar un **Modal Inteligente de Acceso / Descarga (`AppAccessModal.tsx` o `InstallAppModal.tsx` evolucionado)**.
     - **Si ya está en modo app instalada (PWA standalone o APK Capacitor):** Entrar directamente al tablero/app (`topLevelMode = 'app'`).
3. **Diseño y Funcionalidad del Modal de Acceso a la App:**
   - **Título atractivo:** *"Accede a tu Tablero de Control — Bike Tracker"*.
   - **Explicación de valor:** Indicar que las funciones de telemetría, GPS de convoy en segundo plano y alertas por voz requieren la app instalada en el dispositivo.
   - **Opciones claras para el usuario:**
     - 🚀 **Opción 1: "Ya tengo la App / Abrir en la App"** -> Intenta lanzar la app instalada (vía deep link / redirección o pasar al entorno de la app).
     - 📲 **Opción 2: "Instalar App Web (PWA)"** -> Activa la instalación nativa inmediata en 1 clic (`beforeinstallprompt`) o muestra las instrucciones para iOS/Android.
     - 🤖 **Opción 3: "Descargar APK para Android"** -> Botón directo para descargar `/downloads/bike-tracker.apk`.
     - 🌐 **Opción Secundaria / Fallback:** *"O continuar en versión web (modo navegador)"* para permitir al usuario probar la interfaz web si insiste en no instalarla.
4. **Independencia en la App Instalada:**
   - Cuando la app corre instalada (PWA o APK), arranca directamente en el flujo de la app. El botón "Web Oficial" abre la Landing en el navegador del sistema (`window.open`), asegurando que la App nunca se reemplace por la Landing en el entorno standalone.
5. **Internacionalización y Textos (ES / EN):**
   - Incorporar todas las traducciones necesarias en `src/utils/i18n.ts`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingPage.tsx` (Intercepción de botones de cabecera y hero para abrir el modal de acceso/descarga en navegador).
- `src/components/landing/LandingShowcase.tsx` (Intercepción del CTA "Probar en Mi Tablero").
- `src/components/landing/LandingPricing.tsx` (Intercepción de botones de planes hacia el modal o flujo de app).
- `src/components/common/InstallAppModal.tsx` o `src/components/common/AppAccessModal.tsx` (Diseño mejorado con las dos vías: 'Abrir App Instalada' vs 'Descargar/Instalar PWA o APK').
- `src/utils/navigationHelper.ts` (Helpers de detección standalone y redirección a app/web).
- `src/utils/i18n.ts` (Nuevas llaves en español e inglés para el flujo de acceso/descarga).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Actualizar Helper de Navegación (`src/utils/navigationHelper.ts`)
1. Asegurar que `isStandaloneApp()` identifique con precisión si la app está corriendo instalada (PWA standalone, iOS standalone o Capacitor nativo).
2. Exportar una función utilitaria `handleAppAccess(options)` que determine si abrir directamente la app o abrir el modal de descarga según el entorno.

```typescript
import { Capacitor } from '@capacitor/core'

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  return iosStandalone || displayModeStandalone || Capacitor.isNativePlatform()
}

export function openExternalLanding() {
  window.open(window.location.origin, '_blank')
}
```

---

### Tarea 2: Rediseñar / Mejorar el Modal de Acceso y Descarga (`src/components/common/InstallAppModal.tsx`)
1. Ajustar el modal para que sirva tanto para **Instalar/Descargar** como para **Redirigir a la App si ya está instalada**:
   - **Cabecera:** Logo de Bike Tracker, título *"Mi Tablero de Telemetría"* y subtítulo explicativo.
   - **Tarjeta destacada "Ya tengo la App":**
     - Botón principal: `🚀 Abrir Bike Tracker`.
     - Al pulsar: cambia el modo a `app` (`setTopLevelMode('app')`) y cierra el modal, o intenta abrir el esquema de la aplicación.
   - **Pestañas / Bloque "Descargar / Instalar":**
     - **PWA (Recomendado):** Botón `📲 Instalar App en 1 Clic` si `canInstallNatively` está disponible; si es iOS, guía con los 3 pasos (Compartir -> Agregar a Inicio); si es PC/otro navegador, mensaje guía.
     - **APK Android:** Botón de descarga directa con tamaño y versión (`/downloads/bike-tracker.apk`).
   - **Enlace sutil inferior:** *"Continuar en el navegador (versión web limitada)"* para usuarios que deseen explorar el tablero sin instalar.

---

### Tarea 3: Modificar CTAs en `LandingPage.tsx`, `LandingShowcase.tsx` y `LandingPricing.tsx`
1. En `src/components/landing/LandingPage.tsx`:
   - En `handleHeaderCta()` y `enterApp()`:
     - Si `isStandaloneApp()` es `true`: ejecutar `setTopLevelMode('app')`.
     - Si `isStandaloneApp()` es `false` (está en navegador): abrir el modal de instalación/acceso `setInstallModalOpen(true)`.
2. En `src/components/landing/LandingShowcase.tsx`:
   - El botón `"🏍️ Probar en Mi Tablero"` o similares debe llamar al handler que abre el modal si está en navegador.
3. En `src/components/landing/LandingPricing.tsx`:
   - Al pulsar "Empezar Gratis" o "Obtener Convoy Pro", si está en navegador, invocar el modal informando que los planes se configuran dentro de la App.

---

### Tarea 4: Actualizar Textos en `src/utils/i18n.ts`
1. Agregar traducciones claras en español e inglés para:
   - `landing.appRequiredNotice`: *"Para usar el tablero de telemetría y convoy en tiempo real, abre o instala la aplicación."*
   - `landing.openExistingApp`: *"🚀 Abrir App Instalada"*
   - `landing.downloadApp`: *"📥 Descargar / Instalar App"*
   - `landing.continueInBrowser`: *"Continuar en el navegador"*
   - `install.tabTitleAccess`: *"Acceso al Tablero"*

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] Al ingresar a la Landing Page en un navegador web convencional y hacer clic en **"Mi Tablero"**, **"Iniciar Sesión"** o **"Iniciar Rodada Gratis"**, NO se carga la app de golpe; se despliega el modal que informa la necesidad de la app y ofrece las opciones de abrir o descargar/instalar.
- [ ] En el modal, el usuario que ya tiene la app puede hacer clic en "Abrir App" para acceder directamente.
- [ ] En el modal, el usuario que no la tiene puede elegir entre instalar PWA o descargar el archivo APK de Android.
- [ ] Se incluye una opción secundaria para continuar en el navegador si el usuario desea explorar la web.
- [ ] En dispositivos con la PWA instalada o APK, la aplicación inicia directamente en el modo App sin mostrar la landing page por defecto.
- [ ] Todo el diseño mantiene la estética Glassmorphism, Tailwind CSS, paleta de colores de Bike Tracker y funciona perfectamente en pantallas móviles y de escritorio.
- [ ] No existen errores de TypeScript ni linter en el proyecto (`npm run build` o `tsc` pasa sin errores).

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No romper las funcionalidades existentes de Supabase, autenticación, telemetría, simulación ni pagos de suscripción.
- Mantener la persistencia de estado limpia en `AppContext.tsx`.
- Cero dependencias externas adicionales innecesarias.
