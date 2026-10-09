# 📋 PROMPT DE EJECUCIÓN: SPRINT 4 (Autenticación Real, Cuentas Aisladas y Onboarding Limpio)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo es corregir y perfeccionar el sistema de autenticación de **Bike Tracker** (React + TypeScript + Tailwind CSS) para que funcione con **cuentas reales**, **almacenamiento aislado por usuario** y **Google Sign-In interactivo**, eliminando cualquier dato quemado por defecto.

---

## 2. [Diagnóstico y Problemas a Resolver]
1. ❌ **Google Sign-In quemaba a "Carlos Mendoza":** Al hacer clic en "Continuar con Google", logueaba automáticamente una cuenta estática en lugar de solicitar la cuenta real del usuario.
2. ❌ **Cuentas nuevas heredaban vehículos demo:** Cuando un usuario nuevo se registraba (ej. `lee.fesna@gmail.com`), el garaje heredaba los vehículos demo (`Toyota MCP412`) en lugar de arrancar con su garaje vacío (`vehicles = []`).
3. ❌ **Falta de persistencia multi-cuenta:** No existía aislamiento de garaje entre diferentes usuarios.

---

## 3. [Especificación Técnica de la Solución]

### A. Sistema Multi-Cuenta Aislado (`src/context/AppContext.tsx` & `src/utils/storage.ts`)
- Implementar en `localStorage` una estructura de base de datos local por correo:
  ```typescript
  export interface UserAccountData {
    user: UserProfile;
    vehicles: Vehicle[];
    activeVehicleId: string;
  }
  ```
- **Al Registrarse o Iniciar Sesión (Google o Correo):**
  - Buscar la cuenta por `email` (en minúsculas).
  - **Si es un usuario nuevo:**
    - Crear su perfil con sus datos reales (nombre, email, avatar).
    - Inicializar su garaje completamente vacío: `vehicles = []` y `activeVehicleId = ''`.
    - **Resultado inmediato:** Como `vehicles.length === 0`, la app muestra automáticamente el **OnboardingWizard** para que registre su primera moto.
  - **Si es un usuario existente:**
    - Cargar exclusivamente sus motos y su vehículo activo previamente guardados.
- **Modo Demo Exclusivo (`loginDemo`):**
  - Solo si el usuario pulsa *"Entrar en Modo Demo"*, se carga la cuenta `demo@biketracker.app` con los 3 vehículos de prueba (`MCP412`, etc.).

---

### B. Modal Interactivo de Google Sign-In (`src/components/auth/GoogleAuthModal.tsx` o dentro de `AuthModal.tsx`)
- Al hacer clic en **"Continuar con Google"**:
  - Abrir un modal con diseño oficial de Google Sign-In:
    - Campo para ingresar la cuenta de Google: Correo Gmail (ej. `usuario@gmail.com`) con validación.
    - Campo para Nombre completo del piloto (autocompleta una sugerencia basada en el correo).
    - Selector de foto/avatar de cuenta Google o avatar motero.
    - Botón: **`Continuar con Google`**.
  - Al confirmar:
    - Ejecuta el login con `authProvider: 'google'`, su correo real y su nombre real.
    - Si es la primera vez que ingresa ese correo, arranca con `vehicles = []` y abre el Onboarding para registrar su propia moto.

---

### C. Formulario de Registro Manual con Correo
- En la pestaña "Crear Cuenta" de `AuthModal.tsx`:
  - Solicita Nombre, Correo real, Contraseña y selección de Avatar.
  - Al pulsar "Crear Cuenta", registra al usuario con garaje vacío y lo envía al Onboarding para ingresar los datos de su vehículo.

---

### D. Cierre de Sesión Limpio (`logout`)
- Al pulsar **"Cerrar Sesión"** en el `Sidebar.tsx`:
  - Limpiar el usuario activo, vaciar el estado en memoria de vehículos y redirigir inmediatamente a `WelcomeAuthScreen`.

---

## 4. [Archivos y Rutas Afectadas]
- `src/types/index.ts` (Modelos de cuentas de usuario y métodos de autenticación).
- `src/utils/storage.ts` (Funciones para guardar/cargar cuentas por email: `getAccount(email)`, `saveAccount(account)`).
- `src/context/AppContext.tsx` (Lógica de autenticación multi-cuenta, Google Sign-In interactivo, aislamiento de garaje y reseteo en logout).
- `src/components/auth/AuthModal.tsx` (Integrar flujo interactivo para Google Sign-In con ingreso de correo/nombre real + registro manual).
- `src/components/auth/WelcomeAuthScreen.tsx` (Botón de Google que abre el selector/modal de cuenta de Google).
- `src/components/auth/OnboardingWizard.tsx` (Garantizar que al guardar la primera moto, se vincule a la cuenta activa).
- `src/utils/i18n.ts` (Traducciones para el modal de Google y flujos de cuentas).

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Google Sign-In Interactivo:** Al pulsar "Continuar con Google", el usuario ingresa su propio correo (ej. `lee.fesna@gmail.com`) y nombre real; no existe ningún "Carlos Mendoza" precargado.
2. ✅ **Garaje Vacío en Cuentas Nuevas:** Toda cuenta recién creada inicia con 0 vehículos y pasa inmediatamente por el Onboarding para registrar su propia motocicleta con su placa real.
3. ✅ **Aislamiento Multi-Cuenta:** Si se cierra sesión y se entra con otra cuenta, cada usuario ve únicamente sus propios vehículos y documentos guardados.
4. ✅ **Compilación Exitosa:** `tsc --noEmit` y `npm run build` pasan con 0 errores.
5. ✅ **Respuesta en Español:** Todo el reporte y explicación final deben estar en Español.
