import { createClient } from '@supabase/supabase-js'

// Lo usan el backend (tests y scripts, en Node) y el frontend (en el navegador, con Vite).
// En el navegador no existe process.env: Vite expone las variables VITE_* en import.meta.env.
// En Node, import.meta.env no existe y se usa process.env, que se rellena desde el .env
// (con setupFiles en vitest.config.js o con `node --env-file=.env`).
const url = import.meta.env?.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey)
