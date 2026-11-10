# 📋 PROMPT DE EJECUCIÓN: SPRINT 9 (Doble Modalidad de Instalación: PWA Instantánea + Descarga de APK Android con Capacitor)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Se requiere habilitar soporte para **dos modalidades de instalación simultáneas** en Bike Tracker:
1. **Instalación Web PWA (Instantánea):** La funcionalidad actual sin descargas desde el navegador en iOS, Android y PC.
2. **Descarga de Paquete APK Android (.apk):** Descarga directa de un archivo instalador `.apk` para dispositivos Android, junto con la configuración de empaquetado nativo mediante **Capacitor**.

---

## 2. [Objetivo Concreto y Alcance]
1. **Configuración de Empaquetado Nativo:**
   - Instalar `@capacitor/core`, `@capacitor/cli` y `@capacitor/android`.
   - Crear el archivo `capacitor.config.ts` con identificador `app.biketracker.app` y directorio `dist`.
   - Configurar scripts en `package.json` (`cap:sync`, `cap:android`).
2. **Distribución del Binario APK:**
   - Crear la ruta pública `public/downloads/` y colocar un archivo `bike-tracker.apk` para descarga directa desde la web.
3. **Rediseño del Modal de Instalación (`src/components/common/InstallAppModal.tsx`):**
   - Implementar selector de pestañas (Tabs):
     - **Tab 1: ⚡ Instalación PWA (Sin descargas / Recomendada):** Flujo actual de instalación nativa en navegador / Safari iOS.
     - **Tab 2: 🤖 Descargar APK Android (.apk):** Tarjeta con botón de descarga directa de `bike-tracker.apk`, indicador de versión (`v1.0.0`), tamaño y guía visual de 3 pasos para autorizar instalación de fuentes desconocidas en Android.
4. **Internacionalización (`src/utils/i18n.ts`):**
   - Agregar todas las llaves de traducción para las pestañas, guía del APK y botones de descarga en `es` y `en`.

---

## 3. [Archivos y Rutas Afectadas]
- `package.json` (Añadir dependencias de Capacitor y scripts).
- `capacitor.config.ts` (Nuevo archivo de configuración).
- `public/downloads/bike-tracker.apk` (Archivo para descarga web).
- `src/utils/i18n.ts` (Nuevas llaves para PWA vs APK).
- `src/components/common/InstallAppModal.tsx` (Rediseño con pestañas PWA y APK).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### A. Instalar Dependencias y Configurar Capacitor
1. Ejecutar instalación de dependencias:
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli
   ```
2. Crear `capacitor.config.ts` en la raíz:
   ```ts
   import type { CapacitorConfig } from '@capacitor/cli'

   const config: CapacitorConfig = {
     appId: 'app.biketracker.app',
     appName: 'Bike Tracker',
     webDir: 'dist',
     server: {
       androidScheme: 'https',
     },
   }

   export default config
   ```
3. Agregar scripts en `package.json`:
   ```json
   "cap:sync": "cap sync",
   "cap:android": "cap open android"
   ```

---

### B. Crear Carpeta de Descargas y APK Inicial
1. Crear el directorio `public/downloads/`.
2. Crear el archivo `public/downloads/bike-tracker.apk` (o generar el binario inicial).

---

### C. Actualizar Diccionario en `src/utils/i18n.ts`
Agregar en `es` y `en`:

* **En `es`:**
  ```ts
  // Modal de Instalación & APK
  'install.tabPwa': '⚡ Instalación Rápida (PWA)',
  'install.tabApk': '🤖 Descargar APK (Android)',
  'install.apkTitle': 'Instalador APK para Android',
  'install.apkSubtitle': 'Descarga directa del paquete de instalación sin pasar por Google Play Store.',
  'install.downloadApkBtn': '📥 Descargar BikeTracker.apk (v1.0)',
  'install.apkStep1': 'Descarga el archivo APK pulsando el botón superior.',
  'install.apkStep2': 'Abre el archivo descargado en las notificaciones de tu celular.',
  'install.apkStep3': 'Si el sistema te lo solicita, activa "Permitir instalar aplicaciones de fuentes desconocidas".',
  'install.apkNote': 'Compatible con Android 8.0 o superior.',
  ```

* **En `en`:**
  ```ts
  // Install Modal & APK
  'install.tabPwa': '⚡ Quick Install (PWA)',
  'install.tabApk': '🤖 Download APK (Android)',
  'install.apkTitle': 'Android APK Installer',
  'install.apkSubtitle': 'Direct download of the install package without Google Play Store.',
  'install.downloadApkBtn': '📥 Download BikeTracker.apk (v1.0)',
  'install.apkStep1': 'Download the APK file using the button above.',
  'install.apkStep2': 'Open the downloaded file from your phone notifications.',
  'install.apkStep3': 'If prompted by Android, enable "Allow installation from unknown sources".',
  'install.apkNote': 'Compatible with Android 8.0 or higher.',
  ```

---

### D. Rediseñar `src/components/common/InstallAppModal.tsx`
1. Añadir estado local `const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa')`.
2. Renderizar pestañas superiores elegantes con micro-interacción:
   ```tsx
   <div className="mb-4 flex overflow-hidden rounded-xl border border-bike-border bg-slate-100 p-1">
     <button
       onClick={() => setActiveTab('pwa')}
       className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
         activeTab === 'pwa' ? 'bg-white text-bike-ink shadow-sm' : 'text-slate-500 hover:text-slate-800'
       }`}
     >
       {t('install.tabPwa')}
     </button>
     <button
       onClick={() => setActiveTab('apk')}
       className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
         activeTab === 'apk' ? 'bg-white text-bike-orange shadow-sm' : 'text-slate-500 hover:text-slate-800'
       }`}
     >
       {t('install.tabApk')}
     </button>
   </div>
   ```
3. En la pestaña `pwa`, mantener el comportamiento actual de instalación nativa PWA / iOS.
4. En la pestaña `apk`, renderizar:
   - Botón de descarga directa:
     ```tsx
     <a
       href="/downloads/bike-tracker.apk"
       download="BikeTracker-v1.0.apk"
       className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-bike-orange to-orange-600 py-3.5 text-sm font-bold text-white shadow-glow-orange transition active:scale-[0.98]"
     >
       {t('install.downloadApkBtn')}
     </a>
     ```
   - Guía de 3 pasos numerados para instalar APKs en Android.
   - Indicador de versión y compatibilidad.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Pestañas Interactivas:** El usuario puede alternar fluidamente entre la pestaña PWA y la pestaña APK.
2. ✅ **Descarga de APK Funcional:** Al hacer clic en el botón de descarga de APK, el navegador inicia la descarga del archivo `.apk`.
3. ✅ **PWA Preservada:** La instalación instantánea PWA en PC y teléfonos sigue funcionando intacta.
4. ✅ **Guía Intuitiva:** Las instrucciones para Android son claras, didácticas y en español.
5. ✅ **Compilación Limpia:** `npm run build` compila con 0 errores.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No romper la responsividad móvil ni el diseño centrado en `PhoneFrame` o viewport.
- Conservar el cierre por clic en backdrop y tecla Escape.
