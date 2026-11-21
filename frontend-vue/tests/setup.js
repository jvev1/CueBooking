import { vi, afterEach } from 'vitest'
import { enableAutoUnmount } from '@vue/test-utils'

// Ningún test del frontend usa el Supabase real: se sustituye el cliente por uno vacío.
// Los tests que necesitan simular respuestas del cliente (auth.test.js) lo vuelven a sustituir,
// y el resto sustituye directamente los servicios.
vi.mock('@backend/supabaseClient.js', () => ({ supabase: {} }))

// jsdom no implementa el scroll de la ventana (lo usa EventosView al cambiar de página)
window.scrollTo = vi.fn()

// jsdom tampoco tiene ResizeObserver ni matchMedia, que usan el Textarea y el DatePicker de PrimeVue
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.matchMedia ??= (query) => ({
  matches: false,
  media: query,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {}
})

// Los componentes se montan en document.body (por los diálogos): se desmontan después de cada test
enableAutoUnmount(afterEach)
