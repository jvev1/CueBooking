# ARCHITECTURE

## Backend

- BaaS con Supabase (PostgreSQL + Supabase Auth)
- La autenticación se hará con tokens JWT generados por Supabase Auth. El cliente los envía en cada petición y las políticas RLS obtienen el usuario con `auth.uid()`
- El control de acceso se hace con políticas RLS en la base de datos
- El frontend accederá al backend a través de una capa de servicios en JavaScript, sin usar directamente la API de Supabase

## Frontend

- Vue 3 con Vite, en la carpeta /frontend-vue del mismo repositorio
- Pinia para el estado compartido, Vue Router para la navegación y PrimeVue (tema Aura) como biblioteca de componentes
- Tests con Vitest, Vue Test Utils y jsdom; los servicios se sustituyen por mocks, así que no necesitan el backend

### Acceso al backend

- Los servicios auth.js, perfiles.js y validacion.js se copian en frontend-vue/src/services. Se copian en lugar de importarlos del backend porque src/supabaseClient.js usa dotenv y process.env, que no existen en el navegador.
- frontend-vue/src/supabaseClient.js crea el cliente con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (import.meta.env). Los servicios solo importan `../supabaseClient.js`, así que funcionan sin cambios.
- Los componentes y los stores solo usan los servicios, nunca Supabase directamente.
- login distingue las credenciales incorrectas ("Email o contraseña incorrectos") de un fallo de conexión ("No se ha podido conectar con el servidor"). El cambio se hizo en las dos copias de auth.js.
- validacion.js del frontend añade validarLogin, que devuelve los errores por campo en vez de lanzar una excepción, para mostrarlos debajo de cada campo del formulario.

### Estado compartido

- Store `sesion` (stores/sesion.js): usuario de Supabase Auth y su perfil (nombre y rol). Getters haySesion y rolTexto. Acciones cargarSesion, login y logout.
- Supabase guarda la sesión en localStorage. main.js espera a cargarSesion antes de montar la aplicación, para que al recargar no se vea un momento la interfaz de "sin sesión".
- El estado de los formularios (campos, errores, si se está enviando) se queda en cada vista.

### Rutas

- / → InicioView
- /login → LoginView. Si ya hay sesión, el guard beforeEnter lleva a /.

### Componentes

- App.vue: CabeceraApp encima del RouterView
- CabeceraApp: nombre, rol y "Cerrar sesión" con sesión; "Iniciar sesión" sin ella
- LoginView: formulario de login con validación, botón cargando durante el envío y mensaje de error

## Tablas

### perfiles

Campos:
- id (el mismo que el usuario de Supabase Auth)
- nombre
- rol (organizador o dj)
- ciudad
- bio
- creado_en

### eventos

Campos:
- id
- organizador_id
- titulo
- descripcion
- fecha
- ciudad
- lugar
- genero (techno, house, reggaeton, pop, rock, comercial u otro)
- presupuesto
- estado (abierto, cerrado o completado)
- creado_en

### propuestas

Campos:
- id
- evento_id
- dj_id
- precio
- duracion_minutos
- descripcion
- estado (por ahora solo pendiente; aceptar o rechazar propuestas está fuera de alcance)
- creado_en

Un DJ solo puede enviar una propuesta a cada evento. Si se borra el evento, se borran sus propuestas.

## Capa de servicios

- auth.js: registrar, login, logout, usuarioActual
- perfiles.js: obtenerPerfil, editarPerfil, listarDJs
- eventos.js: crearEvento, buscarEventos, obtenerEvento (devuelve el evento con sus propuestas), modificarEvento, eliminarEvento
- propuestas.js: enviarPropuesta, listarPropuestas, retirarPropuesta
- validacion.js: validación de los datos antes de enviarlos a Supabase (registro, perfil, eventos, búsqueda y propuestas)

## Estructura de carpetas

- src/services: capa de servicios (acceso al backend)
- src/supabaseClient.js: cliente de Supabase configurado desde `.env`
- supabase/migrations: scripts SQL de tablas, triggers y políticas RLS
- tests: pruebas automatizadas con Vitest
- scripts/crear-usuarios-prueba.js: crea los usuarios de prueba fijos
- frontend-vue: frontend en Vue
  - src/services y src/supabaseClient.js: copia de la capa de servicios con el cliente para el navegador
  - src/stores: stores de Pinia
  - src/router: rutas
  - src/views y src/components: vistas y componentes
  - tests: tests del frontend
