import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      // tests-real usa el backend real y se ejecuta aparte con `npm run test:real`
      exclude: [...configDefaults.exclude, 'e2e/**', 'tests-real/**'],
      setupFiles: ['./tests/setup.js'],
      root: fileURLToPath(new URL('./', import.meta.url)),
    },
  }),
)
