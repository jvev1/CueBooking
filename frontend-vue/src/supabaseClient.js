import { createClient } from '@supabase/supabase-js'

// En el navegador no hay process.env ni dotenv: Vite expone las variables VITE_* en import.meta.env.
// Supabase guarda la sesión en localStorage, por eso se mantiene al recargar la página.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
