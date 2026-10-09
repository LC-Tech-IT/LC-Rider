# 📋 PROMPT DE EJECUCIÓN: SPRINT 8 (Botón de Regreso a la Landing Page desde Autenticación y Onboarding)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Se ha identificado un problema de navegación y fricción UX: cuando un usuario no autenticado entra a la aplicación desde la Landing Page (`topLevelMode === 'app'`), se le presenta la pantalla de bienvenida/registro (`WelcomeAuthScreen.tsx`). Si el usuario decide no registrarse ni iniciar sesión en ese momento y desea volver a explorar la Landing Page, actualmente **se encuentra atrapado** y se ve obligado a recargar la página en el navegador.

---

## 2. [Objetivo Concreto y Alcance]
Implementar navegación de retorno limpia, intuitiva y accesible hacia la Landing Page (`setTopLevelMode('landing')`) en:
1. La pantalla de bienvenida / login (`WelcomeAuthScreen.tsx`).
2. El asistente de registro de primer vehículo (`OnboardingWizard.tsx`).
3. Actualización correspondiente del diccionario de internacionalización (`src/utils/i18n.ts`).

---

## 3. [Archivos y Rutas Afectadas]
- `src/utils/i18n.ts` (Nuevas llaves de traducción para botones de retorno).
- `src/components/auth/WelcomeAuthScreen.tsx` (Botón "← Volver al inicio" en la barra superior).
- `src/components/auth/OnboardingWizard.tsx` (Botón o enlace para salir/cancelar y volver a la Landing).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### A. Actualizar Diccionario en `src/utils/i18n.ts`
Agregar las siguientes llaves de traducción en los bloques `es` y `en`:

* **En `es` (sección `// Bienvenida (Auth Gate)` y `// Onboarding`):**
  ```ts
  'welcome.backToLanding': '← Inicio',
  'onboarding.cancelAndBack': 'Cancelar y volver al inicio',
  ```
* **En `en` (sección `// Welcome (Auth Gate)` y `// Onboarding`):**
  ```ts
  'welcome.backToLanding': '← Home',
  'onboarding.cancelAndBack': 'Cancel and return to home',
  ```

---

### B. Implementar Botón de Retorno en `src/components/auth/WelcomeAuthScreen.tsx`
1. Desestructurar `setTopLevelMode` desde `useApp()`.
2. Modificar la cabecera superior (líneas 8–23 aprox.) para convertirla en un contenedor `flex items-center justify-between`:
   - **Izquierda:** Botón de regreso a la landing:
     ```tsx
     <button
       onClick={() => setTopLevelMode('landing')}
       className="flex items-center gap-1.5 rounded-full border border-bike-border bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-card transition hover:bg-slate-50 hover:text-bike-ink active:scale-95"
       title={t('welcome.backToLanding')}
     >
       <span className="text-sm">←</span>
       <span>{t('welcome.backToLanding')}</span>
     </button>
     ```
   - **Derecha:** Selector de idioma `ES / EN` existente.

---

### C. Implementar Opción de Cancelación en `src/components/auth/OnboardingWizard.tsx`
1. Desestructurar `setTopLevelMode` y `logout` desde `useApp()`.
2. Agregar al final del wizard (o debajo del formulario) un botón de salida limpio para usuarios que cerraron o abandonaron el proceso de onboarding:
   ```tsx
   <div className="mt-4 text-center">
     <button
       onClick={() => {
         logout()
         setTopLevelMode('landing')
       }}
       className="text-xs font-medium text-slate-400 underline transition hover:text-slate-600"
     >
       {t('onboarding.cancelAndBack')}
     </button>
   </div>
   ```

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Regreso Inmediato sin Recarga:** Al pulsar "← Inicio" en `WelcomeAuthScreen`, la interfaz vuelve instantáneamente a la `LandingPage` sin requerir F5/recarga del navegador.
2. ✅ **Coherencia Visual:** El botón respeta la paleta cromática, sombras (`shadow-card`) y diseño de cápsula redondeada (`rounded-full`) de la aplicación móvil.
3. ✅ **Soporte Multilingüe:** El texto cambia correctamente entre Español e Inglés con el conmutador de idioma.
4. ✅ **Cancelación en Onboarding:** Si el usuario está en el Onboarding inicial, puede salir limpiamente a la landing restableciendo el estado.
5. ✅ **Compilación Limpia:** `npm run build` compila con 0 advertencias críticas y 0 errores de TypeScript.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No alterar los estilos ni la lógica de inicio de sesión de Google o Email existentes.
- Mantener la experiencia responsiva dentro del marco `PhoneFrame`.
