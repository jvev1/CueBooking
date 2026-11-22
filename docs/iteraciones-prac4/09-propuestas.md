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
