# 📋 PROMPT DE EJECUCIÓN: SPRINT 13 (Corrección Definitiva de Redirección Web vs App Instalada)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. El usuario ha detectado un conflicto de comportamiento en los botones de "Volver al Sitio / Web Oficial" entre la versión Web del navegador y la versión App instalada en el móvil:
1. **En la App Instalada (PWA/Capacitor):** Al presionar el botón 🌐 en el Tablero (`Header.tsx`) o en la pantalla de bienvenida (`WelcomeAuthScreen.tsx`), `window.open()` es bloqueado por el contenedor standalone o no hace nada. Debe lanzar el navegador web del sistema operativo de forma confiable.
2. **En el Navegador Web (Chrome/Safari/Edge):** Al estar en la versión web y pulsar el botón 🌐 del Tablero o de Bienvenida, `window.open()` abría una nueva pestaña o activaba el intent del WebAPK instalado en Android, en lugar de simplemente volver a la Landing Page en la misma pestaña.

---

## 2. [Objetivo Concreto y Alcance]
Crear una lógica inteligente y unificada de navegación (`navigateToLandingOrExternalWeb`):
- **Si el usuario está en el Navegador Web:** Ejecutar `setTopLevelMode('landing')` para mostrar la Landing Page de forma instantánea en la misma pestaña.
- **Si el usuario está en la App Instalada (Standalone / PWA / Capacitor):** Como la app instalada no tiene Landing internamente, debe abrir el navegador externo del sistema creando y disparando un enlace `<a>` real con `target="_blank"` y `rel="noopener noreferrer"`.

---

## 3. [Archivos y Rutas Afectadas]
- `src/utils/navigationHelper.ts` (Nuevo helper reutilizable para navegación inteligente).
- `src/components/common/Header.tsx` (Botón 🌐 en el Tablero).
- `src/components/auth/WelcomeAuthScreen.tsx` (Botón superior izquierdo).
- `src/components/common/Sidebar.tsx` (Opción "Ver Landing Page / Web Oficial").
- `src/utils/i18n.ts` (Textos consistentes en ES y EN).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### A. Crear Helper de Navegación Inteligente (`src/utils/navigationHelper.ts`)
Crear `src/utils/navigationHelper.ts`:
```ts
import { Capacitor } from '@capacitor/core'

export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') return false
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true
  const displayModeStandalone = window.matchMedia?.('(display-mode: standalone)').matches ?? false
  return iosStandalone || displayModeStandalone || Capacitor.isNativePlatform()
}

export function goToLandingOrExternal(setTopLevelMode?: (mode: 'landing' | 'app') => void) {
  if (isStandaloneApp()) {
    // Si está en la app instalada, abrir el navegador externo del sistema operativo
    const link = document.createElement('a')
    link.href = 'https://biker-tracker.vercel.app'
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else if (setTopLevelMode) {
    // Si está en el navegador web normal, regresar fluidamente a la Landing Page en la misma pestaña
    setTopLevelMode('landing')
  } else {
    window.location.href = '/'
  }
}
```

---

### B. Actualizar `src/components/common/Header.tsx`
1. Importar `goToLandingOrExternal` desde `../../utils/navigationHelper`.
2. En el botón 🌐 (líneas 71–78 aprox.):
   - **Antes:** `onClick={() => window.open('https://biker-tracker.vercel.app', '_blank')}`
   - **Después:**
     ```tsx
     <button
       onClick={() => goToLandingOrExternal(setTopLevelMode)}
       className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-base text-slate-600 active:scale-95 transition"
       aria-label={t('header.goToLanding')}
       title={t('header.goToLanding')}
     >
       🌐
     </button>
     ```

---

### C. Actualizar `src/components/auth/WelcomeAuthScreen.tsx`
1. Importar `goToLandingOrExternal` desde `../../utils/navigationHelper`.
2. En el botón superior izquierdo:
   - **Antes:** `onClick={() => window.open('https://biker-tracker.vercel.app', '_blank')}`
   - **Después:**
     ```tsx
     <button
       onClick={() => goToLandingOrExternal(setTopLevelMode)}
       className="flex items-center gap-1.5 rounded-full border border-bike-border bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-card transition hover:bg-slate-50 hover:text-bike-ink active:scale-95"
       title={t('welcome.openOfficialWeb')}
     >
       <span>←</span>
       <span>{t('welcome.openOfficialWeb')}</span>
     </button>
     ```

---

### D. Actualizar `src/components/common/Sidebar.tsx`
1. En el item de "Ver Landing Page / Web Oficial":
   ```tsx
   <SidebarItem
     icon="🌐"
     label={t('sidebar.goToLanding')}
     onClick={() => {
       goToLandingOrExternal(setTopLevelMode)
       setSidebarOpen(false)
     }}
   />
   ```

---

### E. Actualizar Diccionario en `src/utils/i18n.ts`
Agregar traducciones en `es` y `en`:
* **En `es`:**
  ```ts
  'welcome.openOfficialWeb': 'Sitio Web',
  'header.goToLanding': 'Ver Sitio Web',
  'sidebar.goToLanding': 'Ver Sitio Web Oficial',
  ```
* **En `en`:**
  ```ts
  'welcome.openOfficialWeb': 'Website',
  'header.goToLanding': 'Visit Website',
  'sidebar.goToLanding': 'Visit Official Website',
  ```

---

## 5. [Criterios de Aceptación / DoD]
1. ✅ **En Navegador Web:** Al hacer clic en el botón de Sitio Web (Header, Bienvenida o Sidebar), regresa instantáneamente a la Landing Page en la misma pestaña del navegador sin abrir ventanas nuevas ni activar intents.
2. ✅ **En App Instalada (Móvil / PWA):** Al hacer clic, lanza el navegador web externo de Android/iOS con la URL oficial sin romper la app.
3. ✅ **Cero Redirecciones Inversas:** La navegación se comporta de manera 100% predecible en ambos entornos.
4. ✅ **Compilación:** `npm run build` compila con 0 errores.
