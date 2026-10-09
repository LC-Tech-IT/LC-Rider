# 📋 PROMPT DE EJECUCIÓN: SPRINT 7 (Corrección de Posicionamiento del Modal de Instalación en la Landing Page)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo es solucionar un **defecto de posicionamiento CSS en el Modal de Instalación (`InstallAppModal.tsx`)**: al abrirse desde la Landing Page, el diálogo se renderiza al final del documento (requiriendo hacer scroll hacia abajo) en lugar de aparecer inmediatamente centrado en la ventana visual (viewport) del usuario.

### 💡 Causa Raíz:
`InstallAppModal.tsx` está usando `absolute inset-0` dentro de un contenedor padre largo con scroll (`relative min-h-[100dvh]`), lo que hace que el overlay se extienda a lo largo de toda la página y el diálogo se ancle al final del DOM. Debe cambiarse a `fixed inset-0 z-[100]`.

---

## 2. [Tareas Concretas de Implementación]

### A. Corregir Posicionamiento en `src/components/common/InstallAppModal.tsx`
1. Reemplazar el contenedor principal:
   - **Antes:** `<div className="absolute inset-0 z-[80] flex items-end justify-center bg-slate-900/50 sm:items-center">`
   - **Después:**
     ```tsx
     <div
       className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto"
       onClick={() => setInstallModalOpen(false)}
     >
       <div
         className="relative w-full max-w-md rounded-3xl border border-bike-border bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
         onClick={(e) => e.stopPropagation()}
       >
         {/* Contenido existente del modal */}
       </div>
     </div>
     ```
2. **Mejoras UX:**
   - **Cierre por clic en el backdrop:** Al hacer clic en el fondo oscuro exterior, el modal se cierra inmediatamente.
   - **Animación y Centrado Inmediato:** El modal aparece centrado de inmediato en la pantalla activa del usuario, sin importar en qué sección de la Landing Page o de la App se encuentre y sin requerir ningún scroll.

---

## 3. [Archivos y Rutas Afectadas]
- `src/components/common/InstallAppModal.tsx` (Cambiar `absolute` por `fixed inset-0 z-[100]` y centrado viewport).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Aparición Inmediata sin Scroll:** Al pulsar "📲 Instalar App" en el Header o Footer de la Landing Page, el modal aparece inmediatamente en el centro de la pantalla visible del usuario.
2. ✅ **Comportamiento en la App:** Sigue funcionando perfectamente al abrirlo desde el Sidebar de la aplicación.
3. ✅ **Cierre Fácil:** Se puede cerrar haciendo clic en la "X", en el botón "Cerrar" o en el fondo oscuro exterior.
4. ✅ **Compilación Limpia:** `npm run build` y `tsc --noEmit` compilan con 0 errores.
5. ✅ **Reporte en Español:** Resumen de entrega redactado en Español.
