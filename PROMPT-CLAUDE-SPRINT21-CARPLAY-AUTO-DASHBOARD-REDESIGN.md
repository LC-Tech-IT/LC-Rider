# 🏎️ SPRINT 21: Rediseño Premium de la Vista CarPlay / Android Auto en la Landing Page

## 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**. Tu misión en este Sprint 21 es transformar la "Vista CarPlay / Android Auto" de `LandingShowcase.tsx` para que pase de ser un panel oscuro simplificado con texto a ser una **maqueta automotriz de alta gama (TFT / Head-Up Display)** idéntica a una pantalla de tablero vehicular o CarPlay en moto, con telemetría en vivo, tacómetro, radar de convoy y navegación integrada.

---

## 2. [Objetivo Concreto y Alcance]
- **Archivo afectado:**
  - `src/components/landing/LandingShowcase.tsx`

---

## 3. [Instrucciones Paso a Paso / Tareas de Implementación]

### Rediseño de la Vista CarPlay / Android Auto (`CarPlayMockup`)
En `src/components/landing/LandingShowcase.tsx`, crear el componente `CarPlayMockup({ speed, members }: { speed: number; members: MemberRow[] })` y reemplazar el contenedor anterior por una interfaz automotriz panorámica (aspect ratio amplio estilo pantalla de 8" - 10"):

1. **Marco de Consola Automotriz:**
   - Contenedor apaisado con bordes suaves de pantalla vehicular (`rounded-3xl border-4 border-slate-800 bg-[#090D16] p-4 sm:p-6 shadow-2xl text-white`).
   - Barra superior / lateral estilo Apple CarPlay / Android Auto:
     - Hora actual (`10:42`), Señal celular (`5G`), Batería (`🔋 82%`).
     - Insignia de modo: `🏎️ CarPlay / Android Auto · Bike Tracker HUD`.
     - Dock rápido de aplicaciones automotrices a un costado o en esquina: `🗺️`, `📞`, `⚙️`.

2. **Diseño de Pantalla Dividida (Split-Screen Cockpit):**
   - **Panel Izquierdo — Telemetría y Tacómetro Vehicular:**
     - Tarjeta de vehículo activo: `Yamaha MT-09` con placa `RTX880`.
     - Tacómetro / Velocímetro digital de alto contraste con arco iluminado o aguja dinámica, lectura gigante de velocidad (`KM/H`), y límite de velocidad de la vía (`60 km/h`).
     - Métricas de viaje: `⏱️ 00:42 TIEMPO` y `📏 38.2 km DISTANCIA`.
   - **Panel Derecho — Convoy en Vivo y Navegación:**
     - Banner de navegación activa estilo Waze/CarPlay: `⬆️ Vía La Calera · Curva peligrosa a 300m`.
     - Lista del Convoy en tiempo real con estados claros:
       - 🟢 **Piloto 1 (Líder):** En Ruta · 95 km/h
       - 🟡 **Piloto 2 (Rezagado):** Alerta a 400m
       - 🟢 **Piloto 3 (Guardián):** En Ruta · 88 km/h
     - **Botonera Táctil para Guantes (Glove-Mode Buttons):**
       - Botón azul: `⛽ Gasolina`
       - Botón naranja: `⚠️ Peligro`
       - Botón verde: `🛑 Reagrupar`
       - Botón rojo de emergencia: `🆘 SOS`

3. **Adaptabilidad Responsiva:**
   - En pantallas móviles (donde el ancho es estrecho), la vista CarPlay debe apilarse o escalarse suavemente (`origin-top scale-[0.9] sm:scale-100` o layout flex-col en móvil y flex-row en sm/md) para que nunca se desborde horizontalmente ni rompa el ancho del dispositivo.

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] Al seleccionar la pestaña **"🏎️ Vista CarPlay / Android Auto"** en la Landing Page, se muestra una interfaz vehicular rica, panorámica y de aspecto profesional (con tacómetro, telemetría, estado del convoy y navegación).
- [ ] La velocidad y los datos del convoy se actualizan de forma animada cada 1.5 segundos simulando una rodada en vivo.
- [ ] La maqueta es 100% responsiva y se visualiza perfectamente tanto en smartphones como en monitores de escritorio.
- [ ] `npm run build` ejecuta limpiamente con 0 errores de TypeScript y Vite.

---

## 5. [Restricciones Técnicas y Reglas de Calidad]
- Reutilizar las constantes y estilos de color existentes (`status-ok`, `status-warning`, `status-danger`, `bike-blue`, `bike-orange`).
- No agregar dependencias externas innecesarias.
