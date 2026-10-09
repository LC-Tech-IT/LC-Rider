# 🚀 Prompt de Ejecución para Claude — Sprint 29: Actualización Oficial de Precios, Integración de Pago por QR Bancolombia/Nequi, Canales de Atención (WhatsApp + Email) y Chatbot Ultra-Natural

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El Product Lead & Stakeholder ha definido la **estructura financiera y comercial definitiva para el lanzamiento oficial a producción**:

1. **Nueva Matriz de Precios de Alta Rentabilidad:**
   - **Plan Piloto Pro Anual (Estrella / Más Popular):** **$99.000 COP / año** (Equivalente a ~$8.250 COP/mes).
   - **Plan Piloto Pro Mensual:** **$14.900 COP / mes**.
   - **Plan Parche / Club (B2B Clubes):** **$299.000 COP / año** (Hasta 6 motos en convoy).
2. **Incentivo de Pago por QR Bancolombia / Nequi (1% de comisión):**
   - Integrar el código QR oficial guardado en `/images/qr-bancolombia.png`.
   - En la Landing y en el Modal de Suscripción (`SubscriptionModal.tsx`), ofrecer la pestaña destacada:  
     `"⚡ Paga con QR Bancolombia / Nequi (Ahorra comisiones + 1 Mes Adicional Gratis de Regalo)"`.
   - Al seleccionar esta opción, mostrar el código QR con botón de descarga/ampliación y botón directo para enviar comprobante vía WhatsApp.
3. **Canales Oficiales de Soporte y Contacto:**
   - **Correo de Atención:** `leecastro.tech@gmail.com`.
   - **WhatsApp de Atención y Ventas:** `+57 350 520 8592` (Link: `https://wa.me/573505208592?text=Hola%20Bike%20Tracker%2C%20quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20app%20y%20los%20planes%20Pro`).
4. **Chatbot Asistente con Tono Motero Ultra-Natural y Empático (`chatbotService.ts`):**
   - Afinar el Asistente AI para que hable con tono auténtico de motero colombiano ("Parcero / Piloto / Hermano de ruta"), conozca al detalle los precios nuevos ($99.000/año, $14.900/mes, $299.000/año), el beneficio de pagar por QR y enlace directamente al WhatsApp `3505208592`.

---

## 2. [Objetivo Concreto y Alcance]

### A. Actualización de Precios en Toda la App:
- `src/components/landing/LandingPricing.tsx`:
  - **Plan Piloto Libre:** $0 COP / siempre (hasta 3 motos en convoy, 1 moto en garaje).
  - **Plan Convoy Pro Anual (Destacado):** $99.000 COP / año (Ahorras 45% · ~$8.250/mes).
  - **Plan Convoy Pro Mensual:** $14.900 COP / mes.
  - **Plan Biker Club:** $299.000 COP / año (Hasta 6 motos en convoy, administración grupal).
- `src/components/common/SubscriptionModal.tsx`:
  - Actualizar `PLAN_PRICE`:
    - `pro: { monthly: '$14.900 COP', yearly: '$99.000 COP' }`
    - `club: { monthly: '$299.000 COP', yearly: '$299.000 COP' }`
- `src/services/paymentService.ts`:
  - Montos en centavos de Wompi:
    - Pro Anual: `9900000` ($99.000 COP).
    - Pro Mensual: `1490000` ($14.900 COP).
    - Club Anual: `29900000` ($299.000 COP).

### B. Módulo de Pago por Código QR (`SubscriptionModal.tsx` y `LandingPricing.tsx`):
- Agregar método de pago `qr` en `SubscriptionModal.tsx`.
- Cuando `paymentMethod === 'qr'`:
  - Mostrar la imagen `/images/qr-bancolombia.png` con marco estilizado.
  - Instrucciones claras:
    1. Abre tu App Bancolombia o Nequi y escanea el código.
    2. Transfiere el valor exacto ($99.000 / $14.900 / $299.000 COP).
    3. Haz clic en el botón *"📲 Enviar Comprobante por WhatsApp"* que abre el chat con el número `3505208592` con mensaje pre-armado con la referencia del usuario.

### C. Actualización de Canales de Contacto:
- `src/components/landing/LandingContact.tsx`:
  - Email: `leecastro.tech@gmail.com`.
  - Teléfono / WhatsApp: `+57 350 520 8592`.
  - Botón directo de WhatsApp con icono y texto claro.
- Footer de `LandingPage.tsx` y enlaces legales: reflejar `leecastro.tech@gmail.com`.

### D. Afinación del Chatbot (`src/services/chatbotService.ts`):
- Prompt de sistema ajustado con vocabulario motero cercano, cálido y profesional.
- Respuestas precisas sobre:
  - ¿Cómo funciona el convoy en tiempo real?
  - ¿Cuáles son los precios ($99.000/año, $14.900/mes, $299.000/año)?
  - Beneficio exclusivo por pagar con QR Bancolombia/Nequi (+1 mes gratis).
  - Botón o enlace directo de escalación a WhatsApp `3505208592`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingPricing.tsx` (Nuevos precios y mención del beneficio QR).
- `src/components/common/SubscriptionModal.tsx` (Nuevos precios, método de pago QR con imagen `/images/qr-bancolombia.png` y botón de WhatsApp).
- `src/services/paymentService.ts` (Nuevos valores en centavos para Wompi).
- `src/components/landing/LandingContact.tsx` (Email `leecastro.tech@gmail.com` y WhatsApp `3505208592`).
- `src/services/chatbotService.ts` (Ajuste del Asistente AI con tono motero natural y nuevos datos comerciales).
- `src/utils/i18n.ts` (Traducciones y textos actualizados en ES/EN).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Actualizar Valores de Planes en `src/components/common/SubscriptionModal.tsx`
1. Actualizar `PLAN_PRICE`:
```typescript
const PLAN_PRICE: Record<'pro' | 'club', { monthly: string; yearly: string }> = {
  pro: { monthly: '$14.900 COP', yearly: '$99.000 COP' },
  club: { monthly: '$299.000 COP', yearly: '$299.000 COP' },
}
```
2. Agregar `'qr'` a `PaymentMethod`: `type PaymentMethod = 'qr' | 'nequi' | 'pse' | 'card'`.
3. Al seleccionar `'qr'`, renderizar:
   - Imagen centrada: `<img src="/images/qr-bancolombia.png" alt="QR Bancolombia Nequi" className="h-48 w-48 rounded-2xl border-2 border-bike-orange shadow-md mx-auto" />`.
   - Badge: `🎁 ¡Obtén 1 Mes Adicional Gratis reportando tu pago por QR!`.
   - Botón: `<a href="https://wa.me/573505208592?text=Hola%20Bike%20Tracker%2C%20acabo%20de%20pagar%20mi%20Plan%20por%20QR%20Bancolombia" target="_blank" className="...">📲 Reportar Pago por WhatsApp</a>`.

---

### Tarea 2: Actualizar `src/services/paymentService.ts`
1. Actualizar `amountInCents`:
```typescript
const amountInCents =
  tier === 'club'
    ? 29900000 // $299.000 COP
    : billingCycle === 'yearly'
      ? 9900000  // $99.000 COP
      : 1490000  // $14.900 COP
```

---

### Tarea 3: Actualizar `src/components/landing/LandingPricing.tsx`
1. Reemplazar tarjetas con los nuevos valores:
   - **Piloto Libre:** $0 COP.
   - **Convoy Pro:** $99.000 COP / año (Destacado con $8.250/mes) o $14.900 COP / mes.
   - **Biker Club:** $299.000 COP / año (Pack 6 pilotos).
2. Añadir banner promocional inferior:  
   `"💡 ¿Prefieres pagar por QR Bancolombia o Nequi? Recibe 1 mes adicional gratis reportando tu comprobante a nuestro WhatsApp (+57 350 520 8592)."`

---

### Tarea 4: Actualizar `src/components/landing/LandingContact.tsx`
1. Email: `leecastro.tech@gmail.com`.
2. WhatsApp: `+57 350 520 8592` (con enlace `https://wa.me/573505208592`).

---

### Tarea 5: Afinar `src/services/chatbotService.ts`
1. Actualizar las respuestas de precios y soporte en el knowledge base del chatbot:
   - Conocer el Plan Pro a $99.000/año y $14.900/mes.
   - Conocer el Plan Club a $299.000/año.
   - Promover el pago por QR Bancolombia/Nequi con el mes gratis.
   - Recomendar contactar al WhatsApp `3505208592` para soporte directo y confirmación de pagos.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] La Landing Page muestra con exactitud los precios oficiales: $99.000/año y $14.900/mes para Pro, y $299.000/año para Club.
- [ ] El modal de suscripción incluye la opción destacada de pago por QR con la imagen oficial y el botón directo a WhatsApp.
- [ ] La pasarela Wompi genera las transacciones con los montos exactos actualizados en centavos.
- [ ] El correo `leecastro.tech@gmail.com` y el WhatsApp `3505208592` están sincronizados en toda la web y chatbot.
- [ ] `npm run build` compila al 100% sin errores de TypeScript ni linter.
