# 📋 PROMPT DE EJECUCIÓN: SPRINT 38 (Modo Instrumentación Diurna de Ultra-Alto Contraste, Centrado Matemático del Velocímetro, Pantalla Real en Manubrio & Modal de Resumen de Rodada)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC SyncTech)**.
Actúas bajo la dirección de arte y ergonomía automotriz de un equipo senior especializado en movilidad y motociclismo de alto rendimiento (**BMW Motorrad, Garmin Tread, Cardo Systems**).
El Product Manager y los pilotos de prueba han identificado 4 requerimientos críticos para producción:
1. **Efecto Espejo & Visibilidad Solar en Carretera:** Un fondo negro absoluto en un celular montado sobre el manillar a pleno sol de mediodía produce un reflejo tipo espejo del casco o del cielo, impidiendo ver la pantalla. La aplicación real debe evolucionar hacia un **Modo Instrumentación Diurna de Ultra-Alto Contraste (Automotive Daylight Cockpit)**: fondos limpios y luminosos (`#FFFFFF` / `#F8FAFC`), tipografía en tinta negra profunda (`#0F172A`, ratio de contraste 21:1 que anula el deslumbramiento solar), biseles técnicos y erradicación total de emojis en la app (sustituyéndolos por iconografía SVG automotriz nítida).
2. **Centrado Matemático del Velocímetro (`Speedometer.tsx`):** Actualmente la cifra de velocidad y la unidad `KM/H` se aprecian descentradas vertical y horizontalmente debido a un padding artificial (`pt-6`) que desalinea la lectura respecto al eje geométrico del dial (`cx=140, cy=140`).
3. **App Real en la Pantalla del Manillar (`LandingStory.tsx` Acto 03):** En la fotografía del manillar (`cockpit-view.jpg`), la pantalla del soporte GPS debe mostrar con nitidez la interfaz real de Bike Tracker (con mapa de convoy, radar y velocidad), transmitiendo que el piloto está utilizando activamente la plataforma.
4. **Garantía de la Función de Resumen de Rodada (Acto 05 en la App Real):** El panel de "RODADA FINALIZADA · CONVOY COMPLETO" prometido en la Landing debe ser una función real y tangible en la app. Al hacer clic en "Finalizar Rodada" (`finalizeRide()`), debe desplegarse el modal interactivo `RideSummaryModal.tsx` con las estadísticas reales de la rodada (distancia, tiempo, pilotos en casa) antes de resetear la sesión.

---

## 2. [Objetivo Concreto y Alcance]
1. **Centrado Geométrico del Velocímetro (`Speedometer.tsx`):**
   - Eliminar el desplazamiento arbitrario `pt-6`.
   - Posicionar matemáticamente el texto numérico `{Math.round(speed)}` y el texto `KM/H` de forma concéntrica en el centro de rotación del dial SVG.
   - Ajustar el contenedor para que quede simétrico en cualquier tarjeta sin desviaciones.
2. **Refactorización Ergonómica del Cockpit (`CockpitView.tsx` y `quickActions.ts`):**
   - Reemplazar los 4 emojis de las acciones rápidas (`⛽`, `⚠️`, `🛑`, `👮`) por iconos vectoriales SVG gruesos y de alta visibilidad (Gasolina, Peligro, Reagrupación, Retén Policial).
   - Aplicar el diseño de instrumentación diurna de alto contraste: fondos sólidos con bordes técnicos tipo bisel de rally (`border-slate-300`), tipografía nítida para viseras oscuras o sol cenital, y hitboxes táctiles de 52px+ para guantes.
3. **Cabecera y Barra de Navegación Industrial (`Header.tsx` y `BottomNav.tsx`):**
   - **En `Header.tsx`:** Eliminar los emojis sueltos (`🏠`, `🕶️`, `🔔`). Usar iconos SVG elegantes para Inicio, Menú, Notificaciones y Perfil. El selector de vehículo debe lucir como una placa automotriz metálica troquelada de alta gama.
   - **En `BottomNav.tsx`:** Eliminar los emojis de navegación (`📊`, `🗺️`, `🛠️`, `👥`, `🆘`). Utilizar iconos SVG sobrios para Tablero, Mapa, Garaje y Convoy. El botón central SOS debe ser un botón de emergencia táctil unificado de alto impacto visual con una sola etiqueta clara "SOS".
4. **Pantalla Real en el Soporte del Manillar (`LandingStory.tsx` Acto 03):**
   - Sobre la fotografía `cockpit-view.jpg`, posicionar mediante un contenedor calibrado en coordenadas porcentuales una réplica a escala de la pantalla de Bike Tracker en modo navegación activa (con mapa, indicador de giro, radar y velocidad), integrándose como si el GPS del manillar estuviese encendido con la app.
5. **Implementación de la Función Real de Resumen de Rodada (`RideSummaryModal.tsx`):**
   - Crear el componente `src/components/common/RideSummaryModal.tsx` replicando con fidelidad la tarjeta del Acto 05:
     * Título: `RODADA FINALIZADA` con indicador verde `● CONVOY COMPLETO`.
     * Métricas principales: Distancia recorrida (`distanceTraveledKm`), Tiempo total en ruta (`elapsedSeconds`), Indicador `En Casa 5/5`.
     * Lista de miembros del convoy (Líder, Pilotos, Guardián) con estado destacado `Llegó a casa`.
     * Botón de cierre: `Guardar en Garaje y Volver`.
   - Conectar este modal al flujo de `finalizeRide` en `AppContext.tsx` y `ConvoyMap.tsx`.
6. **Validación de Compilación:**
   - Asegurar compilación limpia sin errores mediante `npm run build`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/cockpit/Speedometer.tsx` (Centrado concéntrico matemático de cifras y dial).
- `src/components/cockpit/CockpitView.tsx` (Cockpit de alto contraste antirreflejo solar para carretera).
- `src/components/common/Header.tsx` (Limpieza de emojis, placa vehicular industrial e iconos SVG).
- `src/components/common/BottomNav.tsx` (Navegación automotriz SVG y botón táctil SOS depurado).
- `src/components/common/quickActions.ts` (Iconos SVG vectoriales en lugar de emojis de texto).
- `src/components/common/RideSummaryModal.tsx` (Nuevo componente: Modal real de cierre de rodada).
- `src/context/AppContext.tsx` (Exponer estado y apertura del modal de resumen al finalizar la rodada).
- `src/components/map/ConvoyMap.tsx` (Disparar el modal de resumen de rodada al finalizar ruta).
- `src/components/landing/LandingStory.tsx` (Overlay de la app real sobre el soporte GPS de `cockpit-view.jpg`).
- `src/components/landing/LandingShowcase.tsx` (Alineación y centrado del velocímetro en la maqueta).
- `src/App.tsx` (Montar el nuevo `RideSummaryModal`).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Paso 1: Centrado Matemático en `src/components/cockpit/Speedometer.tsx`
1. En el dial SVG, el centro de rotación es `CENTER = SIZE / 2 = 140`.
2. En la superposición de lectura (alrededor de la línea 104):
   ```tsx
   // ANTES:
   <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-6">
     <span className={`font-display text-5xl font-black tabular-nums ${dark ? 'text-white' : 'text-bike-ink'}`}>
       {Math.round(speed)}
     </span>
     <span className={`mt-1 text-xs font-semibold tracking-[0.3em] ${dark ? 'text-slate-400' : 'text-slate-500'}`}>KM/H</span>
   </div>

   // AHORA:
   // Eliminar pt-6 y calibrar exactamente las alturas para que el número descanse concéntrico con el eje:
   <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
     <div className="flex flex-col items-center text-center -translate-y-1">
       <span className={`font-sans text-5xl font-black tracking-tight tabular-nums leading-none ${dark ? 'text-white' : 'text-slate-900'}`}>
         {Math.round(speed)}
       </span>
       <span className={`mt-1.5 text-[11px] font-bold tracking-[0.25em] leading-none ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
         KM/H
       </span>
     </div>
   </div>
   ```
3. Asegurar que el contenedor raíz tenga `className="relative mx-auto flex items-center justify-center"`.

### Paso 2: Refactorizar `src/components/common/quickActions.ts` y `CockpitView.tsx`
1. En `quickActions.ts`:
   - Mantener las propiedades pero definir identificadores de icono limpios para renderizar SVG en lugar de emojis de texto:
     * `gasoline`: Icono de dispensador de combustible.
     * `hazard`: Icono de advertencia triangular de carretera.
     * `regroup`: Icono de grupo / convoy en bandera.
     * `police`: Icono de escudo / control vial.
2. En `CockpitView.tsx`:
   - Utilizar el diseño de **Ultra-Alto Contraste Diurno**:
     * Fondo: `bg-slate-100` con tarjetas en `bg-white border-2 border-slate-200/80 shadow-sm`.
     * Botones de acciones rápidas: tarjetas sólidas de 52px+ de altura mínima con icono SVG blanco a la izquierda y texto en tipografía bold blanca, visibles al 100% bajo luz solar extrema.

### Paso 3: Limpiar y Profesionalizar `Header.tsx` y `BottomNav.tsx`
1. En `Header.tsx`:
   - Sustituir `☰` por un icono SVG de menú hamburguesa automotriz de 3 barras limpias.
   - En el selector central:
     * Quitar el emoji `v.avatarEmoji`. Mostrar una placa con diseño automotriz (fondo blanco o marfil claro con borde negro fino, fuente monospace/grotesque en negro sólido: e.g. `[RTX · 880]`).
   - Sustituir los botones de la derecha:
     * En lugar de `🏠`, usar un icono SVG sutil de Casa / Salir a Web.
     * En lugar de `👤`, usar un avatar limpio o silueta vectorial.
     * En lugar de `🔔`, usar una campana vectorial SVG con el badge de notificaciones en rojo vivo.
2. En `BottomNav.tsx`:
   - Sustituir los emojis `['📊', '🗺️', '🛠️', '👥']` por iconos SVG minimalistas (Dashboard, Mapa, Herramienta/Garaje, Usuarios/Convoy).
   - En el botón central SOS:
     * Quitar el emoji `🆘`.
     * Renderizar un círculo táctil de 72px en rojo señalización (`bg-red-600 border-4 border-white shadow-lg`), con el texto `SOS` en tipografía ultra-bold blanca de 18px en una sola línea centrada.

### Paso 4: Montar la Pantalla de la App en el Manillar (`LandingStory.tsx` Acto 03)
1. En la tarjeta de `cockpit-view.jpg`, localizar el contenedor de la imagen.
2. Insertar sobre el área de la pantalla del GPS del manillar (aproximadamente `top-[42%] left-[55%] -translate-x-1/2 -translate-y-1/2` o mediante un marco calibrado):
   - Una pantalla miniatura de alta resolución con estilo Bike Tracker:
     * Barra superior: `CONVOY ACTIVO · 5 RIDERS`.
     * Mapa con ruta morada y puntos de posición.
     * Cuadro de telemetría: `84 KM/H` y `PRÓXIMA CURVA 150M`.
     * Bisel exterior que encaje con la perspectiva del soporte del manillar.

### Paso 5: Implementar `RideSummaryModal.tsx` y Conectar con `finalizeRide`
1. Crear `src/components/common/RideSummaryModal.tsx`:
   - Fondo: modal oscuro de alta gama (`fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4`).
   - Contenedor idéntico al panel del Acto 05:
     * Encabezado: `RODADA FINALIZADA` y badge verde `● CONVOY COMPLETO`.
     * 3 Métricas en números grandes de alta legibilidad:
       - **DISTANCIA:** `{distance} km`
       - **TIEMPO:** `{time} h`
       - **EN CASA:** `{arrivedCount}/{totalCount}`
     * Lista de los pilotos del convoy (Líder, Pilotos, Guardián) con icono de casa y badge `LLEGÓ A CASA`.
     * Botón de cierre: `Finalizar y Volver al Tablero`.
2. En `src/context/AppContext.tsx`:
   - Agregar estado `rideSummaryOpen: boolean` y `rideSummaryData: { distanceKm: number; elapsedSeconds: number; members: ConvoyMember[] } | null`.
   - Modificar `finalizeRide()` para capturar las métricas finales en `rideSummaryData`, abrir `setRideSummaryOpen(true)` y detener la marcha sin perder las cifras del viaje en el modal.
3. En `src/App.tsx`:
   - Importar y renderizar `<RideSummaryModal />`.

### Paso 6: Verificación de Build
Ejecutar:
```bash
npm run build
```
Confirmar compilación limpia sin errores de TypeScript y código de salida 0.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] El velocímetro (`Speedometer.tsx`) tiene las cifras `{Math.round(speed)}` y `KM/H` centradas de forma matemáticamente exacta en el centro del dial, sin desplazamientos verticales desalineados.
- [ ] En `cockpit-view.jpg` (Acto 03 de la Landing), el dispositivo del manillar muestra una interfaz activa de Bike Tracker integrada visualmente.
- [ ] El modal de Resumen de Rodada (`RideSummaryModal.tsx`) es una función real en la app que se despliega al finalizar la rodada con las estadísticas de la rodada y confirmación de llegada del convoy.
- [ ] Toda la aplicación móvil (`CockpitView`, `Header`, `BottomNav`) está libre de emojis infantiles, con iconografía SVG automotriz limpia y contraste optimizado para visión en carretera bajo sol directo (antirreflejo).
- [ ] El botón SOS de la barra inferior muestra una interfaz limpia de una sola etiqueta sin redundancias.
- [ ] `npm run build` compila con código de salida 0.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No comprometer la lógica de WebSockets de Supabase ni el Screen Wake Lock.
- Mantener la compatibilidad en celulares y modo PWA.
- Mantener estrictamente el idioma de las respuestas y comentarios en **Español**.

