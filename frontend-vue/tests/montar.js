// Utilidad para los tests de componentes: monta el componente con Pinia, PrimeVue
// y un router en memoria con las rutas reales de la aplicación.
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import { routes } from '@/router/index.js'

export async function montar(componente, { rutaInicial = '/', prepararSesion } = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)
  prepararSesion?.()

  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(rutaInicial)
  await router.isReady()

  const wrapper = mount(componente, {
    // attachTo: los diálogos de PrimeVue se dibujan en document.body
    attachTo: document.body,
    global: { plugins: [pinia, router, [PrimeVue, { unstyled: true }], ConfirmationService] }
  })
  await flushPromises()
  return { wrapper, router }
}
