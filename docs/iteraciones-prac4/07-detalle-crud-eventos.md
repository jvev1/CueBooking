# Iteración 07 - Detalle, crear, editar y eliminar eventos

## SPEC

### Objetivo

Poder ver el detalle de un evento y que los organizadores puedan crear eventos y editar o eliminar los suyos.

### Requisitos

- Detalle de un evento en /eventos/:id, al que se llega pulsando un evento del listado. Se ve sin sesión.
  - muestra lo mismo que el listado y además la descripción, el lugar y el presupuesto
  - si el evento no existe, sale "Evento no encontrado" y un enlace para volver al listado
- Crear un evento en /eventos/nuevo, con un botón "Nuevo evento" en el listado que solo ven los organizadores.
  - campos: título, descripción, fecha y hora, ciudad, lugar, género y presupuesto
  - al guardar se va al detalle del evento creado
- Editar un evento en /eventos/:id/editar, con un botón "Editar" en el detalle que solo ve el organizador del evento.
  - el formulario sale con los datos actuales, y además se puede cambiar el estado
  - "Cancelar" vuelve al detalle sin guardar nada
  - al guardar se vuelve al detalle con los datos nuevos
- Eliminar un evento con un botón "Eliminar" en el detalle que solo ve el organizador del evento.
  - antes de borrar sale un diálogo de confirmación. Si se cancela, no se borra
  - al borrar se vuelve al listado y el evento ya no aparece
- Validación de los formularios antes de enviarlos, con el error debajo de cada campo:
  - título obligatorio
  - fecha obligatoria y futura
  - ciudad obligatoria
  - presupuesto opcional, número y no negativo
- Mientras se guarda o se borra, el botón está cargando y desactivado.
- Si el backend devuelve un error (por ejemplo de permisos), se muestra su mensaje y el usuario sigue en el formulario o en el detalle.
- Si se entra por URL sin permiso:
  - sin sesión, /eventos/nuevo y /eventos/:id/editar llevan al login
  - con rol DJ, /eventos/nuevo lleva al listado
  - si el evento no es suyo, /eventos/:id/editar lleva al detalle
- Después de crear, editar o eliminar, el listado y el detalle muestran los cambios sin recargar la página.

### Fuera de alcance

- Propuestas en el detalle (iteración 09).
- Mostrar el nombre del organizador en el detalle.

## PLAN

## TEST_PLAN

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
