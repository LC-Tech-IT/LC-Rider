# 🚀 Prompt de Ejecución para Claude — Sprint 30: Protagonismo Visual de Bike Tracker, Biker Club (25 Pilotos), Conexión de Formulario a Email/WhatsApp y Privacidad de Contacto

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El Product Lead & Stakeholder ha especificado 5 ajustes clave para la experiencia de usuario, contacto y branding:

1. **Protagonismo del Logo de Bike Tracker en la Cabecera:**
   - El logo principal en la barra de navegación de la Landing Page debe ser el **Icono Oficial de Bike Tracker** (`/images/app-icon.jpg`), con mayor tamaño, relieve y protagonismo visual, acompañado del título de la app en grande y el crédito de fabricante: *"Bike Tracker — por LC Tech"*.
2. **Plan Biker Club: Declaración y Cupo Oficial de 25 Pilotos:**
   - La tarjeta de Biker Club en la Landing y en el Modal de Suscripción debe indicar explícitamente: **"👥 Hasta 25 pilotos en convoy simultáneo"**.
   - Asegurar que `TIER_CONVOY_LIMIT.club = 25` en `AppContext.tsx`.
3. **Reconocimiento y Expiración Automática de Planes:**
   - Al activar cualquier suscripción (`upgradeTier`), calcular y guardar la fecha de vencimiento (`subscriptionExpiresAt`): +30 días para mensual, +365 días para anual (o +395 días si es con bono QR).
   - Validar al iniciar la sesión que el plan siga vigente; si expira, degradar automáticamente a 'free'.
4. **Privacidad en Tarjeta de WhatsApp y Enlace de Correo Directo:**
   - En `LandingContact.tsx`, en la tarjeta de WhatsApp: **ocultar el número telefónico en el texto visible**, mostrando únicamente:  
     `WhatsApp Oficial` y subtítulo: *"Chatea con nuestro equipo de soporte y ventas en tiempo real."* (al hacer clic abre `https://wa.me/573505208592?...`).
   - La tarjeta de Correo Electrónico debe ser un enlace `<a href="mailto:leecastro.tech@gmail.com?subject=Consulta%20Bike%20Tracker">` interactivo que abra el gestor de correo predeterminado del usuario.
5. **Funcionamiento Real del Formulario de Contacto:**
   - Al diligenciar Nombre, Correo, Asunto y Mensaje y pulsar *"✉️ Enviar Mensaje"*:
     - Abrir automáticamente el cliente de correo (`mailto:leecastro.tech@gmail.com`) con el asunto y cuerpo estructurados con los datos del remitente.
     - Mostrar un Toast de confirmación y limpiar el formulario, con opción complementaria de enviar copia por WhatsApp.

---

## 2. [Objetivo Concreto y Alcance]

### A. Rediseño de Cabecera de Marca (`src/components/landing/LandingPage.tsx`):
- Reemplazar la disposición actual por una donde:
  - El icono de **Bike Tracker** (`/images/app-icon.jpg`) sea el protagonista (`h-11 w-11 rounded-2xl border-2 border-bike-orange shadow-glow-orange object-cover`).
  - Título principal: `Bike Tracker` (texto llamativo `text-lg font-black text-bike-ink font-display`).
  - Subtítulo: `por LC Tech · Tecnología inteligente que te respalda` (texto fino y elegante).

### B. Ajuste de Cupo Biker Club a 25 Pilotos:
- `src/components/landing/LandingPricing.tsx`:
  - Tarjeta Biker Club: listar `👥 Convoy de hasta 25 pilotos simultáneos`.
- `src/components/common/SubscriptionModal.tsx`:
  - Listar `👥 Hasta 25 pilotos en convoy`.
- `src/context/AppContext.tsx`:
  - Confirmar `TIER_CONVOY_LIMIT = { free: 3, pro: 999, club: 25 }`.

### C. Persistencia y Control Temporal de Suscripciones (`src/context/AppContext.tsx`):
- En `upgradeTier(tier: SubscriptionTier, billingCycle: 'monthly' | 'yearly', isQrBonus: boolean = false)`:
  - Calcular:
    ```typescript
    const days = tier === 'free' ? 0 : billingCycle === 'yearly' ? (isQrBonus ? 395 : 365) : 30
    const expiresAt = days > 0 ? Date.now() + days * 24 * 60 * 60 * 1000 : undefined
    ```
  - Asignar `subscriptionExpiresAt: expiresAt` al usuario y persistir en la cuenta (`saveAccount`).
- En la carga inicial de sesión, si `subscriptionExpiresAt && Date.now() > subscriptionExpiresAt`:
  - Restablecer automáticamente `tier = 'free'` y avisar con un Toast de vencimiento.

### D. Conexión Real y Privacidad en `src/components/landing/LandingContact.tsx`:
- Tarjeta WhatsApp:
  - Texto visible: `WhatsApp Oficial` (sin mostrar el número `+57 350 520 8592` en el texto).
  - Enlace `href`: `https://wa.me/573505208592?text=Hola%20Bike%20Tracker%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n`.
- Tarjeta Email:
  - Envolver en `<a href="mailto:leecastro.tech@gmail.com?subject=Consulta%20Bike%20Tracker" className="...">`.
- Formulario de Contacto:
  - Al enviar (`handleSubmit`):
    ```typescript
    const mailtoUrl = `mailto:leecastro.tech@gmail.com?subject=${encodeURIComponent(`[Bike Tracker - ${subject}] Consulta de ${name}`)}&body=${encodeURIComponent(`Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`)}`
    window.location.href = mailtoUrl
    showToast('Abriendo tu correo para enviar el mensaje a leecastro.tech@gmail.com...')
    ```

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingPage.tsx` (Cabecera con protagonismo del logo de Bike Tracker).
- `src/components/landing/LandingPricing.tsx` (Biker Club con 25 pilotos).
- `src/components/common/SubscriptionModal.tsx` (Biker Club con 25 pilotos).
- `src/components/landing/LandingContact.tsx` (Privacidad de WhatsApp, mailto en tarjeta y envío del formulario a correo).
- `src/context/AppContext.tsx` (Control de expiración automática de suscripciones y cupo de 25 pilotos en club).
- `src/utils/i18n.ts` (Traducciones y textos actualizados en ES/EN).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Rediseñar la Cabecera en `src/components/landing/LandingPage.tsx`
```tsx
<div className="flex items-center gap-3">
  <img
    src="/images/app-icon.jpg"
    alt="Bike Tracker"
    className="h-11 w-11 rounded-2xl border-2 border-bike-orange shadow-glow-orange object-cover"
  />
  <div className="leading-tight">
    <p className="font-display text-base font-black tracking-tight text-bike-ink">
      Bike Tracker
    </p>
    <p className="font-body text-xs font-semibold text-slate-500">
      por <span className="font-bold text-bike-orange">LC TECH</span> · Tecnología inteligente que te respalda.
    </p>
  </div>
</div>
```

---

### Tarea 2: Actualizar `src/components/landing/LandingContact.tsx`
1. Reemplazar la tarjeta de WhatsApp:
```tsx
<a
  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-4 rounded-3xl border border-bike-border bg-white p-5 shadow-soft transition hover:shadow-card hover:border-emerald-300"
>
  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
    💬
  </span>
  <div>
    <p className="font-display text-sm font-bold text-bike-ink">WhatsApp Oficial</p>
    <p className="text-xs text-slate-500">Chatea con nuestro equipo de soporte y ventas en tiempo real.</p>
  </div>
</a>
```
2. Convertir la tarjeta de Email en enlace interactivo:
```tsx
<a
  href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consulta Bike Tracker')}`}
  className="flex items-center gap-4 rounded-3xl border border-bike-border bg-white p-5 shadow-soft transition hover:shadow-card hover:border-sky-300"
>
  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-2xl">
    ✉️
  </span>
  <div>
    <p className="font-display text-sm font-bold text-bike-ink">Correo Electrónico</p>
    <p className="text-xs text-slate-500">{CONTACT_EMAIL}</p>
  </div>
</a>
```
3. Enviar el formulario vía `mailto:` con los datos exactos.

---

### Tarea 3: Actualizar `LandingPricing.tsx` y `SubscriptionModal.tsx`
- Establecer en las características del Plan Biker Club: `👥 Convoy de hasta 25 pilotos simultáneos`.

---

### Tarea 4: Asegurar Expiración Automática en `src/context/AppContext.tsx`
- En `upgradeTier`: calcular `subscriptionExpiresAt` y persistirlo.
- En la carga de sesión: si ha expirado, restablecer a `free`.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] En la cabecera de la Landing Page, el logo de Bike Tracker es grande y protagónico, acompañado de "por LC TECH".
- [ ] El Plan Biker Club muestra claramente el cupo de **hasta 25 pilotos**.
- [ ] La tarjeta de WhatsApp en Contacto muestra el texto limpio "WhatsApp Oficial" (sin revelar el número en texto plano) y abre el chat de WhatsApp correctamente al hacer clic.
- [ ] La tarjeta de correo y el formulario de contacto dirigen a `leecastro.tech@gmail.com`.
- [ ] La app calcula la fecha de vencimiento al comprar cualquier plan y degrada automáticamente si expira.
- [ ] `npm run build` compila al 100% sin errores de TypeScript ni linter.
