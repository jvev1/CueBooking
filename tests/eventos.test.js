import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
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

describe('Eventos', () => {
  const emailA = emailUnico('orga')
  const emailB = emailUnico('orgb')
  const emailDj = emailUnico('dj')
  let idA, idB
  const creados = []

  // Crea un evento del organizador A y deja la sesión cerrada
  async function eventoDeA() {
    await login(emailA, PASSWORD)
    const evento = await crearEvento(eventoValido())
    creados.push(evento.id)
    await logout()
    return evento
  }

  beforeAll(async () => {
    idA = (await registrar({ email: emailA, password: PASSWORD, nombre: 'Organizador A', rol: 'organizador' })).id
    await logout()
    idB = (await registrar({ email: emailB, password: PASSWORD, nombre: 'Organizador B', rol: 'organizador' })).id
    await logout()
    await registrar({ email: emailDj, password: PASSWORD, nombre: 'DJ Eventos', rol: 'dj' })
    await logout()
  })

  afterEach(() => logout())

  afterAll(async () => {
    await login(emailA, PASSWORD)
    if (creados.length > 0) await supabase.from('eventos').delete().in('id', creados)
    await logout()
  })

  it('un organizador crea un evento correcto', async () => {
    await login(emailA, PASSWORD)
    const evento = await crearEvento(eventoValido())
    creados.push(evento.id)
    expect(evento).toMatchObject({ organizador_id: idA, estado: 'abierto', titulo: 'Noche Techno' })
  })

  it('falla al crear un evento sin título', async () => {
    await login(emailA, PASSWORD)
    const { titulo, ...sinTitulo } = eventoValido()
    await expect(crearEvento(sinTitulo)).rejects.toThrow(/título/)
  })

  it('falla al crear un evento con fecha pasada', async () => {
    await login(emailA, PASSWORD)
    await expect(crearEvento(eventoValido({ fecha: fechaPasada() }))).rejects.toThrow(/futura/)
  })

  it('falla al crear un evento sin ciudad', async () => {
    await login(emailA, PASSWORD)
    const { ciudad, ...sinCiudad } = eventoValido()
    await expect(crearEvento(sinCiudad)).rejects.toThrow(/ciudad/)
  })

  it('falla al crear un evento con presupuesto negativo', async () => {
    await login(emailA, PASSWORD)
    await expect(crearEvento(eventoValido({ presupuesto: -100 }))).rejects.toThrow(/negativo/)
  })

  it('falla al crear un evento con un género que no está en la lista', async () => {
    await login(emailA, PASSWORD)
    await expect(crearEvento(eventoValido({ genero: 'jazz' }))).rejects.toThrow(/género/)
  })

  it('falla al crear un evento sin sesión', async () => {
    await expect(crearEvento(eventoValido())).rejects.toThrow(/iniciar sesión/)
  })

  it('un DJ no puede crear eventos', async () => {
    await login(emailDj, PASSWORD)
    await expect(crearEvento(eventoValido())).rejects.toThrow(/organizadores/)
  })

  it('la base de datos impide insertar un evento a nombre de otro organizador (RLS)', async () => {
    await login(emailA, PASSWORD)
    // Saltándose la capa de servicios
    const { data, error } = await supabase
      .from('eventos')
      .insert({ ...eventoValido(), organizador_id: idB })
      .select()
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  it('cualquiera puede ver un evento sin iniciar sesión', async () => {
    const creado = await eventoDeA()
    const evento = await obtenerEvento(creado.id)
    expect(evento).toMatchObject({ id: creado.id, titulo: 'Noche Techno' })
  })

  it('falla al pedir un evento que no existe', async () => {
    await expect(obtenerEvento('00000000-0000-0000-0000-000000000000')).rejects.toThrow('Evento no encontrado')
  })

  it('un organizador edita su evento', async () => {
    const creado = await eventoDeA()
    await login(emailA, PASSWORD)
    const evento = await modificarEvento(creado.id, { titulo: 'Noche House', genero: 'house', estado: 'cerrado' })
    expect(evento).toMatchObject({ titulo: 'Noche House', genero: 'house', estado: 'cerrado' })
    expect((await obtenerEvento(creado.id)).titulo).toBe('Noche House')
  })

  it('falla al editar con un estado no válido', async () => {
    const creado = await eventoDeA()
    await login(emailA, PASSWORD)
    await expect(modificarEvento(creado.id, { estado: 'cancelado' })).rejects.toThrow(/estado/)
  })

  it('no se puede cambiar el organizador del evento', async () => {
    const creado = await eventoDeA()
    await login(emailA, PASSWORD)
    await expect(modificarEvento(creado.id, { organizador_id: idB })).rejects.toThrow(/organizador_id/)
    expect((await obtenerEvento(creado.id)).organizador_id).toBe(idA)
  })

  it('un organizador no puede editar el evento de otro', async () => {
    const creado = await eventoDeA()
    await login(emailB, PASSWORD)
    await expect(modificarEvento(creado.id, { titulo: 'Hackeado' })).rejects.toThrow(/permiso/)
    expect((await obtenerEvento(creado.id)).titulo).toBe('Noche Techno')
  })

  it('la base de datos impide editar el evento de otro (RLS)', async () => {
    const creado = await eventoDeA()
    await login(emailB, PASSWORD)
    // Saltándose la capa de servicios: la política RLS no deja actualizar ninguna fila ajena
    const { data } = await supabase.from('eventos').update({ titulo: 'Hackeado' }).eq('id', creado.id).select()
    expect(data).toEqual([])
    expect((await obtenerEvento(creado.id)).titulo).toBe('Noche Techno')
  })

  it('un organizador borra su evento', async () => {
    const creado = await eventoDeA()
    await login(emailA, PASSWORD)
    await eliminarEvento(creado.id)
    await expect(obtenerEvento(creado.id)).rejects.toThrow('Evento no encontrado')
  })

  it('un organizador no puede borrar el evento de otro', async () => {
    const creado = await eventoDeA()
    await login(emailB, PASSWORD)
    await expect(eliminarEvento(creado.id)).rejects.toThrow(/permiso/)
    expect((await obtenerEvento(creado.id)).id).toBe(creado.id)
  })

  it('la base de datos impide borrar el evento de otro (RLS)', async () => {
    const creado = await eventoDeA()
    await login(emailB, PASSWORD)
    // Saltándose la capa de servicios: la política RLS no deja borrar ninguna fila ajena
    const { data } = await supabase.from('eventos').delete().eq('id', creado.id).select()
    expect(data).toEqual([])
    expect((await obtenerEvento(creado.id)).id).toBe(creado.id)
  })
})
