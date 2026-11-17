# Iteración 05 - Proyecto frontend y sesión

## SPEC

### Objetivo

Crear el proyecto del frontend en Vue y conectarlo al backend de Supabase, para que un usuario pueda iniciar y cerrar la sesión.

### Requisitos

- Formulario de login con email y contraseña.
- Validar el formulario en el cliente antes de enviarlo:
  - email obligatorio y con formato de email válido
  - contraseña obligatoria y con al menos 6 caracteres
  - los errores se muestran debajo de cada campo al pulsar "Iniciar sesión" y no se llama al backend
- Mientras se envía el login, el botón muestra que está cargando y está desactivado, para que no se pueda enviar dos veces.
- Si el email o la contraseña son incorrectos, sale el mensaje "Email o contraseña incorrectos" y el usuario sigue en el login con el email escrito.
- Si no se puede conectar con el servidor, sale el mensaje "No se ha podido conectar con el servidor".
- Si el login es correcto, se va a la página de inicio.
- Con la sesión iniciada, la cabecera muestra el nombre del usuario y su rol (Organizador o DJ), que se obtienen de su perfil, y un botón "Cerrar sesión".
- Sin sesión, la cabecera muestra un botón "Iniciar sesión" que lleva al login.
- Al recargar la página con la sesión iniciada, la sesión se mantiene.
- Si un usuario con la sesión iniciada entra en el login, se le lleva a la página de inicio.
- Al pulsar "Cerrar sesión", se cierra la sesión, la cabecera deja de mostrar el nombre y el rol y se va a la página de inicio. 
- Hay dos usuarios de prueba fijos, un organizador y un DJ. En el README se explica cómo crearlos.

### Requisitos técnicos

- El estado de la sesión se guarda en un store de Pinia. Las vistas leen la sesión de ese store.
- Rutas con Vue Router: / (inicio) y /login.
- Biblioteca de componentes PrimeVue para el formulario, los botones y los mensajes.

### Fuera de alcance

- Ver y editar el perfil.
- Recuperar la contraseña.

## PLAN

1. Crear el proyecto en /frontend-vue y añadir `@supabase/supabase-js` y PrimeVue. Crear frontend-vue/.env.example con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
2. Copiar en frontend-vue/src/services los servicios auth.js, perfiles.js y validacion.js, con un supabaseClient.js nuevo que lee `import.meta.env`. Cambiar login en auth.js para distinguir las credenciales incorrectas de un fallo de conexión, también en el backend.
3. Store de Pinia `sesion` con el usuario y su perfil, y las acciones cargarSesion, login y logout. En main.js se espera a cargarSesion antes de montar la aplicación, para mantener la sesión al recargar.
4. Router con / (InicioView) y /login (LoginView). Si ya hay sesión, /login lleva a /.
5. Componentes:
   - CabeceraApp: nombre, rol y "Cerrar sesión" con sesión; "Iniciar sesión" sin ella
   - LoginView: formulario con PrimeVue, validación al enviar, botón cargando durante el envío y mensaje de error
6. Script scripts/crear-usuarios-prueba.js en el backend para crear un organizador y un DJ fijos. Actualizar ARCHITECTURE.md y README.md.


## TEST_PLAN

| Caso | Resultado esperado | Resultado |
|---|---|---|
| Tests del backend después del cambio en auth.js | Todos pasan | |
| Validar login con email y contraseña vacíos | Error en los dos campos | |
| Validar login con email mal escrito | Error en el email | |
| Validar login con contraseña "123" | Error en la contraseña | |
| Validar login con datos correctos | Sin errores | |
| Login con contraseña mal | "Email o contraseña incorrectos" | |
| Login sin conexión con el servidor | "No se ha podido conectar con el servidor" | |
| Login correcto en el store | Guarda el usuario y su perfil | |
| Login incorrecto en el store | Error y no hay sesión | |
| Cargar la sesión al recargar con sesión guardada | Recupera el usuario y su perfil | |
| Cargar la sesión sin sesión guardada | No hay sesión | |
| Logout en el store | No queda usuario ni perfil | |
| Ir a /login sin sesión | Se muestra el login | |
| Ir a /login con sesión | Redirige a / | |
| Cabecera sin sesión | "Iniciar sesión" y ni nombre ni rol | |
| Cabecera con sesión de organizador | Nombre, "Organizador" y "Cerrar sesión" | |
| Cabecera con sesión de DJ | Nombre, "DJ" y "Cerrar sesión" | |
| Pulsar "Cerrar sesión" | Va a / y deja de mostrar el nombre y el rol | |
| Enviar el login vacío | Errores debajo de cada campo y no se llama al backend | |
| Mientras se envía el login | Botón cargando y desactivado | |
| Enviar el login con contraseña mal | Mensaje de error, sigue en /login y conserva el email | |
| Enviar el login correcto | Va a / | |

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
