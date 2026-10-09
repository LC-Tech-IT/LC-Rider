# 🚀 Prompt de Ejecución para Claude — Sprint 19: Checkout para Nuevos Usuarios, Lógica Viral de Convoy (Host-Unlocks-Room), Traducción de Errores de Auth y Animaciones al Hacer Scroll

## 1. Rol y Contexto para Claude
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El stakeholder ha aprobado la estrategia viral de producto y ha solicitado corregir y optimizar los siguientes cuatro frentes esenciales:
1. **Flujo de Compra para Nuevos Usuarios (Guest Checkout):** Al pulsar *"⚡ Obtener Convoy Pro"* o *"🏆 Activar Biker Club"* en la Landing sin sesión iniciada, debe abrirse directamente la pasarela de pago (Checkout). En el mismo paso se solicitan los datos del piloto (Nombre, Correo, Contraseña) y medio de pago (Nequi, PSE, Tarjeta) para registrarlo y activar su plan de inmediato.
2. **Estrategia Viral de Convoy (Host Unlocks the Room):**
   - La capacidad máxima de la sala de convoy la define el **Líder/Creador de la sala**:
     - Si el líder es **Convoy Pro**: La sala admite **pilotos ilimitados**.
     - Si el líder es **Biker Club**: La sala admite **hasta 25 pilotos**.
     - Si el líder es **Plan Libre (Free)**: La sala admite **máximo 3 pilotos** (el 4º es bloqueado con aviso de upgrade).
   - Los invitados con cuenta gratuita pueden unirse sin costo a salas Pro o Club, pero sus beneficios individuales se mantienen según su plan (1 moto en garaje, sin alertas de voz en Bluetooth personal, sin exportación de GPX).
3. **Traducción Integral de Errores de Auth:** Errores de backend en inglés como *"Email logins are disabled"* o *"Invalid login credentials"* deben traducirse al 100% al idioma activo (ES/EN) con mensajes amigables.
4. **Animaciones al Hacer Scroll en Landing Page:** Las imágenes del Hero, historia y showcase deben activarse dinámicamente al entrar en pantalla mediante un hook con `IntersectionObserver` (`useScrollReveal`).

---

## 2. Objetivo Concreto y Alcance
- **Checkout para Invitados (`SubscriptionModal.tsx`):**
  - Renderizado global en `App.tsx` para que pueda abrirse desde la Landing o Welcome screen sin requerir sesión previa.
  - Formulario unificado de datos de piloto + método de pago (Nequi 📱, PSE 🏦, Tarjeta 💳).
  - Al completar el pago, crea la cuenta local, activa el plan (`pro` o `club`) con su vigencia (30 o 365 días), inicia sesión y navega al Tablero.
- **Lógica Viral de Convoy en `AppContext.tsx`:**
  - El cupo de la sala se determina por el tier del líder (`convoyRoom.maxMembers`).
  - Los participantes Free que entran a una sala Pro/Club disfrutan de la navegación en convoy grupal, mientras sus límites personales (1 vehículo, sin voz Bluetooth, sin GPX) se preservan.
- **Traductor de Errores (`src/utils/authErrorTranslator.ts`):**
  - Mapeo completo de errores de Supabase Auth a español claro y comprensible.
- **Animaciones de Scroll (`src/hooks/useScrollReveal.ts`):**
  - Animación suave de revelado (`fade-in`, `translate-y-0`, `scale-100`) al desplazarse por la Landing Page.

---

## 3. Archivos y Recursos Afectados
- `src/App.tsx` (Renderizado global de `SubscriptionModal` y `AuthModal`)
- `src/components/common/SubscriptionModal.tsx` (Sección de datos de piloto para invitados en checkout + activación en 1 paso)
- `src/context/AppContext.tsx` (Lógica viral de salas de convoy por tier del líder + integración de traductor de errores en auth)
- `src/utils/authErrorTranslator.ts` (Nuevo helper de traducción de errores de Supabase Auth)
- `src/components/auth/AuthModal.tsx` (Presentación de errores traducidos)
- `src/hooks/useScrollReveal.ts` (Nuevo hook de revelado al hacer scroll con `IntersectionObserver`)
- `src/components/landing/LandingPage.tsx` (Aplicación de scroll reveal en Hero)
- `src/components/landing/LandingStory.tsx` (Aplicación de scroll reveal en imágenes)
- `src/components/landing/LandingShowcase.tsx` (Aplicación de scroll reveal en mockups)
- `src/utils/i18n.ts` (Traducciones para checkout de invitados y errores de autenticación)

---

## 4. Instrucciones Paso a Paso / Tareas de Implementación

### Tarea 1: Renderizado Global de `SubscriptionModal` en `src/App.tsx`
Mover `<SubscriptionModal />` fuera de la condición de sesión para que pueda abrirse en cualquier momento:
```tsx
export default function App() {
  const { view, user, vehicles, topLevelMode } = useApp()

  if (topLevelMode === 'landing') {
    return (
      <>
        <LandingPage />
        <SubscriptionModal />
      </>
    )
  }

  return (
    <>
      {!user || !user.isLoggedIn ? (
        <AppShell>
          <WelcomeAuthScreen />
          <AuthModal />
        </AppShell>
      ) : vehicles.length === 0 ? (
        <AppShell>
          <OnboardingGarageModal />
        </AppShell>
      ) : (
        <AppShell>
          <Header />
          <main className="relative flex-1 overflow-hidden">
            {view === 'cockpit' && <CockpitView />}
            {view === 'map' && <ConvoyMap />}
            {view === 'garage' && <GarageView />}
            {view === 'convoy' && <ConvoyLobby />}
          </main>
          <BottomNav />
          <Sidebar />
          <RoutePlannerModal />
          <SosModal />
          <AddVehicleModal />
          <EditProfileModal />
          <NotificationModal />
        </AppShell>
      )}
      <SubscriptionModal />
      <Toast />
    </>
  )
}
```

### Tarea 2: Checkout Unificado para Invitados en `src/components/common/SubscriptionModal.tsx`
1. Si el usuario no tiene sesión iniciada (`!user?.isLoggedIn`) y se encuentra en el paso de Checkout:
   - Mostrar formulario superior: *"Datos para tu Cuenta de Piloto"*
     - Nombre completo (`guestName`)
     - Correo electrónico (`guestEmail`)
     - Contraseña (`guestPassword`)
2. Al pulsar *"🔒 Pagar y Activar Plan"*:
   - Simular procesamiento de pago seguro (1 segundo de spinner).
   - Crear el perfil del usuario con su nombre, correo y el `tier` seleccionado (`pro` o `club`), calculando la fecha de vigencia a 30 días (mensual) o 365 días (anual).
   - Iniciar sesión localmente y persistir en `storage.ts`.
   - Cambiar a `topLevelMode = 'app'`.
   - Mostrar notificación Toast: *"¡Bienvenido a Bike Tracker! Tu suscripción está activa."*
   - Cerrar el modal y llevar al usuario a su Tablero/Garaje con su plan activo.

### Tarea 3: Lógica Viral de Convoy en `src/context/AppContext.tsx`
1. **Creación de Sala (`createConvoyRoom`):**
   - El líder establece el `maxMembers` de la sala según su propio tier:
     - `free`: 3 miembros.
     - `club`: 25 miembros.
     - `pro`: 999 miembros (ilimitado).
2. **Unión de Miembros (`joinConvoyRoom`):**
   - Si la sala es creada por un líder Pro o Club, cualquier piloto (incluso con cuenta Free) puede unirse sin ser rechazado mientras la sala no supere `room.maxMembers`.
   - Si la sala es creada por un líder Free y ya tiene 3 miembros, se bloquea el ingreso del 4º piloto con el mensaje:
     *"Esta sala ha alcanzado el límite de 3 pilotos del Plan Libre. El líder puede pasar a Convoy Pro para admitir pilotos ilimitados."*
3. **Gating Personal de Funciones:**
   - La voz en el intercomunicador Bluetooth (`announceTurnInstruction`, `announceIntercom`) y la exportación GPX solo se ejecutan si el usuario actual tiene tier `pro` o `club`.

### Tarea 4: Crear `src/utils/authErrorTranslator.ts` e Integrar en `AppContext.tsx`
1. Crear el helper:
   ```typescript
   export function translateAuthError(errorMessage: string, lang: 'es' | 'en' = 'es'): string {
     const msg = errorMessage.toLowerCase()

     if (lang === 'es') {
       if (msg.includes('email logins are disabled') || msg.includes('email provider is disabled')) {
         return 'El inicio de sesión con correo está temporalmente deshabilitado en el servidor. Puedes ingresar con "Continuar con Google" o Modo Demo.'
       }
       if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
         return 'Correo o contraseña incorrectos. Verifica tus datos o crea una cuenta.'
       }
       if (msg.includes('user already registered') || msg.includes('already exists')) {
         return 'Este correo ya está registrado. Por favor inicia sesión con tu contraseña.'
       }
       if (msg.includes('password should be at least')) {
         return 'La contraseña debe tener al menos 6 caracteres.'
       }
       if (msg.includes('email not confirmed')) {
         return 'Por favor confirma tu correo electrónico antes de iniciar sesión.'
       }
       if (msg.includes('network') || msg.includes('failed to fetch')) {
         return 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.'
       }
       return 'Ocurrió un error al procesar la solicitud. Por favor intenta de nuevo.'
     }

     return errorMessage
   }
   ```
2. En `AppContext.tsx`, envolver los errores capturados en `supabaseSignIn`, `supabaseSignUp` y `signInWithGoogle` con `translateAuthError(error.message, lang)`.

### Tarea 5: Hook `src/hooks/useScrollReveal.ts` y Animaciones en Landing
1. Crear el hook reutilizable:
   ```typescript
   import { useEffect, useRef, useState } from 'react'

   export function useScrollReveal(threshold = 0.15) {
     const ref = useRef<HTMLDivElement | null>(null)
     const [isVisible, setIsVisible] = useState(false)

     useEffect(() => {
       const element = ref.current
       if (!element) return

       const observer = new IntersectionObserver(
         ([entry]) => {
           if (entry.isIntersecting) {
             setIsVisible(true)
             observer.unobserve(element)
           }
         },
         { threshold },
       )

       observer.observe(element)
       return () => observer.disconnect()
     }, [threshold])

     return { ref, isVisible }
   }
   ```
2. Aplicar en `LandingPage.tsx`, `LandingStory.tsx` y `LandingShowcase.tsx`:
   - Al entrar al viewport con el scroll, las imágenes aplican la transición suave:
     `className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}`

### Tarea 6: Traducciones en `src/utils/i18n.ts`
- Agregar claves correspondientes para los campos del checkout de invitados y errores traducidos en español e inglés.

---

## 5. Criterios de Aceptación / Definition of Done (DoD)
- [ ] Al estar en la Landing sin sesión iniciada y hacer clic en *"⚡ Obtener Convoy Pro"* o *"🏆 Activar Biker Club"*, se abre directamente la pasarela de Checkout.
- [ ] Un usuario nuevo puede ingresar sus datos en el checkout, pagar y quedar registrado con su plan Pro activo en el Tablero.
- [ ] Una sala creada por un líder Pro admite pilotos ilimitados (incluso si los invitados tienen cuenta Free).
- [ ] Una sala creada por un líder Free bloquea el ingreso a partir del 4º piloto.
- [ ] Los errores de autenticación de Supabase (como "Email logins are disabled" o credenciales inválidas) se muestran en español claro.
- [ ] Al hacer scroll en la Landing Page, las imágenes se revelan con animación suave de entrada.
- [ ] `npm run build` compila al 100% sin errores TypeScript.

---

## 6. Restricciones Técnicas y Reglas de Calidad
- **Zero-Discovery Waste:** Código limpio y modular, respetando el sistema de persistencia en `storage.ts`.
- **Rendimiento:** Desconectar los observers de scroll tras la primera activación.
