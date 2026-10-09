# 🚀 Prompt de Ejecución para Claude — Sprint 31: Rediseño de Uniformidad Visual de Precios (Toggle Mensual/Anual + Grid Simétrico de 3 Columnas)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El Stakeholder y Product Lead ha detectado un problema crítico de diseño y armonía visual en la sección de precios de la Landing Page (`LandingPricing.tsx`):
> *"La sección de precios se ve desproporcionada en tamaño, asimétrica y poco profesional. Las tarjetas tienen diferentes alturas, los botones no están alineados y 4 columnas apretadas generan desorden visual."*

Debemos transformar esta sección adoptando el **estándar de oro de UI/UX para SaaS moderno**:
- Un **Selector / Switch de Facturación elegante en la cabecera**: `[ Facturación Mensual ]  [ Facturación Anual (Ahorra 45% + 1 Mes Gratis QR) 🔥 ]`.
- Un **Grid de 3 columnas perfectamente simétricas, proporcionadas y con la misma altura (`h-full flex flex-col justify-between`)**:
  1. **Plan Piloto Libre ($0 / siempre)**
  2. **Plan Convoy Pro ($14.900 COP/mes o $99.000 COP/año)** (Tarjeta Estrella destacada con borde glow)
  3. **Plan Biker Club ($299.000 COP/año)** (Tarjeta Corporativa para Clubes con cupo de 25 pilotos)
- **Alineación Vertical Perfecta:** Todos los botones de llamada a la acción (CTA) deben quedar exactamente en la misma línea base horizontal en todas las tarjetas (`mt-auto`).

---

## 2. [Objetivo Concreto y Alcance]

### A. Selector de Ciclo de Facturación (Billing Switch):
- Ubicado entre el subtítulo y las tarjetas de precios.
- Diseño en píldora con fondo sutil (`bg-slate-100 p-1.5 rounded-full border border-bike-border inline-flex items-center gap-2`):
  - Botón **"Pago Mensual"**.
  - Botón **"Pago Anual"** acompañado de un pill badge llamativo: `⚡ Ahorra 45% + 1 Mes Gratis QR`.
- Estado reactivo `billingCycle: 'monthly' | 'yearly'` (por defecto `'yearly'`).

### B. Grid Simétrico de 3 Tarjetas (`grid gap-8 lg:grid-cols-3 items-stretch`):
- **Tarjeta 1: Piloto Libre ($0)**
  - Título, precio `$0`, lista de 4 beneficios clave, botón `"Empezar Gratis"`.
- **Tarjeta 2: Convoy Pro (Destacada / Más Popular)**
  - Badge superior flotante: `MÁS POPULAR`.
  - Precio dinámico:
    - Si es Anual: `$99.000 COP / año` (con subtítulo `≈ $8.250 COP/mes · Ahorras $79.800 al año`).
    - Si es Mensual: `$14.900 COP / mes` (con subtítulo `Sin permanencia, cancela cuando quieras`).
  - Lista de 4 beneficios Pro.
  - Botón de CTA naranja con brillo: `"⚡ Obtener Convoy Pro"`.
  - Micro-banner inferior armonioso para incentivar QR: `🎁 +1 Mes Gratis pagando con QR Bancolombia / Nequi`.
- **Tarjeta 3: Biker Club ($299.000 COP / año)**
  - Badge superior flotante: `PARA CLUBES`.
  - Precio `$299.000 COP / año` (con subtítulo `Para capitanes de ruta y grupos de moteros`).
  - Lista de beneficios de Club (incluyendo `👥 Hasta 25 pilotos en convoy simultáneo`).
  - Botón oscuro premium: `"🏆 Activar Biker Club"`.

### C. Alineación y Tipografía Uniforme:
- Todas las tarjetas deben tener:
  - Misma altura (`h-full`).
  - Estructura interna flex: `flex flex-col justify-between`.
  - El contenedor de la lista con `flex-1`.
  - El botón y pie de tarjeta anclados en el fondo con `mt-auto pt-6`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingPricing.tsx` (Reescritura completa del componente con switch mensual/anual y grid simétrico de 3 tarjetas).
- `src/utils/i18n.ts` (Traducciones para el switch mensual/anual y subtítulos en ES/EN).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Reestructurar `src/components/landing/LandingPricing.tsx`
```tsx
import { useState } from 'react'
import { useApp } from '../../context/AppContext'

export default function LandingPricing() {
  const { setTopLevelMode, openSubscriptionCheckout, requestAppAccess } = useApp()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')

  function goToCheckout(tier: 'pro' | 'club') {
    requestAppAccess(() => {
      setTopLevelMode('app')
      openSubscriptionCheckout(tier, tier === 'club' ? 'yearly' : billingCycle)
    })
  }

  function startFree() {
    requestAppAccess(() => setTopLevelMode('app'))
  }

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <span className="inline-block rounded-full bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bike-orange">
          Planes y Precios
        </span>
        <h2 className="mt-3 font-display text-2xl font-black text-bike-ink sm:text-4xl">
          Precios Claros, Transparentes y Accesibles
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          Elige la modalidad que mejor se adapte a tus rodadas. Sin sorpresas ni letras pequeñas.
        </p>

        {/* Switch de Facturación */}
        <div className="mt-8 inline-flex items-center rounded-full border border-bike-border bg-slate-100 p-1.5 shadow-inner">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
              billingCycle === 'monthly'
                ? 'bg-white text-bike-ink shadow-card'
                : 'text-slate-500 hover:text-bike-ink'
            }`}
          >
            Pago Mensual
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
              billingCycle === 'yearly'
                ? 'bg-bike-orange text-white shadow-glow-orange'
                : 'text-slate-500 hover:text-bike-ink'
            }`}
          >
            <span>Pago Anual</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
              billingCycle === 'yearly' ? 'bg-white text-bike-orange' : 'bg-orange-100 text-bike-orange'
            }`}>
              Ahorra 45%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-3">
        {/* Card 1: Piloto Libre */}
        <div className="flex h-full flex-col justify-between rounded-3xl border border-bike-border bg-white p-8 shadow-soft transition hover:shadow-card">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bike-blue">Plan Piloto Libre</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-bike-ink">$0</span>
              <span className="text-sm font-semibold text-slate-400">/ siempre</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Para quienes salen a rodar de vez en cuando.</p>

            <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>Convoy de hasta <strong>3 pilotos</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span><strong>1 vehículo</strong> en garaje</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>Alertas de SOAT y Tecnomecánica</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>SOS básico con ubicación GPS</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>Rutas y navegación en tiempo real</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={startFree}
              className="w-full rounded-2xl border border-bike-border bg-slate-50 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98]"
            >
              Empezar Gratis
            </button>
          </div>
        </div>

        {/* Card 2: Convoy Pro (Destacado) */}
        <div className="relative flex h-full flex-col justify-between rounded-3xl border-2 border-bike-orange bg-gradient-to-b from-orange-50/70 via-white to-white p-8 shadow-xl">
          <span className="absolute -top-3.5 right-8 flex items-center gap-1.5 rounded-full bg-bike-orange px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-glow-orange">
            ⭐ Más Popular
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bike-orange">Plan Convoy Pro</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-bike-ink">
                {billingCycle === 'yearly' ? '$99.000' : '$14.900'}
              </span>
              <span className="text-sm font-bold text-slate-500">
                COP {billingCycle === 'yearly' ? '/ año' : '/ mes'}
              </span>
            </div>
            <p className="mt-2 text-xs font-bold text-status-ok">
              {billingCycle === 'yearly'
                ? '⚡ Equivale a ≈ $8.250 COP/mes (Ahorras 45%)'
                : 'Paga mes a mes, cancela cuando quieras'}
            </p>

            <ul className="mt-8 space-y-3.5 text-sm text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span><strong>Pilotos ilimitados</strong> en convoy</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>Hasta <strong>5 vehículos</strong> en el garaje</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span><strong>Alertas de voz</strong> en intercomunicador Bluetooth</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>Telemetría avanzada, radar y exportación GPX</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-bike-orange font-bold">✓</span>
                <span>Prioridad en emergencias SOS y alertas grupales</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 space-y-3 pt-4">
            <button
              onClick={() => goToCheckout('pro')}
              className="w-full rounded-2xl bg-bike-orange py-3.5 text-sm font-bold text-white shadow-glow-orange transition hover:bg-bike-orangeDark active:scale-[0.98]"
            >
              ⚡ Obtener Convoy Pro
            </button>
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-700 border border-emerald-200">
              🎁 1 Mes Gratis adicional pagando con QR Bancolombia / Nequi
            </p>
          </div>
        </div>

        {/* Card 3: Biker Club */}
        <div className="relative flex h-full flex-col justify-between rounded-3xl border border-bike-border bg-white p-8 shadow-soft transition hover:shadow-card">
          <span className="absolute -top-3.5 right-8 flex items-center gap-1.5 rounded-full bg-bike-ink px-4 py-1 text-xs font-black uppercase tracking-widest text-white shadow-card">
            👥 Para Clubes
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Plan Biker Club</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-black text-bike-ink">$299.000</span>
              <span className="text-sm font-semibold text-slate-400">COP / año</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">Para clubes de moteros, marcas y organizadores.</p>

            <ul className="mt-8 space-y-3.5 text-sm text-slate-600">
              <li className="flex items-center gap-2.5">
                <span className="text-amber-500 font-bold">✓</span>
                <span>Convoy de hasta <strong>25 pilotos simultáneos</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-amber-500 font-bold">✓</span>
                <span>Código de canje exclusivo para tu Club</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-amber-500 font-bold">✓</span>
                <span>Nombre y emblema del Club en la cabecera</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-amber-500 font-bold">✓</span>
                <span><strong>Todas las funciones Pro</strong> para los miembros</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-amber-500 font-bold">✓</span>
                <span>Soporte prioritario para rodadas del club</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4">
            <button
              onClick={() => goToCheckout('club')}
              className="w-full rounded-2xl bg-bike-ink py-3.5 text-sm font-bold text-white shadow-card transition hover:bg-slate-800 active:scale-[0.98]"
            >
              🏆 Activar Biker Club
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] La sección de precios muestra exactamente 3 columnas armoniosas y de igual altura en pantallas grandes (`lg:grid-cols-3`).
- [ ] El switch de facturación (Pago Mensual / Pago Anual con badge de 45% de ahorro) cambia el precio de Convoy Pro de forma reactiva e instantánea.
- [ ] Todos los botones de acción inferior están alineados exactamente en la misma línea horizontal en las 3 tarjetas (`mt-auto`).
- [ ] La tarjeta de Convoy Pro destaca visualmente con borde naranja, badge de "Más Popular" y el beneficio del pago QR.
- [ ] El Plan Biker Club muestra claramente el cupo de **hasta 25 pilotos simultáneos**.
- [ ] `npm run build` compila al 100% sin errores de TypeScript ni linter.
