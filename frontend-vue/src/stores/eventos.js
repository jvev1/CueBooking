import { defineStore } from 'pinia'
import { buscarEventos } from '@backend/services/eventos.js'

export const TAMANO_PAGINA = 10

// Número de la última petición. Si llegan dos respuestas desordenadas (por ejemplo,
// al pulsar atrás y adelante muy rápido), solo se guarda la de la última petición.
let ultimaPeticion = 0

/**
 * Estado compartido del listado de eventos: la página cargada, el total
 * y si se está cargando o ha habido un error.
 */
export const useEventosStore = defineStore('eventos', {
  state: () => ({
    eventos: [],
    total: 0,
    pagina: 1,
    tamano: TAMANO_PAGINA,
    cargando: false,
    error: null
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
        const resultado = await buscarEventos({ pagina, tamano: this.tamano })
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
    }
  }
})
