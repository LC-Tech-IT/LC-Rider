# 🚀 PROMPT DE EJECUCIÓN PARA CLAUDE — SPRINT 25: ACTUALIZACIÓN DEL ICONO OFICIAL DE LA APP (WEB, PWA & ANDROID)

---

## 1. [Rol / Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.  
El Principal PM & Stakeholder ha definido y suministrado la nueva identidad visual oficial para el icono de la aplicación (un icono vectorial/3D de alto impacto con silueta motera en neón verde esmeralda, mapa táctico y pines de origen/destino sobre fondo oscuro redondeado).

La imagen original en alta resolución ya fue procesada y guardada en el repositorio en:
- `public/images/app-icon.jpg`
- `public/app-icon.jpg`

Tu misión en este sprint es actualizar todos los puntos de contacto del icono en la Web, PWA, Modal de Instalación, manifiesto PWA y los recursos de icono del lanzador móvil (Android / Capacitor), garantizando que al abrir la app o instalarla en el móvil el icono sea inmediatamente visible con máxima nitidez.

---

## 2. [Objetivo Concreto y Alcance]
1. **Actualizar Favicon y Metadatos en `index.html`:** Cambiar el favicon SVG / Apple Touch Icon previo por el nuevo icono oficial en `/images/app-icon.jpg`.
2. **Actualizar el Manifiesto PWA (`public/manifest.webmanifest`):** Configurar los iconos de 192x192 y 512x512 para instalación en pantalla de inicio con soporte `maskable` y `any`.
3. **Actualizar el Modal de Instalación (`src/components/common/InstallAppModal.tsx`):** Mostrar el nuevo icono de la aplicación en la cabecera del modal de instalación PWA/APK.
4. **Sincronizar Recursos Nativos de Android (`android/app/src/main/res/mipmap-*`):** Reemplazar o redimensionar los iconos de lanzador de Android para que la compilación de la APK muestre el nuevo icono en la pantalla de inicio del celular.
5. **Compilación y Sincronización:** Ejecutar `npm run build` y sincronizar Capacitor con `npx cap copy android`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `public/images/app-icon.jpg` (Icono fuente ya disponible)
- `public/manifest.webmanifest`
- `index.html`
- `src/components/common/InstallAppModal.tsx`
- `android/app/src/main/res/mipmap-mdpi/`
- `android/app/src/main/res/mipmap-hdpi/`
- `android/app/src/main/res/mipmap-xhdpi/`
- `android/app/src/main/res/mipmap-xxhdpi/`
- `android/app/src/main/res/mipmap-xxxhdpi/`

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Tarea 1: Actualizar `index.html`
- Cambiar el `<link rel="icon" ...>` para apuntar a `/images/app-icon.jpg`.
- Cambiar el `<link rel="apple-touch-icon" ...>` a `/images/app-icon.jpg`.
- Asegurar que la etiqueta `<meta name="theme-color" content="#0F172A" />` o color acorde al branding se mantenga coherente.

```html
<link rel="icon" type="image/jpeg" href="/images/app-icon.jpg" />
<link rel="apple-touch-icon" href="/images/app-icon.jpg" />
```

### Tarea 2: Actualizar `public/manifest.webmanifest`
Configurar el bloque `icons` para usar el nuevo icono en todas las densidades de pantalla:
```json
{
  "name": "Bike Tracker - Convoy & Telemetría",
  "short_name": "BikeTracker",
  "description": "Plataforma de telemetría y convoy en tiempo real para moteros",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0B1120",
  "theme_color": "#10B981",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/images/app-icon.jpg",
      "sizes": "192x192 512x512",
      "type": "image/jpeg",
      "purpose": "any maskable"
    },
    {
      "src": "/app-icon.jpg",
      "sizes": "512x512",
      "type": "image/jpeg",
      "purpose": "any"
    }
  ]
}
```

### Tarea 3: Actualizar `src/components/common/InstallAppModal.tsx`
En la cabecera del modal de instalación (donde antes se mostraba `lc-tech-logo.jpeg` como icono de la app), reemplazar por `/images/app-icon.jpg` con bordes redondeados y sombra luminosa:
```tsx
<img 
  src="/images/app-icon.jpg" 
  alt="Bike Tracker" 
  className="h-12 w-12 rounded-2xl object-cover shadow-glow-emerald border border-emerald-500/30" 
/>
```

### Tarea 4: Actualizar Iconos del Lanzador Android (Mipmaps)
Generar o copiar el nuevo icono redimensionado a las diferentes carpetas de recursos de Android (`android/app/src/main/res/`):
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)
*(Puedes usar un script en Node.js con canvas/sharp o PowerShell con `System.Drawing.Bitmap` para redimensionar desde `public/images/app-icon.jpg` a los destinos mipmap correspondientes).*

### Tarea 5: Validación de Build y Capacitor Sync
Ejecutar en la terminal:
```bash
npm run build
npx cap copy android
```
Verificar que la carpeta `dist/` contenga los nuevos assets y que no existan errores de TypeScript.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ En el navegador web, la pestaña muestra el nuevo icono neón de Bike Tracker.
2. ✅ Al abrir la opción de "Instalar App" (PWA o APK) en el modal `InstallAppModal`, se muestra el nuevo icono con borde y acabado prémium.
3. ✅ En el manifiesto PWA (`manifest.webmanifest`), los dispositivos Android e iOS reconocen el icono al añadir la app a la pantalla de inicio ("Add to Home Screen").
4. ✅ Los recursos `mipmap-*` de Android quedan actualizados con la nueva imagen.
5. ✅ `npm run build` finaliza con código 0 sin advertencias ni errores.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- Mantener intacta la identidad de **LC Tech** como fabricante corporativo en la cabecera de la Landing (`lc-tech-logo.jpeg`), utilizando `app-icon.jpg` específicamente para el **producto Bike Tracker** y su lanzador móvil.
- No alterar las rutas existentes de imágenes de fondo o capturas del simulador de convoy.
