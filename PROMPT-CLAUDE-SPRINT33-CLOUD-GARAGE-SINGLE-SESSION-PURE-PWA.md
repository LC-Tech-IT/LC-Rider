# 📋 PROMPT DE EJECUCIÓN: SPRINT 33 (Blindaje GTM: Foco PWA Pura, Garaje Cloud en Supabase, Sesión Única Concurrente y Checkout Wompi)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**.
El producto ha iniciado su campaña publicitaria en el mercado colombiano y se encuentra en fase activa de **Go-To-Market (GTM)**. Es imperativo consolidar la confianza de los visitantes, garantizar la disponibilidad multiplataforma de sus vehículos y suscripciones, y blindar el modelo de negocio contra el uso indebido de cuentas compartidas.

---

## 2. [Objetivo Concreto y Alcance]
Implementar de forma atómica y coordinada cuatro pilares de producción:
1. **Retiro Definitivo de Instalación por APK (Foco 100% PWA Pura):**
   - Eliminar del modal de instalación toda referencia a descarga de archivos `.apk` y advertencias sobre fuentes desconocidas.
   - Rediseñar el modal para guiar al usuario de forma impecable y directa a instalar la PWA según su plataforma (un solo clic en Android/Desktop; guía visual de 3 pasos en iOS Safari).
2. **Persistencia en la Nube de Vehículos y Planes (Supabase Database):**
   - Conectar la lectura, inserción y borrado del garaje directamente con la tabla `public.vehicles` de Supabase para usuarios autenticados.
   - Sincronizar el nivel de suscripción (`tier`), fecha de vencimiento (`subscription_expires_at`), nombre y código de club en la tabla `public.profiles` de Supabase.
   - Mantener el almacenamiento en `localStorage` como capa de caché para funcionamiento offline en carretera.
3. **Control de Sesión Única Activa por Dispositivo (Single Active Session Enforcement):**
   - Evitar que múltiples moteros compartan una misma cuenta y rueden simultáneamente en diferentes motos.
   - Asignar un `active_session_id` único por dispositivo en `public.profiles`.
   - Monitorear en tiempo real (Supabase Realtime) si la cuenta se abre en otro dispositivo. Si esto ocurre, suspender de inmediato la telemetría en el dispositivo anterior y desplegar un modal de bloqueo amigable con opción de cerrar sesión o retomar control.
4. **Garantía y Persistencia Cloud del Checkout con Wompi:**
   - Asegurar que al completar una transacción exitosa (`APPROVED`) mediante el widget de Wompi, el upgrade del plan impacte inmediatamente la base de datos de Supabase.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `SUPABASE-DATABASE-SETUP.sql` (Actualizar script con las columnas y políticas RLS necesarias para suscripciones, sesión única y documentos).
- `src/components/common/InstallAppModal.tsx` (Rediseño a PWA pura sin APK).
- `src/components/common/ConcurrentSessionModal.tsx` (Nuevo componente: modal de bloqueo por sesión concurrente).
- `src/context/AppContext.tsx` (Lógica de sincronización cloud de vehículos, perfil/tier en Supabase, generación de `active_session_id`, escucha Realtime de sesión y cierre/desconexión).
- `src/components/common/SubscriptionModal.tsx` (Garantizar sincronización con Supabase al recibir confirmación de Wompi).
- `src/utils/i18n.ts` (Textos actualizados en `es` y `en` para PWA pura y modal de sesión concurrente).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Paso 1: Actualización del Esquema SQL (`SUPABASE-DATABASE-SETUP.sql`)
1. Incluir las sentencias idempotentes (`add column if not exists`) para ampliar `public.profiles`:
   ```sql
   alter table public.profiles
     add column if not exists tier text default 'free',
     add column if not exists subscription_expires_at timestamp with time zone,
     add column if not exists club_name text,
     add column if not exists club_code text,
     add column if not exists active_session_id text,
     add column if not exists last_active_at timestamp with time zone default timezone('utc'::text, now());
   ```
2. Asegurar en `public.vehicles` las columnas para el almacenamiento de los documentos (nombre y data base64):
   ```sql
   alter table public.vehicles
     add column if not exists soat_file_name text,
     add column if not exists soat_file_data text,
     add column if not exists tecno_file_name text,
     add column if not exists tecno_file_data text;
   ```
3. Asegurar que las políticas de RLS permitan al usuario autenticado actualizar su propio perfil y gestionar sus vehículos (`auth.uid() = id` y `auth.uid() = user_id`).
4. Habilitar publicación Realtime en `public.profiles` para detectar cambios de sesión:
   ```sql
   alter publication supabase_realtime add table public.profiles;
   ```

---

### Paso 2: Rediseño de `src/components/common/InstallAppModal.tsx` (100% PWA Pura)
1. Eliminar la pestaña/subvista `apk`, las constantes `APK_VERSION`, `APK_SIZE` y cualquier enlace hacia `/downloads/bike-tracker.apk`.
2. Estructurar el modal con enfoque de conversión directa:
   - **Encabezado:** Logo oficial de Bike Tracker, título *"Instala Bike Tracker en tu Celular"* y subtítulo *"Acceso instantáneo sin descargas pesadas ni tiendas de aplicaciones"*.
   - **Caso 1: Dispositivo Android / Chrome / Edge con soporte nativo (`canInstallNatively = true`):**
     - Botón principal de llamada a la acción: **"⚡ Instalar en tu Pantalla de Inicio"** con icono y estilo de alto impacto (`bg-bike-orange text-white shadow-glow-orange`), invocando `triggerNativeInstall()`.
     - Texto de apoyo destacando que consume menos de 1 MB y funciona sin conexión en carretera.
   - **Caso 2: Dispositivo iOS / Safari (`isIosDevice = true`):**
     - Lista visual paso a paso con badges numéricos numerados:
       1. Toca el botón **Compartir** (icono nativo de Safari `⎋` o cuadro con flecha arriba) en la barra inferior.
       2. Desliza hacia abajo y presiona **"Agregar al inicio"** (icono `📲` o `➕`).
       3. Confirma tocando **"Agregar"** en la esquina superior derecha.
   - **Caso 3: Navegador de escritorio u otros navegadores:**
     - Explicación amigable de cómo anclar la aplicación desde el menú de opciones del navegador.
   - **Pie de Modal:** Botón secundario *"Continuar usando en la web"* y botón de cerrar.

---

### Paso 3: Sincronización Cloud del Garaje y Suscripciones en `src/context/AppContext.tsx`
1. **Carga de Datos al Autenticarse:**
   - Al recibir sesión válida en `applyAuthenticatedProfile` o `onAuthStateChange`:
     - Consultar en Supabase `profiles` los campos: `tier`, `subscription_expires_at`, `club_name`, `club_code`. Si existen, actualizar el estado del usuario en memoria y en la caché local.
     - Consultar en Supabase `vehicles`: `supabase.from('vehicles').select('*').eq('user_id', profile.id)`.
     - Mapear los registros de Supabase a la interfaz `Vehicle`.
     - Si Supabase retorna vehículos, establecerlos como el garaje activo del usuario y sincronizar con `localStorage`.
     - Si Supabase retorna vacío pero existen vehículos locales previos para esa cuenta, insertarlos en Supabase para no perder la información del motero (migración transparente de primer inicio).
2. **Mutaciones Atómicas de Vehículos:**
   - En `addVehicle`:
     - Si el usuario está autenticado (`user.authProvider !== 'demo'`), ejecutar inserción en `supabase.from('vehicles').insert(...)`.
     - Mantener la actualización inmediata en el estado de React y la caché local.
   - En `deleteVehicle`:
     - Si el usuario está autenticado, ejecutar `supabase.from('vehicles').delete().eq('id', vehicleId).eq('user_id', user.id)`.
3. **Persistencia del Plan de Suscripción:**
   - En `upgradeTier` y `redeemClubCode`:
     - Además de actualizar el estado local, si el usuario está autenticado, ejecutar:
       ```ts
       supabase.from('profiles').update({
         tier,
         subscription_expires_at: expiresAt,
         club_name: clubName ?? null,
         club_code: clubCode ?? null,
         updated_at: new Date().toISOString()
       }).eq('id', user.id)
       ```

---

### Paso 4: Control de Sesión Única Activa (Single Device Active Session)
1. **Identificador de Sesión:**
   - Generar un identificador de sesión único por dispositivo al inicializar o autenticar:
     ```ts
     const currentSessionIdRef = useRef<string>(
       sessionStorage.getItem('biketracker.session_id') || `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
     )
     ```
   - Guardar en `sessionStorage` para mantener consistencia durante la navegación.
2. **Registro de Sesión Activa:**
   - Al iniciar sesión con éxito o recuperar sesión, actualizar en Supabase:
     ```ts
     supabase.from('profiles').update({
       active_session_id: currentSessionIdRef.current,
       last_active_at: new Date().toISOString(),
     }).eq('id', profile.id)
     ```
3. **Monitoreo en Tiempo Real y Expulsión:**
   - Suscribirse mediante Supabase Realtime a cambios en la tabla `profiles` para el usuario activo:
     ```ts
     const sessionChannel = supabase
       .channel(`session-watch:${profile.id}`)
       .on(
         'postgres_changes',
         { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` },
         (payload) => {
           const remoteSessionId = payload.new?.active_session_id
           if (remoteSessionId && remoteSessionId !== currentSessionIdRef.current) {
             handleConcurrentSessionDetected()
           }
         }
       )
       .subscribe()
     ```
   - En `handleConcurrentSessionDetected`:
     - Detener inmediatamente cualquier ruta activa y transmisión de convoy (`clearRoute()`, remover suscripción a Realtime del convoy).
     - Establecer `concurrentSessionModalOpen = true`.
4. **Componente `src/components/common/ConcurrentSessionModal.tsx`:**
   - Crear un modal bloqueante (backdrop no cerrable por clic exterior) que informe al usuario:
     - Icono: `⚠️` con fondo ámbar/rojo.
     - Título: **"Sesión iniciada en otro dispositivo"**
     - Descripción: *"Tu cuenta de Bike Tracker ha iniciado sesión en otro celular o navegador. Para proteger tus datos y garantizar la equidad en el convoy, solo se permite un dispositivo activo a la vez."*
     - Botón Principal: **"Retomar control en este dispositivo"** (genera un nuevo `currentSessionIdRef`, actualiza Supabase `active_session_id` y cierra el modal).
     - Botón Secundario: **"Cerrar sesión"** (ejecuta `logout()`).

---

### Paso 5: Aseguramiento del Checkout de Wompi en `SubscriptionModal.tsx`
1. Al recibir respuesta positiva de Wompi (`result.status === 'APPROVED'`), invocar `upgradeTier(checkoutTier, billingCycle)` y asegurar que se espere la confirmación de la persistencia en Supabase.
2. Conservar el flujo complementario asistido de pago por QR Nequi/Bancolombia con redirección a WhatsApp para usuarios que elijan ese método con el mes extra de regalo.

---

### Paso 6: Actualización de Traducciones (`src/utils/i18n.ts`)
Agregar o actualizar todas las llaves en `es` y `en`:
- Mensajes de instalación PWA pura (retirando llaves obsoletas de APK).
- Textos del modal de sesión concurrente:
  - `session.concurrentTitle`: "Sesión iniciada en otro dispositivo" / "Session opened on another device"
  - `session.concurrentMessage`: "Tu cuenta ha iniciado sesión en otro dispositivo..." / "Your account has logged in on another device..."
  - `session.reclaimAction`: "Retomar control en este dispositivo" / "Take control on this device"
  - `session.logoutAction`: "Cerrar sesión" / "Log out"

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] No existen enlaces, descargas ni menciones al archivo APK en el modal de instalación ni en la UI.
- [ ] El modal de instalación detecta si el usuario está en Android Chrome (prompt nativo) o iOS Safari (guía de 3 pasos) de forma limpia.
- [ ] Al registrar una moto en un dispositivo e iniciar sesión en otro navegador/dispositivo con la misma cuenta, los vehículos aparecen automáticamente desde Supabase.
- [ ] Al activar un plan Pro o Club, el estado de la suscripción se guarda en `public.profiles` de Supabase y persiste al recargar o cambiar de navegador.
- [ ] Si un usuario abre su cuenta en un segundo dispositivo, el primer dispositivo detecta el cambio en tiempo real, detiene el convoy y muestra el modal `ConcurrentSessionModal`.
- [ ] Al pulsar "Retomar control", el primer dispositivo recupera su sesión y actualiza su identificador en Supabase.
- [ ] El widget de Wompi opera correctamente con la llave de producción configurada y procesa el upgrade al aprobarse la transacción.
- [ ] La compilación con `npm run build` o `npx tsc --noEmit` pasa al 100% sin ningún error de TypeScript.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No romper el Modo Demo: Los visitantes anónimos deben poder seguir probando el simulador y las motos de prueba sin que la falta de sesión en Supabase arroje errores.
- Mantener la compatibilidad offline: Si no hay conexión a internet, el garaje debe seguir leyendo de `localStorage` sin colapsar la app.
- No alterar estilos ni tokens de Tailwind preexistentes; mantener la estética motera premium oscura/naranja de la marca.
