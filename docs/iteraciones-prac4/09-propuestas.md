# Iteración 09 - Propuestas en el detalle del evento

## SPEC

### Objetivo

Que desde el detalle de un evento los DJs puedan enviar y retirar sus propuestas, y que el organizador vea las que ha recibido.

### Requisitos

- En el detalle del evento hay una sección "Propuestas".
- Qué propuestas se ven (lo decide el backend):
  - el organizador del evento ve todas las de su evento
  - un DJ solo ve la suya
  - sin sesión o con otro organizador no se ve la sección
- De cada propuesta se muestra el precio, la duración en minutos, la descripción y la fecha en que se envió. El organizador ve también el nombre del DJ.
- Si el organizador todavía no tiene propuestas, sale "Todavía no hay propuestas para este evento".
- Enviar una propuesta:
  - solo un DJ, solo si el evento está abierto y si todavía no ha enviado una a ese evento
  - formulario con precio, duración en minutos y descripción
  - validación antes de enviar, con el error debajo de cada campo: precio obligatorio y no negativo, duración obligatoria y entera entre 1 y 720, descripción de 1000 caracteres como mucho
  - al enviarla aparece en la lista sin recargar la página y ya no se muestra el formulario
  - si el evento no está abierto, en lugar del formulario sale "Este evento ya no acepta propuestas"
- Retirar una propuesta:
  - el DJ tiene un botón "Retirar" en la suya, que pide confirmación
  - al retirarla desaparece de la lista y vuelve a salir el formulario
- Mientras se envía o se retira, el botón está cargando y desactivado.
- Si el backend devuelve un error (por ejemplo "Ya has enviado una propuesta a este evento"), se muestra su mensaje.

### Fuera de alcance

- Modificar una propuesta.
- Aceptar o rechazar propuestas.
- Paginar las propuestas.

## PLAN

1. Store `eventos`: obtenerEvento ya devuelve el evento con las propuestas que el usuario puede ver según RLS, así que se usan las de evento.propuestas. Añadir las acciones enviarPropuesta(eventoId, datos) y retirarPropuesta(id), que llaman a propuestas.js y añaden o quitan la propuesta de evento.propuestas, para que la lista cambie sin recargar.
2. Añadir validarFormularioPropuesta al validacion.js del backend, con las mismas reglas que validarPropuesta, pero que devuelve los errores por campo, como en los otros formularios.
3. Componentes:
   - PropuestasEvento: sección del detalle con la lista de propuestas (precio, duración, descripción y fecha de envío), el mensaje de "Todavía no hay propuestas" para el organizador, el formulario para el DJ que no ha enviado ninguna, "Este evento ya no acepta propuestas" si el evento no está abierto, y "Retirar" en la propuesta del DJ, con confirmación (ConfirmDialog, el mismo del detalle).
   - FormularioPropuesta: precio y duración con InputNumber y descripción con Textarea de PrimeVue, con los errores debajo de cada campo y el botón cargando.
   - DetalleEventoView muestra PropuestasEvento solo al organizador del evento y a los DJs.
4. Función de formato para la duración (por ejemplo "90 min") en utils/formato.js. El precio usa la misma que el presupuesto.
5. Tests automáticos en frontend-vue/tests con los servicios sustituidos por mocks. Actualizar ARCHITECTURE.md.

## TEST_PLAN

| Caso | Resultado esperado | Resultado |
|---|---|---|
| Validar la propuesta sin precio ni duración | Error en los dos campos | OK |
| Validar con precio negativo | Error en el precio | OK |
| Validar con duración 0, 721 o con decimales | Error en la duración | OK |
| Validar con descripción de más de 1000 caracteres | Error en la descripción | OK |
| Validar con datos correctos | Sin errores | OK |
| Enviar una propuesta en el store | Llama al servicio y la añade a las propuestas del evento | OK |
| Retirar una propuesta en el store | Llama al servicio y la quita de las propuestas del evento | OK |
| Formatear la duración | "90 min" | OK |
| Detalle sin sesión o con otro organizador | No se ve la sección "Propuestas" | OK |
| Detalle con el organizador del evento | Ve todas las propuestas con precio, duración, descripción y fecha de envío, sin formulario | OK |
| Organizador con propuestas de varios DJs | Ve el nombre del DJ de cada propuesta | OK |
| Organizador sin propuestas | "Todavía no hay propuestas para este evento" | OK |
| DJ sin propuesta en un evento abierto | Ve el formulario | OK |
| DJ con su propuesta | Ve su propuesta con "Retirar" y no ve el formulario | OK |
| DJ en un evento cerrado o completado | "Este evento ya no acepta propuestas" y no ve el formulario | OK |
| Enviar el formulario vacío | Errores debajo de cada campo y no se llama al backend | OK |
| Enviar una propuesta correcta | Aparece en la lista sin recargar y deja de verse el formulario | OK |
| Mientras se envía | Botón cargando y desactivado | OK |
| El backend devuelve un error al enviar | Se muestra su mensaje ("Ya has enviado una propuesta a este evento") | OK |
| Pulsar "Retirar" | Sale el diálogo de confirmación | OK |
| Cancelar la retirada | No se retira y la propuesta sigue en la lista | OK |
| Confirmar la retirada | Desaparece de la lista y vuelve a salir el formulario | OK |
| El backend devuelve un error al retirar | Se muestra su mensaje y la propuesta sigue en la lista | OK |
| Tests de las iteraciones anteriores | Todos pasan | OK |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado
- ayuda con el documento de la iteración (PLAN y TEST_PLAN)
- ayuda con el código: acciones enviarPropuesta y retirarPropuesta en el store de eventos, validarFormularioPropuesta, PropuestasEvento, FormularioPropuesta y los cambios en DetalleEventoView
- ayuda con los tests de las propuestas (tests/propuestas.test.js)
- ayuda con la actualización de ARCHITECTURE.md

### Prompt importante 1
Lee la SPEC de `docs/iteraciones-prac4/09-propuestas.md` y el código actual del store eventos, DetalleEventoView y los servicios propuestas.js y validacion.js del backend. Propón un PLAN de 5 pasos numerados con el mismo formato que el de la iteración 08. Reutiliza lo que ya existe (obtenerEvento con sus propuestas, ConfirmDialog del detalle, formato del presupuesto) y ten en cuenta que las propuestas que se ven las decide RLS en el backend. No escribas código todavía.

### Prompt importante 2
Implementa el paso 3 del PLAN de `docs/iteraciones-prac4/09-propuestas.md`. Tenienedo en cuenta la SPEC, con componentes de PrimeVue y el mismo estilo que FormularioEvento y DetalleEventoView. Cuando termines resume qué archivos has creado o cambiado. No hagas commits.

### Decisión del estudiante:
- Acepté reutilizar el ConfirmDialog del detalle para retirar, en lugar de añadir otro.

### Correcciones manuales
- Al enviar la propuesta, el formulario desaparecía y en su lugar salía la propuesta sin ninguna indicación, así que no quedaba claro que era la del DJ y que ya estaba enviada. Añadí un Tag "Tu propuesta" cuando la propuesta es del usuario de la sesión (propuesta.dj_id === sesion.usuario.id).
- Añadí la función cargarNombresDj, que obtiene el nombre de cada DJ con obtenerPerfil y lo guarda en nombresDj por su id, porque las propuestas solo guardan el dj_id. Si no se puede obtener un nombre, la propuesta se sigue mostrando sin él.

## COMMITS RELACIONADOS
3a85dab5f4d0d8c196278c6400b859c7ad9a17cf - spec it9
753fa64659522275c8a36831e594d8d069dad3c0 - plan
50f1d8b7cc4f82295a8364c36709b36d7b879cfc - test plan
a3423d39ef87ad82c7ccfd6df59a3dea8e11efe5 - propuestas en el store y validacion
e0bd05479fb7a5d34e51a32b751a56654544400b - seccion de propuestas en el detalle
6f4140bfc8d77bc6f2f5dc7763af307a4063013f - tests it9
d5e37224f9a2321aefc0b0953908ad39cc0bf1e7 - marcar la propuesta propia del dj
05a16da69c5e8edf43574f4f9983fced3f2b502d - nombre del dj en las propuestas
