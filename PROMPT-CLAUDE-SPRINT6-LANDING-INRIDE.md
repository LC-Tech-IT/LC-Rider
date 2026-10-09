# 📋 PROMPT DE EJECUCIÓN: SPRINT 6 (Landing Page de Alto Impacto, Telemetría ECG-Motor, Chatbot Guardrail & In-Ride Glove Mode)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu misión en este Sprint es implementar dos subsistemas clave para **Bike Tracker**:
1. **Landing Page de Captación y Conversión de Alto Rendimiento:** Una experiencia web inmersiva, emocional y altamente dinámica (inspirada en la fluidez e interacción de *SmokeStudio*), con intro interactiva de telemetría/latido motero (ECG con rugido de motor en Web Audio), storytelling visual sobre hermandad y seguridad en ruta, showcase de la app, precios accesibles y un **Chatbot Asistente con Guardrails estrictos de producto**.
2. **Modo Conducción / In-Ride Cockpit (Optimizado para Guantes & CarPlay/Android Auto):** Una interfaz ultra-contrastada con botones gigantes (*glove-friendly touch targets* de 64-80px) y acciones de un solo toque (*One-Tap Telemetry & Alert*) para pilotos en carretera.
3. **Navegación / Switcher de Vistas:** Permitir alternar fluidamente entre la **Landing Page** y la **Aplicación (App / Cockpit / Mapa / Garage)** mediante un acceso directo ("🚀 Abrir App" / "🌐 Ver Landing").

---

## 2. [Identidad Visual, Paleta y Filosofía de Diseño]

### A. Paleta de Colores Equilibrada (Dark Slate / LC Tech Branding)
- **Background Principal:** `#0B0F17` (Deep Dark Slate - asfalto nocturno con texturas sutiles, no negro puro ciego).
- **Surface / Cards:** `#131C2E` / `#1E293B` con bordes sutiles `rgba(255,255,255,0.08)` y efecto *Glassmorphism*.
- **Branding Header (LC Tech):** Cyan eléctrico `#06B6D4` / Azul Tech `#0284C7` con badge de fabricante "Powered by LC Tech".
- **Acentos Moteros:**
  - Naranja Asfalto / Advertencia Vial: `#F97316` / `#EA580C`
  - Verde Convoy Seguro / Telemetría OK: `#10B981`
  - Rojo Tacómetro / Alerta SOS: `#EF4444`
  - Amarillo Precaución / Rezagado: `#F59E0B`
- **Tipografía:**
  - Títulos y Métricas: `'Orbitron', sans-serif`
  - Textos y Narrativa: `'Inter', sans-serif`

---

## 3. [Especificación Técnica Detallada]

### MÓDULO 1: Landing Page Dinámica (`src/components/landing/LandingPage.tsx`)

#### 1. Hero Dinámico con "Pulso Vital de Carretera" (ECG + Sonido Motor)
- **Animación Telemetría ECG-Motor:** Un canvas/SVG interactivo que arranca simulando una línea de electrocardiograma que pulsa y se acelera progresivamente hasta convertirse en la silueta luminosa de una moto en carretera y tacómetro a altas RPM.
- **Efecto Sonoro Sintetizado (Web Audio API):**
  - Implementar un motor de sonido nativo con `AudioContext` que sintetice el sonido de aceleración de motor de 4 cilindros / alto cilindraje al interactuar o hacer clic en "🔊 Acelerar Motor / Vivir la Experiencia" (sin requerir archivos externos pesados de audio).
  - Incluir control flotante de Mute/Unmute.
- **Titular Emocional de Alto Impacto:**
  - *Headline:* "Salimos juntos, rodamos juntos, volvemos todos."
  - *Subheadline:* "La app de telemetría y convoy en tiempo real diseñada por y para moteros. Sabe exactamente dónde y cómo está cada hermano de tu grupo sin tocar el teléfono."
  - *CTAs:* Botón principal "🔥 Iniciar Rodada Gratis" (abre la App / Registro) y botón secundario "🏍️ Ver Modo Conducción en Vivo".

#### 2. Sección "La Historia de Carretera" (Narrativa Visual Sin Saturación de Texto)
- 3 Tarjetas interactivas con micro-animaciones:
  1. **El Líder y la Escoba Conectados:** "Cero pérdidas en curvas y desvíos. Monitoreo visual de distancias y rezagados."
  2. **Alerta SOS y Parada Rápida en 1 Toque:** "Si alguien necesita gasolina, pincha o se rezaga, todo el grupo lo sabe al instante."
  3. **Sin Distracciones al Manillar:** "Diseñado para miradas de medio segundo y guantes de protección."

#### 3. Showcase Interactivo de la App en Acción
- Mockup dinámico interactivo con simulación de convoy en movimiento, mapa satelital simulado, velocímetro oscilando entre 70 y 110 km/h y lista de miembros en vivo ("Piloto 1: En Ruta - 95 km/h", "Piloto 2: Rezagado a 400m").
- Selector de modo: `[📱 Vista Móvil]` vs `[🏎️ Vista CarPlay / Android Auto]`.

#### 4. Precios Claros y Accesibles
- Tarjeta de Precio Único Transparente:
  - **Plan Piloto Libre:** $0 (Convoy de hasta 3 pilotos, SOS básico).
  - **Plan Convoy Pro (LC Tech Edition):** $2.99 USD / mes o $19.99 USD / año (Pilotos ilimitados, telemetría avanzada, historial de rutas GPX, alertas por voz en intercomunicador).

#### 5. Header Corporativo con Identidad LC Tech
- Logo **LC Tech** con isotipo de circuito/motor + texto "LC Tech - Engineering for Bikers".
- Botones de navegación interna (`Beneficios`, `Modo Ruta`, `Precios`, `Chat Asistente`).
- Botón destacado: **"🚀 Entrar a la App"**.

---

### MÓDULO 2: Chatbot Asistente con Guardrail Estricto (`src/components/landing/LandingChatbot.tsx`)

1. **Interfaz del Bot:**
   - Botón flotante en la esquina inferior derecha con badge "💬 Asistente Biker".
   - Ventana de chat desplegable estilizada en dark-slate con mensajes rápidos (chips de sugerencia: "¿Cómo funciona el Convoy?", "¿Qué precio tiene?", "¿Sirve con guantes?", "¿Tiene alerta SOS?").
2. **Motor de Respuestas & Guardrails de Seguridad:**
   - Crear un clasificador local de intenciones en `src/services/chatbotService.ts`:
     - **Intenciones de Producto Permitidas:** Preguntas sobre precios, convoy, compatibilidad CarPlay/Android Auto, guantes, batería, sin señal celular (modo offline/mesh futuro), registro y contacto con LC Tech.
     - **Guardrail de Seguridad / Fuera de Ámbito (Out of Scope):**
       - Si el mensaje contiene palabras clave relacionadas con crisis emocional, suicidio, salud mental, política, religión, o tareas no relacionadas con la app:
       - **Respuesta estándar obligatoria:**
         > "Soy el asistente oficial de **Bike Tracker (LC Tech)** y estoy capacitado exclusivamente para brindarte información sobre nuestra aplicación, planes y soporte técnico motero. Para consultas ajenas a nuestro producto o situaciones de apoyo personal, te sugerimos acudir a los canales y líneas de atención especializadas de tu región."
       - Si detecta palabras de auxilio vital, agrega una línea con teléfonos de emergencia generales (123 / 911).

---

### MÓDULO 3: In-Ride Glove Mode (Modo Conducción para Manillar & CarPlay)

Crear la vista optimizada `src/components/cockpit/InRideGloveMode.tsx`:
1. **Targets Táctiles Gigantes (Glove-Friendly):**
   - Botones de mínimo **70px x 70px** con áreas de toque ampliadas y retroalimentación háptica/visual instantánea.
2. **Acciones Rápidas de Un Toque (*One-Tap Telemetry*):**
   - ⛽ **"Parada Gasolina":** Notifica al convoy que necesitas repostar.
   - ⚠️ **"Peligro en Vía":** Alerta de hueco, aceite o obstáculo en ruta.
   - 🛑 **"Reagrupación / Detenerse":** Solicita pausa al líder.
   - 🆘 **"SOS Emergencia":** Botón de impacto alto (pulsación de 1.5 segundos con barra de progreso circular para evitar falsos positivos).
3. **Display de Alta Visibilidad:**
   - Velocidad actual en dígitos enormes (fuente `Orbitron` 64px).
   - Estado del convoy a 1 vistazo: Número de pilotos conectados, distancia al líder y distancia al escoba.
   - Switch de orientación y modo nocturno de alto contraste.

---

### MÓDULO 4: Enrutamiento y Switcher Global (`src/App.tsx`)

1. Actualizar el estado global en `src/context/AppContext.tsx` o `App.tsx` para soportar la navegación entre la Landing Page y la Aplicación:
   - Nueva vista: `'landing'` agregada a las vistas de la app o controlada por un flag/botón.
   - Si el usuario no ha iniciado sesión o pulsa "Ver Landing", se muestra la **Landing Page**.
   - En la Landing Page, pulsar "🚀 Abrir App" o "Iniciar Sesión" redirige a la experiencia de la app.
   - En el Header de la App o en el Sidebar, agregar un botón "🌐 Ver Landing Page / Web Oficial" para regresar en cualquier momento.

---

## 4. [Archivos y Rutas a Crear / Modificar]

1. `src/services/soundService.ts` — Sintetizador Web Audio API para rugido de aceleración y pulsos de telemetría.
2. `src/services/chatbotService.ts` — Lógica de respuestas inteligentes del producto y guardrails de seguridad.
3. `src/components/landing/LandingPage.tsx` — Componente principal de la Landing Page.
4. `src/components/landing/LandingHeroECG.tsx` — Animación interactiva de telemetría ECG a silueta motera con sonido.
5. `src/components/landing/LandingChatbot.tsx` — Widget de chat interactivo con guardrails.
6. `src/components/landing/LandingShowcase.tsx` — Preview interactivo de la app en celular / CarPlay.
7. `src/components/landing/LandingPricing.tsx` — Tabla de precios y planes.
8. `src/components/cockpit/InRideGloveMode.tsx` — Vista de ruta optimizada para uso con guantes y CarPlay.
9. `src/components/common/Header.tsx` / `Sidebar.tsx` — Enlaces de navegación rápida hacia Landing y Modo Guantes.
10. `src/App.tsx` — Integración del switcher entre Landing Page y App.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]

1. ✅ **Landing Page Completa y Responsiva:** Se visualiza impecable en pantallas móviles, tablets y monitores de escritorio.
2. ✅ **Animación ECG-Motor & Audio Interactivo:** La animación de telemetría funciona fluidamente y el botón de aceleración reproduce el rugido del motor mediante Web Audio API sin errores.
3. ✅ **Chatbot con Guardrails:** Responde con precisión a dudas del producto y bloquea educadamente temas ajenos (salud mental, política, etc.) con el mensaje predefinido.
4. ✅ **In-Ride Glove Mode Operativo:** Los botones de acción rápida son de gran escala (mínimo 70px) y permiten activar alertas de gasolina, peligro y SOS de forma inmediata.
5. ✅ **Transición Fluida:** Se puede navegar sin problemas entre la Landing Page y el Cockpit de la App.
6. ✅ **Compilación y Tipos:** `npm run build` y `tsc --noEmit` pasan con **0 errores**.
7. ✅ **Reporte en Español:** La respuesta y el resumen de entrega deben ser en Español.
