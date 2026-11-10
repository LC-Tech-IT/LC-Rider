# 📋 PROMPT DE EJECUCIÓN: SPRINT 36 (Rebranding a LC SyncTech, Nuevo Correo Corporativo & Enrutamiento de Contacto)

> **⚠️ REGLA DE COMUNICACIÓN OBLIGATORIA:** Todas tus respuestas, explicaciones, reportes de entrega y comentarios deben ser redactados **estrictamente en Español**.

---

## 1. [Rol y Contexto para Claude]
Eres el **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
La empresa fabricante y operadora ha evolucionado oficialmente su razón e identidad corporativa:
- **Nuevo Nombre Corporativo:** **`LC SyncTech`** (anteriormente *LC Tech* / *LC TECH*).
- **Nuevo Correo Corporativo Oficial:** **`contacto@lcsynctech.com`** (reemplazando cualquier mención a *leecastro.tech@gmail.com* o *contacto@biketracker.app*).
Tu misión en este Sprint es actualizar de manera transversal y precisa todas las referencias de marca, canales de atención al cliente, formularios de contacto, enlaces `mailto:`, respuestas del chatbot inteligente y política de tratamiento de datos personales (Habeas Data).

---

## 2. [Objetivo Concreto y Alcance]
1. **Actualización de Canales y Formulario de Contacto (`LandingContact.tsx`):**
   - Actualizar la constante `CONTACT_EMAIL` a `'contacto@lcsynctech.com'`.
   - Asegurar que al enviar el formulario de contacto, el enlace `mailto:` generado apunte directamente a `contacto@lcsynctech.com` con el asunto y cuerpo estructurado.
   - Actualizar la tarjeta de contacto de correo electrónico para mostrar `contacto@lcsynctech.com`.
2. **Actualización de Cabecera y Pie de Página (`LandingPage.tsx`):**
   - Actualizar el crédito en la cabecera: *"por LC SyncTech · Tecnología inteligente que te respalda."*.
   - En el pie de página (`footer`), actualizar el copyright a *"🏍️ Bike Tracker — LC SyncTech"*.
   - Actualizar el enlace directo de correo del footer a `mailto:contacto@lcsynctech.com?subject=Consulta%20Bike%20Tracker` y texto `📧 contacto@lcsynctech.com`.
3. **Actualización Legal en Política de Tratamiento de Datos (`PrivacyPolicyModal.tsx`):**
   - Actualizar `CONTACT_EMAIL = 'contacto@lcsynctech.com'`.
   - En las secciones en español e inglés ("1. Responsable del Tratamiento" / "1. Data Controller"), reemplazar `LC Tech` por `LC SyncTech`.
4. **Actualización del Asistente Virtual Biker (`chatbotService.ts` y `LandingChatbot.tsx`):**
   - Actualizar el saludo y respuestas de conocimiento para identificarse formalmente como parte de **LC SyncTech**.
   - Incluir `'lc synctech'` y `'synctech'` en las palabras clave (`keywords`) de la intención de contacto/soporte.
   - En la respuesta de contacto, informar el correo corporativo `contacto@lcsynctech.com`.
5. **Documentación del Repositorio (`README.md`):**
   - Actualizar el título principal a `# 🏍️ Bike Tracker — LC SyncTech`.
   - Actualizar el pie de página a `© 2026 **LC SyncTech** — *Tecnología inteligente que te respalda.*`.
6. **Validación de Compilación:**
   - Garantizar compilación exitosa con cero errores mediante `npm run build`.

---

## 3. [Archivos y Recursos Afectados / Rutas]
- `src/components/landing/LandingContact.tsx` (Constante de email, tarjeta de contacto y handler de formulario).
- `src/components/landing/LandingPage.tsx` (Crédito de cabecera y enlaces de email/copyright en el footer).
- `src/components/common/PrivacyPolicyModal.tsx` (Constante de email y razón social del responsable del tratamiento en ES/EN).
- `src/services/chatbotService.ts` (Respuestas de presentación, intención de contacto, keywords y correo corporativo).
- `src/components/landing/LandingChatbot.tsx` (Mensaje inicial y subtítulo de la ventana del chatbot).
- `README.md` (Título y copyright corporativo).

---

## 4. [Instrucciones Paso a Paso / Tareas de Implementación]

### Paso 1: Actualizar `src/components/landing/LandingContact.tsx`
1. En la línea 12, actualizar la constante:
   ```typescript
   // ANTES:
   const CONTACT_EMAIL = 'leecastro.tech@gmail.com'

   // AHORA:
   const CONTACT_EMAIL = 'contacto@lcsynctech.com'
   ```
2. Verificar que tanto el `handleSubmit` como la tarjeta de correo utilicen `${CONTACT_EMAIL}` para asegurar que todo correo viaje a `contacto@lcsynctech.com`.

### Paso 2: Actualizar `src/components/landing/LandingPage.tsx`
1. En la cabecera (alrededor de la línea 48):
   ```tsx
   // ANTES:
   por <span className="font-bold text-bike-orange">LC TECH</span>{' '}
   <span className="hidden sm:inline">· Tecnología inteligente que te respalda.</span>

   // AHORA:
   por <span className="font-bold text-bike-orange">LC SyncTech</span>{' '}
   <span className="hidden sm:inline">· Tecnología inteligente que te respalda.</span>
   ```
2. En el pie de página (`footer`, alrededor de las líneas 146-151):
   ```tsx
   // ANTES:
   <p className="text-xs font-semibold text-slate-500">🏍️ Bike Tracker — LC Tech</p>
   ...
   <a href="mailto:leecastro.tech@gmail.com?subject=Consulta%20Bike%20Tracker" className="hover:text-bike-ink hover:underline">
     📧 leecastro.tech@gmail.com
   </a>

   // AHORA:
   <p className="text-xs font-semibold text-slate-500">🏍️ Bike Tracker — LC SyncTech</p>
   ...
   <a href="mailto:contacto@lcsynctech.com?subject=Consulta%20Bike%20Tracker" className="hover:text-bike-ink hover:underline">
     📧 contacto@lcsynctech.com
   </a>
   ```

### Paso 3: Actualizar `src/components/common/PrivacyPolicyModal.tsx`
1. En la línea 4:
   ```typescript
   // ANTES:
   const CONTACT_EMAIL = 'leecastro.tech@gmail.com'

   // AHORA:
   const CONTACT_EMAIL = 'contacto@lcsynctech.com'
   ```
2. En la sección 1 de español (`sections[0].paragraphs`):
   ```typescript
   // Reemplazar:
   `LC SyncTech, operador de la plataforma Bike Tracker, con domicilio en Colombia. Canales de atención: correo ${CONTACT_EMAIL} y WhatsApp ${CONTACT_WHATSAPP}.`
   ```
3. En la sección 1 de inglés (`sections[0].paragraphs`):
   ```typescript
   // Reemplazar:
   `LC SyncTech, operator of the Bike Tracker platform, based in Colombia. Support channels: email ${CONTACT_EMAIL} and WhatsApp ${CONTACT_WHATSAPP}.`
   ```

### Paso 4: Actualizar `src/services/chatbotService.ts`
1. En la línea 7 (`SYSTEM_PROMPT`):
   Cambiar `Bike Tracker (LC Tech)` por `Bike Tracker (LC SyncTech)`.
2. En la línea 59 (respuesta de bienvenida/visión):
   Cambiar `Bike Tracker es la plataforma de LC Tech...` por `Bike Tracker es la plataforma de LC SyncTech...`.
3. En la respuesta de contacto (alrededor de la línea 120):
   - Agregar `'lc synctech'` y `'synctech'` al arreglo `keywords`.
   - En el texto `response`:
     ```typescript
     '¡Claro que sí, parce! Somos LC SyncTech — Tecnología inteligente que te respalda 🏍️. Escríbenos directo por WhatsApp al 📲 +57 350 520 8592 o al correo 📧 contacto@lcsynctech.com. Ahí también puedes registrar tu club motero pa\' activar el plan Biker Club.'
     ```

### Paso 5: Actualizar `src/components/landing/LandingChatbot.tsx`
1. En el mensaje de saludo inicial (`INITIAL_MESSAGE`, línea 13):
   Cambiar `Asistente Biker de LC Tech 🏍️` por `Asistente Biker de LC SyncTech 🏍️`.
2. En el encabezado del modal (alrededor de la línea 58):
   Cambiar `Bike Tracker · LC Tech` por `Bike Tracker · LC SyncTech`.

### Paso 6: Actualizar `README.md`
1. Línea 1:
   ```markdown
   # 🏍️ Bike Tracker — LC SyncTech
   ```
2. Línea final de copyright:
   ```markdown
   © 2026 **LC SyncTech** — *Tecnología inteligente que te respalda.*
   ```

### Paso 7: Validación de Build
Ejecutar:
```bash
npm run build
```
Verificar que compile limpiamente sin errores de TypeScript ni advertencias bloqueantes.

---

## 5. [Criterios de Aceptación / Definition of Done (DoD)]
- [ ] Ningún archivo del código fuente contiene referencias activas a `leecastro.tech@gmail.com` como correo de soporte.
- [ ] Todos los enlaces `mailto:`, tarjetas de contacto y envíos de formulario abren hacia `contacto@lcsynctech.com`.
- [ ] La razón social visible en la cabecera, footer, política de privacidad y chatbot es unificada como **LC SyncTech**.
- [ ] El chatbot responde adecuadamente con el nuevo nombre y correo corporativo ante consultas de soporte o club.
- [ ] `npm run build` compila con código de salida 0.

---

## 6. [Restricciones Técnicas y Reglas de Calidad]
- No modificar el número de WhatsApp comercial (`+57 350 520 8592`).
- No tocar la lógica de simulación ni las credenciales de Supabase.
- Mantener estrictamente el idioma de las respuestas y comentarios en **Español**.

