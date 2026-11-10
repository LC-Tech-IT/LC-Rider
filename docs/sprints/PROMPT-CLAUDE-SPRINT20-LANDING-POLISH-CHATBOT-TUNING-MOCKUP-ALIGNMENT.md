# 🚀 SPRINT 20: Pull-to-Refresh Móvil, Rediseño de Storytelling, Mockup Fiel del Tablero, Afinación del Chatbot IA e Iconos Oficiales

## 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**. Tu misión en este Sprint 20 es pulir la experiencia de usuario y fidelidad visual de la Landing Page y el Asistente IA con base en las pruebas y feedback del Product Manager:
1. Habilitar la actualización por deslizamiento hacia abajo (**Pull-to-Refresh**) en navegadores móviles para la Landing Page.
2. Rediseñar el bloque de Seguridad en `LandingStory.tsx` para eliminar el contraste plano y mantener una línea estética fotográfica continua de alto impacto.
3. Actualizar `LandingShowcase.tsx` para que el mockup represente de forma 100% fiel la interfaz real del **Tablero / Cockpit** de la aplicación (tacómetro circular con aguja, métricas, botones de acciones rápidas de 4 colores y barra de navegación con botón SOS).
4. Afinar el motor de intenciones del Asistente Biker en `chatbotService.ts` para responder de forma rica y precisa a preguntas generales como *"¿Qué es Bike Tracker?"*, *"¿De qué se trata?"*, *"¿Cómo funciona?"*, etc.
5. Modernizar la iconografía de contacto en `LandingContact.tsx` incorporando el logotipo vectorial oficial y color de marca de **WhatsApp** (`#25D366`) e icono SVG de correo.

---

## 2. [Objetivo Concreto y Alcance]
- **Archivos a modificar:**
  1. `src/index.css`
  2. `src/components/landing/LandingStory.tsx`
  3. `src/components/landing/LandingShowcase.tsx`
  4. `src/services/chatbotService.ts`
  5. `src/components/landing/LandingContact.tsx`

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Pull-to-Refresh y Fluidez de Scroll en Móviles (`src/index.css`)
1. En `src/index.css`, actualizar las reglas raíz:
   ```css
   html,
   body,
   #root {
     min-height: 100%;
     margin: 0;
     overscroll-behavior-y: auto; /* Permite pull-to-refresh nativo en navegadores móviles */
   }
   ```
2. Asegurar que no existan clases `overscroll-none` en `LandingPage.tsx` ni restricciones que bloqueen el refresco natural del navegador al deslizar en el tope de la página.

---

### Tarea 2: Rediseño Estético del Bloque de Seguridad (`src/components/landing/LandingStory.tsx`)
1. **Problema identificado:** Los dos primeros actos muestran fotografías moteras (`friends-viewpoint.jpg`, `cockpit-view.jpg`), pero el tercer bloque cambiaba bruscamente a una tarjeta blanca plana con 4 cajas grises que desentonaba con el flujo visual.
2. **Solución:**
   - Unificar los 3 actos para que mantengan la misma jerarquía y calidad fotográfica.
   - El tercer acto debe contar con su propia tarjeta fotográfica (utilizando la imagen `/images/convoy-journey.jpg` o una composición visual con la fotografía de fondo enriquecida con badges/overlays).
   - Estructura del 3er bloque:
     - **Imagen:** Contenedor con `RevealBlock`, `rounded-3xl border border-bike-border shadow-soft overflow-hidden relative group`.
     - Sobre la imagen o en un elegante panel superpuesto semi-transparente (glassmorphism oscuro/claro), exhibir de manera moderna los 4 pilares:
       - 📡 Telemetría en vivo
       - 🆘 Alerta SOS de un toque
       - ⛽ Aviso de parada de gasolina
       - ⚠️ Alerta de peligro en vía
     - Mantener el efecto `transition-transform duration-700 ease-out hover:scale-[1.03]`.
   - Alternar orden visual (`md:flex-row` / `md:flex-row-reverse`) para mantener el ritmo de lectura fluido y armónico.

---

### Tarea 3: Mockup Fiel del Tablero Real (`src/components/landing/LandingShowcase.tsx`)
1. **Problema identificado:** El mockup actual muestra una caja oscura simplificada con una lista de texto que no corresponde a la apariencia real de la app.
2. **Solución:** Transformar el showcase para que sea una maqueta visualmente idéntica al **Tablero / Cockpit real** de Bike Tracker:
   - **Marco de teléfono móvil:** Contenedor de smartphone con bordes redondeados (`rounded-[2.5rem] border-4 border-slate-800 bg-white p-4 shadow-2xl`).
   - **Header simulado de la app:**
     - Menú hamburguesa `☰`.
     - Selector de vehículo: Píldora redondeada con `🚙 Toyota MCP412 ▾` (estilo `bg-sky-50 text-bike-blue border border-sky-200`).
     - Iconos de estado: `🏠`, `🕶️`, `🔔`.
   - **Título de sección:** `Tablero` (en `font-display font-bold text-bike-ink`).
   - **Tarjeta de Vehículo Activo:**
     - Subtítulo: `VEHÍCULO ACTIVO` en texto pequeño gris.
     - Título: `Toyota Hilux` con placa `MCP412` en recuadro azul/sky.
   - **Velocímetro / Tacómetro Circular Oficial:**
     - Integrar o replicar el tacómetro interactivo con arco SVG en gradiente `#00C2E8` → `#0284C7` → `#F97316`, aguja naranja animada apuntando a la velocidad actual, ticks de 0 a 200 km/h, y display digital central con `KM/H`.
     - La velocidad debe variar suavemente de forma animada simulando conducción real (ej: 0 → 45 → 82 → 98 km/h).
   - **Métricas Gemelas:**
     - `⏱️ 00:00 TIEMPO`
     - `📏 0.0 km DISTANCIA`
   - **Sección "ACCIONES RÁPIDAS EN RUTA" (4 Botones Característicos con colores y estilos idénticos al cockpit real):**
     - Botón Azul: `⛽ Parada Gasolina` (`bg-sky-500` / `bg-gradient-to-r from-sky-500 to-sky-600`)
     - Botón Naranja/Ámbar: `⚠️ Peligro en Vía` (`bg-amber-500` / `bg-gradient-to-r from-amber-500 to-amber-600`)
     - Botón Verde: `🛑 Reagrupación` (`bg-emerald-600` / `bg-gradient-to-r from-emerald-600 to-emerald-700`)
     - Botón Púrpura: `👮 Control Policial / Retén` (`bg-indigo-600` / `bg-gradient-to-r from-indigo-600 to-indigo-700`)
   - **Barra de Navegación Inferior:**
     - Pestañas con iconos: `Tablero` (activo en naranja), `Mapa`, `Garaje`, `Convoy`.
     - Botón central flotante circular rojo con texto `SOS` y efecto de brillo/pulsación.
   - **En la pestaña "Vista CarPlay / Android Auto":** Adaptar el tacómetro y la información de ruta a un formato apaisado/landscape oscuro optimizado para tableros vehiculares.

---

### Tarea 4: Afinación del Asistente Biker IA (`src/services/chatbotService.ts`)
1. **Problema identificado:** Preguntas clave como `"que es bike tracker"` o `"como funciona"` no tenían coincidencia en los keywords y arrojaban el mensaje de fallback genérico.
2. **Solución:**
   - Incorporar intenciones prioritarias al inicio de `PRODUCT_INTENTS`:
     - **Intención `¿Qué es Bike Tracker? / Propósito y Funcionamiento General`:**
       - `keywords`: `['que es bike tracker', 'que es la app', 'de que se trata', 'de que trata', 'como funciona', 'cómo funciona', 'para que sirve', 'para qué sirve', 'que hace la app', 'qué hace la app', 'cuentame sobre la app', 'cuéntame sobre la app', 'explicame', 'para que es', 'quienes son', 'por que usar bike tracker', 'informacion general', 'resumen', 'beneficios', 'ventajas', 'caracteristicas']`
       - `response`: `'🏍️ **Bike Tracker (LC Tech)** es la plataforma inteligente definitiva para moteros y clubes de rodada. Conecta al líder, al piloto guardián y a todos los integrantes en tiempo real con:\n\n• **Telemetría y Tacómetro en vivo:** Velocímetro digital, tiempo y distancia en ruta.\n• **Modo Convoy:** Monitoreo grupal en mapa con alertas automáticas de rezagados para que nadie se pierda.\n• **Seguridad Integral:** Botón SOS de un toque, avisos de peligro en vía, paradas de gasolina y retenes policiales.\n• **Modo Guantes:** Botones gigantes adaptados para operar con guantes puestos.\n• **Garaje Digital:** Registro de hasta 5 motos y control de vencimiento de SOAT y revisión técnico-mecánica.\n• **Compatibilidad:** Vistas optimizadas para smartphone y pantallas tipo CarPlay/Android Auto.\n\nPuedes empezar gratis con **Piloto Libre** o potenciar tus rodadas con **Convoy Pro** y **Biker Club**.'`
     - **Intención de Saludo Amigable:**
       - `keywords`: `['hola', 'buenas', 'buenos dias', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos', 'que tal', 'qué tal', 'hey']`
       - `response`: `'¡Hola, piloto! 🏍️ Bienvenido a **Bike Tracker (LC Tech)**. Estoy aquí para ayudarte a resolver cualquier duda sobre nuestra app, planes y precios (Piloto Libre, Convoy Pro, Biker Club), métodos de pago (Nequi, Daviplata, PSE, tarjetas), modo Convoy, botón SOS o cómo registrar tu club. ¿Qué te gustaría consultar hoy?'`
     - **Intención de Rutas y Navegación:**
       - `keywords`: `['mapa', 'ruta', 'rutas', 'navegacion', 'navegación', 'gps', 'waze', 'google maps', 'destinos', 'poi', 'gasolineras']`
       - `response`: `'Bike Tracker integra un mapa en tiempo real con buscador inteligente de destinos y puntos de interés (gasolineras, talleres, paradas de café). Además, te permite seguir la ruta del convoy y ubicar a cada piloto del grupo en vivo.'`
     - **Intención de Garaje y Mantenimiento:**
       - `keywords`: `['garaje', 'moto', 'motos', 'vehiculo', 'vehículo', 'soat', 'tecnomecanica', 'tecnomecánica', 'mantenimiento', 'kilometraje']`
       - `response`: `'En tu Garaje Digital puedes registrar tus motos (hasta 1 en el plan gratuito y hasta 5 en Convoy Pro / Biker Club), llevar el control de kilometraje y registrar las fechas de vencimiento de tu SOAT y revisión técnico-mecánica con alertas para mantener tus papeles al día.'`
   - Revisar que la función de normalización (`normalize`) procese adecuadamente acentos, mayúsculas y espacios.

---

### Tarea 5: Iconos Oficiales en Sección Contacto (`src/components/landing/LandingContact.tsx`)
1. **WhatsApp Oficial:**
   - Sustituir el emoji `💬` por el logotipo vectorial SVG oficial de WhatsApp.
   - Usar el color de marca oficial de WhatsApp (`#25D366`):
     - Fondo: `bg-[#25D366]/10` con icono en `text-[#25D366]` o botón/insignia `bg-[#25D366] text-white`.
     - SVG Path oficial de WhatsApp (burbuja de diálogo con teléfono).
2. **Correo Electrónico:**
   - Sustituir el emoji `📧` por un SVG nítido de sobre/email (estilo Lucide/Heroicons) con color `text-sky-500` y fondo `bg-sky-50`.
3. **Sede / Ubicación:**
   - Sustituir el emoji `📍` por un SVG nítido de pin de mapa (`text-amber-500` y fondo `bg-amber-50`).
4. Mantener los enlaces interactivos funcionales (`wa.me` con mensaje precargado y `mailto:`).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] Al deslizar hacia abajo en la Landing Page en dispositivos móviles, el navegador permite el pull-to-refresh nativo sin restricciones de `overscroll-behavior: none`.
- [ ] En `LandingStory.tsx`, los tres actos presentan un estándar visual fotográfico consistente y de alta gama, sin tarjetas blancas planas descontextualizadas.
- [ ] `LandingShowcase.tsx` reproduce con máxima fidelidad gráfica y funcional el Tablero/Cockpit real de la app (tacómetro circular con aguja, tarjeta de vehículo activo, métricas y los 4 botones de acción rápida con sus colores exactos).
- [ ] Al consultar al Asistente IA con preguntas como `"que es bike tracker"`, `"cómo funciona"` o `"hola"`, responde de inmediato con información rica, estructurada y sin disparar el fallback erróneo.
- [ ] En `LandingContact.tsx`, la tarjeta de WhatsApp exhibe el logo oficial con el color verde `#25D366`, y las demás tarjetas cuentan con iconos vectoriales SVG limpios y modernos.
- [ ] `npm run build` ejecuta limpiamente con cero errores de TypeScript o Vite.

---

## 5. [Restricciones Técnicas y Reglas de Calidad]
- No romper contratos de interfaces ni tipos en `src/types/index.ts`.
- Mantener compatibilidad total con Tailwind CSS y las variables del tema (`font-display`, `font-body`, `text-bike-ink`, `text-bike-orange`, etc.).
- Diseñado para máxima eficiencia de renderizado y cero advertencias en consola.
