# Iteración 06 - Listado de eventos

## SPEC

### Objetivo

Que cualquier usuario, con o sin sesión, pueda ver el listado de eventos y recorrer sus páginas.

### Requisitos

- Página /eventos con el listado de eventos. En la cabecera hay un enlace "Eventos" que lleva a ella, con o sin sesión.
- Los eventos se ordenan por fecha, del más próximo al más lejano, y se muestran de 10 en 10.
- De cada evento se muestra:
  - título
  - fecha y hora, en formato dd/mm/aaaa hh:mm
  - ciudad
  - género musical (si tiene)
  - estado (Abierto, Cerrado o Completado)
- Paginación:
  - debajo del listado se indica la página actual, el número total de páginas y el total de eventos
  - botones para ir a la página anterior y a la siguiente. "Anterior" está desactivado en la primera página y "Siguiente" en la última.
  - si solo hay una página, no se muestran los botones
  - la página está en la URL (/eventos?pagina=2), así que se puede entrar directamente a una página y los botones atrás y adelante del navegador cambian de página
  - si la página de la URL no es un número entero mayor que 0, se muestra la página 1
  - si la página de la URL es mayor que la última, sale el mensaje "Esta página no existe" y un botón para ir a la primera página
- Mientras se cargan los eventos, se muestra un indicador de carga en lugar del listado.
- Si no hay ningún evento, sale el mensaje "Todavía no hay eventos publicados".
- Si falla la carga, sale el mensaje "No se han podido cargar los eventos" y un botón "Reintentar" que vuelve a pedir la misma página. El mensaje de error es distinto del de listado vacío.

### Requisitos técnicos

- El listado, el total, la página actual, si se está cargando y el error se guardan en un store de Pinia `eventos`, porque los van a usar el listado, el detalle y los formularios de las siguientes iteraciones.
- Los eventos se obtienen con buscarEventos de eventos.js, que pagina en el servidor. No se descargan todos los eventos para paginarlos en el cliente.
- Componentes de PrimeVue para el listado, los mensajes y la paginación.

### Fuera de alcance

- Ver el detalle de un evento, crearlo, editarlo y eliminarlo (iteración 07).
- Filtrar y buscar eventos (iteración 08).
- Elegir cuántos eventos se muestran por página.

## PLAN

1. Usar la capa de servicios de la práctica 1 en lugar de copiarla, ya que el frontend está en el mismo repositorio:
   - src/supabaseClient.js lee las variables de `import.meta.env` en el navegador y de `process.env` en Node. Se quita el import de dotenv: el .env se carga con `setupFiles: ['dotenv/config']` en vitest.config.js y con `node --env-file=.env` en el script de usuarios de prueba.
   - Mover validarLogin al validacion.js del backend.
   - En el frontend, alias `@backend` a ../src en vite.config.js (con `server.fs.allow`) e importar los servicios desde ahí. Borrar frontend-vue/src/services y frontend-vue/src/supabaseClient.js.
   - Comprobar que los tests del backend y del frontend siguen pasando. Actualizar el README.
2. Store de Pinia `eventos` con la lista, el total, la página, el tamaño (10), si se está cargando y el error, y el getter totalPaginas. La acción cargarPagina(pagina) llama a buscarEventos y, si falla, guarda "No se han podido cargar los eventos". Si llegan dos respuestas desordenadas (por ejemplo, al pulsar atrás y adelante muy rápido), solo se guarda la de la última petición.
3. Ruta /eventos (EventosView). La vista lee la página de `?pagina` (si no es un entero mayor que 0, usa 1) y llama a cargarPagina cada vez que cambia. Los botones de página hacen router.push con la nueva página, para que funcionen atrás y adelante.
4. Componentes:
   - EventosView: indicador de carga, mensaje de error con "Reintentar", mensaje de listado vacío, mensaje de "Esta página no existe" con botón a la primera página, y el listado
   - TarjetaEvento: título, fecha en formato dd/mm/aaaa hh:mm, ciudad, género y estado con un Tag de PrimeVue
   - PaginacionEventos: "Anterior" y "Siguiente", página actual, total de páginas y total de eventos. No se muestra si solo hay una página.
   - CabeceraApp: enlace "Eventos"
5. Funciones de formato (fecha y nombre del estado) en frontend-vue/src/utils/formato.js.
6. Tests automáticos en frontend-vue/tests con los servicios sustituidos por mocks. Actualizar ARCHITECTURE.md.

## TEST_PLAN

| Caso | Resultado esperado | Resultado |
|---|---|---|
| Tests del backend después de cambiar supabaseClient.js | Todos pasan | |
| Tests de la iteración 05 después de usar los servicios del backend | Todos pasan | |
| Cargar la página 1 en el store | Guarda los eventos, el total y la página, y deja de estar cargando | |
| Mientras se carga una página en el store | Está cargando | |
| Falla la carga en el store | "No se han podido cargar los eventos" y no está cargando | |
| Calcular el total de páginas con 25 eventos | 3 páginas | |
| Llegan dos respuestas desordenadas | Se guarda la de la última petición | |
| Formatear una fecha | dd/mm/aaaa hh:mm | |
| Nombre de cada estado | Abierto, Cerrado y Completado | |
| Cabecera con y sin sesión | Enlace "Eventos" | |
| Pulsar el enlace "Eventos" | Va a /eventos | |
| Abrir /eventos sin sesión | Se muestra el listado | |
| Datos de cada evento | Título, fecha, ciudad, género y estado | |
| Evento sin género | No se muestra el género | |
| Mientras se cargan los eventos | Indicador de carga y no se muestra el listado | |
| Listado vacío | "Todavía no hay eventos publicados" | |
| Falla la carga del listado | "No se han podido cargar los eventos" y botón "Reintentar", sin el mensaje de listado vacío | |
| Pulsar "Reintentar" | Vuelve a pedir la misma página | |
| Paginación en la página 2 de 3 | Página actual, total de páginas y total de eventos | |
| Primera página | "Anterior" desactivado | |
| Última página | "Siguiente" desactivado | |
| Solo una página | No se muestran los botones | |
| Pulsar "Siguiente" en la página 1 | Va a /eventos?pagina=2 y pide la página 2 | |
| Entrar en /eventos?pagina=2 | Pide la página 2 | |
| Volver atrás después de pasar a la página 2 | Vuelve a la página 1 | |
| Entrar en /eventos?pagina=0 o /eventos?pagina=abc | Pide la página 1 | |
| Entrar en una página mayor que la última | "Esta página no existe" y botón para ir a la primera página | |
| Pulsar el botón para ir a la primera página | Va a /eventos?pagina=1 | |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

### Prompt importante 1

### Decisión del estudiante:

### Correcciones manuales
- La IA proponía en el paso 1 del PLAN copiar eventos.js y propuestas.js en el frontend. Lo cambié para usar directamente la capa de servicios de la práctica 1.

## COMMITS RELACIONADOS
