import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Capa de servicios de la práctica 1 (carpeta src de la raíz del repositorio)
      '@backend': fileURLToPath(new URL('../src', import.meta.url)),
    },
    // Los archivos del backend importan @supabase/supabase-js: así se usa la copia
    // instalada en frontend-vue y no hace falta node_modules en la raíz para el frontend
    dedupe: ['@supabase/supabase-js'],
  },
  server: {
    // Permite que el servidor de desarrollo sirva los archivos de ../src
    fs: { allow: ['..'] },
  },
})
