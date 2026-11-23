# Iteración 10 - Listado y borrado de eventos con React

## SPEC

### Objetivo

Hacer en React, en un proyecto aparte, el listado y el borrado de eventos con el mismo backend y la misma capa de servicios que el frontend de Vue, y explicar las diferencias entre los dos frameworks.

### Requisitos

- Proyecto separado en /frontend-react del mismo repositorio, con su propio package.json.
- Login y logout, porque para borrar hace falta sesión:
  - formulario con email y contraseña, con la misma validación que en Vue (validarLogin)
  - con sesión se muestra el nombre y el rol del usuario y un botón "Cerrar sesión"
  - si falla, se muestra el mensaje del backend
- Listado de eventos:
  - se ve sin sesión, de 10 en 10, ordenados por fecha
  - de cada evento: título, fecha, ciudad y estado
  - botones "Anterior" y "Siguiente" con la página actual, el total de páginas y el total de eventos
  - indicador de carga, "Todavía no hay eventos publicados" si no hay ninguno y "No se han podido cargar los eventos" con "Reintentar" si falla
- Borrar un evento:
  - el botón "Eliminar" solo lo ve el organizador del evento
  - pide confirmación antes de borrar; si se cancela no se borra
  - al borrar se vuelve a cargar la página y el evento ya no aparece. Si la página se queda vacía, se va a la anterior.
  - si el backend devuelve un error, se muestra su mensaje
- En el README de frontend-react se explican brevemente las diferencias con Vue en los componentes y en la gestión del estado.

### Requisitos técnicos

- React con Vite.
- Se reutiliza la capa de servicios de la práctica 1 (src/services) con el alias @backend, igual que en Vue. No se copia.
- Estado de la sesión compartido con un Context de React; el del listado, con useState en su componente.

### Fuera de alcance

- Detalle, crear y editar eventos.
- Búsqueda, router y propuestas.
- Biblioteca de componentes.

## PLAN

1. Crear el proyecto en /frontend-react con `npm create vite@latest` (plantilla react). Añadir @supabase/supabase-js, el alias `@backend` a ../src en vite.config.js (con `server.fs.allow` y `resolve.dedupe`, como en Vue) y un .env.example con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
2. Sesión: SesionContext con un proveedor que guarda el usuario y su perfil, carga la sesión al arrancar (usuarioActual y obtenerPerfil) y da las funciones login y logout. Si obtenerPerfil falla, se cierra la sesión, como en Vue.
3. Componentes:
   - Cabecera: nombre, rol y "Cerrar sesión" con sesión; formulario de login sin ella (Login, con validarLogin y el botón desactivado mientras se envía)
   - ListadoEventos: página, total, carga y error con useState; pide la página con buscarEventos en un useEffect cada vez que cambia la página
   - TarjetaEvento: datos del evento y "Eliminar" solo para su organizador, con window.confirm antes de llamar a eliminarEvento
4. Tests automáticos con Vitest y Testing Library en frontend-react/tests, con los servicios sustituidos por mocks.
5. README de frontend-react con cómo instalarlo y arrancarlo y las diferencias con Vue. Añadir el extra al README principal y a ARCHITECTURE.md.
