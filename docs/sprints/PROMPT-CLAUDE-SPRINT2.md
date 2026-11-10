# 📋 PROMPT DE EJECUCIÓN: SPRINT 2 (Bike Tracker)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo es implementar en la aplicación **Bike Tracker** (React + TypeScript + Tailwind CSS) tres módulos críticos:
1. **Sistema de Internacionalización (i18n ES / EN) 100% funcional en todas las vistas.**
2. **Módulo de Registro / Login de Usuario (Google Sign-In + Registro Manual + Onboarding).**
3. **Módulo de Gestión de Vehículos con Formulario de Registro y Carga/Validación de Documentos (SOAT y Tecnomecánica).**

---

## 2. [Especificación Detallada de los 3 Módulos]

### Módulo A: Sistema de Internacionalización Completo (`src/utils/i18n.ts`)
- **Diccionario Exhaustivo (`src/utils/i18n.ts`):**
  - Exportar `translations: Record<'es' | 'en', Record<string, string>>` con todas las claves de texto de la aplicación:
    - **Navegación & Header:** Tablero/Dashboard, Navegación/Navigation, Garaje/Garage, Convoy, SOS, Vehículo Activo/Active Vehicle, Notificaciones/Notifications.
    - **Tablero:** Radar, Tiempo/Time, Distancia/Distance, Velocidad/Speed, Trazar Ruta/Plan Route, Ver Mapa/View Map.
    - **Mapa & Navegación:** Próxima Maniobra/Next Maneuver, Iniciar Rodada/Start Ride, Pausar/Pause, Finalizar Rodada/Finish Ride, Pilotos en Ruta/Riders en Route, Rezagado/Laggard, En Ruta/On Route, SOS Activo/Active SOS, Centrar en Mí/Center on Me, Ver Convoy/View Convoy.
    - **Garaje & Documentación:** Registrar Nuevo Vehículo/Add New Vehicle, Mis Vehículos/My Vehicles, SOAT al día/SOAT Up to Date, Próximo a Vencer/Expiring Soon, Vencido/Expired, Renovar Póliza/Renew Policy, Seleccionar para Rodar/Select for Ride, Eliminar/Delete, Documento Digital/Digital Document, Adjuntar Archivo/Attach File.
    - **Auth & Perfil:** Iniciar Sesión/Sign In, Crear Cuenta/Create Account, Continuar con Google/Continue with Google, Cerrar Sesión/Log Out, Piloto/Rider, Editar Perfil/Edit Profile, Correo/Email, Nombre/Name, Contraseña/Password.
    - **Convoy:** Crear Sala/Create Room, Unirse con PIN/Join with PIN, Rol/Role, Líder/Leader, Escoba/Sweeper, Piloto/Rider.
    - **SOS:** Emergencia/Emergency, Alerta SOS Activada/SOS Alert Activated, Mantener para Cancelar/Hold to Cancel.
- **Conexión Reactiva:**
  - En `AppContext.tsx`, actualizar la función `t(key)` para consumir este diccionario.
  - Al pulsar los botones **ES / EN** en `Sidebar.tsx` o `Header.tsx`, todos los componentes deben re-renderizarse en el nuevo idioma de inmediato.

---

### Módulo B: Autenticación, Registro y Onboarding (`AuthModal.tsx` & `Sidebar.tsx`)
- **Modelos de Datos (`src/types/index.ts`):**
  ```typescript
  export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
    isLoggedIn: boolean;
    authProvider: 'google' | 'email';
    registeredAt: number;
  }
  ```
- **Modal de Autenticación (`src/components/auth/AuthModal.tsx`):**
  - Botón principal con logo: **"Continuar con Google"** (inicia sesión inmediatamente creando un perfil con avatar de motero de alta resolución, nombre "Carlos Mendoza" y correo "carlos.biker@gmail.com").
  - Formulario alternativo con pestañas "Iniciar Sesión" / "Crear Cuenta": campos para Nombre, Correo, Contraseña y selector visual de avatares moteros.
  - Al autenticarse, guardar la sesión en `localStorage` y cerrar el modal.
- **Flujo de Onboarding:**
  - Si un usuario inicia sesión y su lista de vehículos en el garaje está vacía, mostrar una tarjeta/asistente de bienvenida:
    1. *"¡Bienvenido a Bike Tracker, [Nombre]!"*
    2. Botón *"🏍️ Registrar mi primera moto"* (abre automáticamente el modal de nuevo vehículo).
- **Sidebar & Perfil (`Sidebar.tsx`):**
  - Si hay sesión activa: mostrar foto de perfil, nombre, correo, botón "Editar Perfil" y botón "Cerrar Sesión" (vuelve al estado no logueado).
  - Si no hay sesión: mostrar botón "Iniciar Sesión / Registrarse" que abre `AuthModal.tsx`.

---

### Módulo C: Gestión de Vehículos y Validación de Documentos (`AddVehicleModal.tsx` & `GarageView.tsx`)
- **Formulario de Registro (`src/components/garage/AddVehicleModal.tsx`):**
  - **Placa:** Input con auto-mayúsculas (ej. `ABC12D` o `MCP412`).
  - **Tipo de Vehículo:** Selector visual (🏍️ Moto Deportiva / Calle, 🏜️ Trail / Enduro, 🚗 Carro de Apoyo).
  - **Marca y Modelo:** Inputs con botones de sugerencias rápidas (Yamaha MT-09, BMW R1250 GS, KTM Duke 390, Kawasaki Versys, Suzuki V-Strom, etc.).
  - **Color / Icono:** Selector de color distintivo para el marcador del mapa.
  - **Fechas de Vigencia:**
    - Input de Fecha para **Vencimiento de SOAT** (`YYYY-MM-DD`).
    - Input de Fecha para **Vencimiento de Revisión Tecnomecánica** (`YYYY-MM-DD`).
  - **Carga de Documento Digital (SOAT / Tecno):**
    - Zona de carga para adjuntar archivo digital (Foto JPG/PNG o PDF).
    - Al seleccionar un archivo, mostrar el nombre del archivo, tamaño y un badge verde: *"✓ Documento Digital Vinculado"*.
  - Al guardar: llama a `addVehicle(newVehicle)`, lo persiste en `localStorage` y lo selecciona como vehículo activo si el usuario lo marca.
- **Acciones en el Garaje (`src/components/garage/GarageView.tsx`):**
  - Botón prominente en la cabecera: **`➕ Registrar Nuevo Vehículo`**.
  - Tarjetas de vehículos con:
    - Semáforo de vigencia:
      - 🟢 **Al día:** Vence en más de 30 días.
      - 🟡 **Próximo a vencer:** Vence en 30 días o menos (indica días restantes).
      - 🔴 **Vencido:** Fecha anterior a hoy (indica días vencido y alerta).
    - Botón **"Elegir para Rodar"** (lo convierte en el vehículo activo).
    - Botón **"Renovar Póliza / Plan"** (abre modal de renovación).
    - Botón **"Eliminar"** (con confirmación).

---

## 3. [Archivos y Rutas Afectadas]
- `src/utils/i18n.ts` (Nuevo: Diccionario completo de traducciones ES / EN).
- `src/types/index.ts` (Actualizar interfaces: `UserProfile`, `Vehicle`, métodos en `AppContext`).
- `src/context/AppContext.tsx` (Gestión global de i18n, estado de usuario, persistencia en localStorage de vehículos y perfil, métodos `addVehicle`, `deleteVehicle`, `loginWithGoogle`, `loginManual`, `logout`, `authModalOpen`, `addVehicleModalOpen`).
- `src/components/auth/AuthModal.tsx` (Nuevo: Modal de autenticación con Google y registro).
- `src/components/garage/AddVehicleModal.tsx` (Nuevo: Modal interactivo para registrar motos y cargar SOAT/Tecno).
- `src/components/garage/GarageView.tsx` (Botón "+ Registrar", listado dinámico y eliminación).
- `src/components/common/Header.tsx` (Avatar del usuario logueado y traducciones).
- `src/components/common/Sidebar.tsx` (Perfil real, botón login/logout, selector ES/EN conectado a i18n).
- `src/components/cockpit/CockpitView.tsx` y `Speedometer.tsx` (Textos traducidos con `t()`).
- `src/components/map/ConvoyMap.tsx` y `TurnByTurnBanner.tsx` (Textos traducidos con `t()`).
- `src/components/convoy/ConvoyLobby.tsx` (Textos traducidos con `t()`).
- `src/components/emergency/SOSModal.tsx` (Textos traducidos con `t()`).
- `src/App.tsx` (Montaje de `AuthModal` y `AddVehicleModal`).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Multilenguaje Reactivo:** Al hacer clic en ES o EN, absolutamente todos los textos de la app (Tablero, Mapa, Garaje, Convoy, SOS, Modales y Sidebar) se traducen de inmediato sin recargar.
2. ✅ **Registro Completo de Vehículos:** El usuario puede registrar nuevos vehículos con placa, modelo, fechas de SOAT/Tecno y adjuntar archivo digital; el nuevo vehículo aparece en el Garaje y puede seleccionarse para la rodada.
3. ✅ **Autenticación & Onboarding:** Funciona el inicio de sesión con Google (avatar y datos instantáneos) o registro manual, y si no hay vehículos se sugiere registrar el primero.
4. ✅ **Persistencia en LocalStorage:** Las motos agregadas, el vehículo seleccionado, el perfil de usuario y el idioma persisten al refrescar el navegador.
5. ✅ **Respuesta en Español:** Todo el reporte y explicación final de entrega deben estar en Español.
6. ✅ **Compilación Exitosa:** `tsc --noEmit` y `npm run build` pasan con 0 errores.
