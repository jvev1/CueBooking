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

