import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

vi.mock('@backend/services/eventos.js', () => ({ buscarEventos: vi.fn() }))
vi.mock('@backend/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@backend/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import { buscarEventos } from '@backend/services/eventos.js'
import EventosView from '@/views/EventosView.vue'
import { montar } from './montar.js'

function evento(numero, cambios = {}) {
  return {
    id: `e${numero}`,
    titulo: `Evento ${numero}`,
    fecha: new Date(2027, 0, numero, 22, 0).toISOString(),
    ciudad: 'Alicante',
    genero: 'techno',
    estado: 'abierto',
    ...cambios
  }
}

/** Simula buscarEventos con un total de eventos: devuelve los de la página pedida. */
function conEventos(total) {
  const todos = Array.from({ length: total }, (_, i) => evento(i + 1))
  buscarEventos.mockImplementation(async ({ pagina, tamano }) => ({
    datos: todos.slice((pagina - 1) * tamano, pagina * tamano),
    total,
    pagina,
    tamano
  }))
}

const paginasPedidas = () => buscarEventos.mock.calls.map(([parametros]) => parametros.pagina)

describe('EventosView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin sesión se muestra el listado', async () => {
    conEventos(3)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.findAll('[data-test="evento"]')).toHaveLength(3)
  })

  it('cada evento muestra título, fecha, ciudad, género y estado', async () => {
    buscarEventos.mockResolvedValue({ datos: [evento(5)], total: 1, pagina: 1, tamano: 10 })
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    const tarjeta = wrapper.find('[data-test="evento"]')
    expect(tarjeta.find('[data-test="titulo"]').text()).toBe('Evento 5')
    expect(tarjeta.find('[data-test="fecha"]').text()).toBe('05/01/2027 22:00')
    expect(tarjeta.find('[data-test="ciudad"]').text()).toBe('Alicante')
    expect(tarjeta.find('[data-test="genero"]').text()).toBe('techno')
    expect(tarjeta.find('[data-test="estado"]').text()).toBe('Abierto')
  })

  it('un evento sin género no muestra el género', async () => {
    buscarEventos.mockResolvedValue({ datos: [evento(1, { genero: null })], total: 1, pagina: 1, tamano: 10 })
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.find('[data-test="genero"]').exists()).toBe(false)
  })

  it('mientras se cargan los eventos muestra el indicador de carga y no el listado', async () => {
    buscarEventos.mockReturnValue(new Promise(() => {}))
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.find('[data-test="cargando"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="evento"]').exists()).toBe(false)
  })

  it('con el listado vacío muestra "Todavía no hay eventos publicados"', async () => {
    conEventos(0)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.find('[data-test="vacio"]').text()).toBe('Todavía no hay eventos publicados')
    expect(wrapper.find('[data-test="error"]').exists()).toBe(false)
  })

  it('si falla la carga muestra el error y "Reintentar", sin el mensaje de listado vacío', async () => {
    buscarEventos.mockRejectedValue(new Error('Failed to fetch'))
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.find('[data-test="error"]').text()).toBe('No se han podido cargar los eventos')
    expect(wrapper.find('[data-test="reintentar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="vacio"]').exists()).toBe(false)
  })

  it('"Reintentar" vuelve a pedir la misma página', async () => {
    buscarEventos.mockRejectedValueOnce(new Error('Failed to fetch'))
    conEventos(25)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?pagina=2' })

    await wrapper.find('[data-test="reintentar"]').trigger('click')
    await flushPromises()

    expect(paginasPedidas()).toEqual([2, 2])
    expect(wrapper.findAll('[data-test="evento"]')).toHaveLength(10)
  })

  it('en la página 2 de 3 muestra la página actual, el total de páginas y el total de eventos', async () => {
    conEventos(25)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?pagina=2' })

    expect(wrapper.find('[data-test="info-paginacion"]').text()).toBe('Página 2 de 3 · 25 eventos')
  })

  it('en la primera página "Anterior" está desactivado', async () => {
    conEventos(25)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.find('[data-test="anterior"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-test="siguiente"]').attributes('disabled')).toBeUndefined()
  })

  it('en la última página "Siguiente" está desactivado', async () => {
    conEventos(25)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?pagina=3' })

    expect(wrapper.find('[data-test="siguiente"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-test="anterior"]').attributes('disabled')).toBeUndefined()
  })

  it('con una sola página no se muestran los botones', async () => {
    conEventos(4)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

    expect(wrapper.find('[data-test="anterior"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="siguiente"]').exists()).toBe(false)
  })

  it('"Siguiente" en la página 1 va a /eventos?pagina=2 y pide la página 2', async () => {
    conEventos(25)
    const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })

    await wrapper.find('[data-test="siguiente"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/eventos?pagina=2')
    expect(paginasPedidas()).toEqual([1, 2])
  })

  it('entrar en /eventos?pagina=2 pide la página 2', async () => {
    conEventos(25)
    await montar(EventosView, { rutaInicial: '/eventos?pagina=2' })

    expect(paginasPedidas()).toEqual([2])
  })

  it('volver atrás después de pasar a la página 2 vuelve a la página 1', async () => {
    conEventos(25)
    const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })
    await wrapper.find('[data-test="siguiente"]').trigger('click')
    await flushPromises()

    router.back()
    await new Promise((resolve) => setTimeout(resolve))
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/eventos')
    expect(paginasPedidas()).toEqual([1, 2, 1])
    expect(wrapper.find('[data-test="info-paginacion"]').text()).toContain('Página 1 de 3')
  })

  it.each(['0', 'abc'])('entrar en /eventos?pagina=%s pide la página 1', async (valor) => {
    conEventos(25)
    await montar(EventosView, { rutaInicial: `/eventos?pagina=${valor}` })

    expect(paginasPedidas()).toEqual([1])
  })

  it('una página mayor que la última muestra "Esta página no existe" y el botón a la primera página', async () => {
    conEventos(25)
    const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?pagina=9' })

    expect(wrapper.find('[data-test="pagina-no-existe"]').text()).toBe('Esta página no existe')
    expect(wrapper.find('[data-test="primera-pagina"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="evento"]').exists()).toBe(false)
  })

  it('el botón de la primera página va a /eventos?pagina=1', async () => {
    conEventos(25)
    const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos?pagina=9' })

    await wrapper.find('[data-test="primera-pagina"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/eventos?pagina=1')
    expect(wrapper.findAll('[data-test="evento"]')).toHaveLength(10)
  })
})
