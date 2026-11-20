import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@backend/services/eventos.js', () => ({ buscarEventos: vi.fn() }))

import { buscarEventos } from '@backend/services/eventos.js'
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
})
