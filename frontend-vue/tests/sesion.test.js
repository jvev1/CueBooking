import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@backend/services/auth.js', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  usuarioActual: vi.fn()
}))
vi.mock('@backend/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import * as auth from '@backend/services/auth.js'
import { obtenerPerfil } from '@backend/services/perfiles.js'
import { useSesionStore } from '@/stores/sesion.js'

const USUARIO = { id: 'u1', email: 'org@gmail.com' }
const PERFIL = { id: 'u1', nombre: 'Organizador Prueba', rol: 'organizador' }

describe('Store de sesión', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login correcto guarda el usuario y su perfil', async () => {
    auth.login.mockResolvedValue(USUARIO)
    obtenerPerfil.mockResolvedValue(PERFIL)
    const sesion = useSesionStore()

    await sesion.login('org@gmail.com', 'prueba123')

    expect(sesion.usuario).toEqual(USUARIO)
    expect(sesion.perfil).toEqual(PERFIL)
    expect(sesion.haySesion).toBe(true)
    expect(sesion.rolTexto).toBe('Organizador')
  })

  it('login incorrecto lanza el error y no hay sesión', async () => {
    auth.login.mockRejectedValue(new Error('Email o contraseña incorrectos'))
    const sesion = useSesionStore()

    await expect(sesion.login('org@gmail.com', 'mala123')).rejects.toThrow('Email o contraseña incorrectos')
    expect(sesion.haySesion).toBe(false)
    expect(sesion.perfil).toBeNull()
  })

  it('al recargar con una sesión guardada recupera el usuario y su perfil', async () => {
    auth.usuarioActual.mockResolvedValue(USUARIO)
    obtenerPerfil.mockResolvedValue(PERFIL)
    const sesion = useSesionStore()

    await sesion.cargarSesion()

    expect(sesion.usuario).toEqual(USUARIO)
    expect(sesion.perfil).toEqual(PERFIL)
  })

  it('al recargar sin sesión guardada no hay sesión', async () => {
    auth.usuarioActual.mockResolvedValue(null)
    const sesion = useSesionStore()

    await sesion.cargarSesion()

    expect(sesion.haySesion).toBe(false)
    expect(obtenerPerfil).not.toHaveBeenCalled()
  })

  it('si falla el perfil tras un login correcto, cierra la sesión y relanza el error', async () => {
    auth.login.mockResolvedValue(USUARIO)
    obtenerPerfil.mockRejectedValue(new Error('Perfil no encontrado'))
    const sesion = useSesionStore()

    await expect(sesion.login('org@gmail.com', 'prueba123')).rejects.toThrow('Perfil no encontrado')
    expect(auth.logout).toHaveBeenCalled()
    expect(sesion.haySesion).toBe(false)
    expect(sesion.perfil).toBeNull()
  })

  it('si falla el perfil al recargar, cierra la sesión y relanza el error', async () => {
    auth.usuarioActual.mockResolvedValue(USUARIO)
    obtenerPerfil.mockRejectedValue(new Error('Perfil no encontrado'))
    const sesion = useSesionStore()

    await expect(sesion.cargarSesion()).rejects.toThrow('Perfil no encontrado')
    expect(auth.logout).toHaveBeenCalled()
    expect(sesion.haySesion).toBe(false)
  })

  it('logout no deja usuario ni perfil', async () => {
    const sesion = useSesionStore()
    sesion.usuario = USUARIO
    sesion.perfil = PERFIL

    await sesion.logout()

    expect(auth.logout).toHaveBeenCalled()
    expect(sesion.usuario).toBeNull()
    expect(sesion.perfil).toBeNull()
  })
})
