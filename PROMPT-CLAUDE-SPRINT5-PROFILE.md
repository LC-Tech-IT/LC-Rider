# 📋 PROMPT DE EJECUCIÓN: SPRINT 5 (Edición de Perfil Completo: Género, Edad y Foto Real)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer**. Tu objetivo es enriquecer el módulo de **Perfil de Piloto** en **Bike Tracker** (React + TypeScript + Tailwind CSS) agregando los campos de **Género**, **Edad** y soporte para **Carga de Foto Real de Perfil**.

---

## 2. [Especificación Detallada de Requisitos]

### A. Nuevos Campos en el Modelo de Usuario (`src/types/index.ts`)
Actualizar la interfaz `UserProfile`:
```typescript
export type GenderOption = 'male' | 'female' | 'unspecified'

export interface UserProfile {
  id: string
  name: string
  email: string
  /** Emoji o Data URL (Base64) de foto cargada por el usuario */
  avatarUrl: string
  gender?: GenderOption
  age?: number | null
  isLoggedIn: boolean
  authProvider: 'google' | 'email'
  registeredAt: number
}
```

---

### B. Modal de Edición de Perfil (`src/components/auth/EditProfileModal.tsx`)
Crear un modal exclusivo y estilizado para editar el perfil del piloto:

1. **Gestión de Foto / Avatar de Perfil:**
   - Previsualización circular grande del avatar actual:
     - Si `avatarUrl` es una imagen (Base64 `data:image...` o URL), renderizar `<img src={avatarUrl} className="w-20 h-20 rounded-full object-cover border-2 border-bike-orange shadow-md" />`.
     - Si es un emoji, renderizar un círculo de fondo naranja suave con el emoji en tamaño grande.
   - **Botón `📷 Subir Foto de Perfil`:** Input de archivo (`accept="image/*"`) que lee la foto con `FileReader.readAsDataURL()`, valida que no supere 3MB y actualiza la vista previa al instante.
   - **Selector de Avatares Moteros:** Fila con selección rápida de emojis/iconos (🏍️, 🪖, 🧔, 👩, 🧑‍🦱, 😎, 🦊, ⚡).

2. **Datos Personales:**
   - **Nombre Completo:** Input de texto editable.
   - **Género:** Selector visual con 3 opciones claras:
     - 👨 **Hombre** (`male`)
     - 👩 **Mujer** (`female`)
     - 🤐 **Prefiero no responder** (`unspecified`)
   - **Edad:** Input numérico (`type="number"`, `min="14"`, `max="99"`, placeholder: "Ej. 28").
   - **Correo Electrónico:** Visualización informativa en solo lectura con badge de cuenta activa.

3. **Acciones:**
   - Botón **`💾 Guardar Cambios`**: Actualiza el estado global a través de `updateProfile()`, persiste en `localStorage` (en la cuenta aislada del usuario activo) y cierra el modal.
   - Botón **`Cancelar / Cerrar`**.

---

### C. Renderizado Universal de Avatares (Foto o Emoji)
Asegurar que en todos los lugares donde se muestra el avatar del usuario (`Sidebar.tsx`, `Header.tsx`, `WelcomeAuthScreen.tsx`, marcadores del mapa y modales), se verifique si `avatarUrl` es una foto (empieza por `data:image` o `http`) para mostrarla como imagen circular nítida (`<img />`), o como emoji si es un carácter.

---

### D. Diccionario de Traducciones (`src/utils/i18n.ts`)
Agregar las claves de traducción en español e inglés:
- `profile.editTitle`: "Editar Perfil de Piloto" / "Edit Rider Profile"
- `profile.uploadPhoto`: "Subir Foto" / "Upload Photo"
- `profile.orChooseAvatar`: "O elige un avatar" / "Or choose an avatar"
- `profile.gender`: "Género" / "Gender"
- `profile.genderMale`: "Hombre" / "Male"
- `profile.genderFemale`: "Mujer" / "Female"
- `profile.genderUnspecified`: "Prefiero no responder" / "Prefer not to say"
- `profile.age`: "Edad" / "Age"
- `profile.agePlaceholder`: "Ej. 28 años" / "E.g. 28 years"
- `profile.saveChanges`: "Guardar Cambios" / "Save Changes"

---

## 3. [Archivos y Rutas Afectadas]
- `src/types/index.ts` (Actualizar `UserProfile` con `gender` y `age`).
- `src/context/AppContext.tsx` (Actualizar método `updateProfile` para aceptar `gender` y `age`, y abrir `EditProfileModal`).
- `src/components/auth/EditProfileModal.tsx` (Nuevo componente de edición de perfil).
- `src/components/common/Sidebar.tsx` (Abrir `EditProfileModal` al pulsar "Editar Perfil", renderizar foto real o emoji).
- `src/components/common/Header.tsx` (Renderizar foto real o emoji del usuario).
- `src/utils/i18n.ts` (Nuevas claves de traducción).
- `src/App.tsx` (Montar `EditProfileModal`).

---

## 4. [Criterios de Aceptación / Definition of Done (DoD)]
1. ✅ **Campos de Género y Edad:** El usuario puede seleccionar Hombre, Mujer o No responder, e ingresar su edad numérica.
2. ✅ **Carga de Foto Real:** El usuario puede subir una imagen JPG/PNG desde su dispositivo y se visualiza perfectamente en el círculo de perfil.
3. ✅ **Persistencia:** Al guardar cambios y recargar el navegador, la foto, el género y la edad se mantienen guardados.
4. ✅ **Visualización en Header y Sidebar:** Si el usuario tiene una foto real, se renderiza como imagen circular nítida; si tiene un emoji, se renderiza como icono.
5. ✅ **Compilación Limpia:** `tsc --noEmit` y `npm run build` pasan con 0 errores.
6. ✅ **Respuesta en Español:** Todo el reporte y explicación final deben ser en Español.
