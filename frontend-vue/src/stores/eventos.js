import { defineStore } from 'pinia'
import * as servicioEventos from '@backend/services/eventos.js'

export const TAMANO_PAGINA = 10

// Los id de los eventos son uuid. Si el de la URL no lo es, el evento no puede existir.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Número de la última petición. Si llegan dos respuestas desordenadas (por ejemplo,
// al pulsar atrás y adelante muy rápido), solo se guarda la de la última petición.
let ultimaPeticion = 0

/**
 * Estado compartido de los eventos: la página del listado (con el total y si se está
 * cargando o ha habido un error) y el evento que se ve en el detalle y en la edición.
 */
export const useEventosStore = defineStore('eventos', {
  state: () => ({
    eventos: [],
    total: 0,
    pagina: 1,
    tamano: TAMANO_PAGINA,
    cargando: false,
    error: null,

    evento: null,
    cargandoEvento: false,
    errorEvento: null
  }),

  getters: {
    totalPaginas: (state) => Math.ceil(state.total / state.tamano)
  },

  actions: {
    async cargarPagina(pagina) {
      const peticion = ++ultimaPeticion
      this.cargando = true
      this.error = null
      this.pagina = pagina

      try {
        const resultado = await servicioEventos.buscarEventos({ pagina, tamano: this.tamano })
        if (peticion !== ultimaPeticion) return
        this.eventos = resultado.datos
        this.total = resultado.total
      } catch {
        if (peticion !== ultimaPeticion) return
        this.eventos = []
        this.total = 0
        this.error = 'No se han podido cargar los eventos'
      } finally {
        if (peticion === ultimaPeticion) this.cargando = false
      }
    },

    /** Carga el evento del detalle. Si no existe, errorEvento es "Evento no encontrado". */
    async cargarEvento(id) {
      this.cargandoEvento = true
      this.errorEvento = null
      this.evento = null
      try {
        if (!UUID_REGEX.test(id)) throw new Error('Evento no encontrado')
        this.evento = await servicioEventos.obtenerEvento(id)
      } catch (error) {
        this.errorEvento = error.message === 'Evento no encontrado' ? error.message : 'No se ha podido cargar el evento'
      } finally {
        this.cargandoEvento = false
      }
    },

    // Crear, modificar y eliminar lanzan el error del servicio para que la vista muestre su mensaje.
    // El listado no se toca: se vuelve a pedir al entrar en /eventos, así que muestra los cambios.

    async crearEvento(datos) {
      return await servicioEventos.crearEvento(datos)
    },

    async modificarEvento(id, datos) {
      const actualizado = await servicioEventos.modificarEvento(id, datos)
      if (this.evento?.id === id) this.evento = { ...this.evento, ...actualizado }
      return actualizado
    },

    async eliminarEvento(id) {
      await servicioEventos.eliminarEvento(id)
      if (this.evento?.id === id) this.evento = null
    }
  }
})
