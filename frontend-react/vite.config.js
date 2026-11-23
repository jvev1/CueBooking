import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Misma configuración de acceso al backend que frontend-vue: la capa de servicios
// de la práctica 1 (../src) se usa con el alias @backend, sin copiarla.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@backend': fileURLToPath(new URL('../src', import.meta.url)),
    },
    // Los archivos del backend importan @supabase/supabase-js: se usa la copia de frontend-react
    dedupe: ['@supabase/supabase-js'],
  },
  server: {
    // Permite que el servidor de desarrollo sirva los archivos de ../src
    fs: { allow: ['..'] },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
  },
})
