import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '../src/supabaseClient.js'
import { registrar, login, logout } from '../src/services/auth.js'
import { crearEvento, obtenerEvento, modificarEvento, eliminarEvento } from '../src/services/eventos.js'
import { enviarPropuesta, listarPropuestas, retirarPropuesta } from '../src/services/propuestas.js'

const PASSWORD = 'secreta123'
const emailUnico = (prefijo) =>
  `${prefijo}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@gmail.com`

const DIA = 24 * 60 * 60 * 1000
const fechaFutura = () => new Date(Date.now() + 30 * DIA).toISOString()

const eventoValido = (extra = {}) => ({
  titulo: 'Noche Techno',
  fecha: fechaFutura(),
  ciudad: 'Alicante',
  lugar: 'Sala Test',
  genero: 'techno',
  ...extra
})

const propuestaValida = (extra = {}) => ({
  precio: 300,
  duracion_minutos: 120,
  descripcion: 'Sesión de techno de dos horas',
  ...extra
})

const EVENTO_INEXISTENTE = '00000000-0000-0000-0000-000000000000'

// Los tests se agrupan por usuario: cada bloque hace login una sola vez para no superar el límite de peticiones de Supabase Auth.
// Los bloques dependen del orden: DJ 1 envía antes que DJ 2, y las propuestas se retiran al final.
describe('Propuestas', () => {
  const emailOrga = emailUnico('orga')
  const emailDj1 = emailUnico('dj1')
  const emailDj2 = emailUnico('dj2')
  let idDj1, idDj2
  let eventoAbierto, eventoCerrado, eventoParaBorrar
  let propuestaDj1, propuestaDj2, propuestaEnEventoParaBorrar
  const creados = []

  beforeAll(async () => {
    // registrar() deja la sesión iniciada, así el organizador crea sus eventos sin hacer login
    await registrar({ email: emailOrga, password: PASSWORD, nombre: 'Organizador Propuestas', rol: 'organizador' })
    eventoAbierto = await crearEvento(eventoValido())
    eventoCerrado = await crearEvento(eventoValido({ titulo: 'Noche Cerrada' }))
    await modificarEvento(eventoCerrado.id, { estado: 'cerrado' })
    eventoParaBorrar = await crearEvento(eventoValido({ titulo: 'Noche Para Borrar' }))
    creados.push(eventoAbierto.id, eventoCerrado.id, eventoParaBorrar.id)
    await logout()
    idDj1 = (await registrar({ email: emailDj1, password: PASSWORD, nombre: 'DJ Uno', rol: 'dj' })).id
    await logout()
    idDj2 = (await registrar({ email: emailDj2, password: PASSWORD, nombre: 'DJ Dos', rol: 'dj' })).id
    await logout()
  })

  afterAll(async () => {
    // Al borrar los eventos se borran también sus propuestas (on delete cascade)
    await login(emailOrga, PASSWORD)
    await supabase.from('eventos').delete().in('id', creados)
    await logout()
  })

  describe('Enviar (DJ 1)', () => {
    beforeAll(async () => {
      await login(emailDj1, PASSWORD)
      // Propuesta para comprobar después que se borra al borrar su evento
      propuestaEnEventoParaBorrar = await enviarPropuesta(eventoParaBorrar.id, propuestaValida())
    })
    afterAll(() => logout())

    it('un DJ envía una propuesta correcta', async () => {
      propuestaDj1 = await enviarPropuesta(eventoAbierto.id, propuestaValida())
      expect(propuestaDj1).toMatchObject({
        evento_id: eventoAbierto.id,
        dj_id: idDj1,
        estado: 'pendiente',
        precio: 300,
        duracion_minutos: 120
      })
    })

    it('falla al enviar una propuesta sin precio', async () => {
      const { precio, ...sinPrecio } = propuestaValida()
      await expect(enviarPropuesta(eventoAbierto.id, sinPrecio)).rejects.toThrow(/precio/)
    })

    it('falla al enviar una propuesta con precio negativo', async () => {
      await expect(enviarPropuesta(eventoAbierto.id, propuestaValida({ precio: -50 }))).rejects.toThrow(/negativo/)
    })

    it('falla al enviar una propuesta con duración 0 o mayor que 720', async () => {
      await expect(enviarPropuesta(eventoAbierto.id, propuestaValida({ duracion_minutos: 0 }))).rejects.toThrow(/duración/)
      await expect(enviarPropuesta(eventoAbierto.id, propuestaValida({ duracion_minutos: 721 }))).rejects.toThrow(/duración/)
    })

    it('falla al enviar una propuesta a un evento que no existe', async () => {
      await expect(enviarPropuesta(EVENTO_INEXISTENTE, propuestaValida())).rejects.toThrow('Evento no encontrado')
    })

    it('falla al enviar una propuesta a un evento cerrado', async () => {
      await expect(enviarPropuesta(eventoCerrado.id, propuestaValida())).rejects.toThrow(/abiertos/)
    })

    it('un DJ no puede enviar una segunda propuesta al mismo evento', async () => {
      await expect(enviarPropuesta(eventoAbierto.id, propuestaValida({ precio: 200 }))).rejects.toThrow(/Ya has enviado/)
    })

    it('la base de datos impide insertar una propuesta a nombre de otro DJ (RLS)', async () => {
      // Saltándose la capa de servicios
      const { data, error } = await supabase
        .from('propuestas')
        .insert({ ...propuestaValida(), evento_id: eventoAbierto.id, dj_id: idDj2 })
        .select()
      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('Sin sesión', () => {
    it('falla al enviar una propuesta sin sesión', async () => {
      await expect(enviarPropuesta(eventoAbierto.id, propuestaValida())).rejects.toThrow(/iniciar sesión/)
    })

    it('sin sesión no se ve ninguna propuesta', async () => {
      expect(await listarPropuestas(eventoAbierto.id)).toEqual([])
    })
  })

  describe('Propuestas de otro DJ (DJ 2)', () => {
    beforeAll(async () => {
      await login(emailDj2, PASSWORD)
      propuestaDj2 = await enviarPropuesta(eventoAbierto.id, propuestaValida({ precio: 250 }))
    })
    afterAll(() => logout())

    it('un DJ solo ve su propuesta al listar las de un evento', async () => {
      const propuestas = await listarPropuestas(eventoAbierto.id)
      expect(propuestas.map((p) => p.id)).toEqual([propuestaDj2.id])
    })

    // Que la propuesta de DJ 1 sigue existiendo se comprueba después, al listar como organizador
    it('un DJ no puede retirar la propuesta de otro', async () => {
      await expect(retirarPropuesta(propuestaDj1.id)).rejects.toThrow(/permiso/)
    })

    it('la base de datos impide borrar la propuesta de otro DJ (RLS)', async () => {
      // Saltándose la capa de servicios: la política RLS no deja borrar ninguna fila ajena
      const { data } = await supabase.from('propuestas').delete().eq('id', propuestaDj1.id).select()
      expect(data).toEqual([])
    })
  })

  describe('Organizador', () => {
    beforeAll(() => login(emailOrga, PASSWORD))
    afterAll(() => logout())

    it('un organizador no puede enviar propuestas', async () => {
      await expect(enviarPropuesta(eventoAbierto.id, propuestaValida())).rejects.toThrow(/Solo los DJs/)
    })

    it('el organizador ve todas las propuestas de su evento, de la más antigua a la más reciente', async () => {
      const propuestas = await listarPropuestas(eventoAbierto.id)
      expect(propuestas.map((p) => p.id)).toEqual([propuestaDj1.id, propuestaDj2.id])
    })

    it('ver un evento devuelve el evento con sus propuestas', async () => {
      const evento = await obtenerEvento(eventoAbierto.id)
      expect(evento.id).toBe(eventoAbierto.id)
      expect(evento.propuestas.map((p) => p.id)).toEqual([propuestaDj1.id, propuestaDj2.id])
    })

    it('el organizador borra un evento con propuestas', async () => {
      await eliminarEvento(eventoParaBorrar.id)
      await expect(obtenerEvento(eventoParaBorrar.id)).rejects.toThrow('Evento no encontrado')
    })
  })

  describe('Retirar (DJ 1)', () => {
    beforeAll(() => login(emailDj1, PASSWORD))
    afterAll(() => logout())

    // El DJ es el autor, así que si la propuesta siguiera existiendo RLS le dejaría verla
    it('al borrar un evento se borran también sus propuestas', async () => {
      const { data } = await supabase.from('propuestas').select('id').eq('id', propuestaEnEventoParaBorrar.id)
      expect(data).toEqual([])
    })

    it('un DJ retira su propuesta', async () => {
      await retirarPropuesta(propuestaDj1.id)
      const propuestas = await listarPropuestas(eventoAbierto.id)
      expect(propuestas.map((p) => p.id)).not.toContain(propuestaDj1.id)
    })
  })
})
