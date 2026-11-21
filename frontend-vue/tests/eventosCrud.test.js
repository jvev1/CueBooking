import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import DatePicker from 'primevue/datepicker'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'

vi.mock('@backend/services/eventos.js', () => ({
  buscarEventos: vi.fn(),
  obtenerEvento: vi.fn(),
  crearEvento: vi.fn(),
  modificarEvento: vi.fn(),
  eliminarEvento: vi.fn()
}))
vi.mock('@backend/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@backend/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import * as servicio from '@backend/services/eventos.js'
import EventosView from '@/views/EventosView.vue'
import DetalleEventoView from '@/views/DetalleEventoView.vue'
import NuevoEventoView from '@/views/NuevoEventoView.vue'
import EditarEventoView from '@/views/EditarEventoView.vue'
import { useSesionStore } from '@/stores/sesion.js'
import { montar } from './montar.js'

const ID = '11111111-1111-4111-8111-111111111111'
const ORGANIZADOR = 'org-1'
const MANANA = new Date(Date.now() + 24 * 60 * 60 * 1000)

const EVENTO = {
  id: ID,
  organizador_id: ORGANIZADOR,
  titulo: 'Fiesta de verano',
  descripcion: 'Sesión al aire libre',
  fecha: new Date(2027, 6, 15, 22, 0).toISOString(),
  ciudad: 'Alicante',
  lugar: 'Playa del Postiguet',
  genero: 'house',
  presupuesto: 1500,
  estado: 'abierto'
}

/** Prepara la sesión antes de montar: sin sesión, el organizador del evento, otro organizador o un DJ. */
function sesionDe(quien) {
  return () => {
    if (quien === 'nadie') return
    const sesion = useSesionStore()
    const usuarios = {
      dueno: { id: ORGANIZADOR, rol: 'organizador' },
      otro: { id: 'org-2', rol: 'organizador' },
      dj: { id: 'dj-1', rol: 'dj' }
    }
    const { id, rol } = usuarios[quien]
    sesion.usuario = { id }
    sesion.perfil = { id, nombre: 'Prueba', rol }
  }
}

/** Rellena el formulario. Los componentes de PrimeVue (fecha, género, presupuesto) se cambian con su evento. */
async function rellenarFormulario(wrapper, datos) {
  if ('titulo' in datos) await wrapper.find('#titulo').setValue(datos.titulo)
  if ('ciudad' in datos) await wrapper.find('#ciudad').setValue(datos.ciudad)
  if ('fecha' in datos) await wrapper.findComponent(DatePicker).vm.$emit('update:modelValue', datos.fecha)
  if ('genero' in datos) await wrapper.findAllComponents(Select)[0].vm.$emit('update:modelValue', datos.genero)
  if ('presupuesto' in datos) await wrapper.findComponent(InputNumber).vm.$emit('update:modelValue', datos.presupuesto)
}

const enviar = async (wrapper) => {
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

/** Botones del diálogo de confirmación, que PrimeVue dibuja en document.body. */
function botonDelDialogo(texto) {
  const dialogo = document.body.querySelector('[role="alertdialog"]')
  return [...(dialogo?.querySelectorAll('button') ?? [])].find((boton) => boton.textContent.includes(texto))
}

describe('Detalle y CRUD de eventos', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    servicio.obtenerEvento.mockResolvedValue({ ...EVENTO, propuestas: [] })
    servicio.buscarEventos.mockResolvedValue({ datos: [EVENTO], total: 1, pagina: 1, tamano: 10 })
  })

  describe('Listado', () => {
    it('pulsar un evento del listado va a su detalle', async () => {
      const { wrapper, router } = await montar(EventosView, { rutaInicial: '/eventos' })

      await wrapper.find('[data-test="evento"]').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.fullPath).toBe(`/eventos/${ID}`)
    })

    it('"Nuevo evento" lo ve un organizador y no un DJ ni un usuario sin sesión', async () => {
      const organizador = await montar(EventosView, { rutaInicial: '/eventos', prepararSesion: sesionDe('otro') })
      expect(organizador.wrapper.find('[data-test="nuevo-evento"]').exists()).toBe(true)

      const dj = await montar(EventosView, { rutaInicial: '/eventos', prepararSesion: sesionDe('dj') })
      expect(dj.wrapper.find('[data-test="nuevo-evento"]').exists()).toBe(false)

      const sinSesion = await montar(EventosView, { rutaInicial: '/eventos' })
      expect(sinSesion.wrapper.find('[data-test="nuevo-evento"]').exists()).toBe(false)
    })
  })

  describe('Detalle', () => {
    it('sin sesión muestra descripción, lugar y presupuesto, sin "Editar" ni "Eliminar"', async () => {
      const { wrapper } = await montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}` })

      expect(wrapper.find('[data-test="titulo"]').text()).toBe('Fiesta de verano')
      expect(wrapper.find('[data-test="descripcion"]').text()).toBe('Sesión al aire libre')
      expect(wrapper.find('[data-test="lugar"]').text()).toBe('Playa del Postiguet')
      expect(wrapper.find('[data-test="presupuesto"]').text()).toMatch(/1\.?500,00\s€/)
      expect(wrapper.find('[data-test="editar"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="eliminar"]').exists()).toBe(false)
    })

    it('con el organizador del evento muestra "Editar" y "Eliminar"', async () => {
      const { wrapper } = await montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}`, prepararSesion: sesionDe('dueno') })

      expect(wrapper.find('[data-test="editar"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="eliminar"]').exists()).toBe(true)
    })

    it.each(['otro', 'dj'])('con %s no muestra "Editar" ni "Eliminar"', async (quien) => {
      const { wrapper } = await montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}`, prepararSesion: sesionDe(quien) })

      expect(wrapper.find('[data-test="editar"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="eliminar"]').exists()).toBe(false)
    })

    it('un evento que no existe muestra "Evento no encontrado" y el enlace al listado', async () => {
      servicio.obtenerEvento.mockRejectedValue(new Error('Evento no encontrado'))
      const { wrapper } = await montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}` })

      expect(wrapper.find('[data-test="error-evento"]').text()).toBe('Evento no encontrado')
      expect(wrapper.find('[data-test="volver"]').attributes('href')).toBe('/eventos')
    })
  })

  describe('Permisos al entrar por URL', () => {
    it('/eventos/nuevo sin sesión va a /login', async () => {
      const { router } = await montar(DetalleEventoView, { rutaInicial: '/eventos/nuevo' })
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('/eventos/nuevo con un DJ va a /eventos', async () => {
      const { router } = await montar(EventosView, { rutaInicial: '/eventos/nuevo', prepararSesion: sesionDe('dj') })
      expect(router.currentRoute.value.path).toBe('/eventos')
    })

    it('/eventos/:id/editar sin sesión va a /login', async () => {
      const { router } = await montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}/editar` })
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('/eventos/:id/editar con un evento de otro va al detalle', async () => {
      const { router } = await montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}/editar`, prepararSesion: sesionDe('otro') })
      expect(router.currentRoute.value.path).toBe(`/eventos/${ID}`)
    })
  })

  describe('Crear', () => {
    const montarNuevo = () => montar(NuevoEventoView, { rutaInicial: '/eventos/nuevo', prepararSesion: sesionDe('dueno') })

    it('con el formulario vacío muestra los errores debajo de cada campo y no llama al backend', async () => {
      const { wrapper } = await montarNuevo()

      await enviar(wrapper)

      expect(wrapper.find('[data-test="error-titulo"]').text()).toBe('El título es obligatorio')
      expect(wrapper.find('[data-test="error-fecha"]').text()).toBe('La fecha es obligatoria')
      expect(wrapper.find('[data-test="error-ciudad"]').text()).toBe('La ciudad es obligatoria')
      expect(servicio.crearEvento).not.toHaveBeenCalled()
    })

    it('con un evento correcto va al detalle del evento creado', async () => {
      servicio.crearEvento.mockResolvedValue({ ...EVENTO, id: '22222222-2222-4222-8222-222222222222' })
      const { wrapper, router } = await montarNuevo()

      await rellenarFormulario(wrapper, { titulo: ' Fiesta ', ciudad: 'Elche', fecha: MANANA, genero: 'techno', presupuesto: 300 })
      await enviar(wrapper)

      expect(servicio.crearEvento).toHaveBeenCalledWith({
        titulo: 'Fiesta',
        descripcion: null,
        fecha: MANANA.toISOString(),
        ciudad: 'Elche',
        lugar: null,
        genero: 'techno',
        presupuesto: 300
      })
      expect(router.currentRoute.value.path).toBe('/eventos/22222222-2222-4222-8222-222222222222')
    })

    it('mientras se guarda el botón está cargando y desactivado', async () => {
      servicio.crearEvento.mockReturnValue(new Promise(() => {}))
      const { wrapper } = await montarNuevo()

      await rellenarFormulario(wrapper, { titulo: 'Fiesta', ciudad: 'Elche', fecha: MANANA })
      await enviar(wrapper)

      const boton = wrapper.find('[data-test="guardar"]')
      expect(boton.attributes('disabled')).toBeDefined()
      expect(boton.find('[data-pc-section="loadingicon"]').exists()).toBe(true)
    })

    it('si el backend devuelve un error se muestra su mensaje y se sigue en el formulario', async () => {
      servicio.crearEvento.mockRejectedValue(new Error('Solo los organizadores pueden crear eventos'))
      const { wrapper, router } = await montarNuevo()

      await rellenarFormulario(wrapper, { titulo: 'Fiesta', ciudad: 'Elche', fecha: MANANA })
      await enviar(wrapper)

      expect(wrapper.find('[data-test="error-servidor"]').text()).toBe('Solo los organizadores pueden crear eventos')
      expect(router.currentRoute.value.path).toBe('/eventos/nuevo')
      expect(wrapper.find('#titulo').element.value).toBe('Fiesta')
    })
  })

  describe('Editar', () => {
    const montarEdicion = () => montar(EditarEventoView, { rutaInicial: `/eventos/${ID}/editar`, prepararSesion: sesionDe('dueno') })

    it('el formulario sale con los datos actuales y el campo de estado', async () => {
      const { wrapper } = await montarEdicion()

      expect(wrapper.find('#titulo').element.value).toBe('Fiesta de verano')
      expect(wrapper.find('#ciudad').element.value).toBe('Alicante')
      expect(wrapper.find('#lugar').element.value).toBe('Playa del Postiguet')
      expect(wrapper.find('#descripcion').element.value).toBe('Sesión al aire libre')
      expect(wrapper.find('[data-test="estado"]').exists()).toBe(true)
    })

    it('"Cancelar" vuelve al detalle y no llama al backend', async () => {
      const { wrapper, router } = await montarEdicion()

      await wrapper.find('#titulo').setValue('Otro título')
      await wrapper.find('[data-test="cancelar"]').trigger('click')
      await flushPromises()

      expect(router.currentRoute.value.path).toBe(`/eventos/${ID}`)
      expect(servicio.modificarEvento).not.toHaveBeenCalled()
    })

    it('al guardar envía los cambios y vuelve al detalle', async () => {
      servicio.modificarEvento.mockResolvedValue({ ...EVENTO, titulo: 'Fiesta de otoño', estado: 'cerrado' })
      const { wrapper, router } = await montarEdicion()

      await wrapper.find('#titulo').setValue('Fiesta de otoño')
      await wrapper.findAllComponents(Select)[1].vm.$emit('update:modelValue', 'cerrado')
      await enviar(wrapper)

      // Solo se envían los campos que han cambiado
      expect(servicio.modificarEvento).toHaveBeenCalledWith(ID, { titulo: 'Fiesta de otoño', estado: 'cerrado' })
      expect(router.currentRoute.value.path).toBe(`/eventos/${ID}`)
    })
  })

  describe('Eliminar', () => {
    const montarDetalle = () => montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}`, prepararSesion: sesionDe('dueno') })

    it('pulsar "Eliminar" muestra el diálogo de confirmación', async () => {
      const { wrapper } = await montarDetalle()

      await wrapper.find('[data-test="eliminar"]').trigger('click')
      await flushPromises()

      expect(document.body.querySelector('[role="alertdialog"]').textContent).toContain('Fiesta de verano')
    })

    it('cancelar el borrado no borra y se sigue en el detalle', async () => {
      const { wrapper, router } = await montarDetalle()

      await wrapper.find('[data-test="eliminar"]').trigger('click')
      await flushPromises()
      botonDelDialogo('Cancelar').click()
      await flushPromises()

      expect(servicio.eliminarEvento).not.toHaveBeenCalled()
      expect(router.currentRoute.value.path).toBe(`/eventos/${ID}`)
    })

    it('confirmar el borrado elimina el evento y va al listado', async () => {
      servicio.eliminarEvento.mockResolvedValue()
      const { wrapper, router } = await montarDetalle()

      await wrapper.find('[data-test="eliminar"]').trigger('click')
      await flushPromises()
      botonDelDialogo('Eliminar').click()
      await flushPromises()

      expect(servicio.eliminarEvento).toHaveBeenCalledWith(ID)
      expect(router.currentRoute.value.path).toBe('/eventos')
    })

    it('si el backend devuelve un error al borrar se muestra su mensaje y se sigue en el detalle', async () => {
      servicio.eliminarEvento.mockRejectedValue(new Error('Evento no encontrado o no tienes permiso para eliminarlo'))
      const { wrapper, router } = await montarDetalle()

      await wrapper.find('[data-test="eliminar"]').trigger('click')
      await flushPromises()
      botonDelDialogo('Eliminar').click()
      await flushPromises()

      expect(wrapper.find('[data-test="error-accion"]').text()).toBe('Evento no encontrado o no tienes permiso para eliminarlo')
      expect(router.currentRoute.value.path).toBe(`/eventos/${ID}`)
    })
  })
})
