# Iteración 04 - Propuestas

## SPEC

### Objetivo

Que los DJs puedan enviar propuestas de sesión a los eventos, retirarlas, y que se puedan ver las propuestas de un evento.

### Requisitos

- Enviar una propuesta a un evento con precio, duración en minutos y descripción. La propuesta queda asociada al DJ que la envía y empieza en estado "pendiente".
- Validar los datos de la propuesta:
  - precio obligatorio, número y no negativo
  - duración obligatoria, entero entre 1 y 720 minutos
  - descripción opcional, como mucho 1000 caracteres
- Solo los usuarios con rol DJ pueden enviar propuestas. Un organizador no puede.
- Solo se pueden enviar propuestas a eventos en estado "abierto". Si el evento no existe sale "Evento no encontrado".
- Un DJ solo puede enviar una propuesta a cada evento.
- Listar las propuestas de un evento, ordenadas de la más antigua a la más reciente.
- Ver las propuestas:
  - el organizador del evento ve todas las propuestas de su evento
  - un DJ solo ve las suyas
  - sin sesión no se ve ninguna
- Ver un evento devuelve el evento con sus propuestas (las que el usuario puede ver según el punto anterior).
- Retirar una propuesta propia. La propuesta se borra.
- Nadie puede retirar la propuesta de otro DJ, tampoco accediendo directamente a la base de datos.
- Si se borra un evento se borran sus propuestas.

### Requisitos técnicos

- El control de acceso se hace con políticas RLS en la tabla propuestas.

### Fuera de alcance

- Modificar una propuesta.
- Aceptar o rechazar propuestas (cambiar el estado).
- Paginación de las propuestas.
- Reseñas.

## PLAN

1. Crear la tabla propuestas en supabase/migrations/20261010_03_propuestas.sql:
   - evento_id referencia a eventos y dj_id referencia a perfiles, los dos con on delete cascade
   - estado por defecto "pendiente" y checks de precio, duración y estado
   - unique (evento_id, dj_id) para que un DJ solo envíe una propuesta por evento
   - RLS select: el DJ autor y el organizador del evento
   - RLS insert: solo un usuario con rol dj, con dj_id igual a su id y a un evento en estado "abierto"
   - RLS delete: solo el DJ autor
   - sin permiso de update; al insertar no se puede elegir el estado
2. Añadir a src/services/validacion.js validarPropuesta (precio, duración y descripción).
3. Crear src/services/propuestas.js con enviarPropuesta(eventoId, datos), listarPropuestas(eventoId) y retirarPropuesta(id).
4. Cambiar obtenerEvento en src/services/eventos.js para que devuelva el evento con sus propuestas.
5. Crear los tests en tests/propuestas.test.js:
   - en un beforeAll se registran un organizador (con un evento abierto y otro cerrado) y dos DJs
   - en el afterAll se borran los eventos, y con ellos sus propuestas

## TEST_PLAN

### Tests automáticos

- tests/propuestas.test.js: enviar, listar y retirar propuestas, y ver un evento con sus propuestas.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| DJ envía una propuesta correcta | Se crea con su dj_id y estado "pendiente" | |
| Enviar propuesta sin precio | Error | |
| Enviar propuesta con precio negativo | Error | |
| Enviar propuesta con duración 0 o mayor que 720 | Error | |
| Enviar propuesta sin sesión | Error | |
| Un organizador envía una propuesta | Error | |
| Enviar propuesta a un evento que no existe | "Evento no encontrado" | |
| Enviar propuesta a un evento cerrado | Error | |
| El mismo DJ envía una segunda propuesta al mismo evento | Error | |
| Insertar una propuesta directamente en la tabla con otro dj_id | Error | |
| El organizador lista las propuestas de su evento | Ve las de todos los DJs, de la más antigua a la más reciente | |
| Un DJ lista las propuestas de un evento | Solo ve la suya | |
| Listar propuestas sin sesión | Lista vacía | |
| Ver un evento (organizador) | Devuelve el evento con sus propuestas | |
| Retirar mi propuesta | La propuesta ya no existe | |
| Retirar la propuesta de otro DJ | Error | |
| Borrar la propuesta de otro directamente en la tabla | No se borra | |
| Borrar un evento con propuestas | Sus propuestas también se borran | |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

Se usó IA para:
- ayuda con la documentación

### Prompt importante 1

-Lee docs/iterations/04-propuestas.md y redacta un plan para su realización. No escribas código.

### Correcciones manuales
