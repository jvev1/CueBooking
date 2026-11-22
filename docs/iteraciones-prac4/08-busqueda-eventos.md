# Iteración 08 - Búsqueda de eventos

## SPEC

### Objetivo

Poder buscar eventos por ciudad, género y fechas desde el listado, y recorrer las páginas del resultado.

### Requisitos

- Encima del listado de /eventos hay un formulario de búsqueda con:
  - ciudad (tiene que ser la ciudad entera, sin distinguir mayúsculas)
  - género
  - fecha desde y fecha hasta
- Al pulsar "Buscar" se piden al backend los eventos que cumplen todos los filtros indicados. Los filtros vacíos no se aplican.
- La búsqueda se hace en el backend con buscarEventos, sobre todos los eventos, no solo sobre la página que ya se ha cargado.
- El resultado se pagina igual que el listado (10 por página, con "Anterior" y "Siguiente"), y el total que se muestra es el de la búsqueda.
- Al cambiar la búsqueda se vuelve a la página 1.
- Los filtros están en la URL junto con la página (por ejemplo /eventos?ciudad=Alicante&genero=techno&pagina=2), así que se puede entrar directamente a una búsqueda y funcionan atrás y adelante. El formulario sale relleno con los filtros de la URL.
- Si "desde" es posterior a "hasta", sale un error debajo de las fechas y no se busca.
- Si no hay eventos que cumplan la búsqueda, sale "No hay eventos que coincidan con la búsqueda", distinto del mensaje de que no hay ningún evento publicado.
- Un botón "Quitar filtros" vacía el formulario y vuelve al listado completo.
- Mientras se busca se ve el indicador de carga, y si falla sale el mismo error con "Reintentar" que en el listado.

### Fuera de alcance

- Buscar por título o por parte del nombre de la ciudad.
- Buscar mientras se escribe, sin pulsar "Buscar".
- Ordenar los resultados de otra forma que por fecha.

## PLAN

1. Store `eventos`: cargarPagina(pagina, filtros) pasa los filtros a buscarEventos junto con la página y el tamaño, y guarda los filtros de la búsqueda cargada. Las fechas se envían como el principio del día "desde" y el final del día "hasta", para que entren los eventos de esos días.
2. Añadir validarFormularioBusqueda al validacion.js del backend, que devuelve el error por campo si "desde" es posterior a "hasta", como validarLogin y validarFormularioEvento.
3. EventosView lee de la URL los filtros (ciudad, genero, desde y hasta, con las fechas en formato aaaa-mm-dd) además de la página, y vuelve a cargar cuando cambia cualquiera. Los filtros que no son válidos (un género que no está en la lista o una fecha mal escrita) se ignoran, como la página. Los botones de página mantienen los filtros en la URL.
4. Componentes:
   - BusquedaEventos: formulario con InputText, Select y dos DatePicker de PrimeVue, relleno con los filtros de la URL. Al buscar emite los filtros no vacíos, y "Quitar filtros" emite una búsqueda vacía.
   - EventosView: al recibir una búsqueda hace router.push con los filtros y la página 1. Si no hay resultados y hay filtros, muestra "No hay eventos que coincidan con la búsqueda" con "Quitar filtros"; sin filtros sigue saliendo "Todavía no hay eventos publicados".
5. Tests automáticos en frontend-vue/tests con los servicios sustituidos por mocks. Actualizar ARCHITECTURE.md.

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
