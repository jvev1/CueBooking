// Recorrido completo con el backend real: monta la aplicación entera (cabecera, router,
// stores y servicios de la práctica 1) sin mocks y la usa como el organizador de prueba.
// Necesita frontend-vue/.env y los usuarios de prueba (node --env-file=.env scripts/crear-usuarios-prueba.js).
import { describe, it, expect, afterAll } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import PrimeVue from 'primevue/config'
import ConfirmationService from 'primevue/confirmationservice'
import DatePicker from 'primevue/datepicker'
import App from '@/App.vue'
import { routes } from '@/router/index.js'
import * as auth from '@backend/services/auth.js'
import { eliminarEvento } from '@backend/services/eventos.js'

const EMAIL = 'cuebooking.organizador.prueba@gmail.com'
const PASSWORD = 'prueba123'
const TITULO = `Recorrido ${Date.now()}`
const TITULO_EDITADO = `${TITULO} editado`

let idCreado = null

/** Espera a que se cumpla la condición mientras llegan las respuestas del backend. */
async function esperar(condicion, descripcion, maximo = 15000) {
  const inicio = Date.now()
  while (Date.now() - inicio < maximo) {
    await flushPromises()
    if (condicion()) return
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  throw new Error(`No se ha cumplido a tiempo: ${descripcion}`)
}

/** Recorre las páginas del listado buscando una tarjeta con ese título. */
async function buscarEnListado(wrapper, router, titulo) {
  await router.push('/eventos')
  for (let pagina = 1; pagina <= 50; pagina++) {
    await esperar(() => !wrapper.find('[data-test="cargando"]').exists(), `cargar la página ${pagina}`)
    const tarjeta = wrapper.findAll('[data-test="evento"]').find((t) => t.find('[data-test="titulo"]').text() === titulo)
    if (tarjeta) return tarjeta
    const siguiente = wrapper.find('[data-test="siguiente"]')
    if (!siguiente.exists() || siguiente.attributes('disabled') !== undefined) return null
    await siguiente.trigger('click')
    await esperar(() => router.currentRoute.value.query.pagina === String(pagina + 1), `ir a la página ${pagina + 1}`)
  }
  return null
}

function botonDelDialogo(texto) {
  const dialogo = document.body.querySelector('[role="alertdialog"]')
  return [...(dialogo?.querySelectorAll('button') ?? [])].find((boton) => boton.textContent.includes(texto))
}

describe('Recorrido completo con el backend real', () => {
  afterAll(async () => {
    // Si el test ha fallado a mitad, se borra el evento para no dejar datos de prueba
    if (!idCreado) return
    try {
      await auth.login(EMAIL, PASSWORD)
      await eliminarEvento(idCreado)
    } catch {
      // Ya estaba borrado
    } finally {
      await auth.logout()
    }
  })

  it('login, crear, buscar en el listado, ver el detalle, editar, eliminar y logout', async () => {
    // Pinia activa antes de navegar: los guards del router usan los stores
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push('/login')
    const wrapper = mount(App, {
      attachTo: document.body,
      global: { plugins: [pinia, router, PrimeVue, ConfirmationService] }
    })

    // 1. Iniciar sesión con el organizador de prueba
    await wrapper.find('#email').setValue(EMAIL)
    await wrapper.find('#password').setValue(PASSWORD)
    await wrapper.find('form').trigger('submit')
    await esperar(() => wrapper.find('[data-test="nombre"]').exists(), 'iniciar sesión')
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.find('[data-test="rol"]').text()).toBe('Organizador')

    // 2. Crear un evento desde el botón "Nuevo evento" del listado
    await router.push('/eventos')
    await esperar(() => wrapper.find('[data-test="nuevo-evento"]').exists(), 'ver "Nuevo evento"')
    await wrapper.find('[data-test="nuevo-evento"]').trigger('click')
    await esperar(() => wrapper.find('#titulo').exists(), 'abrir el formulario')
    await wrapper.find('#titulo').setValue(TITULO)
    await wrapper.find('#ciudad').setValue('Alicante')
    await wrapper.find('#lugar').setValue('Sala de pruebas')
    await wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', new Date(Date.now() + 24 * 60 * 60 * 1000))
    await wrapper.find('form').trigger('submit')
    await esperar(() => router.currentRoute.value.name === 'detalle-evento', 'ir al detalle del evento creado')
    idCreado = router.currentRoute.value.params.id

    // 3. Localizarlo en el listado y 4. abrir su detalle
    const tarjeta = await buscarEnListado(wrapper, router, TITULO)
    expect(tarjeta, 'el evento creado aparece en el listado').toBeTruthy()
    await tarjeta.trigger('click')
    await esperar(() => wrapper.find('.detalle [data-test="titulo"]').exists(), 'abrir el detalle')
    expect(router.currentRoute.value.params.id).toBe(idCreado)
    expect(wrapper.find('.detalle [data-test="titulo"]').text()).toBe(TITULO)
    expect(wrapper.find('[data-test="lugar"]').text()).toBe('Sala de pruebas')

    // 5. Editarlo
    await wrapper.find('[data-test="editar"]').trigger('click')
    await esperar(() => wrapper.find('#titulo').exists(), 'abrir la edición')
    expect(wrapper.find('#titulo').element.value).toBe(TITULO)
    await wrapper.find('#titulo').setValue(TITULO_EDITADO)
    await wrapper.find('form').trigger('submit')
    await esperar(
      () => router.currentRoute.value.name === 'detalle-evento' && wrapper.find('.detalle [data-test="titulo"]').exists(),
      'volver al detalle después de editar'
    )
    expect(wrapper.find('.detalle [data-test="titulo"]').text()).toBe(TITULO_EDITADO)

    // 6. Eliminarlo, confirmando en el diálogo
    await wrapper.find('[data-test="eliminar"]').trigger('click')
    await esperar(() => botonDelDialogo('Eliminar'), 'abrir el diálogo de confirmación')
    botonDelDialogo('Eliminar').click()
    await esperar(() => router.currentRoute.value.path === '/eventos', 'volver al listado después de eliminar')
    expect(await buscarEnListado(wrapper, router, TITULO_EDITADO), 'el evento ya no está en el listado').toBeNull()
    idCreado = null

    // 7. Cerrar la sesión
    await wrapper.find('[data-test="logout"]').trigger('click')
    await esperar(() => wrapper.find('[data-test="ir-login"]').exists(), 'cerrar la sesión')
    expect(wrapper.find('[data-test="nombre"]').exists()).toBe(false)

    wrapper.unmount()
  })
})
