import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@backend/services/eventos.js', () => ({
  buscarEventos: vi.fn(),
  obtenerEvento: vi.fn(),
  crearEvento: vi.fn(),
  modificarEvento: vi.fn(),
  eliminarEvento: vi.fn()
}))

import { buscarEventos, obtenerEvento, crearEvento, modificarEvento, eliminarEvento } from '@backend/services/eventos.js'
import { useEventosStore } from '@/stores/eventos.js'

const EVENTO = { id: 'e1', titulo: 'Fiesta', fecha: '2027-01-10T22:00:00Z', ciudad: 'Alicante', estado: 'abierto' }

describe('Store de eventos', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('cargar la página 1 guarda los eventos, el total y la página', async () => {
    buscarEventos.mockResolvedValue({ datos: [EVENTO], total: 1, pagina: 1, tamano: 10 })
    const store = useEventosStore()

    await store.cargarPagina(1)

    expect(buscarEventos).toHaveBeenCalledWith({ pagina: 1, tamano: 10 })
    expect(store.eventos).toEqual([EVENTO])
    expect(store.total).toBe(1)
    expect(store.pagina).toBe(1)
    expect(store.cargando).toBe(false)
    expect(store.error).toBeNull()
  })

  it('mientras se carga una página está cargando', async () => {
    buscarEventos.mockReturnValue(new Promise(() => {}))
    const store = useEventosStore()

    store.cargarPagina(2)

    expect(store.cargando).toBe(true)
  })

  it('si falla la carga guarda el error y deja de estar cargando', async () => {
    buscarEventos.mockRejectedValue(new Error('Failed to fetch'))
    const store = useEventosStore()

    await store.cargarPagina(1)

    expect(store.error).toBe('No se han podido cargar los eventos')
    expect(store.cargando).toBe(false)
    expect(store.eventos).toEqual([])
  })

  it('con 25 eventos hay 3 páginas', () => {
    const store = useEventosStore()
    store.total = 25
    expect(store.totalPaginas).toBe(3)
  })

  it('si llegan dos respuestas desordenadas se guarda la de la última petición', async () => {
    let responderPagina1
    buscarEventos
      .mockReturnValueOnce(new Promise((resolve) => { responderPagina1 = resolve }))
      .mockResolvedValueOnce({ datos: [{ ...EVENTO, id: 'e2' }], total: 15, pagina: 2, tamano: 10 })
    const store = useEventosStore()

    const peticion1 = store.cargarPagina(1)
    await store.cargarPagina(2)
    // La respuesta de la página 1 llega después que la de la página 2
    responderPagina1({ datos: [EVENTO], total: 15, pagina: 1, tamano: 10 })
    await peticion1

    expect(store.pagina).toBe(2)
    expect(store.eventos[0].id).toBe('e2')
    expect(store.cargando).toBe(false)
  })

  describe('Detalle', () => {
    const ID = '11111111-1111-4111-8111-111111111111'

    it('cargar un evento guarda el evento del detalle', async () => {
      obtenerEvento.mockResolvedValue({ ...EVENTO, id: ID })
      const store = useEventosStore()

      await store.cargarEvento(ID)

      expect(obtenerEvento).toHaveBeenCalledWith(ID)
      expect(store.evento.id).toBe(ID)
      expect(store.errorEvento).toBeNull()
      expect(store.cargandoEvento).toBe(false)
    })

    it('cargar un evento que no existe da "Evento no encontrado"', async () => {
      obtenerEvento.mockRejectedValue(new Error('Evento no encontrado'))
      const store = useEventosStore()

      await store.cargarEvento(ID)
      expect(store.errorEvento).toBe('Evento no encontrado')
      expect(store.evento).toBeNull()

      // Un id que no es un uuid tampoco puede existir, y no se llega a pedir
      obtenerEvento.mockClear()
      await store.cargarEvento('no-es-un-id')
      expect(store.errorEvento).toBe('Evento no encontrado')
      expect(obtenerEvento).not.toHaveBeenCalled()
    })

    it('crear, modificar y eliminar llaman al servicio y al modificar se actualiza el detalle', async () => {
      const store = useEventosStore()
      store.evento = { ...EVENTO, id: ID }

      crearEvento.mockResolvedValue({ ...EVENTO, id: 'nuevo' })
      expect((await store.crearEvento({ titulo: 'Nuevo' })).id).toBe('nuevo')
      expect(crearEvento).toHaveBeenCalledWith({ titulo: 'Nuevo' })

      modificarEvento.mockResolvedValue({ ...EVENTO, id: ID, titulo: 'Cambiado' })
      await store.modificarEvento(ID, { titulo: 'Cambiado' })
      expect(modificarEvento).toHaveBeenCalledWith(ID, { titulo: 'Cambiado' })
      expect(store.evento.titulo).toBe('Cambiado')

      eliminarEvento.mockResolvedValue()
      await store.eliminarEvento(ID)
      expect(eliminarEvento).toHaveBeenCalledWith(ID)
      expect(store.evento).toBeNull()
    })
  })
})
