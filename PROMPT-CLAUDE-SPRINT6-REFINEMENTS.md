# 📋 PROMPT DE EJECUCIÓN: SPRINT 6 (Afinamiento UX: Retén Policial, Piloto Guardián, Botones Glove-Friendly y Copy Cálido)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo en este sprint de afinamiento es pulir 4 aspectos clave de usabilidad, ergonomía motera y terminología para **Bike Tracker**:

1. **Reemplazo del Término "Escoba":** Cambiar la denominación "Escoba" por **"Guardián"** / **"Piloto Guardián"** (el compañero protector que cuida el cierre del grupo) en toda la aplicación y la landing page.
2. **Eliminación del Doble Botón SOS & Nuevo Botón de Retén Policial:**
   - Dejar como **único control de emergencia el botón circular flotante SOS** de la barra inferior (`BottomNav.tsx`), el cual permite activar y desactivar la alerta limpiamente.
   - Reemplazar el botón de SOS grande en la cuadrícula de acciones rápidas (`CockpitView.tsx` y `ConvoyMap.tsx`) por: 👮 **"Control Policial / Retén"** (icono 👮 o 🚔, toast: *"👮 Alerta emitida: Presencia de control policial / retén en la vía"*).
3. **Ergonomía Aumentada para Guantes (BottomNav y Menú Hamburguesa):**
   - Aumentar el tamaño táctil de los botones de la barra inferior (Tablero, Mapa, SOS, Garaje, Convoy) para que un motero con guantes no tenga dificultades al presionar.
   - Aumentar el tamaño del botón de menú hamburguesa (☰) en el Header (`h-11 w-11` con padding cómodo).
4. **Landing Page más Cálida y Humana:**
   - Retirar los textos fríos de "Acto 1, Acto 2, Acto 3" en `LandingStory.tsx` y reemplazarlos por badges cálidos de amistad motera (ej: 🤝 **"Hermandad en la Ruta"**, 🏍️ **"Enfoque y Libertad"**, 🛡️ **"Seguridad en Grupo"**).

---

## 2. [Especificación Detallada de Cambios]

### A. Terminología "Piloto Guardián" (`types/index.ts`, `i18n.ts`, `ConvoyLobby.tsx`, `LandingPage.tsx`)
- En `src/types/index.ts`:
  ```typescript
  export type ConvoyRole = 'lider' | 'guardian' | 'piloto'
  ```
- Actualizar `src/utils/i18n.ts`, simuladores (`mockConvoySimulator.ts`) y componentes donde aparezca "Escoba" / "escoba" para mostrar **"Guardián"** o **"Piloto Guardián"** (ej: *"El líder y el guardián conectados en tiempo real"*).

---

### B. Cuadrícula de 4 Acciones Rápidas Unificadas (`src/components/common/quickActions.ts`)
Actualizar `quickActions.ts` para definir exactamente las 4 acciones de ruta (sin SOS redundante):
```typescript
export interface QuickAction {
  id: 'gasoline' | 'hazard' | 'regroup' | 'police'
  icon: string
  label: string
  message: string
  colorClass: string
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'gasoline',
    icon: '⛽',
    label: 'Parada Gasolina',
    message: '⛽ Notificación enviada: Solicitaste parada de gasolina al convoy',
    colorClass: 'bg-sky-500 hover:bg-sky-600',
  },
  {
    id: 'hazard',
    icon: '⚠️',
    label: 'Peligro en Vía',
    message: '⚠️ Alerta emitida: Peligro en vía reportado al grupo',
    colorClass: 'bg-amber-500 hover:bg-amber-600',
  },
  {
    id: 'regroup',
    icon: '🛑',
    label: 'Reagrupación',
    message: '🛑 Solicitud enviada: Reagrupación de convoy solicitada',
    colorClass: 'bg-emerald-600 hover:bg-emerald-700',
  },
  {
    id: 'police',
    icon: '👮',
    label: 'Retén Policial',
    message: '👮 Alerta emitida: Presencia de control policial / retén en la vía',
    colorClass: 'bg-indigo-600 hover:bg-indigo-700',
  },
]
```
- En `CockpitView.tsx` y `ConvoyMap.tsx`: renderizar las 4 acciones desde `QUICK_ACTIONS` con `onClick={() => showToast(action.message)}`.
- El botón SOS circular de `BottomNav.tsx` queda como el control único y soberano de SOS (con opción de cancelar/desactivar la alerta sin tener que recargar).

---

### C. Aumento de Tamaño y Ergonomía para Guantes (`BottomNav.tsx` & `Header.tsx`)
1. **`BottomNav.tsx`:**
   - Botones de navegación (Tablero, Mapa, Garaje, Convoy):
     - Altura mínima de botón de **56px** (`py-3`, `px-3`).
     - Iconos a tamaño `text-xl` (20px) y textos en `text-xs font-bold`.
   - Botón central SOS:
     - Botón circular de `h-16 w-16` (64px) con borde grueso de 4px, icono `text-2xl` y texto `text-[10px] font-black`.
2. **`Header.tsx`:**
   - Botón Menú Hamburguesa (☰): cambiar a `h-11 w-11` con icono `text-xl` y esquinas redondeadas `rounded-xl` para pulsar cómodamente con guantes.

---

### D. Landing Page Cálida y Amigable (`LandingStory.tsx` & `LandingPage.tsx`)
1. En `src/components/landing/LandingStory.tsx`:
   - Eliminar `tag: 'Acto 1'`, `tag: 'Acto 2'`, `tag: 'Acto 3'`.
   - Usar badges amigables y cálidos:
     - Badge 1: 🤝 **"Hermandad & Ruta"**
     - Badge 2: 🏍️ **"Enfoque al Manillar"**
     - Badge 3: 🛡️ **"Seguridad en Grupo"**
2. En `LandingPage.tsx` y `LandingShowcase.tsx`:
   - Actualizar los textos para que digan *"Líder y Guardián conectados"* en lugar de "escoba".

---

## 3. [Archivos a Modificar]
- `src/types/index.ts` (Actualizar `ConvoyRole` con `'guardian'`).
- `src/utils/i18n.ts` (Actualizaciones de textos y traducciones).
- `src/utils/mockConvoySimulator.ts` (Cambiar rol `escoba` a `guardian`).
- `src/components/common/quickActions.ts` (Agregar acción `police` / Retén Policial).
- `src/components/cockpit/CockpitView.tsx` (Renderizar las 4 acciones rápidas de `QUICK_ACTIONS`).
- `src/components/map/ConvoyMap.tsx` (Renderizar las 4 acciones rápidas en la barra flotante).
- `src/components/common/BottomNav.tsx` (Ergonomía ampliada para guantes).
- `src/components/common/Header.tsx` (Hamburguesa `h-11 w-11`).
- `src/components/landing/LandingStory.tsx` (Badges cálidos de amistad y ruta).
- `src/components/landing/LandingPage.tsx` (Textos amigables de líder y guardián).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Terminología "Guardián":** El término "Escoba" queda 100% reemplazado por "Guardián" en toda la plataforma.
2. ✅ **Botón de Retén Policial:** La cuadrícula y barra flotante contienen exactamente: Gasolina ⛽, Peligro ⚠️, Reagrupación 🛑 y Retén Policial 👮.
3. ✅ **SOS Único y Cancelable:** El botón SOS circular inferior activa y permite cancelar la alarma sin necesidad de recargar la página.
4. ✅ **Ergonomía para Guantes:** Los botones del BottomNav y la hamburguesa del Header son visiblemente más grandes y fáciles de accionar con guantes.
5. ✅ **Landing Cálida:** Los textos de "Acto 1, 2, 3" son reemplazados por etiquetas de amistad, ruta y hermandad.
6. ✅ **Compilación Limpia:** `npm run build` y `tsc --noEmit` pasan sin errores.
7. ✅ **Reporte en Español:** Resumen de entrega en Español.
