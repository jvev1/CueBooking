# AI_SUMMARY

## Herramientas usadas

- Claude Code (modelo Claude Opus 5.5)

## Uso principal

- Planificación de las iteraciones y del trabajo: ayuda con el PLAN y el TEST_PLAN de cada iteración a partir del SPEC.
- Creación del esqueleto del proyecto.
- Migraciones SQL de las tablas perfiles, eventos y propuestas, con sus políticas RLS.
- Generación del código de la capa de servicios (auth, perfiles, eventos, propuestas y validaciones), paso a paso según el PLAN.
- Generación de los tests automáticos con Vitest.
- Encontrar errores.
- Explicar decisiones de la IA que no se entendían.

## Partes modificadas manualmente

- Configuración de Supabase.
- Revisión del alcance de las iteraciones para que no se añadieran funcionalidades fuera de lo necesario.
- El campo genero de eventos pasó de texto libre a una lista cerrada de valores.
- Los tests de eventos se reorganizaron en bloques por usuario, con un login por bloque, para no superar el límite de peticiones de Supabase Auth.
- La comprobación del género, repetida en dos validaciones, se sacó a una función común validarGenero.
- El test de búsqueda "sin parámetros usa la página 1 y tamaño 10" era flojo y se cambió para comprobar que llegan exactamente 10 eventos.
- El check de estado de propuestas se redujo a solo 'pendiente', porque aceptar o rechazar está fuera de alcance.
- En los tests de propuestas, un "test" que solo preparaba datos se movió al beforeAll.

## Problemas encontrados con la IA

- Propuso inicialmente una estructura de documentación que no seguía el formato SDD de la asignatura. Se corrigió al proporcionarle el documento de la metodología.
- Tiende a hacerlo todo de una vez; hubo que pedirle que fuera paso a paso para poder revisar cada parte.
- A veces añade cosas que no se le piden. Hay que revisar cada cambio y decidir si se queda.
- Generó tests que pasan pero prueban poco.

## Valoración personal
- Es una herramienta muy potente pero si la sabes utilizar bien, en caso contrario se puede convertir en un obstáculo para el desarrollo.
