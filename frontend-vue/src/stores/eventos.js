import { defineStore } from 'pinia'
import * as servicioEventos from '@backend/services/eventos.js'
import * as servicioPropuestas from '@backend/services/propuestas.js'
import { parametrosDeBusqueda } from '@/utils/busqueda.js'

export const TAMANO_PAGINA = 10

// Los id de los eventos son uuid. Si el de la URL no lo es, el evento no puede existir.
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Número de la última petición. Si llegan dos respuestas desordenadas (por ejemplo,
// al pulsar atrás y adelante muy rápido), solo se guarda la de la última petición.
let ultimaPeticion = 0

/**
 * Estado compartido de los eventos: la página del listado o de la búsqueda (con sus filtros,
 * el total y si se está cargando o ha habido un error) y el evento del detalle y la edición,
 * con sus propuestas (evento.propuestas: las que el usuario puede ver según RLS).
 */
export const useEventosStore = defineStore('eventos', {
  state: () => ({
    eventos: [],
    total: 0,
    pagina: 1,
    tamano: TAMANO_PAGINA,
    // Filtros de la búsqueda cargada (ciudad, genero, desde y hasta, con las fechas en aaaa-mm-dd)
    filtros: {},
    cargando: false,
    error: null,

    evento: null,
    cargandoEvento: false,
    errorEvento: null
  }),

  getters: {
    totalPaginas: (state) => Math.ceil(state.total / state.tamano),
    hayFiltros: (state) => Object.keys(state.filtros).length > 0
  },

  actions: {
    /** Carga una página del listado. Con filtros, es una página de la búsqueda (se filtra en el backend). */
    async cargarPagina(pagina, filtros = {}) {
      const peticion = ++ultimaPeticion
      this.cargando = true
      this.error = null
      this.pagina = pagina
      this.filtros = filtros

      try {
        const resultado = await servicioEventos.buscarEventos({
          ...parametrosDeBusqueda(filtros),
          pagina,
          tamano: this.tamano
        })
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
    },

    // Las propuestas del detalle se actualizan en evento.propuestas, sin volver a pedir el evento

    async enviarPropuesta(eventoId, datos) {
      const propuesta = await servicioPropuestas.enviarPropuesta(eventoId, datos)
      if (this.evento?.id === eventoId) {
        this.evento = { ...this.evento, propuestas: [...(this.evento.propuestas ?? []), propuesta] }
      }
      return propuesta
    },

    async retirarPropuesta(id) {
      await servicioPropuestas.retirarPropuesta(id)
      if (this.evento?.propuestas) {
        this.evento = { ...this.evento, propuestas: this.evento.propuestas.filter((p) => p.id !== id) }
      }
    }
  }
})
