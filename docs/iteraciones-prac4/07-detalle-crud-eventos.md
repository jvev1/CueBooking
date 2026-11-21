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

1. Store `eventos`: añadir el evento del detalle (con su carga y su error) y las acciones cargarEvento, crearEvento, modificarEvento y eliminarEvento, que llaman a los servicios de eventos.js. Al modificar se actualiza el evento del detalle. El listado se vuelve a pedir al entrar en /eventos, así que siempre muestra los cambios.
2. Añadir validarFormularioEvento al validacion.js del backend, con las mismas reglas que validarEvento, pero que devuelve los errores por campo, como validarLogin.
3. Rutas /eventos/nuevo (NuevoEventoView), /eventos/:id (DetalleEventoView) y /eventos/:id/editar (EditarEventoView), con guards:
   - sin sesión, nuevo y editar llevan a /login
   - un DJ que entra en nuevo va a /eventos
   - en editar se carga el evento y, si no es del usuario, se va al detalle
4. Componentes:
   - TarjetaEvento enlaza al detalle, y EventosView tiene el botón "Nuevo evento" para los organizadores
   - DetalleEventoView: datos del evento, "Evento no encontrado", y "Editar" y "Eliminar" solo para el organizador del evento. Eliminar pide confirmación con ConfirmDialog de PrimeVue.
   - FormularioEvento: formulario común a crear y editar (InputText, Textarea, DatePicker, Select e InputNumber de PrimeVue), con los errores debajo de cada campo, el estado solo al editar, el botón cargando y "Cancelar"
   - NuevoEventoView y EditarEventoView usan FormularioEvento y muestran el error del backend si falla
5. Tests automáticos en frontend-vue/tests con los servicios sustituidos por mocks.
6. Recorrido completo con el backend real: test en frontend-vue/tests-real/recorrido.test.js que monta la aplicación sin mocks y, con el organizador de prueba, inicia sesión, crea un evento, lo busca en el listado, abre el detalle, lo edita, lo elimina y cierra la sesión. Se ejecuta aparte con `npm run test:real`. Actualizar ARCHITECTURE.md y README.md.

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
