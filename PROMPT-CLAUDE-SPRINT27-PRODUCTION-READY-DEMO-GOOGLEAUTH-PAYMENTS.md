# 🚀 Prompt de Ejecución para Claude — Sprint 27: Modo Demo Showcase de Solo Lectura, Google Auth Real y Pasarela de Pagos para Producción

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
Estamos en la fase de **afinado final para lanzamiento a producción**. El Stakeholder y Product Lead ha establecido tres pilares críticos de negocio:

1. **Modo Demo (Showcase Interactivo & Read-Only):**
   - El Modo Demo debe ser una experiencia guiada donde el usuario **observe la app en plena acción** sin poder alterar datos reales.
   - Debe iniciar automáticamente una **ruta por defecto con simulación de GPS activa** (velocímetro reaccionando, convoy avanzando por el mapa, alertas de voz simuladas activas).
   - Los botones de acción que mutan datos (agregar/eliminar vehículos, editar perfil, cambiar documentos, crear salas de convoy reales en Supabase, etc.) deben estar en modo **Solo Lectura** y mostrar un Toast/Banner interactivo: *"Estás en Modo Demo (Solo Lectura). Regístrate gratis para crear tu propio garaje y rodar en tiempo real."*
2. **Autenticación con Google Real (OAuth):**
   - El botón de Google en `WelcomeAuthScreen.tsx` y `AuthModal.tsx` debe ejecutar el flujo OAuth real de Supabase (`supabase.auth.signInWithOAuth`), redirigiendo adecuadamente y sincronizando el perfil real del usuario con su nombre, correo y avatar de Google.
3. **Pasarela de Pagos Real (Integración Bancaria PSE, Tarjetas, Nequi):**
   - Implementar la integración de pagos para Colombia con **Wompi (Bancolombia) / Checkout Multi-banca** (soporte de PSE para todas las entidades bancarias, Nequi y tarjetas).
   - Utilizar la configuración de llave pública vía variables de entorno (`VITE_WOMPI_PUBLIC_KEY` o pasarela configurada) con fallback elegante y seguro.
   - Al seleccionar un plan (Convoy Pro o Biker Club), se genera la transacción real con la referencia de pago, monto en COP y redirección/widget oficial.

---

## 2. [Objetivo Concreto y Alcance]

### A. Modo Demo Sandbox / Showcase:
- Al invocar `loginDemo()`:
  - Activar `isDemoUser = true`.
  - Cargar una ruta predeterminada escénica (ej: Bogotá - La Calera / Embalse del Sisga).
  - Iniciar la simulación de rodada automáticamente (`startRide()` con simulación activa) para que el velocímetro, tacómetro y mapa muestren telemetría en vivo.
  - Bloquear mutaciones destructivas:
    - Intentar agregar o borrar vehículos en el Garaje -> Mostrar Toast restrictivo y no modificar la lista.
    - Intentar editar el perfil -> Mostrar Toast restrictivo.
    - Botones de convoy -> Mostrar simulación de miembros sin escribir en la base de datos de Supabase.

### B. Google OAuth Real:
- En `src/context/AppContext.tsx`:
  - `signInWithGoogle`: asegurar que `redirectTo` apunte a `window.location.origin` y capture el callback en `onAuthStateChange`.
  - Al completar el OAuth, poblar el perfil con los metadatos de Google (`full_name`, `avatar_url`, `email`) y abrir el flujo normal de usuario autenticado.

### C. Pasarela de Pagos Real (Wompi / PSE / Nequi / Tarjetas):
- Crear un servicio dedicado `src/services/paymentService.ts` que:
  - Soporte el Checkout Widget oficial de **Wompi** (estándar líder en Colombia con PSE para más de 20 bancos, Nequi y Tarjetas).
  - Genere la firma de integridad o referencia única (`BT-SUB-${userId}-${Date.now()}`).
  - Permita pagar los montos oficiales:
    - **Convoy Pro Mensual:** $9.900 COP
    - **Convoy Pro Anual:** $79.900 COP
    - **Biker Club Mensual:** $39.900 COP
  - Redirija o actualice el estado del usuario al recibir la confirmación de pago exitosa.
- Actualizar `SubscriptionModal.tsx` para conectar el botón de pago con el checkout real.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/context/AppContext.tsx` (Lógica de Modo Demo con simulación automática de ruta, guardas de solo lectura `isDemoUser`, y sesión Google OAuth).
- `src/services/paymentService.ts` (Nuevo servicio de integración de pasarela de pagos Wompi / PSE / Nequi).
- `src/components/common/SubscriptionModal.tsx` (Integración de pasarela de pago real y selección bancaria PSE).
- `src/components/garage/GarageView.tsx` (Deshabilitar / proteger acciones en modo demo con toast informativo).
- `src/components/garage/AddVehicleModal.tsx` (Protección contra guardado en modo demo).
- `src/components/auth/EditProfileModal.tsx` (Protección contra edición en modo demo).
- `src/components/convoy/ConvoyLobby.tsx` (Modo demostración visual de salas sin alterar Supabase).
- `src/utils/i18n.ts` (Mensajes de Modo Demo, alertas de solo lectura y pasarela de pago en ES/EN).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Perfeccionar el Modo Demo Showcase (`src/context/AppContext.tsx`)
1. Al pulsar `loginDemo()`:
   - Configurar usuario demo con `isDemoUser: true`, tier `pro`.
   - Establecer vehículo demo activo.
   - Cargar ruta por defecto (origen y destino con waypoints simulados).
   - Arrancar la simulación automáticamente (`setRideActive(true)`, `setSimulationRunning(true)`).
2. Crear un helper/guard en el contexto:
   ```typescript
   const checkDemoRestriction = (actionName: string): boolean => {
     if (isDemoUser) {
       showToast(t('demo.restrictedAction', { action: actionName }))
       return true // Es demo, bloquear acción
     }
     return false // Permitir acción
   }
   ```
3. Aplicar `checkDemoRestriction` en: `addVehicle`, `deleteVehicle`, `updateProfile`, `renewPlan`, `triggerSOS` (en demo muestra animación sin emitir a BD).

---

### Tarea 2: Asegurar el Flujo de Google OAuth (`src/context/AppContext.tsx`)
1. Revisar `signInWithGoogle`:
   ```typescript
   const signInWithGoogle = useCallback(async () => {
     const { error } = await supabase.auth.signInWithOAuth({
       provider: 'google',
       options: {
         redirectTo: window.location.origin,
         queryParams: {
           access_type: 'offline',
           prompt: 'consent',
         },
       },
     })
     if (error) throw new Error(translateAuthError(error.message, lang))
   }, [lang])
   ```
2. En `onAuthStateChange`, asegurarse de que al detectar un nuevo login de Google, si el usuario no tiene vehículo, redirija limpiamente al `OnboardingWizard` y extraiga `picture` o `avatar_url` para asignarlo a `user.avatarUrl`.

---

### Tarea 3: Crear el Servicio de Pasarela de Pagos (`src/services/paymentService.ts`)
1. Implementar la integración con el Checkout Widget de **Wompi**:
   - Cargar dinámicamente el script de Wompi (`https://checkout.wompi.co/widget.js`).
   - Configurar la transacción con:
     - `currency: 'COP'`
     - `amountInCents`: valor en centavos (ej: `990000` para $9.900 COP).
     - `reference`: referencia única.
     - `publicKey`: `import.meta.env.VITE_WOMPI_PUBLIC_KEY || 'pub_prod_...'` (con llave pública de producción/sandbox).
     - `customerData`: correo, nombre y teléfono del usuario.
2. Manejar la respuesta del widget (`onTransactionComplete` o callback de éxito/rechazo).

---

### Tarea 4: Actualizar `SubscriptionModal.tsx` con Checkout Real
1. Al hacer clic en "Confirmar y Pagar", invocar `paymentService.openWompiCheckout(...)` o la pasarela configurada.
2. Al recibir la confirmación de pago exitosa, actualizar el tier del usuario con `upgradeTier(tier, billingCycle)` y persistir los datos.

---

### Tarea 5: Textos y Traducciones (`src/utils/i18n.ts`)
1. Agregar llaves de i18n para:
   - `demo.banner`: *"Modo Demostración Activo — Visualizando telemetría y convoy en vivo"*
   - `demo.restrictedAction`: *"Acción no disponible en Modo Demo. Regístrate gratis para gestionar tu cuenta."*
   - `demo.exitDemo`: *"Salir de Modo Demo"*
   - `payment.wompiSecure`: *"Pago 100% seguro procesado por Wompi (Bancolombia) · PSE, Nequi y Tarjetas"*

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] En Modo Demo, la app arranca con una rodada y convoy en simulación continua activa (velocímetro, distancia, mapa en movimiento).
- [ ] En Modo Demo, los intentos de agregar/borrar vehículos, editar perfil o cambiar datos persistentes son bloqueados con un mensaje explicativo y amable.
- [ ] El botón de inicio de sesión con Google dispara la autenticación OAuth oficial de Supabase/Google sin errores de redirección.
- [ ] El modal de suscripción soporta el flujo de pago con PSE (todos los bancos de Colombia), Nequi y Tarjetas mediante la pasarela de pagos Wompi/Multi-banca.
- [ ] `npm run build` compila al 100% sin errores de TypeScript ni linter.
