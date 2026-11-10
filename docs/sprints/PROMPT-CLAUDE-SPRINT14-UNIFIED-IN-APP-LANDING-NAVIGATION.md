# 🚀 Prompt de Ejecución para Claude — Sprint 14: Unificación Total de Navegación Interna (Landing ↔ App)

## 1. Rol y Contexto para Claude
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El stakeholder ha solicitado simplificar y unificar la navegación entre la Landing Page y la Aplicación. Se descartan todas las redirecciones externas forzadas (`<a> target="_blank"`, `window.open`) que generaban confusión o bloqueos en dispositivos móviles y webviews.

A partir de ahora, **en cualquier entorno (navegador PC, navegador móvil, PWA instalada o APK)**, el paso entre la Landing Page y la Aplicación es un cambio de estado interno reactivo e instantáneo (`setTopLevelMode('landing')` / `setTopLevelMode('app')`).

---

## 2. Objetivo Concreto y Alcance
1. **Retorno a Landing 100% In-App:**
   - Al pulsar cualquier botón de "Volver a Página Principal" / "Inicio" dentro de la app (Header, Sidebar, Pantalla de Bienvenida), se debe cambiar el estado a `topLevelMode = 'landing'`, renderizando fluidamente la Landing Page en la misma vista/pantalla.
2. **Entrada a la App desde Landing 100% In-App:**
   - Al pulsar "🚀 Abrir App", "🔥 Iniciar Rodada Gratis" o "🏍️ Probar Modo Conducción" en la Landing Page, se pasa a `topLevelMode = 'app'`.
3. **Limpieza y Simplificación de Helpers:**
   - Simplificar `src/utils/navigationHelper.ts` para que la navegación sea puramente interna y limpia, eliminando la creación de etiquetas `<a>` dinámicas o `target="_blank"`.
4. **Textos y Etiquetas Claras:**
   - Actualizar las etiquetas en español e inglés (`i18n.ts`) para que indiquen claramente "Página Principal" / "Main Page" o "Inicio" / "Home".

---

## 3. Archivos y Recursos Afectados
- `src/utils/navigationHelper.ts` (Simplificación de la función de navegación a Landing)
- `src/components/common/Header.tsx` (Botón 🏠/🌐 del Header llamando a navegación interna a Landing)
- `src/components/common/Sidebar.tsx` (Item del menú lateral llamando a navegación interna a Landing)
- `src/components/auth/WelcomeAuthScreen.tsx` (Botón "← Página Principal" llamando a navegación interna a Landing)
- `src/utils/i18n.ts` (Traducciones para `nav.landingPage` o `nav.home` en ES/EN)

---

## 4. Instrucciones Paso a Paso / Tareas de Implementación

### Tarea 1: Simplificar `src/utils/navigationHelper.ts`
1. Mantener `isStandaloneApp()` si se usa para detección informativa.
2. Refactorizar `goToLandingOrExternal(setTopLevelMode)` para que siempre ejecute de forma directa y limpia:
   ```typescript
   export function goToLanding(setTopLevelMode?: (mode: 'landing' | 'app') => void) {
     if (setTopLevelMode) {
       setTopLevelMode('landing')
     }
   }
   ```
3. Exportar `goToLanding` (y mantener alias compatible si es necesario) para garantizar que nunca intente abrir enlaces externos ni disparar descargas/navegadores secundarios.

### Tarea 2: Actualizar `src/components/common/Header.tsx`
1. El botón de volver a la página principal en la barra superior (junto al perfil y notificaciones) debe usar un ícono claro (🏠 o 🌐) y llamar a `goToLanding(setTopLevelMode)` o `setTopLevelMode('landing')`.
2. Asignar `aria-label` y `title` con la traducción `t('nav.landingPage')` o `t('nav.home')`.

### Tarea 3: Actualizar `src/components/common/Sidebar.tsx`
1. En el menú de navegación lateral, el item que lleva a la página principal debe llamar a:
   ```typescript
   onClick={() => {
     setTopLevelMode('landing')
     setSidebarOpen(false)
   }}
   ```
2. Icono representativo: `🏠` y etiqueta clara (ej. `t('nav.landingPage')`).

### Tarea 4: Actualizar `src/components/auth/WelcomeAuthScreen.tsx`
1. El botón superior izquierdo de la pantalla de bienvenida/login debe decir `← Inicio` o `🏠 Página Principal`.
2. Al hacer clic, ejecutar `setTopLevelMode('landing')`.

### Tarea 5: Ajustar traducciones en `src/utils/i18n.ts`
Asegurar que existan las claves de traducción limpias:
- ES: `nav.landingPage: "Página Principal"`, `welcome.backToLanding: "← Página Principal"`
- EN: `nav.landingPage: "Main Page"`, `welcome.backToLanding: "← Main Page"`

---

## 5. Criterios de Aceptación / Definition of Done (DoD)
- [ ] Al estar en el Tablero (Cockpit) y hacer clic en el botón 🏠/🌐 del Header, la aplicación cambia instantáneamente a la Landing Page sin abrir pestañas ni navegadores externos.
- [ ] Al abrir el menú lateral (Sidebar) y hacer clic en "Página Principal", se cierra el sidebar y se muestra la Landing Page.
- [ ] En la pantalla de Bienvenida / Inicio de sesión, al hacer clic en "← Página Principal", se muestra la Landing Page de inmediato.
- [ ] En la Landing Page, al hacer clic en "🚀 Abrir App" o cualquier CTA, se entra a la aplicación de inmediato.
- [ ] Todo funciona igual y sin errores en navegador de escritorio, navegador móvil, PWA instalada y APK.
- [ ] `npm run build` compila al 100% sin errores de tipos TypeScript.

---

## 6. Restricciones Técnicas y Reglas de Calidad
- **Zero-Discovery Waste:** No agregar librerías externas ni reescribir componentes no relacionados.
- **Sin Popups ni Redirecciones Externas:** Todo el flujo se mantiene dentro de la misma instancia de la aplicación React.
- **Estilo Visual:** Mantener la estética cuidada con Tailwind CSS, transiciones suaves y microinteracciones (`active:scale-95`).
