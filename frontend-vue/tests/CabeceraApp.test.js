import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

vi.mock('@/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import * as auth from '@/services/auth.js'
import CabeceraApp from '@/components/CabeceraApp.vue'
import { useSesionStore } from '@/stores/sesion.js'
import { montar } from './montar.js'

function conSesion(rol, nombre) {
  return () => {
    const sesion = useSesionStore()
    sesion.usuario = { id: 'u1' }
    sesion.perfil = { id: 'u1', nombre, rol }
  }
}

describe('CabeceraApp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('sin sesión muestra "Iniciar sesión" y ni nombre ni rol', async () => {
    const { wrapper } = await montar(CabeceraApp)

    expect(wrapper.find('[data-test="ir-login"]').text()).toContain('Iniciar sesión')
    expect(wrapper.find('[data-test="nombre"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="rol"]').exists()).toBe(false)
  })

  it('con sesión de organizador muestra el nombre, "Organizador" y "Cerrar sesión"', async () => {
    const { wrapper } = await montar(CabeceraApp, { prepararSesion: conSesion('organizador', 'Organizador Prueba') })

    expect(wrapper.find('[data-test="nombre"]').text()).toBe('Organizador Prueba')
    expect(wrapper.find('[data-test="rol"]').text()).toBe('Organizador')
    expect(wrapper.find('[data-test="logout"]').text()).toContain('Cerrar sesión')
  })

  it('con sesión de DJ muestra el nombre, "DJ" y "Cerrar sesión"', async () => {
    const { wrapper } = await montar(CabeceraApp, { prepararSesion: conSesion('dj', 'DJ Prueba') })

    expect(wrapper.find('[data-test="nombre"]').text()).toBe('DJ Prueba')
    expect(wrapper.find('[data-test="rol"]').text()).toBe('DJ')
    expect(wrapper.find('[data-test="logout"]').exists()).toBe(true)
  })

  it('al pulsar "Cerrar sesión" va a / y deja de mostrar el nombre y el rol', async () => {
    auth.logout.mockResolvedValue()
    const { wrapper, router } = await montar(CabeceraApp, {
      rutaInicial: '/login',
      prepararSesion: conSesion('dj', 'DJ Prueba')
    })

    await wrapper.find('[data-test="logout"]').trigger('click')
    await flushPromises()

    expect(auth.logout).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/')
    expect(wrapper.find('[data-test="nombre"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="rol"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="ir-login"]').exists()).toBe(true)
  })
})
