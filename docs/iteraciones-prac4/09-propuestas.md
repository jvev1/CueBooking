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
- De cada propuesta se muestra el precio, la duración en minutos, la descripción y la fecha en que se envió.
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
- Mostrar el nombre del DJ que envía cada propuesta.
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
| Validar la propuesta sin precio ni duración | Error en los dos campos | |
| Validar con precio negativo | Error en el precio | |
| Validar con duración 0, 721 o con decimales | Error en la duración | |
| Validar con descripción de más de 1000 caracteres | Error en la descripción | |
| Validar con datos correctos | Sin errores | |
| Enviar una propuesta en el store | Llama al servicio y la añade a las propuestas del evento | |
| Retirar una propuesta en el store | Llama al servicio y la quita de las propuestas del evento | |
| Formatear la duración | "90 min" | |
| Detalle sin sesión o con otro organizador | No se ve la sección "Propuestas" | |
| Detalle con el organizador del evento | Ve todas las propuestas con precio, duración, descripción y fecha de envío, sin formulario | |
| Organizador sin propuestas | "Todavía no hay propuestas para este evento" | |
| DJ sin propuesta en un evento abierto | Ve el formulario | |
| DJ con su propuesta | Ve su propuesta con "Retirar" y no ve el formulario | |
| DJ en un evento cerrado o completado | "Este evento ya no acepta propuestas" y no ve el formulario | |
| Enviar el formulario vacío | Errores debajo de cada campo y no se llama al backend | |
| Enviar una propuesta correcta | Aparece en la lista sin recargar y deja de verse el formulario | |
| Mientras se envía | Botón cargando y desactivado | |
| El backend devuelve un error al enviar | Se muestra su mensaje ("Ya has enviado una propuesta a este evento") | |
| Pulsar "Retirar" | Sale el diálogo de confirmación | |
| Cancelar la retirada | No se retira y la propuesta sigue en la lista | |
| Confirmar la retirada | Desaparece de la lista y vuelve a salir el formulario | |
| El backend devuelve un error al retirar | Se muestra su mensaje y la propuesta sigue en la lista | |
| Tests de las iteraciones anteriores | Todos pasan | |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

### Prompt importante 1

### Decisión del estudiante:

### Correcciones manuales

## COMMITS RELACIONADOS
