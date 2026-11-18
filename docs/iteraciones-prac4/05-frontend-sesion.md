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
| Tests del backend después del cambio en auth.js | Todos pasan | OK |
| Validar login con email y contraseña vacíos | Error en los dos campos | OK |
| Validar login con email mal escrito | Error en el email | OK |
| Validar login con contraseña "123" | Error en la contraseña | OK |
| Validar login con datos correctos | Sin errores | OK |
| Login con contraseña mal | "Email o contraseña incorrectos" | OK |
| Login sin conexión con el servidor | "No se ha podido conectar con el servidor" | OK |
| Login correcto en el store | Guarda el usuario y su perfil | OK |
| Login incorrecto en el store | Error y no hay sesión | OK |
| Cargar la sesión al recargar con sesión guardada | Recupera el usuario y su perfil | OK |
| Cargar la sesión sin sesión guardada | No hay sesión | OK |
| Falla el perfil tras un login correcto | Se cierra la sesión, error y no hay sesión | OK |
| Falla el perfil al recargar con sesión guardada | Se cierra la sesión, error y no hay sesión | OK |
| Logout en el store | No queda usuario ni perfil | OK |
| Ir a /login sin sesión | Se muestra el login | OK |
| Ir a /login con sesión | Redirige a / | OK |
| Cabecera sin sesión | "Iniciar sesión" y ni nombre ni rol | OK |
| Cabecera con sesión de organizador | Nombre, "Organizador" y "Cerrar sesión" | OK |
| Cabecera con sesión de DJ | Nombre, "DJ" y "Cerrar sesión" | OK |
| Pulsar "Cerrar sesión" | Va a / y deja de mostrar el nombre y el rol | OK |
| Enviar el login vacío | Errores debajo de cada campo y no se llama al backend | OK |
| Mientras se envía el login | Botón cargando y desactivado | OK |
| Enviar el login con contraseña mal | Mensaje de error, sigue en /login y conserva el email | OK |
| Enviar el login correcto | Va a / | OK |

## AI_LOG

### Herramienta usada

- Herramienta: Claude Code
- Modelo: Claude Opus 5.5
- Tipo: modelo en la nube

### Uso realizado
Se usó IA para:
- ayuda con el documento de la iteración (PLAN y TEST_PLAN), compactando el PLAN y dejando solo tests automáticos
- ayuda con el código: proyecto Vue, copia de los servicios con el cliente para el navegador, store de sesión, router, CabeceraApp y LoginView
- ayuda con los tests del frontend (Vitest, Vue Test Utils y mocks de los servicios)

### Prompt importante 1
Ejecuta la iteración 05: lee la SPEC y el PLAN en `docs/iteraciones-prac4/05-frontend-sesion.md` e implementa el PLAN paso a paso, en orden. Haz solo lo que piden la SPEC y el PLAN, sin extras, y respeta el estilo y el idioma del código existente. Cuando termines resume qué hiciste y qué no pudiste verificar. No hagas commits.

### Decisión del estudiante:
- Acepté la estructura general generada: store de Pinia, router con guard en /login, componentes de PrimeVue y script de usuarios de prueba. Cumple la SPEC y los tests y el build pasan (los ejecuté yo).
- Acepté duplicar auth.js, perfiles.js y validacion.js en el frontend.
- Descarté mover la contraseña de prueba a variables de entorno: son usuarios de prueba fijos y el README lo documenta.

### Correcciones manuales
- Probando el login vi que si fallaba obtenerPerfil la sesión de Supabase se quedaba iniciada pero la cabecera mostraba "Iniciar sesión". En sesion.js añadí un try/catch en login y en cargarSesion para que, si falla el perfil, se haga logout y se lance el error.

## COMMITS RELACIONADOS
3efe491c890254e03b38d2dbab57b5bbf2eafc76 - spec iteracion 5
f3491befd4509b6402b47c55b7b1e7beba99b8c8 - plan it05
d7346c77a21f63dda8e26e0ab5087e45796e6ca5 - test plan it 5
b006336a1f06a03ceeea5b3b5eec25e64a6c09cd - ejecucion del plan
9628e064101f8fc88f7124cf43d1dd882b6bed0f - try/catch en login y en cargarsesion
fc40a8fb745eb432e5e4d99fd7df5bcf12716b88 - test por si obtenerperfil falla
