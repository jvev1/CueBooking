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

- El frontend usa directamente la capa de servicios de la práctica 1 (src/services), con el alias `@backend` de vite.config.js (por ejemplo, `@backend/services/eventos.js`). En la iteración 05 se copiaban en frontend-vue/src/services; en la 06 se dejó de copiar porque el frontend está en el mismo repositorio y con las copias cada cambio había que hacerlo dos veces.
- src/supabaseClient.js lo comparten el backend y el frontend: lee las variables de import.meta.env (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) en el navegador y de process.env (SUPABASE_URL y SUPABASE_ANON_KEY) en Node. Ya no importa dotenv: en los tests del backend el .env se carga con setupFiles y en el script de usuarios de prueba con `node --env-file=.env`.
- vite.config.js permite servir ../src (`server.fs.allow`) y usa la copia de @supabase/supabase-js de frontend-vue (`resolve.dedupe`).
- Los componentes y los stores solo usan los servicios, nunca Supabase directamente.
- login distingue las credenciales incorrectas ("Email o contraseña incorrectos") de un fallo de conexión ("No se ha podido conectar con el servidor").
- validacion.js tiene validarLogin para el formulario de login: devuelve los errores por campo en vez de lanzar una excepción, para mostrarlos debajo de cada campo.

### Estado compartido

- Store `sesion` (stores/sesion.js): usuario de Supabase Auth y su perfil (nombre y rol). Getters haySesion y rolTexto. Acciones cargarSesion, login y logout.
- Store `eventos` (stores/eventos.js): eventos de la página cargada, total, página, tamaño (10), si se está cargando y el error. Getter totalPaginas. La acción cargarPagina llama a buscarEventos, que pagina en el servidor; si llegan respuestas desordenadas, solo se guarda la de la última petición.
- Supabase guarda la sesión en localStorage. main.js espera a cargarSesion antes de montar la aplicación, para que al recargar no se vea un momento la interfaz de "sin sesión".
- El estado de los formularios (campos, errores, si se está enviando) se queda en cada vista.

### Rutas

- / → InicioView
- /login → LoginView. Si ya hay sesión, el guard beforeEnter lleva a /.
- /eventos → EventosView, pública. La página va en la query (?pagina=2): la vista la lee de la URL y carga esa página cada vez que cambia, así que funcionan los enlaces directos y atrás/adelante. Si no es un entero mayor que 0, se usa la 1.

### Componentes

- App.vue: CabeceraApp encima del RouterView
- CabeceraApp: enlace "Eventos"; nombre, rol y "Cerrar sesión" con sesión; "Iniciar sesión" sin ella
- LoginView: formulario de login con validación, botón cargando durante el envío y mensaje de error
- EventosView: listado de eventos con sus estados (cargando, error con "Reintentar", listado vacío y página que no existe)
- TarjetaEvento: título, fecha, ciudad, género y estado de un evento
- PaginacionEventos: botones "Anterior" y "Siguiente", página actual, total de páginas y total de eventos

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
- src/supabaseClient.js: cliente de Supabase, compartido por el backend (process.env) y el frontend (import.meta.env)
- supabase/migrations: scripts SQL de tablas, triggers y políticas RLS
- tests: pruebas automatizadas con Vitest
- scripts/crear-usuarios-prueba.js: crea los usuarios de prueba fijos
- frontend-vue: frontend en Vue
  - src/utils: funciones de formato
  - src/stores: stores de Pinia
  - src/router: rutas
  - src/views y src/components: vistas y componentes
  - tests: tests del frontend
