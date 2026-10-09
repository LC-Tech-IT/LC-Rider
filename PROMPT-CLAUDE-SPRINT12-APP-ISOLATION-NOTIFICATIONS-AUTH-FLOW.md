# 📋 PROMPT DE EJECUCIÓN: SPRINT 12 (Aislamiento Total de la App, Centro de Notificaciones 🔔, Recordar Sesión y Flujo Web vs App)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. El usuario ha detectado puntos críticos de aislamiento y experiencia de usuario en la aplicación:
1. **El botón "← Inicio" en `WelcomeAuthScreen.tsx` NO debe cambiar la vista a la Landing Page:** Actualmente tiene `onClick={() => setTopLevelMode('landing')}`, lo que hace que la app instalada muestre la Landing Page dentro de la misma ventana. Debe cambiarse para que abra la web oficial en una **pestaña externa del navegador** (`window.open('https://biker-tracker.vercel.app', '_blank')`) con el texto `🌐 Web Oficial`.
2. **Centro de Notificaciones Real (Campana 🔔):** Al hacer clic en la campana del Header, actualmente no ocurre nada. Debe abrir un **Panel / Modal de Notificaciones (`NotificationModal.tsx`)** que liste alertas de SOS, peticiones de convoy (gasolina, reagrupación) y vencimientos de SOAT.
3. **Opción "Mantener Sesión Iniciada" (Remember Me):** En el login y registro, permitir elegir si la sesión se guarda permanentemente (`localStorage`) o solo mientras la app esté abierta (`sessionStorage`), de modo que al cerrar la app pida credenciales de nuevo si no se marcó la opción.
4. **Flujo de Acceso en Landing Móvil:** Al pulsar "Abrir Aplicación" desde el móvil, ingresar de forma directa a la app web (`setTopLevelMode('app')`).

---

## 2. [Archivos y Rutas Afectadas]
- `src/components/auth/WelcomeAuthScreen.tsx` (Línea 17-22: Reemplazar `setTopLevelMode('landing')` por `window.open('https://biker-tracker.vercel.app', '_blank')`).
- `src/components/common/Header.tsx` (Conectar botón 🔔 para abrir `NotificationModal`).
- `src/components/common/NotificationModal.tsx` (Nuevo componente modal de notificaciones).
- `src/components/auth/AuthModal.tsx` (Checkbox "Mantener mi sesión iniciada" y persistencia condicional).
- `src/context/AppContext.tsx` (Estado de notificaciones leídas/no leídas y manejo de persistencia session vs local).
- `src/utils/i18n.ts` (Nuevas llaves para notificaciones, web oficial y recordar sesión en ES/EN).

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### A. Modificar el Botón en la Cabecera de `src/components/auth/WelcomeAuthScreen.tsx`
1. Ubicar la cabecera superior (líneas 16–23 aprox.):
   - **Antes:**
     ```tsx
     <button
       onClick={() => setTopLevelMode('landing')}
       className="rounded-full border border-bike-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-card transition hover:bg-slate-50"
     >
       {t('welcome.backToLanding')}
     </button>
     ```
   - **Después:**
     ```tsx
     <button
       onClick={() => window.open('https://biker-tracker.vercel.app', '_blank')}
       className="flex items-center gap-1.5 rounded-full border border-bike-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-card transition hover:bg-slate-50 hover:text-bike-ink active:scale-95"
       title={t('welcome.openOfficialWeb')}
     >
       <span>🌐</span>
       <span>{t('welcome.openOfficialWeb')}</span>
     </button>
     ```
2. De esta forma, la app instalada **nunca renderiza la Landing Page internamente**, sino que envía al usuario a la web externa.

---

### B. Crear el Centro de Notificaciones (`src/components/common/NotificationModal.tsx`)
1. Crear `src/components/common/NotificationModal.tsx`:
   - Mostrar lista cronológica de notificaciones activas:
     - **Alertas SOS activas** (con badge rojo y botón "Ver en mapa" que lleva a la vista `map`).
     - **Peticiones de convoy** (gasolina, reagrupación, peligros en ruta con fecha y hora).
     - **Vencimientos de documentos** (SOAT o Tecnomecánica por vencer o vencidos del vehículo activo).
   - Botón superior "Marcar todas como leídas / Limpiar".
   - Estado vacío elegante: *"No tienes notificaciones pendientes. ¡Todo en orden para rodar!"*.
2. En `src/components/common/Header.tsx`:
   - Al pulsar el botón 🔔, abrir `NotificationModal`.
   - Mostrar el contador de notificaciones no leídas en el badge rojo sobre la campana.

---

### C. Implementar "Mantener Sesión Iniciada" (Remember Me)
1. En `src/components/auth/AuthModal.tsx`:
   - Agregar estado `const [rememberMe, setRememberMe] = useState(true)`.
   - Renderizar el checkbox antes del botón de submit:
     ```tsx
     <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
       <input
         type="checkbox"
         checked={rememberMe}
         onChange={(e) => setRememberMe(e.target.checked)}
         className="h-4 w-4 rounded border-bike-border text-bike-orange focus:ring-bike-orange"
       />
       <span>{t('auth.rememberMe')}</span>
     </label>
     ```
2. En `src/context/AppContext.tsx`:
   - Al autenticar o guardar sesión:
     - Si `rememberMe === true`: Guardar en `localStorage`.
     - Si `rememberMe === false`: Guardar exclusivamente en `sessionStorage` y limpiar `localStorage`, de modo que al cerrar la app, la sesión expire automáticamente.

---

### D. Actualizar Diccionario en `src/utils/i18n.ts`
Agregar traducciones en `es` y `en`:
* **En `es`:**
  ```ts
  'welcome.openOfficialWeb': 'Web Oficial',
  'auth.rememberMe': 'Mantener mi sesión iniciada en este dispositivo',
  'notifications.title': 'Centro de Notificaciones',
  'notifications.empty': 'No tienes notificaciones pendientes. ¡Todo en orden para rodar!',
  'notifications.clearAll': 'Limpiar todas',
  'notifications.viewOnMap': 'Ver en mapa →',
  'notifications.sosAlert': '🚨 Alerta SOS de {{name}}',
  'notifications.docAlert': '⚠️ SOAT / Tecnomecánica próximo a vencer en {{plate}}',
  ```
* **En `en`:**
  ```ts
  'welcome.openOfficialWeb': 'Official Website',
  'auth.rememberMe': 'Keep me signed in on this device',
  'notifications.title': 'Notification Center',
  'notifications.empty': 'No pending notifications. All clear to ride!',
  'notifications.clearAll': 'Clear all',
  'notifications.viewOnMap': 'View on map →',
  'notifications.sosAlert': '🚨 SOS Alert from {{name}}',
  'notifications.docAlert': '⚠️ SOAT / Inspection expiring soon for {{plate}}',
  ```

---

## 4. [Criterios de Aceptación / DoD]
1. ✅ **Aislamiento Total del Botón de Cabecera:** Al hacer clic en el botón superior izquierdo de `WelcomeAuthScreen.tsx`, abre la Landing Page en una pestaña nueva del navegador externo (`window.open('https://biker-tracker.vercel.app', '_blank')`), sin alterar el estado interno ni mostrar la Landing dentro de la app instalada.
2. ✅ **Campana 🔔 Funcional:** Abre el modal de notificaciones con eventos reales de SOS, convoy y garaje.
3. ✅ **Recordar Sesión:** Si se desmarca, al cerrar la app se solicitan credenciales de nuevo.
4. ✅ **Compilación:** `npm run build` compila con 0 errores.
