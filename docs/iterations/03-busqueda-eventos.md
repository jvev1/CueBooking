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

## PLAN

1. Añadir a src/services/validacion.js validarBusquedaEventos (página, tamaño, género y fechas).
2. Añadir buscarEventos a src/services/eventos.js:
   - aplica solo los filtros que se indiquen (ciudad con ilike, genero con eq, desde con gte, hasta con lte)
   - ordena por fecha ascendente
   - pagina con range y count 'exact', como listarDJs
   - devuelve { datos, total, pagina, tamaño }
3. Crear los tests en tests/busqueda.test.js:
   - en un beforeAll, un organizador crea varios eventos en una ciudad inventada y única para el test (así los eventos de otros tests no afectan a los resultados), con distintos géneros y fechas
   - en el afterAll se borran

## TEST_PLAN

### Tests automáticos

- tests/busqueda.test.js: listar y filtrar eventos con paginación.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Listar eventos sin sesión | Devuelve eventos | OK |
| Listar sin página ni tamaño | Página 1 y tamaño 10 | OK |
| Filtrar por ciudad | Solo eventos de esa ciudad | OK |
| Filtrar por ciudad con otras mayúsculas | Mismos resultados | OK |
| Filtrar por género | Solo eventos de ese género | OK |
| Filtrar con desde | Solo eventos con fecha igual o posterior | OK |
| Filtrar con hasta | Solo eventos con fecha igual o anterior | OK |
| Combinar ciudad, género y fechas | Solo eventos que cumplen todos los filtros | OK |
| Orden de los resultados | Ordenados por fecha ascendente | OK |
| Página 1 de tamaño 2 | 2 eventos y el total correcto | OK |
| Página 2 de tamaño 2 | Los 2 eventos siguientes, sin repetir los de la página 1 | OK |
| Página más allá del final | Lista vacía | OK |
| Filtros sin resultados | Lista vacía y total 0 | OK |
| Género que no está en la lista | Error | OK |
| Página 0 | Error | OK |
| Tamaño 0 o mayor que 50 | Error | OK |
| Fecha desde no válida | Error | OK |
| Desde posterior a hasta | Error | OK |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

Se usó IA para:
- ayuda con el documento de la iteración (PLAN y TEST_PLAN)
- ayuda con el código: validarBusquedaEventos y buscarEventos
- ayuda con los tests de tests/busqueda.test.js
- revisar los tests generados para encontrar puntos débiles

### Prompt importante 1

"Genera un plan para realizar buscarEventos({ ciudad, genero, desde, hasta, pagina, tamaño }) con filtros y paginación, apoyandote en las especificaciones del SPEC".

### Decisión del estudiante:

Aceptar la propuesta, pero revisando los límites que puso la IA

### Prompt importante 2

Implementa el paso 2 del PLAN de docs/iterations/03-busqueda-eventos.md: añade buscarEventos a src/services/eventos.js.

Contexto que debes leer antes:
- El SPEC de esa misma iteración (requisitos y "Fuera de alcance").
- listarDJs en src/services/perfiles.js: sigue su mismo patrón de paginación (range + count 'exact') y su misma forma de respuesta.
- validarBusquedaEventos en src/services/validacion.js, que ya existe y valida todos los parámetros. No dupliques validaciones en el servicio.

Requisitos:
- Firma: export async function buscarEventos(parametros = {}). Usa tamano, igual que listarDJs y validarBusquedaEventos.
- Llama primero a validarBusquedaEventos(parametros) y después aplica los valores por defecto: pagina = 1, tamano = 10.
- No exige sesión: los eventos son públicos (igual que obtenerEvento).
- Aplica cada filtro solo si viene con valor (ni undefined ni null):
  - ciudad -> ilike('ciudad', ciudad), sin comodines: coincidencia exacta sin distinguir mayúsculas
  - genero -> eq('genero', genero)
  - desde  -> gte('fecha', desde)
  - hasta  -> lte('fecha', hasta)
- Ordena por fecha ascendente.
- Pagina con range((pagina - 1) * tamano, pagina * tamano - 1).
- Devuelve { datos, total, pagina, tamano }. Si no hay resultados o la página se sale del final, devuelve datos: [] (nunca null) y el total que corresponda. No lances un error.
- Los errores de Supabase se lanzan como new Error(error.message), igual que en el resto del fichero.

Todavia no toques los tests (son el paso 3) ni otros ficheros.

### Decisión del estudiante:

La IA añadió algo que no se pedía: escapar los caracteres % y _ en el filtro de ciudad, porque ilike los trata como comodines (por ejemplo, buscar "%" devolvería todos los eventos). Tras entender qué hace, se ha dejado así, ya que garantiza la coincidencia exacta de ciudad que pide el SPEC.

### Correcciones manuales

- En validacion.js la IA repitió en validarBusquedaEventos la comprobación del género que ya existía en validarCamposEvento.Se sacó a una función común validarGenero(genero).
- En tests/busqueda.test.js el test "sin parámetros usa la página 1 y tamaño 10" que generó la IA era flojo. Solo comprobaba que la respuesta traía pagina 1 y tamano 10, que son los mismos valores que pone la función, y que llegaban 10 eventos o menos, algo que se cumple aunque no se limite nada si hay pocos eventos. Se cambia para crear 11 eventos y comprobar que sin parámetros llegan exactamente 10.

## COMMITS RELACIONADOS
d8d5a80de4a3e096b6b265664ec5e9995efb945b - Redactado spec de la iteracion 3
a442f27fbaef5688f2231f96098640b8a5a34b4f - Plan y test plan
c7bbbdfe431882c0bf744cf7642cd32ac95c1fc3 - validaciones
937b9b05af7a848424c591c932bacf999130dff9 - funcion para comprobar Genero
29191e9041a7d83040ad74d8c47f7f75c47b3647 - Añadido buscarEventos
ac984fffb785920250f6a9c1f7866f7caf80d445 - Tests añadidos
7a70edb1a423d139ee8c9f3c0e9edd0cf4390605 - pequeño arrelgo en los test

