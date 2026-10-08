# Iteración 02 - Eventos

## SPEC

### Objetivo

Implementar el CRUD de eventos: los organizadores crean, editan y borran sus eventos, y cualquiera puede verlos.

### Requisitos

- Crear un evento con título, descripción, fecha, ciudad, lugar, género musical y presupuesto. El evento queda asociado al organizador que lo crea y empieza en estado "abierto".
- Validar los datos del evento:
  - título obligatorio 
  - fecha obligatoria y futura
  - ciudad obligatoria
  - presupuesto opcional, pero si se indica no puede ser negativo
  - género opcional, pero si se indica tiene que ser uno de: techno, house, reggaeton, pop, rock, comercial u otro
  - estado solo puede ser abierto, cerrado o completado
- Solo los usuarios con rol organizador pueden crear eventos. Un DJ no puede.
- Ver un evento aunque no se haya iniciado sesión. Si no existe sale "Evento no encontrado".
- Editar un evento propio (título, descripción, fecha, ciudad, lugar, género, presupuesto y estado).
- El organizador de un evento no se puede cambiar.
- Borrar un evento propio.
- Nadie puede editar ni borrar el evento de otro organizador, tampoco accediendo directamente a la base de datos.

### Requisitos técnicos

- El control de acceso se hace con políticas RLS en la tabla eventos.
    
### Fuera de alcance

- Listar eventos con paginación y filtros (ciudad, fecha, género).
- Ver las propuestas de un evento.
- Propuestas y reseñas.

## PLAN

1. Crear la tabla eventos en supabase/migrations/20261007_02_eventos.sql:
   - organizador_id referencia a perfiles, estado por defecto "abierto" y checks de los campos
   - RLS: todos pueden leer los eventos
   - RLS: solo puede insertar un usuario con rol organizador y con organizador_id igual a su id
   - RLS: solo el dueño puede actualizar y borrar
   - no se permite actualizar organizador_id ni creado_en
2. Añadir a src/services/validacion.js validarEvento y validarEdicionEvento.
3. Crear src/services/eventos.js con crearEvento, obtenerEvento, modificarEvento y eliminarEvento.
4. Crear los tests en tests/eventos.test.js.

## TEST_PLAN

### Tests automáticos

- tests/eventos.test.js: crear, ver, editar y borrar eventos.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Organizador crea un evento correcto | Se crea con su organizador_id y estado "abierto" | |
| Crear evento sin título | Error | |
| Crear evento con fecha pasada | Error | |
| Crear evento sin ciudad | Error | |
| Crear evento con presupuesto negativo | Error | |
| Crear evento con un género que no está en la lista | Error | |
| Crear evento sin sesión | Error | |
| Un DJ crea un evento | Error | |
| Insertar un evento directamente en la tabla con otro organizador_id | Error | |
| Ver evento sin sesión | Devuelve el evento | |
| Ver evento que no existe | "Evento no encontrado" | |
| Editar mi evento | Se guardan los cambios | |
| Editar con estado no válido | Error | |
| Cambiar el organizador del evento | Error | |
| Editar el evento de otro organizador | Error | |
| Editar el evento de otro directamente en la tabla | No cambia nada | |
| Borrar mi evento | El evento ya no existe | |
| Borrar el evento de otro organizador | Error | |
| Borrar el evento de otro directamente en la tabla | No se borra | |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

Se usó IA para:
- ayuda con el documento de la iteración

### Prompt importante 1

Ayudame a trazar el plan para realizar el CRUD de eventos.(añadiendole como argumentos ejemplos un plan)

Resultado: la IA redactó un PLAN bien organizado.

### Decisión del estudiante:

Dejarlo tal cual lo propone.

### Prompt importante 2

Vamos con el paso 4 del plan de docs/iterations/02-eventos.md: crear tests/eventos.test.js.

- Cubre todos los casos de la tabla del TEST_PLAN, un it por fila y en el mismo orden.
- Sigue el estilo de tests/usuarios.test.js: vitest, emailUnico(), PASSWORD, registrar/login/logout
  de los servicios
- En un beforeAll registra 3 usuarios: dos organizadores (A y B) y un DJ. Antes de cada bloque,
  haz login con el usuario que toque y logout al terminar.
- Cada test debe ser independiente

### Decisión del estudiante:

- En `tests/eventos.test.js` la IA metió todos los tests en un único describe e hizo login y logout dentro de cada test (unos 25 logins por ejecución).Al lanzarlo fallaban tests (también de usuarios.test.js) con "Email o contraseña incorrectos",por límite de peticiones de Supabase Auth. Se reorganizaron los tests en bloques por usuario, con un login en el beforeAll de cada bloque. Ahora se hacen unos 6 logins.


### Correcciones manuales

- La IA dejó el campo `genero` de la tabla eventos como texto libre. Se cambió para que solo admita valores de una lista (techno, house, reggaeton, pop, rock, comercial y otro).


