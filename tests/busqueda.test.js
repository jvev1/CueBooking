import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '../src/supabaseClient.js'
import { registrar, login, logout } from '../src/services/auth.js'
import { crearEvento, buscarEventos } from '../src/services/eventos.js'

const PASSWORD = 'secreta123'
const emailUnico = (prefijo) =>
  `${prefijo}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@gmail.com`

const DIA = 24 * 60 * 60 * 1000
const dentroDeDias = (dias) => new Date(Date.now() + dias * DIA).toISOString()

// Ciudad inventada y única: así los eventos de otros tests no afectan a los resultados
const CIUDAD = `Ciudad Test ${Date.now()}`

// Se crean desordenados a propósito para comprobar que la búsqueda los ordena por fecha
const EVENTOS = {
  e3: { titulo: 'Evento 3', fecha: dentroDeDias(30), genero: 'techno' },
  e1: { titulo: 'Evento 1', fecha: dentroDeDias(10), genero: 'techno' },
  e5: { titulo: 'Evento 5', fecha: dentroDeDias(50), genero: 'techno' },
  e2: { titulo: 'Evento 2', fecha: dentroDeDias(20), genero: 'house' },
  e4: { titulo: 'Evento 4', fecha: dentroDeDias(40), genero: 'pop' }
}

describe('Búsqueda de eventos', () => {
  const email = emailUnico('orgbusqueda')
  // id de cada evento creado, por clave (e1..e5)
  const ids = {}
  // Fecha de cada evento tal y como la guarda la base de datos
  const fechas = {}

  const titulos = (resultado) => resultado.datos.map((e) => e.titulo)

  beforeAll(async () => {
    // registrar() deja la sesión iniciada
    await registrar({ email, password: PASSWORD, nombre: 'Organizador Búsqueda', rol: 'organizador' })
    for (const [clave, datos] of Object.entries(EVENTOS)) {
      const evento = await crearEvento({ ...datos, ciudad: CIUDAD })
      ids[clave] = evento.id
      fechas[clave] = evento.fecha
    }
    // Las búsquedas se hacen sin sesión
    await logout()
  })

  afterAll(async () => {
    await login(email, PASSWORD)
    await supabase.from('eventos').delete().in('id', Object.values(ids))
    await logout()
  })

  describe('Listar', () => {
    it('lista eventos sin haber iniciado sesión', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD })
      expect(resultado.datos.length).toBeGreaterThan(0)
    })

    it('sin parámetros usa la página 1 y tamaño 10', async () => {
      const resultado = await buscarEventos()
      expect(resultado).toMatchObject({ pagina: 1, tamano: 10 })
      expect(resultado.datos.length).toBeLessThanOrEqual(10)
    })

    it('ordena los resultados por fecha ascendente', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD })
      expect(titulos(resultado)).toEqual(['Evento 1', 'Evento 2', 'Evento 3', 'Evento 4', 'Evento 5'])
    })
  })

  describe('Filtros', () => {
    it('filtra por ciudad', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD })
      expect(resultado.total).toBe(5)
      expect(resultado.datos.every((e) => e.ciudad === CIUDAD)).toBe(true)
    })

    it('filtra por ciudad sin distinguir mayúsculas', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD.toUpperCase() })
      expect(resultado.total).toBe(5)
    })

    it('filtra por género', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, genero: 'techno' })
      expect(titulos(resultado)).toEqual(['Evento 1', 'Evento 3', 'Evento 5'])
    })

    it('filtra con desde (incluye la fecha indicada)', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, desde: fechas.e3 })
      expect(titulos(resultado)).toEqual(['Evento 3', 'Evento 4', 'Evento 5'])
    })

    it('filtra con hasta (incluye la fecha indicada)', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, hasta: fechas.e3 })
      expect(titulos(resultado)).toEqual(['Evento 1', 'Evento 2', 'Evento 3'])
    })

    it('combina ciudad, género y fechas', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, genero: 'techno', desde: fechas.e2, hasta: fechas.e5 })
      expect(titulos(resultado)).toEqual(['Evento 3', 'Evento 5'])
      expect(resultado.total).toBe(2)
    })

    it('devuelve una lista vacía y total 0 si ningún evento cumple los filtros', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, genero: 'rock' })
      expect(resultado).toMatchObject({ datos: [], total: 0 })
    })
  })

  describe('Paginación', () => {
    it('la página 1 de tamaño 2 trae 2 eventos y el total correcto', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, pagina: 1, tamano: 2 })
      expect(titulos(resultado)).toEqual(['Evento 1', 'Evento 2'])
      expect(resultado).toMatchObject({ total: 5, pagina: 1, tamano: 2 })
    })

    it('la página 2 trae los 2 eventos siguientes sin repetir los de la página 1', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, pagina: 2, tamano: 2 })
      expect(titulos(resultado)).toEqual(['Evento 3', 'Evento 4'])
      expect(resultado.total).toBe(5)
    })

    it('una página más allá del final devuelve una lista vacía', async () => {
      const resultado = await buscarEventos({ ciudad: CIUDAD, pagina: 10, tamano: 2 })
      expect(resultado).toMatchObject({ datos: [], total: 5, pagina: 10 })
    })
  })

  describe('Validación', () => {
    it('falla con un género que no está en la lista', async () => {
      await expect(buscarEventos({ genero: 'jazz' })).rejects.toThrow(/género/)
    })

    it('falla con la página 0', async () => {
      await expect(buscarEventos({ pagina: 0 })).rejects.toThrow(/página/)
    })

    it('falla con tamaño 0 o mayor que 50', async () => {
      await expect(buscarEventos({ tamano: 0 })).rejects.toThrow(/tamaño/)
      await expect(buscarEventos({ tamano: 51 })).rejects.toThrow(/tamaño/)
    })

    it('falla con una fecha desde no válida', async () => {
      await expect(buscarEventos({ desde: 'no-es-una-fecha' })).rejects.toThrow(/desde/)
    })

    it('falla si desde es posterior a hasta', async () => {
      await expect(buscarEventos({ desde: dentroDeDias(20), hasta: dentroDeDias(10) })).rejects.toThrow(/posterior/)
    })
  })
})
