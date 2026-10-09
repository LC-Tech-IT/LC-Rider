# 🚀 Prompt de Ejecución para Claude — Sprint 15: Actualización del Titular Principal de la Landing Page

## 1. Rol y Contexto para Claude
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El stakeholder ha solicitado actualizar el titular (headline) principal en la sección Hero de la Landing Page para enfatizar el sentido de unidad y comunidad motera.

---

## 2. Objetivo Concreto y Alcance
Actualizar el texto del encabezado `<h1>` en la Landing Page (`src/components/landing/LandingPage.tsx`):
- **Texto anterior:**
  ```text
  Salimos juntos, rodamos juntos,
  volvemos todos a casa.
  ```
- **Texto nuevo:**
  ```text
  Salimos juntos, rodamos juntos,
  volvemos todos juntos a casa.
  ```

---

## 3. Archivos y Recursos Afectados
- `src/components/landing/LandingPage.tsx` (Sección Hero / Encabezado `<h1>`)

---

## 4. Instrucciones Paso a Paso / Tareas de Implementación

### Tarea 1: Actualizar el encabezado en `src/components/landing/LandingPage.tsx`
Localizar el bloque del titular Hero:
```tsx
<h1 className="mt-5 font-display text-3xl font-black leading-tight text-bike-ink sm:text-5xl">
  Salimos juntos, rodamos juntos,
  <br className="hidden sm:block" /> volvemos todos juntos a casa.
</h1>
```
Conservar intacta la estructura del `<br className="hidden sm:block" />`, las clases de tipografía, colores y espaciado responsive.

---

## 5. Criterios de Aceptación / Definition of Done (DoD)
- [ ] La sección Hero de la Landing Page muestra exactamente: *"Salimos juntos, rodamos juntos, volvemos todos juntos a casa."*
- [ ] En pantallas pequeñas (móviles) el texto fluye de manera armónica sin saltos de línea forzados extraños.
- [ ] En pantallas medianas/grandes (`sm:` en adelante), el salto de línea separa limpiamente las dos frases.
- [ ] `npm run build` compila al 100% sin errores.

---

## 6. Restricciones Técnicas y Reglas de Calidad
- **Zero-Discovery Waste:** Cambio quirúrgico y limpio únicamente en el texto solicitado sin tocar dependencias ni lógica.
