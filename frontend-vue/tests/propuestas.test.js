import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import InputNumber from 'primevue/inputnumber'

vi.mock('@backend/services/eventos.js', () => ({ buscarEventos: vi.fn(), obtenerEvento: vi.fn() }))
vi.mock('@backend/services/propuestas.js', () => ({ enviarPropuesta: vi.fn(), retirarPropuesta: vi.fn() }))
vi.mock('@backend/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@backend/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import { obtenerEvento } from '@backend/services/eventos.js'
import * as servicio from '@backend/services/propuestas.js'
import { validarFormularioPropuesta } from '@backend/services/validacion.js'
import { useEventosStore } from '@/stores/eventos.js'
import { useSesionStore } from '@/stores/sesion.js'
import { formatearDuracion } from '@/utils/formato.js'
import DetalleEventoView from '@/views/DetalleEventoView.vue'
import { montar } from './montar.js'

const ID = '11111111-1111-4111-8111-111111111111'
const ORGANIZADOR = 'org-1'
const DJ = 'dj-1'

const propuesta = (id, dj, cambios = {}) => ({
  id,
  evento_id: ID,
  dj_id: dj,
  precio: 300,
  duracion_minutos: 90,
  descripcion: `Propuesta ${id}`,
  estado: 'pendiente',
  creado_en: new Date(2027, 0, 5, 18, 30).toISOString(),
  ...cambios
})

function conEvento({ estado = 'abierto', propuestas = [] } = {}) {
  obtenerEvento.mockResolvedValue({
    id: ID,
    organizador_id: ORGANIZADOR,
    titulo: 'Fiesta de verano',
    fecha: new Date(2027, 6, 15, 22, 0).toISOString(),
    ciudad: 'Alicante',
    estado,
    propuestas
  })
}

function sesionDe(quien) {
  return () => {
    if (quien === 'nadie') return
    const usuarios = {
      organizador: { id: ORGANIZADOR, rol: 'organizador' },
      otroOrganizador: { id: 'org-2', rol: 'organizador' },
      dj: { id: DJ, rol: 'dj' }
    }
    const { id, rol } = usuarios[quien]
    const sesion = useSesionStore()
    sesion.usuario = { id }
    sesion.perfil = { id, nombre: 'Prueba', rol }
  }
}

const montarDetalle = (quien) => montar(DetalleEventoView, { rutaInicial: `/eventos/${ID}`, prepararSesion: sesionDe(quien) })

async function rellenarYEnviar(wrapper, { precio, duracion, descripcion } = {}) {
  const [inputPrecio, inputDuracion] = wrapper.findAllComponents(InputNumber).filter((c) => c.props('inputId')?.startsWith('propuesta-'))
  if (precio !== undefined) await inputPrecio.vm.$emit('update:modelValue', precio)
  if (duracion !== undefined) await inputDuracion.vm.$emit('update:modelValue', duracion)
  if (descripcion !== undefined) await wrapper.find('#propuesta-descripcion').setValue(descripcion)
  await wrapper.find('[data-test="formulario-propuesta"]').trigger('submit')
  await flushPromises()
}

function botonDelDialogo(texto) {
  const dialogo = document.body.querySelector('[role="alertdialog"]')
  return [...(dialogo?.querySelectorAll('button') ?? [])].find((boton) => boton.textContent.includes(texto))
}

async function pulsarRetirarYResponder(wrapper, respuesta) {
  await wrapper.find('[data-test="retirar"]').trigger('click')
  await flushPromises()
  botonDelDialogo(respuesta).click()
  await flushPromises()
}

describe('Propuestas', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('Validación', () => {
    it('sin precio ni duración da error en los dos campos', () => {
      const errores = validarFormularioPropuesta({ precio: null, duracion_minutos: null })
      expect(errores.precio).toBe('El precio es obligatorio')
      expect(errores.duracion_minutos).toBe('La duración es obligatoria')
    })

    it('con precio negativo da error en el precio', () => {
      expect(validarFormularioPropuesta({ precio: -1, duracion_minutos: 60 }).precio).toBe('El precio no puede ser negativo')
    })

    it.each([0, 721, 90.5])('con duración %s da error en la duración', (duracion) => {
      expect(validarFormularioPropuesta({ precio: 100, duracion_minutos: duracion }).duracion_minutos).toBe(
        'La duración debe ser un entero entre 1 y 720 minutos'
      )
    })

    it('con descripción de más de 1000 caracteres da error en la descripción', () => {
      const errores = validarFormularioPropuesta({ precio: 100, duracion_minutos: 60, descripcion: 'a'.repeat(1001) })
      expect(errores.descripcion).toBe('La descripción no puede superar 1000 caracteres')
    })

    it('con datos correctos no da errores', () => {
      expect(validarFormularioPropuesta({ precio: 0, duracion_minutos: 1, descripcion: null })).toEqual({})
      expect(validarFormularioPropuesta({ precio: 250, duracion_minutos: 720, descripcion: 'a'.repeat(1000) })).toEqual({})
    })
  })

  describe('Store', () => {
    beforeEach(() => setActivePinia(createPinia()))

    it('enviar una propuesta llama al servicio y la añade a las propuestas del evento', async () => {
      const nueva = propuesta('p2', DJ)
      servicio.enviarPropuesta.mockResolvedValue(nueva)
      const store = useEventosStore()
      store.evento = { id: ID, propuestas: [propuesta('p1', 'dj-2')] }

      await store.enviarPropuesta(ID, { precio: 300, duracion_minutos: 90, descripcion: null })

      expect(servicio.enviarPropuesta).toHaveBeenCalledWith(ID, { precio: 300, duracion_minutos: 90, descripcion: null })
      expect(store.evento.propuestas.map((p) => p.id)).toEqual(['p1', 'p2'])
    })

    it('retirar una propuesta llama al servicio y la quita de las propuestas del evento', async () => {
      servicio.retirarPropuesta.mockResolvedValue()
      const store = useEventosStore()
      store.evento = { id: ID, propuestas: [propuesta('p1', 'dj-2'), propuesta('p2', DJ)] }

      await store.retirarPropuesta('p2')

      expect(servicio.retirarPropuesta).toHaveBeenCalledWith('p2')
      expect(store.evento.propuestas.map((p) => p.id)).toEqual(['p1'])
    })
  })

  it('formatea la duración como "90 min"', () => {
    expect(formatearDuracion(90)).toBe('90 min')
  })

  describe('Quién ve qué', () => {
    it.each(['nadie', 'otroOrganizador'])('con %s no se ve la sección "Propuestas"', async (quien) => {
      conEvento({ propuestas: [] })
      const { wrapper } = await montarDetalle(quien)

      expect(wrapper.find('[data-test="titulo"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="propuestas"]').exists()).toBe(false)
    })

    it('el organizador del evento ve todas las propuestas con sus datos y sin formulario', async () => {
      conEvento({ propuestas: [propuesta('p1', 'dj-2'), propuesta('p2', 'dj-3', { precio: 450, duracion_minutos: 120 })] })
      const { wrapper } = await montarDetalle('organizador')

      const items = wrapper.findAll('[data-test="propuesta"]')
      expect(items).toHaveLength(2)
      expect(items[1].find('[data-test="propuesta-precio-texto"]').text()).toMatch(/450,00\s€/)
      expect(items[1].find('[data-test="propuesta-duracion-texto"]').text()).toBe('120 min')
      expect(items[0].find('[data-test="propuesta-descripcion-texto"]').text()).toBe('Propuesta p1')
      expect(items[0].find('[data-test="propuesta-fecha"]').text()).toBe('Enviada el 05/01/2027 18:30')
      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="retirar"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="tu-propuesta"]').exists()).toBe(false)
    })

    it('el organizador sin propuestas ve "Todavía no hay propuestas para este evento"', async () => {
      conEvento({ propuestas: [] })
      const { wrapper } = await montarDetalle('organizador')

      expect(wrapper.find('[data-test="sin-propuestas"]').text()).toBe('Todavía no hay propuestas para este evento')
    })

    it('un DJ sin propuesta en un evento abierto ve el formulario', async () => {
      conEvento({ propuestas: [] })
      const { wrapper } = await montarDetalle('dj')

      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="sin-propuestas"]').exists()).toBe(false)
    })

    it('un DJ con su propuesta la ve con "Retirar" y no ve el formulario', async () => {
      conEvento({ propuestas: [propuesta('p1', DJ)] })
      const { wrapper } = await montarDetalle('dj')

      expect(wrapper.findAll('[data-test="propuesta"]')).toHaveLength(1)
      expect(wrapper.find('[data-test="tu-propuesta"]').text()).toBe('Tu propuesta')
      expect(wrapper.find('[data-test="retirar"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(false)
    })

    it.each(['cerrado', 'completado'])('un DJ en un evento %s ve "Este evento ya no acepta propuestas"', async (estado) => {
      conEvento({ estado, propuestas: [] })
      const { wrapper } = await montarDetalle('dj')

      expect(wrapper.find('[data-test="no-acepta"]').text()).toBe('Este evento ya no acepta propuestas')
      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(false)
    })
  })

  describe('Enviar', () => {
    it('con el formulario vacío muestra los errores debajo de cada campo y no llama al backend', async () => {
      conEvento()
      const { wrapper } = await montarDetalle('dj')

      await rellenarYEnviar(wrapper)

      expect(wrapper.find('[data-test="error-precio"]').text()).toBe('El precio es obligatorio')
      expect(wrapper.find('[data-test="error-duracion"]').text()).toBe('La duración es obligatoria')
      expect(servicio.enviarPropuesta).not.toHaveBeenCalled()
    })

    it('una propuesta correcta aparece en la lista sin recargar y deja de verse el formulario', async () => {
      conEvento()
      servicio.enviarPropuesta.mockResolvedValue(propuesta('nueva', DJ, { precio: 200, duracion_minutos: 60, descripcion: 'Set de house' }))
      const { wrapper } = await montarDetalle('dj')

      await rellenarYEnviar(wrapper, { precio: 200, duracion: 60, descripcion: ' Set de house ' })

      expect(servicio.enviarPropuesta).toHaveBeenCalledWith(ID, { precio: 200, duracion_minutos: 60, descripcion: 'Set de house' })
      expect(obtenerEvento).toHaveBeenCalledTimes(1)
      expect(wrapper.findAll('[data-test="propuesta"]')).toHaveLength(1)
      expect(wrapper.find('[data-test="propuesta-descripcion-texto"]').text()).toBe('Set de house')
      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(false)
    })

    it('mientras se envía el botón está cargando y desactivado', async () => {
      conEvento()
      servicio.enviarPropuesta.mockReturnValue(new Promise(() => {}))
      const { wrapper } = await montarDetalle('dj')

      await rellenarYEnviar(wrapper, { precio: 200, duracion: 60 })

      const boton = wrapper.find('[data-test="enviar-propuesta"]')
      expect(boton.attributes('disabled')).toBeDefined()
      expect(boton.find('[data-pc-section="loadingicon"]').exists()).toBe(true)
    })

    it('si el backend devuelve un error se muestra su mensaje', async () => {
      conEvento()
      servicio.enviarPropuesta.mockRejectedValue(new Error('Ya has enviado una propuesta a este evento'))
      const { wrapper } = await montarDetalle('dj')

      await rellenarYEnviar(wrapper, { precio: 200, duracion: 60 })

      expect(wrapper.find('[data-test="error-enviar"]').text()).toBe('Ya has enviado una propuesta a este evento')
      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(true)
    })
  })

  describe('Retirar', () => {
    it('pulsar "Retirar" muestra el diálogo de confirmación', async () => {
      conEvento({ propuestas: [propuesta('p1', DJ)] })
      const { wrapper } = await montarDetalle('dj')

      await wrapper.find('[data-test="retirar"]').trigger('click')
      await flushPromises()

      expect(document.body.querySelector('[role="alertdialog"]').textContent).toContain('retirar tu propuesta')
    })

    it('cancelar la retirada no retira y la propuesta sigue en la lista', async () => {
      conEvento({ propuestas: [propuesta('p1', DJ)] })
      const { wrapper } = await montarDetalle('dj')

      await pulsarRetirarYResponder(wrapper, 'Cancelar')

      expect(servicio.retirarPropuesta).not.toHaveBeenCalled()
      expect(wrapper.findAll('[data-test="propuesta"]')).toHaveLength(1)
    })

    it('confirmar la retirada la quita de la lista y vuelve a salir el formulario', async () => {
      conEvento({ propuestas: [propuesta('p1', DJ)] })
      servicio.retirarPropuesta.mockResolvedValue()
      const { wrapper } = await montarDetalle('dj')

      await pulsarRetirarYResponder(wrapper, 'Retirar')

      expect(servicio.retirarPropuesta).toHaveBeenCalledWith('p1')
      expect(wrapper.find('[data-test="propuesta"]').exists()).toBe(false)
      expect(wrapper.find('[data-test="formulario-propuesta"]').exists()).toBe(true)
    })

    it('si el backend devuelve un error al retirar se muestra su mensaje y la propuesta sigue', async () => {
      conEvento({ propuestas: [propuesta('p1', DJ)] })
      servicio.retirarPropuesta.mockRejectedValue(new Error('Propuesta no encontrada o no tienes permiso para retirarla'))
      const { wrapper } = await montarDetalle('dj')

      await pulsarRetirarYResponder(wrapper, 'Retirar')

      expect(wrapper.find('[data-test="error-retirar"]').text()).toBe('Propuesta no encontrada o no tienes permiso para retirarla')
      expect(wrapper.findAll('[data-test="propuesta"]')).toHaveLength(1)
    })
  })
})
