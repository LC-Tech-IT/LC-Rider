# 🚀 Prompt de Ejecución para Claude — Sprint 16: Motor de Búsqueda de Destinos y Geocodificación Inteligente (Waze-Style)

## 1. Rol y Contexto para Claude
Actúa como **Lead Software Engineer & UI/UX Developer** de **Bike Tracker**.
El stakeholder ha reportado una falla crítica de usabilidad y producto en el trazador de rutas:
1. Al escribir destinos específicos (ej. *"datacenter triara"*, hoteles, puntos de interés), la búsqueda no devuelve resultados.
2. Al borrar el texto y escribir una ciudad conocida (ej. *"ibague"*), el sistema deja de responder y no muestra opciones, bloqueando el trazado de rutas.

### 🔍 Causa Raíz Identificada (Product & Tech Analysis):
- En `RoutePlannerModal.tsx`, el input disparaba peticiones a la API de Nominatim en cada pulsación de tecla (`onChange`) sin **debounce**. Al escribir palabras como "datacenter triara", se enviaban más de 15 solicitudes en segundos, provocando un bloqueo inmediato por **Rate Limit (HTTP 429/403)** por parte de OpenStreetMap. Todas las consultas posteriores (incluso "ibague") fallaban silenciosamente devolviendo un array vacío.
- Nominatim libre carece de indexación para nombres comerciales específicos o POIs privados si no se cuenta con búsqueda difusa (fuzzy search) o un catálogo local de respaldo.

---

## 2. Objetivo Concreto y Alcance
Transformar el buscador de rutas en un **motor de búsqueda de destinos inteligente, resiliente y estilo Waze**:
1. **Debounce (350ms) y Cancelación de Peticiones (`AbortController`):** Evitar saturación de red y bloqueos de API.
2. **Motor Híbrido de Geocodificación (Local POIs + Nominatim + Photon Fallback):**
   - Catálogo local rico de Colombia: ciudades, municipios, corregimientos y POIs moteros emblemáticos (incluyendo *"Data Center Triara Claro"*, peajes, altos de montaña, hoteles y sitios turísticos).
   - Consulta a Nominatim con headers adecuados y fallback a Photon API para cobertura global/direcciones exactas.
3. **Experiencia de Usuario Waze-Style:**
   - Botón `✕` para limpiar el campo rápidamente.
   - Indicador visual *"Buscando..."* mientras se realiza la consulta.
   - Categorización con iconos visuales (🏙️ Ciudad, 🏢 POI/Empresa, 🏨 Hotel, ⛽ Peaje/Estación, 📍 Dirección).
   - Visualización de título en negrita + departamento/ciudad como subtítulo.
   - Manejo de estado vacío claro cuando no hay resultados.
   - Historial de búsquedas recientes guardado en `localStorage`.

---

## 3. Archivos y Recursos Afectados
- `src/services/routingService.ts` (Motor híbrido de geocodificación, catálogo local de POIs Colombia, soporte de tipos enriquecidos)
- `src/components/navigation/RoutePlannerModal.tsx` (Debounce, AbortController, UI Waze-style, recientes, botón limpiar, spinner de carga)
- `src/utils/i18n.ts` (Traducciones para estados de búsqueda en ES y EN)

---

## 4. Instrucciones Paso a Paso / Tareas de Implementación

### Tarea 1: Enriquecer `src/services/routingService.ts`

1. **Ampliar la interfaz `GeocodeResult`:**
   ```typescript
   export interface GeocodeResult {
     label: string
     subtitle?: string
     position: LatLng
     type?: 'city' | 'poi' | 'hotel' | 'gas' | 'address' | 'landmark'
   }
   ```

2. **Crear Catálogo Local de POIs y Destinos de Colombia (`COLOMBIA_LOCAL_POIS`):**
   Incluir al menos:
   - **POIs Clave & Biker Waypoints:**
     - `label`: *"Data Center Triara Claro"*, `subtitle`: *"Cota / Autopista Medellín, Cundinamarca"*, `position`: `{ lat: 4.7738, lng: -74.1352 }`, `type`: `'poi'`
     - `label`: *"Alto de Letras"*, `subtitle`: *"Paso de Montaña (Km 3698msnm), Caldas / Tolima"*, `position`: `{ lat: 5.0333, lng: -75.3167 }`, `type`: `'landmark'`
     - `label`: *"Alto de la Línea"*, `subtitle`: *"Cordillera Central, Tolima / Quindío"*, `position`: `{ lat: 4.4500, lng: -75.5667 }`, `type`: `'landmark'`
     - `label`: *"Km 18 Vía al Mar"*, `subtitle`: *"Dapa / Cali, Valle del Cauca"*, `position`: `{ lat: 3.5186, lng: -76.6231 }`, `type`: `'landmark'`
     - `label`: *"Piedra del Peñol / Guatapé"*, `subtitle`: *"Guatapé, Antioquia"*, `position`: `{ lat: 6.2208, lng: -75.1792 }`, `type`: `'landmark'`
     - `label`: *"Desierto de la Tatacoa"*, `subtitle`: *"Villavieja, Huila"*, `position`: `{ lat: 3.2325, lng: -75.1667 }`, `type`: `'landmark'`
     - `label`: *"Cañón del Chicamocha"*, `subtitle`: *"Aratoca, Santander"*, `position`: `{ lat: 6.7905, lng: -73.0039 }`, `type`: `'landmark'`
     - `label`: *"Embalse del Neusa"*, `subtitle`: *"Cogua / Tausa, Cundinamarca"*, `position`: `{ lat: 5.1667, lng: -73.9667 }`, `type`: `'landmark'`
     - `label`: *"Embalse del Sisga"*, `subtitle`: *"Chocontá, Cundinamarca"*, `position`: `{ lat: 5.0767, lng: -73.7233 }`, `type`: `'landmark'`
     - `label`: *"Villa de Leyva"*, `subtitle`: *"Plaza Mayor, Boyacá"*, `position`: `{ lat: 5.6328, lng: -73.5283 }`, `type`: `'city'`
     - `label`: *"Hotel Tequendama"*, `subtitle`: *"Carrera 10, Bogotá D.C."*, `position`: `{ lat: 4.6152, lng: -74.0722 }`, `type`: `'hotel'`
     - `label`: *"Termales Santa Rosa de Cabal"*, `subtitle`: *"Risaralda"*, `position`: `{ lat: 4.8683, lng: -75.5997 }`, `type`: `'landmark'`
   - **Ciudades Principales e Intermedias de Colombia:**
     - Bogotá, Medellín, Cali, Barranquilla, Bucaramanga, Cartagena, Santa Marta, Pereira, Manizales, Armenia, Ibagué, Villavicencio, Cúcuta, Pasto, Neiva, Popayán, Tunja, Valledupar, Montería, Sincelejo, Riohacha, Florencia, Yopal, Quibdó, Girardot, Melgar, Fusagasugá, Facatativá, Chía, Zipaquirá, Rionegro, Palmira, Buga, Tuluá, Duitama, Sogamoso, San Gil, Barichara, Doradal, etc.

3. **Implementar `geocodeAddress(query: string, signal?: AbortSignal): Promise<GeocodeResult[]>`:**
   - **Paso A (Filtro local instantáneo):** Normalizar texto (sin tildes, minúsculas). Buscar coincidencias en `COLOMBIA_LOCAL_POIS` donde `label` o `subtitle` contenga los términos. Si hay coincidencias exactas/fuertes, incluirlas al inicio.
   - **Paso B (Consulta Remota con Nominatim):**
     - Endpoint: `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&countrycodes=co&addressdetails=1`
     - Header: `Accept: 'application/json'`
     - Parsear resultados extrayendo nombre principal y subtítulo (ciudad/departamento) y clasificar el tipo.
   - **Paso C (Fallback a Photon si Nominatim falla o devuelve vacío):**
     - Endpoint: `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=es`
     - Mapear a `GeocodeResult`.
   - **Paso D (Unificación y Deduplicación):** Combinar los resultados locales y remotos evitando duplicados por proximidad de coordenadas o nombre exacto.

---

### Tarea 2: Rediseñar `src/components/navigation/RoutePlannerModal.tsx`

1. **Gestión de Estado y Debounce:**
   - Utilizar un `useEffect` o timeout con **350ms** para disparar la búsqueda de origen y destino al cambiar el texto.
   - Mantener referencias `AbortController` para abortar búsquedas anteriores al escribir o borrar.
   - Añadir estado `searchingOrigin` y `searchingDest` booleanos para feedback visual inmediato.
2. **Inputs con Botón Limpiar (✕):**
   - Si el input tiene texto, mostrar un botón `✕` a la derecha dentro del campo para vaciar el texto y resetear el resultado con 1 toque.
3. **Lista de Resultados Estilo Waze:**
   - Cada ítem de la lista debe mostrar:
     - Ícono según `r.type` (🏙️ para ciudad, 🏢 para POI/empresa, 🏨 para hotel, ⛽ para estación/peaje, 📍 para dirección/defecto).
     - Nombre principal en negrita (`r.label`).
     - Subtítulo o ubicación en texto pequeño gris (`r.subtitle`).
     - Efecto hover/active suave con microanimación.
4. **Estado Vacío Amigable:**
   - Si el usuario ha escrito 3 o más caracteres y no hay resultados, mostrar un banner informativo:
     *"🔍 No encontramos resultados exactos para '[query]'. Intenta con el nombre de la ciudad o un punto de referencia cercano."*
5. **Historial de Búsquedas Recientes:**
   - Al seleccionar un destino, guardar `{ label, subtitle, position, type }` en `localStorage` (clave: `'biker_recent_destinations'`, máximo 4 ítems).
   - Cuando el campo esté vacío o con foco inicial, mostrar la sección *"🕒 Búsquedas recientes"* si existen.

---

### Tarea 3: Ajustes de Traducciones en `src/utils/i18n.ts`
Asegurar las siguientes claves en ES y EN:
- `routePlanner.searching`: "Buscando lugares..." / "Searching places..."
- `routePlanner.noResults`: "No encontramos resultados para \"{{query}}\"" / "No results found for \"{{query}}\""
- `routePlanner.noResultsHint`: "Intenta con el nombre de la ciudad, municipio o punto de referencia cercano." / "Try searching for the city, town, or nearby landmark."
- `routePlanner.recentSearches`: "Búsquedas recientes" / "Recent searches"
- `routePlanner.clearInput`: "Limpiar campo" / "Clear input"

---

## 5. Criterios de Aceptación / Definition of Done (DoD)
- [ ] Al escribir *"datacenter triara"* (o *"triara"*), aparece inmediatamente la sugerencia *"Data Center Triara Claro - Cota / Autopista Medellín"* y se puede seleccionar para trazar la ruta.
- [ ] Al borrar el texto y escribir *"ibague"*, aparece de inmediato *"Ibagué, Tolima"* y permite seleccionarlo sin trabarse ni quedarse en blanco.
- [ ] Al escribir nombres de hoteles (ej. *"Hotel Tequendama"*), ciudades, municipios de Colombia o direcciones, aparecen resultados relevantes con íconos descriptivos y subtítulos.
- [ ] No se producen bloqueos de red ni errores 429 gracias al debounce de 350ms y `AbortController`.
- [ ] El botón `✕` borra el campo con un solo toque.
- [ ] Al seleccionar un destino, se guarda en búsquedas recientes y se ofrece como sugerencia en futuras planificaciones.
- [ ] `npm run build` compila al 100% sin errores TypeScript.

---

## 6. Restricciones Técnicas y Reglas de Calidad
- **Zero-Discovery Waste:** Código 100% modular en TypeScript sin dependencias externas pesadas adicionales.
- **Rendimiento:** Debounce y abort de peticiones estrictamente controlados.
- **Mobile First:** Elementos táctiles de mínimo 44px de altura para fácil pulsación en dispositivos móviles.
