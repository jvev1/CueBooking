import { describe, it, expect, vi, beforeEach } from 'vitest'

// Se sustituye el cliente de Supabase para simular sus respuestas sin backend
vi.mock('@backend/supabaseClient.js', () => ({
  supabase: { auth: { signInWithPassword: vi.fn() } }
}))

import { supabase } from '@backend/supabaseClient.js'
import { login } from '@backend/services/auth.js'

describe('login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('con la contraseña mal lanza "Email o contraseña incorrectos"', async () => {
    const error = Object.assign(new Error('Invalid login credentials'), { name: 'AuthApiError', status: 400 })
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error })

    await expect(login('dj@gmail.com', 'mala123')).rejects.toThrow('Email o contraseña incorrectos')
  })

  it('sin conexión con el servidor lanza "No se ha podido conectar con el servidor"', async () => {
    const error = Object.assign(new Error('Failed to fetch'), { name: 'AuthRetryableFetchError', status: 0 })
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: null }, error })

    await expect(login('dj@gmail.com', 'secreta123')).rejects.toThrow('No se ha podido conectar con el servidor')
  })
})
