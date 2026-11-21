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

| Caso | Resultado esperado | Resultado |
|---|---|---|
| Validar el formulario sin título, fecha ni ciudad | Error en los tres campos | |
| Validar con una fecha pasada | Error en la fecha | |
| Validar con presupuesto negativo | Error en el presupuesto | |
| Validar con datos correctos | Sin errores | |
| Cargar un evento en el store | Guarda el evento del detalle | |
| Cargar un evento que no existe | "Evento no encontrado" | |
| Crear, modificar y eliminar en el store | Llaman al servicio y, al modificar, se actualiza el evento del detalle | |
| Pulsar un evento del listado | Va a su detalle | |
| "Nuevo evento" en el listado | Lo ve un organizador y no lo ven un DJ ni un usuario sin sesión | |
| Detalle sin sesión | Muestra descripción, lugar y presupuesto, sin "Editar" ni "Eliminar" | |
| Detalle con el organizador del evento | "Editar" y "Eliminar" | |
| Detalle con otro organizador o un DJ | Sin "Editar" ni "Eliminar" | |
| Detalle de un evento que no existe | "Evento no encontrado" y enlace al listado | |
| Entrar en /eventos/nuevo sin sesión | Va a /login | |
| Entrar en /eventos/nuevo con un DJ | Va a /eventos | |
| Entrar en /eventos/:id/editar sin sesión | Va a /login | |
| Entrar en /eventos/:id/editar con un evento de otro | Va al detalle | |
| Crear con el formulario vacío | Errores debajo de cada campo y no se llama al backend | |
| Crear un evento correcto | Va al detalle del evento creado | |
| Mientras se guarda | Botón cargando y desactivado | |
| El backend devuelve un error al crear | Se muestra su mensaje y se sigue en el formulario | |
| Abrir la edición | El formulario sale con los datos actuales y el campo de estado | |
| Cancelar la edición | Vuelve al detalle y no se llama al backend | |
| Guardar la edición | Vuelve al detalle con los datos nuevos | |
| Pulsar "Eliminar" | Sale el diálogo de confirmación | |
| Cancelar el borrado | No se borra y se sigue en el detalle | |
| Confirmar el borrado | Va al listado | |
| El backend devuelve un error al borrar | Se muestra su mensaje y se sigue en el detalle | |
| Recorrido completo con el backend real (`npm run test:real`, organizador de prueba) | Inicia sesión, crea el evento, lo encuentra en el listado, abre el detalle, lo edita, lo elimina (ya no está en el listado) y cierra la sesión | |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

### Prompt importante 1
Lee la SPEC y el PLAN de `docs/iteraciones-prac4/06-listado-eventos.md` y genera la sección TEST_PLAN con el mismo formato que la de la iteración 05: una tabla con las columnas "Caso | Resultado esperado | Resultado", con la columna Resultado vacía. Incluye un caso por cada requisito de la SPEC y por cada paso del PLAN que se pueda probar (store, vista, componentes, formato y regresión de los tests anteriores), incluidos los casos límite: página de la URL inválida o mayor que la última, listado vacío, error con "Reintentar" y respuestas desordenadas. Frases cortas, sin casos que la SPEC deja fuera de alcance. No escribas código ni tests todavía.

### Decisión del estudiante:
- Acepté la tabla de casos que propuso la IA porque cubre todos los requisitos de la SPEC y los pasos del PLAN que se pueden probar.

### Correcciones manuales
- Se acepta el uso de un solo formulario para crear y editar. Así las validaciones y los campos no se repiten. El campo de estado solo aparece al editar.


## COMMITS RELACIONADOS
