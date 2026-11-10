# 🚀 Prompt de Ejecución para Claude — Sprint 18: Landing Page Upgrade, Pasarela de Checkout de Suscripciones, Renovación en Perfil y Sección de Contacto

## 1. Rol y Contexto para Claude
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El stakeholder ha solicitado una serie de mejoras clave en la conversión, experiencia de usuario y ciclo de vida de la suscripción:
1. **Hero de la Landing Page:** Eliminar botones redundantes. Reemplazar "Probar Modo Conducción" por **"⚡ Ver Planes y Precios"** (con scroll suave a `#pricing`).
2. **Animaciones Sutiles en Imágenes:** Dar dinamismo y vida a las imágenes de la Landing con microinteracciones y efectos de flotación/zoom suave (`transition-transform hover:scale-[1.03]`).
3. **Flujo de Compra Real/Checkout en Planes:**
   - Plan Pro: Cambiar texto del botón a **"⚡ Obtener Convoy Pro"** (o *"🔥 Unirme a Convoy Pro"*). Al hacer clic, abre directamente el **Checkout de Pago** (simulador interactivo con **PSE, Nequi, Daviplata, Tarjeta de Crédito/Débito**).
   - Plan Biker Club: Al pulsar *"Activar Biker Club"*, abre el checkout para clubes ($39.900 COP/mes) y asignación de código.
4. **Header de la Landing:** Cambiar "Abrir Aplicación" por **"🔑 Iniciar Sesión"** (o *"🚀 Entrar / Iniciar Sesión"*), abriendo directamente el flujo de login para que el usuario acceda a su cuenta donde ve sus datos, su plan activo, vehículos y rutas.
5. **Asistente Biker IA:** Mensaje de bienvenida inicial enriquecido que invita sutilmente a conocer el Plan Pro, con respuestas autosuficientes para guiar la compra, medios de pago y renovación.
6. **Renovación de Suscripción en el Perfil:** Sección clara en el Perfil (`EditProfileModal.tsx`), Sidebar y `SubscriptionModal.tsx` con fecha de vencimiento y botón **"🔄 Renovar Suscripción"**.
7. **Nueva Sección de Contacto en Landing (`LandingContact.tsx`):** Enlace en el navbar (`Contacto`) y sección con formulario de contacto, botón de WhatsApp y soporte para clubes.

---

## 2. Objetivo Concreto y Alcance
- **Landing Page Renovada:** Navbar con enlace `Contacto`, botón `🔑 Iniciar Sesión`, Hero con botón `⚡ Ver Planes`, imágenes dinámicas.
- **Módulo de Checkout / Pasarela Integrado (`SubscriptionCheckoutModal` o dentro de `SubscriptionModal.tsx`):**
  - Selección de método de pago: 📱 **Nequi / Daviplata**, 🏦 **PSE (Bancos de Colombia)**, 💳 **Tarjeta de Crédito / Débito**.
  - Proceso de confirmación y activación inmediata del plan (`pro` o `club`) persistido en `storage.ts`.
- **Gestión y Renovación de Suscripción en Perfil:**
  - Visualización del plan activo, fecha de vigencia/renovación (ej. *"Vigente hasta el 24 de Octubre de 2026"*).
  - Botón *"🔄 Renovar / Mejorar Plan"* que abre la pasarela de pago.
- **Sección de Contacto (`LandingContact.tsx`):**
  - Formulario de contacto responsive (Nombre, Correo, Mensaje, Asunto para Clubes/Soporte).
  - Acceso directo a WhatsApp oficial de soporte.

---

## 3. Archivos y Recursos Afectados
- `src/components/landing/LandingPage.tsx` (Navbar con Contacto, botón Iniciar Sesión, Hero con botón Ver Planes, sección Contacto)
- `src/components/landing/LandingPricing.tsx` (Botón "⚡ Obtener Convoy Pro", triggers de checkout para Pro y Club)
- `src/components/landing/LandingContact.tsx` (Nuevo componente de contacto y soporte de clubes)
- `src/components/landing/LandingChatbot.tsx` & `src/services/chatbotService.ts` (Mensaje cautivador y sugerencias de compra)
- `src/components/common/SubscriptionModal.tsx` (Integración de pasarela de pago interactiva: PSE, Nequi, Tarjetas, confirmación y renovación)
- `src/components/auth/EditProfileModal.tsx` (Sección de estado de suscripción y botón Renovar)
- `src/components/common/Sidebar.tsx` (Acceso rápido a renovación de plan)
- `src/utils/i18n.ts` (Traducciones para checkout, contacto, métodos de pago y renovación en ES/EN)

---

## 4. Instrucciones Paso a Paso / Tareas de Implementación

### Tarea 1: Actualizar Header y Hero de `src/components/landing/LandingPage.tsx`
1. **Navbar:**
   - Añadir botón `"Contacto"` llamando a `scrollToId('contact')`.
   - Reemplazar el botón `"Abrir Aplicación"` por:
     ```tsx
     <button
       onClick={() => {
         setTopLevelMode('app')
         if (!user?.isLoggedIn) setAuthModalOpen(true)
       }}
       className="rounded-xl bg-bike-orange px-4 py-2.5 text-xs font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-95 sm:px-5 sm:text-sm"
     >
       {user?.isLoggedIn ? '🚀 Mi Tablero' : '🔑 Iniciar Sesión'}
     </button>
     ```
2. **Hero:**
   - Botón 1: `"🔥 Iniciar Rodada Gratis"` -> `onClick={() => setTopLevelMode('app')}`.
   - Botón 2: Reemplazar `"🏍️ Probar Modo Conducción"` por:
     ```tsx
     <button
       onClick={() => scrollToId('pricing')}
       className="w-full rounded-full border border-bike-border bg-white px-6 py-3.5 text-sm font-bold text-bike-ink shadow-card transition hover:bg-slate-50 active:scale-95 sm:w-auto"
     >
       ⚡ Ver Planes y Precios
     </button>
     ```
3. **Efectos Dinámicos en Imágenes:**
   - En la imagen principal del Hero y en `LandingStory.tsx` / `LandingShowcase.tsx`, aplicar clases de animación hover y transiciones fluidas:
     `className="h-56 w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.03] sm:h-72"` con contenedor con `overflow-hidden`.
4. **Incluir `<LandingContact />`:**
   - Renderizar la nueva sección de Contacto antes del footer.

### Tarea 2: Crear `src/components/landing/LandingContact.tsx`
Crear sección de contacto moderna con:
- `id="contact"`
- Título: *"¿Tienes Preguntas o Representas a un Club Motero?"*
- Subtítulo: *"Estamos aquí para apoyarte en cada kilómetro. Escríbenos o conéctate con nuestro equipo."*
- Formulario de contacto con campos: Nombre, Correo electrónico, Asunto (Soporte técnico, Registro de Club, Información de Planes), Mensaje, y botón *"✉️ Enviar Mensaje"* con feedback de confirmación (toast).
- Tarjetas de contacto directo:
  - 💬 **WhatsApp Oficial:** Enlace directo a chat de WhatsApp.
  - 📧 **Correo Electrónico:** `soporte@biketracker.app` / `lctech@biketracker.app`.
  - 📍 **Sede:** Bogotá D.C., Colombia.

### Tarea 3: Actualizar `src/components/landing/LandingPricing.tsx`
1. En la tarjeta de **Convoy Pro**:
   - Cambiar el botón de `"Probar Convoy Pro"` por:
     ```tsx
     <button
       onClick={() => {
         setTopLevelMode('app')
         setSubscriptionModalOpen(true)
       }}
       className="mt-8 w-full rounded-xl bg-bike-orange py-3 text-sm font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
     >
       ⚡ Obtener Convoy Pro
     </button>
     ```
2. En la tarjeta de **Biker Club**:
   - Botón `"🏆 Activar Biker Club"` -> llama a `setTopLevelMode('app')` y abre `setSubscriptionModalOpen(true)` con foco en club.

### Tarea 4: Enriquecer `src/components/common/SubscriptionModal.tsx` con Pasarela de Pago
1. Agregar flujo interactivo de **Pasarela de Pago (Checkout)** al pulsar *"Obtener Plan"* o *"Renovar Suscripción"*:
   - Paso 1: Selección de Plan (Libre / Pro Mensual o Anual / Biker Club).
   - Paso 2: Selección de Método de Pago:
     - 📱 **Nequi / Daviplata:** Campo para número de celular.
     - 🏦 **PSE:** Selector de Banco (Bancolombia, Davivienda, BBVA, Nequi, etc.) y Tipo de Persona (Natural / Jurídica).
     - 💳 **Tarjeta de Crédito / Débito:** Campos para Número de tarjeta, Fecha de expiración (MM/AA) y CVC.
   - Paso 3: Botón *"🔒 Pagar $X.XXX COP y Activar Plan"* -> Simula procesamiento seguro de 1 segundo con spinner y actualiza el tier del usuario a `pro` o `club` con fecha de vencimiento a 30 o 365 días en `storage.ts`.
2. Sección de **Canje de Código de Club** conservada y resaltada.

### Tarea 5: Agregar Renovación de Suscripción en `src/components/auth/EditProfileModal.tsx`
1. Dentro de la pantalla de perfil del usuario, añadir una tarjeta destacada de **"Mi Suscripción"**:
   - Badge del plan (`🆓 Plan Piloto Libre`, `⚡ Convoy Pro Activo`, `🏆 Biker Club Activo`).
   - Estado y Fecha de vigencia: *"Vigente hasta el {{fecha}}"* (o *"Plan Gratuito Permanente"*).
   - Botón *"🔄 Renovar Suscripción / Cambiar Plan"* que abre `SubscriptionModal`.

### Tarea 6: Actualizar `src/services/chatbotService.ts` y `LandingChatbot.tsx`
1. Actualizar el mensaje de bienvenida inicial:
   ```typescript
   '¡Hola! Soy el Asistente Biker de LC Tech 🏍️. Puedo ayudarte a elegir tu plan, armar tu convoy, renovar tu suscripción o resolver cualquier duda técnica de la app.'
   ```
2. Añadir sugerencias rápidas:
   - `['¿Cómo me suscribo a Convoy Pro?', '¿Qué incluye Biker Club?', '¿Cómo renovar mi plan?', 'Métodos de pago']`
3. Respuestas detalladas sobre métodos de pago colombianos (PSE, Nequi, Tarjetas) y cómo renovar en el perfil.

### Tarea 7: Traducciones en `src/utils/i18n.ts`
- Agregar todas las claves de traducción para contacto, checkout de pagos, bancos, tarjetas, y renovación en ES y EN.

---

## 5. Criterios de Aceptación / Definition of Done (DoD)
- [ ] El Hero de la Landing Page tiene *"🔥 Iniciar Rodada Gratis"* y *"⚡ Ver Planes y Precios"* (con scroll a planes).
- [ ] Las imágenes de la Landing tienen efecto de hover con zoom suave dinámico.
- [ ] En el navbar de la Landing existe el enlace *"Contacto"* y el botón *"🔑 Iniciar Sesión"*.
- [ ] La sección de Contacto (`LandingContact.tsx`) está presente y funcional con formulario y enlaces a WhatsApp y correo.
- [ ] En los planes de la Landing, el botón Pro dice *"⚡ Obtener Convoy Pro"* y abre el flujo de suscripción/pago.
- [ ] El modal de suscripción incluye pasarela de pago interactiva (PSE, Nequi, Tarjetas) y activa el plan con persistencia.
- [ ] En el perfil del usuario se ve el estado de la suscripción con el botón *"🔄 Renovar Suscripción"*.
- [ ] El Asistente Biker IA contiene sugerencias de suscripción y respuestas de compra/renovación.
- [ ] `npm run build` compila al 100% sin errores de tipos TypeScript.

---

## 6. Restricciones Técnicas y Reglas de Calidad
- **Zero-Discovery Waste:** Código limpio, sin dependencias externas pesadas.
- **Aesthetic Excellence:** Diseño pulido con Tailwind CSS, feedback visual instantáneo y microinteracciones fluidas.
