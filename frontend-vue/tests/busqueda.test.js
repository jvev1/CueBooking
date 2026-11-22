import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'

vi.mock('@backend/services/eventos.js', () => ({ buscarEventos: vi.fn() }))
vi.mock('@backend/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@backend/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import { buscarEventos } from '@backend/services/eventos.js'
import { validarFormularioBusqueda } from '@backend/services/validacion.js'
import { useEventosStore } from '@/stores/eventos.js'
import EventosView from '@/views/EventosView.vue'
import { montar } from './montar.js'

function evento(numero) {
  return {
    id: `e${numero}`,
    titulo: `Evento ${numero}`,
    fecha: new Date(2027, 0, numero, 22, 0).toISOString(),
    ciudad: 'Alicante',
    genero: 'techno',
    estado: 'abierto'
  }
}

/** Simula buscarEventos devolviendo `total` eventos para cualquier búsqueda, paginados. */
function conResultados(total) {
  const todos = Array.from({ length: total }, (_, i) => evento(i + 1))
  buscarEventos.mockImplementation(async ({ pagina, tamano }) => ({
    datos: todos.slice((pagina - 1) * tamano, pagina * tamano),
    total,
    pagina,
    tamano
  }))
}

const ultimaBusqueda = () => buscarEventos.mock.calls.at(-1)[0]

async function buscar(wrapper, { ciudad, genero, desde, hasta } = {}) {
  if (ciudad !== undefined) await wrapper.find('#busqueda-ciudad').setValue(ciudad)
  if (genero !== undefined) await wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', genero)
  const [pickerDesde, pickerHasta] = wrapper.findAllComponents(DatePicker)
  if (desde !== undefined) await pickerDesde.vm.$emit('update:modelValue', desde)
  if (hasta !== undefined) await pickerHasta.vm.$emit('update:modelValue', hasta)
  await wrapper.find('form[role="search"]').trigger('submit')
  await flushPromises()
}

describe('Búsqueda de eventos', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('Validación', () => {
    it('"desde" posterior a "hasta" da error en las fechas', () => {
      const errores = validarFormularioBusqueda({ desde: new Date(2027, 1, 10), hasta: new Date(2027, 1, 1) })
      expect(errores.hasta).toBe('La fecha "desde" no puede ser posterior a "hasta"')
    })

    it('con fechas correctas o vacías no da errores', () => {
      expect(validarFormularioBusqueda({ desde: new Date(2027, 1, 1), hasta: new Date(2027, 1, 10) })).toEqual({})
      expect(validarFormularioBusqueda({ desde: new Date(2027, 1, 1), hasta: new Date(2027, 1, 1) })).toEqual({})
      expect(validarFormularioBusqueda({ desde: null, hasta: null })).toEqual({})
    })
  })

  describe('Store', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('cargar una página con filtros llama a buscarEventos con los filtros, la página y el tamaño', async () => {
      conResultados(3)
      const store = useEventosStore()

      await store.cargarPagina(2, { ciudad: 'Alicante', genero: 'techno' })

      expect(buscarEventos).toHaveBeenCalledWith({ ciudad: 'Alicante', genero: 'techno', pagina: 2, tamano: 10 })
      expect(store.filtros).toEqual({ ciudad: 'Alicante', genero: 'techno' })
      expect(store.hayFiltros).toBe(true)
    })

    it('las fechas se envían como el principio del día "desde" y el final del día "hasta"', async () => {
      conResultados(0)
      const store = useEventosStore()

      await store.cargarPagina(1, { desde: '2027-01-10', hasta: '2027-01-12' })

      expect(ultimaBusqueda().desde).toBe(new Date(2027, 0, 10, 0, 0, 0, 0).toISOString())
      expect(ultimaBusqueda().hasta).toBe(new Date(2027, 0, 12, 23, 59, 59, 999).toISOString())
    })
  })

  describe('Formulario y listado', () => {
    it('sin filtros se ve el formulario vacío y el listado completo', async () => {
      conResultados(3)
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

      expect(wrapper.find('#busqueda-ciudad').element.value).toBe('')
      expect(ultimaBusqueda()).toEqual({ pagina: 1, tamano: 10 })
      expect(wrapper.findAll('[data-test="evento"]')).toHaveLength(3)
    })

    it('buscar por ciudad pide los eventos de esa ciudad y pone ?ciudad=... y la página 1 en la URL', async () => {
      conResultados(3)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })

      await buscar(wrapper, { ciudad: ' Alicante ' })

      expect(router.currentRoute.value.query).toEqual({ ciudad: 'Alicante', pagina: '1' })
      expect(ultimaBusqueda()).toEqual({ ciudad: 'Alicante', pagina: 1, tamano: 10 })
    })

    it('buscar combinando ciudad, género y fechas pide los eventos con todos los filtros', async () => {
      conResultados(2)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })

      await buscar(wrapper, { ciudad: 'Elche', genero: 'house', desde: new Date(2027, 2, 1), hasta: new Date(2027, 2, 31) })

      expect(router.currentRoute.value.query).toEqual({
        ciudad: 'Elche',
        genero: 'house',
        desde: '2027-03-01',
        hasta: '2027-03-31',
        pagina: '1'
      })
      expect(ultimaBusqueda()).toMatchObject({ ciudad: 'Elche', genero: 'house', pagina: 1 })
      expect(ultimaBusqueda().desde).toBeDefined()
      expect(ultimaBusqueda().hasta).toBeDefined()
    })

    it('los filtros vacíos no se envían', async () => {
      conResultados(3)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })

      await buscar(wrapper, { ciudad: '   ', genero: null })

      expect(router.currentRoute.value.query).toEqual({ pagina: '1' })
      expect(ultimaBusqueda()).toEqual({ pagina: 1, tamano: 10 })
    })

    it('con "desde" posterior a "hasta" sale el error y no se busca', async () => {
      conResultados(3)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })
      const llamadas = buscarEventos.mock.calls.length

      await buscar(wrapper, { desde: new Date(2027, 5, 10), hasta: new Date(2027, 5, 1) })

      expect(wrapper.find('[data-test="error-fechas"]').text()).toBe('La fecha "desde" no puede ser posterior a "hasta"')
      expect(buscarEventos.mock.calls.length).toBe(llamadas)
      expect(router.currentRoute.value.fullPath).toBe('/eventos')
    })

    it('buscar estando en la página 3 vuelve a la página 1', async () => {
      conResultados(25)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos?pagina=3' })

      await buscar(wrapper, { genero: 'techno' })

      expect(router.currentRoute.value.query.pagina).toBe('1')
      expect(ultimaBusqueda()).toMatchObject({ genero: 'techno', pagina: 1 })
    })

    it('el total y la paginación son los de la búsqueda', async () => {
      conResultados(12)
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Alicante' })

      expect(wrapper.find('[data-test="info-paginacion"]').text()).toBe('Página 1 de 2 · 12 eventos')
    })

    it('al pasar de página en una búsqueda la URL mantiene los filtros y se piden con la página siguiente', async () => {
      conResultados(12)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Alicante&genero=techno' })

      await wrapper.find('[data-test="siguiente"]').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.query).toEqual({ ciudad: 'Alicante', genero: 'techno', pagina: '2' })
      expect(ultimaBusqueda()).toEqual({ ciudad: 'Alicante', genero: 'techno', pagina: 2, tamano: 10 })
    })

    it('al entrar en una URL con filtros el formulario sale relleno y se piden con esos filtros', async () => {
      conResultados(1)
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Elche&genero=pop&desde=2027-04-01' })

      expect(wrapper.find('#busqueda-ciudad').element.value).toBe('Elche')
      expect(wrapper.findAllComponents(Select)[0].props('modelValue')).toBe('pop')
      expect(wrapper.findAllComponents(DatePicker)[0].props('modelValue')).toEqual(new Date(2027, 3, 1))
      expect(ultimaBusqueda()).toMatchObject({ ciudad: 'Elche', genero: 'pop', pagina: 1 })
    })

    it('volver atrás después de buscar vuelve a la búsqueda anterior', async () => {
      conResultados(3)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Alicante' })
      await buscar(wrapper, { ciudad: 'Elche' })

      router.back()
      await new Promise((resolve) => setTimeout(resolve))
      await flushPromises()

      expect(router.currentRoute.value.query).toEqual({ ciudad: 'Alicante' })
      expect(ultimaBusqueda()).toEqual({ ciudad: 'Alicante', pagina: 1, tamano: 10 })
      expect(wrapper.find('#busqueda-ciudad').element.value).toBe('Alicante')
    })

    it('los filtros no válidos de la URL se ignoran', async () => {
      conResultados(3)
      await montar(EventosView, { rutaInicial: '/eventos?genero=jazz&desde=2027-02-31&hasta=mañana&ciudad=Alicante' })

      expect(ultimaBusqueda()).toEqual({ ciudad: 'Alicante', pagina: 1, tamano: 10 })
    })
  })

  describe('Mensajes', () => {
    it('una búsqueda sin resultados muestra "No hay eventos que coincidan con la búsqueda" y "Quitar filtros"', async () => {
      conResultados(0)
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Murcia' })

      expect(wrapper.find('[data-test="sin-resultados"]').text()).toBe('No hay eventos que coincidan con la búsqueda')
      expect(wrapper.find('[data-test="quitar-filtros-resultado"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="vacio"]').exists()).toBe(false)
    })

    it('sin filtros y sin eventos muestra "Todavía no hay eventos publicados"', async () => {
      conResultados(0)
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos' })

      expect(wrapper.find('[data-test="vacio"]').text()).toBe('Todavía no hay eventos publicados')
      expect(wrapper.find('[data-test="sin-resultados"]').exists()).toBe(false)
    })

    it.each(['quitar-filtros', 'quitar-filtros-resultado'])('"Quitar filtros" (%s) vacía el formulario y vuelve al listado completo', async (boton) => {
      conResultados(0)
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Murcia&genero=rock' })

      await wrapper.find(`[data-test="${boton}"]`).trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.query).toEqual({ pagina: '1' })
      expect(ultimaBusqueda()).toEqual({ pagina: 1, tamano: 10 })
      expect(wrapper.find('#busqueda-ciudad').element.value).toBe('')
    })

    it('mientras se busca se ve el indicador de carga', async () => {
      buscarEventos.mockReturnValue(new Promise(() => {}))
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Alicante' })

      expect(wrapper.find('[data-test="cargando"]').exists()).toBe(true)
    })

    it('si falla la búsqueda sale el error y "Reintentar" repite la misma búsqueda', async () => {
      buscarEventos.mockRejectedValueOnce(new Error('Failed to fetch'))
      conResultados(3)
      const { wrapper } = await montar(EventosView, { rutaInicial: '/eventos?ciudad=Alicante&pagina=1' })

      expect(wrapper.find('[data-test="error"]').text()).toBe('No se han podido cargar los eventos')
      await wrapper.find('[data-test="reintentar"]').trigger('click')
      await flushPromises()

      expect(buscarEventos.mock.calls.map(([parametros]) => parametros)).toEqual([
        { ciudad: 'Alicante', pagina: 1, tamano: 10 },
        { ciudad: 'Alicante', pagina: 1, tamano: 10 }
      ])
      expect(wrapper.findAll('[data-test="evento"]')).toHaveLength(3)
    })
  })
})
