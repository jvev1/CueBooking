# CueBooking — Backend (Supabase)

Backend de **CueBooking**, una plataforma para que organizadores de eventos publiquen fechas y necesidades musicales y los DJs se postulen enviando propuestas de sesión.

El backend está implementado sobre **Supabase** (PostgreSQL + Auth) y se expone al futuro frontend mediante una **capa de servicios en JavaScript** (`src/services/`), de forma que el cliente no necesita conocer la API de Supabase.

## Estructura

```
docs/                  Documentación del proceso (SDD)
  PROJECT_SPEC.md      Descripción funcional de la aplicación
  ARCHITECTURE.md      Decisiones técnicas, tablas y servicios
  AI_SUMMARY.md        Resumen del uso de IA
  iterations/          Un documento por iteración (SPEC, PLAN, TEST_PLAN, AI_LOG, commits)
supabase/migrations/   SQL de tablas y políticas RLS
src/
  supabaseClient.js    Cliente de Supabase
  services/            Capa de servicios (casos de uso)
tests/                 Pruebas automatizadas (Vitest)
```

## Puesta en marcha

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

## Autor

Juan Vicente Esclapez — Aplicaciones Distribuidas en Internet (UA)
