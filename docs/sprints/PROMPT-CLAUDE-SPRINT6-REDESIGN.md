# 📋 PROMPT DE EJECUCIÓN: SPRINT 6 (Rediseño Visual de la Landing Page, Storytelling de Carretera, ECG Realista y Unificación Estética)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo es realizar un **rediseño estético y emocional completo de la Landing Page** de **Bike Tracker**, resolviendo las observaciones del Stakeholder:
1. **Unificación de Diseño y Paleta Clara:** La Landing Page debe compartir exactamente la misma paleta luminosa y moderna de la App (`#F1F5F9`, `#F8FAFC`, `#FFFFFF`, `#E2E8F0`, `#0F172A`, `#F97316`), eliminando el fondo oscuro monótono anterior.
2. **Storytelling Visual de Carretera (Emoción, Camaradería y Seguridad):** Usar las imágenes fotográficas reales ya disponibles en `public/images/` para narrar la historia de salir a rodar con amigos, disfrutar el viaje y garantizar que todos regresen seguros y a tiempo.
3. **Línea de Vida (ECG) Realista:** Reemplazar las ondas rápidas repetitivas por un monitor cardíaco auténtico: línea recta/base plana con latidos periódicos naturales (ritmo P-Q-R-S-T) que solo acelera al pulsar el botón de motor.
4. **Header con Identidad de Fabricante (LC Tech):** Renderizar el logo real de `public/images/lc-tech-logo.jpeg` destacando a **LC Tech** como el fabricante creador, y a **Bike Tracker** como el producto.
5. **Acceso Inmediato a la App:** Botón siempre visible para alternar directamente entre la Landing Page y la App (la cual permanece 100% intacta con todas sus funciones previas y el Modo Conducción / In-Ride).

---

## 2. [Recursos Multimedia Disponibles en `public/images/`]

Ya se encuentran copiadas y listas para usar en `public/images/`:
- `/images/lc-tech-logo.jpeg` — Monograma e isotipo corporativo de **LC Tech** (Fabricante).
- `/images/convoy-journey.jpg` — Fotografía cinematográfica de un convoy de moteros rodando en curvas de montaña al atardecer.
- `/images/friends-viewpoint.jpg` — Grupo de amigos moteros riendo y compartiendo un café en un mirador con sus motos.
- `/images/cockpit-view.jpg` — Vista en primera persona (POV) del manillar con guantes de moto, ruta despejada y tablero.

---

## 3. [Especificación de Componentes a Rediseñar]

### A. Paleta de Colores & Tokens Unificados (Luz, Asfalto y Titanio)
- **Fondo Global de la Landing:** `#F1F5F9` (Slate 100) con acentos `#F8FAFC`.
- **Paneles y Tarjetas:** `#FFFFFF` con sombras suaves `box-shadow: 0 4px 20px -2px rgba(15,23,42,0.08)`, bordes en `#E2E8F0` y esquinas redondeadas `rounded-2xl` o `rounded-3xl`.
- **Tipografía y Textos:**
  - Títulos: `'Orbitron', sans-serif` en color `#0F172A` (Slate 900 profundo).
  - Párrafos y descripciones: `'Inter', sans-serif` en `#334155` y `#475569`.
- **Acentos de Marca:** Naranja ruta `#F97316` / `#EA580C`, Azul convoy `#0284C7`, Verde seguro `#16A34A` y toques dorados LC Tech `#D4AF37`.

---

### B. Header Corporativo (`src/components/landing/LandingHeader.tsx` o dentro de `LandingPage.tsx`)
- **Logo del Fabricante:** Mostrar la imagen real `/images/lc-tech-logo.jpeg` (con altura `h-10 w-10` redondeada `rounded-xl` con sutil borde dorado) acompañada de:
  - **LC TECH** (Título corporativo con badge: *"Fabricante & Hardware"* o *"Powered by LC Tech"*).
  - Separador vertical sutil y el nombre del producto: **Bike Tracker**.
- **Navegación:** Enlaces a `La Experiencia`, `El Convoy`, `Planes`, `Asistente AI`.
- **Botón de Conversión Destacado:** **`🚀 Abrir Aplicación`** (con estilo `bg-bike-orange text-white font-bold px-5 py-2.5 rounded-xl shadow-glow-orange hover:bg-bike-orangeDark transition`).

---

### C. Hero Section con "Pulso de Carretera" & Fotografía (`src/components/landing/LandingHero.tsx`)
1. **Titular Emocional & Potente:**
   - **Badge:** *"⚡ LA LIBERTAD DE RODAR CON TRANQUILIDAD"*
   - **Título Principal:** *"Salimos juntos, rodamos juntos, volvemos todos a casa."*
   - **Subtítulo:** *"Diseñada por y para moteros. La plataforma que conecta al líder, a la escoba y a cada piloto en tiempo real para que nadie se quede atrás ni pierda la ruta."*
   - **Botones de Acción:** `🔥 Iniciar Rodada Gratis` y `🏍️ Probar Modo Conducción`.
2. **Monitor de Telemetría Cardíaca (ECG Realista):**
   - Rediseñar el componente del ECG en `src/components/landing/LandingHeroECG.tsx`:
   - Fondo estilo panel de telemetría claro con cuadrícula médica sutil (`#F8FAFC` con borde `#E2E8F0`).
   - La línea debe ser **plana y horizontal** en su estado base, y emitir un **latido auténtico P-Q-R-S-T** suave y periódico cada 1.2 segundos (representando el pulso en reposo del piloto).
   - Botón interactivo **`🔊 Acelerar Motor`**: Al pulsarlo, el trazo cambia temporalmente a color naranja/dorado, el pulso cardíaco se acelera a ritmo de adrenalina y reproduce el sonido del motor sintetizado mediante Web Audio API en `soundService.ts`.
3. **Composición Visual:** Acompañar el Hero con la imagen `/images/convoy-journey.jpg` integrada con bordes redondeados y reflejos luminosos.

---

### D. Sección de Storytelling "La Verdadera Experiencia de Rodar" (`LandingStory.tsx` o en `LandingPage.tsx`)
Estructurar la narrativa visual en 3 actos con las fotografías reales:
1. **Acto 1: La Hermandad de la Carretera**
   - Imagen: `/images/friends-viewpoint.jpg`
   - Mensaje: *"Lo mejor de la ruta no es solo llegar, sino con quién la compartes. Cada parada, cada café y cada curva se disfrutan el doble cuando sabes que tu grupo está completo y a tiempo."*
2. **Acto 2: Cero Preocupaciones al Manillar**
   - Imagen: `/images/cockpit-view.jpg`
   - Mensaje: *"Tus ojos deben estar en la carretera. Bike Tracker te avisa si alguien se rezaga o necesita asistencia con alertas visuales de gran formato y avisos por intercomunicador."*
3. **Acto 3: Seguridad y Respaldo Inmediato**
   - Tarjeta con telemetría en vivo, alerta SOS de un toque y control de paradas de gasolina y peligros en vía.

---

### E. Showcase Dinámico, Planes y Chatbot
1. **Showcase de la App:** Tarjeta interactiva clara que muestra cómo se ve la app funcionando en el móvil y en pantalla de ruta.
2. **Planes Transparentes:** Plan Gratuito ($0) y Plan Convoy Pro LC Tech ($2.99/mes o $19.99/año).
3. **Chatbot Asistente con Guardrails:** Mantener el widget flotante con su clasificador de respuestas de producto y restricción de temas ajenos (salud mental/política con el mensaje de soporte oficial).

---

### F. Enrutamiento y Conmutación Fluida (`src/App.tsx` & `src/context/AppContext.tsx`)
- Asegurar que el usuario pueda alternar libremente entre la **Landing Page** y la **App completa** (`view === 'cockpit' | 'map' | 'garage' | 'convoy' | 'in-ride'`).
- En la Landing Page, pulsar *"🚀 Abrir Aplicación"* pasa inmediatamente a la App.
- En la App, el botón *"🌐 Ver Landing / Web"* en el Header y Sidebar permite regresar a la Landing Page.

---

## 4. [Archivos a Modificar / Crear]
- `src/components/landing/LandingPage.tsx` (Estructura general con la nueva paleta clara y layout narrativo).
- `src/components/landing/LandingHeroECG.tsx` (Línea de ECG realista plana con latidos periódicos pausados).
- `src/components/landing/LandingStory.tsx` o secciones internas (Integración de las imágenes `/images/convoy-journey.jpg`, `/images/friends-viewpoint.jpg`, `/images/cockpit-view.jpg`).
- `src/components/landing/LandingShowcase.tsx` y `LandingPricing.tsx` (Adaptación a la paleta clara).
- `src/components/common/Header.tsx` (Asegurar navegación fluida y logo).
- `src/App.tsx` (Navegación e integridad del flujo de la aplicación).

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Paleta Clara Unificada:** La Landing Page y la App comparten la misma línea estética en tonos claros, limpios y modernos (`#F1F5F9`, `#FFFFFF`, `#0F172A`, `#F97316`).
2. ✅ **Storytelling con Imágenes Reales:** Se renderizan correctamente las imágenes de `public/images/` transmitiendo la emoción, hermandad y seguridad en ruta.
3. ✅ **ECG Realista:** La línea de vida avanza plana con latidos P-Q-R-S-T pausados y solo acelera armónicamente al presionar el acelerador.
4. ✅ **Logo Real de LC Tech:** Se muestra el logo `/images/lc-tech-logo.jpeg` acreditando a LC Tech como fabricante.
5. ✅ **App 100% Funcional e Intacta:** Todas las funciones previas (garaje, cockpit, mapas, SOAT, login) y el Modo In-Ride siguen operativas y accesibles con un solo clic.
6. ✅ **Compilación Limpia:** `npm run build` y `tsc --noEmit` pasan sin errores.
7. ✅ **Reporte en Español:** Resumen de cambios entregado en Español.
