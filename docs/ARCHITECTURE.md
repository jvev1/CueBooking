# ARCHITECTURE

## Backend

- BaaS con Supabase (PostgreSQL + Supabase Auth)
- La autenticación se hará con tokens JWT generados por Supabase Auth. El cliente los envía en cada petición y las políticas RLS obtienen el usuario con `auth.uid()`
- El control de acceso se hace con políticas RLS en la base de datos
- El frontend accederá al backend a través de una capa de servicios en JavaScript, sin usar directamente la API de Supabase

## Frontend

- Todavía no decidido

## Tablas

### perfiles

Campos:
- id (el mismo que el usuario de Supabase Auth)
- nombre
- rol (organizador o dj)
- ciudad
- bio
- creado_en

### eventos

Campos:
- id
- organizador_id
- titulo
- descripcion
- fecha
- ciudad
- lugar
- genero
- presupuesto
- estado (abierto, cerrado o completado)
- creado_en

### propuestas

Campos:
- id
- evento_id
- dj_id
- precio
- duracion_minutos
- descripcion
- estado (pendiente, aceptada o rechazada)
- creado_en

### resenas

Campos:
- id
- evento_id
- autor_id
- puntuacion
- comentario
- creado_en

## Capa de servicios

- auth.js: registrar, login, logout, usuarioActual
- perfiles.js: obtenerPerfil, editarPerfil, listarDJs
- eventos.js: crearEvento, buscarEventos, obtenerEvento, modificarEvento, eliminarEvento
- propuestas.js: enviarPropuesta, listarPropuestas, modificarPropuesta, retirarPropuesta, cambiarEstadoPropuesta
- resenas.js: crearResena, listarResenas

## Estructura de carpetas

- src/services: capa de servicios (acceso al backend)
- src/supabaseClient.js: cliente de Supabase configurado desde `.env`
- supabase/migrations: scripts SQL de tablas, triggers y políticas RLS
- tests: pruebas automatizadas con Vitest
- frontend: por determinar
