# 📋 PROMPT DE EJECUCIÓN: SPRINT 34 (Cumplimiento Legal Ley 1581 Colombia, Política de Privacidad & Supresión Total de Cuenta)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**.
La aplicación está en plena pauta publicitaria en Colombia. Para blindar jurídicamente la operación ante la **Superintendencia de Industria y Comercio (SIC)** bajo la **Ley Estatutaria 1581 de 2012** (Régimen de Protección de Datos Personales / Habeas Data) y cumplir con los estándares internacionales de privacidad, debemos integrar la Política de Tratamiento de Datos, la autorización explícita en el registro y el flujo completo de **"Eliminar mi cuenta"** (Derecho de Supresión) tanto en la interfaz como en Supabase.

---

## 2. [Objetivo Concreto y Alcance]
1. **Política de Privacidad y Tratamiento de Datos Personales (Ley 1581):**
   - Crear el componente `src/components/common/PrivacyPolicyModal.tsx` con el texto legal completo adaptado a Colombia (responsable LC Tech, tratamiento de datos sensibles como telemetría GPS, garaje, SOAT, derechos ARCO y canales PQR).
   - Agregar enlaces para abrir este modal en:
     - El footer de la Landing Page (`src/components/landing/LandingView.tsx`).
     - El modal de autenticación/registro (`src/components/auth/AuthModal.tsx`).
     - El checkout de invitados (`src/components/common/SubscriptionModal.tsx`).
2. **Consentimiento Previo y Expreso en el Registro:**
   - En `AuthModal.tsx` (pestaña Crear Cuenta) y en el registro de invitados de `SubscriptionModal.tsx`, agregar checkbox obligatorio de aceptación de Términos y Política de Datos Personales (Ley 1581 de 2012) antes de proceder con el registro.
3. **Flujo de Supresión Total de Cuenta ("Eliminar mi cuenta"):**
   - En `src/components/auth/EditProfileModal.tsx`, agregar una sección de "Zona de Peligro" al final con el botón *"🗑️ Eliminar mi cuenta y mis datos"*.
   - Crear un modal de confirmación con advertencia de irreversibilidad (`DeleteAccountModal.tsx` o sub-modal de confirmación).
   - En `src/context/AppContext.tsx`, implementar la función `deleteAccount`:
     - Si es un usuario autenticado, eliminar su registro de `public.profiles` en Supabase (lo que por `on delete cascade` purga de inmediato sus vehículos en `vehicles`, alertas SOS y registros de convoy).
     - Ejecutar `supabase.auth.signOut()`.
     - Limpiar el `localStorage` y `sessionStorage` del dispositivo.
     - Mostrar un toast amigable confirmando la eliminación y redirigir a la Landing Page como usuario anónimo.
4. **Internacionalización y Textos:**
   - Agregar todas las llaves en `es` y `en` en `src/utils/i18n.ts`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/common/PrivacyPolicyModal.tsx` (Nuevo componente: modal con la Política de Privacidad y Habeas Data).
- `src/components/auth/EditProfileModal.tsx` (Agregar botón de eliminación de cuenta y modal de confirmación).
- `src/components/auth/AuthModal.tsx` (Agregar checkbox de consentimiento de datos y enlace a política).
- `src/components/common/SubscriptionModal.tsx` (Agregar consentimiento en registro de invitados).
- `src/components/landing/LandingView.tsx` (Agregar enlace de Privacidad en el pie de página).
- `src/context/AppContext.tsx` (Exponer estado del modal de privacidad y la función `deleteAccount`).
- `src/utils/i18n.ts` (Nuevas llaves para privacidad, consentimiento y eliminación de cuenta).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Paso 1: Crear `src/components/common/PrivacyPolicyModal.tsx`
1. Modal con fondo oscuro blur (`fixed inset-0 z-[110]`), scroll interno y diseño motero limpio.
2. Contenido estructurado en secciones claras:
   - **1. Responsable del Tratamiento:** LC Tech / Bike Tracker, Colombia. Correo: `contacto@biketracker.app`.
   - **2. Datos Recolectados:** Nombre, apellidos, correo, teléfono, datos de vehículos (placas, vencimiento SOAT y tecnomecánica).
   - **3. Tratamiento Especial de Geolocalización (GPS en Tiempo Real):** Declaración explícita de que las coordenadas GPS se usan únicamente durante la rodada para el mapa de convoy, cálculo de distancias al líder y botón SOS. **Nunca se venden, arriendan ni comparten con anunciantes ni terceros.**
   - **4. Finalidades del Tratamiento:** Operación del convoy, alertas de seguridad vial, gestión de alertas de documentos en el garaje y facturación.
   - **5. Derechos del Titular (Ley 1581 de 2012):** Conocer, actualizar, rectificar y suprimir datos personales (Derecho al olvido).
   - **6. Procedimiento para Ejercer Derechos y Supresión:** Uso del botón directo "Eliminar mi cuenta" en la aplicación o comunicación escrita a los canales de soporte.
   - **7. Seguridad de la Información:** Cifrado en tránsito (TLS/HTTPS), almacenamiento protegido en bases de datos con Row Level Security (RLS).
3. Botón para cerrar y volver a la app.

---

### Paso 2: Consentimiento en Formularios de Registro
1. **En `src/components/auth/AuthModal.tsx` (Pestaña "Crear Cuenta"):**
   - Agregar estado local `const [acceptTerms, setAcceptTerms] = useState(false)`.
   - Justo antes del botón de envío (`handleSignUp`), agregar:
     ```tsx
     <label className="flex cursor-pointer select-none items-start gap-2.5 text-xs text-slate-600">
       <input
         type="checkbox"
         checked={acceptTerms}
         onChange={(e) => setAcceptTerms(e.target.checked)}
         className="mt-0.5 h-4 w-4 rounded border-bike-border text-bike-orange focus:ring-bike-orange"
       />
       <span>
         {t('auth.acceptPrefix')}{' '}
         <button
           type="button"
           onClick={() => setPrivacyModalOpen(true)}
           className="font-bold text-bike-orange underline hover:text-orange-600"
         >
           {t('auth.privacyPolicyLink')}
         </button>{' '}
         {t('auth.acceptSuffix')}
       </span>
     </label>
     ```
   - En `handleSignUp`: Si `!acceptTerms`, mostrar error `setError(t('auth.errorAcceptTerms'))` y detener el registro.
2. **En `src/components/common/SubscriptionModal.tsx` (Checkout de Invitado):**
   - Replicar la misma validación de consentimiento si `isGuest` es verdadero antes de procesar el pago o la creación de cuenta.

---

### Paso 3: Flujo de Eliminación de Cuenta en `src/components/auth/EditProfileModal.tsx`
1. Al final del modal (debajo de los campos de perfil), agregar una sección visualmente diferenciada:
   - Separador o contenedor con borde rojo suave (`border-red-100 bg-red-50/50 rounded-2xl p-4`).
   - Título: *"Zona de Peligro"* o *"Gestión de Privacidad"*.
   - Botón: **"🗑️ Eliminar mi cuenta y mis datos"** con estilo de advertencia (`text-xs font-bold text-red-600 hover:text-red-700 underline`).
2. Al pulsar el botón, abrir un modal de confirmación secundario (`showDeleteConfirm = true`):
   - Icono de alerta roja (`⚠️`).
   - Título: **"¿Eliminar tu cuenta permanentemente?"**
   - Mensaje: *"Esta acción no se puede deshacer. Se eliminarán de inmediato tu perfil, todos tus vehículos registrados en el garaje, tu historial de convoy, tus alertas de seguridad y tu suscripción activa."*
   - Botón 1 (Cancelar): *"Conservar mi cuenta"*.
   - Botón 2 (Confirmar): *"Sí, eliminar mi cuenta definitivamente"* (`bg-red-600 text-white font-bold`).
   - Estado de carga mientras se ejecuta `deleteAccount`.

---

### Paso 4: Lógica de Supresión en `src/context/AppContext.tsx`
1. Agregar `privacyModalOpen` y `setPrivacyModalOpen` al contexto global para que cualquier pantalla pueda disparar el modal de privacidad.
2. Implementar `deleteAccount`:
   ```ts
   const deleteAccount = useCallback(async () => {
     if (!user) return
     if (isDemoUser) {
       logout()
       showToast(t('profile.accountDeletedDemo'))
       return
     }

     try {
       // 1. Eliminar perfil en Supabase (las FK con on delete cascade purgan vehículos, alertas, etc.)
       const { error } = await supabase.from('profiles').delete().eq('id', user.id)
       if (error) console.error('Error al purgar perfil en Supabase:', error)

       // 2. Cerrar sesión en Supabase Auth
       await supabase.auth.signOut().catch(() => {})
     } catch (err) {
       console.error('Error durante la eliminación de cuenta:', err)
     } finally {
       // 3. Purgar almacenamiento local
       logout()
       showToast(t('profile.accountDeletedSuccess'))
     }
   }, [user, isDemoUser, logout, showToast, t])
   ```

---

### Paso 5: Enlace en el Footer de la Landing Page (`src/components/landing/LandingView.tsx`)
En la sección inferior del footer donde aparecen los créditos de LC Tech, agregar el enlace:
- `🔒 Política de Privacidad & Datos (Ley 1581)` que al hacer clic invoque `setPrivacyModalOpen(true)`.

---

### Paso 6: Actualización de Diccionarios (`src/utils/i18n.ts`)
Agregar en `es` y `en` todas las traducciones requeridas para:
- `privacy.title`, `privacy.close`.
- `auth.acceptPrefix`: "Acepto la", `auth.privacyPolicyLink`: "Política de Privacidad y Tratamiento de Datos (Ley 1581)", `auth.acceptSuffix`: "de Bike Tracker.", `auth.errorAcceptTerms`: "Debes aceptar la Política de Tratamiento de Datos para continuar."
- `profile.deleteAccountBtn`: "Eliminar mi cuenta y mis datos", `profile.deleteConfirmTitle`: "¿Eliminar tu cuenta definitivamente?", `profile.deleteConfirmMessage`: "Esta acción es irreversible y purgará tu garaje, tus rutas y tu sesión.", `profile.cancelDelete`: "No, conservar cuenta", `profile.confirmDelete`: "Sí, eliminar definitivamente", `profile.accountDeletedSuccess`: "Tu cuenta y datos han sido eliminados con éxito."

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] El modal de Política de Privacidad se abre desde el footer de la landing, el registro de AuthModal y el checkout de invitados.
- [ ] No es posible registrar una cuenta nueva sin marcar la casilla de aceptación de la Política de Privacidad.
- [ ] En el perfil del usuario autenticado existe la opción clara para eliminar la cuenta con modal de doble confirmación.
- [ ] Al confirmar la eliminación, el registro del usuario en `public.profiles` se borra en Supabase, se purga el almacenamiento local y la app redirige a la Landing.
- [ ] Los usuarios en Modo Demo son protegidos sin romper la interfaz.
- [ ] `npm run build` o `cmd /c "npm run build"` compila al 100% sin ningún error de TypeScript.
