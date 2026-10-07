import { describe, it, expect, beforeAll, afterEach } from 'vitest'
import { supabase } from '../src/supabaseClient.js'
import { registrar, login, logout, usuarioActual } from '../src/services/auth.js'
import { obtenerPerfil, editarPerfil, listarDJs } from '../src/services/perfiles.js'

const PASSWORD = 'secreta123'
const emailUnico = (prefijo) =>
  `${prefijo}.${Date.now()}.${Math.random().toString(36).slice(2, 8)}@gmail.com`

describe('Registro', () => {
  afterEach(() => logout())

  it('registra un DJ y crea su perfil con el rol indicado', async () => {
    const usuario = await registrar({
      email: emailUnico('dj'), password: PASSWORD, nombre: 'DJ Test', rol: 'dj', ciudad: 'Alicante'
    })
    const perfil = await obtenerPerfil(usuario.id)
    expect(perfil).toMatchObject({ nombre: 'DJ Test', rol: 'dj', ciudad: 'Alicante' })
  })

  it('rechaza un email ya registrado', async () => {
    const email = emailUnico('repetido')
    await registrar({ email, password: PASSWORD, nombre: 'Primero', rol: 'dj' })
    await logout()
    await expect(registrar({ email, password: PASSWORD, nombre: 'Segundo', rol: 'dj' })).rejects.toThrow()
  })

  it('rechaza un rol no válido', async () => {
    await expect(registrar({ email: emailUnico('x'), password: PASSWORD, nombre: 'Usuario Test', rol: 'admin' }))
      .rejects.toThrow(/rol/)
  })

  it('rechaza un email con formato inválido', async () => {
    await expect(registrar({ email: 'no-es-email', password: PASSWORD, nombre: 'Nombre', rol: 'dj' }))
      .rejects.toThrow(/email/)
  })

  it('rechaza una contraseña de menos de 6 caracteres', async () => {
    await expect(registrar({ email: emailUnico('x'), password: '123', nombre: 'Nombre', rol: 'dj' }))
      .rejects.toThrow(/contraseña/)
  })

  it('rechaza un nombre vacío', async () => {
    await expect(registrar({ email: emailUnico('x'), password: PASSWORD, nombre: '  ', rol: 'dj' }))
      .rejects.toThrow(/nombre/)
  })
})

describe('Login y logout', () => {
  const email = emailUnico('login')

  beforeAll(async () => {
    await registrar({ email, password: PASSWORD, nombre: 'Usuario Login', rol: 'organizador' })
    await logout()
  })

  it('inicia sesión con credenciales correctas', async () => {
    const usuario = await login(email, PASSWORD)
    expect(usuario.email).toBe(email)
    expect((await usuarioActual()).id).toBe(usuario.id)
  })

  it('falla con una contraseña incorrecta', async () => {
    await logout()
    await expect(login(email, 'incorrecta')).rejects.toThrow(/incorrectos/)
  })

  it('tras cerrar sesión no hay usuario actual', async () => {
    await login(email, PASSWORD)
    await logout()
    expect(await usuarioActual()).toBeNull()
  })
})

describe('Perfiles', () => {
  const emailOrg = emailUnico('org')
  const emailDj = emailUnico('dj')
  let idOrg, idDj

  beforeAll(async () => {
    idOrg = (await registrar({ email: emailOrg, password: PASSWORD, nombre: 'Sala Test', rol: 'organizador' })).id
    idDj = (await registrar({ email: emailDj, password: PASSWORD, nombre: 'DJ Perfil', rol: 'dj' })).id
    await logout()
  })

  it('cualquiera puede ver un perfil sin iniciar sesión', async () => {
    const perfil = await obtenerPerfil(idDj)
    expect(perfil.nombre).toBe('DJ Perfil')
  })

  it('falla al pedir un perfil que no existe', async () => {
    await expect(obtenerPerfil('00000000-0000-0000-0000-000000000000')).rejects.toThrow(/no encontrado/)
  })

  it('no se puede editar el perfil sin iniciar sesión', async () => {
    await expect(editarPerfil({ bio: 'hola' })).rejects.toThrow(/iniciar sesión/)
  })

  it('un usuario edita su propio perfil', async () => {
    await login(emailDj, PASSWORD)
    const perfil = await editarPerfil({ bio: 'Techno y house', ciudad: 'Valencia' })
    expect(perfil).toMatchObject({ bio: 'Techno y house', ciudad: 'Valencia' })
    await logout()
  })

  it('no se puede cambiar el rol', async () => {
    await login(emailDj, PASSWORD)
    await expect(editarPerfil({ rol: 'organizador' })).rejects.toThrow(/rol/)
    await logout()
  })

  it('la base de datos impide modificar el perfil de otro usuario (RLS)', async () => {
    await login(emailDj, PASSWORD)
    // Saltándose la capa de servicios: la política RLS no deja actualizar ninguna fila ajena
    const { data } = await supabase.from('perfiles').update({ nombre: 'Hackeado' }).eq('id', idOrg).select()
    expect(data).toEqual([])
    await logout()
    expect((await obtenerPerfil(idOrg)).nombre).toBe('Sala Test')
  })

  it('lista DJs paginados y solo con rol dj', async () => {
    const pagina = await listarDJs({ pagina: 1, tamano: 2 })
    expect(pagina.datos.length).toBeLessThanOrEqual(2)
    expect(pagina.total).toBeGreaterThanOrEqual(1)
    expect(pagina.datos.every((p) => p.rol === 'dj')).toBe(true)
  })
})
