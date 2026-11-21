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
| Validar el formulario sin título, fecha ni ciudad | Error en los tres campos | OK |
| Validar con una fecha pasada | Error en la fecha | OK |
| Validar con presupuesto negativo | Error en el presupuesto | OK |
| Validar con datos correctos | Sin errores | OK |
| Cargar un evento en el store | Guarda el evento del detalle | OK |
| Cargar un evento que no existe | "Evento no encontrado" | OK |
| Crear, modificar y eliminar en el store | Llaman al servicio y, al modificar, se actualiza el evento del detalle | OK |
| Pulsar un evento del listado | Va a su detalle | OK |
| "Nuevo evento" en el listado | Lo ve un organizador y no lo ven un DJ ni un usuario sin sesión | OK |
| Detalle sin sesión | Muestra descripción, lugar y presupuesto, sin "Editar" ni "Eliminar" | OK |
| Detalle con el organizador del evento | "Editar" y "Eliminar" | OK |
| Detalle con otro organizador o un DJ | Sin "Editar" ni "Eliminar" | OK |
| Detalle de un evento que no existe | "Evento no encontrado" y enlace al listado | OK |
| Entrar en /eventos/nuevo sin sesión | Va a /login | OK |
| Entrar en /eventos/nuevo con un DJ | Va a /eventos | OK |
| Entrar en /eventos/:id/editar sin sesión | Va a /login | OK |
| Entrar en /eventos/:id/editar con un evento de otro | Va al detalle | OK |
| Crear con el formulario vacío | Errores debajo de cada campo y no se llama al backend | OK |
| Crear un evento correcto | Va al detalle del evento creado | OK |
| Mientras se guarda | Botón cargando y desactivado | OK |
| El backend devuelve un error al crear | Se muestra su mensaje y se sigue en el formulario | OK |
| Abrir la edición | El formulario sale con los datos actuales y el campo de estado | OK |
| Cancelar la edición | Vuelve al detalle y no se llama al backend | OK |
| Guardar la edición | Vuelve al detalle con los datos nuevos | OK |
| Pulsar "Eliminar" | Sale el diálogo de confirmación | OK |
| Cancelar el borrado | No se borra y se sigue en el detalle | OK |
| Confirmar el borrado | Va al listado | OK |
| El backend devuelve un error al borrar | Se muestra su mensaje y se sigue en el detalle | OK |
| Recorrido completo con el backend real (`npm run test:real`, organizador de prueba) | Inicia sesión, crea el evento, lo encuentra en el listado, abre el detalle, lo edita, lo elimina (ya no está en el listado) y cierra la sesión | OK |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

Se usó IA para:
- ayuda con el documento de la iteración (PLAN y TEST_PLAN)
- ayuda con el código: store de eventos (detalle, crear, modificar y eliminar), validarFormularioEvento, rutas con guards, DetalleEventoView, FormularioEvento, NuevoEventoView y EditarEventoView
- ayuda con los tests del frontend con mocks y con el recorrido completo con el backend real (tests-real/recorrido.test.js)
- ayuda con la actualización de ARCHITECTURE.md y README.md

### Prompt importante 1
Lee la SPEC y el PLAN de la iteracion 7 y genera la sección TEST_PLAN con el mismo formato que la de la iteración 05: una tabla con las columnas "Caso | Resultado esperado | Resultado", con la columna Resultado vacía. Incluye un caso por cada requisito de la SPEC y por cada paso del PLAN que se pueda probar (store, vista, componentes, formato y regresión de los tests anteriores), incluidos los casos límite: página de la URL inválida o mayor que la última, listado vacío, error con "Reintentar" y respuestas desordenadas. Frases cortas, sin casos que la SPEC deja fuera de alcance. No escribas código ni tests todavía.

### Decisión del estudiante:
- Acepté la tabla de casos que propuso la IA porque cubre todos los requisitos de la SPEC y los pasos del PLAN que se pueden probar.

### Prompt importante 2
Implementa ahora el paso 4 del PLAN de `docs/iteraciones-prac4/07-detalle-crud-eventos.md` (componentes), partiendo de lo ya hecho en los pasos 1 a 3. Lee antes la SPEC y el código actual de `frontend-vue/` y reutiliza el store `eventos`, `validarFormularioEvento` y los componentes existentes. Haz solo lo que pide la SPEC, con componentes de PrimeVue y el mismo estilo e idioma del código. Cuando termines, ejecuta los tests y el build, y resume qué archivos has creado o cambiado. No hagas commits.

### Decisión del estudiante:
- Acepté un único FormularioEvento para crear y editar, porque así los campos y las validaciones no se repiten. El campo de estado solo aparece al editar.

### Correcciones manuales
- frontend-vue/src/components/FormularioEvento.vue: el calendario dejaba elegir fechas pasadas y el error solo salía al guardar. Añadí min-date para que solo se puedan elegir fechas futuras. La validación al enviar se mantiene.

## COMMITS RELACIONADOS
08417dc415e47bcbf93899e683beb134b6054059 - spec it 07
a1cde779a4828610d51aca8980c996f393c9ddf2 - plan it7
4c9e790ce1556ab289266bd2c8d7a1ee5fec9c90 - test plan
bf575b316f5649816d1593d1fb542b034113763e - store, validacion y rutas de eventos
bb8d6d360efc39aed5f76a107e2707c02b9d3a33 - detalle, crear, editar y eliminar eventos
0eafe13a7c85d18f043f6e5f0cb18512c496b8db - tests y doc
336497348fb20c460975c74658c27e3ce0a61397 - solo elegir fechas futuras en el calendario
