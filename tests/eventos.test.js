import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { supabase } from '../src/supabaseClient.js'
import { registrar, login, logout } from '../src/services/auth.js'
import { crearEvento, obtenerEvento, modificarEvento, eliminarEvento } from '../src/services/eventos.js'

const PASSWORD = 'secreta123'
const emailUnico = (prefijo) =>
  `${prefijo}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@gmail.com`

const DIA = 24 * 60 * 60 * 1000
const fechaFutura = () => new Date(Date.now() + 30 * DIA).toISOString()
const fechaPasada = () => new Date(Date.now() - DIA).toISOString()

const eventoValido = (extra = {}) => ({
  titulo: 'Noche Techno',
  descripcion: 'Sesión de techno hasta el cierre',
  fecha: fechaFutura(),
  ciudad: 'Alicante',
  lugar: 'Sala Test',
  genero: 'techno',
  presupuesto: 500,
  ...extra
})

// Los tests se agrupan por usuario: cada bloque hace login una sola vez para no superar el límite de peticiones de Supabase Auth
describe('Eventos', () => {
  const emailA = emailUnico('orga')
  const emailB = emailUnico('orgb')
  const emailDj = emailUnico('dj')
  let idA, idB
  // Evento de A que nadie modifica: se usa para verlo y para los intentos de B
  let eventoDeA
  const creados = []

  beforeAll(async () => {
    // registrar() deja la sesión iniciada, así A crea eventoDeA sin hacer login
    idA = (await registrar({ email: emailA, password: PASSWORD, nombre: 'Organizador A', rol: 'organizador' })).id
    eventoDeA = await crearEvento(eventoValido())
    creados.push(eventoDeA.id)
    await logout()
    idB = (await registrar({ email: emailB, password: PASSWORD, nombre: 'Organizador B', rol: 'organizador' })).id
    await logout()
    await registrar({ email: emailDj, password: PASSWORD, nombre: 'DJ Eventos', rol: 'dj' })
    await logout()
  })

  afterAll(async () => {
    await login(emailA, PASSWORD)
    await supabase.from('eventos').delete().in('id', creados)
    await logout()
  })

  describe('Crear (organizador A)', () => {
    beforeAll(() => login(emailA, PASSWORD))
    afterAll(() => logout())

    it('un organizador crea un evento correcto', async () => {
      const evento = await crearEvento(eventoValido())
      creados.push(evento.id)
      expect(evento).toMatchObject({ organizador_id: idA, estado: 'abierto', titulo: 'Noche Techno' })
    })

    it('falla al crear un evento sin título', async () => {
      const { titulo, ...sinTitulo } = eventoValido()
      await expect(crearEvento(sinTitulo)).rejects.toThrow(/título/)
    })

    it('falla al crear un evento con fecha pasada', async () => {
      await expect(crearEvento(eventoValido({ fecha: fechaPasada() }))).rejects.toThrow(/futura/)
    })

    it('falla al crear un evento sin ciudad', async () => {
      const { ciudad, ...sinCiudad } = eventoValido()
      await expect(crearEvento(sinCiudad)).rejects.toThrow(/ciudad/)
    })

    it('falla al crear un evento con presupuesto negativo', async () => {
      await expect(crearEvento(eventoValido({ presupuesto: -100 }))).rejects.toThrow(/negativo/)
    })

    it('falla al crear un evento con un género que no está en la lista', async () => {
      await expect(crearEvento(eventoValido({ genero: 'jazz' }))).rejects.toThrow(/género/)
    })

    it('la base de datos impide insertar un evento a nombre de otro organizador (RLS)', async () => {
      // Saltándose la capa de servicios
      const { data, error } = await supabase
        .from('eventos')
        .insert({ ...eventoValido(), organizador_id: idB })
        .select()
      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('Crear sin permiso', () => {
    it('falla al crear un evento sin sesión', async () => {
      await expect(crearEvento(eventoValido())).rejects.toThrow(/iniciar sesión/)
    })

    it('un DJ no puede crear eventos', async () => {
      await login(emailDj, PASSWORD)
      await expect(crearEvento(eventoValido())).rejects.toThrow(/organizadores/)
      await logout()
    })
  })

  describe('Ver (sin sesión)', () => {
    it('cualquiera puede ver un evento sin iniciar sesión', async () => {
      const evento = await obtenerEvento(eventoDeA.id)
      expect(evento).toMatchObject({ id: eventoDeA.id, titulo: 'Noche Techno' })
    })

    it('falla al pedir un evento que no existe', async () => {
      await expect(obtenerEvento('00000000-0000-0000-0000-000000000000')).rejects.toThrow('Evento no encontrado')
    })
  })

  describe('Editar y borrar mis eventos (organizador A)', () => {
    let miEvento

    beforeAll(async () => {
      await login(emailA, PASSWORD)
      miEvento = await crearEvento(eventoValido())
      creados.push(miEvento.id)
    })
    afterAll(() => logout())

    it('un organizador edita su evento', async () => {
      const evento = await modificarEvento(miEvento.id, { titulo: 'Noche House', genero: 'house', estado: 'cerrado' })
      expect(evento).toMatchObject({ titulo: 'Noche House', genero: 'house', estado: 'cerrado' })
      expect((await obtenerEvento(miEvento.id)).titulo).toBe('Noche House')
    })

    it('falla al editar con un estado no válido', async () => {
      await expect(modificarEvento(miEvento.id, { estado: 'cancelado' })).rejects.toThrow(/estado/)
    })

    it('no se puede cambiar el organizador del evento', async () => {
      await expect(modificarEvento(miEvento.id, { organizador_id: idB })).rejects.toThrow(/organizador_id/)
      expect((await obtenerEvento(miEvento.id)).organizador_id).toBe(idA)
    })

    // Tiene que ser el último del bloque porque borra miEvento
    it('un organizador borra su evento', async () => {
      await eliminarEvento(miEvento.id)
      await expect(obtenerEvento(miEvento.id)).rejects.toThrow('Evento no encontrado')
    })
  })

  describe('Eventos de otro organizador (organizador B)', () => {
    beforeAll(() => login(emailB, PASSWORD))
    afterAll(() => logout())

    it('un organizador no puede editar el evento de otro', async () => {
      await expect(modificarEvento(eventoDeA.id, { titulo: 'Hackeado' })).rejects.toThrow(/permiso/)
      expect((await obtenerEvento(eventoDeA.id)).titulo).toBe('Noche Techno')
    })

    it('la base de datos impide editar el evento de otro (RLS)', async () => {
      // Saltándose la capa de servicios: la política RLS no deja actualizar ninguna fila ajena
      const { data } = await supabase.from('eventos').update({ titulo: 'Hackeado' }).eq('id', eventoDeA.id).select()
      expect(data).toEqual([])
      expect((await obtenerEvento(eventoDeA.id)).titulo).toBe('Noche Techno')
    })

    it('un organizador no puede borrar el evento de otro', async () => {
      await expect(eliminarEvento(eventoDeA.id)).rejects.toThrow(/permiso/)
      expect((await obtenerEvento(eventoDeA.id)).id).toBe(eventoDeA.id)
    })

    it('la base de datos impide borrar el evento de otro (RLS)', async () => {
      // Saltándose la capa de servicios: la política RLS no deja borrar ninguna fila ajena
      const { data } = await supabase.from('eventos').delete().eq('id', eventoDeA.id).select()
      expect(data).toEqual([])
      expect((await obtenerEvento(eventoDeA.id)).id).toBe(eventoDeA.id)
    })
  })
})
