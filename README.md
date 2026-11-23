# CueBooking

Aplicación para que organizadores de eventos publiquen fechas y necesidades musicales y los DJs se postulen enviando propuestas de sesión.

- **Backend**: **Supabase** (PostgreSQL + Auth), expuesto mediante una **capa de servicios en JavaScript** (`src/services/`), de forma que el cliente no necesita conocer la API de Supabase.
- **Frontend**: **Vue 3** con Pinia, Vue Router y PrimeVue, en `frontend-vue/`.
- **Frontend parcial en React** (requerimiento adicional): listado y borrado de eventos, en `frontend-react/`.

## Estructura

```
docs/                  Documentación del proceso (SDD)
  PROJECT_SPEC.md      Descripción funcional de la aplicación
  ARCHITECTURE.md      Decisiones técnicas, tablas, servicios y frontend
  AI_SUMMARY.md        Resumen del uso de IA
  iterations/          Iteraciones del backend (práctica 1)
  iteraciones-prac4/   Iteraciones del frontend (práctica 4)
supabase/migrations/   SQL de tablas y políticas RLS
src/
  supabaseClient.js    Cliente de Supabase
  services/            Capa de servicios (casos de uso)
scripts/               Scripts auxiliares (usuarios de prueba)
tests/                 Pruebas automatizadas del backend (Vitest)
frontend-vue/          Frontend en Vue
frontend-react/        Frontend parcial en React (listado y borrado de eventos)
```

## Backend

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Copiar `.env.example` a `.env` y rellenar los datos del proyecto de Supabase (*Project Settings → API*):
   ```
   SUPABASE_URL=https://<id-proyecto>.supabase.co
   SUPABASE_ANON_KEY=<anon key>
   ```
3. Ejecutar las pruebas:
   ```bash
   npm test
   ```
   Si salta "Request rate limit reached", es el límite de registros de Supabase: hay que esperar unos minutos y volver a lanzarlas.

## Usuarios de prueba

Se crean con:

```bash
node --env-file=.env scripts/crear-usuarios-prueba.js
```

Si ya existen, el script solo comprueba que se puede iniciar sesión con ellos.

| Rol | Email | Contraseña |
|---|---|---|
| Organizador | cuebooking.organizador.prueba@gmail.com | prueba123 |
| DJ | cuebooking.dj.prueba@gmail.com | prueba123 |

## Frontend

1. Instalar dependencias:
   ```bash
   cd frontend-vue
   npm install
   ```
2. Copiar `frontend-vue/.env.example` a `frontend-vue/.env` con los mismos datos de Supabase que el backend:
   ```
   VITE_SUPABASE_URL=https://<id-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Arrancar en modo desarrollo (por defecto en http://localhost:5173):
   ```bash
   npm run dev
   ```
4. Ejecutar las pruebas (no necesitan el backend):
   ```bash
   npm test
   ```
5. Recorrido completo con el backend real (login, crear un evento, buscarlo en el listado, ver el detalle, editarlo, eliminarlo y cerrar la sesión). Necesita el `.env` del frontend y los usuarios de prueba creados; usa el organizador de prueba y borra el evento que crea:
   ```bash
   npm run test:real
   ```

El frontend usa la capa de servicios de `src/services` (alias `@backend`), así que necesita la carpeta `src` de la raíz, pero no su `node_modules`.

## Frontend parcial en React

Listado y borrado de eventos con React, usando la misma capa de servicios (`src/services`). Las instrucciones y las diferencias con Vue están en [frontend-react/README.md](frontend-react/README.md). Se instala y se prueba igual que el de Vue (`npm install`, `.env` a partir de `.env.example`, `npm run dev` y `npm test`, dentro de `frontend-react`).

## Documentación SDD

- Iteraciones del backend (práctica 1): `docs/iterations/` (01 a 04).
- Iteraciones del frontend (práctica 4): `docs/iteraciones-prac4/` (05 a 10). Cada una tiene SPEC, PLAN, TEST_PLAN, AI_LOG y COMMITS RELACIONADOS.

| Iteración | Contenido |
|---|---|
| 05 | Proyecto Vue y sesión (login y logout) |
| 06 | Listado de eventos con paginación |
| 07 | Detalle, crear, editar y eliminar eventos, y recorrido completo con el backend real |
| 08 | Búsqueda de eventos |
| 09 | Propuestas en el detalle del evento |
| 10 | Listado y borrado de eventos con React |

## Requerimientos adicionales implementados

| Apartado | Dónde |
|---|---|
| Búsqueda integrada con la paginación | Iteración 08. Por ciudad, género y fechas, en el backend (buscarEventos), con los filtros y la página en la URL |
| Navegación mediante un router | Vue Router desde la iteración 05: /, /login, /eventos, /eventos/nuevo, /eventos/:id y /eventos/:id/editar, con la página y los filtros en la URL y atrás/adelante |
| Biblioteca de componentes | PrimeVue (tema Aura) en formularios, mensajes, etiquetas, paginación, calendarios y diálogos de confirmación |
| Gestión de un recurso secundario | Iteración 09. Propuestas en el detalle del evento: listar, enviar y retirar, con validación y permisos |
| Implementación parcial con otro framework | Iteración 10. React en `frontend-react/`: login, listado paginado y borrado de eventos, con la misma capa de servicios |

## Limitaciones conocidas

- El frontend no tiene registro ni edición del perfil (están en el backend). Para probar la aplicación están los usuarios de prueba.
- La búsqueda por ciudad necesita el nombre entero de la ciudad (sin distinguir mayúsculas); no busca por una parte del nombre ni por título.
- No se puede modificar una propuesta, ni aceptarla o rechazarla.
- Al editar un evento que ya ha pasado, se puede cambiar el estado y los demás datos, pero si se cambia la fecha tiene que ser futura.
- El nombre del DJ de cada propuesta solo lo ve el organizador del evento, y se pide un perfil por DJ.
- El frontend de React solo tiene login, listado y borrado; no tiene router ni biblioteca de componentes, y la página del listado no está en la URL.
- Las pruebas del frontend son automáticas con mocks; el único recorrido con el backend real es `npm run test:real` en `frontend-vue`.
- Los tests del backend registran usuarios nuevos: si se lanzan varias veces seguidas, Supabase puede devolver "Request rate limit reached".

## Autor

Juan Vicente Esclapez — Aplicaciones Distribuidas en Internet (UA)
