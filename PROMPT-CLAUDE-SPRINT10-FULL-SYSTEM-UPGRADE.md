# 📋 PROMPT DE EJECUCIÓN: SPRINT 10 (Upgrade Integral: GPS Real, Voz Waze, Intercom Convoy, SOS 2s, Auth Supabase y Mobile Header)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Se requiere implementar una actualización mayor en Bike Tracker que abarca:
1. **Header Móvil en Landing:** Botón "📲 Instalar" visible en el header móvil junto a "🚀 Abrir App", evitando solapamiento con el chatbot.
2. **Aislamiento de App en APK/PWA:** Si la aplicación corre instalada (`display-mode: standalone` o `Capacitor`), inicia directamente en la aplicación (`topLevelMode = 'app'`), sin mostrar la Landing Page.
3. **Geolocalización GPS Real:** Soporte de rastreo GPS en vivo con `navigator.geolocation.watchPosition` (alta precisión), actualizando la posición real, velocidad y progreso en el mapa.
4. **Navegación por Voz tipo Waze:** Instrucciones sonoras automáticas paso a paso con `window.speechSynthesis` ante giros y maniobras de ruta.
5. **Alertas de Intercomunicador de Convoy:** Anuncios de voz al solicitar gasolina, reagrupación o cuando un piloto queda rezagado.
6. **Botón SOS Mejorado (2 Segundos Hold-to-Toggle):** Pulsación sostenida de 2s para activar y 2s para desactivar/apagar la sirena inmediatamente.
7. **Autenticación con Supabase:**
   - **Iniciar Sesión:** Solo Correo y Contraseña.
   - **Crear Cuenta:** Nombre, Apellidos, Género, Teléfono/Contacto, Contraseña y Confirmar Contraseña (validación de coincidencia exacta).
   - Detección de usuario existente con mensaje de error amigable.
   - Cliente Supabase conectado a:
     - URL: `https://bzltbdqwbizvhlrnghmq.supabase.co`
     - Public Anon Key: `sb_publishable_p1V_z8CJIJxaATXmdWRMAg_c5X0Fzku`

---

## 2. [Archivos y Rutas Afectadas]
- `package.json` (Añadir `@supabase/supabase-js`).
- `src/services/supabaseClient.ts` (Nuevo cliente de Supabase).
- `src/services/voiceGuidanceService.ts` (Nuevo servicio de síntesis de voz para Waze e Intercom).
- `src/services/geolocationService.ts` (Servicio de rastreo GPS de alta precisión).
- `src/context/AppContext.tsx` (Integración de GPS real, voz, detección de standalone y Supabase).
- `src/components/landing/LandingPage.tsx` (Header móvil con botón Instalar y detección de standalone).
- `src/components/common/Header.tsx` y `src/components/common/BottomNav.tsx` (Botón SOS con retención de 2s).
- `src/components/emergency/SOSModal.tsx` (Cancelación inmediata en 2s).
- `src/components/auth/AuthModal.tsx` (Formularios separados de Login y Registro con campos completos).
- `src/utils/i18n.ts` (Nuevas llaves para voz, campos de registro y errores).

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### A. Instalar `@supabase/supabase-js` y Crear Cliente
1. Ejecutar: `npm install @supabase/supabase-js`
2. Crear `src/services/supabaseClient.ts`:
   ```ts
   import { createClient } from '@supabase/supabase-js'

   const SUPABASE_URL = 'https://bzltbdqwbizvhlrnghmq.supabase.co'
   const SUPABASE_ANON_KEY = 'sb_publishable_p1V_z8CJIJxaATXmdWRMAg_c5X0Fzku'

   export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
   ```

---

### B. Crear Servicio de Voz para Waze e Intercom (`src/services/voiceGuidanceService.ts`)
1. Implementar funciones que utilicen `window.speechSynthesis`:
   - `speakInstruction(text: string, lang: 'es' | 'en')`: Anuncio de giros y maniobras viales.
   - `speakConvoyAlert(type: 'gas' | 'regroup' | 'laggard' | 'sos', memberName: string, lang: 'es' | 'en', extra?: string)`:
     - Gas: *"Notificación: [Nombre] solicitó parada de gasolina al convoy"*
     - Reagrupar: *"Solicitud: [Nombre] pide reagrupar el convoy"*
     - Rezagado: *"Atención convoy: [Nombre] se encuentra rezagado"*
     - SOS: *"Alerta de emergencia SOS activada por [Nombre]"*
2. Evitar que las frases se superpongan cancelando o encolando adecuadamente (`speechSynthesis.cancel()`).

---

### C. Soporte de GPS Real del Dispositivo
1. En `src/context/AppContext.tsx`:
   - Añadir estado `trackingRealGps: boolean` (por defecto activo si el usuario concede permisos).
   - Iniciar `navigator.geolocation.watchPosition` con `{ enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }`.
   - Cuando se reciba una coordenada GPS real:
     - Actualizar la posición del usuario actual (`isCurrentUser = true`).
     - Actualizar velocidad real (`coords.speed ? coords.speed * 3.6 : 0` km/h).
     - Comparar distancia al próximo punto de maniobra y disparar `speakInstruction(...)` si está a menos de 150 metros.

---

### D. Botón SOS con Hold de 2 Segundos (Activar y Desactivar)
1. En `src/components/common/BottomNav.tsx`:
   - Reemplazar el `onClick` directo por un controlador de retención de **2000 ms** (`onPointerDown` y `onPointerUp`/`onPointerLeave`).
   - Mostrar indicador visual de carga durante la pulsación.
   - Si `sosActive === true`, mantener presionado 2s (o un toque de confirmación) apaga la alarma inmediatamente (`cancelSOS()`).
2. En `src/components/emergency/SOSModal.tsx`:
   - Ajustar `HOLD_DURATION_MS = 2000`.

---

### E. Rediseño de Formularios en `src/components/auth/AuthModal.tsx`
1. **Pestaña Iniciar Sesión (`tab === 'signin'`):**
   - Campo: Correo Electrónico.
   - Campo: Contraseña.
   - Botón: "Iniciar Sesión".
2. **Pestaña Crear Cuenta (`tab === 'signup'`):**
   - Campo: Nombre.
   - Campo: Apellidos.
   - Campo: Género (Selector: Hombre, Mujer, Otro / Prefiero no decir).
   - Campo: Teléfono / Número de Contacto.
   - Campo: Correo Electrónico.
   - Campo: Contraseña.
   - Campo: Confirmar Contraseña.
   - **Validaciones:**
     - Comprobar que Contraseña y Confirmar Contraseña sean idénticas. Si no coinciden: *"Las contraseñas no coinciden"*.
     - Conectar con `supabase.auth.signUp(...)` o `supabase.auth.signInWithPassword(...)`.
     - Si Supabase retorna error de usuario existente: *"Ya existe un usuario registrado con este correo. Por favor inicia sesión"*.

---

### F. Corrección en Header de Landing Page y Aislamiento APK
1. En `src/components/landing/LandingPage.tsx`:
   - En el `<header>`, hacer que el botón `"📲 Instalar App"` esté visible tanto en móvil como en escritorio (`flex items-center` en lugar de `hidden sm:inline-flex`), colocado a la izquierda de `"🚀 Abrir Aplicación"`.
2. En la inicialización de `topLevelMode` (`src/context/AppContext.tsx`):
   - Si se detecta entorno APK/PWA (`window.matchMedia('(display-mode: standalone)').matches || window.Capacitor?.isNativePlatform()`), inicializar `topLevelMode` en `'app'`.

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Botón Instalar Visible en Móvil:** En la versión móvil de la Landing, "📲 Instalar" aparece en la cabecera superior sin quedar tapado.
2. ✅ **Arranque Directo en APK:** La app instalada abre directamente en el Cockpit/App sin pasar por la Landing.
3. ✅ **GPS Real Activo:** La ubicación del piloto se actualiza con las coordenadas reales del teléfono.
4. ✅ **Voz Waze Funcional:** Las maniobras de ruta se cantan por voz en español/inglés.
5. ✅ **Intercom por Voz:** Gasolina, rezagados y SOS se anuncian por voz.
6. ✅ **SOS Seguro:** Requiere 2 segundos para activarse y se cancela limpiamente apagando el sonido.
7. ✅ **Auth Supabase Separado:** Login simple y Registro completo con confirmación de clave y validación de existencia.
8. ✅ **Compilación Limpia:** `npm run build` compila con 0 errores de TypeScript.
