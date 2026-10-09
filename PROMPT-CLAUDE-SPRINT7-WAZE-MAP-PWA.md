# 📋 PROMPT DE EJECUCIÓN: SPRINT 7 (Mapa Estilo Waze con Botón de Reporte Flotante & Sistema de Instalación/Descarga PWA-APK Móvil)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu misión en este Sprint 7 es implementar dos mejoras prioritarias para **Bike Tracker**:
1. **Rediseño del Mapa Estilo Waze:** Reemplazar el mapa oscuro/marrón con puntos rosas por un mapa de navegación moderno, limpio y claro estilo **Waze** (tiles CartoDB Voyager, ruta con glow púrpura/cian, avatares nítidos) y **eliminar los 4 botones cuadrados fijos que tapaban el mapa**, sustituyéndolos por un **Botón Flotante de Reportes Waze (FAB)** que despliega un menú táctil de 1 toque y mantiene el mapa 100% despejado durante la ruta.
2. **Sistema de Descarga e Instalación Móvil (PWA / WebAPK / Descarga Directa):** Implementar la configuración completa de Progressive Web App (PWA) con Service Worker, Web Manifest, captura de `beforeinstallprompt` y un **Modal de Descarga/Instalación de la App** accesible tanto desde la Landing Page como desde la App, permitiendo instalar la aplicación en Android e iOS como app nativa a pantalla completa.

---

## 2. [Especificación Técnica Detallada]

### MÓDULO 1: Mapa de Convoy Estilo Waze (`src/components/map/ConvoyMap.tsx` & `src/index.css`)

#### 1. Tiles de Navegación Limpios (Adiós al filtro oscuro con puntos rosas)
- En `src/index.css`: **Eliminar el filtro CSS `.dark-map .leaflet-tile-pane`** que invertía los colores de OpenStreetMap.
- En `src/components/map/ConvoyMap.tsx` y `src/components/cockpit/CockpitView.tsx`:
  - Usar la capa de tiles CartoDB Voyager:
    ```tsx
    <TileLayer
      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      subdomains={['a', 'b', 'c', 'd']}
      maxZoom={19}
    />
    ```
  - Esto proporciona calles blancas limpias, autopistas en color ámbar/amarillo, nombres de vías legibles y zonas verdes suaves, exactamente como Waze.

#### 2. Trazado de Ruta Estilo Waze con Brillo
- Línea de ruta con doble trazado para dar efecto 3D y brillo de navegación:
  - Trazo base (borde exterior): color `#4338CA` (Índigo oscuro) o `#0369A1`, grosor 8, opacidad 0.8.
  - Trazo principal (interior): color `#8B5CF6` (Púrpura Waze) o `#00C2E8` (Cyan eléctrico), grosor 5, opacidad 0.95.

#### 3. Marcadores de Convoy y Piloto
- **Marcador del Piloto Actual:** Icono de moto con radar pulsante verde/azul.
- **Marcadores de Compañeros:** Avatares circulares limpios con badges de velocidad flotantes tipo chip blanco (`Valentina · 58 km/h`) con sombra suave y sin interferencias visuales.

---

### MÓDULO 2: Botón de Reportes Flotante Waze (Mapa Despejado)

1. **Eliminar la barra fija de 4 botones que flotaba en medio del mapa.**
2. **Botón Circular Flotante de Reportes (Estilo Waze):**
   - En `src/components/map/ConvoyMap.tsx`, cuando `rideActive === true`:
   - Mostrar en la esquina inferior derecha (arriba del panel de información) un botón flotante:
     - Botón circular `h-14 w-14 rounded-full bg-gradient-to-tr from-bike-orange to-amber-500 text-white shadow-2xl flex items-center justify-center text-2xl active:scale-95 transition`.
     - Icono: ⚠️ / 💬 con tooltip "Reportar en Vía".
3. **Menú Desplegable de Reportes Rápidos (Report Sheet):**
   - Al tocar el botón de reportes, se abre un panel emergente limpio (bottom-sheet o menú radial) con los 4 botones grandes para guantes:
     - ⛽ **Parada Gasolina**
     - ⚠️ **Peligro en Vía**
     - 🛑 **Reagrupación**
     - 👮 **Retén Policial**
   - Al pulsar cualquiera de las opciones:
     - Dispara el toast de notificación al convoy (*"👮 Alerta emitida: Presencia de control policial / retén en la vía"*).
     - Cierra automáticamente el menú.
     - **El mapa permanece 100% libre y despejado para la conducción**.

---

### MÓDULO 3: Descarga e Instalación Móvil (PWA Nativa / WebAPK / Modal de Instalación)

#### 1. Configuración de PWA y Web Manifest
1. Crear `public/manifest.webmanifest`:
   ```json
   {
     "name": "Bike Tracker - Convoy & Telemetría",
     "short_name": "BikeTracker",
     "description": "Plataforma de telemetría y convoy en tiempo real para moteros",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#F1F5F9",
     "theme_color": "#F97316",
     "orientation": "portrait-primary",
     "icons": [
       {
         "src": "/favicon.svg",
         "sizes": "192x192 512x512",
         "type": "image/svg+xml",
         "purpose": "any maskable"
       },
       {
         "src": "/images/lc-tech-logo.jpeg",
         "sizes": "512x512",
         "type": "image/jpeg",
         "purpose": "any"
       }
     ]
   }
   ```
2. En `index.html`:
   - Agregar `<link rel="manifest" href="/manifest.webmanifest" />`.
   - Agregar meta tags de iOS PWA:
     ```html
     <meta name="apple-mobile-web-app-capable" content="yes" />
     <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
     <meta name="apple-mobile-web-app-title" content="Bike Tracker" />
     ```
3. Crear un Service Worker básico en `public/sw.js` y registrarlo en `src/main.tsx` para habilitar la instalación nativa PWA en todos los navegadores móviles (Chrome, Safari, Edge, Brave, Samsung Internet).

#### 2. Gestor de Instalación y Modal de Descarga (`src/components/common/DownloadAppModal.tsx`)
1. Crear el hook / listener de instalación `usePWAInstall`:
   - Captura el evento nativo `beforeinstallprompt`.
2. Crear el componente `DownloadAppModal.tsx`:
   - Muestra opciones claras para el motero:
     - **Opción A (Instalación Instantánea en Teléfono):** Botón **"📲 Instalar App en mi Celular"** (ejecuta el prompt de instalación nativa PWA que crea el icono de Bike Tracker en la pantalla de inicio del teléfono y funciona exactamente como una app nativa de tienda a pantalla completa).
     - **Opción B (Descarga de Paquete WebAPK / Instalador Móvil):** Botón para descargar el archivo de instalación / manifiesto directo para Android.
     - **Instrucciones para iOS / Safari:** Explicación visual rápida (*"Toca Compartir ⬆️ y luego 'Agregar a pantalla de inicio' ➕"*).
3. **Puntos de Acceso para Descargar la App:**
   - **En el Header de la Landing Page:** Botón *"📲 Descargar App"*.
   - **En el Hero de la Landing Page:** Badge / botón secundario *"📲 Instalar en Móvil"*.
   - **En el Sidebar de la App:** Nueva opción *"📲 Descargar / Instalar App Móvil"*.
   - **En el Header de la App:** Botón o acceso directo para instalar.

---

## 3. [Archivos a Modificar / Crear]
- `src/index.css` (Eliminar filtro oscuro .dark-map y limpiar estilos).
- `src/components/map/ConvoyMap.tsx` (Tiles CartoDB Voyager estilo Waze, ruta Waze y botón flotante de reportes).
- `src/components/cockpit/CockpitView.tsx` (Tiles limpios en el mini-radar).
- `public/manifest.webmanifest` (Nuevo archivo de manifiesto PWA).
- `public/sw.js` (Service Worker para instalación).
- `index.html` (Enlazar manifest y meta tags móviles).
- `src/main.tsx` (Registro del Service Worker).
- `src/components/common/DownloadAppModal.tsx` (Modal de instalación / descarga de la app).
- `src/components/landing/LandingPage.tsx` (Botón de descarga en Header y Hero).
- `src/components/common/Sidebar.tsx` / `Header.tsx` (Acceso de descarga en la App).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Mapa Visual Estilo Waze:** El mapa muestra calles claras, nítidas, sin filtros oscuros ni cruces rosas, con el estilo visual luminoso y legible de Waze/Voyager.
2. ✅ **Ruta y Convoy Limpios:** Trazado de ruta destacado con glow y avatares con badges de velocidad limpios.
3. ✅ **Botón Flotante de Reportes Waze:** El mapa ya no tiene 4 botones cuadrados fijos en medio de la pantalla; ahora tiene un único botón flotante que abre un menú de reportes y se cierra al emitir la alerta, dejando la ruta 100% visible.
4. ✅ **Instalabilidad PWA / APK Móvil:** La app cuenta con su `manifest.webmanifest`, Service Worker y botón de instalación que permite instalarla en el móvil directamente a pantalla completa.
5. ✅ **Compilación y Tipos:** `npm run build` y `tsc --noEmit` compilan con 0 errores.
6. ✅ **Reporte en Español:** Resumen de entrega redactado en Español.
