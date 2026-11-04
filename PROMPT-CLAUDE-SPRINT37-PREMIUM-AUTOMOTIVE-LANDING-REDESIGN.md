# 📋 PROMPT DE EJECUCIÓN: SPRINT 37 (Rediseño Premium Automotriz de la Landing Page & Corrección Tipográfica de Alta Gama)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC SyncTech)**.
Actúas bajo la dirección de arte y experiencia de marca de un equipo de diseño senior de clase mundial para automoción y motociclismo de alto rendimiento (al nivel de **BMW Motorrad, Ducati, Garmin Tread, Cardo Systems y Apple**).
La landing page actual presenta problemas críticos de percepción de marca: parece una plantilla SaaS genérica de inteligencia artificial (fondos claros planos, emojis infantiles como iconos, tarjetas flotantes con sombras difusas, botones píldora saturados) y tiene un **error tipográfico urgente en producción**: las letras del titular del Hero y de la cabecera están físicamente amontonadas y colisionando debido al uso forzado de la fuente `Orbitron` con `tracking-tight` y `font-black` en oraciones largas.
Tu misión en este Sprint 37 es refundar la experiencia visual de la Landing Page para convertirla en el **sistema de referencia indiscutible para rodar en grupo con seguridad**, corrigiendo la tipografía con un estándar editorial impecable y adoptando un diseño *Dark Obsidian Automotive Luxury* con micro-detalles de precisión técnica.

---

## 2. [Objetivo Concreto y Alcance]
1. **Corrección Urgente del Colapso Tipográfico (Cabecera y Titular):**
   - **En la cabecera (`LandingPage.tsx`):** Eliminar la aglomeración de texto. El título de la marca debe usar tipografía sans-serif limpia (`font-sans font-extrabold tracking-tight text-white`), separando con holgura el isotipo y el badge de fabricante (`LC SyncTech`). Retirar el eslogan largo de la cabecera móvil/escritorio para dar aire total al navbar.
   - **En el Titular del Hero:** Sustituir radicalmente `font-display` (Orbitron) en el titular por **`font-sans` (Inter) con peso `font-black` y `tracking-tight` (o `tracking-normal`)**, estructurado en 3 líneas de impacto editorial con interlineado holgado (`leading-[1.1]` a `leading-[1.15]`):
     * *Línea 1:* Salimos juntos.
     * *Línea 2:* Rodamos juntos.
     * *Línea 3 (Gradiente Titanio/Ámbar de precisión):* Volvemos todos a casa.
2. **Transformación a Estética Automotriz Premium (*Dark Obsidian & Titanium*):**
   - Migrar el lienzo general de la Landing (`LandingPage.tsx`) de fondo blanco/gris plano (`#F1F5F9`) a una paleta oscura cinematográfica:
     * Fondo maestro: Carbón Asfalto / Deep Obsidian (`#070A10`).
     * Superficies y paneles: `bg-slate-900/60` con bordes milimétricos en hairline slate (`border-white/[0.08]`).
     * Acento: Naranja de precisión vial (`#FF5500` / `#F97316`) y ámbar de advertencia utilizados con sobria disciplina técnica.
     * Tipografía: `Inter` de alto contraste blanco/gris grafito para lectura, reservando `Orbitron` únicamente para lecturas numéricas de telemetría (odómetro, RPM, velocidad).
3. **Eliminación Total de Componentes "Plantilla IA":**
   - Erradicar el uso de emojis decorativos como iconos en botones e insignias (retirar `⚡`, `🔥`, `🤝`, `🏍️`, `🏎️`, `📲`, `🔑`).
   - Reemplazarlos por **iconos vectoriales SVG limpios, sutiles y elegantes** (estilo Garmin / Lucide / Heroicons).
   - Eliminar tarjetas genéricas flotantes con sombras de color exageradas (`shadow-glow-orange`). Adoptar biseles de ingeniería automotriz inspirados en pantallas TFT de motos de aventura (BMW GS, Ducati Multistrada).
4. **Integración Armónica del Instrument Cluster (Tacómetro + Maqueta):**
   - En lugar de tener el tacómetro flotando como un widget aislado e inconexo sobre una página blanca, integrarlo dentro de un marco de instrumentación vehicular de alta gama en el Hero, transmitiendo telemetría real en vivo.
5. **Storytelling en 5 Actos de la Hermandad Motera (`LandingStory.tsx`):**
   - Refactorizar las secciones de historia en una narrativa visual fluida y madura:
     * *01. El Garaje & Preparación:* Flota y documentos al día (SOAT/Tecno).
     * *02. El Convoy en Formación:* Líder abre paso, Guardián cuida la retaguardia.
     * *03. En Curva (High Speed Telemetry):* HUD de visibilidad total con sol de frente y alertas de voz Bluetooth directo al casco.
     * *04. El Escudo de Carretera:* Detección milimétrica de rezagados y botón SOS satelital.
     * *05. El Regreso Seguro:* La promesa cumplida de la rodada.
6. **Afinamiento de Planes y Precios (`LandingPricing.tsx`):**
   - Rediseñar los 3 niveles (Piloto Libre, Convoy Pro, Biker Club) con acabados oscuros titanio, tipografía legible y jerarquía nítida donde el Plan Pro destaque con sutileza premium sin estridencias.
7. **Compilación y Cero Errores:**
   - Validar compilación limpia mediante `npm run build`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingPage.tsx` (Lienzo global dark, cabecera desahogada sin colisión, Hero editorial de alto impacto y footer corporativo).
- `src/components/landing/LandingStory.tsx` (Storytelling fotográfico y técnico con estética dark automotive).
- `src/components/landing/LandingShowcase.tsx` (Consolidación del cockpit HUD automotriz y radar).
- `src/components/landing/LandingPricing.tsx` (Tarjetas en Dark Titanium con bordes `border-white/10`).
- `src/components/landing/LandingContact.tsx` (Formulario y tarjetas de contacto estilizadas en modo oscuro).
- `src/components/landing/LandingHeroTachometer.tsx` (Alineación cromática y bisel con el cluster automotriz).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Paso 1: Rediseñar la Cabecera (`src/components/landing/LandingPage.tsx`)
1. Cambiar el contenedor del header para adoptar el cristal oscuro:
   `className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#070A10]/85 backdrop-blur-md"`
2. **Corregir el amontonamiento de la marca:**
   ```tsx
   <div className="flex items-center gap-3">
     <img
       src="/images/app-icon.jpg"
       alt="Bike Tracker"
       className="h-10 w-10 rounded-xl border border-white/10 object-cover shadow-md"
     />
     <div className="flex flex-col">
       <div className="flex items-center gap-2">
         <span className="font-sans text-base font-extrabold tracking-tight text-white">Bike Tracker</span>
         <span className="hidden sm:inline-block rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
           Telemetry
         </span>
       </div>
       <span className="text-[11px] font-medium text-slate-400">
         por <span className="font-semibold text-slate-200">LC SyncTech</span>
       </span>
     </div>
   </div>
   ```
   *(Observa que se retira el eslogan largo "· Tecnología inteligente que te respalda" de la pequeña barra superior para evitar que colapse con los botones o se parta en 3 renglones feos).*
3. Estilizar la navegación central:
   - Textos: `text-xs uppercase tracking-wider font-semibold text-slate-400 hover:text-white transition-colors`.
4. Botón de acción en el header:
   - Reemplazar el botón con emojis por un botón sobrio:
     `className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-500 active:scale-95 shadow-sm"`
     Texto: `{user?.isLoggedIn ? 'Mi Tablero' : 'Iniciar Sesión'}`.

### Paso 2: Rediseñar el Hero Section (`LandingPage.tsx`)
1. Fondo y ambientación del Hero:
   - Contenedor con fondo `#070A10` y una sutil iluminación radial superior (`bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/20 via-[#070A10] to-[#070A10]`).
2. Badge de categoría:
   ```tsx
   <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-400">
     <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
     Sistema de Telemetría &amp; Navegación Grupal
   </div>
   ```
3. **Corregir el Titular para eliminar el colapso de letras:**
   ```tsx
   <h1 className="mt-6 font-sans text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl lg:leading-[1.08]">
     Salimos juntos.<br />
     Rodamos juntos.<br />
     <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-300 bg-clip-text text-transparent">
       Volvemos todos a casa.
     </span>
   </h1>
   ```
4. Subtítulo:
   ```tsx
   <p className="mx-auto mt-6 max-w-2xl text-base text-slate-400 sm:text-lg leading-relaxed font-normal">
     La plataforma de telemetría de alta disponibilidad diseñada por y para motociclistas.
     Conecta al líder, al piloto guardián y al convoy en tiempo real con cero distracción en el manillar.
   </p>
   ```
5. Botones de Acción (Llamados a la Acción):
   - Botón Primario:
     `className="w-full sm:w-auto rounded-xl bg-orange-600 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500 active:scale-95 shadow-lg shadow-orange-900/30"`
     Texto: `Iniciar Rodada Gratis` (sin emojis).
   - Botón Secundario:
     `className="w-full sm:w-auto rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white active:scale-95"`
     Texto: `Ver Planes y Precios`.
6. Barra de Métricas y Confianza de Grado Automotriz:
   Bajo los botones, incluir una franja sutil con 4 indicadores de ingeniería:
   - `11.8M+` Parque de motocicletas
   - `99.9%` Uptime Cloudflare Global Edge
   - `100%` Compatible Intercomunicadores Bluetooth
   - `Zero` Distracción táctil en ruta

### Paso 3: Integrar el Instrument Cluster en el Hero
1. Revestir el bloque del tacómetro (`LandingHeroTachometer.tsx`) y la fotografía de carretera (`convoy-journey.jpg`) dentro de un marco automotriz unificado con bordes en `border-white/10` y fondo `bg-slate-900/50 backdrop-blur`.
2. El tacómetro debe tener dial en fondo oscuro de precisión automotriz, agujas contrastadas y tipografía tabular nítida.

### Paso 4: Rediseñar el Storytelling (`LandingStory.tsx`)
1. Actualizar el fondo de la sección a fondo oscuro continuo (`bg-[#070A10]`).
2. Títulos de sección en tipografía `font-sans font-extrabold text-white` con subtítulos descriptivos en `text-slate-400`.
3. Fotografías (`friends-viewpoint.jpg`, `cockpit-view.jpg`, `safety-features-bg.jpg`) con bordes en `border-white/10`, esquinas `rounded-2xl` y micro-etiquetas técnicas con iconos SVG vectoriales en lugar de emojis.
4. En el Acto de Seguridad, reemplazar los chips con emojis por callouts técnicos:
   - *Telemetría Satelital en Vivo* (Icono de antena/onda).
   - *Botón SOS de un Toque* (Icono de escudo/círculo de auxilio).
   - *Aviso de Parada de Gasolina* (Icono de combustible limpio).
   - *Alerta de Peligro en Vía* (Icono de advertencia vial).

### Paso 5: Rediseñar la Maqueta Automotriz HUD (`LandingShowcase.tsx`)
1. Asegurar que el marco de CarPlay / HUD se fusione armoniosamente con la atmósfera de la página:
   - Bisel exterior con textura de fibra de carbono o aluminio oscuro (`border border-white/10 bg-[#090D16]`).
   - Mantener el radar, el tacómetro y el status de miembros del convoy con tipografía tabular perfecta (`tabular-nums font-mono` para velocidades y distancias).

### Paso 6: Rediseñar los Planes de Suscripción (`LandingPricing.tsx`)
1. Contenedor en fondo oscuro con iluminación tenue de acento.
2. Selector de ciclo de facturación (Mensual / Anual con ahorro del 33%):
   - `rounded-xl border border-white/10 bg-white/5 p-1`.
3. Las 3 tarjetas de planes:
   - Fondo: `bg-slate-900/60 border border-white/10 rounded-2xl p-7 flex flex-col justify-between`.
   - **Plan Convoy Pro (Recomendado):** Borde sutil ámbar/naranja `border-orange-500/50 shadow-2xl shadow-orange-950/20` con etiqueta superior sobria `MÁS POPULAR`.
   - Precios destacados en números grandes y blancos con `/mes` o `/año` en gris fino.
   - Lista de beneficios con checks vectoriales SVG verdes/naranjas sin emojis.
   - Botones de acción alineados al fondo de cada tarjeta.

### Paso 7: Rediseñar Contacto y Pie de Página (`LandingContact.tsx` y `LandingPage.tsx`)
1. Formulario de contacto en `bg-slate-900/60 border border-white/10 rounded-2xl text-white`.
   - Inputs con fondo `bg-slate-950/80 border border-white/10 text-white placeholder:text-slate-500`.
   - Botón de envío: `bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl py-3.5`.
2. Footer:
   - Texto de copyright: `© 2026 LC SyncTech · Tecnología inteligente que te respalda. Todos los derechos reservados.`
   - Enlace a `contacto@lcsynctech.com` y WhatsApp corporativo con iconos SVG sutiles.
   - Enlace directo a `Política de Tratamiento de Datos (Ley 1581)`.

### Paso 8: Verificación de Build
Ejecutar la compilación de producción:
```bash
npm run build
```
Asegurar que finalice con cero errores de TypeScript y empaque todos los módulos en `dist/`.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] El titular del Hero *"Salimos juntos, rodamos juntos, volvemos todos juntos a casa"* NO usa Orbitron con tracking tight; utiliza `font-sans` (Inter) `font-black` y no tiene colisiones de letras.
- [ ] La cabecera superior tiene espacio holgado: el logo y texto de LC SyncTech no están apretados ni se amontonan con el menú.
- [ ] Se eliminaron los emojis decorativos infantiles en botones y encabezados, reemplazándolos por iconos vectoriales SVG de alta precisión.
- [ ] La landing page posee una atmósfera automotriz oscura de alta gama (Dark Obsidian `#070A10`), comparable visualmente a BMW Motorrad o Ducati.
- [ ] Todos los botones de contacto, inicio de rodada, login y Wompi conservan su funcionalidad técnica intacta.
- [ ] `npm run build` compila con éxito (código de salida 0).

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No romper las rutas de imágenes existentes (`/images/app-icon.jpg`, `/images/convoy-journey.jpg`, `/images/friends-viewpoint.jpg`, `/images/cockpit-view.jpg`, etc.).
- Mantener las funciones de autenticación y modales de Wompi / Privacidad (`setTopLevelMode`, `setAuthModalOpen`, `setInstallModalOpen`).
- Mantener el idioma de las respuestas y comentarios en **Español**.

