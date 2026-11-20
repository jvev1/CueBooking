import { defineConfig } from 'vitest/config'

// Los tests del backend están en tests/. El frontend (frontend-vue) tiene su propia
// configuración de Vitest y se prueba con `npm test` dentro de esa carpeta.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    // Carga el .env en process.env antes de cada archivo de tests
    setupFiles: ['dotenv/config']
  }
})
