# Iteración 01 - Preparación del proyecto y usuarios

## SPEC

### Objetivo

Preparar el proyecto con Supabase y las pruebas, e implementar los usuarios: registro con rol, login/logout y perfiles.

### Requisitos

- Registrarse con email, contraseña, nombre, rol (organizador o dj) y ciudad opcional. Se crea el perfil con esos datos.
- Validar el registro
- No se puede registrar dos veces el mismo email.
- Iniciar sesión con email y contraseña. Si son incorrectos sale "Email o contraseña incorrectos".
- Cerrar sesión.
- Ver el perfil de un usuario aunque no se haya iniciado sesión. Si no existe sale "Perfil no encontrado".
- Listar los DJs con paginación.
- Editar el perfil propio (nombre, ciudad y bio).
- El rol no se puede cambiar.
- Nadie puede editar el perfil de otro usuario, tampoco accediendo directamente a la base de datos.

### Requisitos técnicos

- Las claves de Supabase van en el .env y no se suben al repositorio. Hay un .env.example con las variables.
- La autenticación usa los tokens JWT de Supabase Auth.

### Fuera de alcance

- Eventos, propuestas y reseñas.
- Recuperar contraseña y confirmar email.
- Borrar la cuenta.

## PLAN

1. Crear la tabla perfiles en supabase/migrations/20261006_01_perfiles.sql:
   - un trigger que crea el perfil al registrarse con los datos que se mandan en el signUp
   - RLS: todos pueden leer los perfiles, cada uno solo puede editar el suyo
   - solo se pueden actualizar las columnas nombre, ciudad y bio (así el rol no se puede cambiar)
2. Crear src/services/validacion.js para validar el registro y la edición del perfil.
3. Crear src/services/auth.js con registrar, login, logout y usuarioActual.
4. Crear src/services/perfiles.js con obtenerPerfil, editarPerfil y listarDJs.
5. Crear los tests en tests/usuarios.test.js.


## TEST_PLAN

### Tests automáticos

- tests/conexion.test.js: comprueba que Supabase responde.
- tests/usuarios.test.js: registro, login/logout y perfiles.

| Caso | Resultado esperado | Resultado obtenido |
|---|---|---|
| Supabase responde | Status 200 | OK |
| Registro de un DJ correcto | Se crea su perfil con nombre, rol y ciudad | OK |
| Registro con rol "admin" | Error | OK |
| Registro con email mal escrito | Error | OK |
| Registro con contraseña "123" | Error | OK |
| Registro con nombre vacío | Error | OK |
| Registro con un email ya usado | Error | OK |
| Login correcto | Devuelve el usuario | OK |
| Login con contraseña mal | "Email o contraseña incorrectos" | OK |
| Logout | No queda usuario con sesión | OK |
| Ver perfil sin sesión | Devuelve el perfil | OK |
| Ver perfil que no existe | "Perfil no encontrado" | OK |
| Listar DJs, página de 2 | Máximo 2 perfiles y todos DJ | OK |
| Editar mi perfil | Se guardan los cambios | OK |
| Editar perfil sin sesión | Error | OK |
| Cambiar el rol | Error | OK |
| Editar el perfil de otro directamente en la tabla | No cambia nada | OK |


## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado

Se usó IA para:
- planificar el trabajo
- crear el esqueleto del proyecto 
- encontrar por qué fallaba el test de conexión
- generar la tabla perfiles, los servicios de usuarios y sus tests
- ayuda con la documentación

### Prompt importante 1

"tengo que desarrollar el backend para mi aplicacion CUEBooking, siguiendo la metodologia de desarrollo SDD, planifica como debo dividirme el trabajo"

Resultado: recomendó una forma de dividir el trabajo.

### Decisión del estudiante: 
Acepta la idea pero con correcciones, no seguia correctamente la metodologia explicada en clase.

### Prompt importante 2

"Vamos con la iteración 01. Revisa PROJECT_SPEC.md y ARCHITECTURE.md en su versión actual y lee la sección SPEC de esta iteración. Propón un plan de implementación."

Resultado: la IA generó un plan para la migración de perfiles, validacion.js, auth.js, perfiles.js y los tests. Después se decidió empezar con la implementación.

### Decisión del estudiante: 
Acepta la idea pero limitando el ritmo, queria implementar todo de 1 misma tirada pero se le indicó en ir paso a paso corrigiendo errores.

### Correcciones manuales
- Se ha revisado manualmente el alcance para que no se añadan funcionalidades fuera de lo necesario.


