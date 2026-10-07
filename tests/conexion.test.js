import 'dotenv/config'
import { describe, it, expect } from 'vitest'

describe('Conexión con Supabase', () => {
  it('el servicio de autenticación responde', async () => {
    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: process.env.SUPABASE_ANON_KEY }
    })
    expect(res.status).toBe(200)
  })
})