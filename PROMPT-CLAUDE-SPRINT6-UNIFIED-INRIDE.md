# 📋 PROMPT DE EJECUCIÓN: SPRINT 6 (Integración Total del Modo Conducción / In-Ride en el Tablero y Mapa de la App)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo en este ajuste es **eliminar la pantalla aislada/independiente del modo conducción** e **integrar las Acciones Rápidas y Controles para Guantes (Glove-Friendly In-Ride Controls) directamente dentro del Tablero (Cockpit) y del Mapa de Convoy**.

### 💡 Problema Detectado por el Stakeholder:
Tener una pantalla oscura separada para el "Modo Conducción" rompe la experiencia del motero porque le impide ver la ruta GPS y la ubicación de sus compañeros al mismo tiempo. Un motero en marcha necesita ver el mapa, su velocidad y a sus amigos **y al mismo tiempo** tener a mano los botones gigantes para reportar gasolina, peligro, reagrupación o emergencia sin tener que cambiar de pantalla.

---

## 2. [Tareas Concretas de Implementación]

### A. Eliminar la Vista Aislada Independiente (`InRideGloveMode.tsx` como vista suelta)
1. **Eliminar el estado `topLevelMode === 'in-ride'`** en `src/context/AppContext.tsx` y `src/App.tsx`.
2. El enrutamiento global solo tendrá dos modos principales:
   - `topLevelMode: 'landing' | 'app'`
3. En la Landing Page (`LandingPage.tsx`), el botón **`🏍️ Probar Modo Conducción`** y el botón **`🔥 Iniciar Rodada Gratis`** deben llevar directamente a la **App** (`setTopLevelMode('app')`) abriendo la vista de Tablero/Mapa.
4. En el `Header.tsx` y `Sidebar.tsx`, eliminar el botón redundante de "Modo Conducción Suelto" y dejar la navegación limpia y coherente.

---

### B. Integrar Acciones Rápidas para Guantes en el Tablero (`src/components/cockpit/CockpitView.tsx`)
Debajo del velocímetro y las métricas de tiempo/distancia, agregar la sección **"Acciones Rápidas en Ruta"** con 4 botones grandes y accesibles con guantes (mínimo 60-70px de altura con buen espaciado táctil):
1. ⛽ **Parada Gasolina** (`bg-sky-500 hover:bg-sky-600 text-white rounded-2xl shadow-card p-3 flex items-center justify-center gap-2 font-bold`):
   - Al pulsar, dispara un toast flotante de confirmación: *"⛽ Notificación enviada: Solicitaste parada de gasolina al convoy"*.
2. ⚠️ **Peligro en Vía** (`bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-card p-3 flex items-center justify-center gap-2 font-bold`):
   - Al pulsar, dispara toast: *"⚠️ Alerta emitida: Peligro en vía reportado al grupo"*.
3. 🛑 **Reagrupación** (`bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-card p-3 flex items-center justify-center gap-2 font-bold`):
   - Al pulsar, dispara toast: *"🛑 Solicitud enviada: Reagrupación de convoy solicitada"*.
4. 🆘 **Alerta SOS** (`bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-card p-3 flex items-center justify-center gap-2 font-bold`):
   - Abre directamente el modal de emergencia `setSosOpen(true)` o dispara la alerta SOS activa con sirena.

---

### C. Integrar Barra de Acciones Flotante para Guantes en el Mapa (`src/components/map/ConvoyMap.tsx`)
Cuando la ruta está en curso (`rideActive === true`):
1. Agregar una **Barra Flotante de Acciones Rápidas (In-Ride Quick Bar)** en la parte inferior o lateral del mapa (justo arriba del panel inferior):
   - 4 botones compactos pero de alto contraste y área de toque ampliada (iconos grandes ⛽, ⚠️, 🛑, 🆘) que permitan al motero emitir alertas inmediatas **sin dejar de ver el mapa GPS, el trazado de la ruta y los marcadores de sus compañeros**.
   - Cada botón debe proporcionar feedback visual y toast inmediato de alerta enviada al convoy.

---

### D. Sistema de Notificaciones / Toast en Pantalla
Asegurar que al pulsar cualquiera de los botones de acción rápida (Gasolina, Peligro, Reagrupación, SOS), aparezca una notificación visual tipo banner/toast en la parte superior de la pantalla durante 3 segundos confirmando que el mensaje fue transmitido a los intercomunicadores y pantallas del convoy.

---

## 3. [Archivos y Rutas Afectadas]
- `src/context/AppContext.tsx` (Ajustar `topLevelMode` a `'landing' | 'app'`, agregar función/estado para notificaciones toast de alertas rápidas si aplica).
- `src/App.tsx` (Eliminar condición aislada de `in-ride`, mantener montaje de modales y vistas).
- `src/components/cockpit/CockpitView.tsx` (Incorporar la cuadrícula de botones rápidos para guantes).
- `src/components/map/ConvoyMap.tsx` (Incorporar la barra flotante de acciones rápidas sobre el mapa activo).
- `src/components/landing/LandingPage.tsx` (Redirigir botón de modo conducción directamente al Tablero/Mapa de la App).
- `src/components/common/Header.tsx` y `Sidebar.tsx` (Limpieza de accesos redundantes).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Cero Pantallas Aisladas:** Ya no existe una pantalla negra aislada que oculte el mapa o el tablero.
2. ✅ **Todo Integrado en la App:** El Tablero y el Mapa de Convoy contienen las acciones rápidas para guantes (Gasolina, Peligro, Reagrupación, SOS).
3. ✅ **Visibilidad Total en Ruta:** El motero puede ver la ruta GPS, sus compañeros y emitir alertas en 1 solo toque sin cambiar de vista ni distraerse.
4. ✅ **Feedback Inmediato:** Cada botón de alerta muestra confirmación visual/toast al ser pulsado.
5. ✅ **Compilación y Tipos:** `npm run build` y `tsc --noEmit` compilan con 0 errores.
6. ✅ **Reporte en Español:** Explicación y resumen de entrega redactados en Español.
