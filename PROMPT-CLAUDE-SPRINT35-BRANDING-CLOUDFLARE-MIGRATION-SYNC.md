# 📋 PROMPT DE EJECUCIÓN: SPRINT 35 (Nuevo Logo de Marca, Migración a Cloudflare Pages & Sincronización Global con Supabase)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker (LC Tech)**.
El proyecto ha evolucionado exitosamente y la infraestructura de frontend ha sido migrada desde Vercel hacia **Cloudflare Pages** bajo el nuevo dominio oficial de producción: **`https://biker.lcsynctech.com/`**.
Adicionalmente, se ha adoptado la nueva identidad visual y logotipo oficial de la marca (pin de geolocalización brillante con faro delantero de motocicleta y silueta vial nocturna).
Tu labor en este Sprint es aplicar las actualizaciones de código necesarias para integrar el nuevo logo en toda la experiencia de usuario, activar la versión de Service Worker para forzar la actualización de caché en clientes PWA existentes, actualizar la documentación técnica / arquitectura hacia Cloudflare Pages y validar que la aplicación compile y opere al 100% de cara a la sincronización con Supabase.

---

## 2. [Objetivo Concreto y Alcance]
1. **Adopción del Nuevo Logo en la Experiencia de Autenticación (`WelcomeAuthScreen.tsx`):**
   - Sustituir el avatar temporal con emoji `🏍️` por la imagen del nuevo logo oficial (`/images/app-icon.jpg`), aplicando esquinas redondeadas (`rounded-3xl`), borde sutil naranja (`border-2 border-bike-orange`) y la sombra de resplandor (`shadow-glow-orange`).
2. **Invalidación y Renovación de Caché PWA (`public/sw.js`):**
   - Actualizar la constante de caché de `'bike-tracker-v2'` a `'bike-tracker-v3'`. Esto forzará a que todos los navegadores y PWAs instaladas detecten la nueva versión servida desde Cloudflare Pages y actualicen los assets locales.
3. **Actualización de Documentación de Despliegue (`README.md`):**
   - Reemplazar las insignias y enlaces de Vercel por **Cloudflare Pages** y la URL de producción: `https://biker.lcsynctech.com/`.
   - Actualizar la sección de infraestructura y CI/CD para reflejar el despliegue automático mediante Cloudflare Pages desde la rama `main`.
4. **Sincronización del Modelo de Arquitectura (`biker-tracker.architecture.json`):**
   - Actualizar el nodo de hosting/CDN de `Vercel Edge` a `Cloudflare Pages Edge` con su respectiva descripción de entrega estática global y protección DDoS/WAF.
5. **Aseguramiento de Calidad y Build:**
   - Verificar compilación limpia sin errores mediante `npm run build`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/auth/WelcomeAuthScreen.tsx` (Reemplazo del contenedor de emoji por el nuevo logo oficial).
- `public/sw.js` (Incremento de versión de caché a `bike-tracker-v3`).
- `README.md` (Actualización de badges, URLs oficiales y menciones de Cloudflare Pages).
- `biker-tracker.architecture.json` (Actualización de la arquitectura hacia Cloudflare Pages).

*(Nota: Los archivos de configuración de Cloudflare Pages `public/_redirects`, `public/_headers` y las variantes gráficas `app-icon.jpg`, `app-icon-192.png` y `app-icon-512.png` ya fueron generados y ubicados en el repositorio por DevOps).*

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Paso 1: Actualizar `src/components/auth/WelcomeAuthScreen.tsx`
Localiza en la vista de bienvenida (alrededor de las líneas 44-46) el bloque del icono:
```tsx
// ANTES:
<div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-bike-orange to-bike-blue text-5xl shadow-glow-orange">
  🏍️
</div>
```
Reemplázalo por la etiqueta del nuevo logo oficial:
```tsx
// AHORA:
<img
  src="/images/app-icon.jpg"
  alt="Bike Tracker"
  className="h-24 w-24 rounded-3xl border-2 border-bike-orange object-cover shadow-glow-orange"
/>
```

### Paso 2: Actualizar `public/sw.js`
En la primera línea de `public/sw.js`:
```javascript
// ANTES:
const CACHE_NAME = 'bike-tracker-v2'

// AHORA:
const CACHE_NAME = 'bike-tracker-v3'
```

### Paso 3: Actualizar `README.md`
1. Actualizar los badges superiores:
   - Badge de despliegue: `Cloudflare Pages` con enlace a `https://biker.lcsynctech.com/`.
   - Badge de stack: enlace a `https://biker.lcsynctech.com/`.
2. En la sección **Stack Tecnológico**:
   - `Infraestructura:` Cloudflare Pages Global Edge Network (Alta Disponibilidad 99.99%).
3. En la sección **Despliegue y CI/CD**:
   - Actualizar la URL de producción a **[https://biker.lcsynctech.com](https://biker.lcsynctech.com)**.

### Paso 4: Actualizar `biker-tracker.architecture.json`
1. En `meta.views`:
   - Cambiar la nota de `edge-delivery` para referirse a Cloudflare Pages.
2. En `components`:
   - Buscar el componente con `"id": "edge_cdn"` y actualizar su label a `"Cloudflare Pages"`, sublabel `"CDN & Edge Hosting"`, tag `"Cloudflare Edge"`.
3. En `edges`:
   - Actualizar las etiquetas descriptivas que mencionen Vercel para indicar entrega vía Cloudflare.

### Paso 5: Verificación de Build
Ejecuta la compilación de producción:
```bash
npm run build
```
Confirma que finalice con `✓ built in ...` y cero errores de TypeScript.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] `WelcomeAuthScreen.tsx` renderiza la imagen del nuevo logotipo con bordes estilizados en lugar del emoji.
- [ ] `sw.js` declara `bike-tracker-v3` para asegurar la renovación de caché PWA en clientes.
- [ ] `README.md` y `biker-tracker.architecture.json` reflejan con precisión la infraestructura en Cloudflare Pages y el dominio `https://biker.lcsynctech.com`.
- [ ] `npm run build` compila con código de salida 0.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No alterar las llamadas dinámicas a `window.location.origin` en `AppContext.tsx` ni en `navigationHelper.ts`, ya que garantizan la compatibilidad multientorno.
- Mantener las clases utilitarias de Tailwind CSS existentes.
- Mantener el idioma de las respuestas y comentarios en **Español**.

