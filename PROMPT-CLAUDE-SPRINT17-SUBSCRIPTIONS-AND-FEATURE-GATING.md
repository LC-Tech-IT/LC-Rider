# 🚀 Prompt de Ejecución para Claude — Sprint 17: Motor Integral de Suscripciones (Free, Pro y Biker Club), Feature Gating y Precios Oficiales

## 1. Rol y Contexto para Claude
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El stakeholder ha aprobado el modelo de precios oficial y la matriz de monetización. Ahora debemos implementar el sistema de suscripciones y control de funcionalidades (**Feature Gating**) para que la aplicación identifique el nivel de cada usuario (`free`, `pro`, `club`), aplique sus límites de forma estricta y ofrezca la experiencia correspondiente.

---

## 2. Objetivo Concreto y Alcance
1. **Niveles de Suscripción Oficiales:**
   - 🆓 **Plan Piloto Libre (`free`):** $0 / siempre. Máximo **3 pilotos** por sala de convoy, 1 vehículo en garaje, SOS básico.
   - ⚡ **Plan Convoy Pro (`pro`):** **$9.900 COP / mes (~$2.49 USD)** o **$79.900 COP / año (~$19.99 USD)**. Pilotos **ilimitados**, alertas por voz en intercomunicador, telemetría y radar, exportación GPX, hasta 5 vehículos.
   - 🏆 **Plan Biker Club (`club`):** **$39.900 COP / mes (~$9.99 USD)**. Diseñado para clubes moteros: hasta **25 pilotos** en convoy bajo la cuenta del club o mediante **Código de Club**.
2. **Feature Gating en Tiempo Real:**
   - **Control de Cupos en Convoy:** Las salas creadas por usuarios Free limitan el acceso a 3 pilotos. Si un 4º intenta unirse, el sistema bloquea el ingreso y muestra aviso de upgrade. Salas Club permiten hasta 25, y Pro ilimitados.
   - **Límite de Vehículos en Garaje:** Free permite 1 vehículo; Pro hasta 5.
   - **Alertas de Voz de Intercomunicador:** Exclusivas para Pro y Club.
3. **Nuevo Modal de Suscripción (`SubscriptionModal.tsx`):**
   - Visualización de planes con selector Mensual/Anual.
   - Activación simulada de suscripción para pruebas y producción.
   - Canje de Códigos de Club (ej. `CLUB-YAMAHA`, `BIKER-CREW`, `CLUB-BMW`) para activar tier `club` con hasta 25 miembros.
4. **Actualización de la Landing Page y Chatbot:**
   - Precios oficiales actualizados en `LandingPricing.tsx` (con las 3 opciones) y en el asistente IA (`chatbotService.ts`).
5. **Indicadores de Estado (Badges):**
   - Mostrar badge del plan activo (`🆓 FREE`, `⚡ PRO`, `🏆 CLUB`) en el Sidebar y Header.

---

## 3. Archivos y Recursos Afectados
- `src/types/index.ts` (Nuevos tipos `SubscriptionTier`, campos `tier`, `clubCode` en `UserProfile` y `ConvoyRoom`)
- `src/context/AppContext.tsx` (Estado de suscripción, función `upgradeTier`, validación de límites en convoy y garaje)
- `src/components/common/SubscriptionModal.tsx` (Nuevo componente modal de suscripción y canje de códigos)
- `src/components/common/Sidebar.tsx` (Badge de plan y botón para abrir modal de suscripción)
- `src/components/common/Header.tsx` (Badge sutil de tier)
- `src/components/convoy/ConvoyLobby.tsx` (Contador de miembros vs capacidad `X / 3`, `X / 25` o `Ilimitado`, botón de upgrade)
- `src/components/garage/GarageView.tsx` (Validación de límite de vehículos según plan)
- `src/components/landing/LandingPricing.tsx` (Tarjetas con los 3 planes y precios oficiales en COP y USD)
- `src/services/chatbotService.ts` (Actualización de respuestas de precios del bot)
- `src/utils/i18n.ts` (Traducciones completas para planes, precios y límites en ES y EN)
- `src/App.tsx` (Inclusión de `SubscriptionModal`)

---

## 4. Instrucciones Paso a Paso / Tareas de Implementación

### Tarea 1: Actualizar Tipos en `src/types/index.ts`
```typescript
export type SubscriptionTier = 'free' | 'pro' | 'club'

export interface UserProfile {
  id: string
  name: string
  lastName?: string
  email: string
  avatarUrl: string
  gender?: GenderOption
  age?: number | null
  phone?: string
  isLoggedIn: boolean
  authProvider: 'google' | 'email'
  registeredAt: number
  tier: SubscriptionTier // 'free' por defecto
  subscriptionExpiresAt?: string
  clubName?: string
  clubCode?: string
}

export interface ConvoyRoom {
  pin: string
  leaderEmail: string
  createdAt: number
  tier: SubscriptionTier
  maxMembers: number // 3 para Free, 25 para Club, 999 para Pro
}
```

### Tarea 2: Lógica de Suscripciones y Gating en `src/context/AppContext.tsx`
1. Asegurar que al inicializar o cargar usuario, el `tier` por defecto sea `'free'` (o `'pro'` para el usuario demo `demo@biketracker.app`).
2. Implementar funciones y estados en el contexto:
   - `subscriptionModalOpen: boolean`, `setSubscriptionModalOpen: (open: boolean) => void`
   - `upgradeTier: (tier: SubscriptionTier, clubCode?: string, clubName?: string) => void`
   - Guardar los cambios de tier en el perfil del usuario persistido en `storage.ts`.
3. **Control en Creación y Unión a Convoy:**
   - En `createConvoyRoom(name, role)`:
     ```typescript
     const userTier = user?.tier ?? 'free'
     const maxMembers = userTier === 'pro' ? 999 : userTier === 'club' ? 25 : 3
     const newRoom: ConvoyRoom = {
       pin: generatedPin,
       leaderEmail: user?.email ?? 'anon',
       createdAt: Date.now(),
       tier: userTier,
       maxMembers,
     }
     ```
   - En `joinConvoyRoom(pin, name, role)`:
     - Si la sala ya tiene `convoyMembers.length >= room.maxMembers`:
       - Mostrar notificación/toast: *"Esta sala alcanzó el límite de {{maxMembers}} pilotos del plan actual. El líder puede actualizar a Convoy Pro para pilotos ilimitados."*
       - Impedir la unión si la sala está llena.
4. **Control en Garaje (`addVehicle`):**
   - Límite: `free` = 1 vehículo, `pro` = 5, `club` = 10.
   - Si un usuario Free ya tiene 1 vehículo y hace clic en agregar otro, abrir `subscriptionModalOpen = true` y mostrar toast *"El Plan Libre incluye 1 vehículo. Pasa a Pro para gestionar hasta 5 vehículos con alertas de SOAT."*

### Tarea 3: Crear `src/components/common/SubscriptionModal.tsx`
Crear un modal elegante y responsive con:
1. **Encabezado:** *"Elige tu Plan de Rodada"* con selector de facturación `Mensual` o `Anual (Ahorra 33%)`.
2. **Las 3 Tarjetas de Plan:**
   - 🆓 **Piloto Libre ($0 / siempre):** Convoy de hasta 3 pilotos, SOS básico, 1 moto en garaje.
   - ⚡ **Convoy Pro ($9.900 COP / mes o $79.900 COP / año — ~$2.49 USD / mes):** Pilotos ilimitados, alertas por voz en intercomunicador, telemetría y radar, exportación GPX, hasta 5 motos con SOAT.
   - 🏆 **Biker Club ($39.900 COP / mes — ~$9.99 USD / mes):** Hasta 25 pilotos en convoy, ideal para presidentes y clubes moteros.
3. **Acciones de Activación:**
   - Botón *"Activar Plan"* que llama a `upgradeTier(tier)` y muestra feedback de éxito.
   - Sección inferior *"¿Perteneces a un club motero? Ingresa tu código de club:"* con input para canjear códigos como `CLUB-YAMAHA`, `CLUB-BMW`, `BIKER-CREW` o cualquier texto, activando automáticamente el tier `'club'`.

### Tarea 4: Actualizar `src/components/convoy/ConvoyLobby.tsx`
1. Si hay una sala activa, mostrar el indicador de cupo:
   - Free: `👥 2 / 3 pilotos (Plan Libre)` + botón pequeño *"⭐ Desbloquear ilimitados"* que abre el modal de suscripción.
   - Club: `👥 8 / 25 miembros (Plan Biker Club)`.
   - Pro: `👥 14 pilotos (Convoy Pro Ilimitado)`.

### Tarea 5: Actualizar `src/components/common/Sidebar.tsx` y `Header.tsx`
1. En `Sidebar.tsx`:
   - Mostrar badge del plan bajo el nombre del usuario (`🆓 Plan Libre`, `⚡ Convoy Pro`, `🏆 Biker Club`).
   - Agregar ítem en el menú: `⭐ Mi Suscripción / Planes` que abre `setSubscriptionModalOpen(true)`.
2. En `Header.tsx`:
   - Mostrar indicador discreto del plan activo.

### Tarea 6: Actualizar Landing Page y Chatbot
1. **`src/components/landing/LandingPricing.tsx`:**
   - Mostrar las 3 opciones de planes con los precios oficiales:
     - Piloto Libre: $0
     - Convoy Pro: **$9.900 COP / mes ($2.49 USD)** o **$79.900 COP / año ($19.99 USD)**
     - Biker Club: **$39.900 COP / mes ($9.99 USD)** para hasta 25 pilotos
2. **`src/services/chatbotService.ts`:**
   - Actualizar la respuesta a la intención de precios para mencionar los 3 planes con los precios exactos en COP y USD.

### Tarea 7: Actualizar `src/utils/i18n.ts` y `src/App.tsx`
1. Agregar todas las traducciones correspondientes en español e inglés.
2. Renderizar `<SubscriptionModal />` dentro de `src/App.tsx`.

---

## 5. Criterios de Aceptación / Definition of Done (DoD)
- [ ] En la Landing Page se muestran los 3 planes con sus precios oficiales en COP y USD.
- [ ] El Asistente Biker IA responde con los precios oficiales y detalles de los 3 planes.
- [ ] En la App, el usuario puede abrir el modal de suscripción desde el Sidebar y cambiar entre planes o canjear un código de club.
- [ ] Un usuario con Plan Libre solo puede tener hasta 3 pilotos en su sala de convoy.
- [ ] Un usuario con Plan Biker Club admite hasta 25 pilotos en convoy.
- [ ] Un usuario con Plan Pro admite pilotos ilimitados.
- [ ] La interfaz refleja el badge del plan activo en el Sidebar y sala de convoy.
- [ ] `npm run build` compila al 100% sin errores de tipos TypeScript.

---

## 6. Restricciones Técnicas y Reglas de Calidad
- **Zero-Discovery Waste:** Código limpio y modular, integrando los nuevos tipos con la persistencia existente en `storage.ts`.
- **Aesthetic Excellence:** Modal de suscripción visualmente impactante con Tailwind CSS, degradados elegantes y botones de acción claros.
