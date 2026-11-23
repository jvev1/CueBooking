import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// Como en frontend-vue: ningún test usa el Supabase real, los servicios se sustituyen por mocks
vi.mock('@backend/supabaseClient.js', () => ({ supabase: {} }))

// Desmonta lo que se haya pintado en cada test
afterEach(() => cleanup())
