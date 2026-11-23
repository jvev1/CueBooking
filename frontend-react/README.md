# CueBooking — Frontend parcial en React

Requerimiento adicional de la práctica 4: el listado y el borrado de eventos con otro framework, usando el mismo backend (Supabase) y la misma capa de servicios que `frontend-vue`. Incluye login y logout porque para borrar hace falta sesión.

## Puesta en marcha

1. Instalar dependencias:
   ```bash
   cd frontend-react
   npm install
   ```
2. Copiar `.env.example` a `.env` con los mismos datos de Supabase que el backend y el frontend de Vue:
   ```
   VITE_SUPABASE_URL=https://<id-proyecto>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
3. Arrancar en modo desarrollo:
   ```bash
   npm run dev
   ```
4. Ejecutar las pruebas (con los servicios sustituidos por mocks, no necesitan el backend):
   ```bash
   npm test
   ```

Para borrar eventos se puede entrar con el organizador de prueba del README principal.

## Qué se reutiliza

- La capa de servicios de la práctica 1 (`../src/services`: auth.js, perfiles.js, eventos.js y validacion.js), con el alias `@backend`, igual que en Vue. No depende del framework, así que no se ha copiado ni cambiado.
- `validarLogin` para validar el formulario de login.
- El formato de las fechas y los estados es el mismo que en Vue (`src/formato.js`).

## Diferencias con Vue

### Componentes

- En Vue cada componente es un archivo `.vue` con `<script setup>`, `<template>` y `<style>` separados. En React es una función que devuelve JSX: la plantilla está dentro del JavaScript.
- En Vue la plantilla usa directivas (`v-if`, `v-for`, `v-model`, `@click`). En React se usa JavaScript normal: condiciones con `? :` y `&&`, listas con `map` y una `key`, y `onClick`.
- En Vue `v-model` une un campo con su variable en los dos sentidos. En React los campos son controlados: se pasa `value` y se actualiza el estado en `onChange`.
- En Vue los hijos avisan al padre con eventos (`emit('cambiar')`). En React el padre pasa una función como prop (`onEliminar`).

### Gestión del estado

- En Vue el estado local es `ref()` y se cambia asignando (`cargando.value = true`). En React es `useState`, y se cambia con su función (`setCargando(true)`), que vuelve a pintar el componente.
- En Vue el estado compartido está en stores de Pinia (`sesion` y `eventos`). En React la sesión se comparte con un Context (`SesionContext.jsx`): `SesionProvider` guarda el estado y los componentes lo leen con `useSesion()`.
- El listado no necesita un store: solo lo usa `ListadoEventos`, así que su estado (página, eventos, total, carga y error) está en el propio componente. En Vue está en Pinia porque lo comparten el listado, el detalle y los formularios.
- En Vue se vuelve a cargar la página con un `watch` sobre la URL. En React, con un `useEffect` que depende de la página. Para no guardar una respuesta que llega tarde, en Vue se compara un contador de peticiones y en React se usa la función de limpieza del efecto.
- En Vue `main.js` espera a recuperar la sesión antes de montar la aplicación. En React el proveedor tiene el estado `comprobando` y `App` no pinta nada hasta que termina.

## Limitaciones

- No tiene router, detalle, crear, editar, búsqueda ni propuestas: solo lo que pide el requerimiento.
- No usa biblioteca de componentes. La confirmación del borrado es `window.confirm`.
- La página del listado no está en la URL: al recargar se vuelve a la primera.
