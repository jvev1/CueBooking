import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

vi.mock('@/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import * as auth from '@/services/auth.js'
import { obtenerPerfil } from '@/services/perfiles.js'
import LoginView from '@/views/LoginView.vue'
import { montar } from './montar.js'

async function rellenar(wrapper, email, password) {
  await wrapper.find('[data-test="email"]').setValue(email)
  await wrapper.find('#password').setValue(password)
}

async function enviar(wrapper) {
  await wrapper.find('form').trigger('submit')
}

describe('LoginView', () => {
  beforeEach(() => vi.clearAllMocks())

  it('al enviar vacío muestra los errores debajo de cada campo y no llama al backend', async () => {
    const { wrapper } = await montar(LoginView, { rutaInicial: '/login' })

    await enviar(wrapper)
    await flushPromises()

    expect(wrapper.find('[data-test="error-email"]').text()).toBe('El email es obligatorio')
    expect(wrapper.find('[data-test="error-password"]').text()).toBe('La contraseña es obligatoria')
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('mientras se envía, el botón está cargando y desactivado', async () => {
    // Una promesa que no se resuelve hasta el final del test simula un servidor lento
    let responder
    auth.login.mockReturnValue(new Promise((resolve) => { responder = resolve }))
    obtenerPerfil.mockResolvedValue({ id: 'u1', nombre: 'DJ Prueba', rol: 'dj' })
    const { wrapper } = await montar(LoginView, { rutaInicial: '/login' })

    await rellenar(wrapper, 'dj@gmail.com', 'prueba123')
    await enviar(wrapper)

    const boton = wrapper.find('[data-test="enviar"]')
    expect(boton.attributes('disabled')).toBeDefined()
    // PrimeVue muestra el icono de carga dentro del botón
    expect(boton.find('[data-pc-section="loadingicon"]').exists()).toBe(true)

    responder({ id: 'u1' })
    await flushPromises()
  })

  it('con la contraseña mal muestra el error, sigue en /login y conserva el email', async () => {
    auth.login.mockRejectedValue(new Error('Email o contraseña incorrectos'))
    const { wrapper, router } = await montar(LoginView, { rutaInicial: '/login' })

    await rellenar(wrapper, 'dj@gmail.com', 'mala123')
    await enviar(wrapper)
    await flushPromises()

    expect(wrapper.find('[data-test="error-servidor"]').text()).toBe('Email o contraseña incorrectos')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(wrapper.find('[data-test="email"]').element.value).toBe('dj@gmail.com')
  })

  it('sin conexión muestra "No se ha podido conectar con el servidor"', async () => {
    auth.login.mockRejectedValue(new Error('No se ha podido conectar con el servidor'))
    const { wrapper } = await montar(LoginView, { rutaInicial: '/login' })

    await rellenar(wrapper, 'dj@gmail.com', 'prueba123')
    await enviar(wrapper)
    await flushPromises()

    expect(wrapper.find('[data-test="error-servidor"]').text()).toBe('No se ha podido conectar con el servidor')
  })

  it('con el login correcto va a /', async () => {
    auth.login.mockResolvedValue({ id: 'u1' })
    obtenerPerfil.mockResolvedValue({ id: 'u1', nombre: 'DJ Prueba', rol: 'dj' })
    const { wrapper, router } = await montar(LoginView, { rutaInicial: '/login' })

    await rellenar(wrapper, 'dj@gmail.com', 'prueba123')
    await enviar(wrapper)
    await flushPromises()

    expect(auth.login).toHaveBeenCalledWith('dj@gmail.com', 'prueba123')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
