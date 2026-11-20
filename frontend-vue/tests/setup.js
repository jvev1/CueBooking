import { vi } from 'vitest'

// Ningún test del frontend usa el Supabase real: se sustituye el cliente por uno vacío.
// Los tests que necesitan simular respuestas del cliente (auth.test.js) lo vuelven a sustituir,
// y el resto sustituye directamente los servicios.
vi.mock('@backend/supabaseClient.js', () => ({ supabase: {} }))
