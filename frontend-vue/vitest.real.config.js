import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Tests con el backend real (Supabase), aparte de los de `npm test`, que usan mocks.
// Se ejecutan con `npm run test:real` y necesitan frontend-vue/.env y los usuarios de prueba.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['tests-real/**/*.test.js'],
      setupFiles: ['./tests-real/setup.js'],
      testTimeout: 60000,
      hookTimeout: 60000,
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
