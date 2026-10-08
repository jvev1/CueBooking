# Iteración 03 - Búsqueda de eventos

## SPEC

### Objetivo

Listar los eventos con paginación y poder filtrarlos por ciudad, fechas y género musical.

### Requisitos

- Listar eventos aunque no se haya iniciado sesión.
- Los eventos salen ordenados por fecha, del más próximo al más lejano.
- Paginación con `pagina` y `tamaño`. Las páginas empiezan en 1. Por defecto página 1 y 10 eventos por página.
- La respuesta incluye los eventos de la página, el total de eventos que cumplen los filtros, la página y el tamaño (igual que listarDJs).
- Filtros opcionales y combinables:
  - ciudad: sin distinguir mayúsculas y minúsculas
  - genero: tiene que ser uno de: techno, house, reggaeton, pop, rock, comercial u otro
  - desde: eventos con fecha igual o posterior
  - hasta: eventos con fecha igual o anterior
- Validar los parámetros:
  - pagina tiene que ser un entero mayor o igual que 1
  - tamaño tiene que ser un entero entre 1 y 50
  - desde y hasta tienen que ser fechas válidas, y desde no puede ser posterior a hasta
- Si ningún evento cumple los filtros se devuelve una lista vacía con total 0, no un error.


### Fuera de alcance

- Búsqueda por texto en el título o la descripción.
- Filtrar por estado del evento o por organizador.
- Propuestas y reseñas.

