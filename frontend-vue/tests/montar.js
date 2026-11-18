// Utilidad para los tests de componentes: monta el componente con Pinia, PrimeVue
// y un router en memoria con las rutas reales de la aplicación.
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import { routes } from '@/router/index.js'

export async function montar(componente, { rutaInicial = '/', prepararSesion } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  prepararSesion?.()

  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(rutaInicial)
  await router.isReady()

  const wrapper = mount(componente, {
    global: { plugins: [pinia, router, [PrimeVue, { unstyled: true }]] }
  })
  await flushPromises()
  return { wrapper, router }
}
