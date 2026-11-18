# CueBooking

Aplicación para que organizadores de eventos publiquen fechas y necesidades musicales y los DJs se postulen enviando propuestas de sesión.

- **Backend**: **Supabase** (PostgreSQL + Auth), expuesto mediante una **capa de servicios en JavaScript** (`src/services/`), de forma que el cliente no necesita conocer la API de Supabase.
- **Frontend**: **Vue 3** con Pinia, Vue Router y PrimeVue, en `frontend-vue/`.

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
node scripts/crear-usuarios-prueba.js
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

## Autor

Juan Vicente Esclapez — Aplicaciones Distribuidas en Internet (UA)
