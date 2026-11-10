# 📋 PROMPT DE EJECUCIÓN: SPRINT 11 (Telemetría Real Multi-Piloto con Supabase Realtime, Aislamiento de App y Limpieza UX)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. El usuario requiere transformar Bike Tracker de un entorno con datos simulados a una **plataforma 100% operativa en producción real**, con las siguientes directrices clave:
1. **Convoy 100% Real (Multi-dispositivo GPS en vivo):** Los usuarios registrados reales NO deben ver pilotos quemados o simulados. Al crear o unirse a una sala con PIN, la posición GPS real de cada piloto se sincroniza en tiempo real en el mapa mediante **Supabase Realtime** (`supabase.channel`).
2. **Modo Demo Aislado:** La simulación y los 3 vehículos ficticios quedan confinados **exclusivamente** al "Modo Demo" para pruebas.
3. **Aislamiento de la App vs Landing:**
   - La app instalada (o en modo app) **nunca muestra el Landing Page**.
   - El botón 🌐 en el Header ahora abre la Landing Page en una **pestaña externa del navegador** (`window.open('https://biker-tracker.vercel.app', '_blank')`).
   - Se elimina el botón redundante de "Instalar App" dentro del Header/Sidebar de la app (solo vive en la Landing Page).
4. **Internacionalización Dinámica de Errores (ES / EN):** Todos los errores de Supabase, validaciones de contraseñas y mensajes de red deben traducirse estrictamente según `lang` activo.
5. **Autenticación con Supabase (Email + Google OAuth):**
   - Integración de `supabase.auth.signInWithOAuth({ provider: 'google' })` y `supabase.auth.signUp(...)` / `supabase.auth.signInWithPassword(...)`.
   - Registro con: Nombre, Apellidos, Género, Teléfono, Correo, Contraseña y Confirmar Contraseña (validación de coincidencia exacta y manejo de duplicados).

---

## 2. [Archivos y Rutas Afectadas]
- `src/services/supabaseClient.ts` (Sincronización de canales Realtime y autenticación).
- `src/context/AppContext.tsx` (Separación radical de estado Real vs Demo, sincronización Supabase Realtime para salas de convoy).
- `src/components/common/Header.tsx` (Botón 🌐 abre landing externa; eliminar botón instalar app).
- `src/components/common/Sidebar.tsx` (Eliminar opción redundante de instalar app dentro de la app).
- `src/components/auth/AuthModal.tsx` (Formularios refinados con i18n dinámico y Google Auth real vía Supabase).
- `src/components/auth/GoogleAuthModal.tsx` (Disparar OAuth real de Supabase o fallback amigable).
- `src/utils/i18n.ts` (Llaves completas en ES/EN para errores de red, Supabase y convoy en vivo).

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### A. Integración de Supabase Realtime para Convoyes Reales (`src/context/AppContext.tsx`)
1. **Diferenciación Demo vs Usuario Real:**
   - Si `user.email === 'demo@biketracker.app'` (Modo Demo): Cargar `DEMO_VEHICLES` y `createInitialConvoyMembers()` con simulación.
   - Si es un usuario autenticado real: Inicializar `convoyMembers` únicamente con el usuario actual (`isCurrentUser = true`, posición GPS real).
2. **Sincronización de Sala en Vivo con Supabase Realtime:**
   - Al crear (`createConvoyRoom`) o unirse (`joinConvoyRoom`) a una sala con PIN:
     - Suscribirse a un canal Realtime: `const channel = supabase.channel(`convoy:${pin}`)`.
     - Escuchar eventos de presencia/broadcast: `channel.on('broadcast', { event: 'location_update' }, (payload) => { ... })`.
     - Emitir la propia ubicación GPS real cada vez que `navigator.geolocation.watchPosition` capture una nueva coordenada:
       ```ts
       channel.send({
         type: 'broadcast',
         event: 'location_update',
         payload: {
           userId: user.id,
           name: user.name,
           avatarEmoji: activeVehicle.avatarEmoji,
           plate: activeVehicle.plate,
           role: myRole,
           position: currentGpsCoords,
           speedKmh: currentSpeed,
           status: sosActive ? 'sos' : 'en-ruta'
         }
       })
       ```
     - Al recibir eventos de otros pilotos en la misma sala, agregarlos o actualizarlos en `convoyMembers` para que Leaflet los dibuje en vivo.

---

### B. Aislamiento y Redirección Externa del Landing
1. En `src/components/common/Header.tsx`:
   - El botón 🌐 debe ejecutar:
     ```tsx
     window.open('https://biker-tracker.vercel.app', '_blank')
     ```
   - Eliminar cualquier llamada a `setTopLevelMode('landing')` desde el interior de la app autenticada.
2. En `src/components/common/Sidebar.tsx`:
   - Eliminar el botón o item "Instalar App" para evitar redundancias dentro de la aplicación.

---

### C. Autenticación con Google OAuth Real en Supabase
1. En `src/context/AppContext.tsx`:
   - Implementar función `signInWithGoogle`:
     ```ts
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: window.location.origin
       }
     })
     ```
2. En `src/components/auth/AuthModal.tsx` y `WelcomeAuthScreen.tsx`:
   - El botón "Continuar con Google" debe invocar `signInWithGoogle()`.

---

### D. Diccionario de Errores y Validaciones Multilingüe (`src/utils/i18n.ts`)
1. Agregar llaves para todos los casos de error en `es` y `en`:
   - `auth.errorPasswordMismatch`: `"Las contraseñas no coinciden"` / `"Passwords do not match"`.
   - `auth.errorUserExists`: `"Ya existe un usuario registrado con este correo. Por favor inicia sesión."` / `"A user is already registered with this email. Please sign in."`.
   - `auth.errorInvalidCredentials`: `"Correo o contraseña incorrectos."` / `"Invalid email or password."`.
   - `auth.errorEmailDisabled`: `"El acceso por correo está desactivado en la configuración del servidor."` / `"Email sign-in is disabled in server settings."`.
   - `convoy.realGpsWaiting`: `"Esperando señal GPS real..."` / `"Waiting for real GPS signal..."`.
   - `convoy.aloneInRoom`: `"Eres el único piloto en la sala. Comparte el PIN para que otros se unan."` / `"You are the only rider in this room. Share the PIN to invite others."`.

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Convoy Real sin Datos Quemados:** Un usuario real solo ve su posición GPS real y a los miembros reales que se conecten a su misma sala de PIN.
2. ✅ **Modo Demo Intacto:** El Modo Demo sigue disponible con simulación para demostraciones y pruebas rápidas.
3. ✅ **Landing Externa:** El botón 🌐 abre la web en una pestaña nueva sin romper la vista de la app.
4. ✅ **UI Limpia sin Botón Instalar Interno:** El botón de instalación solo se muestra en la Landing Page externa.
5. ✅ **Respuestas Multilingües:** Todos los errores de autenticación y red respetan estrictamente el idioma seleccionado (ES/EN).
6. ✅ **Compilación Limpia:** `npm run build` compila con 0 errores.
