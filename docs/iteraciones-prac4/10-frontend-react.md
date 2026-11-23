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

## TEST_PLAN

| Caso | Resultado esperado | Resultado |
|---|---|---|
| Login con el formulario vacío | Errores en los campos y no se llama al backend | OK |
| Login correcto | Muestra el nombre, el rol y "Cerrar sesión" | OK |
| Login incorrecto | "Email o contraseña incorrectos" | OK |
| Cerrar sesión | Vuelve el formulario de login y desaparecen los botones "Eliminar" | OK |
| Cargar la sesión guardada al arrancar | Se ve el usuario sin volver a iniciar sesión | OK |
| Mientras se cargan los eventos | Indicador de carga | OK |
| Listado con eventos | Título, fecha, ciudad y estado de cada uno | OK |
| Listado vacío | "Todavía no hay eventos publicados" | OK |
| Falla la carga | "No se han podido cargar los eventos" y "Reintentar", que vuelve a pedir la página | OK |
| Pulsar "Siguiente" y "Anterior" | Pide la página siguiente o la anterior y actualiza la página actual | OK |
| "Anterior" en la primera página y "Siguiente" en la última | Desactivados | OK |
| "Eliminar" sin sesión, con un DJ o con otro organizador | No se ve | OK |
| "Eliminar" con el organizador del evento | Se ve | OK |
| Cancelar la confirmación | No se llama a eliminarEvento | OK |
| Confirmar el borrado | Llama a eliminarEvento y vuelve a cargar la página | OK |
| Borrar el único evento de la última página | Va a la página anterior | OK |
| El backend devuelve un error al borrar | Se muestra su mensaje | OK |
| Tests del frontend de Vue y del backend | Siguen pasando | OK |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado
- ayuda con el documento de la iteración (PLAN y TEST_PLAN)
- ayuda con el código: proyecto React con Vite y el alias @backend, SesionContext, Cabecera, Login, ListadoEventos y TarjetaEvento
- ayuda con los tests con Vitest y Testing Library (tests/app.test.jsx)

### Prompt importante 1
Lee la SPEC de `docs/iteraciones-prac4/10-frontend-react.md` y cómo está montado el frontend de Vue (alias `@backend` en vite.config.js, store de sesión, EventosView). Propón un PLAN de 5 pasos numerados con el mismo formato que el de las iteraciones anteriores, para hacer lo mismo en React reutilizando la capa de servicios de `src/services`. No escribas código todavía.

### Decisión del estudiante:
- Acepté el PLAN de 5 pasos que propuso la IA, porque sigue el mismo orden que en Vue (proyecto, sesión, componentes, tests y documentación) y cubre todos los requisitos de la SPEC.

## COMMITS RELACIONADOS
a040c3debd7af8a53c3a4d081a8a819aaed4481a - spec it 10
1f17e93ae23e3ada4654d8632f4f3b6c5cceb5cb - plan it10
ec71359b8e7183612d89fa8a4eaf4fd5e6cfdb7c - test plan
5951db017a67caee42136da6530f276130981be4 - proyecto react y sesion
f24dc46ffc3a68851f632c5b8dc2c85807787599 - listado y borrado de eventos en react
8107051b04f25f1adee406c1ea15d4126fcdbd68 - tests y documentacion it10
