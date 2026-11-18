import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

vi.mock('@/services/auth.js', () => ({ login: vi.fn(), logout: vi.fn(), usuarioActual: vi.fn() }))
vi.mock('@/services/perfiles.js', () => ({ obtenerPerfil: vi.fn() }))

import { routes } from '@/router/index.js'
import { useSesionStore } from '@/stores/sesion.js'

function crearRouter() {
  return createRouter({ history: createMemoryHistory(), routes })
}

describe('Router', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('sin sesión, /login muestra el login', async () => {
    const router = crearRouter()
    await router.push('/login')
    expect(router.currentRoute.value.name).toBe('login')
  })

  it('con sesión, /login redirige a /', async () => {
    useSesionStore().usuario = { id: 'u1' }
    const router = crearRouter()
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/')
  })
})
