# PROMPT PARA CLAUDE — SPRINT 32: MODALIDAD MENSUAL BIKER CLUB Y RESPONSIVIDAD TOTAL DEL TOGGLE DE PRECIOS

```markdown
### 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
Actualmente, el switch global de facturación en la landing page ("Pago Mensual" / "Pago Anual") cambia dinámicamente el precio de Convoy Pro, pero el **Plan Biker Club** permanecía estático en $299.000 COP/año porque fue concebido inicialmente como anual. 
Para ofrecer una experiencia de usuario consistente, transparente y adaptable a las necesidades de clubes y organizadores de rodadas, se introduce la **modalidad de Pago Mensual para el Plan Biker Club** a **$34.900 COP / mes** (frente a los **$299.000 COP / año**, que representa un ahorro de ~28% con equivalencia a ~$24.916 COP/mes).

---

### 2. [Objetivo Concreto y Alcance]
Implementar el soporte integral de facturación mensual y anual para el plan `Biker Club` en todos los puntos de contacto del sistema:
1. **Landing Page (`LandingPricing.tsx`):** Al conmutar el switch a "Pago Mensual", la tarjeta de **Biker Club** debe cambiar reactivamente a `$34.900 COP / mes` con subtítulo explicativo de flexibilidad mensual, y al pasar a "Pago Anual" mostrar `$299.000 COP / año` con el desglose de ahorro. Al hacer clic en "🏆 Activar Biker Club", el checkout debe respetar el ciclo de facturación seleccionado.
2. **Servicio de Pagos (`paymentService.ts`):** `getPlanAmountCOP('club', billingCycle)` debe retornar `34900` para `'monthly'` y `299000` para `'yearly'`.
3. **Modal de Suscripción en App (`SubscriptionModal.tsx`):** Actualizar `PLAN_PRICE.club.monthly` a `$34.900 COP` y hacer que la tarjeta del plan Club en el modal muestre el precio y sufijo según el `billingCycle` seleccionado (`monthly` vs `yearly`). Corregir cualquier asignación hardcodeada del ciclo en `upgradeTier` y cálculo del precio del checkout/QR.
4. **Chatbot de Asistencia (`chatbotService.ts`):** Actualizar la respuesta del intent de precios para que mencione las dos opciones de Biker Club ($34.900/mes o $299.000/año).
5. **Internacionalización (`i18n.ts`):** Actualizar las llaves de tagline de Biker Club en español e inglés.

---

### 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingPricing.tsx` (Componente de precios en Landing)
- `src/services/paymentService.ts` (Cálculo de montos para pasarela Wompi / QR)
- `src/components/common/SubscriptionModal.tsx` (Modal de suscripción y checkout dentro de la app)
- `src/services/chatbotService.ts` (Base de conocimiento del Asistente Virtual Biker)
- `src/utils/i18n.ts` (Textos y descripciones de planes en ES y EN)

---

### 4. [Instrucciones Paso a Paso / Tareas de Implementación]

#### Tarea 1: Landing Page (`src/components/landing/LandingPricing.tsx`)
1. En la función `goToCheckout(tier: 'pro' | 'club')`:
   - Cambiar la llamada `openSubscriptionCheckout(tier, tier === 'club' ? 'yearly' : billingCycle)` por `openSubscriptionCheckout(tier, billingCycle)`. De esta forma, tanto Pro como Club respetan el estado actual del switch (`billingCycle`).
2. En la **Card 3: Biker Club**:
   - Reemplazar el precio fijo por el cálculo dinámico:
     ```tsx
     <div className="mt-3 flex items-baseline gap-1">
       <span className="font-display text-4xl font-black text-bike-ink">
         {billingCycle === 'yearly' ? '$299.000' : '$34.900'}
       </span>
       <span className="text-sm font-semibold text-slate-500">
         COP {billingCycle === 'yearly' ? '/ año' : '/ mes'}
       </span>
     </div>
     ```
   - Reemplazar el subtítulo por el mensaje contextual de ahorro / flexibilidad:
     ```tsx
     <p className="mt-2 text-xs font-bold text-amber-700">
       {billingCycle === 'yearly'
         ? '⚡ Equivale a ≈ $24.916 COP/mes (Ahorras 28%)'
         : 'Flexibilidad mes a mes para tu club o rodadas'}
     </p>
     ```

#### Tarea 2: Servicio de Pagos (`src/services/paymentService.ts`)
1. Actualizar la función `getPlanAmountCOP`:
   ```typescript
   export function getPlanAmountCOP(
     tier: Extract<SubscriptionTier, 'pro' | 'club'>,
     billingCycle: 'monthly' | 'yearly'
   ): number {
     if (tier === 'club') return billingCycle === 'yearly' ? 299000 : 34900
     return billingCycle === 'yearly' ? 99000 : 14900
   }
   ```

#### Tarea 3: Modal de Suscripción (`src/components/common/SubscriptionModal.tsx`)
1. En la constante `PLAN_PRICE`:
   ```typescript
   const PLAN_PRICE: Record<'pro' | 'club', { monthly: string; yearly: string }> = {
     pro: { monthly: '$14.900 COP', yearly: '$99.000 COP' },
     club: { monthly: '$34.900 COP', yearly: '$299.000 COP' },
   }
   ```
2. En la tarjeta de `club` (`PlanCard`):
   - Pasar `price={PLAN_PRICE.club[billingCycle]}`
   - Pasar `priceSuffix={billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth')}`
3. En el cálculo de `price`:
   ```typescript
   const price = PLAN_PRICE[checkoutTier][billingCycle]
   ```
4. En las llamadas a `upgradeTier(checkoutTier, ...)` (en checkout Wompi, simulado y QR):
   - Asegurar que pase `billingCycle` dinámico en lugar de forzar `'monthly'` o `'yearly'`.

#### Tarea 4: Chatbot Biker (`src/services/chatbotService.ts`)
1. Actualizar la respuesta del intent de precios (`PRODUCT_INTENTS`):
   - Modificar la mención de Biker Club para que exprese:
     `🏆 **Biker Club**: **$299.000 COP al año** (te sale como a $24.916 COP al mes — ¡ahorras 28%!), o si prefieres pago mes a mes para tu parche, **$34.900 COP mensuales** (hasta 25 pilotos simultáneos).`

#### Tarea 5: Textos i18n (`src/utils/i18n.ts`)
1. En español (`es`):
   `'subscription.clubTagline': '$299.000 COP/año (~$74.75 USD) — ¡Ahorras 28%! · o $34.900 COP/mes (~$8.75 USD)',`
2. En inglés (`en`):
   `'subscription.clubTagline': '$299,000 COP/yr (~$74.75 USD) — Save 28%! · or $34,900 COP/mo (~$8.75 USD)',`

---

### 5. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ En la landing page, cambiar el switch a **"Pago Mensual"** actualiza inmediatamente:
   - Convoy Pro a `$14.900 COP / mes`.
   - Biker Club a `$34.900 COP / mes` con subtítulo de flexibilidad mensual.
2. ✅ En la landing page, cambiar el switch a **"Pago Anual"** actualiza inmediatamente:
   - Convoy Pro a `$99.000 COP / año` (Ahorra 45%).
   - Biker Club a `$299.000 COP / año` (Ahorra 28%).
3. ✅ Al hacer clic en "🏆 Activar Biker Club" desde la landing con el switch en Mensual, se abre el checkout con el valor `$34.900 COP`. Con el switch en Anual, se abre con `$299.000 COP`.
4. ✅ En el modal interno de suscripción (`SubscriptionModal.tsx`), el selector Mensual/Anual actualiza correctamente los precios de ambos planes (Pro y Club).
5. ✅ `npm run build` (`tsc && vite build`) compila con 0 errores y 0 warnings de tipos.

---

### 6. [Restricciones Técnicas y Reglas de Calidad]
- No romper ninguna funcionalidad existente de canje de códigos de club ni flujos de login/registro.
- Mantener la armonía estética y alineación vertical de las tarjetas (`flex h-full flex-col justify-between`).
- Limpiar cualquier archivo temporal o de prueba antes de entregar.
```
