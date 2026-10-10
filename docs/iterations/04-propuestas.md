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
| DJ envía una propuesta correcta | Se crea con su dj_id y estado "pendiente" | OK |
| Enviar propuesta sin precio | Error | OK |
| Enviar propuesta con precio negativo | Error | OK |
| Enviar propuesta con duración 0 o mayor que 720 | Error | OK |
| Enviar propuesta sin sesión | Error | OK |
| Un organizador envía una propuesta | Error | OK |
| Enviar propuesta a un evento que no existe | "Evento no encontrado" | OK |
| Enviar propuesta a un evento cerrado | Error | OK |
| El mismo DJ envía una segunda propuesta al mismo evento | Error | OK |
| Insertar una propuesta directamente en la tabla con otro dj_id | Error | OK |
| El organizador lista las propuestas de su evento | Ve las de todos los DJs, de la más antigua a la más reciente | OK |
| Un DJ lista las propuestas de un evento | Solo ve la suya | OK |
| Listar propuestas sin sesión | Lista vacía | OK |
| Ver un evento (organizador) | Devuelve el evento con sus propuestas | OK |
| Retirar mi propuesta | La propuesta ya no existe | OK |
| Retirar la propuesta de otro DJ | Error | OK |
| Borrar la propuesta de otro directamente en la tabla | No se borra | OK |
| Borrar un evento con propuestas | Sus propuestas también se borran | OK |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

Se usó IA para:
- ayuda con el documento de la iteración (PLAN y TEST_PLAN)
- ayuda con la migración de la tabla propuestas y sus políticas RLS
- ayuda con el código: src/services/propuestas.js y el cambio de obtenerEvento
- ayuda con los tests de tests/propuestas.test.js
- entender decisiones de la IA 
- revisar el código y los tests generados para encontrar puntos débiles

### Prompt importante 1

-Lee docs/iterations/04-propuestas.md y redacta un plan para su realización. No escribas código.

### Prompt importante 2

-Implementa el paso 1 del PLAN, crear supabase/migrations/20261010_03_propuestas.sql.

Antes de escribir, lee:
- docs/iterations/04-propuestas.md (SPEC y PLAN)
- supabase/migrations/20261006_01_perfiles.sql y 20261007_02_eventos.sql, y sigue su mismo estilo: comentario de cabecera, sección "Control de acceso (RLS)" y permisos por columna al final.

La tabla public.propuestas debe tener:
- id uuid primary key default gen_random_uuid()
- evento_id → eventos(id) on delete cascade, not null
- dj_id → perfiles(id) on delete cascade, not null
- precio numeric(10,2) not null, check >= 0
- duracion_minutos integer not null, check entre 1 y 720
- descripcion text, check char_length <= 1000
- estado text not null default 'pendiente'.
- creado_en timestamptz not null default now()
- unique (evento_id, dj_id)

Políticas RLS (todas "to authenticated"):
- select: el DJ autor (dj_id = auth.uid()) o el organizador del evento (exists en eventos con organizador_id = auth.uid())
- insert: dj_id = auth.uid(), el perfil tiene rol 'dj' y el evento existe y está en estado 'abierto'
- delete: solo el DJ autor
- sin política de update

Permisos por columna, como en eventos:
- revoke insert, update on propuestas from anon, authenticated
- grant insert (evento_id, dj_id, precio, duracion_minutos, descripcion) to authenticated, para que no se pueda elegir el estado

Solo crea ese archivo. Al terminar, explícame cada política en una línea y dime si hay algo del SPEC que la migración no cubra.

### Decisión del estudiante:

- La IA propuso check de estado en ('pendiente', 'aceptada', 'rechazada') pero se ha reducido a solo 'pendiente' de momento. Aceptar o rechazar propuestas está fuera de alcance en esta iteración, así que en ella ninguna propuesta puede tener otro estado. Cuando se implemente, se ampliará el check con una nueva migración.

### Prompt importante 3

Implementa el paso 4 del PLAN: cambia obtenerEvento en src/services/eventos.js para que devuelva el evento con sus propuestas.

- Reutiliza listarPropuestas de src/services/propuestas.js; no filtres las propuestas en el código, que lo haga la política RLS.
- Devuelve { ...evento, propuestas }. Si el evento no existe, sigue lanzando "Evento no encontrado".
- No toques los tests.

### Decisión del estudiante:

- Se acepta que obtenerEvento llame a listarPropuestas en vez de filtrar las propuestas a mano: así las propuestas que se ven las decide RLS (el organizador todas, un DJ solo la suya, sin sesión ninguna). Se comprobó que los tests de eventos seguían pasando.

### Correcciones manuales
- La IA puso como test el envío de una propuesta que solo servía para preparar el test de borrado en cascada. No comprobaba ningún requisito, así que se movió al beforeAll del bloque.

## COMMITS RELACIONADOS
e25f148cf6eaf2de63228fa1027283ec520cfffd - redactado spec it4
dfabc43e775290326a57ec655e4063d0dbad9923 - plan it4
b2b526ac74c05d2d2e7ae1be1e06b7d3c3fe4ca7 - test plan
40390ce4f69383699397790777b13c15c6845456 - tabla propuestas
240ac300a164297fd1bcde13b6fcc07c8487017b - validaciones
f2b762d68f4e7bae1fe0e09c93627f4c2ed98128 - propuestas.js
9aae8f4a51b34e8260f0a1baccce3c7ea5330bcc - añadidos test
